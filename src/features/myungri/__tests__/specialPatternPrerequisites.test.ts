// Special-pattern PREREQUISITE facts — raw counts/positions ONLY, deterministic. No pattern verdict.
import { calculateSpecialPatternPrerequisites, type NatalPillarContext } from '../index';

const RICH_NATAL: NatalPillarContext = {
  dayMaster: 'JIA',
  pillars: {
    year: { stem: 'WU', branch: 'SHEN' },
    month: { stem: 'BING', branch: 'ZI' },
    day: { stem: 'JIA', branch: 'YIN' },
    hour: { stem: 'JI', branch: 'CHEN' },
  },
};

describe('calculateSpecialPatternPrerequisites', () => {
  const r = calculateSpecialPatternPrerequisites(RICH_NATAL);
  if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');

  it('exposes RAW element counts, never weighted/percent', () => {
    // visible (non-DAY) stems: 戊(EARTH) 丙(FIRE) 己(EARTH)
    expect(r.visibleElementCounts).toEqual({ WOOD: 0, FIRE: 1, EARTH: 2, METAL: 0, WATER: 0 });
    expect(Object.values(r.hiddenElementCounts).reduce((a, b) => a + b, 0)).toBeGreaterThan(0);
  });

  it('exposes same-element-root POSITIONS only, no strength/rank judgment', () => {
    expect(r.sameElementRootPositions).toHaveLength(2);
    expect(r.sameElementRootPositions.map((p) => p.position).sort()).toEqual(['DAY', 'HOUR'].sort());
  });

  it('exposes 5-role category presence (비겁/인성/식상/재성/관성) without a support/drain side tag', () => {
    expect(r.roleCategoryPresence).toHaveLength(5);
    const wealth = r.roleCategoryPresence.find((x) => x.role === 'WEALTH')!;
    expect(wealth.visibleCount).toBeGreaterThan(0); // 戊/己 are WEALTH-category vs 甲 DM
    for (const entry of r.roleCategoryPresence) {
      const asRecord = entry as unknown as Record<string, unknown>;
      expect(asRecord.side).toBeUndefined();
      expect(asRecord.support).toBeUndefined();
      expect(asRecord.drain).toBeUndefined();
    }
  });

  it('never emits a special-pattern verdict of any kind', () => {
    const asRecord = r as unknown as Record<string, unknown>;
    expect(asRecord.congCaiCandidate).toBeUndefined();
    expect(asRecord.congGuanShaCandidate).toBeUndefined();
    expect(asRecord.congErCandidate).toBeUndefined();
    expect(asRecord.specialPatternScore).toBeUndefined();
    expect(asRecord.specialPatternConfirmed).toBeUndefined();
    const json = JSON.stringify(r);
    expect(json).not.toMatch(/CONFIRMED|CANDIDATE|從强|從財|從官殺|從兒|專旺|WEAK|STRONG|극신약|신약|중화|신강|극신강/);
  });

  it('ruleVersion + fail-closed on invalid natal', () => {
    expect(r.ruleVersion).toBe('deokbunai.myungri-special-pattern-prerequisites.v1');
    const bad = calculateSpecialPatternPrerequisites({ dayMaster: 'JIA', pillars: {} as never });
    expect(bad.capability).toBe('UNAVAILABLE');
  });
});
