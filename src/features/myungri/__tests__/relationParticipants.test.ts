// Relation PARTICIPANT LINKAGE — deterministic FACT only. DETECTION != EFFECT: this suite exists
// specifically to prove no forbidden effect/transformation field is ever emitted.
import { calculateRelationParticipants, type NatalPillarContext } from '../index';

// 甲 일간. 戊申년 丙子월 甲寅일 己辰시.
//   YEAR(申)-DAY(寅): 寅申沖 (BRANCH_CLASH).
//   YEAR(申)-MONTH(子), YEAR(申)-HOUR(辰), MONTH(子)-HOUR(辰): all pairs within 申子辰 → half-harmony.
//   {申,子,辰} present together → FULL 三合(申子辰, water) SET relation.
//   DAY(甲)-HOUR(己): 甲己 STEM_COMBINATION (nominal transform EARTH).
const RICH_NATAL: NatalPillarContext = {
  dayMaster: 'JIA',
  pillars: {
    year: { stem: 'WU', branch: 'SHEN' },
    month: { stem: 'BING', branch: 'ZI' },
    day: { stem: 'JIA', branch: 'YIN' },
    hour: { stem: 'JI', branch: 'CHEN' },
  },
};

describe('calculateRelationParticipants', () => {
  const r = calculateRelationParticipants(RICH_NATAL);
  if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');

  it('7. branch clash detection links the EXACT participating branches/pillars', () => {
    const clash = r.branchPair.find((x) => x.relation.kind === 'BRANCH_CLASH')!;
    expect(clash).toBeDefined();
    expect(clash.participantPillars.slice().sort()).toEqual(['DAY', 'YEAR'].sort());
    expect(clash.participantBranches.slice().sort()).toEqual(['SHEN', 'YIN'].sort());
  });

  it('8. detected clash does NOT emit a root-destroyed (or any effect) fact', () => {
    const clash = r.branchPair.find((x) => x.relation.kind === 'BRANCH_CLASH')! as unknown as Record<string, unknown>;
    expect(clash.rootDestroyed).toBeUndefined();
    expect(clash.rootWeakened).toBeUndefined();
    expect(clash.effect).toBeUndefined();
    expect(clash.functionalEffect).toBeUndefined();
    // the clash DOES correctly report a co-located root candidate id (DAY/寅 hosts the 甲 root) —
    // that is participant LINKAGE, not an effect judgment; the id says nothing about the root's fate.
    const clashParticipants = r.branchPair.find((x) => x.relation.kind === 'BRANCH_CLASH')!;
    expect(clashParticipants.candidateAffectedRootFactIds.some((id) => id.includes(':YIN:'))).toBe(true);
  });

  it('9. 三合 (full set) detection does NOT emit a transformed-bureau fact', () => {
    const sanhap = r.branchSet.find((x) => x.relation.kind === 'BRANCH_THREE_HARMONY');
    expect(sanhap).toBeDefined();
    expect(sanhap!.participantBranches.slice().sort()).toEqual(['CHEN', 'SHEN', 'ZI'].sort());
    const asRecord = sanhap as unknown as Record<string, unknown>;
    expect(asRecord.bureauFormed).toBeUndefined();
    expect(asRecord.transformed).toBeUndefined();
    expect(asRecord.structuralElement).toBeUndefined();
  });

  it('10. 육합/반합 detection does NOT emit a transformation (化) fact', () => {
    const halfHarmony = r.branchPair.filter((x) => x.relation.kind === 'BRANCH_HALF_THREE_HARMONY');
    expect(halfHarmony.length).toBeGreaterThan(0);
    for (const h of halfHarmony) {
      const asRecord = h as unknown as Record<string, unknown>;
      expect(asRecord.transformed).toBeUndefined();
      expect(asRecord.huaCheng).toBeUndefined();
      expect(asRecord.combinationSuccessful).toBeUndefined();
    }
  });

  it('11. stem combination (天干合) detection does NOT emit a transformation-successful fact', () => {
    const stemCombo = r.stem.find((x) => x.relation.kind === 'STEM_COMBINATION')!;
    expect(stemCombo).toBeDefined();
    expect(stemCombo.participantPillars.slice().sort()).toEqual(['DAY', 'HOUR'].sort());
    expect(stemCombo.participantStems.slice().sort()).toEqual(['JI', 'JIA'].sort());
    // the raw relation carries only the NOMINAL transform element (already labeled nominal by
    // pillarRelations.ts itself) — never an assertion that transformation actually completed.
    expect(stemCombo.relation.kind).toBe('STEM_COMBINATION');
    const asRecord = stemCombo as unknown as Record<string, unknown>;
    expect(asRecord.transformationSuccessful).toBeUndefined();
    expect(asRecord.huaChengLi).toBeUndefined();
  });

  it('fact output does not contain any strength/special-pattern/Yongshin language', () => {
    const json = JSON.stringify(r);
    expect(json).not.toMatch(/WEAK|STRONG|극신약|신약|중화|신강|극신강|SPECIAL_PATTERN|YONGSHIN|從强|從財/);
  });

  it('ruleVersion + fail-closed on invalid natal', () => {
    expect(r.ruleVersion).toBe('deokbunai.myungri-relation-participants.v1');
    const bad = calculateRelationParticipants({ dayMaster: 'JIA', pillars: {} as never });
    expect(bad.capability).toBe('UNAVAILABLE');
  });
});
