// 구궁 palace geometry — resolving `board.zhifuPalace`/`board.zhishiPalace` (trigram characters, e.g.
// "兌"/"離") to the actual `QimenPalace` object, and each trigram's fixed 後天八卦(Later Heaven Bagua)
// element. Both tables are UNIVERSAL, non-school-dependent facts (the SAME correspondence used across
// Fengshui/I-Ching/every Qimen lineage, exactly as uncontested as "지지 자(子) = 水" already used
// throughout this codebase) — never a doctrine choice, so this is the ONE narrowly-scoped deterministic
// fact provider this batch adds (§42: NEW_FACT_PROVIDERS preferred 0, at most one).
//
// THE INDEX MAPPING IS NOT INVENTED — it is copied directly from the `qimen-dunjia` library's own
// source (`node_modules/qimen-dunjia/constants.js`, `PALACE` constant), which fixes each of the 9
// array positions to its spatial trigram REGARDLESS of which star/door currently rotates through it:
//   0=巽 1=離 2=坤 3=震 4=中(center, no door/god — the library substitutes 坤 before ever handing this
//   app a "中" string, but 中 is mapped defensively anyway) 5=兌 6=艮 7=坎 8=乾
// Verified against two independent real board fields before use: `board.palaces[TRIGRAM_TO_INDEX[zhifuPalace]].star`
// equals `board.zhifu`, and `board.palaces[TRIGRAM_TO_INDEX[zhishiPalace]].heavenDoor` equals `board.zhishi`,
// for real computed boards — see `qimenPalaceGeometry.test.ts`.
import type { QimenBoard, QimenPalace } from '../domain/qimenTypes';

export const TRIGRAM_TO_INDEX: Readonly<Record<string, number>> = {
  巽: 0, 離: 1, 坤: 2, 震: 3, 中: 4, 兌: 5, 艮: 6, 坎: 7, 乾: 8,
};

export type QimenElement = 'WOOD' | 'FIRE' | 'EARTH' | 'METAL' | 'WATER';

/** 後天八卦 trigram → element. Universal, non-school-dependent (same as Fengshui/I-Ching). */
export const TRIGRAM_ELEMENT: Readonly<Record<string, QimenElement>> = {
  震: 'WOOD', 巽: 'WOOD', 離: 'FIRE', 坤: 'EARTH', 中: 'EARTH', 艮: 'EARTH', 兌: 'METAL', 乾: 'METAL', 坎: 'WATER',
};

/** The `QimenPalace` a 값부/값사 trigram string (`board.zhifuPalace`/`board.zhishiPalace`) actually sits
 *  in — `null` when the trigram is unrecognized (never guessed). Fixes a prior lookup that matched
 *  `palaceLabel` (a rotating "current star/color" string, e.g. "九紫右弼") against the trigram, which
 *  never actually contains the trigram character and so always returned no match. */
export function findPalaceByTrigram(board: QimenBoard, trigram: string): QimenPalace | null {
  const index = TRIGRAM_TO_INDEX[trigram];
  if (index === undefined) return null;
  return board.palaces.find((p) => p.index === index) ?? null;
}

const GENERATES: Readonly<Record<QimenElement, QimenElement>> = {
  WOOD: 'FIRE', FIRE: 'EARTH', EARTH: 'METAL', METAL: 'WATER', WATER: 'WOOD',
};
const CONTROLS: Readonly<Record<QimenElement, QimenElement>> = {
  WOOD: 'EARTH', EARTH: 'WATER', WATER: 'FIRE', FIRE: 'METAL', METAL: 'WOOD',
};

export type ElementRelation = 'SAME' | 'A_GENERATES_B' | 'B_GENERATES_A' | 'A_CONTROLS_B' | 'B_CONTROLS_A';

/** The five-element relation from `a` to `b` — the SAME universal generation/control cycle already
 *  used throughout `src/features/divination/myungriYongshin.ts`, never a new cycle. */
export function elementRelation(a: QimenElement, b: QimenElement): ElementRelation {
  if (a === b) return 'SAME';
  if (GENERATES[a] === b) return 'A_GENERATES_B';
  if (GENERATES[b] === a) return 'B_GENERATES_A';
  if (CONTROLS[a] === b) return 'A_CONTROLS_B';
  return 'B_CONTROLS_A';
}
