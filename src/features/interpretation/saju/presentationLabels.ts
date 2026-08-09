import type { EarthlyBranch, HeavenlyStem } from './contracts';
import type {
  FiveElement,
  HiddenStemRole,
  TenGod,
  YinYang,
} from './derived/contracts';

export type SajuHanjaHangulLabel = {
  readonly hanja: string;
  readonly hangul: string;
};

export type SajuHangulLabel = {
  readonly hangul: string;
};

export const HEAVENLY_STEM_LABELS = {
  JIA: { hanja: '甲', hangul: '갑' },
  YI: { hanja: '乙', hangul: '을' },
  BING: { hanja: '丙', hangul: '병' },
  DING: { hanja: '丁', hangul: '정' },
  WU: { hanja: '戊', hangul: '무' },
  JI: { hanja: '己', hangul: '기' },
  GENG: { hanja: '庚', hangul: '경' },
  XIN: { hanja: '辛', hangul: '신' },
  REN: { hanja: '壬', hangul: '임' },
  GUI: { hanja: '癸', hangul: '계' },
} as const satisfies Record<HeavenlyStem, SajuHanjaHangulLabel>;

export const EARTHLY_BRANCH_LABELS = {
  ZI: { hanja: '子', hangul: '자' },
  CHOU: { hanja: '丑', hangul: '축' },
  YIN: { hanja: '寅', hangul: '인' },
  MAO: { hanja: '卯', hangul: '묘' },
  CHEN: { hanja: '辰', hangul: '진' },
  SI: { hanja: '巳', hangul: '사' },
  WU: { hanja: '午', hangul: '오' },
  WEI: { hanja: '未', hangul: '미' },
  SHEN: { hanja: '申', hangul: '신' },
  YOU: { hanja: '酉', hangul: '유' },
  XU: { hanja: '戌', hangul: '술' },
  HAI: { hanja: '亥', hangul: '해' },
} as const satisfies Record<EarthlyBranch, SajuHanjaHangulLabel>;

export const TEN_GOD_LABELS = {
  PEER: { hangul: '비견' },
  ROB_WEALTH: { hangul: '겁재' },
  EATING_GOD: { hangul: '식신' },
  HURTING_OFFICER: { hangul: '상관' },
  INDIRECT_WEALTH: { hangul: '편재' },
  DIRECT_WEALTH: { hangul: '정재' },
  SEVEN_KILLINGS: { hangul: '편관' },
  DIRECT_OFFICER: { hangul: '정관' },
  INDIRECT_RESOURCE: { hangul: '편인' },
  DIRECT_RESOURCE: { hangul: '정인' },
} as const satisfies Record<TenGod, SajuHangulLabel>;

export const HIDDEN_STEM_ROLE_LABELS = {
  MAIN: { hangul: '정기' },
  MIDDLE: { hangul: '중기' },
  RESIDUAL: { hangul: '여기' },
} as const satisfies Record<HiddenStemRole, SajuHangulLabel>;

export const YIN_YANG_LABELS = {
  YANG: { hangul: '양' },
  YIN: { hangul: '음' },
} as const satisfies Record<YinYang, SajuHangulLabel>;

export const FIVE_ELEMENT_LABELS = {
  WOOD: { hangul: '목' },
  FIRE: { hangul: '화' },
  EARTH: { hangul: '토' },
  METAL: { hangul: '금' },
  WATER: { hangul: '수' },
} as const satisfies Record<FiveElement, SajuHangulLabel>;
