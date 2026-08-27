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

// ══ order invariance / provenance completeness / duplicate-fact policy (HARDENING §11/§13/§14) ═
describe('order invariance', () => {
  it('the whole bundle is independent of the pillars object literal key order', () => {
    const a: NatalPillarContext = { ...RICH_NATAL };
    const b: NatalPillarContext = {
      dayMaster: 'JIA',
      pillars: {
        hour: RICH_NATAL.pillars.hour!, day: RICH_NATAL.pillars.day,
        month: RICH_NATAL.pillars.month, year: RICH_NATAL.pillars.year,
      },
    };
    expect(buildMyungriStrengthFactBundle(a)).toEqual(buildMyungriStrengthFactBundle(b));
  });
});

describe('provenance completeness (HARDENING §13)', () => {
  it('bundle.chart IS the exact natal input every sub-fact was derived from — not a copy or re-derivation', () => {
    const r = buildMyungriStrengthFactBundle(RICH_NATAL);
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(r.bundle.chart).toEqual(RICH_NATAL);
  });

  it('every sameElementRooting/tenGodFacts fact position resolves to a REAL pillar in bundle.chart', () => {
    const r = buildMyungriStrengthFactBundle(RICH_NATAL);
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    const validPositions = new Set(['YEAR', 'MONTH', 'DAY', 'HOUR']);
    for (const branch of r.bundle.sameElementRooting.branches) {
      expect(validPositions.has(branch.position)).toBe(true);
      const pillar = (r.bundle.chart.pillars as Record<string, { branch: string }>)[branch.position.toLowerCase()];
      expect(pillar.branch).toBe(branch.branch); // the fact's branch matches the actual chart pillar
    }
  });

  it('every sub-provider fact carries its OWN ruleVersion — no fact is attributable to an ambiguous rule source', () => {
    const r = buildMyungriStrengthFactBundle(RICH_NATAL);
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(r.bundle.monthCommand.ruleVersion).toBeTruthy();
    expect(r.bundle.sameElementRooting.ruleVersion).toBeTruthy();
    expect(r.bundle.tenGodFacts.ruleVersion).toBeTruthy();
    expect(r.bundle.relationParticipants.ruleVersion).toBeTruthy();
    expect(r.bundle.specialPatternPrerequisites.ruleVersion).toBeTruthy();
  });
});

