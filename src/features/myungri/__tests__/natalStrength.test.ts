// 원국 신강/신약 V1 classifier — hierarchical factor-state rule table (NO numeric weights).
// Charts are hand-built for a 甲(JIA, WOOD) day master; each comment states the (month/rooting/composition)
// triple the chart produces. Roots = same-element(WOOD 甲/乙) 지장간: present in 寅卯辰未亥, absent in 子丑巳午申酉戌.
// 득령(SUPPORT): WOOD월(寅卯)=旺, WATER월(亥子)=相. 실령(DRAIN): 火(巳午)/土(辰戌丑未)/金(申酉).
import { evaluateNatalStrength, type NatalPillarContext } from '../index';

type P = NatalPillarContext['pillars'];
const chart = (dayMaster: NatalPillarContext['dayMaster'], pillars: P): NatalPillarContext => ({ dayMaster, pillars });
const ok = (n: NatalPillarContext) => {
  const r = evaluateNatalStrength(n);
  if (r.status !== 'CLASSIFIED') throw new Error(`expected CLASSIFIED, got ${r.status}/${'reason' in r ? r.reason : ''}`);
  return r;
};

// SUPPORT/MULTIPLE/SUPPORT_DOMINANT
const C_EXTREME_STRONG = chart('JIA', {
  year: { stem: 'JIA', branch: 'MAO' }, month: { stem: 'YI', branch: 'YIN' },
  day: { stem: 'JIA', branch: 'YIN' }, hour: { stem: 'REN', branch: 'MAO' },
});
// DRAIN/NONE/DRAIN_DOMINANT
const C_EXTREME_WEAK = chart('JIA', {
  year: { stem: 'BING', branch: 'SHEN' }, month: { stem: 'GENG', branch: 'SHEN' },
  day: { stem: 'JIA', branch: 'WU' }, hour: { stem: 'WU', branch: 'XU' },
});
// SUPPORT/SINGLE/SUPPORT_DOMINANT
const C_STRONG = chart('JIA', {
  year: { stem: 'REN', branch: 'YOU' }, month: { stem: 'GUI', branch: 'ZI' },
  day: { stem: 'JIA', branch: 'MAO' }, hour: { stem: 'GUI', branch: 'ZI' },
});
// DRAIN/NONE/SUPPORT_DOMINANT  (month+rootless drain wins over supportive composition)
const C_WEAK = chart('JIA', {
  year: { stem: 'REN', branch: 'YOU' }, month: { stem: 'REN', branch: 'SHEN' },
  day: { stem: 'JIA', branch: 'WU' }, hour: { stem: 'GUI', branch: 'ZI' },
});
// DRAIN/MULTIPLE/SUPPORT_DOMINANT  (multi-root + support lift a 실령 chart above center)
const C_BAL_STRONG = chart('JIA', {
  year: { stem: 'JIA', branch: 'YIN' }, month: { stem: 'REN', branch: 'SHEN' },
  day: { stem: 'JIA', branch: 'MAO' }, hour: { stem: 'YI', branch: 'YIN' },
});
// DRAIN/SINGLE/SUPPORT_DOMINANT
const C_BAL_WEAK = chart('JIA', {
  year: { stem: 'REN', branch: 'YOU' }, month: { stem: 'REN', branch: 'SHEN' },
  day: { stem: 'JIA', branch: 'MAO' }, hour: { stem: 'GUI', branch: 'ZI' },
});
// SUPPORT/NONE/MIXED  (hour absent → 2 visible stems 1:1 → MIXED; 得令 no-root → center)
const C_BALANCED = chart('JIA', {
  year: { stem: 'REN', branch: 'YOU' }, month: { stem: 'BING', branch: 'ZI' },
  day: { stem: 'JIA', branch: 'WU' },
});

