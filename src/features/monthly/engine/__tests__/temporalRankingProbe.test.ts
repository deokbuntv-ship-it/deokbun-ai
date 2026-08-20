import { createHash } from 'crypto';

import type { BirthInfoDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { buildMonthlyFortuneEvidence } from '@/features/monthly/engine/monthlyEvidence';
import { deriveMonthlyPlan, type MonthlyOverallTier } from '@/features/monthly/engine/monthlyPlan';

const digestProvider: DigestProvider = {
  async sha256Utf8(value: string) {
    return createHash('sha256').update(value, 'utf8').digest('hex');
  },
};

// Fixed, valid SELF used only to exercise the shipped deterministic engine path.
const BIRTH: BirthInfoDraft = {
  displayName: 'probe', gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1990', birthMonth: '6', birthDay: '15', birthTimeAccuracy: 'exact',
  birthHour: '9', birthMinute: '30', approximateTimePeriod: null, birthPlace: '서울',
};

type Candidate = {
  key: string;
  tier: MonthlyOverallTier;
  harmony: number;
  friction: number;
  transitionDate: string | null;
  relationFacts: string[];
};

async function candidate(year: number, month: number): Promise<Candidate> {
  const evidence = await buildMonthlyFortuneEvidence(
    { birthInfo: BIRTH },
    { digestProvider, nowEpochSeconds: 0, target: { year, month } },
  );
  if (!evidence.available) throw new Error(evidence.reason);
  const plan = deriveMonthlyPlan(evidence);
  const dominant = evidence.segments.reduce((selected, segment) =>
    segment.weight >= selected.weight ? segment : selected,
  );
  return {
    key: `${year}-${String(month).padStart(2, '0')}`,
    tier: plan.overallTier,
    harmony: plan.harmonyCount,
    friction: plan.frictionCount,
    transitionDate: evidence.transitionCivilDate,
    relationFacts: [
      ...dominant.relationsToNatal.stem.map((fact) => fact.relation.kind),
      ...dominant.relationsToNatal.branch.map((fact) => fact.relation.kind),
    ],
  };
}

type ProbeDecision = 'NO_MEANINGFUL_DIFFERENCE' | 'NO_DETERMINISTIC_WINNER';

// Test-only decision probe. The shipped rule classifies each candidate but defines no betterness order.
function probeDecision(candidates: Candidate[]): ProbeDecision {
  const first = candidates[0];
  const exactCategoryAndTallyTie = candidates.every((item) =>
    item.tier === first.tier && item.harmony === first.harmony && item.friction === first.friction,
  );
  return exactCategoryAndTallyTie ? 'NO_MEANINGFUL_DIFFERENCE' : 'NO_DETERMINISTIC_WINNER';
}

describe('V1 temporal ranking kernel probe — real monthly engine fixtures', () => {
  it('A: clearly different shipped outputs remain classified facts, not an invented winner', async () => {
    const july = await candidate(2025, 7);
    const august = await candidate(2025, 8);
    expect(july).toMatchObject({ tier: '기회를 살리기 좋은 달', harmony: 3, friction: 0 });
    expect(july.relationFacts).toEqual([
      'BRANCH_SIX_COMBINATION', 'BRANCH_SIX_COMBINATION', 'BRANCH_HALF_THREE_HARMONY',
    ]);
    expect(august).toMatchObject({ tier: '속도를 조절할 달', harmony: 1, friction: 4 });
    expect(august.relationFacts).toEqual([
      'STEM_CLASH', 'BRANCH_HARM', 'BRANCH_SIX_COMBINATION',
      'BRANCH_PUNISHMENT', 'BRANCH_DESTRUCTION',
    ]);
    expect(probeDecision([july, august])).toBe('NO_DETERMINISTIC_WINNER');
  });

  it('B/F: equal DYNAMIC category with different tallies has no deterministic winner', async () => {
    const february = await candidate(2025, 2);
    const september = await candidate(2025, 9);
    expect(february).toMatchObject({ tier: '변화가 많은 달', harmony: 4, friction: 3 });
    expect(september).toMatchObject({ tier: '변화가 많은 달', harmony: 2, friction: 1 });
    expect(probeDecision([february, september])).toBe('NO_DETERMINISTIC_WINNER');
  });

  it('C: multi-year candidates preserve exact ties and never use display order as betterness', async () => {
    const candidates = await Promise.all([
      candidate(2025, 7), candidate(2026, 7), candidate(2027, 7), candidate(2028, 7),
    ]);
    expect(candidates.map(({ key, tier, harmony, friction }) => ({ key, tier, harmony, friction }))).toEqual([
      { key: '2025-07', tier: '기회를 살리기 좋은 달', harmony: 3, friction: 0 },
      { key: '2026-07', tier: '변화가 많은 달', harmony: 4, friction: 1 },
      { key: '2027-07', tier: '변화가 많은 달', harmony: 4, friction: 1 },
      { key: '2028-07', tier: '기회를 살리기 좋은 달', harmony: 3, friction: 0 },
    ]);
    expect(probeDecision(candidates)).toBe('NO_DETERMINISTIC_WINNER');
    expect([...candidates].sort((a, b) => a.key.localeCompare(b.key)).map((item) => item.key))
      .toEqual(['2025-07', '2026-07', '2027-07', '2028-07']);
  });

  it('D: a solar-term-adjacent civil month retains its transition instead of flattening evidence', async () => {
    const august = await candidate(2026, 8);
    expect(august).toMatchObject({
      tier: '속도를 조절할 달', harmony: 2, friction: 4, transitionDate: '2026-08-07',
    });
    expect(august.relationFacts).toEqual([
      'STEM_CLASH', 'STEM_COMBINATION', 'BRANCH_HARM', 'BRANCH_SIX_COMBINATION',
      'BRANCH_PUNISHMENT', 'BRANCH_DESTRUCTION',
    ]);
  });

  it('E: exact category+tally equality produces an explicit non-winner state', async () => {
    const [first, second] = await Promise.all([candidate(2025, 4), candidate(2026, 4)]);
    expect(first).toMatchObject({ tier: '안정적으로 운영할 달', harmony: 0, friction: 0 });
    expect(second).toMatchObject({ tier: '안정적으로 운영할 달', harmony: 0, friction: 0 });
    expect(probeDecision([first, second])).toBe('NO_MEANINGFUL_DIFFERENCE');
  });

  it('rejects h-f as a semantic ranking scalar: distinct categories can have the same difference', async () => {
    const [steady, dynamic] = await Promise.all([candidate(2026, 4), candidate(2026, 2)]);
    expect(steady).toMatchObject({ tier: '안정적으로 운영할 달', harmony: 0, friction: 0 });
    expect(dynamic).toMatchObject({ tier: '변화가 많은 달', harmony: 3, friction: 3 });
    expect(steady.harmony - steady.friction).toBe(0);
    expect(dynamic.harmony - dynamic.friction).toBe(0);
    expect(steady.tier).not.toBe(dynamic.tier);
  });
});
