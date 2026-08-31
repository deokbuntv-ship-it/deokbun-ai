// DEOKBUNI_PRE_BENCHMARK_VALUE_REMEDIATION_V5 — the ONE consumed 40-case complete-product regression.
//
// Same consumed set as the V4 rescore (`selectRegressionCases`, deterministic, 12 prior hard-fails + 6
// controls + a domain-spread fill to 40). Nothing is re-run for a weak result and there is no second
// regression: each case is generated EXACTLY ONCE through the real path, scored by the corrected
// complete-product judge, and reported as it landed.
//
// What changed since V4 is the MEASUREMENT, not the sample:
//   - USER_VISIBLE_ANSWER is the product's own `buildUserVisibleAnswer` — 전문근거, 행동, 한마디 and
//     왜 이렇게 보나요 are scored because the reader receives them.
//   - AUTHORITATIVE_REFERENCE is separate and reference-only; internal facts cannot earn visible-content points.
//   - Cross-System Synthesis keeps weight 15 but is scored against MATERIAL contributors, so a truthful
//     single-system answer is no longer mechanically 0/15.
//
// Run with:
//   QA_LIVE_RUN=1 npx jest --roots scripts/qa --testMatch "**/runV5CompleteProductRegression.test.ts" -t "run" --silent
import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

import { buildServerConsultation } from '@/features/chat/server';
import type { ServerConsultationDeps, ServerConsultationDiagnostics } from '@/features/chat/server';
import type { DigestProvider } from '@/features/interpretation';

import { QA_PROFILES, type QaCase } from './consultationQaFixtures';
import { buildRealCallLLM } from './openaiCallLLM';
import { completeProductView, type CompleteProductView } from './qaCompleteProduct';
import { judgeQaCase, type QaJudgeVerdict } from './qaJudge';
import { genericPhraseHits } from './qaTextChecks';
import { CONTROL_IDS, selectRegressionCases } from './regressionCases';

jest.setTimeout(90 * 60 * 1000);

const OUT_DIR = path.resolve(__dirname, '..', '..', '.qa-out');
const JSONL_PATH = path.join(OUT_DIR, 'v5CompleteProductRegression.jsonl');
const SUMMARY_PATH = path.join(OUT_DIR, 'v5CompleteProductRegression.summary.json');

const BLOCKED_IN_V4 = ['MONEY-03', 'MONEY-15', 'REUNION-09', 'TIMING-05'];

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

type CaseRecord = {
  caseId: string; isControl: boolean; wasBlockedInV4: boolean; domain: string; question: string;
  ok: boolean; failureNote: string | null;
  outputClassification: string | null; rejectionReason: string | null;
  groundedFallback: boolean; groundedViolations: string[];
  materialContributors: string[]; notCoveredSystems: string[];
  crossJudgeSummary: string;
  // THE DELIVERED PRODUCT — persisted so the record can be re-read without regenerating anything.
  userVisibleAnswer: CompleteProductView['userVisibleAnswer'];
  userVisibleText: string;
  verifiedEvidence: { title: string; body: string }[];
  hasActionSection: boolean;
  llmMeta: { model: string; reasoningEffort: string; maxOutputTokens: number; failureCode: string | null; latencyMs: number };
  judge: QaJudgeVerdict | null;
  genericPhraseHits: { phrase: string; count: number }[];
  ageRangesInAnswer: string[];
};

const ACTION_TITLES = [
  '이렇게 움직이시면 됩니다', '어느 쪽을 먼저 보시면 됩니다', '시점을 이렇게 보시면 됩니다',
  '이렇게 이해하시면 됩니다', '이 결을 이렇게 쓰시면 됩니다',
];

const ageRangesIn = (text: string): string[] =>
  [...text.matchAll(/(\d{1,3})\s*[~\-–—]\s*(\d{1,3})\s*(?:세|살)/g)].map((m) => `${m[1]}~${m[2]}세`);

