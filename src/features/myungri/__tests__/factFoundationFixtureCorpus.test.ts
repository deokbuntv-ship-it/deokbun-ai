// LARGE DETERMINISTIC FACT FIXTURE CORPUS (HARDENING §18).
//
// At least 500 deterministic chart fixtures, each verifying only that the fact bundle stays PURE
// (AVAILABLE, no forbidden key/value, internally consistent) — NOT 500 strength judgments; no
// strength/pattern/Yongshin verdict is computed or asserted anywhere in this file.
//
// Generation is fully deterministic (no Math.random()/Date.now()): 10 Heavenly Stems (as Day
// Master) × 12 month branches × 5 structural variants = 600 fixtures. Each variant shifts the
// year/day/hour pillars by a distinct fixed offset, so the corpus naturally sweeps through every
// hidden-stem role, every TenGod mapping, every supported relation kind, multi-relation charts,
// multi-root charts, and zero-relation/zero-root charts — without hand-authoring each one.
import { HEAVENLY_STEMS, EARTHLY_BRANCHES, type HeavenlyStem, type EarthlyBranch } from '../../interpretation';
import { buildMyungriStrengthFactBundle, type NatalPillarContext } from '../index';
import { ALL_SUPPORTED_RELATION_KINDS } from '../contracts/factLayerTypeFirewall';

const stemAt = (i: number): HeavenlyStem => HEAVENLY_STEMS[((i % 10) + 10) % 10];
const branchAt = (i: number): EarthlyBranch => EARTHLY_BRANCHES[((i % 12) + 12) % 12];

/** 5 deterministic structural variants — each a distinct fixed offset pattern applied to the other
 *  three pillars relative to the day pillar, so the corpus sweeps varied relation/root topology. */
const VARIANTS: ReadonlyArray<{ label: string; yearOff: number; monthStemOff: number; hourOff: number; hourStemOff: number }> = [
  { label: 'v0', yearOff: 6, monthStemOff: 2, hourOff: 3, hourStemOff: 5 },
  { label: 'v1', yearOff: 1, monthStemOff: 4, hourOff: 7, hourStemOff: 1 },
  { label: 'v2', yearOff: 0, monthStemOff: 0, hourOff: 0, hourStemOff: 0 }, // same branch repeated everywhere — maximal coincidence
  { label: 'v3', yearOff: 8, monthStemOff: 6, hourOff: 5, hourStemOff: 9 },
  { label: 'v4', yearOff: 11, monthStemOff: 8, hourOff: 2, hourStemOff: 3 },
];

function buildFixture(
  dayMasterIndex: number, monthBranchIndex: number,
  variant: (typeof VARIANTS)[number],
): NatalPillarContext {
  const dayMaster = stemAt(dayMasterIndex);
  const monthBranch = branchAt(monthBranchIndex);
  return {
    dayMaster,
    pillars: {
      year: { stem: stemAt(dayMasterIndex + variant.yearOff), branch: branchAt(monthBranchIndex + variant.yearOff) },
      month: { stem: stemAt(dayMasterIndex + variant.monthStemOff), branch: monthBranch },
      day: { stem: dayMaster, branch: branchAt(monthBranchIndex + dayMasterIndex) },
      hour: {
        stem: stemAt(dayMasterIndex + variant.hourStemOff),
        branch: branchAt(monthBranchIndex + variant.hourOff),
      },
    },
  };
}

const FORBIDDEN_KEY_PATTERN =
  /"(transformed|transformationSucceeded|transformationSuccessful|huaCheng|huaChengLi|bureauFormed|structuralElement|combinationSuccessful|effect|functionalEffect|rootDestroyed|rootWeakened|rootSurvived|rootStrength|rootRank|rootSurvivability|functionalForce|structuralDominance|weak|strong|balanced|strength|confidence|specialPatternStatus|specialPatternConfirmed|congCaiCandidate|congGuanShaCandidate|congErCandidate|specialPatternScore)":/i;
const FORBIDDEN_VALUE_PATTERN =
  /\bWEAK\b|\bSTRONG\b|\bBALANCED\b|극신약|신약|중화신약|중화신강|신강|극신강|SPECIAL_PATTERN_CONFIRMED|SPECIAL_PATTERN_REJECTED|CONGCAI|CONGGUANSHA|CONGER|ZHUANWANG|YONGSHIN|억부용신|조후용신|통관용신|병약용신|희신|기신|從强|從財|從官殺|從兒|專旺|眞從|假從/;

type FixtureEntry = { id: string; natal: NatalPillarContext };

const CORPUS: FixtureEntry[] = [];
for (let dmIdx = 0; dmIdx < 10; dmIdx += 1) {
  for (let monthIdx = 0; monthIdx < 12; monthIdx += 1) {
    for (const variant of VARIANTS) {
      const natal = buildFixture(dmIdx, monthIdx, variant);
      CORPUS.push({
        id: `${natal.dayMaster}/month=${natal.pillars.month.branch}/${variant.label}`,
        natal,
      });
    }
  }
}