describe('원국 신강/신약 7단계 classifier', () => {
  it('극신강 — 득령·복수 통근·아군 우세', () => {
    const r = ok(C_EXTREME_STRONG);
    expect(r.label).toBe('EXTREMELY_STRONG');
    expect(r.month.direction).toBe('SUPPORT');
    expect(r.rooting.state).toBe('MULTIPLE');
    expect(r.composition.state).toBe('SUPPORT_DOMINANT');
    expect(r.confidence).toBe('HIGH');
    expect(r.warnings.join()).toMatch(/특수격/); // §21 gate surfaced, label unchanged
  });

  it('극신약 — 실령·무근·타군 우세', () => {
    const r = ok(C_EXTREME_WEAK);
    expect(r.label).toBe('EXTREMELY_WEAK');
    expect(r.rooting.state).toBe('NONE');
    expect(r.composition.state).toBe('DRAIN_DOMINANT');
    expect(r.confidence).toBe('HIGH');
  });

  it('신강 / 신약 / 중화신강 / 중화신약 / 중화 각 대표 케이스', () => {
    expect(ok(C_STRONG).label).toBe('STRONG');
    expect(ok(C_WEAK).label).toBe('WEAK');
    expect(ok(C_BAL_STRONG).label).toBe('BALANCED_STRONG');
    expect(ok(C_BAL_WEAK).label).toBe('BALANCED_WEAK');
    expect(ok(C_BALANCED).label).toBe('BALANCED');
  });

  it('상충 factor는 conflicts trace로 남고 confidence를 낮춘다 (합산 아님)', () => {
    const r = ok(C_BAL_STRONG); // 월령 DRAIN vs 통근 SUPPORT
    expect(r.conflicts.some((c) => /월령.*통근|통근.*월령/.test(c))).toBe(true);
    expect(r.confidence).not.toBe('HIGH'); // not unanimous
  });

  it('rootless는 강한 쪽 상한(중화신강)·multi-root는 약한 쪽 하한(중화신약)에 걸린다', () => {
    // SUPPORT/NONE/SUPPORT_DOMINANT would be STRONG without the cap → capped to BALANCED_STRONG
    const capStrong = chart('JIA', {
      year: { stem: 'REN', branch: 'YOU' }, month: { stem: 'GUI', branch: 'ZI' },
      day: { stem: 'JIA', branch: 'WU' }, hour: { stem: 'REN', branch: 'YOU' },
    }); // 得令(子)·무근·아군3(壬癸壬 인성)
    const r = ok(capStrong);
    expect(r.rooting.state).toBe('NONE');
    expect(r.composition.state).toBe('SUPPORT_DOMINANT');
    expect(r.label).toBe('BALANCED_STRONG');
  });

  it('시주 미상 — 자동 UNKNOWN 아님, 분류하되 confidence 하향 + 경고', () => {
    const r = ok(C_BALANCED); // no hour
    expect(r.status).toBe('CLASSIFIED');
    expect(r.warnings.join()).toMatch(/시주 미상/);
  });

  it('fail-closed — 잘못된 원국이면 REVIEW_REQUIRED (LLM에 위임 안 함)', () => {
    const r = evaluateNatalStrength(chart('NOPE' as NatalPillarContext['dayMaster'], C_STRONG.pillars));
    expect(r.status).toBe('REVIEW_REQUIRED');
    if (r.status === 'REVIEW_REQUIRED') expect(r.reason).toBe('INVALID_NATAL_CONTEXT');
  });

  it('결정론적 — 같은 원국이면 완전히 동일; 입력 불변', () => {
    const snapshot = JSON.stringify(C_STRONG);
    expect(evaluateNatalStrength(C_STRONG)).toEqual(evaluateNatalStrength(C_STRONG));
    expect(JSON.stringify(C_STRONG)).toBe(snapshot); // input not mutated
  });

  it('algorithmVersion + specialPatternPolicy가 결과에 기록된다 (§23)', () => {
    const r = ok(C_STRONG);
    expect(r.algorithmVersion).toBe('deokbunai.myungri-strength.v1');
    expect(r.specialPatternPolicy).toBe('NORMAL_CLASSIFIER_V1');
  });
});
