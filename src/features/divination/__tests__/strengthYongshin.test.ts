// V3 §11–§16 — 강약/용신 STRUCTURAL PREPARATION + DOCTRINE BLOCKER.
//
// This file previously asserted the V2 behaviour: four factors voted, thresholds produced one of seven labels,
// and 용신 was looked up off that label. The re-audit rejected that architecture, so these tests were rewritten
// rather than kept passing — per §1, tests that encode the old architecture do not get optimized around.
//
// What is locked here now:
//   · every structural factor is still computed and still individually observable (nothing was deleted)
//   · the CLASS is withheld with a named, actionable blocker — not silently omitted, not guessed
//   · no 용신 is fabricated from a withheld class, and nothing downstream flips on it (§16)
//   · the real paid path still reaches this module and still cites the structure as user-visible evidence
import { createHash } from 'crypto';

import type { BirthInfoDraft, ConsultationDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { buildConsultationGrounding } from '@/features/chat/services/consultationGrounding';
import {
  judgeDayMasterStrength, judgeYongshin, luckElementEffect,
  STRENGTH_LABEL, type StrengthInput,
} from '@/features/divination';

const digestProvider: DigestProvider = {
  async sha256Utf8(input: string): Promise<string> {
    return createHash('sha256').update(input, 'utf8').digest('hex');
  },
};
const NOW = Math.floor(Date.UTC(2026, 2, 10, 1, 0, 0) / 1000);

const base = (over: Partial<StrengthInput> = {}): StrengthInput => ({
  dayMaster: 'GAP' as StrengthInput['dayMaster'],
  dayMasterElement: 'WOOD',
  seasonalPhase: '왕', inCommand: true,
  rootPositions: ['DAY'], peerHiddenPositions: ['YEAR'],
  visibleSupportPositions: ['MONTH'], visibleDrainPositions: [],
  supportRevealed: true, hourKnown: true,
  ...over,
});

describe('강약 — every structural factor is still computed and independently observable', () => {
  it('월령 moves its own factor (both directions), with named evidence', () => {
    const strong = judgeDayMasterStrength(base({ seasonalPhase: '왕', inCommand: true }));
    const weak = judgeDayMasterStrength(base({ seasonalPhase: '사', inCommand: false }));
    expect(strong.monthCommandEffect).toBe('SUPPORT');
    expect(weak.monthCommandEffect).toBe('DRAIN');
    expect(weak.weakeningEvidence.some((e) => e.fact.includes('월령'))).toBe(true);
  });

  it('통근 moves its own factor, and 무통근 is stated as weakening evidence', () => {
    const rooted = judgeDayMasterStrength(base({ rootPositions: ['DAY', 'MONTH'] }));
    const rootless = judgeDayMasterStrength(base({ rootPositions: [], peerHiddenPositions: [] }));
    expect(rooted.rootingEffect).toBe('SUPPORT');
    expect(rootless.rootingEffect).toBe('DRAIN');
    expect(rootless.weakeningEvidence.some((e) => e.fact.includes('무통근'))).toBe(true);
  });

  it('득지 stays DISTINCT from 통근 (the rejected build conflated them)', () => {
    const seated = judgeDayMasterStrength(base({ rootPositions: [], peerHiddenPositions: ['YEAR'] }));
    expect(seated.rootingEffect).toBe('DRAIN'); // 통근 is same-干 only — 득지 does not satisfy it
    expect(seated.supportingEvidence.some((e) => e.fact.includes('득지'))).toBe(true);
  });

  it('구성 (천간 아군/타군) moves its own factor', () => {
    const supported = judgeDayMasterStrength(base({ visibleSupportPositions: ['MONTH', 'HOUR'], visibleDrainPositions: [] }));
    const drained = judgeDayMasterStrength(base({ visibleSupportPositions: [], visibleDrainPositions: ['MONTH', 'HOUR', 'YEAR'] }));
    expect(supported.compositionEffect).toBe('SUPPORT');
    expect(drained.compositionEffect).toBe('DRAIN');
  });

  it('투간 is recorded as a structural modifier', () => {
    expect(judgeDayMasterStrength(base({ supportRevealed: true })).structuralModifiers.join()).toMatch(/투간/);
    expect(judgeDayMasterStrength(base({ supportRevealed: false })).structuralModifiers.join()).not.toMatch(/투간/);
  });

  it('names the structural SHAPE where the classical texts disagree, instead of grading it', () => {
    const surface = judgeDayMasterStrength(base({ seasonalPhase: '왕', inCommand: true, rootPositions: [], peerHiddenPositions: [] }));
    expect(surface.structuralModifiers.join()).toMatch(/득령·무근/);
    const inner = judgeDayMasterStrength(base({ seasonalPhase: '사', inCommand: false, rootPositions: ['DAY'], peerHiddenPositions: ['YEAR'] }));
    expect(inner.structuralModifiers.join()).toMatch(/실령·유근/);
  });

  it('unknown birth hour degrades confidence honestly', () => {
    expect(judgeDayMasterStrength(base({ hourKnown: false })).ambiguities.join()).toMatch(/시주/);
  });
});

describe('§13 — the CLASS is withheld with a named blocker, never guessed and never silently dropped', () => {
  it('no chart shape produces a 신강/신약 label', () => {
    const inputs = [
      base(),
      base({ seasonalPhase: '왕', inCommand: true, rootPositions: ['DAY', 'MONTH'], peerHiddenPositions: ['YEAR'], visibleSupportPositions: ['MONTH', 'HOUR'] }),
      base({ seasonalPhase: '사', inCommand: false, rootPositions: [], peerHiddenPositions: [], visibleSupportPositions: [], visibleDrainPositions: ['YEAR', 'MONTH', 'HOUR'] }),
      base({ seasonalPhase: '휴', inCommand: null, rootPositions: [], peerHiddenPositions: ['YEAR'] }),
    ];
    for (const i of inputs) {
      const j = judgeDayMasterStrength(i);
      expect(j.classification).toBe('UNDETERMINED');
      expect(j.label).not.toMatch(/^극?신[강약]$/);
    }
  });

  it('the blocker is ACTIONABLE — it names what doctrine is missing', () => {
    const j = judgeDayMasterStrength(base());
    expect(j.classificationBlocker).toBeTruthy();
    expect(j.classificationBlocker!).toMatch(/월령/);
    expect(j.classificationBlocker!).toMatch(/통근/);
    expect(j.classificationBlocker!).toMatch(/학파/);
    expect(STRENGTH_LABEL.UNDETERMINED).toMatch(/보류/);
  });

  it('the blocker is distinct from chart AMBIGUITY (our gap vs the chart\'s tension)', () => {
    const clean = judgeDayMasterStrength(base({ seasonalPhase: '왕', inCommand: true, rootPositions: ['DAY'], peerHiddenPositions: ['YEAR'], visibleSupportPositions: ['MONTH'], visibleDrainPositions: [] }));
    expect(clean.classificationBlocker).toBeTruthy();       // the doctrine gap is always present…
    expect(clean.ambiguities).toHaveLength(0);              // …but this chart itself is not conflicted
    const conflicted = judgeDayMasterStrength(base({ seasonalPhase: '사', inCommand: false, visibleSupportPositions: ['MONTH'] }));
    expect(conflicted.ambiguities.length).toBeGreaterThan(0);
  });

  it('declares the block in provenance so it cannot ship unnoticed', () => {
    const p = judgeDayMasterStrength(base()).doctrineProvenance.join();
    expect(p).toMatch(/eokbu-structural/);
    expect(p).toMatch(/BLOCKED/);
    expect(p).toMatch(/M-18/); // the owner's own analysis reaches the same conclusion
  });
});

describe('§15/§16 — 용신 is not fabricated from a withheld class, and nothing downstream flips on it', () => {
  const counts = { WOOD: 2, FIRE: 1, EARTH: 2, METAL: 1, WATER: 2 };
  const yongshinFor = (over: Partial<StrengthInput> = {}) => judgeYongshin({
    strength: judgeDayMasterStrength(base(over)),
    dayMasterElement: 'WOOD', elementCounts: counts, extremeSeason: null,
  });

  it('no 용신 element is named while the class is withheld', () => {
    expect(yongshinFor().primaryYongshin).toBeNull();
    expect(yongshinFor({ seasonalPhase: '사', inCommand: false, rootPositions: [], peerHiddenPositions: [] }).primaryYongshin).toBeNull();
  });

  it('says WHY, and points at the prerequisite rather than at the chart', () => {
    const y = yongshinFor();
    expect(y.basis).toMatch(/강약 판정이 보류/);
    expect(y.doctrineProvenance.join()).toMatch(/BLOCKED/);
    expect(y.confidence).toBe('LOW');
  });

  it('still carries the structural read forward (preparation is not thrown away)', () => {
    const y = yongshinFor({ seasonalPhase: '왕', inCommand: true, rootPositions: [], peerHiddenPositions: [] });
    expect(y.structuralReasoningReferences.join()).toMatch(/월령/);
    expect(y.structuralReasoningReferences.join()).toMatch(/득령·무근/);
  });

  it('§16 — an unsafe 용신 cannot flip a luck cycle: every incoming element stays NEUTRAL', () => {
    const y = yongshinFor();
    for (const el of ['WOOD', 'FIRE', 'EARTH', 'METAL', 'WATER'] as const) {
      expect(luckElementEffect(y, 'WOOD', el).effect).toBe('NEUTRAL');
    }
    expect(luckElementEffect(y, 'WOOD', 'FIRE').why).toMatch(/단정하지 않습니다/);
  });

  it('does not smuggle 조후 in as a replacement primary (§12)', () => {
    const y = judgeYongshin({
      strength: judgeDayMasterStrength(base()),
      dayMasterElement: 'WOOD', elementCounts: counts, extremeSeason: '한랭',
    });
    expect(y.primaryYongshin).toBeNull();
    expect(y.basis).not.toMatch(/조후/);
  });
});

describe('REAL RUNTIME — the structure reaches the paid consultation without a fabricated verdict', () => {
  const birth = {
    displayName: 'A', gender: 'male', calendarType: 'solar', lunarMonthType: null,
    birthYear: '1990', birthMonth: '8', birthDay: '15',
    birthTimeAccuracy: 'exact', birthHour: '14', birthMinute: '0',
    approximateTimePeriod: null, birthPlace: '서울',
  } as unknown as BirthInfoDraft;

  const groundingFor = async (question: string) => {
    const draft: ConsultationDraft = { subject: { id: 'self', displayName: 'A', relationship: null }, birthInfo: birth };
    const g = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: NOW }, question);
    if (g.status !== 'available' || !g.divinationVerdict) throw new Error('expected verdict');
    return g.divinationVerdict;
  };

  it('the Myungri judgment consumes the strength structure via Structural V2 (live-pipeline integration)', async () => {
    // Was '일간 강약·용신(판정 보류)' (permanently BLOCKED) before Structural V2 and then Yongshin V1
    // were wired into reasoning/myungriReasoner.ts — both 강약 and 억부용신 are now REAL, live-computed
    // structural readings for a real chart with real relation/ten-god data, not a permanent withhold.
    const v = await groundingFor('올해 돈을 벌 수 있을까요?');
    const myungri = v.disciplineJudgments.find((j) => j.discipline === 'MYUNGRI')!;
    expect(myungri.factGroupsUsed).toEqual(expect.arrayContaining(['일간 강약(구조)', '억부용신(구조)']));
  });

  it('no 신강/신약 verdict word is emitted to the paying user', async () => {
    const serialized = JSON.stringify(await groundingFor('올해 돈을 벌 수 있을까요?'));
    expect(serialized).not.toMatch(/극?신강|극?신약|중화신/);
  });

  it('the OLD rejected candidate is still NOT the source', async () => {
    const serialized = JSON.stringify(await groundingFor('올해 돈을 벌 수 있을까요?'));
    expect(serialized).not.toMatch(/evaluateNatalStrength|buildCurrentStrengthContext/);
  });
});
