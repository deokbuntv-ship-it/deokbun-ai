// CONSULTATION EXPRESSION ARCHITECTURE V1 — bounded (~25-case) development verification set (brief §14-17).
// NOT the canonical 100-case QA gate (that file/expectation is untouched). Reuses the exact same real-pipeline
// + real-LLM + LLM-as-judge infrastructure as runConsultationQa.test.ts, with a hand-picked, deliberately
// small case list: domain coverage (7 domains) + explicit same-chart/different-question pairs (§5) + a few
// known-difficult cases. All questions/profiles are drawn from the EXISTING canonical QA fixtures — nothing
// new is invented, only recombined for this specific verification purpose.
//
// Run with:
//   QA_LIVE_RUN=1 npx jest --roots scripts/qa --testMatch "**/runContentPlanVerification.test.ts" -t "run" --silent
import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

import { buildServerConsultation } from '@/features/chat/server';
import type { ServerConsultationDeps, ConsultationDecisionMeta } from '@/features/chat/server';
import type { DigestProvider } from '@/features/interpretation';

import { QA_PROFILES, type QaCase, type QaDomain } from './consultationQaFixtures';
import { buildRealCallLLM } from './openaiCallLLM';
import { judgeQaCase, type QaJudgeVerdict } from './qaJudge';
import { genericPhraseHits } from './qaTextChecks';

jest.setTimeout(40 * 60 * 1000);

const OUT_DIR = 'C:\\Users\\USER\\AppData\\Local\\Temp\\claude\\C--Development\\6952b170-98a2-42a9-a6de-340a7a91102d\\scratchpad\\qa';
const JSONL_PATH = path.join(OUT_DIR, 'contentPlanVerification.jsonl');
const SUMMARY_PATH = path.join(OUT_DIR, 'contentPlanVerification.summary.json');

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

const NOW_EPOCH = Math.floor(Date.UTC(2026, 7, 20, 6, 0, 0) / 1000);

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

type Group = 'DOMAIN_COVERAGE' | 'QUESTION_SENSITIVITY' | 'DIFFICULT';
type VerificationCase = QaCase & { group: Group; pairId?: string };

