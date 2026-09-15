// FINAL DIVINATION CONSULTATION QA V1 — the live-pipeline QA runner. Lives OUTSIDE src/ (jest.config.js
// `roots: ['<rootDir>/src']`) so a bare `npx jest` / `npm run preflight` / `npm run release-preflight`
// NEVER discovers or executes this file — it makes real, paid OpenAI calls and must only run when
// explicitly invoked with an overridden `--roots scripts/qa`. Defense in depth: it also throws immediately
// unless QA_LIVE_RUN=1 is set, so even a direct `--roots` misfire against this path does nothing by default.
//
// Run with:
//   QA_LIVE_RUN=1 npx jest --roots scripts/qa --testMatch "**/*.test.ts" -t "run" --silent
import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

import { buildServerConsultation } from '@/features/chat/server';
import type { ServerConsultationDeps, ConsultationDecisionMeta } from '@/features/chat/server';
import type { DigestProvider } from '@/features/interpretation';
import type { LLMMessage } from '@/features/chat/types/chatArchitecture';

import { QA_PROFILES, QA_CASES, QA_CHAINS, QA_DISTRIBUTION, type QaProfile, type QaCase, type QaChain } from './consultationQaFixtures';
import { buildRealCallLLM } from './openaiCallLLM';
import { completeProductView } from './qaCompleteProduct';
import { judgeQaCase, type QaJudgeVerdict } from './qaJudge';
import { genericPhraseHits, findDuplicates } from './qaTextChecks';

jest.setTimeout(40 * 60 * 1000);

const OUT_DIR = 'C:\\Users\\USER\\AppData\\Local\\Temp\\claude\\C--Development\\6952b170-98a2-42a9-a6de-340a7a91102d\\scratchpad\\qa';
const JSONL_PATH = path.join(OUT_DIR, 'consultationQaV1.jsonl');
const SUMMARY_PATH = path.join(OUT_DIR, 'consultationQaV1.summary.json');

function loadApiKey(): string {
  const p = path.resolve(__dirname, '..', '..', '.env.qa.local');
  if (!fs.existsSync(p)) throw new Error(`Missing ${p} — create it with a line OPENAI_API_KEY=sk-...`);
  const content = fs.readFileSync(p, 'utf8');
  const m = content.match(/^OPENAI_API_KEY=(.+)$/m);
  if (!m || !m[1].trim()) throw new Error('.env.qa.local has no OPENAI_API_KEY= line');
  return m[1].trim();
}

const digestProvider: DigestProvider = {
  async sha256Utf8(s: string) { return createHash('sha256').update(s, 'utf8').digest('hex'); },
};

