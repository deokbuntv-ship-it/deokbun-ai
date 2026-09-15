// Deterministic pairwise compatibility ENGINE (owner §80/§81). Synthetic non-PII charts of KNOWN
// relations lock: the cross-chart relation facts, the transparent tally→tier, determinism, the
// fail-closed unavailable path, and reduced-precision on unknown 시주. ZERO LLM anywhere.
import type { NatalPillarContext } from '@/features/myungri';
import type { SajuEngineResult, SajuFiveElementCounts } from '@/features/interpretation';

import { computePairwiseRelations } from '../pairwiseRelations';
import { deriveCompatibilityAssessment } from '../compatibilityTiers';
import { buildCompatibilityEvidence } from '../compatibilityEvidence';
import type { PersonPairwiseInput } from '../types';

// ── fixtures ─────────────────────────────────────────────────────────────────
const counts = (
  WOOD: number, FIRE: number, EARTH: number, METAL: number, WATER: number,
): SajuFiveElementCounts => ({ WOOD, FIRE, EARTH, METAL, WATER });

// Uniform chart: every pillar the same stem/branch (keeps cross relations pure & predictable).
const uniformNatal = (stem: string, branch: string, withHour = true): NatalPillarContext => {
  const cell = { stem: stem as never, branch: branch as never };
  const natal: NatalPillarContext = {
    dayMaster: stem as never,
    pillars: { year: cell, month: cell, day: cell },
  };
  if (withHour) natal.pillars.hour = cell;
  return natal;
};

const person = (
  natal: NatalPillarContext, c: SajuFiveElementCounts, hourKnown = true,
): PersonPairwiseInput => ({ natal, elementCounts: c, hourKnown });

describe('computePairwiseRelations — cross-chart facts', () => {
  it('일간합 + 일지육합 + 오행 상호보완 are all detected', () => {
    // self 甲子 / target 己丑 → 甲己 천간합, 子丑 육합.
    const self = person(uniformNatal('JIA', 'ZI'), counts(4, 2, 1, 1, 0)); // WATER 0
    const target = person(uniformNatal('JI', 'CHOU'), counts(0, 1, 2, 2, 3)); // WOOD 0
    const facts = computePairwiseRelations(self, target)!;

    expect(facts.dayStemRelation?.kind).toBe('STEM_COMBINATION');
    expect(facts.dayBranchRelations.map((r) => r.kind)).toContain('BRANCH_SIX_COMBINATION');
    // 오행 보완 both directions
    expect(facts.elementComplement.selfSuppliesTarget).toContain('WOOD'); // target lacks WOOD, self has 4
    expect(facts.elementComplement.targetSuppliesSelf).toContain('WATER'); // self lacks WATER, target has 3
    // 십신 both directions computed (non-null for valid day masters)
    expect(facts.tenGodTargetToSelf).not.toBeNull();
    expect(facts.tenGodSelfToTarget).not.toBeNull();
  });

  it('일간충 + 일지충 are detected as clashes', () => {
    // self 甲子 / target 庚午 → 甲庚 천간충, 子午 육충.
    const self = person(uniformNatal('JIA', 'ZI'), counts(4, 4, 0, 0, 0));
    const target = person(uniformNatal('GENG', 'WU'), counts(4, 4, 0, 0, 0));
    const facts = computePairwiseRelations(self, target)!;
    expect(facts.dayStemRelation?.kind).toBe('STEM_CLASH');
    expect(facts.dayBranchRelations.map((r) => r.kind)).toContain('BRANCH_CLASH');
  });

  it('is deterministic — identical inputs produce identical facts', () => {
    const self = person(uniformNatal('JIA', 'ZI'), counts(4, 2, 1, 1, 0));
    const target = person(uniformNatal('JI', 'CHOU'), counts(0, 1, 2, 2, 3));
    expect(computePairwiseRelations(self, target)).toEqual(computePairwiseRelations(self, target));
  });
});

