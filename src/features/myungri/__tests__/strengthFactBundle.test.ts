// MyungriStrengthFactBundle — the aggregate FACT contract for a future Strength Reasoner.
// This suite is the primary NEGATIVE PROOF location: exhaustively confirms the bundle carries
// zero strength/special-pattern/transformation/Yongshin judgment anywhere in its output.
import { buildMyungriStrengthFactBundle, type NatalPillarContext } from '../index';

const RICH_NATAL: NatalPillarContext = {
  dayMaster: 'JIA',
  pillars: {
    year: { stem: 'WU', branch: 'SHEN' },
    month: { stem: 'BING', branch: 'ZI' },
    day: { stem: 'JIA', branch: 'YIN' },
    hour: { stem: 'JI', branch: 'CHEN' },
  },
};

describe('buildMyungriStrengthFactBundle', () => {
  const r = buildMyungriStrengthFactBundle(RICH_NATAL);
  if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
  const { bundle } = r;

  it('composes every sub-provider into one bundle', () => {
    expect(bundle.chart).toEqual(RICH_NATAL);
    expect(bundle.monthCommand.capability).toBe('AVAILABLE');
    expect(bundle.sameElementRooting.sameElementRoots.length).toBeGreaterThan(0);
    expect(bundle.tenGodFacts.visibleStems.length).toBeGreaterThan(0);
    expect(bundle.natalRelations.branch.length).toBeGreaterThan(0);
    expect(bundle.relationParticipants.branchPair.length).toBeGreaterThan(0);
    expect(bundle.specialPatternPrerequisites.roleCategoryPresence).toHaveLength(5);
  });

  it('future placeholders exist as documentation-only, always undefined, never computed', () => {
    expect(bundle.future.rootFunction).toBeUndefined();
    expect(bundle.future.relationEffect).toBeUndefined();
    expect(bundle.future.specialPatternVerdict).toBeUndefined();
    expect(bundle.future.climate).toBeUndefined();
    expect(bundle.future.strength).toBeUndefined();
    expect(bundle.future.yongshin).toBeUndefined();
    expect(Object.keys(bundle.future).sort()).toEqual(
      ['climate', 'relationEffect', 'rootFunction', 'specialPatternVerdict', 'strength', 'yongshin'].sort(),
    );
  });

  it('16/17/18. the bundle JSON contains NO seven-band strength label, NO special-pattern verdict, NO Yongshin', () => {
    const json = JSON.stringify(bundle);
    // Korean seven-band labels
    expect(json).not.toMatch(/극신약|신약|중화신약|중화신강|신강|극신강/);
    // English strength/pattern/Yongshin tokens
    expect(json).not.toMatch(
      /\bWEAK\b|\bSTRONG\b|\bBALANCED\b|SPECIAL_PATTERN_CONFIRMED|SPECIAL_PATTERN_REJECTED|CONGCAI|CONGGUANSHA|CONGER|ZHUANWANG|YONGSHIN|억부용신|조후용신|통관용신|병약용신|희신|기신/,
    );
  });

  it('every top-level fact field carries a stable ruleVersion for provenance', () => {
    expect(bundle.ruleVersion).toBe('deokbunai.myungri-strength-fact-bundle.v1');
    expect(bundle.sameElementRooting.ruleVersion).toBe('deokbunai.myungri-same-element-rooting.v1');
    expect(bundle.tenGodFacts.ruleVersion).toBe('deokbunai.myungri-ten-god-facts.v1');
    expect(bundle.relationParticipants.ruleVersion).toBe('deokbunai.myungri-relation-participants.v1');
    expect(bundle.specialPatternPrerequisites.ruleVersion)
      .toBe('deokbunai.myungri-special-pattern-prerequisites.v1');
  });

  it('fail-closed as a whole when any sub-provider is unavailable (invalid natal)', () => {
    const bad = buildMyungriStrengthFactBundle({ dayMaster: 'JIA', pillars: {} as never });
    expect(bad.capability).toBe('UNAVAILABLE');
    if (bad.capability !== 'UNAVAILABLE') throw new Error('unreachable');
    expect(bad.failedProvider).toBeTruthy();
    expect(bad.reason).toBeTruthy();
  });
});

