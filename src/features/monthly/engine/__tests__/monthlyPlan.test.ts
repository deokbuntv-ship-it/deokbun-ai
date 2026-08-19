import { deriveMonthlyPlan } from '@/features/monthly/engine/monthlyPlan';
import type { MonthlyFortuneEvidence } from '@/features/monthly/engine/monthlyEvidence';
import type { TenGod } from '@/features/interpretation/saju/derived/contracts';

// Synthetic AVAILABLE evidence with N harmony/friction branch relations. The plan only reads relation.kind.
function ev(opts: { harmonies?: number; frictions?: number; stemTenGod?: TenGod; branchTenGod?: TenGod }): MonthlyFortuneEvidence {
  const branch = [
    ...Array.from({ length: opts.harmonies ?? 0 }, () => ({ position: 'DAY', relation: { kind: 'BRANCH_SIX_COMBINATION' } })),
    ...Array.from({ length: opts.frictions ?? 0 }, () => ({ position: 'DAY', relation: { kind: 'BRANCH_CLASH' } })),
  ];
  return {
    available: true, year: 2026, month: 8, timezone: 'Asia/Seoul',
    monthStemTenGod: opts.stemTenGod ?? 'DIRECT_WEALTH',
    monthBranchTenGod: opts.branchTenGod ?? 'DIRECT_OFFICER',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    monthRelationsToNatal: { stem: [], branch: branch as any },
    sewoonAvailable: true,
    supportedDomains: ['overall', 'work', 'wealth', 'relationship', 'action'],
    evidenceVersion: 'monthly-evidence@1.0.0',
  } as MonthlyFortuneEvidence;
}

describe('deriveMonthlyPlan — transparent tier tally, no fake score (§13/§14)', () => {
  it('clean harmony → 기회를 살리기 좋은 달; none → 안정적으로 운영할 달; mixed → 변화가 많은 달; friction → 속도를 조절할 달', () => {
    expect(deriveMonthlyPlan(ev({ harmonies: 2, frictions: 0 })).overallTier).toBe('기회를 살리기 좋은 달');
    expect(deriveMonthlyPlan(ev({ harmonies: 0, frictions: 0 })).overallTier).toBe('안정적으로 운영할 달');
    expect(deriveMonthlyPlan(ev({ harmonies: 2, frictions: 1 })).overallTier).toBe('변화가 많은 달');
    expect(deriveMonthlyPlan(ev({ harmonies: 0, frictions: 2 })).overallTier).toBe('속도를 조절할 달');
  });

  it('derives a deterministic action mode from tempo × emphasis (§12), never the LLM', () => {
    expect(deriveMonthlyPlan(ev({ harmonies: 1, frictions: 0, stemTenGod: 'DIRECT_OFFICER' })).primaryMode).toBe('EXPAND');
    expect(deriveMonthlyPlan(ev({ harmonies: 1, frictions: 0, stemTenGod: 'EATING_GOD' })).primaryMode).toBe('EXPAND');
    expect(deriveMonthlyPlan(ev({ harmonies: 1, frictions: 0, stemTenGod: 'DIRECT_WEALTH' })).primaryMode).toBe('MANAGE');
    expect(deriveMonthlyPlan(ev({ harmonies: 1, frictions: 0, stemTenGod: 'DIRECT_RESOURCE' })).primaryMode).toBe('MANAGE');
    expect(deriveMonthlyPlan(ev({ harmonies: 1, frictions: 0, stemTenGod: 'PEER' })).primaryMode).toBe('CONNECT');
    expect(deriveMonthlyPlan(ev({ harmonies: 2, frictions: 1, stemTenGod: 'DIRECT_OFFICER' })).primaryMode).toBe('ADJUST');
    expect(deriveMonthlyPlan(ev({ harmonies: 0, frictions: 2, stemTenGod: 'DIRECT_OFFICER' })).primaryMode).toBe('STABILIZE');
  });

  it('exposes a Korean mode label consistent with the mode', () => {
    const p = deriveMonthlyPlan(ev({ harmonies: 1, frictions: 0, stemTenGod: 'DIRECT_WEALTH' }));
    expect(p.primaryMode).toBe('MANAGE');
    expect(p.primaryModeLabel).toBe('점검·관리');
  });

  it('domainSignals ≤2, deterministic, no fabricated 5-domain matrix (§13-§16)', () => {
    expect(deriveMonthlyPlan(ev({ harmonies: 2, frictions: 0, stemTenGod: 'DIRECT_WEALTH' })).domainSignals).toEqual([
      { domain: 'wealth', status: '좋음' },
    ]);
    expect(
      deriveMonthlyPlan(ev({ harmonies: 0, frictions: 2, stemTenGod: 'DIRECT_WEALTH', branchTenGod: 'SEVEN_KILLINGS' })).domainSignals,
    ).toEqual([
      { domain: 'wealth', status: '무난' },
      { domain: 'work', status: '주의' },
    ]);
  });

  it('always forbids event certainty + exact dates and caps the sections (§24/§32)', () => {
    const p = deriveMonthlyPlan(ev({}));
    expect(p.forbidEventCertainty).toBe(true);
    expect(p.forbidExactDates).toBe(true);
    expect(p.maxOpportunities).toBe(3);
    expect(p.maxCautions).toBe(2);
    expect(p.maxActions).toBe(3);
  });

  it('unavailable evidence → available:false, neutral, no domains (fail-closed)', () => {
    const p = deriveMonthlyPlan({ available: false, year: 2026, month: 8, timezone: 'Asia/Seoul', reason: 'WOLWOON_INVALID_MONTH_ORDINAL', evidenceVersion: 'monthly-evidence@1.0.0' });
    expect(p.available).toBe(false);
    expect(p.supportedDomains).toEqual([]);
    expect(p.overallTier).toBe('안정적으로 운영할 달');
  });
});