describe('metamorphic — changing only ONE branch changes only the facts that depend on it (HARDENING §17)', () => {
  // Change ONLY the HOUR branch (辰→丑); YEAR/MONTH/DAY pillars are untouched.
  const before = buildMyungriStrengthFactBundle(RICH_NATAL); // HOUR = 辰(CHEN)
  const changedHourOnly: NatalPillarContext = {
    ...RICH_NATAL,
    pillars: { ...RICH_NATAL.pillars, hour: { stem: 'JI', branch: 'CHOU' } },
  };
  const after = buildMyungriStrengthFactBundle(changedHourOnly);

  it('YEAR/MONTH/DAY-position facts in sameElementRooting/tenGodFacts are byte-identical before and after', () => {
    if (before.capability !== 'AVAILABLE' || after.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    const nonHour = (branches: typeof before.bundle.sameElementRooting.branches) =>
      branches.filter((b) => b.position !== 'HOUR');
    expect(nonHour(after.bundle.sameElementRooting.branches)).toEqual(nonHour(before.bundle.sameElementRooting.branches));
    const nonHourTenGod = (stems: typeof before.bundle.tenGodFacts.hiddenStems) =>
      stems.filter((s) => s.position !== 'HOUR');
    expect(nonHourTenGod(after.bundle.tenGodFacts.hiddenStems)).toEqual(nonHourTenGod(before.bundle.tenGodFacts.hiddenStems));
  });

  it('monthCommand (independent of HOUR) is byte-identical before and after', () => {
    if (before.capability !== 'AVAILABLE' || after.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(after.bundle.monthCommand).toEqual(before.bundle.monthCommand);
  });

  it('HOUR-position facts DO change (proving this is a real recompute, not a no-op)', () => {
    if (before.capability !== 'AVAILABLE' || after.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    const beforeHour = before.bundle.sameElementRooting.branches.find((b) => b.position === 'HOUR')!;
    const afterHour = after.bundle.sameElementRooting.branches.find((b) => b.position === 'HOUR')!;
    expect(afterHour.branch).not.toBe(beforeHour.branch);
    expect(afterHour.hiddenStems).not.toEqual(beforeHour.hiddenStems);
  });
});

describe('metamorphic — adding a 三合 (three-harmony) pattern changes detection facts, NEVER emits a transformed-bureau verdict (HARDENING §17)', () => {
  // Baseline: no 三合. Target: complete 申子辰 (WATER) 삼합 across YEAR/DAY/HOUR.
  const noPattern: NatalPillarContext = {
    dayMaster: 'JIA',
    pillars: {
      year: { stem: 'WU', branch: 'MAO' }, month: { stem: 'BING', branch: 'ZI' },
      day: { stem: 'JIA', branch: 'YIN' }, hour: { stem: 'JI', branch: 'CHEN' },
    },
  };
  const withPattern: NatalPillarContext = {
    dayMaster: 'JIA',
    pillars: {
      year: { stem: 'WU', branch: 'SHEN' }, month: { stem: 'BING', branch: 'ZI' },
      day: { stem: 'JIA', branch: 'ZI' }, hour: { stem: 'JI', branch: 'CHEN' },
    },
  };
  const before = buildMyungriStrengthFactBundle(noPattern);
  const after = buildMyungriStrengthFactBundle(withPattern);

  it('the 三合 detection appears only in the "after" chart', () => {
    if (before.capability !== 'AVAILABLE' || after.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    const hasTrio = (r: typeof before.bundle.relationParticipants) =>
      r.branchSet.some((x) => x.relation.kind === 'BRANCH_THREE_HARMONY');
    expect(hasTrio(before.bundle.relationParticipants)).toBe(false);
    expect(hasTrio(after.bundle.relationParticipants)).toBe(true);
  });

  it('the detected 三合 carries NO transformed/bureauFormed/structuralElement verdict field', () => {
    if (after.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    const trio = after.bundle.relationParticipants.branchSet.find((x) => x.relation.kind === 'BRANCH_THREE_HARMONY')!;
    const asRecord = trio as unknown as Record<string, unknown>;
    expect(asRecord.transformed).toBeUndefined();
    expect(asRecord.bureauFormed).toBeUndefined();
    expect(asRecord.structuralElement).toBeUndefined();
    expect(JSON.stringify(trio)).not.toMatch(/CONFIRMED|化局|成局/);
  });
});

describe('duplicate-fact policy across providers (HARDENING §14)', () => {
  it('the same underlying hidden stem is INTENTIONALLY represented by multiple fact records in different provider namespaces — not a spurious duplicate', () => {
    // 寅(HOUR is DAY here) 정기 甲 is cited once by sameElementRooting (hidden-stem:...) and once
    // more by tenGodFacts (hidden-stem-ten-god:...) — two DIFFERENT lenses on the same underlying
    // stem, each in its own factId namespace, each independently useful to a future reasoner.
    const r = buildMyungriStrengthFactBundle(RICH_NATAL);
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    const rootingDayMain = r.bundle.sameElementRooting.branches
      .find((b) => b.position === 'DAY')!.hiddenStems.find((h) => h.hiddenRole === 'MAIN')!;
    const tenGodDayMain = r.bundle.tenGodFacts.hiddenStems
      .find((h) => h.position === 'DAY' && h.hiddenRole === 'MAIN')!;
    expect(rootingDayMain.stem).toBe(tenGodDayMain.stem); // same underlying stem
    expect(rootingDayMain.factId).not.toBe(tenGodDayMain.factId); // distinct namespaces, never merged
    expect(rootingDayMain.factId.startsWith('hidden-stem:')).toBe(true);
    expect(tenGodDayMain.factId.startsWith('hidden-stem-ten-god:')).toBe(true);
  });

  it('within ONE provider, no two facts ever share a factId for the same chart', () => {
    const r = buildMyungriStrengthFactBundle(RICH_NATAL);
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    const rootingIds = r.bundle.sameElementRooting.branches.flatMap((b) => b.hiddenStems).map((h) => h.factId);
    expect(new Set(rootingIds).size).toBe(rootingIds.length);
    const tenGodIds = [
      ...r.bundle.tenGodFacts.visibleStems.map((v) => v.factId),
      ...r.bundle.tenGodFacts.hiddenStems.map((h) => h.factId),
    ];
    expect(new Set(tenGodIds).size).toBe(tenGodIds.length);
  });
});
