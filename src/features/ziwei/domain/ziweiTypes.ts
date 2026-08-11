// 자미두수(Zi Wei Dou Shu) — DeokbunAI domain types (Claude-owned, engine-external).
//
// REUSE-FIRST: the calculation Core is the verified MIT library `iztro` (pinned).
// These are DeokbunAI's OWN normalized types — the iztro data shape never leaks
// past the adapter layer (src/features/ziwei/adapters/iztroAdapter.ts). Swapping
// the library later must not change anything above the adapters.
//
// This layer computes/normalizes FACTS only. It never writes interpretation
// ("재물운이 좋다" 등) — that stays with the LLM layer via the evidence adapter.

export type ZiweiAvailability =
  | 'available'
  | 'partial'
  | 'missing_birth_time'
  | 'unsupported_case'
  | 'calculation_failed';

// Normalized input handed to the Core. `timeIndex` is the iztro 0–12 时辰序号.
export type ZiweiInput = {
  solarDate: string; // 'YYYY-M-D'
  timeIndex: number; // 0–12 (see timeIndexFromHour)
  gender: '男' | '女';
};

export type ZiweiStarKind = 'major' | 'minor' | 'adjective';

// A star as normalized by DeokbunAI. `transformation` = 四化 (化祿/化權/化科/化忌)
// when present; carried through from the Core, never invented.
export type ZiweiStar = {
  name: string;
  kind: ZiweiStarKind;
  brightness?: string;
  transformation?: string; // 四化 label from the Core (Korean per output language)
};

export type ZiweiPalace = {
  index: number; // 0–11
  name: string; // 命宮/兄弟/夫妻/… (localized)
  earthlyBranch: string; // 地支
  heavenlyStem: string; // 天干
  isBodyPalace: boolean; // 身宮 여부
  majorStars: ZiweiStar[]; // 主星 (+ 四化)
  minorStars: ZiweiStar[];
  adjectiveStars: ZiweiStar[];
  decadal?: { range: [number, number]; heavenlyStem: string; earthlyBranch: string }; // 大限
};

export type ZiweiTransformation = {
  star: string;
  transformation: string; // 化祿/化權/化科/化忌
  palaceName: string; // which palace it lands in
};

// DeokbunAI normalized natal chart. Engine/library/rule versions are tracked so a
// result is always reproducible and auditable (directive §18).
export type ZiweiChart = {
  engine: 'ziwei';
  engineVersion: string; // this adapter's version
  library: string; // 'iztro'
  libraryVersion: string; // pinned iztro version
  ruleSetVersion: string; // documented iztro default rule set id
  input: ZiweiInput;
  solarDate: string;
  lunarDate: string;
  chineseDate: string; // 干支 date
  timeRange: string;
  zodiac?: string;
  soulPalaceBranch: string; // 命宮地支
  bodyPalaceBranch: string; // 身宮地支
  soul: string; // 命主
  body: string; // 身主
  fiveElementsClass: string; // 五行局
  palaces: ZiweiPalace[]; // 12
  transformations: ZiweiTransformation[]; // 四化 flattened, with landing palace
  warnings: string[];
};

export type ZiweiResult =
  | { availability: 'available' | 'partial'; chart: ZiweiChart }
  | {
      availability: 'missing_birth_time' | 'unsupported_case' | 'calculation_failed';
      chart: null;
      reason: string;
    };

// ---- birth-hour → iztro timeIndex (0–12) ------------------------------------
// iztro convention: index = floor((hour+1)/2). 23:00–00:59 splits into 早子時(0)
// and 晚子時(12); 11–12시 → 午(6). Pure + deterministic.
export function timeIndexFromHour(hour24: number): number {
  const h = Math.max(0, Math.min(23, Math.trunc(hour24)));
  return Math.floor((h + 1) / 2);
}
