// Ten-god (십신) FACT coverage — deterministic FACT only. No role grouping, no support/drain side.
import {
  getStemElement, getStemYinYang, HEAVENLY_STEMS,
  type FiveElement, type HeavenlyStem, type TenGod, type YinYang,
} from '../../interpretation';
import { calculateTenGodFacts, type NatalPillarContext } from '../index';

const RICH_NATAL: NatalPillarContext = {
  dayMaster: 'JIA',
  pillars: {
    year: { stem: 'WU', branch: 'SHEN' },
    month: { stem: 'BING', branch: 'ZI' },
    day: { stem: 'JIA', branch: 'YIN' },
    hour: { stem: 'JI', branch: 'CHEN' },
  },
};

describe('calculateTenGodFacts', () => {
  const r = calculateTenGodFacts(RICH_NATAL);
  if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');

  it('12. visible stems preserve pillar positions (DAY/Day-Master itself excluded)', () => {
    expect(r.visibleStems).toHaveLength(3); // YEAR, MONTH, HOUR — DAY excluded
    expect(r.visibleStems.map((v) => v.position).sort()).toEqual(['HOUR', 'MONTH', 'YEAR'].sort());
    expect(r.visibleStems.find((v) => v.position === 'YEAR')!.stem).toBe('WU');
    expect(r.visibleStems.find((v) => v.position === 'HOUR')!.stem).toBe('JI');
  });

  it('13. all 10 ten-gods are reachable via the frozen rule; hidden stems carry role too', () => {
    // 戊(EARTH) vs 甲(WOOD DM): DM controls EARTH → WEALTH category (편재/정재 territory)
    const wu = r.visibleStems.find((v) => v.stem === 'WU')!;
    expect(['DIRECT_WEALTH', 'INDIRECT_WEALTH']).toContain(wu.tenGod);
    // 己(EARTH, yin) vs 甲(WOOD, yang DM): opposite polarity control → DIRECT_WEALTH (정재)
    const ji = r.visibleStems.find((v) => v.stem === 'JI')!;
    expect(ji.tenGod).toBe('DIRECT_WEALTH');
    expect(r.hiddenStems.length).toBeGreaterThan(0);
    expect(r.hiddenStems.every((h) => typeof h.tenGod === 'string' && h.hiddenRole)).toBe(true);
  });

  it('ten-god facts carry NO role grouping or support/drain side field', () => {
    const sample = r.visibleStems[0] as unknown as Record<string, unknown>;
    expect(sample.role).toBeUndefined();
    expect(sample.side).toBeUndefined();
    expect(sample.support).toBeUndefined();
    expect(sample.drain).toBeUndefined();
  });

  it('fact output does not contain any strength/verdict language', () => {
    const json = JSON.stringify(r);
    expect(json).not.toMatch(/WEAK|STRONG|극신약|신약|중화|신강|극신강|SPECIAL_PATTERN|YONGSHIN/);
  });

  it('ruleVersion + fail-closed on invalid natal', () => {
    expect(r.ruleVersion).toBe('deokbunai.myungri-ten-god-facts.v1');
    const bad = calculateTenGodFacts({ dayMaster: 'JIA', pillars: {} as never });
    expect(bad.capability).toBe('UNAVAILABLE');
  });
});