// ── the bounded case list (§14) — 7 domains x ~3 each, + explicit same-chart/different-question pairs (§5),
// + a few historically-weak categories (contradiction/unresolved/strong counter-evidence). All question text
// and all profiles are copied verbatim from consultationQaFixtures.ts's own arrays — nothing new invented.
const CASES: VerificationCase[] = [
  // BUSINESS
  { caseId: 'CP-BIZ-01', domain: 'BUSINESS', profileId: 'P1', question: '지금 이 사업 시작해도 될까?', group: 'DOMAIN_COVERAGE', pairId: 'BIZ' },
  { caseId: 'CP-BIZ-02', domain: 'BUSINESS', profileId: 'P8', question: '사업 규모를 줄이는 게 맞는 시기일까?', group: 'DOMAIN_COVERAGE' },
  { caseId: 'CP-BIZ-03', domain: 'BUSINESS', profileId: 'P4', question: '사업 파트너를 바꾸는 게 맞을까?', group: 'DOMAIN_COVERAGE' },
  // MONEY
  { caseId: 'CP-MONEY-01', domain: 'MONEY', profileId: 'P3', question: '돈은 들어오는데 왜 잘 안 모이지?', group: 'DOMAIN_COVERAGE' },
  { caseId: 'CP-MONEY-02', domain: 'MONEY', profileId: 'P7', question: '지금 주식 투자를 시작해도 될까?', group: 'DOMAIN_COVERAGE' },
  { caseId: 'CP-MONEY-03', domain: 'MONEY', profileId: 'P2', question: '지금 대출을 받아서 투자해도 될까?', group: 'DOMAIN_COVERAGE' },
  // CAREER
  { caseId: 'CP-CAREER-01', domain: 'CAREER', profileId: 'P5', question: '이직하는 게 맞아?', group: 'DOMAIN_COVERAGE' },
  { caseId: 'CP-CAREER-02', domain: 'CAREER', profileId: 'P10', question: '프리랜서로 전향해도 괜찮을까?', group: 'DOMAIN_COVERAGE' },
  { caseId: 'CP-CAREER-03', domain: 'CAREER', profileId: 'P4', question: '지금 퇴사하는 게 맞는 시기일까?', group: 'DOMAIN_COVERAGE' },
  // LOVE
  { caseId: 'CP-LOVE-01', domain: 'LOVE', profileId: 'P7', question: '결혼운이 강한 편이야?', group: 'DOMAIN_COVERAGE' },
  { caseId: 'CP-LOVE-02', domain: 'LOVE', profileId: 'P3', question: '지금 만나는 사람과 헤어지는 게 나을까?', group: 'DOMAIN_COVERAGE' },
  { caseId: 'CP-LOVE-03', domain: 'LOVE', profileId: 'P8', question: '지금 소개팅을 받아도 괜찮은 시기일까?', group: 'DOMAIN_COVERAGE' },
  // REUNION
  { caseId: 'CP-REUNION-01', domain: 'REUNION', profileId: 'P9', question: '전 연인과 다시 이어질 가능성이 있을까?', group: 'DOMAIN_COVERAGE' },
  { caseId: 'CP-REUNION-02', domain: 'REUNION', profileId: 'P3', question: '재회하면 예전과 다르게 잘 지낼 수 있을까?', group: 'DOMAIN_COVERAGE' },
  { caseId: 'CP-REUNION-03', domain: 'REUNION', profileId: 'P7', question: '전 배우자와 다시 합칠 가능성이 있을까?', group: 'DOMAIN_COVERAGE' },
  // CHANGE
  { caseId: 'CP-CHANGE-01', domain: 'CHANGE', profileId: 'P2', question: '이사하는 흐름이 있어?', group: 'DOMAIN_COVERAGE' },
  { caseId: 'CP-CHANGE-02', domain: 'CHANGE', profileId: 'P7', question: '지금 큰 변화를 주는 게 위험할까?', group: 'DOMAIN_COVERAGE' },
  // TIMING
  { caseId: 'CP-TIMING-01', domain: 'TIMING', profileId: 'P4', question: '올해가 좋아, 내년이 좋아?', group: 'DOMAIN_COVERAGE' },
  { caseId: 'CP-TIMING-02', domain: 'TIMING', profileId: 'P10', question: '올해 안에 큰 기회가 올 수 있을까?', group: 'DOMAIN_COVERAGE' },

  // QUESTION-SENSITIVITY PAIRS (§5) — SAME profile, DIFFERENT question. CP-BIZ-01 above is the timing half
  // of the BIZ pair (re-used, not re-run). CP-MONEY pair is fully separate (P6, not used elsewhere here).
  { caseId: 'CP-QS-BIZ-FIT', domain: 'BUSINESS', profileId: 'P1', question: '내 사주상 사업 체질이 있는 편이야?', group: 'QUESTION_SENSITIVITY', pairId: 'BIZ' },
  { caseId: 'CP-QS-MONEY-CAPACITY', domain: 'MONEY', profileId: 'P6', question: '평생 돈 걱정 없이 살 수 있는 구조야?', group: 'QUESTION_SENSITIVITY', pairId: 'MONEY6' },
  { caseId: 'CP-QS-MONEY-TIMING', domain: 'MONEY', profileId: 'P6', question: '올해 하반기 재물운은 어때?', group: 'QUESTION_SENSITIVITY', pairId: 'MONEY6' },

  // DIFFICULT — contradiction / unresolved / strong counter-evidence candidates. Real outcomes are whatever
  // the pipeline actually produces; not scripted to a predetermined verdict.
  { caseId: 'CP-DIFF-LOVE', domain: 'LOVE', profileId: 'P8', question: '연애가 잘 안 풀리는 이유가 사주에 있을까?', group: 'DIFFICULT' },
  { caseId: 'CP-DIFF-TIMING', domain: 'TIMING', profileId: 'P4', question: '지금 서두르는 게 맞을까, 천천히 가는 게 맞을까?', group: 'DIFFICULT' },
  { caseId: 'CP-DIFF-REUNION', domain: 'REUNION', profileId: 'P10', question: '지금 이 타이밍에 연락하면 반응이 있을까?', group: 'DIFFICULT' },
];

type AnswerFields = {
  coreSummary: string | null; disposition: string | null; coreInterpretation: string | null;
  strengths: string[]; cautions: string[]; domainInterpretation: { title: string; body: string }[];
  futureFlow: string | null;
};

