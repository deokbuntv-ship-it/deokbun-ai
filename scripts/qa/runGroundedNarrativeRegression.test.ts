// GROUNDED CONSULTATION NARRATIVE V2 — 40-case CONSUMED regression (batch brief §18/§19).
//
// IMPORTANT — this is NOT a holdout. All 95 canonical single-turn headline cases were consumed by previous
// development and by the independent review, so they may be used for REGRESSION ONLY. The average produced
// here is a regression number and must never be reported as an independent score.
//
// The independent review's own 40 case IDs are not recorded anywhere in this repository, so the 40 are
// selected DETERMINISTICALLY from the same consumed corpus: the 12 IDs previously reported as hard fails
// plus the 6 established controls (both already used by runAuditRemediationRegression), then an even stride
// over the remaining cases in fixture order until 40 — which spreads across all 7 domains and 10 profiles.
// Same file in ⇒ same 40 out, every run.
//
// Run with:
//   QA_LIVE_RUN=1 npx jest --roots scripts/qa --testMatch "**/runGroundedNarrativeRegression.test.ts" -t "run" --silent
import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

import { buildServerConsultation } from '@/features/chat/server';
import type { ServerConsultationDeps, ConsultationDecisionMeta, ServerConsultationDiagnostics } from '@/features/chat/server';
import type { DigestProvider } from '@/features/interpretation';

import { QA_PROFILES, QA_CASES, type QaCase } from './consultationQaFixtures';
import { buildRealCallLLM } from './openaiCallLLM';
import { completeProductView } from './qaCompleteProduct';
import { judgeQaCase, type QaJudgeVerdict } from './qaJudge';
import { genericPhraseHits } from './qaTextChecks';

jest.setTimeout(60 * 60 * 1000);

const OUT_DIR = path.resolve(__dirname, '..', '..', '.qa-out');
const JSONL_PATH = path.join(OUT_DIR, 'groundedNarrativeRegression.jsonl');
const SUMMARY_PATH = path.join(OUT_DIR, 'groundedNarrativeRegression.summary.json');

// The consumed set now lives in its own module so every runner measures the SAME 40 cases.
import { CASE_TARGET, CONTROL_IDS, PRIOR_HARD_FAIL_IDS, selectRegressionCases } from './regressionCases';

export { selectRegressionCases };

function loadApiKey(): string {
  const p = path.resolve(__dirname, '..', '..', '.env.qa.local');
  if (!fs.existsSync(p)) throw new Error(`Missing ${p} — create it with a line OPENAI_API_KEY=sk-...`);
  const m = fs.readFileSync(p, 'utf8').match(/^OPENAI_API_KEY=(.+)$/m);
  if (!m || !m[1].trim()) throw new Error('.env.qa.local has no OPENAI_API_KEY= line');
  return m[1].trim();
}

const digestProvider: DigestProvider = {
  async sha256Utf8(s: string) { return createHash('sha256').update(s, 'utf8').digest('hex'); },
};

const NOW_EPOCH = Math.floor(Date.UTC(2026, 7, 22, 4, 0, 0) / 1000);

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

function profileFor(id: string) {
  const p = QA_PROFILES.find((x) => x.id === id);
  if (!p) throw new Error(`unknown profile ${id}`);
  return p;
}

type AnswerFields = {
  coreSummary: string | null; disposition: string | null; coreInterpretation: string | null;
  strengths: string[]; cautions: string[]; domainInterpretation: { title: string; body: string }[];
  futureFlow: string | null; verifiedEvidenceCount: number;
};

type CaseRecord = {
  caseId: string; isControl: boolean; domain: string; question: string;
  ok: boolean; failureNote: string | null;
  outputClassification: string | null; rejectionReason: string | null; groundedFallback: boolean;
  // V3 §2 — WHY the deterministic composition was delivered, as bounded categories. The consumed run could
  // not be attributed at all because nothing recorded it; this is the same fallback decision, now labelled.
  groundedViolations: string[];
  systemsApplicable: string[];
  crossJudgeSummary: string;
  answer: AnswerFields;
  composedText: string;
  llmMeta: { model: string; reasoningEffort: string; maxOutputTokens: number; failureCode: string | null; latencyMs: number };
  judge: QaJudgeVerdict | null;
  genericPhraseHits: { phrase: string; count: number }[];
  // Deterministic, judge-independent safety checks over the delivered text (§19).
  ageRangesInAnswer: string[];
};

