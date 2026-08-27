// Ten-god (십신) FACT coverage — deterministic FACT only. No role grouping, no support/drain side.
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
