// AUDIT-DRIVEN CONSULTATION QUALITY REMEDIATION V1 — 18-case regression set (brief §15-17). NOT the final
// independent 94 holdout (untouched, unseen). These 18 cases are drawn VERBATIM from the existing canonical
// QA_CASES fixtures by their existing caseId — 12 case IDs the independent 30-case holdout review already
// reported as hard-fails (now-consumed, no longer holdout, explicitly permitted for regression per §15), plus
// 6 non-hard-fail controls. No new case/profile text is authored here.
//
// Run with:
//   QA_LIVE_RUN=1 npx jest --roots scripts/qa --testMatch "**/runAuditRemediationRegression.test.ts" -t "run" --silent
import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

import { buildServerConsultation } from '@/features/chat/server';
import type { ServerConsultationDeps, ConsultationDecisionMeta, ServerConsultationDiagnostics } from '@/features/chat/server';
import type { DigestProvider } from '@/features/interpretation';

import { QA_PROFILES, QA_CASES, type QaCase } from './consultationQaFixtures';
import { buildRealCallLLM } from './openaiCallLLM';
import { judgeQaCase, type QaJudgeVerdict } from './qaJudge';
import { genericPhraseHits } from './qaTextChecks';

jest.setTimeout(40 * 60 * 1000);

const OUT_DIR = 'C:\\Users\\USER\\AppData\\Local\\Temp\\claude\\C--Development\\6952b170-98a2-42a9-a6de-340a7a91102d\\scratchpad\\qa';
const JSONL_PATH = path.join(OUT_DIR, 'auditRemediationRegression.jsonl');
const SUMMARY_PATH = path.join(OUT_DIR, 'auditRemediationRegression.summary.json');

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

// §15 — the mandatory previous hard-fail regression cases + 6 non-hard-fail controls, referenced by their
// EXISTING caseId in consultationQaFixtures.ts (unchanged file). 18 total.
const REGRESSION_CASE_IDS = [
  'BUSINESS-06', 'BUSINESS-10', 'BUSINESS-17', 'MONEY-04', 'CAREER-02', 'CAREER-04',
  'LOVE-02', 'LOVE-09', 'LOVE-13', 'REUNION-05', 'CHANGE-07', 'TIMING-05',
  'BUSINESS-13', 'MONEY-02', 'CAREER-11', 'LOVE-04', 'CHANGE-02', 'TIMING-03',
];
const CONTROL_IDS = new Set(['BUSINESS-13', 'MONEY-02', 'CAREER-11', 'LOVE-04', 'CHANGE-02', 'TIMING-03']);

const REGRESSION_CASES: QaCase[] = REGRESSION_CASE_IDS.map((id) => {
  const c = QA_CASES.find((x) => x.caseId === id);
  if (!c) throw new Error(`regression case id not found in QA_CASES: ${id}`);
  return c;
});

type AnswerFields = {
  coreSummary: string | null; disposition: string | null; coreInterpretation: string | null;
  strengths: string[]; cautions: string[]; domainInterpretation: { title: string; body: string }[];
  futureFlow: string | null; verifiedEvidenceCount: number;
};