// ══ EXHAUSTIVE — 10 Day Masters × 10 target stems (HARDENING §7) ═══════════════════════════════
// Independent oracle: the classical Ten-God rule (element generation/control + polarity) is
// re-derived here from first principles — a FIVE_ELEMENT_CYCLE index arithmetic, written
// independently of however calculateTenGod internally computes it — and cross-checked against
// every one of the 100 (dayMaster, target) pairs. No strength contribution anywhere in this block.
describe('EXHAUSTIVE — ten-god mapping across all 10 Day Masters × 10 target stems', () => {
  const FIVE_ELEMENT_CYCLE: readonly FiveElement[] = ['WOOD', 'FIRE', 'EARTH', 'METAL', 'WATER'];
  const cycleIndex = (el: FiveElement): number => FIVE_ELEMENT_CYCLE.indexOf(el);
  /** X generates the element one step ahead in the cycle. */
  const generates = (a: FiveElement, b: FiveElement): boolean =>
    (cycleIndex(a) + 1) % 5 === cycleIndex(b);
  /** X controls the element two steps ahead in the cycle. */
  const controls = (a: FiveElement, b: FiveElement): boolean =>
    (cycleIndex(a) + 2) % 5 === cycleIndex(b);

  /** Independently-derived expected TenGod, from the classical generation/control + polarity rule. */
  function expectedTenGod(
    dmElement: FiveElement, dmYinYang: YinYang, targetElement: FiveElement, targetYinYang: YinYang,
  ): TenGod {
    const same = dmYinYang === targetYinYang;
    if (targetElement === dmElement) return same ? 'PEER' : 'ROB_WEALTH';
    if (generates(dmElement, targetElement)) return same ? 'EATING_GOD' : 'HURTING_OFFICER';
    if (controls(dmElement, targetElement)) return same ? 'INDIRECT_WEALTH' : 'DIRECT_WEALTH';
    if (controls(targetElement, dmElement)) return same ? 'SEVEN_KILLINGS' : 'DIRECT_OFFICER';
    if (generates(targetElement, dmElement)) return same ? 'INDIRECT_RESOURCE' : 'DIRECT_RESOURCE';
    throw new Error(`unreachable: ${dmElement} vs ${targetElement}`);
  }

  // 100/100 COVERAGE (audit finding F4). The diagonal (target === dayMaster) is NOT skipped: the
  // provider excludes the DAY *position* (a stem has no ten-god relation to itself at its own
  // pillar), NOT the Day Master's stem *value* appearing elsewhere. Placing the DM's own stem at
  // YEAR is a real, ordinary chart (e.g. 甲 년간 with a 甲 일간) and must map to 比肩/PEER.
  for (const dayMaster of HEAVENLY_STEMS) {
    describe(`Day Master ${dayMaster}`, () => {
      const dmElement = getStemElement(dayMaster);
      const dmYinYang = getStemYinYang(dayMaster);
      if (!dmElement.ok || !dmYinYang.ok) throw new Error('frozen primitive failed for a valid stem');

      for (const target of HEAVENLY_STEMS) {
        it(`target=${target}: matches the independently-derived classical Ten-God rule`, () => {
          const targetElement = getStemElement(target);
          const targetYinYang = getStemYinYang(target);
          if (!targetElement.ok || !targetYinYang.ok) throw new Error('frozen primitive failed for a valid stem');
          const expected = expectedTenGod(dmElement.value, dmYinYang.value, targetElement.value, targetYinYang.value);

          // Build a minimal valid chart placing `target` at YEAR (the only visible, non-DAY slot
          // guaranteed present) and read the fact back.
          const natal: NatalPillarContext = {
            dayMaster,
            pillars: {
              year: { stem: target, branch: 'ZI' },
              month: { stem: dayMaster, branch: 'ZI' },
              day: { stem: dayMaster, branch: 'ZI' },
            },
          };
          const r = calculateTenGodFacts(natal);
          if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
          const yearFact = r.visibleStems.find((v) => v.position === 'YEAR')!;
          expect(yearFact.tenGod).toBe(expected);
        });
      }
    });
  }

  it('covers the full 10x10 mapping — all 100 (dayMaster, target) pairs, diagonal included', () => {
    const covered = new Set<string>();
    for (const dayMaster of HEAVENLY_STEMS) {
      for (const target of HEAVENLY_STEMS) {
        const r = calculateTenGodFacts({
          dayMaster,
          pillars: {
            year: { stem: target, branch: 'ZI' },
            month: { stem: dayMaster, branch: 'ZI' },
            day: { stem: dayMaster, branch: 'ZI' },
          },
        });
        if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
        expect(r.visibleStems.find((v) => v.position === 'YEAR')).toBeDefined();
        covered.add(`${dayMaster}->${target}`);
      }
    }
    expect(covered.size).toBe(100);
  });

  it('the diagonal specifically resolves to PEER (比肩) — same element, same polarity', () => {
    for (const dayMaster of HEAVENLY_STEMS) {
      const r = calculateTenGodFacts({
        dayMaster,
        pillars: {
          year: { stem: dayMaster, branch: 'ZI' },
          month: { stem: dayMaster, branch: 'ZI' },
          day: { stem: dayMaster, branch: 'ZI' },
        },
      });
      if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
      expect(r.visibleStems.find((v) => v.position === 'YEAR')!.tenGod).toBe('PEER');
    }
  });

  it('all 10 TenGod values are reachable across the 100-pair matrix', () => {
    const seen = new Set<TenGod>();
    for (const dayMaster of HEAVENLY_STEMS) {
      for (const target of HEAVENLY_STEMS) {
        const r = calculateTenGodFacts({
          dayMaster,
          pillars: {
            year: { stem: target, branch: 'ZI' },
            month: { stem: dayMaster, branch: 'ZI' },
            day: { stem: dayMaster, branch: 'ZI' },
          },
        });
        if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
        seen.add(r.visibleStems.find((v) => v.position === 'YEAR')!.tenGod);
      }
    }
    expect(seen.size).toBe(10);
  });
});

