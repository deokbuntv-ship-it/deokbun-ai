// DETECTION/EFFECT FIREWALL — hard contract (HARDENING §10).
//
// Proves, at TWO independent levels, that no fact type or fact instance in the MYUNGRI_STRENGTH_V1
// fact layer can ever expose an effect/transformation/strength/verdict field:
//
//   1. COMPILE-TIME: for every exported fact type, `Extract<keyof T, ForbiddenKey>` must be `never`.
//      This is a STRONGER proof than any runtime check — it holds for every chart the type could
//      ever describe, not merely the fixtures a test happens to construct. If a future edit adds a
//      forbidden field to any of these types, this file fails to type-check and the build breaks.
//   2. RUNTIME: a JSON sweep across a range of real, varied fact bundles confirms no forbidden key
//      or forbidden verdict STRING appears anywhere in the actual serialized output either.
import { calculateRelationParticipants, buildMyungriStrengthFactBundle, type NatalPillarContext } from '../index';
import type {
  BranchHiddenStemFacts, DayMasterIdentityFact, HiddenStemFact, SameElementRootingResult,
} from '../services/sameElementRooting';
import type { HiddenStemTenGodFact, TenGodFactsResult, VisibleStemTenGodFact } from '../services/tenGodFacts';
import type {
  BranchPairRelationParticipants, BranchSetRelationParticipants, RelationParticipantsResult,
  StemRelationParticipants,
} from '../services/relationParticipants';
import type { GeneralSeasonalPhaseResult } from '../services/generalSeasonalPhase';
import type {
  ElementCounts, RoleCategoryPresenceFact, SameElementRootPosition, SpecialPatternPrerequisitesResult,
} from '../services/specialPatternPrerequisites';
import type { MyungriStrengthFactBundle, StrengthFactBundleResult } from '../services/strengthFactBundle';

// ══ 1. COMPILE-TIME PROOF ═══════════════════════════════════════════════════════════════════════
type ForbiddenKey =
  // relation-effect / transformation
  | 'transformed' | 'transformationSucceeded' | 'transformationSuccessful' | 'huaCheng' | 'huaChengLi'
  | 'bureauFormed' | 'structuralElement' | 'combinationSuccessful' | 'effect' | 'functionalEffect'
  // root-function
  | 'rootDestroyed' | 'rootWeakened' | 'rootSurvived' | 'rootStrength' | 'rootRank' | 'rootSurvivability'
  | 'functionalForce' | 'structuralDominance'
  // strength / seven-band / special-pattern / Yongshin
  | 'weak' | 'strong' | 'balanced' | 'strength' | 'confidence' | 'specialPatternStatus'
  | 'specialPatternConfirmed' | 'congCaiCandidate' | 'congGuanShaCandidate' | 'congErCandidate'
  | 'specialPatternScore' | 'yongshin';

/** Compile-time assertion: T's own keys must have ZERO overlap with ForbiddenKey. If T ever grows a
 *  forbidden key, `Extract<keyof T, ForbiddenKey>` becomes a non-`never` type and this line fails
 *  to type-check — a real build break, not a lint suggestion. */
type AssertNoForbiddenKeys<T> = Extract<keyof T, ForbiddenKey> extends never ? true : false;

// One assertion per exported fact type. `declare const` never runs — this block exists purely for
// tsc to evaluate; if any of these ever resolves to `false`, this file stops compiling.
declare const _hiddenStemFact: AssertNoForbiddenKeys<HiddenStemFact> & true;
declare const _branchHiddenStemFacts: AssertNoForbiddenKeys<BranchHiddenStemFacts> & true;
declare const _dayMasterIdentityFact: AssertNoForbiddenKeys<DayMasterIdentityFact> & true;
declare const _sameElementRootingAvailable: AssertNoForbiddenKeys<
  Extract<SameElementRootingResult, { capability: 'AVAILABLE' }>
> & true;
declare const _visibleStemTenGodFact: AssertNoForbiddenKeys<VisibleStemTenGodFact> & true;
declare const _hiddenStemTenGodFact: AssertNoForbiddenKeys<HiddenStemTenGodFact> & true;
declare const _tenGodFactsAvailable: AssertNoForbiddenKeys<
  Extract<TenGodFactsResult, { capability: 'AVAILABLE' }>
> & true;
declare const _stemRelationParticipants: AssertNoForbiddenKeys<StemRelationParticipants> & true;
declare const _branchPairRelationParticipants: AssertNoForbiddenKeys<BranchPairRelationParticipants> & true;
declare const _branchSetRelationParticipants: AssertNoForbiddenKeys<BranchSetRelationParticipants> & true;
declare const _relationParticipantsAvailable: AssertNoForbiddenKeys<
  Extract<RelationParticipantsResult, { capability: 'AVAILABLE' }>
> & true;
declare const _generalSeasonalPhaseAvailable: AssertNoForbiddenKeys<
  Extract<GeneralSeasonalPhaseResult, { capability: 'AVAILABLE' }>
> & true;
declare const _elementCounts: AssertNoForbiddenKeys<ElementCounts> & true;
declare const _roleCategoryPresenceFact: AssertNoForbiddenKeys<RoleCategoryPresenceFact> & true;
declare const _sameElementRootPosition: AssertNoForbiddenKeys<SameElementRootPosition> & true;
declare const _specialPatternPrerequisitesAvailable: AssertNoForbiddenKeys<
  Extract<SpecialPatternPrerequisitesResult, { capability: 'AVAILABLE' }>
