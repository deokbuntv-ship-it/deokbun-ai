// 통근/투간 — same-干 matches between visible stems and 지장간. Facts only (no strength/score).
import { calculateRootingTransparency, type NatalPillarContext } from '../index';

// 甲 일간. 戊申년 丙子월 甲寅일 辛巳시.
//   지장간: 申=戊壬庚 · 子=壬癸 · 寅=戊丙甲 · 巳=戊庚丙.
const NATAL: NatalPillarContext = {
  dayMaster: 'JIA',
  pillars: {
    year: { stem: 'WU', branch: 'SHEN' }, // 戊申
    month: { stem: 'BING', branch: 'ZI' }, // 丙子
    day: { stem: 'JIA', branch: 'YIN' }, // 甲寅
    hour: { stem: 'XIN', branch: 'SI' }, // 辛巳
  },
};

describe('통근 (rooting)', () => {
  const r = calculateRootingTransparency(NATAL);
  if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
  const find = (position: string, stem: string) =>
    r.rooting.find((x) => x.stemPosition === position && x.stem === stem)!;

  it('복수 통근: 戊(년간) roots in 申·寅·巳 지장간 (3 roots)', () => {
    const wu = find('YEAR', 'WU');
    expect(wu.isRooted).toBe(true);
    expect(wu.roots).toHaveLength(3);
    expect(wu.roots.map((x) => x.branch).sort()).toEqual(['SHEN', 'SI', 'YIN'].sort());
  });

  it('통근 있음 (정기): 甲(일간) roots in 寅 정기(MAIN)', () => {
    const jia = find('DAY', 'JIA');
    expect(jia.isRooted).toBe(true);
    expect(jia.roots).toContainEqual({ branchPosition: 'DAY', branch: 'YIN', hiddenStemRole: 'MAIN' });
  });

  it('통근 없음: 辛(시간) has no 지장간 root', () => {
    const xin = find('HOUR', 'XIN');
    expect(xin.isRooted).toBe(false);
    expect(xin.roots).toHaveLength(0);
  });
});

describe('투간 (transparency)', () => {
  const r = calculateRootingTransparency(NATAL);
  if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
  const find = (branchPos: string, hidden: string) =>
    r.transparency.find((x) => x.branchPosition === branchPos && x.hiddenStem === hidden)!;

  it('투간 있음: 寅 정기 甲 is revealed at the 일간 (DAY)', () => {
    const t = find('DAY', 'JIA');
    expect(t.isRevealed).toBe(true);
    expect(t.revealedAt).toContain('DAY');
  });

  it('투간 없음: 子 정기 癸 is not revealed anywhere', () => {
    const t = find('MONTH', 'GUI');
    expect(t.isRevealed).toBe(false);
    expect(t.revealedAt).toHaveLength(0);
  });

  it('ruleVersion + fail-closed on invalid natal', () => {
    expect(r.ruleVersion).toBe('deokbunai.myungri-rooting-transparency.v1');
    const bad = calculateRootingTransparency({
      ...NATAL,
      pillars: { ...NATAL.pillars, day: { stem: 'NOPE' as never, branch: 'YIN' } },
    });
    expect(bad.capability).toBe('UNAVAILABLE');
    if (bad.capability === 'UNAVAILABLE') expect(bad.reason).toBe('INVALID_NATAL_CONTEXT');
  });
});
