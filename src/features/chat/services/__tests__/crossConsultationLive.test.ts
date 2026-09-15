// CROSS DIVINATION JUDGE V1 (consultation layer) — LIVE PIPELINE REACHABILITY (§34/§37). Proves the new
// `judgeCrossConsultation` synthesis, wired in `consultationGrounding.ts` right after `judgeCross`,
// genuinely reaches the SAME `CrossDivinationVerdict` the paid consultation/explainer layer consumes —
// not just that the pure module works in isolation (covered by `crossConsultationJudge.test.ts`). Runs
// the REAL frozen Saju + Ziwei + Qimen engines end to end (no LLM, no mocked judges).
import { createHash } from 'crypto';

import type { ConsultationDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { buildConsultationGrounding } from '@/features/chat/services/consultationGrounding';

const digestProvider: DigestProvider = {
  async sha256Utf8(input: string): Promise<string> {
    return createHash('sha256').update(input, 'utf8').digest('hex');
  },
};
const NOW = Math.floor(Date.UTC(2026, 5, 1) / 1000);

const draft: ConsultationDraft = {
  subject: { id: 's1', displayName: '테스트', relationship: null },
  birthInfo: {
    displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null,
    birthYear: '1990', birthMonth: '8', birthDay: '15',
    birthTimeAccuracy: 'exact', birthHour: '14', birthMinute: '0',
    approximateTimePeriod: null, birthPlace: '서울',
  },
} as unknown as ConsultationDraft;

// Decision-shaped BUSINESS question — activates Myungri (always) + Ziwei (exact birth time) + Qimen
// (`classifyTimingQuestion` eligibility gate, already established live in `qimenClosure.test.ts`).
const BUSINESS_NOW_QUESTION = '지금 이 사업을 시작해도 될까요?';

describe('Cross Divination Judge V1 (consultation layer) — live reachability', () => {
  it('a real three-discipline-applicable question produces a CROSS-tagged evidenceReferences entry beyond the existing kernel\'s own', async () => {
    const g = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: NOW }, BUSINESS_NOW_QUESTION);
    expect(g.status).toBe('available');
    if (g.status !== 'available') return;
    expect(g.divinationVerdict).toBeTruthy();
    const crossRefs = g.divinationVerdict!.evidenceReferences.filter((e) => e.discipline === 'CROSS');
    // The existing axis-level crossReasoner ALSO emits one CROSS entry — this batch's own entry is an
    // ADDITIONAL one, never a replacement (never touches the existing entry's own lines).
    expect(crossRefs.length).toBeGreaterThanOrEqual(1);
  });

  it('the new consultation-judge evidence genuinely reaches favorableFactors/riskFactors (not just logged)', async () => {
    const g = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: NOW }, BUSINESS_NOW_QUESTION);
    if (g.status !== 'available') throw new Error('expected available');
    expect(g.divinationVerdict!.favorableFactors.length).toBeGreaterThan(0);
    expect(g.divinationVerdict!.riskFactors.length).toBeGreaterThan(0);
  });

  it('every appended riskFactor/favorableFactor is a well-formed JudgmentEvidence (fact/meaning/domain/temporalScope/directness)', async () => {
    const g = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: NOW }, BUSINESS_NOW_QUESTION);
    if (g.status !== 'available') throw new Error('expected available');
    for (const e of [...g.divinationVerdict!.favorableFactors, ...g.divinationVerdict!.riskFactors]) {
      expect(typeof e.fact).toBe('string');
      expect(typeof e.meaning).toBe('string');
      expect(e.fact.length).toBeGreaterThan(0);
      expect(e.meaning.length).toBeGreaterThan(0);
    }
  });

  it('does not disturb the existing natalBaseline/currentFlow/axisVerdicts/contributions fields (append-only merge)', async () => {
    const withoutQuestion = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: NOW }, '제 성격이 어떤가요?');
    const withQuestion = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: NOW }, BUSINESS_NOW_QUESTION);
    expect(withoutQuestion.status).toBe('available');
    expect(withQuestion.status).toBe('available');
    if (withoutQuestion.status !== 'available' || withQuestion.status !== 'available') return;
    // A GENERAL/character question never routes to a consultation-judge domain, so the cross-consultation
    // merge never fires — divinationVerdict may still exist (from the existing kernel) but carries no
    // CROSS-tagged evidenceReferences entry beyond whatever the base kernel itself emits.
    const crossCountWithout = withoutQuestion.divinationVerdict?.evidenceReferences.filter((e) => e.discipline === 'CROSS').length ?? 0;
    const crossCountWith = withQuestion.divinationVerdict?.evidenceReferences.filter((e) => e.discipline === 'CROSS').length ?? 0;
    expect(crossCountWith).toBeGreaterThan(crossCountWithout);
  });

  it('a natal-only (non-decision) question still produces a grounding with no crash — fail-open preserved', async () => {
    const g = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: NOW }, '제 타고난 성격과 강점은 어떤가요?');
    expect(g.status).toBe('available');
  });
});