async function runSingleCase(apiKey: string, c: QaCase): Promise<CaseRecord> {
  const { callLLM, meta } = buildRealCallLLM(apiKey, c.question);
  const deps: ServerConsultationDeps = { digestProvider, nowEpochSeconds: NOW_EPOCH, callLLM, modelId: null };
  const profile = profileFor(c.profileId);
  let ok = false;
  let failureNote: string | null = null;
  let product = completeProductView(undefined, '');
  let diagnostics: ServerConsultationDiagnostics | undefined;
  try {
    const r = await buildServerConsultation({ birthInput: profile.birth, question: c.question }, deps);
    if (r.ok) {
      ok = true;
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
        materialContributors: product.materialContributors,
        notCoveredSystems: product.notCoveredSystems,
        crossJudgeSummary: product.crossJudgeSummary,
        authoritativeReference: product.authoritativeReference,
        userVisibleAnswer: product.userVisibleAnswer,
      })
    : null;
  return {
    caseId: c.caseId, isControl: CONTROL_IDS.includes(c.caseId), wasBlockedInV4: BLOCKED_IN_V4.includes(c.caseId),
    domain: c.domain, question: c.question, ok, failureNote,
    outputClassification: diagnostics?.outputClassification ?? null,
    rejectionReason: diagnostics?.rejectionReason ?? null,
    groundedFallback: diagnostics?.groundedFallback === true,
    groundedViolations: diagnostics?.groundedViolations ?? [],
    materialContributors: product.materialContributors,
    notCoveredSystems: product.notCoveredSystems,
    crossJudgeSummary: product.crossJudgeSummary,
    userVisibleAnswer: product.userVisibleAnswer,
    userVisibleText: product.userVisibleText,
    verifiedEvidence: product.verifiedEvidence,
    hasActionSection: product.userVisibleAnswer.sections.some((s) => ACTION_TITLES.includes(s.title)),
    llmMeta: { model: m.model, reasoningEffort: m.reasoningEffort, maxOutputTokens: m.maxOutputTokens, failureCode: m.failureCode, latencyMs: m.latencyMs },
    judge,
    genericPhraseHits: genericPhraseHits(product.userVisibleText),
    ageRangesInAnswer: ageRangesIn(product.userVisibleText),
  };
}

const pct = (n: number, d: number): number => (d > 0 ? Math.round((n / d) * 10000) / 100 : 0);
const avg = (xs: number[]): number => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 100) / 100 : 0);