// A handful of distinct "now" instants across the current window (Aug 2026) so Qimen boards + 세운/월운
// reference actually vary across cases, per §4's "different current timing contexts".
const NOW_INSTANTS = [
  Date.UTC(2026, 7, 3, 1, 0, 0), Date.UTC(2026, 7, 9, 5, 0, 0), Date.UTC(2026, 7, 14, 9, 0, 0),
  Date.UTC(2026, 7, 19, 13, 0, 0), Date.UTC(2026, 7, 24, 21, 0, 0), Date.UTC(2026, 7, 29, 3, 0, 0),
].map((ms) => Math.floor(ms / 1000));

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let cursor = 0;
  async function worker() {
    for (;;) {
      const i = cursor;
      cursor += 1;
      if (i >= items.length) return;
      out[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

function profileFor(id: string): QaProfile {
  const p = QA_PROFILES.find((x) => x.id === id);
  if (!p) throw new Error(`unknown profile ${id}`);
  return p;
}

type AnswerFields = {
  coreSummary: string | null; disposition: string | null; coreInterpretation: string | null;
  strengths: string[]; cautions: string[]; domainInterpretation: { title: string; body: string }[];
  futureFlow: string | null;
};

type CaseRecord = {
  caseId: string; profileId: string; domain: string; question: string;
  ok: boolean; failureNote: string | null;
  systemsApplicable: string[];
  crossJudgeSummary: string;
  answer: AnswerFields;
  composedText: string;
  llmMeta: { model: string; reasoningEffort: string; maxOutputTokens: number; failureCode: string | null; latencyMs: number };
  judge: QaJudgeVerdict | null;
  genericPhraseHits: { phrase: string; count: number }[];
  chainTurnIndex?: number;
  followUpIntent?: string | null;
};

function extractAnswer(structuredResult: unknown, fallbackText: string): AnswerFields {
  const sr = structuredResult as {
    coreSummary?: string; disposition?: string; coreInterpretation?: string;
    strengths?: string[]; cautions?: string[]; domainInterpretation?: { title: string; body: string }[]; futureFlow?: string;
  } | undefined;
  if (!sr) {
    return { coreSummary: fallbackText || null, disposition: null, coreInterpretation: null, strengths: [], cautions: [], domainInterpretation: [], futureFlow: null };
  }
  return {
    coreSummary: sr.coreSummary ?? null, disposition: sr.disposition ?? null, coreInterpretation: sr.coreInterpretation ?? null,
    strengths: sr.strengths ?? [], cautions: sr.cautions ?? [], domainInterpretation: sr.domainInterpretation ?? [], futureFlow: sr.futureFlow ?? null,
  };
}

function crossJudgeSummaryOf(decisionMeta: ConsultationDecisionMeta | undefined | null): { summary: string; systems: string[]; groundedFacts: string[] } {
  const v = decisionMeta?.divinationVerdict;
  if (!v) return { summary: '없음 (Cross Judge 미산출)', systems: [], groundedFacts: [] };
  const systems = v.disciplineJudgments.filter((j) => j.applicable).map((j) => j.discipline);
  const lines = [
    `주 결론: ${v.primaryConclusion}`,
    v.agreementPoints[0] ? `일치: ${v.agreementPoints[0]}` : null,
    v.contradictionPoints[0] ? `모순: ${v.contradictionPoints[0]}` : null,
  ].filter(Boolean).join(' / ');
  // The REAL engine-computed facts available to this answer (a couple of lines per discipline, incl. the
  // CROSS entry) — feeding this to the judge is what lets it actually check personalization against the
  // real chart instead of penalizing the answer for not restating detail the judge itself never saw.
  const groundedFacts = v.evidenceReferences.flatMap((e) => e.lines.slice(0, 2).map((l) => `[${e.discipline}] ${l}`));
  return { summary: lines || v.primaryConclusion, systems, groundedFacts };
}

async function runSingleCase(apiKey: string, c: QaCase, nowEpochSeconds: number): Promise<CaseRecord> {
  const { callLLM, meta } = buildRealCallLLM(apiKey, c.question);
  const deps: ServerConsultationDeps = { digestProvider, nowEpochSeconds, callLLM, modelId: null };
  const profile = profileFor(c.profileId);
  let composedText = '';
  let ok = false;
  let failureNote: string | null = null;
  let answer: AnswerFields = { coreSummary: null, disposition: null, coreInterpretation: null, strengths: [], cautions: [], domainInterpretation: [], futureFlow: null };
  let crossInfo = { summary: '없음', systems: [] as string[], groundedFacts: [] as string[] };
  let product = completeProductView(undefined, '');
  try {
    const r = await buildServerConsultation({ birthInput: profile.birth, question: c.question }, deps);
    if (r.ok) {
      ok = true;
      composedText = r.text;
      answer = extractAnswer(r.structuredResult, r.text);
      crossInfo = crossJudgeSummaryOf(r.structuredResult?.decisionMeta);
      product = completeProductView(r.structuredResult as never, r.text);
    } else {
      failureNote = `NOT_OK:${r.reason}`;
    }
  } catch (e) {
    failureNote = `THREW:${(e as Error).message}`;
  }
  const m = meta();
  const judge = ok
    ? await judgeQaCase(apiKey, {
        domain: c.domain, question: c.question, profileLabel: profile.label,
        // V5 COMPLETE-PRODUCT CONTRACT — the judge scores the delivered answer; internal facts stay reference-only.
        materialContributors: product.materialContributors, notCoveredSystems: product.notCoveredSystems,
        crossJudgeSummary: product.crossJudgeSummary,
        authoritativeReference: product.authoritativeReference,
        userVisibleAnswer: product.userVisibleAnswer,
      })
    : null;
  return {
    caseId: c.caseId, profileId: c.profileId, domain: c.domain, question: c.question, ok, failureNote,
    systemsApplicable: crossInfo.systems, crossJudgeSummary: crossInfo.summary, answer, composedText,
    llmMeta: { model: m.model, reasoningEffort: m.reasoningEffort, maxOutputTokens: m.maxOutputTokens, failureCode: m.failureCode, latencyMs: m.latencyMs },
    judge, genericPhraseHits: genericPhraseHits(composedText),
  };
}

type ChainResult = { chainId: string; domain: string; profileId: string; turnRecords: CaseRecord[]; continuityOk: boolean; continuityNotes: string[] };

// Follow-up intents the server explicitly recognizes and answers via the STORED prior decision
// (buildServerConsultation's own classifyFollowUpIntent). A turn that classifies as none of these is a
// legitimate NEW_QUESTION as far as the server's structured follow-up mechanism is concerned — it relies on
// `conversationContext` (the raw recent turns, exactly like a real client sends) for topical continuity
// instead, not on `loadPreviousDecision`. Requiring the latter on EVERY turn 2+ was a harness bug: it
// flagged "continuity broken" on turns the server was never designed to load structured context for.
const RECOGNIZED_FOLLOW_UP_INTENTS = new Set(['WHY', 'NEXT_YEAR', 'BETWEEN_CANDIDATES', 'WHEN']);

async function runChain(apiKey: string, chain: QaChain, nowEpochSeconds: number): Promise<ChainResult> {
  const profile = profileFor(chain.profileId);
  let prevMeta: ConsultationDecisionMeta | null = null;
  const turnRecords: CaseRecord[] = [];
  const continuityNotes: string[] = [];
  let continuityOk = true;
  // A real client sends the recent raw turn history on every call (`conversationContext`) — the harness
  // must do the same or every "null"-classified follow-up is answered with LESS context than production
  // actually gives it, which is not a meaningful continuity measurement.
  const conversationContext: { role: 'user' | 'assistant'; content: string }[] = [];
  for (let i = 0; i < chain.turns.length; i += 1) {
    const question = chain.turns[i];
    const { callLLM, meta } = buildRealCallLLM(apiKey, question);
    const sent: LLMMessage[][] = [];
    const wrappedCallLLM = async (messages: LLMMessage[]): Promise<string> => { sent.push(messages); return callLLM(messages); };
    let loadCalls = 0;
    const loadPreviousDecision = i === 0
      ? undefined
      : async () => { loadCalls += 1; return prevMeta ? { status: 'VALID' as const, meta: prevMeta } : { status: 'NONE' as const }; };
    const deps: ServerConsultationDeps = {
      digestProvider, nowEpochSeconds, callLLM: wrappedCallLLM, modelId: null,
      ...(loadPreviousDecision ? { loadPreviousDecision } : {}),
    };
    let ok = false; let failureNote: string | null = null; let composedText = '';
    let answer: AnswerFields = { coreSummary: null, disposition: null, coreInterpretation: null, strengths: [], cautions: [], domainInterpretation: [], futureFlow: null };
    let crossInfo = { summary: '없음', systems: [] as string[], groundedFacts: [] as string[] };
    let product = completeProductView(undefined, '');
    let followUpIntent: string | null = null;
    try {
      const r = await buildServerConsultation(
        { birthInput: profile.birth, question, ...(conversationContext.length ? { conversationContext: [...conversationContext] } : {}) },
        deps,
      );
      if (r.ok) {
        ok = true; composedText = r.text;
        answer = extractAnswer(r.structuredResult, r.text);
        crossInfo = crossJudgeSummaryOf(r.structuredResult?.decisionMeta);
        product = completeProductView(r.structuredResult as never, r.text);
        followUpIntent = r.diagnostics?.followUp ?? null;
        if (i > 0 && followUpIntent && RECOGNIZED_FOLLOW_UP_INTENTS.has(followUpIntent) && loadCalls === 0) {
          continuityOk = false;
          continuityNotes.push(`turn${i + 1}: classified as ${followUpIntent} but loadPreviousDecision never called`);
        }
        if (r.structuredResult?.decisionMeta) prevMeta = r.structuredResult.decisionMeta;
        conversationContext.push({ role: 'user', content: question }, { role: 'assistant', content: r.text });
      } else {
        failureNote = `NOT_OK:${r.reason}`;
        if (i > 0) { continuityOk = false; continuityNotes.push(`turn${i + 1}: not ok (${r.reason})`); }
      }
    } catch (e) {
      failureNote = `THREW:${(e as Error).message}`;
      if (i > 0) { continuityOk = false; continuityNotes.push(`turn${i + 1}: threw ${(e as Error).message}`); }
    }
    const m = meta();
    const isFinal = i === chain.turns.length - 1;
    const judge = ok && isFinal
      ? await judgeQaCase(apiKey, {
          domain: chain.domain, question, profileLabel: profile.label,
          systemsApplicable: crossInfo.systems, crossJudgeSummary: crossInfo.summary, groundedFacts: crossInfo.groundedFacts, answer,
        })
      : null;
    turnRecords.push({
      caseId: `${chain.chainId}-T${i + 1}`, profileId: chain.profileId, domain: 'FOLLOWUP', question, ok, failureNote,
      systemsApplicable: crossInfo.systems, crossJudgeSummary: crossInfo.summary, answer, composedText,
      llmMeta: { model: m.model, reasoningEffort: m.reasoningEffort, maxOutputTokens: m.maxOutputTokens, failureCode: m.failureCode, latencyMs: m.latencyMs },
      judge, genericPhraseHits: genericPhraseHits(composedText), chainTurnIndex: i + 1, followUpIntent,
    });
  }
  return { chainId: chain.chainId, domain: chain.domain, profileId: chain.profileId, turnRecords, continuityOk, continuityNotes };
}

describe('FINAL DIVINATION CONSULTATION QA V1 — live run', () => {
  it('run', async () => {
    if (process.env.QA_LIVE_RUN !== '1') throw new Error('Refusing to run: set QA_LIVE_RUN=1 explicitly (this makes real paid OpenAI calls).');
    const apiKey = loadApiKey();
    fs.mkdirSync(OUT_DIR, { recursive: true });
    const jsonlStream = fs.createWriteStream(JSONL_PATH, { flags: 'w' });
    const allRecords: CaseRecord[] = [];

    console.log(`[qa] starting: ${QA_CASES.length} single-turn cases + ${QA_CHAINS.length} chains`);

    const singleResults = await mapLimit(QA_CASES, 6, async (c, i) => {
      const rec = await runSingleCase(apiKey, c, NOW_INSTANTS[i % NOW_INSTANTS.length]);
      jsonlStream.write(`${JSON.stringify(rec)}\n`);
      console.log(`[qa] ${rec.caseId} ok=${rec.ok} score=${rec.judge?.totalScore ?? 'n/a'}`);
      return rec;
    });
    allRecords.push(...singleResults);

    const chainResults = await mapLimit(QA_CHAINS, 5, async (chain, i) => {
      const cr = await runChain(apiKey, chain, NOW_INSTANTS[(i + 2) % NOW_INSTANTS.length]);
      for (const t of cr.turnRecords) jsonlStream.write(`${JSON.stringify(t)}\n`);
      console.log(`[qa] chain ${chain.chainId} continuityOk=${cr.continuityOk} finalScore=${cr.turnRecords[cr.turnRecords.length - 1]?.judge?.totalScore ?? 'n/a'}`);
      return cr;
    });
    for (const cr of chainResults) allRecords.push(...cr.turnRecords);
    jsonlStream.end();

    // Headline "100 cases" = 95 single-turn + 1 representative (final-turn) record per chain.
    const headline = [...singleResults, ...chainResults.map((cr) => cr.turnRecords[cr.turnRecords.length - 1])];
    const scored = headline.filter((r): r is CaseRecord & { judge: QaJudgeVerdict } => r.judge !== null);
    const scores = scored.map((r) => r.judge.totalScore).sort((a, b) => a - b);
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const p10 = scores.length ? scores[Math.floor(scores.length * 0.1)] : 0;
    const hardFails = scored.filter((r) => r.judge.hardFail);
    const personalizationFails = scored.filter((r) => r.judge.personalizationFail);
    const crossApplicable = scored.filter((r) => r.systemsApplicable.length >= 2);
    const crossPass = crossApplicable.filter((r) => r.judge.crossSynthesisPresent);
    const dupes = findDuplicates(headline.filter((r) => r.ok).map((r) => ({ caseId: r.caseId, domain: r.domain, text: r.composedText })));

    const summary = {
      totalCases: headline.length,
      distribution: QA_DISTRIBUTION,
      okCount: headline.filter((r) => r.ok).length,
      scoredCount: scored.length,
      averageScore: Math.round(avg * 100) / 100,
      p10Score: p10,
      hardFailCount: hardFails.length,
      hardFailCaseIds: hardFails.map((r) => r.caseId),
      personalizationFailRate: scored.length ? Math.round((personalizationFails.length / scored.length) * 10000) / 100 : 0,
      crossSynthesisApplicableCount: crossApplicable.length,
      crossSynthesisPassRate: crossApplicable.length ? Math.round((crossPass.length / crossApplicable.length) * 10000) / 100 : 0,
      followUpContinuity: chainResults.map((cr) => ({ chainId: cr.chainId, continuityOk: cr.continuityOk, notes: cr.continuityNotes })),
      followUpContinuityPassRate: chainResults.length ? Math.round((chainResults.filter((cr) => cr.continuityOk).length / chainResults.length) * 10000) / 100 : 0,
      duplicatePairs: dupes,
      genericTemplateFailureRate: scored.length
        ? Math.round((scored.filter((r) => r.genericPhraseHits.reduce((a, h) => a + h.count, 0) >= 3).length / scored.length) * 10000) / 100
        : 0,
      byDomain: Object.fromEntries(
        (['BUSINESS', 'MONEY', 'CAREER', 'LOVE', 'REUNION', 'CHANGE', 'TIMING', 'FOLLOWUP'] as const).map((d) => {
          const inDomain = scored.filter((r) => r.domain === d);
          const avgD = inDomain.length ? inDomain.reduce((a, r) => a + r.judge.totalScore, 0) / inDomain.length : null;
          return [d, { count: inDomain.length, averageScore: avgD === null ? null : Math.round(avgD * 100) / 100 }];
        }),
      ),
      top5: [...scored].sort((a, b) => b.judge.totalScore - a.judge.totalScore).slice(0, 5).map((r) => ({ caseId: r.caseId, score: r.judge.totalScore })),
      bottom5: [...scored].sort((a, b) => a.judge.totalScore - b.judge.totalScore).slice(0, 5).map((r) => ({ caseId: r.caseId, score: r.judge.totalScore })),
      jsonlPath: JSONL_PATH,
    };
    fs.writeFileSync(SUMMARY_PATH, JSON.stringify(summary, null, 2), 'utf8');
    console.log(`[qa] DONE. summary written to ${SUMMARY_PATH}`);
    console.log(JSON.stringify(summary, null, 2));

    expect(headline.length).toBe(100);
  });
});
