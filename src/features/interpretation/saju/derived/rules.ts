import type { EarthlyBranch, HeavenlyStem } from '../contracts';
import type {
  BranchRuleLookup,
  FiveElement,
  HiddenStemDefinition,
  SajuDerivedFactsError,
  SajuDerivedFactsResult,
  SajuDerivedFactsRuleVersions,
  StemRuleLookup,
  TenGod,
  YinYang,
} from './contracts';

export const DEOKBUNAI_SAJU_DERIVED_FACTS_VERSION =
  'deokbunai.saju-derived-facts.v1' as const;
export const DEOKBUNAI_SAJU_YIN_YANG_VERSION =
  'deokbunai.saju-yin-yang.v1' as const;
export const DEOKBUNAI_SAJU_FIVE_ELEMENTS_VERSION =
  'deokbunai.saju-five-elements.v1' as const;
export const DEOKBUNAI_SAJU_HIDDEN_STEMS_VERSION =
  'deokbunai.saju-hidden-stems.v1' as const;
export const DEOKBUNAI_SAJU_TEN_GODS_VERSION =
  'deokbunai.saju-ten-gods.v1' as const;

export const DEOKBUNAI_SAJU_DERIVED_FACTS_V1_RULE_VERSIONS = {
  derivedFacts: DEOKBUNAI_SAJU_DERIVED_FACTS_VERSION,
  yinYang: DEOKBUNAI_SAJU_YIN_YANG_VERSION,
  fiveElements: DEOKBUNAI_SAJU_FIVE_ELEMENTS_VERSION,
  hiddenStems: DEOKBUNAI_SAJU_HIDDEN_STEMS_VERSION,
  tenGods: DEOKBUNAI_SAJU_TEN_GODS_VERSION,
} as const satisfies SajuDerivedFactsRuleVersions;

export const STEM_YIN_YANG = {
  JIA: 'YANG',
  YI: 'YIN',
  BING: 'YANG',
  DING: 'YIN',
  WU: 'YANG',
  JI: 'YIN',
  GENG: 'YANG',
  XIN: 'YIN',
  REN: 'YANG',
  GUI: 'YIN',
} as const satisfies Record<HeavenlyStem, YinYang>;

export const BRANCH_YIN_YANG = {
  ZI: 'YANG',
  CHOU: 'YIN',
  YIN: 'YANG',
  MAO: 'YIN',
  CHEN: 'YANG',
  SI: 'YIN',
  WU: 'YANG',
  WEI: 'YIN',
  SHEN: 'YANG',
  YOU: 'YIN',
  XU: 'YANG',
  HAI: 'YIN',
} as const satisfies Record<EarthlyBranch, YinYang>;

export const STEM_ELEMENTS = {
  JIA: 'WOOD',
  YI: 'WOOD',
  BING: 'FIRE',
  DING: 'FIRE',
  WU: 'EARTH',
  JI: 'EARTH',
  GENG: 'METAL',
  XIN: 'METAL',
  REN: 'WATER',
  GUI: 'WATER',
} as const satisfies Record<HeavenlyStem, FiveElement>;

export const BRANCH_ELEMENTS = {
  ZI: 'WATER',
  CHOU: 'EARTH',
  YIN: 'WOOD',
  MAO: 'WOOD',
  CHEN: 'EARTH',
  SI: 'FIRE',
  WU: 'FIRE',
  WEI: 'EARTH',
  SHEN: 'METAL',
  YOU: 'METAL',
  XU: 'EARTH',
  HAI: 'WATER',
} as const satisfies Record<EarthlyBranch, FiveElement>;

export const HIDDEN_STEMS = {
  ZI: [
    { stem: 'REN', role: 'RESIDUAL' },
    { stem: 'GUI', role: 'MAIN' },
  ],
  CHOU: [
    { stem: 'GUI', role: 'RESIDUAL' },
    { stem: 'XIN', role: 'MIDDLE' },
    { stem: 'JI', role: 'MAIN' },
  ],
  YIN: [
    { stem: 'WU', role: 'RESIDUAL' },
    { stem: 'BING', role: 'MIDDLE' },
    { stem: 'JIA', role: 'MAIN' },
  ],
  MAO: [
    { stem: 'JIA', role: 'RESIDUAL' },
    { stem: 'YI', role: 'MAIN' },
  ],
  CHEN: [
    { stem: 'YI', role: 'RESIDUAL' },
    { stem: 'GUI', role: 'MIDDLE' },
    { stem: 'WU', role: 'MAIN' },
  ],
  SI: [
    { stem: 'WU', role: 'RESIDUAL' },
    { stem: 'GENG', role: 'MIDDLE' },
    { stem: 'BING', role: 'MAIN' },
  ],
  WU: [
    { stem: 'BING', role: 'RESIDUAL' },
    { stem: 'JI', role: 'MIDDLE' },
    { stem: 'DING', role: 'MAIN' },
  ],
  WEI: [
    { stem: 'DING', role: 'RESIDUAL' },
    { stem: 'YI', role: 'MIDDLE' },
    { stem: 'JI', role: 'MAIN' },
  ],
  SHEN: [
    { stem: 'WU', role: 'RESIDUAL' },
    { stem: 'REN', role: 'MIDDLE' },
    { stem: 'GENG', role: 'MAIN' },
  ],
  YOU: [
    { stem: 'GENG', role: 'RESIDUAL' },
    { stem: 'XIN', role: 'MAIN' },
  ],
  XU: [
    { stem: 'XIN', role: 'RESIDUAL' },
    { stem: 'DING', role: 'MIDDLE' },
    { stem: 'WU', role: 'MAIN' },
  ],
  HAI: [
    { stem: 'WU', role: 'RESIDUAL' },
    { stem: 'JIA', role: 'MIDDLE' },
    { stem: 'REN', role: 'MAIN' },
  ],
} as const satisfies Record<EarthlyBranch, readonly HiddenStemDefinition[]>;