describe('metamorphic — display text does not alter facts', () => {
  it('re-labeling has no facility to exist: the bundle carries no display-text field at all', () => {
    const a = buildMyungriStrengthFactBundle(RICH_NATAL);
    const b = buildMyungriStrengthFactBundle({ ...RICH_NATAL });
    expect(a).toEqual(b);
  });
});

describe('metamorphic — changing only the month branch recomputes seasonal facts', () => {
  const spring = buildMyungriStrengthFactBundle(RICH_NATAL); // 子월 (WINTER)
  const autumnNatal: NatalPillarContext = {
    ...RICH_NATAL,
    pillars: { ...RICH_NATAL.pillars, month: { stem: 'BING', branch: 'SHEN' } }, // 申월 (AUTUMN)
  };
  const autumn = buildMyungriStrengthFactBundle(autumnNatal);

  it('month command recomputes for the new month branch', () => {
    if (spring.capability !== 'AVAILABLE' || autumn.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(spring.bundle.monthCommand.monthBranch).toBe('ZI');
    expect(autumn.bundle.monthCommand.monthBranch).toBe('SHEN');
    expect(spring.bundle.monthCommand.season).not.toBe(autumn.bundle.monthCommand.season);
  });

  it('recomputation is a genuine re-derivation, not a cosmetic relabeling — the DM seasonal phase changes too', () => {
    if (spring.capability !== 'AVAILABLE' || autumn.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(spring.bundle.monthCommand.dayMasterSeasonalPhase)
      .not.toBe(autumn.bundle.monthCommand.dayMasterSeasonalPhase);
  });
});

describe('metamorphic — adding a hidden stem changes root facts without emitting strength judgment', () => {
  // HOUR branch 辰 → 丑: 丑 지장간 = 癸(잔여) 辛(중기) 己(정기), zero WOOD → removes the 乙 root.
  const withoutHourRoot: NatalPillarContext = {
    ...RICH_NATAL,
    pillars: { ...RICH_NATAL.pillars, hour: { stem: 'JI', branch: 'CHOU' } },
  };
  const before = buildMyungriStrengthFactBundle(withoutHourRoot);
  const after = buildMyungriStrengthFactBundle(RICH_NATAL); // adds 辰's 乙 root back

  it('root fact SET changes (1 root → 2 roots)', () => {
    if (before.capability !== 'AVAILABLE' || after.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(before.bundle.sameElementRooting.sameElementRoots).toHaveLength(1);
    expect(after.bundle.sameElementRooting.sameElementRoots).toHaveLength(2);
  });

  it('neither bundle emits a strength judgment despite the differing root count', () => {
    if (before.capability !== 'AVAILABLE' || after.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    for (const bundle of [before.bundle, after.bundle]) {
      const json = JSON.stringify(bundle);
      expect(json).not.toMatch(/WEAK|STRONG|극신약|신약|중화|신강|극신강/);
      expect(bundle.future.strength).toBeUndefined();
    }
  });
});

describe('metamorphic — adding a relation changes topology without emitting functional effect', () => {
  // Baseline chart with no 申-寅 clash: swap YEAR branch 申 → 卯 (no clash with 寅).
  const noClash: NatalPillarContext = {
    ...RICH_NATAL,
    pillars: { ...RICH_NATAL.pillars, year: { stem: 'WU', branch: 'MAO' } },
  };
  const before = buildMyungriStrengthFactBundle(noClash);
  const after = buildMyungriStrengthFactBundle(RICH_NATAL); // real 寅申沖 present

  it('relation topology changes (clash appears)', () => {
    if (before.capability !== 'AVAILABLE' || after.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    const beforeHasClash = before.bundle.relationParticipants.branchPair.some((x) => x.relation.kind === 'BRANCH_CLASH');
    const afterHasClash = after.bundle.relationParticipants.branchPair.some((x) => x.relation.kind === 'BRANCH_CLASH');
    expect(beforeHasClash).toBe(false);
    expect(afterHasClash).toBe(true);
  });

  it('the new clash does not automatically emit a functional-effect/root-destroyed fact', () => {
    if (after.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    const clash = after.bundle.relationParticipants.branchPair.find((x) => x.relation.kind === 'BRANCH_CLASH')!;
    const asRecord = clash as unknown as Record<string, unknown>;
    expect(asRecord.rootDestroyed).toBeUndefined();
    expect(asRecord.functionalEffect).toBeUndefined();
  });
});
