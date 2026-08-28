// 현재 운의 영향 — 원국 baseline과 대운/세운 영향의 분리 검증 (§41). 핵심: 운이 바뀌어도 원국 label은 불변.
// Imports directly from the service file, NOT the public barrel — currentStrength.ts is quarantined
// (P0-07, NON_AUTHORITY / REFERENCE_ONLY) and no longer exported from '../index'.
import { buildCurrentStrengthContext } from '../services/currentStrength';
import type { NatalPillarContext } from '../index';
import type { PillarTenGodProfile } from '../domain/contracts';

// 원국: 실령·무근·타군 → EXTREMELY_WEAK (natal test C2와 동일 구조).
const natal: NatalPillarContext = {
  dayMaster: 'JIA',
  pillars: {
    year: { stem: 'BING', branch: 'SHEN' }, month: { stem: 'GENG', branch: 'SHEN' },
    day: { stem: 'JIA', branch: 'WU' }, hour: { stem: 'WU', branch: 'XU' },
  },
};

const profile = (stemTenGod: PillarTenGodProfile['stemTenGod'], branchMainTenGod: PillarTenGodProfile['branchMainTenGod']): PillarTenGodProfile => ({
  stem: 'JIA', branch: 'ZI', stemTenGod, branchMainTenGod, hiddenStemTenGods: [],
});
const supportive = profile('PEER', 'INDIRECT_RESOURCE'); // 비겁 + 인성 → SUPPORTIVE
const draining = profile('SEVEN_KILLINGS', 'DIRECT_WEALTH'); // 관 + 재 → DRAINING
const mixed = profile('PEER', 'DIRECT_OFFICER'); // 비겁 + 관 → MIXED

describe('현재 운 영향 — 원국/운 분리', () => {
  it('대운이 지원↔약화로 바뀌어도 원국 label·근거는 불변 (§25)', () => {
    const a = buildCurrentStrengthContext({ natal, daewoon: { label: '제3대운', profile: supportive } });
    const b = buildCurrentStrengthContext({ natal, daewoon: { label: '제4대운', profile: draining } });
    expect(a.natalStrength).toEqual(b.natalStrength); // 원국 완전 동일
    if (a.natalStrength.status === 'CLASSIFIED') expect(a.natalStrength.label).toBe('EXTREMELY_WEAK');
    expect(a.daewoon?.direction).toBe('SUPPORTIVE');
    expect(b.daewoon?.direction).toBe('DRAINING'); // 대운 영향만 독립적으로 변함
  });

  it('세운이 바뀌어도 원국 불변; 세운 영향만 독립적으로 변함 (§26)', () => {
    const a = buildCurrentStrengthContext({ natal, sewoon: { label: '2026', profile: supportive } });
    const b = buildCurrentStrengthContext({ natal, sewoon: { label: '2027', profile: draining } });
    expect(a.natalStrength).toEqual(b.natalStrength);
    expect(a.sewoon?.direction).toBe('SUPPORTIVE');
    expect(b.sewoon?.direction).toBe('DRAINING');
  });

  it('combinedDirection이 대운·세운 조합으로 결정 (원국 label과 별개)', () => {
    expect(buildCurrentStrengthContext({ natal, daewoon: { label: 'd', profile: supportive }, sewoon: { label: 's', profile: supportive } }).combinedDirection).toBe('MORE_SUPPORTED');
    expect(buildCurrentStrengthContext({ natal, daewoon: { label: 'd', profile: draining }, sewoon: { label: 's', profile: draining } }).combinedDirection).toBe('MORE_DRAINED');
    expect(buildCurrentStrengthContext({ natal, daewoon: { label: 'd', profile: supportive }, sewoon: { label: 's', profile: draining } }).combinedDirection).toBe('MIXED');
    expect(buildCurrentStrengthContext({ natal }).combinedDirection).toBe('STABLE'); // 운 정보 없음
  });

  it('천간/지지 십신 방향이 엇갈리면 MIXED', () => {
    const r = buildCurrentStrengthContext({ natal, daewoon: { label: 'd', profile: mixed } });
    expect(r.daewoon?.direction).toBe('MIXED');
  });

  it('운 미상이면 경고를 남기되 원국 판정은 유지 (fail-open on luck only)', () => {
    const r = buildCurrentStrengthContext({ natal });
    expect(r.daewoon).toBeNull();
    expect(r.sewoon).toBeNull();
    expect(r.warnings.join()).toMatch(/대운 미상[\s\S]*세운 미상/);
    expect(r.natalStrength.status).toBe('CLASSIFIED'); // 원국은 여전히 판정됨
  });

  it('결정론적', () => {
    const mk = () => buildCurrentStrengthContext({ natal, daewoon: { label: 'd', profile: supportive }, sewoon: { label: 's', profile: draining } });
    expect(mk()).toEqual(mk());
  });
});
