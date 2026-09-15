// DETECTION/EFFECT FIREWALL — RUNTIME half.
//
// ⚠️ SCOPE CORRECTION (audit finding F3). An earlier version of this file claimed to provide a
// COMPILE-TIME proof via `declare const _x: Assert<T> & true`. It did not, for two reasons:
//   1. `tsconfig.json` excludes `**/*.test.ts`, so `tsc --noEmit` never checked this file, and Jest
//      transpiles tests without semantic type checking.
//   2. The assertion reduced to `never` on violation, and `declare const x: never` is legal TS.
//
// The REAL compile-time firewall now lives in ordinary (type-checked) source at
// `src/features/myungri/contracts/factLayerTypeFirewall.ts`, using `type AssertNever<T extends
// never>`, which fails the build with TS2344 on violation. It is checked by `npx tsc --noEmit`,
// which both `npm run preflight` and `npm run release-preflight` already run.
//
// THIS file is now honestly scoped to the RUNTIME half: a JSON sweep proving no forbidden key or
// forbidden verdict string appears in actual serialized fact output. Both halves are required —
// the type firewall catches declared shape, this catches anything a value could smuggle in.
import { calculateRelationParticipants, buildMyungriStrengthFactBundle, type NatalPillarContext } from '../index';
import {
  ALL_BRANCH_PAIR_RELATION_KINDS, ALL_BRANCH_SET_RELATION_KINDS, ALL_STEM_RELATION_KINDS,
  ALL_SUPPORTED_RELATION_KINDS,
} from '../contracts/factLayerTypeFirewall';

const FORBIDDEN_KEY_PATTERN =
  /"(transformed|transformationSucceeded|transformationSuccessful|transformationStatus|huaCheng|huaChengLi|bureauFormed|structuralElement|combinationSuccessful|effect|functionalEffect|strengthEffect|relationEffect|rootDestroyed|rootWeakened|rootSurvived|rootStrength|rootRank|rootSurvivability|rootIntegrity|rootFunction|functionalForce|structuralDominance|weak|strong|balanced|strength|strengthBand|confidence|specialPatternStatus|specialPatternConfirmed|specialPatternScore|specialPatternVerdict|congCaiCandidate|congGuanShaCandidate|congErCandidate|climate|yongshin|heesin|gisin)":/i;

const FORBIDDEN_VALUE_PATTERN =
  /\bWEAK\b|\bSTRONG\b|\bBALANCED\b|극신약|신약|중화신약|중화신강|신강|극신강|SPECIAL_PATTERN_CONFIRMED|SPECIAL_PATTERN_REJECTED|CONGCAI|CONGGUANSHA|CONGER|ZHUANWANG|YONGSHIN|억부용신|조후용신|통관용신|병약용신|희신|기신|從强|從財|從官殺|從兒|專旺|眞從|假從/;

const CHARTS: NatalPillarContext[] = [
  { dayMaster: 'JIA', pillars: { year: { stem: 'WU', branch: 'SHEN' }, month: { stem: 'BING', branch: 'ZI' }, day: { stem: 'JIA', branch: 'YIN' }, hour: { stem: 'JI', branch: 'CHEN' } } },
  { dayMaster: 'GUI', pillars: { year: { stem: 'GENG', branch: 'CHEN' }, month: { stem: 'WU', branch: 'XU' }, day: { stem: 'GUI', branch: 'YOU' }, hour: { stem: 'YI', branch: 'MAO' } } },
  { dayMaster: 'BING', pillars: { year: { stem: 'GENG', branch: 'SHEN' }, month: { stem: 'REN', branch: 'ZI' }, day: { stem: 'BING', branch: 'CHEN' }, hour: { stem: 'JI', branch: 'CHOU' } } },
  { dayMaster: 'XIN', pillars: { year: { stem: 'YI', branch: 'HAI' }, month: { stem: 'DING', branch: 'MAO' }, day: { stem: 'XIN', branch: 'WEI' } } }, // no hour
];

describe('compile-time firewall lives in type-checked source, not here', () => {
  it('documents where the real proof is, and that this file does not claim to be it', () => {
    // The assertions in contracts/factLayerTypeFirewall.ts are evaluated by `tsc --noEmit`.
    // Verified empirically: injecting `rootDestroyed: boolean` into HiddenStemFact produces
    // `error TS2344: Type '"rootDestroyed"' does not satisfy the constraint 'never'.`
    expect(true).toBe(true);
  });

  it('the canonical relation-kind lists it exports are complete and non-overlapping', () => {
    expect(ALL_STEM_RELATION_KINDS.length).toBe(2);
    expect(ALL_BRANCH_PAIR_RELATION_KINDS.length).toBe(7);
    expect(ALL_BRANCH_SET_RELATION_KINDS.length).toBe(3);
    expect(ALL_SUPPORTED_RELATION_KINDS.length).toBe(12);
    expect(new Set(ALL_SUPPORTED_RELATION_KINDS).size).toBe(12);
  });
});

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
