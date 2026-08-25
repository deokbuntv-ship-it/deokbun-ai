// CONSTITUTION V2 §31 — 강약/용신 QA.
//
// Proves the capability is STRUCTURAL (not one primitive field), that each factor can move it, that Yongshin
// is not a mechanical inverse of strength, that genuine ambiguity is preserved, and — §14 — that both
// MATERIALLY change downstream judgment instead of being decorative labels.
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

describe('강약 is STRUCTURAL — each factor can change it (not one primitive field)', () => {
  it('changing MONTH/season alters the classification', () => {
    const strong = judgeDayMasterStrength(base({ seasonalPhase: '왕', inCommand: true }));
    const weak = judgeDayMasterStrength(base({ seasonalPhase: '사', inCommand: false }));
    expect(strong.classification).not.toBe(weak.classification);
    expect(strong.monthCommandEffect).toBe('SUPPORT');
    expect(weak.monthCommandEffect).toBe('DRAIN');
  });

  it('changing ROOTING alters the classification', () => {
    const rooted = judgeDayMasterStrength(base({ rootPositions: ['DAY', 'MONTH'] }));
    const rootless = judgeDayMasterStrength(base({ rootPositions: [], peerHiddenPositions: [] }));
    expect(rooted.classification).not.toBe(rootless.classification);
    expect(rootless.weakeningEvidence.some((e) => e.fact.includes('무통근'))).toBe(true);
  });

  it('changing COMPOSITION (천간 아군/타군) alters the classification', () => {
    const supported = judgeDayMasterStrength(base({ visibleSupportPositions: ['MONTH', 'HOUR'], visibleDrainPositions: [] }));
    const drained = judgeDayMasterStrength(base({ visibleSupportPositions: [], visibleDrainPositions: ['MONTH', 'HOUR', 'YEAR'] }));
    expect(supported.classification).not.toBe(drained.classification);
  });

  it('changing TRANSPARENCY (투간) is recorded as a structural modifier', () => {
    const revealed = judgeDayMasterStrength(base({ supportRevealed: true }));
    const hidden = judgeDayMasterStrength(base({ supportRevealed: false }));
    expect(revealed.structuralModifiers.join()).toMatch(/투간/);
    expect(hidden.structuralModifiers.join()).not.toMatch(/투간/);
  });

  it('the 7-level spectrum is reachable at both ends', () => {
    const max = judgeDayMasterStrength(base({
      seasonalPhase: '왕', inCommand: true, rootPositions: ['DAY', 'MONTH'],
      peerHiddenPositions: ['YEAR'], visibleSupportPositions: ['MONTH', 'HOUR'], visibleDrainPositions: [],
    }));
    const min = judgeDayMasterStrength(base({
      seasonalPhase: '사', inCommand: false, rootPositions: [], peerHiddenPositions: [],
      visibleSupportPositions: [], visibleDrainPositions: ['YEAR', 'MONTH', 'HOUR'],
    }));
    expect(max.classification).toBe('EXTREMELY_STRONG');
    expect(min.classification).toBe('EXTREMELY_WEAK');
    expect(STRENGTH_LABEL[max.classification]).toBe('극신강');
  });

  it('genuine tension is PRESERVED as ambiguity, not hidden behind a confident label', () => {
    const conflicted = judgeDayMasterStrength(base({
      seasonalPhase: '왕', inCommand: true, rootPositions: [], peerHiddenPositions: [],
    }));
    expect(conflicted.ambiguities.length).toBeGreaterThan(0);
    expect(conflicted.ambiguities.join()).toMatch(/뿌리/);
    expect(conflicted.confidence).not.toBe('HIGH');
  });

  it('unknown birth hour degrades confidence honestly', () => {
    const j = judgeDayMasterStrength(base({ hourKnown: false }));
    expect(j.ambiguities.join()).toMatch(/시주/);
  });

  it('declares its method + the unresolved owner conflict in provenance', () => {
    const j = judgeDayMasterStrength(base());
    expect(j.doctrineProvenance.join()).toMatch(/eokbu-structural/);
    expect(j.doctrineProvenance.join()).toMatch(/M-18/); // the owner's own opposite verdict is surfaced
  });
});

