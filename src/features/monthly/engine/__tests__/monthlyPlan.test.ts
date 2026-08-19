import { deriveMonthlyPlan } from '@/features/monthly/engine/monthlyPlan';
import type { MonthlyFortuneEvidence, MonthlySegmentEvidence } from '@/features/monthly/engine/monthlyEvidence';
import type { TenGod } from '@/features/interpretation/saju/derived/contracts';

type SegOpts = { harmonies?: number; frictions?: number; stemTenGod?: TenGod; branchTenGod?: TenGod; weight?: number; date?: string };

function seg(o: SegOpts): MonthlySegmentEvidence {
  const branch = [
    ...Array.from({ length: o.harmonies ?? 0 }, () => ({ position: 'DAY', relation: { kind: 'BRANCH_SIX_COMBINATION' } })),
    ...Array.from({ length: o.frictions ?? 0 }, () => ({ position: 'DAY', relation: { kind: 'BRANCH_CLASH' } })),
  ];
  return {
    sajuMonthOrdinal: 7,
    durationSeconds: Math.round((o.weight ?? 1) * 1000),
    weight: o.weight ?? 1,
    startCivilDate: o.date ?? '2026-08-01',
    stemTenGod: o.stemTenGod ?? 'DIRECT_WEALTH',
    branchTenGod: o.branchTenGod ?? 'DIRECT_OFFICER',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    relationsToNatal: { stem: [], branch: branch as any },
  };
}

const DOMAINS = ['overall', 'work', 'wealth', 'relationship', 'action'];

function evOne(o: SegOpts): MonthlyFortuneEvidence {
  return {
    available: true, year: 2026, month: 8, timezone: 'Asia/Seoul',
    segments: [seg({ ...o, weight: 1 })], transitionCivilDate: null,
    sewoonAvailable: true, supportedDomains: DOMAINS, evidenceVersion: 'monthly-evidence@1.1.0',
  } as MonthlyFortuneEvidence;
}

function evTwo(early: SegOpts, later: SegOpts, transitionCivilDate = '2026-08-07'): MonthlyFortuneEvidence {
  return {
    available: true, year: 2026, month: 8, timezone: 'Asia/Seoul',
    segments: [seg({ ...early, date: '2026-08-01' }), seg({ ...later, date: transitionCivilDate })],
    transitionCivilDate,
    sewoonAvailable: true, supportedDomains: DOMAINS, evidenceVersion: 'monthly-evidence@1.1.0',
  } as MonthlyFortuneEvidence;
}

describe('deriveMonthlyPlan — single-segment month (transparent tier tally, no fake score)', () => {
  it('tier mapping', () => {
    expect(deriveMonthlyPlan(evOne({ harmonies: 2, frictions: 0 })).overallTier).toBe('기회를 살리기 좋은 달');
    expect(deriveMonthlyPlan(evOne({ harmonies: 0, frictions: 0 })).overallTier).toBe('안정적으로 운영할 달');
    expect(deriveMonthlyPlan(evOne({ harmonies: 2, frictions: 1 })).overallTier).toBe('변화가 많은 달');
    expect(deriveMonthlyPlan(evOne({ harmonies: 0, frictions: 2 })).overallTier).toBe('속도를 조절할 달');
  });

  it('mode + domain signals', () => {
    expect(deriveMonthlyPlan(evOne({ harmonies: 1, frictions: 0, stemTenGod: 'DIRECT_OFFICER' })).primaryMode).toBe('EXPAND');
    expect(deriveMonthlyPlan(evOne({ harmonies: 1, frictions: 0, stemTenGod: 'DIRECT_WEALTH' })).primaryMode).toBe('MANAGE');
    expect(deriveMonthlyPlan(evOne({ harmonies: 1, frictions: 0, stemTenGod: 'PEER' })).primaryMode).toBe('CONNECT');
    expect(deriveMonthlyPlan(evOne({ harmonies: 2, frictions: 1 })).primaryMode).toBe('ADJUST');
    expect(deriveMonthlyPlan(evOne({ harmonies: 0, frictions: 2 })).primaryMode).toBe('STABILIZE');
    expect(deriveMonthlyPlan(evOne({ harmonies: 2, frictions: 0, stemTenGod: 'DIRECT_WEALTH' })).domainSignals).toEqual([{ domain: 'wealth', status: '좋음' }]);
  });

  it('single segment → no transition; caps + guards set', () => {
    const p = deriveMonthlyPlan(evOne({ harmonies: 1, frictions: 0 }));
    expect(p.segmentCount).toBe(1);
    expect(p.hasMeaningfulTransition).toBe(false);
    expect(p.transition).toBeNull();
    expect(p.forbidEventCertainty).toBe(true);
    expect(p.forbidExactDates).toBe(true);
    expect(p.maxOpportunities).toBe(3);
  });

  it('unavailable evidence → available:false, neutral', () => {
    const p = deriveMonthlyPlan({ available: false, year: 2026, month: 8, timezone: 'Asia/Seoul', reason: 'CIVIL_MONTH_SEGMENTS_UNAVAILABLE', evidenceVersion: 'monthly-evidence@1.1.0' });
    expect(p.available).toBe(false);
    expect(p.segmentCount).toBe(0);
    expect(p.overallTier).toBe('안정적으로 운영할 달');
  });
});

describe('deriveMonthlyPlan — full civil-month coverage across the 節 boundary (§5/§6)', () => {
  it('two DIFFERENT segments → dominant sets the headline + a transition is exposed', () => {
    // early (0.2 weight, friction) then later (0.8, good) → dominant = later (good).
    const p = deriveMonthlyPlan(evTwo({ harmonies: 0, frictions: 2, weight: 0.2 }, { harmonies: 2, frictions: 0, weight: 0.8 }));
    expect(p.segmentCount).toBe(2);
    expect(p.overallTier).toBe('기회를 살리기 좋은 달'); // dominant later
    expect(p.hasMeaningfulTransition).toBe(true);
    expect(p.transition).toEqual({
      transitionCivilDate: '2026-08-07',
      early: { tier: '속도를 조절할 달', modeLabel: '정비·속도조절', strongestDomain: 'wealth' },
      later: { tier: '기회를 살리기 좋은 달', modeLabel: '점검·관리', strongestDomain: 'wealth' },
    });
  });

  it('two segments in the SAME practical direction → one clean judgment, no manufactured transition (§6)', () => {
    const p = deriveMonthlyPlan(evTwo({ harmonies: 2, frictions: 0, weight: 0.3 }, { harmonies: 2, frictions: 0, weight: 0.7 }));
    expect(p.segmentCount).toBe(2);
    expect(p.hasMeaningfulTransition).toBe(false);
    expect(p.transition).toBeNull();
    expect(p.overallTier).toBe('기회를 살리기 좋은 달');
  });

  it('duration weighting: the LARGER-share early segment drives the headline even when the later one differs', () => {
    const p = deriveMonthlyPlan(evTwo(
      { harmonies: 2, frictions: 0, weight: 0.7, stemTenGod: 'DIRECT_OFFICER' },
      { harmonies: 0, frictions: 2, weight: 0.3, branchTenGod: 'SEVEN_KILLINGS' },
    ));
    expect(p.overallTier).toBe('기회를 살리기 좋은 달'); // dominant = early (0.7)
    expect(p.primaryMode).toBe('EXPAND');
    expect(p.hasMeaningfulTransition).toBe(true); // still differ → transition retained
    expect(p.transition?.later.tier).toBe('속도를 조절할 달');
  });
});
