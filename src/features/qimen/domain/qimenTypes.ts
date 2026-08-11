// 기문둔갑(Qi Men Dun Jia) — DeokbunAI domain types (Claude-owned, engine-external).
//
// REUSE-FIRST: the calculation Core is the verified MIT library `qimen-dunjia`
// (拆補法), consumed only through adapters/qimenCoreAdapter.ts. The library shape
// never leaks past the adapters. FACTS ONLY — never interpretation.
//
// PRODUCT RULE (§18/§22): 기문둔갑 is POINT-IN-TIME. It runs only for a timing/
// decision question WITH an explicit question time. It never falls back to the
// current clock, and never reuses the birth chart.

export type QimenAvailability =
  | 'available'
  | 'not_applicable' // question is not a timing/decision question
  | 'missing_question_time'
  | 'unsupported_case'
  | 'calculation_failed';

// The wall-clock LOCAL time of the question. Structured (not a Date) so there is
// NO timezone guessing inside the engine — the caller supplies the intended local
// time. (TZ/LMT policy is a documented lineage concern — see QIMEN spec.)
export type QimenQueryTime = {
  year: number;
  month: number; // 1–12
  day: number; // 1–31
  hour: number; // 0–23
};

// One of the nine Luoshu palaces, carrying the Core's layered facts at that index.
// `index` preserves the Core's ordering; `palaceLabel` is the Core-provided 九宮
// identity (no fabricated position mapping).
export type QimenPalace = {
  index: number; // 0–8, Core order
  palaceLabel: string; // 九宮 identity (e.g. 一白貪狼)
  earthPlate: string; // 地盤 (三奇六儀 stem)
  heavenPlate: string; // 天盤 (stem)
  earthDoor: string; // 地門 (八門)
  heavenDoor: string; // 天門 (八門)
  star: string; // 九星
  god: string; // 八神
};

export type QimenBoard = {
  engine: 'qimen';
  engineVersion: string;
  library: string; // 'qimen-dunjia'
  libraryVersion: string;
  ruleSetVersion: string; // documented method (拆補法) id
  queryTime: QimenQueryTime;
  dunType: 'yang' | 'yin'; // 陽遁 / 陰遁
  ju: number; // 局數 1–9
  sanyuan: string; // 三元 (上元/中元/下元)
  solarTerm: string; // 節氣
  daysAfterTerm?: number; // 節後天數
  ganzhi: { year: string; month: string; day: string; hour: string }; // 사주 of the QUERY time
  hourStem: string; // 時干
  xunHead: string; // 旬首
  fuHead: string; // 符首
  zhifu: string; // 值符 (star)
  zhishi: string; // 值使 (door)
  zhifuPalace: string; // 值符落宮
  zhishiPalace: string; // 值使落宮
  palaces: QimenPalace[]; // 9
  warnings: string[];
};

export type QimenResult =
  | { availability: 'available'; board: QimenBoard }
  | {
      availability: 'not_applicable' | 'missing_question_time' | 'unsupported_case' | 'calculation_failed';
      board: null;
      reason: string;
    };

// A timing/decision question with (optionally) its local time.
export type QimenQuery = {
  isTimingQuestion: boolean;
  questionTime: QimenQueryTime | null;
};

// 'yyyyMMddHH' for the Core. Zero-padded. Pure.
export function formatQueryDatetime(qt: QimenQueryTime): string {
  const p2 = (n: number) => String(n).padStart(2, '0');
  return `${qt.year}${p2(qt.month)}${p2(qt.day)}${p2(qt.hour)}`;
}