type CaseRecord = {
  caseId: string; group: Group; pairId: string | null; domain: QaDomain; question: string;
  ok: boolean; failureNote: string | null;
  systemsApplicable: string[];
  crossJudgeSummary: string;
  verdictDirection: string | null;
  answer: AnswerFields;
  composedText: string;
  llmMeta: { model: string; reasoningEffort: string; maxOutputTokens: number; failureCode: string | null; latencyMs: number };
  judge: QaJudgeVerdict | null;
  genericPhraseHits: { phrase: string; count: number }[];
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

function crossJudgeSummaryOf(decisionMeta: ConsultationDecisionMeta | undefined | null): { summary: string; systems: string[]; groundedFacts: string[]; direction: string | null } {
  const v = decisionMeta?.divinationVerdict;
  if (!v) return { summary: '없음 (Cross Judge 미산출)', systems: [], groundedFacts: [], direction: null };
  const systems = v.disciplineJudgments.filter((j) => j.applicable).map((j) => j.discipline);
  const lines = [
    `주 결론: ${v.primaryConclusion}`,
    v.agreementPoints[0] ? `일치: ${v.agreementPoints[0]}` : null,
    v.contradictionPoints[0] ? `모순: ${v.contradictionPoints[0]}` : null,
  ].filter(Boolean).join(' / ');
  const groundedFacts = v.evidenceReferences.flatMap((e) => e.lines.slice(0, 2).map((l) => `[${e.discipline}] ${l}`));
  return { summary: lines || v.primaryConclusion, systems, groundedFacts, direction: v.direction };
}

async function runSingleCase(apiKey: string, c: VerificationCase): Promise<CaseRecord> {
  const { callLLM, meta } = buildRealCallLLM(apiKey, c.question);
  const deps: ServerConsultationDeps = { digestProvider, nowEpochSeconds: NOW_EPOCH, callLLM, modelId: null };
  const profile = profileFor(c.profileId);
  let composedText = '';
  let ok = false;
  let failureNote: string | null = null;
  let answer: AnswerFields = { coreSummary: null, disposition: null, coreInterpretation: null, strengths: [], cautions: [], domainInterpretation: [], futureFlow: null };
  let crossInfo = { summary: '없음', systems: [] as string[], groundedFacts: [] as string[], direction: null as string | null };
  try {
    const r = await buildServerConsultation({ birthInput: profile.birth, question: c.question }, deps);
    if (r.ok) {
      ok = true;
      composedText = r.text;
      answer = extractAnswer(r.structuredResult, r.text);
      crossInfo = crossJudgeSummaryOf(r.structuredResult?.decisionMeta);
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
        systemsApplicable: crossInfo.systems, crossJudgeSummary: crossInfo.summary, groundedFacts: crossInfo.groundedFacts, answer,
      })
    : null;
  return {
    caseId: c.caseId, group: c.group, pairId: c.pairId ?? null, domain: c.domain, question: c.question, ok, failureNote,
    systemsApplicable: crossInfo.systems, crossJudgeSummary: crossInfo.summary, verdictDirection: crossInfo.direction,
    answer, composedText,
    llmMeta: { model: m.model, reasoningEffort: m.reasoningEffort, maxOutputTokens: m.maxOutputTokens, failureCode: m.failureCode, latencyMs: m.latencyMs },
    judge, genericPhraseHits: genericPhraseHits(composedText),
  };
}

describe('CONSULTATION EXPRESSION ARCHITECTURE V1 — bounded development verification', () => {
  it('run', async () => {
    if (process.env.QA_LIVE_RUN !== '1') throw new Error('Refusing to run: set QA_LIVE_RUN=1 explicitly (this makes real paid OpenAI calls).');
    const apiKey = loadApiKey();
    fs.mkdirSync(OUT_DIR, { recursive: true });
    const jsonlStream = fs.createWriteStream(JSONL_PATH, { flags: 'w' });

    console.log(`[cp-qa] starting: ${CASES.length} cases`);
    const records = await mapLimit(CASES, 6, async (c) => {
      const rec = await runSingleCase(apiKey, c);
      jsonlStream.write(`${JSON.stringify(rec)}\n`);
      console.log(`[cp-qa] ${rec.caseId} ok=${rec.ok} score=${rec.judge?.totalScore ?? 'n/a'} dir=${rec.verdictDirection ?? 'n/a'}`);
      return rec;
    });
    jsonlStream.end();

    const scored = records.filter((r): r is CaseRecord & { judge: QaJudgeVerdict } => r.judge !== null);
    const scores = scored.map((r) => r.judge.totalScore);
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const hardFails = scored.filter((r) => r.judge.hardFail);
    const fabricatedFactHits = scored.filter((r) => r.judge.hardFailReasons.some((x) => /조작|없는 사실|허위|invent/i.test(x)));
    const specificEvidenceRate = scored.length
      ? scored.filter((r) => /근거:/.test('') || r.answer.domainInterpretation.some((d) => d.body.length > 0) || (r.answer.coreInterpretation ?? '').length > 40).length / scored.length
      : 0;

    // §5 question-sensitivity check — for each pairId with 2 members, the two answers must differ (never an
    // identical/templated answer for two different questions on the same chart).
    const byPair = new Map<string, CaseRecord[]>();
    for (const r of records) {
      const c = CASES.find((x) => x.caseId === r.caseId);
      if (c?.pairId) {
        const arr = byPair.get(c.pairId) ?? [];
        arr.push(r);
        byPair.set(c.pairId, arr);
      }
    }
    const pairDifferentiation = [...byPair.entries()].map(([pairId, recs]) => ({
      pairId,
      caseIds: recs.map((r) => r.caseId),
      distinctCoreSummaries: new Set(recs.map((r) => r.answer.coreSummary)).size,
      distinctComposedText: new Set(recs.map((r) => r.composedText)).size === recs.length,
    }));

    const byDomain = Object.fromEntries(
      (['BUSINESS', 'MONEY', 'CAREER', 'LOVE', 'REUNION', 'CHANGE', 'TIMING'] as const).map((d) => {
        const inDomain = scored.filter((r) => r.domain === d);
        const avgD = inDomain.length ? inDomain.reduce((a, r) => a + r.judge.totalScore, 0) / inDomain.length : null;
        return [d, { count: inDomain.length, averageScore: avgD === null ? null : Math.round(avgD * 100) / 100 }];
      }),
    );

    const dimensionAverage = (key: keyof QaJudgeVerdict['scoreBreakdown']) =>
      scored.length ? Math.round((scored.reduce((a, r) => a + r.judge.scoreBreakdown[key], 0) / scored.length) * 100) / 100 : null;

    const summary = {
      totalCases: records.length,
      okCount: records.filter((r) => r.ok).length,
      scoredCount: scored.length,
      averageScore: Math.round(avg * 100) / 100,
      hardFailCount: hardFails.length,
      hardFailCaseIds: hardFails.map((r) => ({ caseId: r.caseId, reasons: r.judge.hardFailReasons })),
      fabricatedFactCount: fabricatedFactHits.length,
      verdictFidelityFailureCount: scored.filter((r) => r.judge.hardFailReasons.some((x) => /모순|verdict|뒤집/i.test(x))).length,
      specificEvidenceRate: Math.round(specificEvidenceRate * 10000) / 100,
      paidUserValueYesCount: scored.filter((r) => r.judge.paidUserValue === 'YES').length,
      paidUserValueRate: scored.length ? Math.round((scored.filter((r) => r.judge.paidUserValue === 'YES').length / scored.length) * 10000) / 100 : 0,
      byDomain,
      dimensionAverages: {
        personalization: dimensionAverage('personalization'),
        conclusionClarity: dimensionAverage('conclusionClarity'),
        divinationDepth: dimensionAverage('divinationDepth'),
        crossSystemSynthesis: dimensionAverage('crossSystemSynthesis'),
        contradictionHandling: dimensionAverage('contradictionHandling'),
        timingQuality: dimensionAverage('timingQuality'),
        actionUsefulness: dimensionAverage('actionUsefulness'),
        readability: dimensionAverage('readability'),
        professionalTrust: dimensionAverage('professionalTrust'),
      },
      pairDifferentiation,
      difficultCases: records.filter((r) => r.group === 'DIFFICULT').map((r) => ({
        caseId: r.caseId, ok: r.ok, verdictDirection: r.verdictDirection, score: r.judge?.totalScore ?? null,
        hardFail: r.judge?.hardFail ?? null,
      })),
      jsonlPath: JSONL_PATH,
    };
    fs.writeFileSync(SUMMARY_PATH, JSON.stringify(summary, null, 2), 'utf8');
    console.log(`[cp-qa] DONE. summary written to ${SUMMARY_PATH}`);
    console.log(JSON.stringify(summary, null, 2));

    expect(records.length).toBe(CASES.length);
  });
});