const ELEMENT_GENERATES = {
  WOOD: 'FIRE',
  FIRE: 'EARTH',
  EARTH: 'METAL',
  METAL: 'WATER',
  WATER: 'WOOD',
} as const satisfies Record<FiveElement, FiveElement>;

const ELEMENT_CONTROLS = {
  WOOD: 'EARTH',
  FIRE: 'METAL',
  EARTH: 'WATER',
  METAL: 'WOOD',
  WATER: 'FIRE',
} as const satisfies Record<FiveElement, FiveElement>;

function failure<T>(error: SajuDerivedFactsError): SajuDerivedFactsResult<T> {
  return { ok: false, error };
}

function lookupValue<T>(
  values: Readonly<Record<string, T>>,
  key: string,
  code: SajuDerivedFactsError['code'],
  field: string,
): SajuDerivedFactsResult<T> {
  if (!Object.prototype.hasOwnProperty.call(values, key)) {
    return failure({ code, field, receivedValue: key });
  }
  return { ok: true, value: values[key] };
}

export function getStemYinYang(
  stem: HeavenlyStem,
): SajuDerivedFactsResult<YinYang> {
  return lookupValue(
    STEM_YIN_YANG,
    stem,
    'INVALID_HEAVENLY_STEM',
    'stem',
  );
}

export function getBranchYinYang(
  branch: EarthlyBranch,
): SajuDerivedFactsResult<YinYang> {
  return lookupValue(
    BRANCH_YIN_YANG,
    branch,
    'INVALID_EARTHLY_BRANCH',
    'branch',
  );
}

export function getStemElement(
  stem: HeavenlyStem,
): SajuDerivedFactsResult<FiveElement> {
  return lookupValue(
    STEM_ELEMENTS,
    stem,
    'INVALID_HEAVENLY_STEM',
    'stem',
  );
}

export function getBranchElement(
  branch: EarthlyBranch,
): SajuDerivedFactsResult<FiveElement> {
  return lookupValue(
    BRANCH_ELEMENTS,
    branch,
    'INVALID_EARTHLY_BRANCH',
    'branch',
  );
}

export function getHiddenStems(
  branch: EarthlyBranch,
): SajuDerivedFactsResult<readonly HiddenStemDefinition[]> {
  return lookupValue(
    HIDDEN_STEMS,
    branch,
    'HIDDEN_STEMS_NOT_DEFINED',
    'branch',
  );
}

export function getStemRule(
  stem: HeavenlyStem,
): SajuDerivedFactsResult<StemRuleLookup> {
  const yinYang = getStemYinYang(stem);
  if (!yinYang.ok) return yinYang;
  const element = getStemElement(stem);
  if (!element.ok) return element;
  return { ok: true, value: { stem, yinYang: yinYang.value, element: element.value } };
}

export function getBranchRule(
  branch: EarthlyBranch,
): SajuDerivedFactsResult<BranchRuleLookup> {
  const yinYang = getBranchYinYang(branch);
  if (!yinYang.ok) return yinYang;
  const element = getBranchElement(branch);
  if (!element.ok) return element;
  const hiddenStems = getHiddenStems(branch);
  if (!hiddenStems.ok) return hiddenStems;
  return {
    ok: true,
    value: {
      branch,
      yinYang: yinYang.value,
      element: element.value,
      hiddenStems: hiddenStems.value,
    },
  };
}

export function calculateTenGod(
  dayMaster: HeavenlyStem,
  target: HeavenlyStem,
): SajuDerivedFactsResult<TenGod> {
  const dayMasterRule = getStemRule(dayMaster);
  if (!dayMasterRule.ok) return dayMasterRule;
  const targetRule = getStemRule(target);
  if (!targetRule.ok) return targetRule;

  const samePolarity = dayMasterRule.value.yinYang === targetRule.value.yinYang;
  const dayElement = dayMasterRule.value.element;
  const targetElement = targetRule.value.element;
  if (dayElement === targetElement) {
    return { ok: true, value: samePolarity ? 'PEER' : 'ROB_WEALTH' };
  }
  if (ELEMENT_GENERATES[dayElement] === targetElement) {
    return {
      ok: true,
      value: samePolarity ? 'EATING_GOD' : 'HURTING_OFFICER',
    };
  }
  if (ELEMENT_CONTROLS[dayElement] === targetElement) {
    return {
      ok: true,
      value: samePolarity ? 'INDIRECT_WEALTH' : 'DIRECT_WEALTH',
    };
  }
  if (ELEMENT_CONTROLS[targetElement] === dayElement) {
    return {
      ok: true,
      value: samePolarity ? 'SEVEN_KILLINGS' : 'DIRECT_OFFICER',
    };
  }
  if (ELEMENT_GENERATES[targetElement] === dayElement) {
    return {
      ok: true,
      value: samePolarity ? 'INDIRECT_RESOURCE' : 'DIRECT_RESOURCE',
    };
  }
  return failure({
    code: 'ELEMENT_RELATION_NOT_DEFINED',
    field: 'dayMaster,target',
    receivedValue: `${dayMaster},${target}`,
  });
}
