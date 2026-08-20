// Sprint C §2 — CHARACTERIZATION baseline. Freezes the CURRENTLY SHIPPED Today + Monthly polarity semantics
// (harmony/friction tally over stem+branch relations → 4-way tier) BEFORE the shared kernel is extracted, so
// the refactor is provably behavior-preserving. These expected values must NOT be edited to make a refactor
// pass — a change here means production semantics changed.
import { deriveDailyPlan } from '@/features/today/engine/todayPlan';
import type { TodayFortuneEvidence } from '@/features/today/engine/todayEvidence';
import { deriveMonthlyPlan } from '@/features/monthly/engine/monthlyPlan';
import type { MonthlyFortuneEvidence } from '@/features/monthly/engine/monthlyEvidence';

type Rel = { stemH?: number; stemF?: number; branchH?: number; branchF?: number };
const rel = (o: Rel) => ({
  stem: [
    ...Array.from({ length: o.stemH ?? 0 }, () => ({ position: 'DAY', relation: { kind: 'STEM_COMBINATION' } })),
    ...Array.from({ length: o.stemF ?? 0 }, () => ({ position: 'DAY', relation: { kind: 'STEM_CLASH' } })),
  ],
  branch: [
    ...Array.from({ length: o.branchH ?? 0 }, () => ({ position: 'DAY', relation: { kind: 'BRANCH_SIX_COMBINATION' } })),
    ...Array.from({ length: o.branchF ?? 0 }, () => ({ position: 'DAY', relation: { kind: 'BRANCH_CLASH' } })),
  ],
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const todayEv = (o: Rel): TodayFortuneEvidence => ({
  available: true, fortuneDate: '2026-08-19', timezone: 'Asia/Seoul',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dayLuck: { available: true, pillar: {} as any, tenGods: {} as any, relationsToNatal: rel(o) as any, dayPillarRuleVersion: 'x' },
  dayStemTenGod: 'DIRECT_WEALTH', dayBranchTenGod: 'DIRECT_OFFICER',
  sewoonAvailable: true, wolwoonAvailable: true,
  supportedDomains: ['overall', 'work', 'wealth', 'relationship', 'action'], evidenceVersion: 'today-evidence@1.0.0',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any;

const monthlyEv = (o: Rel): MonthlyFortuneEvidence => ({
  available: true, year: 2026, month: 8, timezone: 'Asia/Seoul',
  segments: [{
    sajuMonthOrdinal: 7, durationSeconds: 1000, weight: 1, startCivilDate: '2026-08-01',
    stemTenGod: 'DIRECT_WEALTH', branchTenGod: 'DIRECT_OFFICER',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    relationsToNatal: rel(o) as any,
  }],
  transitionCivilDate: null, sewoonAvailable: true,
  supportedDomains: ['overall', 'work', 'wealth', 'relationship', 'action'], evidenceVersion: 'monthly-evidence@1.1.0',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any;

// (relations) → [expected harmony, expected friction, Today tone, Monthly tier]. Covers stem-only,
// branch-only, mixed, the exact tie (h===f → DYNAMIC), and friction-dominant (h<f → CAUTION).
const CASES: [Rel, number, number, string, string][] = [
  [{ stemH: 1, branchH: 1 }, 2, 0, '좋은 흐름', '기회를 살리기 좋은 달'], // FAVORABLE (stem harmony counts)
  [{}, 0, 0, '무난한 흐름', '안정적으로 운영할 달'], // STEADY
  [{ stemF: 1 }, 0, 1, '조심해서 움직일 날', '속도를 조절할 달'], // CAUTION (stem friction counts, h<f)
  [{ branchH: 1, stemF: 1 }, 1, 1, '변화가 많은 날', '변화가 많은 달'], // DYNAMIC (exact tie h===f)
  [{ stemH: 2, branchH: 0, stemF: 0, branchF: 3 }, 2, 3, '조심해서 움직일 날', '속도를 조절할 달'], // CAUTION (h<f)
  [{ branchH: 2, branchF: 2 }, 2, 2, '변화가 많은 날', '변화가 많은 달'], // DYNAMIC (h===f, branch only)
  [{ stemH: 1 }, 1, 0, '좋은 흐름', '기회를 살리기 좋은 달'], // FAVORABLE (single stem harmony)
];

describe('CHARACTERIZATION — Today polarity tally (frozen pre-refactor behavior)', () => {
  it.each(CASES)('%o → h/f + tone', (relations, h, f, tone) => {
    const p = deriveDailyPlan(todayEv(relations));
    expect(p.harmonyCount).toBe(h);
    expect(p.frictionCount).toBe(f);
    expect(p.overallTone).toBe(tone);
  });
});

describe('CHARACTERIZATION — Monthly polarity tally (frozen pre-refactor behavior)', () => {
  it.each(CASES)('%o → h/f + tier', (relations, h, f, _tone, tier) => {
    const p = deriveMonthlyPlan(monthlyEv(relations));
    expect(p.harmonyCount).toBe(h);
    expect(p.frictionCount).toBe(f);
    expect(p.overallTier).toBe(tier);
  });
});
