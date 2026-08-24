// 일간 기준 십신 역할 구성 (아군/타군) — COMPOSITION facts only, NO 세력/강약 verdict.
// Guards: the fixed classical ten-god→role mapping, 일간 자신 제외(일지 지장간은 포함), no-verdict invariants,
// determinism, and 시주 미상 graceful degradation (§27). The 세력 weighting/threshold stays Owner Review (§10/§32).
import { calculateDayMasterStrengthInputs, type NatalPillarContext } from '../index';

// 일간 甲(JIA, yang WOOD). Visible non-day stems chosen so their 십신 are hand-verifiable by the classical rules:
//   庚(GENG yang METAL) 금극목 → 편관(SEVEN_KILLINGS) = OFFICER/DRAIN
//   壬(REN  yang WATER) 수생목 → 편인(INDIRECT_RESOURCE) = RESOURCE/SUPPORT
//   丙(BING yang FIRE)  목생화 → 식신(EATING_GOD)        = OUTPUT/DRAIN
const chart = (withHour: boolean): NatalPillarContext => ({
  dayMaster: 'JIA',
  pillars: {
    year: { stem: 'GENG', branch: 'SHEN' },
    month: { stem: 'REN', branch: 'ZI' },
    day: { stem: 'JIA', branch: 'WU' }, // 일간 甲 제외; 일지 午의 지장간은 포함
    ...(withHour ? { hour: { stem: 'BING', branch: 'YIN' } as const } : {}),
  },
});

const ok = (n: NatalPillarContext) => {
  const r = calculateDayMasterStrengthInputs(n);
  if (r.capability !== 'AVAILABLE') throw new Error(`expected AVAILABLE, got ${r.reason}`);
  return r;
};

describe('일간 기준 십신 역할 구성 (甲 일간)', () => {
  it('일간 자신은 제외하고, 남은 천간을 고정 십신 규칙대로 역할·아군/타군으로 태깅', () => {
    const r = ok(chart(true));
    expect(r.visibleStems.map((e) => e.position)).toEqual(['YEAR', 'MONTH', 'HOUR']); // DAY 제외
    const byPos = Object.fromEntries(r.visibleStems.map((e) => [e.position, e]));
    expect(byPos.YEAR).toMatchObject({ stem: 'GENG', tenGod: 'SEVEN_KILLINGS', role: 'OFFICER', side: 'DRAIN' });
    expect(byPos.MONTH).toMatchObject({ stem: 'REN', tenGod: 'INDIRECT_RESOURCE', role: 'RESOURCE', side: 'SUPPORT' });
    expect(byPos.HOUR).toMatchObject({ stem: 'BING', tenGod: 'EATING_GOD', role: 'OUTPUT', side: 'DRAIN' });
  });

  it('구성 tally = 순수 카운트 (아군 1 · 타군 2, 합 = 가시 천간 수)', () => {
    const r = ok(chart(true));
    expect(r.visibleSideCounts).toEqual({ SUPPORT: 1, DRAIN: 2 });
    expect(r.visibleRoleCounts).toEqual({ PARALLEL: 0, RESOURCE: 1, OUTPUT: 1, WEALTH: 0, OFFICER: 1 });
    const roleSum = Object.values(r.visibleRoleCounts).reduce((a, b) => a + b, 0);
    expect(roleSum).toBe(r.visibleStems.length);
    expect(r.visibleSideCounts.SUPPORT + r.visibleSideCounts.DRAIN).toBe(r.visibleStems.length);
  });

  it('일지(日支) 지장간은 포함 (일간만 제외); 지장간은 별도 tally', () => {
    const r = ok(chart(true));
    expect(r.hiddenStems.some((e) => e.position === 'DAY')).toBe(true);
    expect(r.hiddenStems.length).toBeGreaterThan(0);
    const hiddenSum = Object.values(r.hiddenRoleCounts).reduce((a, b) => a + b, 0);
    expect(hiddenSum).toBe(r.hiddenStems.length);
    expect(r.dayMaster).toEqual({ stem: 'JIA', element: 'WOOD' });
  });

  it('세력/강약 판정값은 절대 산정하지 않는다 (Owner Review) — §10/§32', () => {
    const r = ok(chart(true));
    expect(r.strengthVerdict).toBe('OWNER_REVIEW_REQUIRED');
    expect(r.seryeokScore).toBeNull();
    // no COMPUTED verdict/score leaks into the DATA (the disclaimer may name 신강/신약 to say they're excluded).
    expect(JSON.stringify({ ...r, disclaimer: undefined })).not.toMatch(/신강|신약|"score"\s*:\s*\d/);
  });

  it('결정론적 — 같은 원국이면 완전히 동일한 결과', () => {
    expect(ok(chart(true))).toEqual(ok(chart(true)));
  });

  it('시주 미상이면 우아하게 축소 (HOUR 없이 계산, §27)', () => {
    const r = ok(chart(false));
    expect(r.capability).toBe('AVAILABLE');
    expect(r.visibleStems.map((e) => e.position)).toEqual(['YEAR', 'MONTH']); // no HOUR, DAY excluded
    expect(r.hiddenStems.some((e) => e.position === 'HOUR')).toBe(false);
  });

  it('fail-closed — 잘못된 원국이면 UNAVAILABLE (부분 추정 없음)', () => {
    const bad = calculateDayMasterStrengthInputs({
      dayMaster: 'NOPE' as NatalPillarContext['dayMaster'],
      pillars: chart(false).pillars,
    });
    expect(bad.capability).toBe('UNAVAILABLE');
    if (bad.capability === 'UNAVAILABLE') expect(bad.reason).toBe('INVALID_NATAL_CONTEXT');
  });
});