describe(`deterministic fixture corpus (${CORPUS.length} fixtures, HARDENING §18)`, () => {
  it(`generates at least 500 fixtures (actual: ${CORPUS.length})`, () => {
    expect(CORPUS.length).toBeGreaterThanOrEqual(500);
  });

  it('every fixture id is unique (no accidental duplicate coverage silently shrinking the corpus)', () => {
    const ids = CORPUS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const { id, natal } of CORPUS) {
    it(`${id}: bundle is AVAILABLE, internally consistent, and carries zero forbidden key/value`, () => {
      const result = buildMyungriStrengthFactBundle(natal);
      expect(result.capability).toBe('AVAILABLE');
      if (result.capability !== 'AVAILABLE') return;

      const { bundle } = result;
      expect(bundle.chart).toEqual(natal);
      expect(bundle.sameElementRooting.dayMaster.stem).toBe(natal.dayMaster);
      expect(bundle.tenGodFacts.dayMaster).toBe(natal.dayMaster);

      // internal factId uniqueness within each provider's own array — a purity/consistency check,
      // not a strength judgment.
      const rootingIds = bundle.sameElementRooting.branches.flatMap((b) => b.hiddenStems).map((h) => h.factId);
      expect(new Set(rootingIds).size).toBe(rootingIds.length);
      const tenGodIds = [...bundle.tenGodFacts.visibleStems, ...bundle.tenGodFacts.hiddenStems].map((f) => f.factId);
      expect(new Set(tenGodIds).size).toBe(tenGodIds.length);

      const json = JSON.stringify(bundle);
      expect(FORBIDDEN_KEY_PATTERN.test(json)).toBe(false);
      expect(FORBIDDEN_VALUE_PATTERN.test(json)).toBe(false);
    });
  }

  it('the corpus covers all 10 Heavenly Stems as Day Master', () => {
    const seen = new Set(CORPUS.map((f) => f.natal.dayMaster));
    expect(seen.size).toBe(10);
  });

  it('the corpus covers all 12 month branches', () => {
    const seen = new Set(CORPUS.map((f) => f.natal.pillars.month.branch));
    expect(seen.size).toBe(12);
  });

  it('the corpus includes at least one genuinely zero-relation chart', () => {
    const zeroRelation = CORPUS.some(({ natal }) => {
      const r = buildMyungriStrengthFactBundle(natal);
      if (r.capability !== 'AVAILABLE') return false;
      const { relationParticipants } = r.bundle;
      return relationParticipants.stem.length === 0
        && relationParticipants.branchPair.length === 0
        && relationParticipants.branchSet.length === 0;
    });
    expect(zeroRelation).toBe(true);
  });

  it('the corpus includes at least one multi-relation chart (2+ simultaneous relations)', () => {
    const multiRelation = CORPUS.some(({ natal }) => {
      const r = buildMyungriStrengthFactBundle(natal);
      if (r.capability !== 'AVAILABLE') return false;
      const { relationParticipants } = r.bundle;
      const total = relationParticipants.stem.length + relationParticipants.branchPair.length
        + relationParticipants.branchSet.length;
      return total >= 2;
    });
    expect(multiRelation).toBe(true);
  });

  it('the corpus includes at least one zero-root chart and one multi-root (2+) chart', () => {
    const rootCounts = CORPUS.map(({ natal }) => {
      const r = buildMyungriStrengthFactBundle(natal);
      if (r.capability !== 'AVAILABLE') return -1;
      return r.bundle.sameElementRooting.sameElementRoots.length;
    });
    expect(rootCounts.some((c) => c === 0)).toBe(true);
    expect(rootCounts.some((c) => c >= 2)).toBe(true);
  });

  it('the corpus reaches every one of the 10 TenGod values at least once across visible stems', () => {
    const seen = new Set<string>();
    for (const { natal } of CORPUS) {
      const r = buildMyungriStrengthFactBundle(natal);
      if (r.capability !== 'AVAILABLE') continue;
      for (const v of r.bundle.tenGodFacts.visibleStems) seen.add(v.tenGod);
    }
    expect(seen.size).toBe(10);
  });

  it('the corpus reaches every hidden-stem role (MAIN/MIDDLE/RESIDUAL) at least once', () => {
    const seen = new Set<string>();
    for (const { natal } of CORPUS) {
      const r = buildMyungriStrengthFactBundle(natal);
      if (r.capability !== 'AVAILABLE') continue;
      for (const b of r.bundle.sameElementRooting.branches) {
        for (const h of b.hiddenStems) seen.add(h.hiddenRole);
      }
    }
    expect(seen).toEqual(new Set(['MAIN', 'MIDDLE', 'RESIDUAL']));
  });

  // AUDIT FINDING F5. This assertion previously permitted `seen.size >= 6`, so six of the twelve
  // supported relation kinds could silently vanish from the corpus without failing anything. It now
  // requires EVERY supported kind, compared against the canonical exported set rather than a
  // hard-coded list — so if a new relation kind is ever added to the frozen rule layer,
  // `factLayerTypeFirewall.ts`'s exhaustiveness assertion forces it into
  // ALL_SUPPORTED_RELATION_KINDS at COMPILE time, and this test then requires the corpus to
  // actually exercise it at RUN time. Neither half can be satisfied by silence.
  it('the corpus reaches EVERY supported relation kind — no kind may silently disappear', () => {
    const seen = new Set<string>();
    for (const { natal } of CORPUS) {
      const r = buildMyungriStrengthFactBundle(natal);
      if (r.capability !== 'AVAILABLE') continue;
      const { relationParticipants } = r.bundle;
      for (const x of relationParticipants.stem) seen.add(x.relation.kind);
      for (const x of relationParticipants.branchPair) seen.add(x.relation.kind);
      for (const x of relationParticipants.branchSet) seen.add(x.relation.kind);
    }
    const missing = ALL_SUPPORTED_RELATION_KINDS.filter((k) => !seen.has(k));
    expect(missing).toEqual([]);
    expect(seen.size).toBe(ALL_SUPPORTED_RELATION_KINDS.length);
  });
});
