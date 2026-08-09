import type {
  EarthlyBranch,
  HeavenlyStem,
  SajuFourPillars,
} from '../contracts';

export type YinYang = 'YANG' | 'YIN';

export type FiveElement = 'WOOD' | 'FIRE' | 'EARTH' | 'METAL' | 'WATER';

export type HiddenStemRole = 'RESIDUAL' | 'MIDDLE' | 'MAIN';

export type TenGod =
  | 'PEER'
  | 'ROB_WEALTH'
  | 'EATING_GOD'
  | 'HURTING_OFFICER'
  | 'INDIRECT_WEALTH'
  | 'DIRECT_WEALTH'
  | 'SEVEN_KILLINGS'
  | 'DIRECT_OFFICER'
  | 'INDIRECT_RESOURCE'
  | 'DIRECT_RESOURCE';

export type SajuPillarPosition = 'YEAR' | 'MONTH' | 'DAY' | 'HOUR';

export type HiddenStemDefinition = {
  readonly stem: HeavenlyStem;
  readonly role: HiddenStemRole;
};

export type SajuDerivedStemAnnotation = {
  yinYang: YinYang;
  element: FiveElement;
  tenGod: TenGod;
};

export type SajuDerivedHiddenStemAnnotation = HiddenStemDefinition &
  SajuDerivedStemAnnotation;

export type SajuDerivedBranchAnnotation = {
  yinYang: YinYang;
  element: FiveElement;
  hiddenStems: readonly SajuDerivedHiddenStemAnnotation[];
};

export type SajuDerivedPillarAnnotation = {
  position: SajuPillarPosition;
  stem: SajuDerivedStemAnnotation;
  branch: SajuDerivedBranchAnnotation;
};

export type SajuDerivedFactsRuleVersions = {
  derivedFacts: 'deokbunai.saju-derived-facts.v1';
  yinYang: 'deokbunai.saju-yin-yang.v1';
  fiveElements: 'deokbunai.saju-five-elements.v1';
  hiddenStems: 'deokbunai.saju-hidden-stems.v1';
  tenGods: 'deokbunai.saju-ten-gods.v1';
};

export type SajuDerivedFacts = {
  ruleVersions: SajuDerivedFactsRuleVersions;
  pillars: {
    year: SajuDerivedPillarAnnotation;
    month: SajuDerivedPillarAnnotation;
    day: SajuDerivedPillarAnnotation;
    /** Absent unless the source Four Pillars hour is AVAILABLE. */
    hour?: SajuDerivedPillarAnnotation;
  };
};

export type SajuDerivedFactsInput = {
  fourPillars: SajuFourPillars;
};

export type SajuDerivedFactsErrorCode =
  | 'INVALID_HEAVENLY_STEM'
  | 'INVALID_EARTHLY_BRANCH'
  | 'INVALID_SEXAGENARY_PILLAR'
  | 'INVALID_PILLAR_IDENTITY'
  | 'HIDDEN_STEMS_NOT_DEFINED'
  | 'ELEMENT_RELATION_NOT_DEFINED';

export type SajuDerivedFactsError = {
  code: SajuDerivedFactsErrorCode;
  field: string;
  receivedValue?: unknown;
};

export type SajuDerivedFactsResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: SajuDerivedFactsError };

export type StemRuleLookup = {
  stem: HeavenlyStem;
  yinYang: YinYang;
  element: FiveElement;
};

export type BranchRuleLookup = {
  branch: EarthlyBranch;
  yinYang: YinYang;
  element: FiveElement;
  hiddenStems: readonly HiddenStemDefinition[];
};