describe('V5 — 40-case complete-product regression (consumed set)', () => {
  it('uses the same consumed 40 and measures the delivered product', () => {
    const cases = selectRegressionCases();
    expect(cases).toHaveLength(40);
    expect(new Set(cases.map((c) => c.caseId)).size).toBe(40);
    // Determinism — the same 40 every call, so this run is comparable to the V4 rescore.
    expect(selectRegressionCases().map((c) => c.caseId)).toEqual(cases.map((c) => c.caseId));
  });

  it('run', async () => {
    if (process.env.QA_LIVE_RUN !== '1') {
      console.log('[v5] skipped (set QA_LIVE_RUN=1 to make real paid OpenAI calls)');
      return;
    }
    const apiKey = loadApiKey();
    const cases = selectRegressionCases();
    fs.mkdirSync(OUT_DIR, { recursive: true });
    const jsonlStream = fs.createWriteStream(JSONL_PATH, { flags: 'w' });

    console.log(`[v5] starting: ${cases.length} cases — ONE generation each, no reruns`);
    const records = await mapLimit(cases, 6, async (c) => {
      const rec = await runSingleCase(apiKey, c);
      jsonlStream.write(`${JSON.stringify(rec)}\n`);
      console.log(`[v5] ${rec.caseId} ok=${rec.ok} action=${rec.hasActionSection} material=${rec.materialContributors.length} score=${rec.judge?.totalScore ?? 'n/a'}`);
      return rec;
    });
    jsonlStream.end();

    const scored = records.filter((r): r is CaseRecord & { judge: QaJudgeVerdict } => r.judge !== null);
    const reasonHits = (re: RegExp) => scored.filter((r) => r.judge.hardFailReasons.some((x) => re.test(x)));
    const fallback = scored.filter((r) => r.groundedFallback);

    const summary = {
      caseCount: records.length,
      caseIds: records.map((r) => r.caseId),
      scoredCount: scored.length,
      hardFailCount: scored.filter((r) => r.judge.hardFail).length,
      hardFailCaseIds: scored.filter((r) => r.judge.hardFail).map((r) => ({ caseId: r.caseId, reasons: r.judge.hardFailReasons })),
      notOkCaseIds: records.filter((r) => !r.ok).map((r) => ({ caseId: r.caseId, failureNote: r.failureNote })),
      semanticRejectedCount: records.filter((r) => r.outputClassification === 'SEMANTIC_REJECTED').length,
      groundedFallbackCount: records.filter((r) => r.groundedFallback).length,
      fallbackReasonCounts: records.flatMap((r) => r.groundedViolations)
        .reduce<Record<string, number>>((acc, k) => ({ ...acc, [k]: (acc[k] ?? 0) + 1 }), {}),

      fabricatedFactCount: reasonHits(/조작|없는 사실|허위|지어|invent|fabricat/i).length,
      fabricatedTechnicalRelationCount: reasonHits(/궁|성계|화기|화록|간지|관계.*잘못|잘못.*관계/i).length,
      wrongPersonFactCount: reasonHits(/다른 사람|잘못된 인물|wrong.?person/i).length,
      wrongDisciplineAttributionCount: reasonHits(/학문.*(잘못|혼동)|자미.*명리.*혼동|기문.*(썼|사용).*않|근거.*내지.*않.*체계/i).length,
      verdictFidelityFailureCount: reasonHits(/모순|verdict|뒤집/i).length,
      unresolvedToDecisiveCount: reasonHits(/확정.*보류|보류.*확정|unresolved.*decisive/i).length,
      temporalCorruptionCount: reasonHits(/시간축|시점.*혼동|temporal/i).length,
      // Deterministic, judge-independent: an age range that the grounded material never supplied.
      unsupportedDaewoonRangeCases: records.filter((r) => r.ageRangesInAnswer.length > 0)
        .map((r) => ({ caseId: r.caseId, ranges: r.ageRangesInAnswer })),

      specificEvidenceRate: pct(scored.filter((r) => !r.judge.personalizationFail).length, scored.length),
      paidUserValueRate: pct(scored.filter((r) => r.judge.paidUserValue === 'YES').length, scored.length),
      fallbackPaidUserValueRate: fallback.length ? pct(fallback.filter((r) => r.judge.paidUserValue === 'YES').length, fallback.length) : null,
      fallbackScoredCount: fallback.length,

      completeProductAverage: avg(scored.map((r) => r.judge.totalScore)),
      crossSystemSynthesisAvg: avg(scored.map((r) => r.judge.scoreBreakdown.crossSystemSynthesis)),
      actionUsefulnessAvg: avg(scored.map((r) => r.judge.scoreBreakdown.actionUsefulness)),
      controlsAverage: avg(scored.filter((r) => r.isControl).map((r) => r.judge.totalScore)),

      // The four V4-blocked cases, reported individually.
      v4BlockedCases: scored.filter((r) => r.wasBlockedInV4).map((r) => ({
        caseId: r.caseId, total: r.judge.totalScore,
        cross: r.judge.scoreBreakdown.crossSystemSynthesis,
        action: r.judge.scoreBreakdown.actionUsefulness,
        paidUserValue: r.judge.paidUserValue,
        materialContributors: r.materialContributors,
      })),

      // V5 delivery coverage — did the new server-materialized sections actually reach the reader?
      actionSectionPresentCount: records.filter((r) => r.hasActionSection).length,
      verifiedEvidencePresentCount: records.filter((r) => r.verifiedEvidence.length > 0).length,
      singleMaterialContributorCount: scored.filter((r) => r.materialContributors.length === 1).length,
      multiMaterialContributorCount: scored.filter((r) => r.materialContributors.length >= 2).length,

      jsonlPath: JSONL_PATH,
      note: 'CONSUMED REGRESSION DATA — not an independent holdout score. ONE generation per case, no reruns.',
    };
    fs.writeFileSync(SUMMARY_PATH, JSON.stringify(summary, null, 2), 'utf8');
    console.log(`[v5] DONE. summary written to ${SUMMARY_PATH}`);
    console.log(JSON.stringify(summary, null, 2));

    expect(records.length).toBe(40);
  });
});