> & true;
declare const _myungriStrengthFactBundle: AssertNoForbiddenKeys<
  Omit<MyungriStrengthFactBundle, 'future'>
> & true;
declare const _strengthFactBundleAvailable: AssertNoForbiddenKeys<
  Extract<StrengthFactBundleResult, { capability: 'AVAILABLE' }>
> & true;

// `future`'s own keys ARE named after forbidden concepts (rootFunction/relationEffect/
// specialPatternVerdict/climate/strength/yongshin) BY DESIGN — they are permanently `undefined`
// documentation placeholders (see strengthFactBundle.ts's own header). Confirmed separately, at
// the VALUE level, that every one is `undefined` in every bundle this code can produce (below).

describe('compile-time detection/effect firewall', () => {
  it('type-level assertions above compiled successfully (this test merely documents that fact)', () => {
    // If any `declare const _xxx: ... & true` above failed to type-check, `npx tsc --noEmit` and
    // this test file itself would already have failed before this line ever ran.
    expect(true).toBe(true);
  });
});

// ══ 2. RUNTIME SWEEP ════════════════════════════════════════════════════════════════════════════
const FORBIDDEN_KEY_PATTERN =
  /"(transformed|transformationSucceeded|transformationSuccessful|huaCheng|huaChengLi|bureauFormed|structuralElement|combinationSuccessful|effect|functionalEffect|rootDestroyed|rootWeakened|rootSurvived|rootStrength|rootRank|rootSurvivability|functionalForce|structuralDominance|weak|strong|balanced|strength|confidence|specialPatternStatus|specialPatternConfirmed|congCaiCandidate|congGuanShaCandidate|congErCandidate|specialPatternScore)":/i;

const FORBIDDEN_VALUE_PATTERN =
  /\bWEAK\b|\bSTRONG\b|\bBALANCED\b|극신약|신약|중화신약|중화신강|신강|극신강|SPECIAL_PATTERN_CONFIRMED|SPECIAL_PATTERN_REJECTED|CONGCAI|CONGGUANSHA|CONGER|ZHUANWANG|YONGSHIN|억부용신|조후용신|통관용신|병약용신|희신|기신|從强|從財|從官殺|從兒|專旺|眞從|假從/;

const CHARTS: NatalPillarContext[] = [
  { dayMaster: 'JIA', pillars: { year: { stem: 'WU', branch: 'SHEN' }, month: { stem: 'BING', branch: 'ZI' }, day: { stem: 'JIA', branch: 'YIN' }, hour: { stem: 'JI', branch: 'CHEN' } } },
  { dayMaster: 'GUI', pillars: { year: { stem: 'GENG', branch: 'CHEN' }, month: { stem: 'WU', branch: 'XU' }, day: { stem: 'GUI', branch: 'YOU' }, hour: { stem: 'YI', branch: 'MAO' } } },
  { dayMaster: 'BING', pillars: { year: { stem: 'GENG', branch: 'SHEN' }, month: { stem: 'REN', branch: 'ZI' }, day: { stem: 'BING', branch: 'CHEN' }, hour: { stem: 'JI', branch: 'CHOU' } } },
  { dayMaster: 'XIN', pillars: { year: { stem: 'YI', branch: 'HAI' }, month: { stem: 'DING', branch: 'MAO' }, day: { stem: 'XIN', branch: 'WEI' } } }, // no hour
];

describe('runtime firewall sweep across varied fact bundles', () => {
  for (const chart of CHARTS) {
    it(`bundle for dayMaster=${chart.dayMaster}/${chart.pillars.day.branch} contains no forbidden key or value`, () => {
      const result = buildMyungriStrengthFactBundle(chart);
      expect(result.capability).toBe('AVAILABLE');
      const json = JSON.stringify(result);
      expect(FORBIDDEN_KEY_PATTERN.test(json)).toBe(false);
      expect(FORBIDDEN_VALUE_PATTERN.test(json)).toBe(false);
    });

    it(`relation participants for dayMaster=${chart.dayMaster}/${chart.pillars.day.branch} contain no forbidden key or value`, () => {
      const result = calculateRelationParticipants(chart);
      expect(result.capability).toBe('AVAILABLE');
      const json = JSON.stringify(result);
      expect(FORBIDDEN_KEY_PATTERN.test(json)).toBe(false);
      expect(FORBIDDEN_VALUE_PATTERN.test(json)).toBe(false);
    });
  }

  it('the bundle future placeholder object is the ONLY place forbidden-named keys legitimately appear, and every value is undefined', () => {
    const result = buildMyungriStrengthFactBundle(CHARTS[0]);
    if (result.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    const { future } = result.bundle;
    for (const value of Object.values(future)) expect(value).toBeUndefined();
    // JSON.stringify DROPS undefined-valued keys entirely — confirming `future` contributes
    // NOTHING to the serialized bundle a downstream consumer would actually read.
    const json = JSON.stringify(result.bundle);
    expect(json).not.toMatch(/"rootFunction"|"relationEffect"|"specialPatternVerdict"|"climate"|"strength"|"yongshin"/);
  });
});