describe('deriveCompatibilityAssessment — transparent tally → tier (no fabricated %)', () => {
  it('harmony pair (합 + 보완, no clash) → VERY_GOOD, all dimensions positive', () => {
    const self = person(uniformNatal('JIA', 'ZI'), counts(4, 2, 1, 1, 0));
    const target = person(uniformNatal('JI', 'CHOU'), counts(0, 1, 2, 2, 3));
    const a = deriveCompatibilityAssessment(computePairwiseRelations(self, target)!);

    expect(a.overall).toBe('VERY_GOOD');
    expect(a.overallLabel).toBe('매우 잘 맞는 편');
    expect(a.dimensions.map((d) => d.key)).toEqual(['BOND', 'FRICTION', 'ELEMENT']);
    expect(a.dimensions.find((d) => d.key === 'BOND')!.signal).toBe('POSITIVE');
    expect(a.dimensions.find((d) => d.key === 'FRICTION')!.signal).toBe('POSITIVE');
    // every dimension exposes its tally facts (transparency, not a mystic score)
    expect(a.dimensions.every((d) => d.tally.length > 0)).toBe(true);
    expect(a.reducedPrecision).toBe(false);
  });

  it('clash-dominated pair → CHALLENGING with 갈등 WATCH', () => {
    const self = person(uniformNatal('JIA', 'ZI'), counts(4, 4, 0, 0, 0));
    const target = person(uniformNatal('GENG', 'WU'), counts(4, 4, 0, 0, 0));
    const a = deriveCompatibilityAssessment(computePairwiseRelations(self, target)!);
    expect(a.overall).toBe('CHALLENGING');
    expect(a.overallLabel).toBe('갈등 관리가 중요한 편');
    expect(a.dimensions.find((d) => d.key === 'FRICTION')!.signal).toBe('WATCH');
  });

  it('unknown 시주 on either side → reducedPrecision true', () => {
    const self = person(uniformNatal('JIA', 'ZI', false), counts(2, 2, 2, 1, 1), false);
    const target = person(uniformNatal('JI', 'CHOU'), counts(1, 1, 2, 2, 2));
    const a = deriveCompatibilityAssessment(computePairwiseRelations(self, target)!);
    expect(a.reducedPrecision).toBe(true);
  });
});

// Minimal SUCCESS/UNAVAILABLE engine-result fixtures (adapter only reads fourPillars + counts).
const cellPillar = (stem: string, branch: string) => ({ index: 0, stem, branch });
const fakeSuccess = (
  stem: string, branch: string, c: SajuFiveElementCounts, hourKnown = true,
): SajuEngineResult =>
  ({
    status: 'SUCCESS',
    output: {
      fourPillars: {
        year: cellPillar(stem, branch),
        month: cellPillar(stem, branch),
        day: cellPillar(stem, branch),
        hour: hourKnown
          ? { status: 'AVAILABLE', pillar: cellPillar(stem, branch) }
          : { status: 'UNAVAILABLE', reason: 'UNKNOWN_BIRTH_TIME' },
      },
      fiveElementDistribution: { direct: { counts: c } },
    },
  }) as unknown as SajuEngineResult;

describe('buildCompatibilityEvidence — EngineEvidence-shaped adapter', () => {
  it('available pair → evidence sections + assessment (relationship answer, not two dumps)', () => {
    const res = buildCompatibilityEvidence(
      { engineResult: fakeSuccess('JIA', 'ZI', counts(4, 2, 1, 1, 0)), label: '본인' },
      { engineResult: fakeSuccess('JI', 'CHOU', counts(0, 1, 2, 2, 3)), label: '상대방' },
    );
    expect(res.availability).toBe('available');
    if (res.availability !== 'available') return;
    expect(res.assessment.overall).toBe('VERY_GOOD');
    const labels = res.evidence.sections!.map((s) => s.label);
    expect(labels).toContain('일주 궁합(핵심)');
    expect(labels).toContain('분야별 궁합(정서·갈등·오행)');
    expect(labels).toContain('종합 궁합');
    // never leaks a raw engine object; summary names both people
    expect(res.evidence.summary).toContain('본인');
    expect(res.evidence.summary).toContain('상대방');
    expect(res.evidence.hasTimingEvidence).toBe(false); // pairwise reading is natal/timeless
  });

  it('fail-closed: an UNAVAILABLE chart → unavailable (never a fabricated pair verdict)', () => {
    const bad = { status: 'UNAVAILABLE' } as unknown as SajuEngineResult;
    const res = buildCompatibilityEvidence(
      { engineResult: bad, label: '본인' },
      { engineResult: fakeSuccess('JI', 'CHOU', counts(1, 1, 1, 1, 1)), label: '상대방' },
    );
    expect(res.availability).toBe('unavailable');
  });
});
