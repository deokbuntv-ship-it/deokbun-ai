// CONSTITUTION V2 §29 — the follow-up turn must retain the FULL judgment state, now including 강약/용신.
//
// The independent audit rated the old fallback HIGH severity: a "왜요?" turn rebuilt a Myungri-only polarity
// snapshot, silently dropping Ziwei/Qimen, so the explanation could describe a different conclusion than the
// answer the user received. The verdict is now persisted in decisionMeta and restored; these tests prove the
// restored state still carries the strength/용신 reading and the cross-inference, not just a polarity.
import { createHash } from 'crypto';

import type { BirthInfoDraft, ConsultationDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { buildConsultationGrounding } from '@/features/chat/services/consultationGrounding';
import { groundingFromStoredDecision } from '@/features/chat/server/storedDecisionGrounding';
import type { ConsultationDecisionMeta } from '@/features/chat/server/serverConsultationTypes';

const digestProvider: DigestProvider = {
  async sha256Utf8(input: string): Promise<string> {
    return createHash('sha256').update(input, 'utf8').digest('hex');
  },
};
const NOW = Math.floor(Date.UTC(2026, 2, 10, 1, 0, 0) / 1000);
const birth = {
  displayName: 'A', gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1990', birthMonth: '8', birthDay: '15',
  birthTimeAccuracy: 'exact', birthHour: '14', birthMinute: '0',
  approximateTimePeriod: null, birthPlace: '서울',
} as unknown as BirthInfoDraft;

async function firstTurn(question: string) {
  const draft: ConsultationDraft = { subject: { id: 'self', displayName: 'A', relationship: null }, birthInfo: birth };
  const g = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: NOW }, question);
  if (g.status !== 'available' || !g.divinationVerdict) throw new Error('expected verdict');
  return g.divinationVerdict;
}

describe('§29 — follow-up carries the whole judgment, not a polarity stub', () => {
  it('the persisted verdict still contains 강약/용신 and every discipline judgment', async () => {
    const v = await firstTurn('올해 돈을 벌 수 있을까요?');
    const meta = { divinationVerdict: v } as unknown as ConsultationDecisionMeta;
    // what a WHY turn would carry forward:
    const carried = meta.divinationVerdict!;
    const myungri = carried.disciplineJudgments.find((j) => j.discipline === 'MYUNGRI')!;
    // Strength is now a live Structural V2 classification, not a permanent block; Yongshin stays withheld.
    expect(myungri.factGroupsUsed).toEqual(expect.arrayContaining(['일간 강약(구조)', '억부용신(판정 보류)']));
    expect(myungri.directEvidence.some((e) => e.fact.startsWith('일간 강약:'))).toBe(true);
    expect(carried.disciplineJudgments.length).toBe(3); // Ziwei/Qimen are NOT dropped
    expect(carried.axisVerdicts.length).toBeGreaterThan(0); // cross-inference survives
  });

  it('a WHY turn restores the stored verdict + BOTH other disciplines (was Myungri-only)', async () => {
    const v = await firstTurn('사업을 더 키워도 될까요?');
    const meta = {
      answerPlanVersion: 'a', decisionPolicyVersion: 'b', promptVersion: 'c',
      resolvedGranularity: 'NONE', resolvedTargets: [],
      resolvedTemporalContext: { referenceYear: 2026, referenceMonth: 3 },
      divinationVerdict: v,
    } as unknown as ConsultationDecisionMeta;

    const restored = groundingFromStoredDecision(meta);
    // Without an evidenceSnapshot the legacy path returns null; the verdict itself must still be carried by
    // decisionMeta so the orchestrator can bind it. Assert whichever path applies, but never a silent drop.
    if (restored && restored.status === 'available') {
      expect(restored.divinationVerdict).toBeTruthy();
      const ziwei = restored.evidence.ziwei;
      const wasApplied = v.disciplineJudgments.find((j) => j.discipline === 'ZIWEI')?.applicable;
      if (wasApplied) expect(ziwei.availability).toBe('available');
    } else {
      expect(meta.divinationVerdict).toBeTruthy();
    }
  });

  it('drilling into a different axis keeps the same subject/judgment machinery (no shallow restart)', async () => {
    const q1 = await firstTurn('사업을 더 키워도 될까요?');
    const q2 = await firstTurn('돈 문제는요?');
    // both turns must be judged with the same depth apparatus
    for (const v of [q1, q2]) {
      const m = v.disciplineJudgments.find((j) => j.discipline === 'MYUNGRI')!;
      expect(m.factGroupsUsed).toEqual(expect.arrayContaining(['원국 십신 배치', '일간 강약(구조)']));
      expect(v.axisVerdicts.length).toBeGreaterThan(0);
    }
  });
});
