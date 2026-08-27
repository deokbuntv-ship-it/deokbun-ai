// Relation PARTICIPANT LINKAGE — deterministic FACT only. DETECTION != EFFECT: this suite exists
// specifically to prove no forbidden effect/transformation field is ever emitted.
import {
  calculateRelationParticipants, calculateSameElementRooting, type NatalPillarContext,
} from '../index';

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

// ══ EXHAUSTIVE — every one of the 12 supported relation kinds (HARDENING §9) ═══════════════════
// STEM_COMBINATION, BRANCH_CLASH, BRANCH_HALF_THREE_HARMONY, BRANCH_THREE_HARMONY are already
// exercised above via RICH_NATAL. The remaining 8 kinds are each exercised here in a minimal,
// isolated fixture. No effect/transformation field is asserted anywhere — detection + exact
// participant identity only.
describe('EXHAUSTIVE — the remaining 8 relation kinds', () => {
  const chartWith = (
    positions: Partial<Record<'year' | 'month' | 'day' | 'hour', { stem: string; branch: string }>>,
  ): NatalPillarContext => ({
    dayMaster: 'JIA',
    pillars: {
      year: (positions.year as never) ?? { stem: 'YI', branch: 'HAI' },
      month: (positions.month as never) ?? { stem: 'YI', branch: 'HAI' },
      day: (positions.day as never) ?? { stem: 'JIA', branch: 'HAI' },
      hour: (positions.hour as never) ?? { stem: 'YI', branch: 'HAI' },
    },
  });

  it('STEM_CLASH: 甲庚 (JIA-GENG)', () => {
    const natal = chartWith({ year: { stem: 'GENG', branch: 'HAI' } });
    const r2 = calculateRelationParticipants(natal);
    if (r2.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    const clash = r2.stem.find((x) => x.relation.kind === 'STEM_CLASH')!;
    expect(clash).toBeDefined();
    expect(clash.participantStems.slice().sort()).toEqual(['GENG', 'JIA'].sort());
    expect(clash.participantPillars.slice().sort()).toEqual(['DAY', 'YEAR'].sort());
  });

  it('BRANCH_SIX_COMBINATION (육합): 子丑 (ZI-CHOU)', () => {
    const natal = chartWith({ year: { stem: 'YI', branch: 'ZI' }, month: { stem: 'YI', branch: 'CHOU' } });
    const r2 = calculateRelationParticipants(natal);
    if (r2.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    const combo = r2.branchPair.find((x) => x.relation.kind === 'BRANCH_SIX_COMBINATION')!;
    expect(combo).toBeDefined();
    expect(combo.participantBranches.slice().sort()).toEqual(['CHOU', 'ZI'].sort());
    expect(combo.participantPillars.slice().sort()).toEqual(['MONTH', 'YEAR'].sort());
  });

  it('BRANCH_PUNISHMENT (무례지형): 子卯 (ZI-MAO)', () => {
    const natal = chartWith({ year: { stem: 'YI', branch: 'ZI' }, month: { stem: 'YI', branch: 'MAO' } });
    const r2 = calculateRelationParticipants(natal);
    if (r2.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    const punishment = r2.branchPair.find((x) => x.relation.kind === 'BRANCH_PUNISHMENT')!;
    expect(punishment).toBeDefined();
    expect(punishment.participantBranches.slice().sort()).toEqual(['MAO', 'ZI'].sort());
  });

  it('BRANCH_SELF_PUNISHMENT (자형): 辰辰 (CHEN-CHEN)', () => {
    const natal = chartWith({ year: { stem: 'YI', branch: 'CHEN' }, month: { stem: 'YI', branch: 'CHEN' } });
    const r2 = calculateRelationParticipants(natal);
    if (r2.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    const selfPunishment = r2.branchPair.find((x) => x.relation.kind === 'BRANCH_SELF_PUNISHMENT')!;
    expect(selfPunishment).toBeDefined();
    expect(selfPunishment.participantBranches).toEqual(['CHEN', 'CHEN']);
    expect(selfPunishment.participantPillars.slice().sort()).toEqual(['MONTH', 'YEAR'].sort());
  });

  it('BRANCH_DESTRUCTION (파): 子酉 (ZI-YOU)', () => {
    const natal = chartWith({ year: { stem: 'YI', branch: 'ZI' }, month: { stem: 'YI', branch: 'YOU' } });
    const r2 = calculateRelationParticipants(natal);
    if (r2.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    const destruction = r2.branchPair.find((x) => x.relation.kind === 'BRANCH_DESTRUCTION')!;
    expect(destruction).toBeDefined();
    expect(destruction.participantBranches.slice().sort()).toEqual(['YOU', 'ZI'].sort());
  });

  it('BRANCH_HARM (해): 子未 (ZI-WEI)', () => {
    const natal = chartWith({ year: { stem: 'YI', branch: 'ZI' }, month: { stem: 'YI', branch: 'WEI' } });
    const r2 = calculateRelationParticipants(natal);
    if (r2.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    const harm = r2.branchPair.find((x) => x.relation.kind === 'BRANCH_HARM')!;
    expect(harm).toBeDefined();
    expect(harm.participantBranches.slice().sort()).toEqual(['WEI', 'ZI'].sort());
  });

  it('BRANCH_DIRECTIONAL_UNION (방합, full set): 寅卯辰 (YIN-MAO-CHEN)', () => {
    const natal = chartWith({
      year: { stem: 'YI', branch: 'YIN' }, month: { stem: 'YI', branch: 'MAO' }, hour: { stem: 'YI', branch: 'CHEN' },
    });
    const r2 = calculateRelationParticipants(natal);
    if (r2.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    const union = r2.branchSet.find((x) => x.relation.kind === 'BRANCH_DIRECTIONAL_UNION')!;
    expect(union).toBeDefined();
    expect(union.participantBranches.slice().sort()).toEqual(['CHEN', 'MAO', 'YIN'].sort());
    expect(union.participantPillars.slice().sort()).toEqual(['HOUR', 'MONTH', 'YEAR'].sort());
  });

  it('BRANCH_THREE_PUNISHMENT (삼형, full set): 丑戌未 (CHOU-XU-WEI)', () => {
    const natal = chartWith({
      year: { stem: 'YI', branch: 'CHOU' }, month: { stem: 'YI', branch: 'XU' }, hour: { stem: 'YI', branch: 'WEI' },
    });
    const r2 = calculateRelationParticipants(natal);
    if (r2.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    const threePunishment = r2.branchSet.find((x) => x.relation.kind === 'BRANCH_THREE_PUNISHMENT')!;
    expect(threePunishment).toBeDefined();
    expect(threePunishment.participantBranches.slice().sort()).toEqual(['CHOU', 'WEI', 'XU'].sort());
    expect(threePunishment.participantPillars.slice().sort()).toEqual(['HOUR', 'MONTH', 'YEAR'].sort());
  });

  it('none of the 8 fixtures above emit any effect/transformation field', () => {
    const fixtures: NatalPillarContext[] = [
      chartWith({ year: { stem: 'GENG', branch: 'HAI' } }),
      chartWith({ year: { stem: 'YI', branch: 'ZI' }, month: { stem: 'YI', branch: 'CHOU' } }),
      chartWith({ year: { stem: 'YI', branch: 'ZI' }, month: { stem: 'YI', branch: 'MAO' } }),
      chartWith({ year: { stem: 'YI', branch: 'CHEN' }, month: { stem: 'YI', branch: 'CHEN' } }),
      chartWith({ year: { stem: 'YI', branch: 'ZI' }, month: { stem: 'YI', branch: 'YOU' } }),
      chartWith({ year: { stem: 'YI', branch: 'ZI' }, month: { stem: 'YI', branch: 'WEI' } }),
      chartWith({ year: { stem: 'YI', branch: 'YIN' }, month: { stem: 'YI', branch: 'MAO' }, hour: { stem: 'YI', branch: 'CHEN' } }),
      chartWith({ year: { stem: 'YI', branch: 'CHOU' }, month: { stem: 'YI', branch: 'XU' }, hour: { stem: 'YI', branch: 'WEI' } }),
    ];
    for (const fixture of fixtures) {
      const result = calculateRelationParticipants(fixture);
      if (result.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
      const json = JSON.stringify(result);
      expect(json).not.toMatch(
        /transformed|transformationSucceeded|bureauFormed|rootDestroyed|rootWeakened|rootStrength|functionalEffect|strengthEffect/i,
      );
    }
  });
});

// ══ ORDER INVARIANCE (HARDENING §11) ════════════════════════════════════════════════════════════
describe('order invariance', () => {
  it('relation participant identity is independent of accidental array ordering, but pillar position is preserved', () => {
    // Two natal contexts describing the SAME chart but with pillars constructed via differently-
    // ordered object literals — JS object key order never affects downstream array iteration here
    // because every provider iterates a FIXED YEAR/MONTH/DAY/HOUR position order internally, not
    // the object's own key enumeration order. Confirms that invariant explicitly.
    const a: NatalPillarContext = {
      dayMaster: 'JIA',
      pillars: {
        hour: { stem: 'JI', branch: 'CHEN' },
        day: { stem: 'JIA', branch: 'YIN' },
        year: { stem: 'WU', branch: 'SHEN' },
        month: { stem: 'BING', branch: 'ZI' },
      } as never,
    };
    const b: NatalPillarContext = {
      dayMaster: 'JIA',
      pillars: {
        year: { stem: 'WU', branch: 'SHEN' },
        month: { stem: 'BING', branch: 'ZI' },
        day: { stem: 'JIA', branch: 'YIN' },
        hour: { stem: 'JI', branch: 'CHEN' },
      },
    };
    const ra = calculateRelationParticipants(a);
    const rb = calculateRelationParticipants(b);
    expect(ra).toEqual(rb);
  });
});

// ══ FACT ID STABILITY (HARDENING §12) ═══════════════════════════════════════════════════════════
describe('factId stability', () => {
  it('factIds are identical across two independent computations of the same chart', () => {
    const natal: NatalPillarContext = {
      dayMaster: 'JIA',
      pillars: {
        year: { stem: 'WU', branch: 'SHEN' },
        month: { stem: 'BING', branch: 'ZI' },
        day: { stem: 'JIA', branch: 'YIN' },
        hour: { stem: 'JI', branch: 'CHEN' },
      },
    };
    const first = calculateRelationParticipants(natal);
    const second = calculateRelationParticipants(natal);
    if (first.capability !== 'AVAILABLE' || second.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(first.branchPair.map((x) => x.factId)).toEqual(second.branchPair.map((x) => x.factId));
    expect(first.branchSet.map((x) => x.factId)).toEqual(second.branchSet.map((x) => x.factId));
    expect(first.stem.map((x) => x.factId)).toEqual(second.stem.map((x) => x.factId));
  });

  it('factIds encode meaningful deterministic identity (relation kind + participants), not incidental array index alone', () => {
    const natal: NatalPillarContext = {
      dayMaster: 'JIA',
      pillars: {
        year: { stem: 'WU', branch: 'SHEN' },
        month: { stem: 'BING', branch: 'ZI' },
        day: { stem: 'JIA', branch: 'YIN' },
        hour: { stem: 'JI', branch: 'CHEN' },
      },
    };
    const result = calculateRelationParticipants(natal);
    if (result.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    for (const entry of result.branchPair) {
      expect(entry.factId).toContain(entry.relation.kind);
    }
    for (const entry of result.stem) {
      expect(entry.factId).toContain(entry.relation.kind);
    }
  });

  it('factIds do not depend on display text or localized wording (none exists in this fact layer)', () => {
    const natal: NatalPillarContext = {
      dayMaster: 'JIA',
      pillars: {
        year: { stem: 'WU', branch: 'SHEN' },
        month: { stem: 'BING', branch: 'ZI' },
        day: { stem: 'JIA', branch: 'YIN' },
        hour: { stem: 'JI', branch: 'CHEN' },
      },
    };
    const result = calculateRelationParticipants(natal);
    if (result.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    const allIds = [...result.stem, ...result.branchPair, ...result.branchSet].map((x) => x.factId);
    expect(allIds.every((id) => !/[가-힣]/.test(id))).toBe(true); // no Korean text in any id
  });

});

// ══ F2 REGRESSION — relation fact IDs carry NO detector array index ═════════════════════════════
// Audit finding F2: relation fact ids previously embedded the detector's own output index, so the
// identity of a relation changed whenever the detector's scan order changed. Identity must be
// SEMANTIC ONLY (relation kind + canonically-ordered participants).
describe('factId semantic identity (audit finding F2)', () => {
  const RICH: NatalPillarContext = {
    dayMaster: 'JIA',
    pillars: {
      year: { stem: 'WU', branch: 'SHEN' }, month: { stem: 'BING', branch: 'ZI' },
      day: { stem: 'JIA', branch: 'YIN' }, hour: { stem: 'JI', branch: 'CHEN' },
    },
  };

  it('no factId contains a bare detector-index segment', () => {
    const r = calculateRelationParticipants(RICH);
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    for (const entry of [...r.stem, ...r.branchPair, ...r.branchSet]) {
      // the old format was `<prefix>:<index>:...` — a numeric segment delimited by colons
      expect(entry.factId).not.toMatch(/:\d+:/);
    }
  });

  it('every factId is reconstructible from relation kind + participant positions/values alone', () => {
    const r = calculateRelationParticipants(RICH);
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    const RANK: Record<string, number> = { YEAR: 0, MONTH: 1, DAY: 2, HOUR: 3 };
    const branchAt: Record<string, string> = {
      YEAR: 'SHEN', MONTH: 'ZI', DAY: 'YIN', HOUR: 'CHEN',
    };
    const stemAt: Record<string, string> = { YEAR: 'WU', MONTH: 'BING', DAY: 'JIA', HOUR: 'JI' };

    for (const entry of r.branchPair) {
      const token = [...entry.participantPillars]
        .sort((a, b) => RANK[a] - RANK[b])
        .map((p) => `${p}=${branchAt[p]}`)
        .join('+');
      expect(entry.factId).toBe(`branch-pair-relation-participants:${entry.relation.kind}:${token}`);
    }
    for (const entry of r.stem) {
      const token = [...entry.participantPillars]
        .sort((a, b) => RANK[a] - RANK[b])
        .map((p) => `${p}=${stemAt[p]}`)
        .join('+');
      expect(entry.factId).toBe(`stem-relation-participants:${entry.relation.kind}:${token}`);
    }
  });

  it('THE KEY PROPERTY: the same semantic relation keeps the same factId even when the detector emits it at a different array index', () => {
    // Chart A: 寅申沖 between YEAR(申) and DAY(寅). The MONTH branch 子 forms no pair relation with
    // 申 or 寅, so the clash lands early in the detector's scan output.
    const chartA: NatalPillarContext = {
      dayMaster: 'JIA',
      pillars: {
        year: { stem: 'JIA', branch: 'SHEN' }, month: { stem: 'JIA', branch: 'ZI' },
        day: { stem: 'JIA', branch: 'YIN' },
      },
    };
    // Chart B: the SAME 寅申沖 at the SAME positions, but MONTH is now 丑 — which forms extra
    // relations (申丑? 子丑? etc.) and adds an HOUR pillar, so the detector's scan emits a different
    // NUMBER of relations before and around the clash, shifting its array index.
    const chartB: NatalPillarContext = {
      dayMaster: 'JIA',
      pillars: {
        year: { stem: 'JIA', branch: 'SHEN' }, month: { stem: 'JIA', branch: 'CHOU' },
        day: { stem: 'JIA', branch: 'YIN' }, hour: { stem: 'JIA', branch: 'SI' },
      },
    };
    const a = calculateRelationParticipants(chartA);
    const b = calculateRelationParticipants(chartB);
    if (a.capability !== 'AVAILABLE' || b.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');

    const clashA = a.branchPair.find((x) => x.relation.kind === 'BRANCH_CLASH')!;
    const clashB = b.branchPair.find((x) => x.relation.kind === 'BRANCH_CLASH'
      && x.participantPillars.includes('YEAR') && x.participantPillars.includes('DAY'))!;
    expect(clashA).toBeDefined();
    expect(clashB).toBeDefined();

    // The detector genuinely emitted them at different positions in its output array...
    const indexA = a.branchPair.indexOf(clashA);
    const indexB = b.branchPair.indexOf(clashB);
    expect(indexA).not.toBe(indexB);
    // ...yet the semantic identity is IDENTICAL. This is the property the old index-based id broke.
    expect(clashB.factId).toBe(clashA.factId);
  });

  it('genuinely DIFFERENT simultaneous relations remain distinguishable after the index is removed', () => {
    // 子 at YEAR and HOUR both 육합 with 丑 at MONTH — two real, distinct relations that the old
    // index disambiguated by accident. They must still be distinguishable by position alone.
    const natal: NatalPillarContext = {
      dayMaster: 'JIA',
      pillars: {
        year: { stem: 'JIA', branch: 'ZI' }, month: { stem: 'JIA', branch: 'CHOU' },
        day: { stem: 'JIA', branch: 'HAI' }, hour: { stem: 'JIA', branch: 'ZI' },
      },
    };
    const r = calculateRelationParticipants(natal);
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    const sixCombos = r.branchPair.filter((x) => x.relation.kind === 'BRANCH_SIX_COMBINATION');
    expect(sixCombos.length).toBe(2);
    expect(new Set(sixCombos.map((x) => x.factId)).size).toBe(2); // no collision
  });

  it('no factId collides anywhere in a relation-dense chart', () => {
    const dense: NatalPillarContext = {
      dayMaster: 'JIA',
      pillars: {
        year: { stem: 'JIA', branch: 'SHEN' }, month: { stem: 'JI', branch: 'ZI' },
        day: { stem: 'JIA', branch: 'CHEN' }, hour: { stem: 'GENG', branch: 'YIN' },
      },
    };
    const r = calculateRelationParticipants(dense);
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    const all = [...r.stem, ...r.branchPair, ...r.branchSet].map((x) => x.factId);
    expect(all.length).toBeGreaterThan(2);
    expect(new Set(all).size).toBe(all.length);
  });
});

// ══ F1 REGRESSION — candidateAffectedRootFactIds holds GENUINE DM roots only ════════════════════
// Audit finding F1: the field previously received EVERY hidden-stem fact in a participating branch,
// so a non-Day-Master-element hidden stem was reported as an affected "root" it never was.
describe('root-only relation linkage (audit finding F1)', () => {
  it('a branch holding ONE genuine DM root among unrelated hidden stems reports only the root', () => {
    // DM 甲(WOOD). 寅 지장간 = 戊(EARTH, RESIDUAL) 丙(FIRE, MIDDLE) 甲(WOOD, MAIN).
    // Only 甲 is a WOOD root; 戊/丙 are co-located non-roots and must NOT be listed.
    const natal: NatalPillarContext = {
      dayMaster: 'JIA',
      pillars: {
        year: { stem: 'JIA', branch: 'SHEN' }, month: { stem: 'JIA', branch: 'ZI' },
        day: { stem: 'JIA', branch: 'YIN' },
      },
    };
    const r = calculateRelationParticipants(natal);
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    const clash = r.branchPair.find((x) => x.relation.kind === 'BRANCH_CLASH')!; // 寅申沖
    expect(clash).toBeDefined();
    // 寅 contributes exactly its 甲 root; 申 (戊/壬/庚 — EARTH/WATER/METAL) contributes nothing.
    expect(clash.candidateAffectedRootFactIds).toEqual(['hidden-stem:DAY:YIN:MAIN:JIA']);
    // the non-root co-located hidden stems are explicitly absent
    expect(clash.candidateAffectedRootFactIds.some((id) => id.includes(':WU'))).toBe(false);
    expect(clash.candidateAffectedRootFactIds.some((id) => id.includes(':BING'))).toBe(false);
    expect(clash.candidateAffectedRootFactIds.some((id) => id.includes(':GENG'))).toBe(false);
  });

  it('a relation touching branches with NO genuine DM root reports an EMPTY root list', () => {
    // DM 丙(FIRE). 子(WATER 壬癸) and 午... use 子午沖 where neither branch holds a FIRE root for 丙?
    // 午 지장간 = 丙(FIRE, MAIN) — so instead use 申寅? Use DM 庚(METAL) with 子午沖:
    // 子 = 壬癸 (WATER), 午 = 丙己丁 (FIRE/EARTH) — no METAL anywhere. Genuinely rootless for this clash.
    const natal: NatalPillarContext = {
      dayMaster: 'GENG',
      pillars: {
        year: { stem: 'GENG', branch: 'ZI' }, month: { stem: 'GENG', branch: 'MAO' },
        day: { stem: 'GENG', branch: 'WU' },
      },
    };
    const r = calculateRelationParticipants(natal);
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    const clash = r.branchPair.find((x) => x.relation.kind === 'BRANCH_CLASH')!; // 子午沖
    expect(clash).toBeDefined();
    expect(clash.candidateAffectedRootFactIds).toEqual([]);
  });

  it('every reported id is a GENUINE same-element root, cross-checked against the root provider', () => {
    const natal: NatalPillarContext = {
      dayMaster: 'JIA',
      pillars: {
        year: { stem: 'WU', branch: 'SHEN' }, month: { stem: 'BING', branch: 'ZI' },
        day: { stem: 'JIA', branch: 'YIN' }, hour: { stem: 'JI', branch: 'CHEN' },
      },
    };
    const r = calculateRelationParticipants(natal);
    const rooting = calculateSameElementRooting(natal);
    if (r.capability !== 'AVAILABLE' || rooting.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    const genuineRootIds = new Set(rooting.sameElementRoots.map((h) => h.factId));
    const everyHiddenStemId = new Set(rooting.branches.flatMap((b) => b.hiddenStems).map((h) => h.factId));
    // sanity: the complete catalog is strictly larger than the root subset, so this test has teeth
    expect(everyHiddenStemId.size).toBeGreaterThan(genuineRootIds.size);

    for (const entry of [...r.branchPair, ...r.branchSet]) {
      for (const id of entry.candidateAffectedRootFactIds) {
        expect(genuineRootIds.has(id)).toBe(true);
      }
    }
  });

  it('a branch with MULTIPLE hidden stems of which several are roots reports each root separately', () => {
    // DM 戊(EARTH). 辰 지장간 = 乙(WOOD) 癸(WATER) 戊(EARTH MAIN) → one EARTH root.
    // 戌 지장간 = 辛(METAL) 丁(FIRE) 戊(EARTH MAIN) → one EARTH root. 辰戌沖 touches both.
    const natal: NatalPillarContext = {
      dayMaster: 'WU',
      pillars: {
        year: { stem: 'WU', branch: 'CHEN' }, month: { stem: 'WU', branch: 'ZI' },
        day: { stem: 'WU', branch: 'XU' },
      },
    };
    const r = calculateRelationParticipants(natal);
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    const clash = r.branchPair.find((x) => x.relation.kind === 'BRANCH_CLASH')!; // 辰戌沖
    expect(clash).toBeDefined();
    expect(clash.candidateAffectedRootFactIds.sort()).toEqual(
      ['hidden-stem:DAY:XU:MAIN:WU', 'hidden-stem:YEAR:CHEN:MAIN:WU'].sort(),
    );
  });
});

// ══ BOUNDARY CASES (HARDENING §16) ══════════════════════════════════════════════════════════════
describe('boundary — multiple relations touching the SAME branch simultaneously', () => {
  // 子 (ZI, YEAR) participates in THREE separate relations at once: ZI-CHOU 육합(MONTH), ZI-WU 충(DAY
  // would clash, using MAO for 卯 instead to also get 子卯刑), and ZI as a member of 申子辰 삼합 (HOUR
  // supplies 申, DAY supplies 辰). Each relation must be reported as its OWN separate fact — none
  // merged, none dropped because ZI is already "used" by another relation.
  const natal: NatalPillarContext = {
    dayMaster: 'JIA',
    pillars: {
      year: { stem: 'JIA', branch: 'ZI' }, month: { stem: 'JIA', branch: 'CHOU' },
      day: { stem: 'JIA', branch: 'CHEN' }, hour: { stem: 'JIA', branch: 'SHEN' },
    },
  };
  const r = calculateRelationParticipants(natal);
  if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');

  it('ZI-CHOU 육합 (branchPair) is detected independently', () => {
    expect(r.branchPair.some((x) => x.relation.kind === 'BRANCH_SIX_COMBINATION'
      && x.participantBranches.includes('ZI') && x.participantBranches.includes('CHOU'))).toBe(true);
  });

  it('申子辰 삼합 (branchSet) is ALSO detected, sharing branch ZI with the pair relation above', () => {
    const trio = r.branchSet.find((x) => x.relation.kind === 'BRANCH_THREE_HARMONY'
      && x.participantBranches.includes('ZI'));
    expect(trio).toBeDefined();
    expect(trio!.participantBranches.sort()).toEqual(['CHEN', 'SHEN', 'ZI'].sort());
  });

  it('neither relation is dropped, merged, or altered by the other sharing branch ZI', () => {
    const ziPairRelations = r.branchPair.filter((x) => x.participantBranches.includes('ZI'));
    const ziSetRelations = r.branchSet.filter((x) => x.participantBranches.includes('ZI'));
    expect(ziPairRelations.length).toBeGreaterThanOrEqual(1);
    expect(ziSetRelations.length).toBeGreaterThanOrEqual(1);
    // both kinds of relation appear as fully independent facts with distinct factIds
    const allIds = [...ziPairRelations, ...ziSetRelations].map((x) => x.factId);
    expect(new Set(allIds).size).toBe(allIds.length);
  });
});

describe('boundary — a same-element root referenced by MULTIPLE relation detections at once', () => {
  // DAY branch 寅 holds a WOOD MAIN root (甲) for a 甲 Day Master. Make 寅(DAY) participate in BOTH
  // 寅申沖 (clash, vs YEAR 申) AND 寅卯辰 방합 (directional union, vs MONTH 卯 + HOUR 辰) — the SAME
  // root fact must appear in candidateAffectedRootFactIds for BOTH relations, unaltered by either.
  const natal: NatalPillarContext = {
    dayMaster: 'JIA',
    pillars: {
      year: { stem: 'JIA', branch: 'SHEN' }, month: { stem: 'JIA', branch: 'MAO' },
      day: { stem: 'JIA', branch: 'YIN' }, hour: { stem: 'JIA', branch: 'CHEN' },
    },
  };
  const r = calculateRelationParticipants(natal);
  if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');

  it('the clash and the directional union are both detected, both touching DAY (寅)', () => {
    const clash = r.branchPair.find((x) => x.relation.kind === 'BRANCH_CLASH');
    const union = r.branchSet.find((x) => x.relation.kind === 'BRANCH_DIRECTIONAL_UNION');
    expect(clash).toBeDefined();
    expect(union).toBeDefined();
    expect(clash!.participantPillars).toContain('DAY');
    expect(union!.participantPillars).toContain('DAY');
  });

  it('the SAME DAY-branch root factId appears in BOTH relations candidateAffectedRootFactIds, identically', () => {
    const clash = r.branchPair.find((x) => x.relation.kind === 'BRANCH_CLASH')!;
    const union = r.branchSet.find((x) => x.relation.kind === 'BRANCH_DIRECTIONAL_UNION')!;
    const dayRootId = 'hidden-stem:DAY:YIN:MAIN:JIA';
    expect(clash.candidateAffectedRootFactIds).toContain(dayRootId);
    expect(union.candidateAffectedRootFactIds).toContain(dayRootId);
  });

  it('shared reference is a plain existence link, not a judgment — no effect/damage field on either relation', () => {
    const clash = r.branchPair.find((x) => x.relation.kind === 'BRANCH_CLASH')! as unknown as Record<string, unknown>;
    expect(clash.rootDestroyed).toBeUndefined();
    expect(clash.rootWeakened).toBeUndefined();
  });
});

describe('boundary — repeated element appearances and a branch with multiple hidden stems do not distort relation counts', () => {
  it('a branch value repeated across two positions (子 at YEAR and 시) yields two separate participant entries, not one deduplicated entry', () => {
    // ZI at both YEAR and HOUR; ZI-CHOU 육합 with MONTH should surface twice (once per ZI position).
    const natal: NatalPillarContext = {
      dayMaster: 'JIA',
      pillars: {
        year: { stem: 'JIA', branch: 'ZI' }, month: { stem: 'JIA', branch: 'CHOU' },
        day: { stem: 'JIA', branch: 'HAI' }, hour: { stem: 'JIA', branch: 'ZI' },
      },
    };
    const r = calculateRelationParticipants(natal);
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    const sixCombos = r.branchPair.filter((x) => x.relation.kind === 'BRANCH_SIX_COMBINATION');
    expect(sixCombos.length).toBe(2); // YEAR-MONTH and MONTH-HOUR, each a distinct fact
    expect(new Set(sixCombos.map((x) => x.factId)).size).toBe(2);
  });
});
