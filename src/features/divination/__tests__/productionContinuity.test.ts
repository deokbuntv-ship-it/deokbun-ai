// V3 §44 + §24 — REAL production continuity and Qimen time basis.
//
// The previous sprint's follow-up test used an in-memory object and therefore PASSED while production was
// broken: `parseDecisionMeta` never deserialized `divinationVerdict`, so the write → JSONB → parse round trip
// silently dropped the whole judgment and a "왜요?" turn explained a degraded reading. These tests exercise
// the ACTUAL serialize → persistable JSON → parse → restore path. A null restore is a failure, not a pass.
import { createHash } from 'crypto';

import type { BirthInfoDraft, ConsultationDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { buildConsultationGrounding } from '@/features/chat/services/consultationGrounding';
import { buildConsultationDecisionMeta, parseDecisionMeta } from '@/features/chat/server/decisionMeta';
import { deriveAnswerPlan } from '@/features/chat/server/answerPlan';
import { buildResolvedTemporalContext } from '@/features/chat/server/resolvedTemporalContext';
import { epochToProviderQueryTime, resolveQimenActivation } from '@/features/chat/selectors/qimenActivation';
import { computeQimenBoard } from '@/features/qimen';

const digestProvider: DigestProvider = {
  async sha256Utf8(input: string): Promise<string> {
    return createHash('sha256').update(input, 'utf8').digest('hex');
  },
};
const NOW = Math.floor(Date.UTC(2026, 2, 10, 1, 0, 0) / 1000); // 2026-03-10 10:00 KST
const birth = {
  displayName: 'A', gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1990', birthMonth: '8', birthDay: '15',
  birthTimeAccuracy: 'exact', birthHour: '14', birthMinute: '0',
  approximateTimePeriod: null, birthPlace: '서울',
} as unknown as BirthInfoDraft;

async function roundTrip(question: string) {
  const draft: ConsultationDraft = { subject: { id: 'self', displayName: 'A', relationship: null }, birthInfo: birth };
  const grounding = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: NOW }, question);
  if (grounding.status !== 'available') throw new Error('expected grounding');
  const plan = deriveAnswerPlan(question, grounding);
  const rtc = buildResolvedTemporalContext(question, NOW, grounding);
  const meta = buildConsultationDecisionMeta(question, plan, grounding, rtc, 'test-model');
  // THE REAL PATH: what actually goes into the JSONB column and comes back out.
  const persisted = JSON.parse(JSON.stringify(meta));
  const restored = parseDecisionMeta(persisted);
  return { grounding, meta, persisted, restored };
}

describe('§44 — the verdict survives the REAL serialize → parse → restore path', () => {
  it('SERIALIZED: the builder writes the verdict into the persistable meta', async () => {
    const { meta, persisted } = await roundTrip('사업을 더 키워도 될까요?');
    expect(meta.divinationVerdict).toBeTruthy();
    expect(persisted.divinationVerdict).toBeTruthy(); // survives JSON
  });

  it('PARSED + RESTORED: parseDecisionMeta returns the verdict (this used to silently drop it)', async () => {
    const { restored } = await roundTrip('사업을 더 키워도 될까요?');
    expect(restored).toBeDefined();
    expect(restored!.divinationVerdict).toBeTruthy(); // ← the actual production bug
  });

  it('the restored judgment still carries propositions, strength/용신, and every discipline', async () => {
    const { restored } = await roundTrip('올해 돈을 벌 수 있을까요?');
    const v = restored!.divinationVerdict!;
    expect(v.disciplineJudgments.length).toBe(3);
    expect(v.axisVerdicts.length).toBeGreaterThan(0);
    expect(v.evidenceReferences.length).toBeGreaterThan(0);
    const myungri = v.disciplineJudgments.find((j) => j.discipline === 'MYUNGRI')!;
    expect(myungri.domainSubJudgments.length).toBeGreaterThan(0);
    expect(myungri.factGroupsUsed).toEqual(expect.arrayContaining(['일간 강약(억부)', '용신(억부)']));
  });

  it('temporal anchors survive, so a follow-up keeps the ORIGINAL evaluation reference', async () => {
    const { restored } = await roundTrip('지금 계약해도 될까요?');
    expect(restored!.resolvedTemporalContext.anchorEpochSeconds).toBe(NOW);
    expect(restored!.resolvedTemporalContext.timezone).toBe('Asia/Seoul');
  });

  it('fail-closed: a malformed verdict rejects the row instead of restoring a hollow judgment', async () => {
    const { persisted } = await roundTrip('사업을 더 키워도 될까요?');
    const corrupted = { ...persisted, divinationVerdict: { direction: 'FOR' } }; // missing required structure
    expect(parseDecisionMeta(corrupted)).toBeUndefined();
  });

  it('a legacy row with NO verdict still parses (backward compatible)', async () => {
    const { persisted } = await roundTrip('사업을 더 키워도 될까요?');
    const legacy = { ...persisted };
    delete legacy.divinationVerdict;
    expect(parseDecisionMeta(legacy)).toBeDefined();
  });
});

describe('§24 — Qimen time basis: the board is cast for the ACTUAL instant', () => {
  it('an epoch is converted to the provider CST (UTC+8) wall clock, not Seoul UTC+9', () => {
    // 2026-03-10 10:00 KST == 01:00 UTC == 09:00 CST
    const t = epochToProviderQueryTime(NOW);
    expect(t).toEqual({ year: 2026, month: 3, day: 10, hour: 9 });
  });

  it('the 1-hour shift no longer pushes the instant across a 時辰 block', () => {
    // 11:00 KST == 10:00 CST. 時辰 are 2-hour blocks, so the old +9 reading (11) and the correct +8 reading
    // (10) fall in DIFFERENT blocks — precisely the silent corruption this fixes.
    const eleven = Math.floor(Date.UTC(2026, 2, 10, 2, 0, 0) / 1000);
    expect(epochToProviderQueryTime(eleven).hour).toBe(10);
  });

  it('a date-boundary instant maps to the correct provider day', () => {
    // 2026-03-11 00:30 KST == 2026-03-10 15:30 UTC == 2026-03-10 23:30 CST → still the 10th for the provider
    const justAfterMidnightKst = Math.floor(Date.UTC(2026, 2, 10, 15, 30, 0) / 1000);
    const t = epochToProviderQueryTime(justAfterMidnightKst);
    expect(t.day).toBe(10);
    expect(t.hour).toBe(23);
  });

  it('the activation path uses the provider basis end-to-end and still computes a board', () => {
    const q = resolveQimenActivation('지금 계약해도 될까요?', NOW);
    expect(q.questionTime).toEqual({ year: 2026, month: 3, day: 10, hour: 9 });
    const board = computeQimenBoard(q);
    expect(board.availability).toBe('available');
    // and the board's own recorded query time matches the corrected basis
    expect(board.board!.queryTime.hour).toBe(9);
  });
});