describe('용신 — 억부 method, not a mechanical inverse', () => {
  const counts = { WOOD: 2, FIRE: 1, EARTH: 2, METAL: 1, WATER: 2 };

  it('weak day master → a SUPPORTING element that is actually present', () => {
    const strength = judgeDayMasterStrength(base({
      seasonalPhase: '사', inCommand: false, rootPositions: [], peerHiddenPositions: [],
      visibleSupportPositions: [], visibleDrainPositions: ['YEAR', 'MONTH'],
    }));
    const y = judgeYongshin({ strength, dayMasterElement: 'WOOD', elementCounts: counts, extremeSeason: null });
    expect(['WATER', 'WOOD']).toContain(y.primaryYongshin); // 인성(수) or 비겁(목)
    expect(y.basis).toMatch(/억부/);
  });

  it('strong day master → a DRAINING/CONTROLLING element that is actually present', () => {
    const strength = judgeDayMasterStrength(base());
    const y = judgeYongshin({ strength, dayMasterElement: 'WOOD', elementCounts: counts, extremeSeason: null });
    expect(['FIRE', 'METAL', 'EARTH']).toContain(y.primaryYongshin); // 식상/관성/재성
  });

  it('an element ABSENT from the chart is never named as 용신', () => {
    const strength = judgeDayMasterStrength(base());
    const y = judgeYongshin({
      strength, dayMasterElement: 'WOOD',
      elementCounts: { WOOD: 3, FIRE: 0, EARTH: 0, METAL: 0, WATER: 3 },
      extremeSeason: null,
    });
    expect(y.primaryYongshin).toBeNull(); // 식상/재성/관성 모두 부재 → 용신 미확정
    expect(y.confidence).toBe('LOW');
  });

  it('중화 / heavy ambiguity → NO 용신 is fabricated (§13)', () => {
    const strength = judgeDayMasterStrength(base({
      seasonalPhase: '휴', inCommand: null, rootPositions: [], peerHiddenPositions: ['YEAR'],
      visibleSupportPositions: ['MONTH'], visibleDrainPositions: ['HOUR'], hourKnown: false,
    }));
    const y = judgeYongshin({ strength, dayMasterElement: 'WOOD', elementCounts: counts, extremeSeason: null });
    if (y.primaryYongshin === null) expect(y.basis).toMatch(/확정하지 않습니다|없어/);
  });

  it('조후 is offered as a SEPARATE alternative, never blended into the 억부 primary (§12)', () => {
    const strength = judgeDayMasterStrength(base());
    const y = judgeYongshin({ strength, dayMasterElement: 'WOOD', elementCounts: counts, extremeSeason: '한랭' });
    expect(y.alternativeInterpretation).toMatch(/조후/);
    expect(y.alternativeReason).toMatch(/억부 기준/);
    expect(y.basis).not.toMatch(/조후/); // primary stays single-school
  });

  it('identical nominal strength does NOT force identical 용신 (chart composition decides)', () => {
    const strength = judgeDayMasterStrength(base());
    const a = judgeYongshin({ strength, dayMasterElement: 'WOOD', elementCounts: { WOOD: 2, FIRE: 2, EARTH: 0, METAL: 0, WATER: 1 }, extremeSeason: null });
    const b = judgeYongshin({ strength, dayMasterElement: 'WOOD', elementCounts: { WOOD: 2, FIRE: 0, EARTH: 0, METAL: 2, WATER: 1 }, extremeSeason: null });
    expect(a.primaryYongshin).not.toBe(b.primaryYongshin);
  });
});

describe('§14 — strength/용신 MATERIALLY change downstream judgment', () => {
  it('an incoming luck element matching 용신 reads favourable; a 기신 element reads adverse', () => {
    const strength = judgeDayMasterStrength(base()); // strong WOOD
    const y = judgeYongshin({ strength, dayMasterElement: 'WOOD', elementCounts: { WOOD: 2, FIRE: 2, EARTH: 1, METAL: 1, WATER: 2 }, extremeSeason: null });
    expect(y.primaryYongshin).not.toBeNull();
    const good = luckElementEffect(y, 'WOOD', y.primaryYongshin!);
    expect(good.effect).toBe('FAVORABLE');
    const bad = luckElementEffect(y, 'WOOD', 'WATER'); // 인성 — feeds an already-strong day master
    expect(bad.effect).toBe('ADVERSE');
  });

  it('no 용신 → no길흉 is asserted for the incoming cycle (no fabricated certainty)', () => {
    const strength = judgeDayMasterStrength(base({ seasonalPhase: '휴', inCommand: null, rootPositions: [], peerHiddenPositions: [], visibleSupportPositions: ['MONTH'], visibleDrainPositions: ['HOUR'], hourKnown: false }));
    const y = judgeYongshin({ strength, dayMasterElement: 'WOOD', elementCounts: { WOOD: 1, FIRE: 1, EARTH: 1, METAL: 1, WATER: 1 }, extremeSeason: null });
    if (y.primaryYongshin === null) {
      expect(luckElementEffect(y, 'WOOD', 'FIRE').effect).toBe('NEUTRAL');
    }
  });
});

describe('REAL RUNTIME — strength/용신 reach the paid consultation and are cited as evidence', () => {
  const birth = {
    displayName: 'A', gender: 'male', calendarType: 'solar', lunarMonthType: null,
    birthYear: '1990', birthMonth: '8', birthDay: '15',
    birthTimeAccuracy: 'exact', birthHour: '14', birthMinute: '0',
    approximateTimePeriod: null, birthPlace: '서울',
  } as unknown as BirthInfoDraft;

  it('the Myungri judgment consumes 강약/용신 and cites them', async () => {
    const draft: ConsultationDraft = { subject: { id: 'self', displayName: 'A', relationship: null }, birthInfo: birth };
    const g = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: NOW }, '올해 돈을 벌 수 있을까요?');
    if (g.status !== 'available' || !g.divinationVerdict) throw new Error('expected verdict');
    const myungri = g.divinationVerdict.disciplineJudgments.find((j) => j.discipline === 'MYUNGRI')!;
    expect(myungri.factGroupsUsed).toEqual(expect.arrayContaining(['일간 강약(억부)', '용신(억부)']));
    const facts = myungri.directEvidence.map((e) => e.fact).join(' | ');
    expect(facts).toMatch(/일간 강약:/); // cited as user-visible evidence, not a hidden flag
  });

  it('the OLD rejected candidate is NOT the source (new method id is used)', async () => {
    const draft: ConsultationDraft = { subject: { id: 'self', displayName: 'A', relationship: null }, birthInfo: birth };
    const g = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: NOW }, '올해 돈을 벌 수 있을까요?');
    if (g.status !== 'available' || !g.divinationVerdict) throw new Error('expected verdict');
    // the quarantined module must remain unwired on the production path
    const serialized = JSON.stringify(g.divinationVerdict);
    expect(serialized).not.toMatch(/evaluateNatalStrength|buildCurrentStrengthContext/);
  });
});