// ══ order invariance / factId stability / duplicate-fact policy (HARDENING §11/§12/§14) ═════════
describe('order invariance', () => {
  it('output is independent of the pillars object literal key order', () => {
    const a: NatalPillarContext = { ...RICH_NATAL };
    const b: NatalPillarContext = {
      dayMaster: 'JIA',
      pillars: {
        hour: RICH_NATAL.pillars.hour!, day: RICH_NATAL.pillars.day,
        month: RICH_NATAL.pillars.month, year: RICH_NATAL.pillars.year,
      },
    };
    expect(calculateTenGodFacts(a)).toEqual(calculateTenGodFacts(b));
  });
});

describe('factId stability (HARDENING §12)', () => {
  const r = calculateTenGodFacts(RICH_NATAL);
  if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');

  it('factIds are identical across two independent computations of the same chart', () => {
    const r2 = calculateTenGodFacts({ ...RICH_NATAL });
    if (r2.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(r2.visibleStems.map((v) => v.factId)).toEqual(r.visibleStems.map((v) => v.factId));
    expect(r2.hiddenStems.map((h) => h.factId)).toEqual(r.hiddenStems.map((h) => h.factId));
  });

  it('visible-stem factIds encode position + stem; hidden-stem factIds encode position + branch + role + stem', () => {
    for (const fact of r.visibleStems) {
      expect(fact.factId).toBe(`visible-stem-ten-god:${fact.position}:${fact.stem}`);
    }
    for (const fact of r.hiddenStems) {
      expect(fact.factId).toBe(`hidden-stem-ten-god:${fact.position}:${fact.branch}:${fact.hiddenRole}:${fact.stem}`);
    }
  });

  it('no factId contains Korean text', () => {
    for (const fact of [...r.visibleStems, ...r.hiddenStems]) expect(fact.factId).not.toMatch(/[가-힣]/);
  });

  it('visible and hidden factId namespaces never collide with each other', () => {
    const visibleIds = new Set(r.visibleStems.map((v) => v.factId));
    const hiddenIds = new Set(r.hiddenStems.map((h) => h.factId));
    for (const id of visibleIds) expect(hiddenIds.has(id)).toBe(false);
  });
});

describe('duplicate-fact policy (HARDENING §14)', () => {
  it('the same target stem at two different positions yields two distinct, position-qualified facts', () => {
    // 戊 appears at YEAR (visible) and as 申's hidden MAIN stem — both legitimately co-exist.
    const r = calculateTenGodFacts(RICH_NATAL);
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    const wuVisible = r.visibleStems.filter((v) => v.stem === 'WU');
    const wuHidden = r.hiddenStems.filter((h) => h.stem === 'WU');
    expect(wuVisible.length + wuHidden.length).toBeGreaterThanOrEqual(2);
    const allIds = [...wuVisible, ...wuHidden].map((f) => f.factId);
    expect(new Set(allIds).size).toBe(allIds.length); // no collision despite identical stem+tenGod
  });
});

describe('15. Day Master representation — DAY visible stem is excluded, not "does not exist"', () => {
  it('the Day Master is still unambiguously exposed as chart identity, just not as a ten-god fact', () => {
    const r = calculateTenGodFacts({
      dayMaster: 'JIA',
      pillars: {
        year: { stem: 'WU', branch: 'ZI' },
        month: { stem: 'BING', branch: 'ZI' },
        day: { stem: 'JIA', branch: 'YIN' },
      },
    });
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    // DAY is correctly absent from visibleStems (a stem has no ten-god relation to itself)...
    expect(r.visibleStems.some((v) => v.position === 'DAY')).toBe(false);
    // ...but the Day Master identity itself is exposed unambiguously, exactly once, at top level.
    expect(r.dayMaster).toBe('JIA');
    // hidden stems INSIDE the day branch are still fully catalogued (일지 지장간 is real evidence).
    expect(r.hiddenStems.some((h) => h.position === 'DAY')).toBe(true);
  });
});
