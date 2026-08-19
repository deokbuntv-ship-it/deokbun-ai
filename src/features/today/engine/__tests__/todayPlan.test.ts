import { deriveDailyPlan } from '@/features/today/engine/todayPlan';
import type { TodayFortuneEvidence } from '@/features/today/engine/todayEvidence';
import type { TenGod } from '@/features/interpretation/saju/derived/contracts';

// Build a synthetic AVAILABLE evidence with a given number of harmony/friction branch relations. The plan
// only reads relation.kind, so minimal fakes are sufficient (cast to the fact shape).
function ev(opts: { harmonies?: number; frictions?: number; stemTenGod?: TenGod; branchTenGod?: TenGod }): TodayFortuneEvidence {
  const branch = [
    ...Array.from({ length: opts.harmonies ?? 0 }, () => ({ position: 'DAY', relation: { kind: 'BRANCH_SIX_COMBINATION' } })),
    ...Array.from({ length: opts.frictions ?? 0 }, () => ({ position: 'DAY', relation: { kind: 'BRANCH_CLASH' } })),
  ];
  return {
    available: true,
    fortuneDate: '2026-08-19',
    timezone: 'Asia/Seoul',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dayLuck: { available: true, pillar: {} as any, tenGods: {} as any, relationsToNatal: { stem: [], branch: branch as any }, dayPillarRuleVersion: 'x' },
    dayStemTenGod: opts.stemTenGod ?? 'DIRECT_WEALTH',
    dayBranchTenGod: opts.branchTenGod ?? 'DIRECT_OFFICER',
    sewoonAvailable: true,
    wolwoonAvailable: true,
    supportedDomains: ['overall', 'work', 'wealth', 'relationship', 'action'],
    evidenceVersion: 'today-evidence@1.0.0',
  } as TodayFortuneEvidence;
}

describe('deriveDailyPlan — transparent tier tally, no fake score (§13/§14)', () => {
  it('clean harmony, no friction → 좋은 흐름', () => {
    const p = deriveDailyPlan(ev({ harmonies: 2, frictions: 0 }));
    expect(p.overallTone).toBe('좋은 흐름');
    expect(p.harmonyCount).toBe(2);
    expect(p.frictionCount).toBe(0);
    expect(p.cautionDomain).toBeNull(); // no friction → no caution domain
  });

  it('no relations at all → 무난한 흐름', () => {
    expect(deriveDailyPlan(ev({ harmonies: 0, frictions: 0 })).overallTone).toBe('무난한 흐름');
  });

  it('mixed with harmony ≥ friction → 변화가 많은 날', () => {
    expect(deriveDailyPlan(ev({ harmonies: 2, frictions: 1 })).overallTone).toBe('변화가 많은 날');
  });

  it('friction dominates → 조심해서 움직일 날, with a caution domain', () => {
    const p = deriveDailyPlan(ev({ harmonies: 0, frictions: 2, branchTenGod: 'SEVEN_KILLINGS' }));
    expect(p.overallTone).toBe('조심해서 움직일 날');
    expect(p.cautionDomain).toBe('work'); // SEVEN_KILLINGS → work
  });

  it('maps the day stem 십신 to the emphasized domain', () => {
    expect(deriveDailyPlan(ev({ stemTenGod: 'DIRECT_WEALTH' })).strongestDomain).toBe('wealth');
    expect(deriveDailyPlan(ev({ stemTenGod: 'EATING_GOD' })).strongestDomain).toBe('action');
    expect(deriveDailyPlan(ev({ stemTenGod: 'PEER' })).strongestDomain).toBe('relationship');
    expect(deriveDailyPlan(ev({ stemTenGod: 'DIRECT_RESOURCE' })).strongestDomain).toBe('overall');
  });

  it('always forbids event certainty and caps highlights/cautions (§18/§21)', () => {
    const p = deriveDailyPlan(ev({}));
    expect(p.forbidEventCertainty).toBe(true);
    expect(p.maxHighlights).toBe(3);
    expect(p.maxCautions).toBe(2);
  });

  it('unavailable evidence → available:false, neutral, no domains (fail-closed)', () => {
    const p = deriveDailyPlan({ available: false, fortuneDate: '2026-08-19', timezone: 'Asia/Seoul', reason: 'CHART_UNAVAILABLE', evidenceVersion: 'today-evidence@1.0.0' });
    expect(p.available).toBe(false);
    expect(p.supportedDomains).toEqual([]);
    expect(p.overallTone).toBe('무난한 흐름');
  });
});