type CaseRecord = {
  caseId: string; isControl: boolean; domain: string; question: string;
  ok: boolean; failureNote: string | null;
  outputClassification: string | null; rejectionReason: string | null;
  systemsApplicable: string[];
  crossJudgeSummary: string;
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

async function runSingleCase(apiKey: string, c: QaCase): Promise<CaseRecord> {
  const { callLLM, meta } = buildRealCallLLM(apiKey, c.question);
  const deps: ServerConsultationDeps = { digestProvider, nowEpochSeconds: NOW_EPOCH, callLLM, modelId: null };
  const profile = profileFor(c.profileId);
  let composedText = '';
  let ok = false;
  let failureNote: string | null = null;
  let answer: AnswerFields = { coreSummary: null, disposition: null, coreInterpretation: null, strengths: [], cautions: [], domainInterpretation: [], futureFlow: null, verifiedEvidenceCount: 0 };
  let crossInfo = { summary: '없음', systems: [] as string[], groundedFacts: [] as string[] };
  let diagnostics: ServerConsultationDiagnostics | undefined;
  try {
    const r = await buildServerConsultation({ birthInput: profile.birth, question: c.question }, deps);
    if (r.ok) {
      ok = true;
      composedText = r.text;
      answer = extractAnswer(r.structuredResult, r.text);
      crossInfo = crossJudgeSummaryOf(r.structuredResult?.decisionMeta);
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
        systemsApplicable: crossInfo.systems, crossJudgeSummary: crossInfo.summary, groundedFacts: crossInfo.groundedFacts, answer,
      })
    : null;
  return {
    caseId: c.caseId, isControl: CONTROL_IDS.has(c.caseId), domain: c.domain, question: c.question, ok, failureNote,
    outputClassification: diagnostics?.outputClassification ?? null, rejectionReason: diagnostics?.rejectionReason ?? null,
    systemsApplicable: crossInfo.systems, crossJudgeSummary: crossInfo.summary, answer, composedText,
    llmMeta: { model: m.model, reasoningEffort: m.reasoningEffort, maxOutputTokens: m.maxOutputTokens, failureCode: m.failureCode, latencyMs: m.latencyMs },
    judge, genericPhraseHits: genericPhraseHits(composedText),
  };
}

describe('AUDIT-DRIVEN CONSULTATION QUALITY REMEDIATION V1 — 18-case regression', () => {
  it('run', async () => {
    if (process.env.QA_LIVE_RUN !== '1') throw new Error('Refusing to run: set QA_LIVE_RUN=1 explicitly (this makes real paid OpenAI calls).');
    const apiKey = loadApiKey();
    fs.mkdirSync(OUT_DIR, { recursive: true });
    const jsonlStream = fs.createWriteStream(JSONL_PATH, { flags: 'w' });

    console.log(`[regr] starting: ${REGRESSION_CASES.length} cases`);
    const records = await mapLimit(REGRESSION_CASES, 6, async (c) => {
      const rec = await runSingleCase(apiKey, c);
      jsonlStream.write(`${JSON.stringify(rec)}\n`);
      console.log(`[regr] ${rec.caseId} ok=${rec.ok} class=${rec.outputClassification} reason=${rec.rejectionReason} score=${rec.judge?.totalScore ?? 'n/a'}`);
      return rec;
    });
    jsonlStream.end();

    const scored = records.filter((r): r is CaseRecord & { judge: QaJudgeVerdict } => r.judge !== null);
    const scores = scored.map((r) => r.judge.totalScore);
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const hardFails = scored.filter((r) => r.judge.hardFail);
    const semanticRejected = records.filter((r) => r.outputClassification === 'SEMANTIC_REJECTED');
    const fabricatedFact = scored.filter((r) => r.judge.hardFailReasons.some((x) => /조작|없는 사실|허위|invent|fabricat/i.test(x)));
    const wrongPerson = scored.filter((r) => r.judge.hardFailReasons.some((x) => /다른 사람|잘못된 인물|wrong.?person/i.test(x)));
    const verdictFidelityFailure = scored.filter((r) => r.judge.hardFailReasons.some((x) => /모순|verdict|뒤집/i.test(x)));
    const unresolvedToDecisive = scored.filter((r) => r.judge.hardFailReasons.some((x) => /확정.*보류|보류.*확정|unresolved.*decisive/i.test(x)));
    const temporalCorruption = scored.filter((r) => r.judge.hardFailReasons.some((x) => /시간축|시점.*혼동|temporal/i.test(x)));
    const specificEvidence = scored.filter((r) => !r.judge.personalizationFail);
    const paidValueYes = scored.filter((r) => r.judge.paidUserValue === 'YES');

    const businessO6 = records.find((r) => r.caseId === 'BUSINESS-06');
    const love02 = records.find((r) => r.caseId === 'LOVE-02');

    const summary = {
      caseCount: records.length,
      hardFailCount: hardFails.length,
      hardFailCaseIds: hardFails.map((r) => ({ caseId: r.caseId, reasons: r.judge.hardFailReasons })),
      semanticRejectedCount: semanticRejected.length,
      semanticRejectedCaseIds: semanticRejected.map((r) => r.caseId),
      fabricatedFactCount: fabricatedFact.length,
      wrongPersonFactCount: wrongPerson.length,
      verdictFidelityFailureCount: verdictFidelityFailure.length,
      unresolvedToDecisiveCount: unresolvedToDecisive.length,
      temporalCorruptionCount: temporalCorruption.length,
      specificEvidenceRate: scored.length ? Math.round((specificEvidence.length / scored.length) * 10000) / 100 : 0,
      paidUserValueRate: scored.length ? Math.round((paidValueYes.length / scored.length) * 10000) / 100 : 0,
      regressionAverageScore: Math.round(avg * 100) / 100,
      controlsAverageScore: (() => {
        const c = scored.filter((r) => r.isControl);
        return c.length ? Math.round((c.reduce((a, r) => a + r.judge.totalScore, 0) / c.length) * 100) / 100 : null;
      })(),
      formerHardFailsAverageScore: (() => {
        const c = scored.filter((r) => !r.isControl);
        return c.length ? Math.round((c.reduce((a, r) => a + r.judge.totalScore, 0) / c.length) * 100) / 100 : null;
      })(),
      business06RejectionReason: businessO6 ? { outputClassification: businessO6.outputClassification, rejectionReason: businessO6.rejectionReason, ok: businessO6.ok, coreSummaryPreview: (businessO6.answer.coreSummary ?? '').slice(0, 80) } : null,
      love02RejectionReason: love02 ? { outputClassification: love02.outputClassification, rejectionReason: love02.rejectionReason, ok: love02.ok, coreSummaryPreview: (love02.answer.coreSummary ?? '').slice(0, 80) } : null,
      avgVerifiedEvidenceCount: scored.length ? Math.round((scored.reduce((a, r) => a + r.answer.verifiedEvidenceCount, 0) / scored.length) * 100) / 100 : 0,
      jsonlPath: JSONL_PATH,
    };
    fs.writeFileSync(SUMMARY_PATH, JSON.stringify(summary, null, 2), 'utf8');
    console.log(`[regr] DONE. summary written to ${SUMMARY_PATH}`);
    console.log(JSON.stringify(summary, null, 2));

    expect(records.length).toBe(REGRESSION_CASE_IDS.length);
  });
});