function extractAnswer(structuredResult: unknown, fallbackText: string): AnswerFields {
  const sr = structuredResult as {
    coreSummary?: string; disposition?: string; coreInterpretation?: string;
    strengths?: string[]; cautions?: string[]; domainInterpretation?: { title: string; body: string }[]; futureFlow?: string;
    verifiedEvidence?: unknown[];
  } | undefined;
  if (!sr) {
    return { coreSummary: fallbackText || null, disposition: null, coreInterpretation: null, strengths: [], cautions: [], domainInterpretation: [], futureFlow: null, verifiedEvidenceCount: 0 };
  }
  return {
    coreSummary: sr.coreSummary ?? null, disposition: sr.disposition ?? null, coreInterpretation: sr.coreInterpretation ?? null,
    strengths: sr.strengths ?? [], cautions: sr.cautions ?? [], domainInterpretation: sr.domainInterpretation ?? [], futureFlow: sr.futureFlow ?? null,
    verifiedEvidenceCount: Array.isArray(sr.verifiedEvidence) ? sr.verifiedEvidence.length : 0,
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
  const groundedFacts = v.evidenceReferences.flatMap((e) => e.lines.slice(0, 2).map((l) => `[${e.discipline}] ${l}`));
  return { summary: lines || v.primaryConclusion, systems, groundedFacts };
}

const ageRangesIn = (text: string): string[] =>
  [...text.matchAll(/(\d{1,3})\s*[~\-–—]\s*(\d{1,3})\s*(?:세|살)/g)].map((m) => `${m[1]}~${m[2]}세`);

async function runSingleCase(apiKey: string, c: QaCase): Promise<CaseRecord> {
  const { callLLM, meta } = buildRealCallLLM(apiKey, c.question);
  const deps: ServerConsultationDeps = { digestProvider, nowEpochSeconds: NOW_EPOCH, callLLM, modelId: null };
  const profile = profileFor(c.profileId);
  let composedText = '';
  let ok = false;
  let failureNote: string | null = null;
  let answer: AnswerFields = { coreSummary: null, disposition: null, coreInterpretation: null, strengths: [], cautions: [], domainInterpretation: [], futureFlow: null, verifiedEvidenceCount: 0 };
  let crossInfo = { summary: '없음', systems: [] as string[], groundedFacts: [] as string[] };
  let product = completeProductView(undefined, '');
  let diagnostics: ServerConsultationDiagnostics | undefined;
  try {
    const r = await buildServerConsultation({ birthInput: profile.birth, question: c.question }, deps);
    if (r.ok) {
      ok = true;
      composedText = r.text;
      answer = extractAnswer(r.structuredResult, r.text);
      crossInfo = crossJudgeSummaryOf(r.structuredResult?.decisionMeta);
      product = completeProductView(r.structuredResult as never, r.text);
      diagnostics = r.diagnostics;
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
    caseId: c.caseId, isControl: CONTROL_IDS.includes(c.caseId), domain: c.domain, question: c.question, ok, failureNote,
    outputClassification: diagnostics?.outputClassification ?? null,
    rejectionReason: diagnostics?.rejectionReason ?? null,
    groundedFallback: diagnostics?.groundedFallback === true,
    groundedViolations: diagnostics?.groundedViolations ?? [],
    systemsApplicable: crossInfo.systems, crossJudgeSummary: crossInfo.summary, answer, composedText,
    llmMeta: { model: m.model, reasoningEffort: m.reasoningEffort, maxOutputTokens: m.maxOutputTokens, failureCode: m.failureCode, latencyMs: m.latencyMs },
    judge, genericPhraseHits: genericPhraseHits(composedText),
    ageRangesInAnswer: ageRangesIn(composedText),
  };
}

describe('GROUNDED CONSULTATION NARRATIVE V2 — 40-case consumed regression', () => {
  it('selects a deterministic, domain-spread 40', () => {
    const cases = selectRegressionCases();
    expect(cases).toHaveLength(CASE_TARGET);
    expect(new Set(cases.map((c) => c.caseId)).size).toBe(CASE_TARGET);
    for (const id of [...PRIOR_HARD_FAIL_IDS, ...CONTROL_IDS]) {
      expect(cases.some((c) => c.caseId === id)).toBe(true);
    }
    expect(new Set(cases.map((c) => c.domain)).size).toBe(7);
    // Determinism — the same selection every call.
    expect(selectRegressionCases().map((c) => c.caseId)).toEqual(cases.map((c) => c.caseId));
  });

  it('run', async () => {
    if (process.env.QA_LIVE_RUN !== '1') {
      console.log('[grn] skipped (set QA_LIVE_RUN=1 to make real paid OpenAI calls)');
      return;
    }
    const apiKey = loadApiKey();
    const cases = selectRegressionCases();
    fs.mkdirSync(OUT_DIR, { recursive: true });
    const jsonlStream = fs.createWriteStream(JSONL_PATH, { flags: 'w' });

    console.log(`[grn] starting: ${cases.length} cases`);
    const records = await mapLimit(cases, 6, async (c) => {
      const rec = await runSingleCase(apiKey, c);
      jsonlStream.write(`${JSON.stringify(rec)}\n`);
      console.log(`[grn] ${rec.caseId} ok=${rec.ok} class=${rec.outputClassification} fallback=${rec.groundedFallback} score=${rec.judge?.totalScore ?? 'n/a'}`);
      return rec;
    });
    jsonlStream.end();

    const scored = records.filter((r): r is CaseRecord & { judge: QaJudgeVerdict } => r.judge !== null);
    const scores = scored.map((r) => r.judge.totalScore);
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const reasonHits = (re: RegExp) => scored.filter((r) => r.judge.hardFailReasons.some((x) => re.test(x)));

    const summary = {
      caseCount: records.length,
      caseIds: records.map((r) => r.caseId),
      hardFailCount: scored.filter((r) => r.judge.hardFail).length,
      hardFailCaseIds: scored.filter((r) => r.judge.hardFail).map((r) => ({ caseId: r.caseId, reasons: r.judge.hardFailReasons })),
      semanticRejectedCount: records.filter((r) => r.outputClassification === 'SEMANTIC_REJECTED').length,
      semanticRejectedCaseIds: records.filter((r) => r.outputClassification === 'SEMANTIC_REJECTED').map((r) => r.caseId),
      groundedFallbackCount: records.filter((r) => r.groundedFallback).length,
      groundedFallbackCaseIds: records.filter((r) => r.groundedFallback).map((r) => r.caseId),
      // V3 §2 — fallback attribution by bounded category.
      fallbackReasonCounts: records.flatMap((r) => r.groundedViolations)
        .reduce<Record<string, number>>((acc, k) => ({ ...acc, [k]: (acc[k] ?? 0) + 1 }), {}),
      // V3 §12 — the deterministic answer is judged as a PRODUCT on its own, not written off as a rare miss.
      fallbackScoredCount: scored.filter((r) => r.groundedFallback).length,
      fallbackPaidUserValueRate: (() => {
        const f = scored.filter((r) => r.groundedFallback);
        return f.length ? Math.round((f.filter((r) => r.judge.paidUserValue === 'YES').length / f.length) * 10000) / 100 : null;
      })(),
      fallbackSpecificEvidenceRate: (() => {
        const f = scored.filter((r) => r.groundedFallback);
        return f.length ? Math.round((f.filter((r) => !r.judge.personalizationFail).length / f.length) * 10000) / 100 : null;
      })(),
      fallbackAverageScore: (() => {
        const f = scored.filter((r) => r.groundedFallback);
        return f.length ? Math.round((f.reduce((a, r) => a + r.judge.totalScore, 0) / f.length) * 100) / 100 : null;
      })(),
      fabricatedFactCount: reasonHits(/조작|없는 사실|허위|지어|invent|fabricat/i).length,
      fabricatedTechnicalRelationCount: reasonHits(/궁|성계|화기|화록|간지|관계.*잘못|잘못.*관계/i).length,
      wrongPersonFactCount: reasonHits(/다른 사람|잘못된 인물|wrong.?person/i).length,
      wrongDisciplineAttributionCount: reasonHits(/학문.*(잘못|혼동)|자미.*명리.*혼동|기문.*(썼|사용).*않/i).length,
      verdictFidelityFailureCount: reasonHits(/모순|verdict|뒤집/i).length,
      unresolvedToDecisiveCount: reasonHits(/확정.*보류|보류.*확정|unresolved.*decisive/i).length,
      temporalCorruptionCount: reasonHits(/시간축|시점.*혼동|temporal/i).length,
      // Deterministic, judge-independent: an age range in the delivered text is only legitimate when the
      // grounded material supplied it, and the gate is what enforces that — so any survivor is reported.
      answersWithAgeRange: records.filter((r) => r.ageRangesInAnswer.length > 0).map((r) => ({ caseId: r.caseId, ranges: r.ageRangesInAnswer })),
      specificEvidenceRate: scored.length ? Math.round((scored.filter((r) => !r.judge.personalizationFail).length / scored.length) * 10000) / 100 : 0,
      paidUserValueRate: scored.length ? Math.round((scored.filter((r) => r.judge.paidUserValue === 'YES').length / scored.length) * 10000) / 100 : 0,
      regressionAverageScore: Math.round(avg * 100) / 100,
      controlsAverageScore: (() => {
        const c = scored.filter((r) => r.isControl);
        return c.length ? Math.round((c.reduce((a, r) => a + r.judge.totalScore, 0) / c.length) * 100) / 100 : null;
      })(),
      avgVerifiedEvidenceCount: scored.length ? Math.round((scored.reduce((a, r) => a + r.answer.verifiedEvidenceCount, 0) / scored.length) * 100) / 100 : 0,
      futureFlowPresentCount: records.filter((r) => !!r.answer.futureFlow).length,
      jsonlPath: JSONL_PATH,
      note: 'CONSUMED REGRESSION DATA — regressionAverageScore is NOT an independent score.',
    };
    fs.writeFileSync(SUMMARY_PATH, JSON.stringify(summary, null, 2), 'utf8');
    console.log(`[grn] DONE. summary written to ${SUMMARY_PATH}`);
    console.log(JSON.stringify(summary, null, 2));

    expect(records.length).toBe(CASE_TARGET);
  });
});
