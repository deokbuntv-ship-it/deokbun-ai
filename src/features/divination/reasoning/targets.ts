// V4C §2/§3 — CANONICAL TARGET REGISTRY.
//
// V4B introduced a typed `SemanticTarget`, which was the right shape, but the KEYS were still built from
// whatever text happened to be at hand: the adapter keyed a palace by its first evidence string
// (`ZIWEI:MONEY_INFLOW:재백(본궁)에 천동 화록`), and a cross compound keyed itself by a Korean display frame
// (`돈이 들어오는 것과 남는 것`). A key derived from display text is not an identity — reword the sentence, or
// let a different piece of evidence sort first, and the "same" target stops matching itself. Every comparison
// the kernel makes (contradiction, temporal decomposition, causal chains, supersession) then silently changes
// its answer for reasons that have nothing to do with the chart.
//
// So identity is registered here, in ASCII, independent of any rendered text:
//
//   KEY   = `${kind}:${id}` — stable, semantic, validated against the kind's namespace
//   LABEL = display only, never compared, free to be reworded at any time
//
// Adding a NEW target means adding it to the namespace below — deliberately, in one place — rather than
// materialising one from a string at a call site.
import type { JudgmentDomain } from '../contracts';

export type TargetKind =
  | 'NATAL_SEAT'          // 원국 년/월/일/시 자리
  | 'NATAL_SEAT_PAIR'     // 원국 두 자리 사이의 관계 (충·형·합…)
  | 'TEN_GOD_FAMILY'      // 원국 재성·관성·식상·비겁·인성 계열
  | 'LUCK_LAYER'          // 대운/세운/월운 그 자체
  | 'DAY_MASTER_FOOTING'  // 일간의 계절 기반 / 뿌리
  | 'PALACE'              // 자미두수 궁
  | 'BOARD_SEAT'          // 기문둔갑 판
  | 'DOCTRINE_GAP'        // 채택 학파가 없어 판정을 보류한 지점
  | 'ADAPTED_READING'     // 전제 그래프가 없는 학문이 내놓은 "이 축에 대한 판단" 자체
  | 'COMPOSITE';          // 서로 다른 대상 사이의 관계를 다루는 복합 결론

/**
 * The legal id namespace for each kind. This is what makes §3's kind/key compatibility check possible: a
 * target claiming `kind: 'PALACE'` with `key: 'RELATION_STABILITY:...'` is rejected rather than quietly
 * compared against real palaces.
 */
const NAMESPACE: Record<TargetKind, RegExp> = {
  NATAL_SEAT: /^(YEAR|MONTH|DAY|HOUR)$/,
  // Sorted, so 년↔월 and 월↔년 are one identity rather than two.
  NATAL_SEAT_PAIR: /^(DAY|HOUR|MONTH|YEAR)_(DAY|HOUR|MONTH|YEAR)$/,
  TEN_GOD_FAMILY: /^(WEALTH|OFFICER|OUTPUT|PEER|RESOURCE)$/,
  LUCK_LAYER: /^(NATAL|DAEWOON|SEWOON|WOLWOON|PRESENT_MOMENT|UNSCOPED)(:RIVAL)?$/,
  DAY_MASTER_FOOTING: /^(SEASON|ROOT)$/,
  PALACE: /^(SELF|WEALTH|PROPERTY|CAREER|TRAVEL|SPOUSE|SIBLING|HEALTH)_PALACE$/,
  // One board is cast per question instant; an axis reading is a reading OF that board, not a separate object.
  BOARD_SEAT: /^QIMEN_BOARD(:[A-Z_]+)?$/,
  DOCTRINE_GAP: /^(STRENGTH_YONGSHIN|AXIS:[A-Z_]+)$/,
  // V4C §2 — a discipline whose premise graph was NOT supplied (Myungri on the 궁합 pair path) reaches the
  // adapter with a finished judgment and no seat information. Its identity is "this discipline's reading of
  // this axis" — a real, canonical, per-discipline identity, and crucially NOT a seat belonging to some other
  // discipline. V4B keyed it as a 기문 BOARD_SEAT, so a 명리 pair reading carried the 기문둔갑 namespace and
  // could compare EQUAL to a genuine board target.
  ADAPTED_READING: /^(MYUNGRI|ZIWEI|QIMEN):[A-Z_]+$/,
  // ASCII only, and composed from other canonical keys where it relates two targets — never from prose.
  COMPOSITE: /^[A-Z][A-Z0-9_]*(:[A-Za-z0-9_:|.]+)?$/,
};

export type SemanticTarget = {
  /** `${kind}:${id}`. Stable identity — the ONLY thing compared. */
  key: string;
  /** Human label. Display only; never matched on, free to change. */
  label: string;
  kind: TargetKind;
};

/** Structural target equality. The single place "same thing" is decided. */
export const sameTarget = (a: SemanticTarget, b: SemanticTarget): boolean => a.key === b.key;

export class TargetNamespaceError extends Error {}

/**
 * Build a canonical target. Throws on a namespace violation rather than returning something unmatched: an
 * invalid key would not crash, it would silently fail to equal anything, which is the failure mode this
 * registry exists to remove.
 */
export function target(kind: TargetKind, id: string, label: string): SemanticTarget {
  if (!NAMESPACE[kind].test(id)) {
    throw new TargetNamespaceError(`target id "${id}" is not valid for kind ${kind}`);
  }
  return { key: `${kind}:${id}`, label, kind };
}

/** Validate a target that arrived from OUTSIDE (persisted JSON). Never throws — the parser decides. */
export function isCanonicalTarget(t: unknown): t is SemanticTarget {
  if (t === null || typeof t !== 'object') return false;
  const o = t as Record<string, unknown>;
  if (typeof o.key !== 'string' || typeof o.label !== 'string' || typeof o.kind !== 'string') return false;
  if (!(o.kind in NAMESPACE)) return false;
  const kind = o.kind as TargetKind;
  const prefix = `${kind}:`;
  if (!o.key.startsWith(prefix)) return false;            // §3 — kind must match the key's namespace
  return NAMESPACE[kind].test(o.key.slice(prefix.length));
}

// ── canonical ids for the two disciplines that are NOT on the premise graph ──────────────────────
//
// These map an ASKED AXIS onto the structure that discipline reads for it. They are a renaming of identities
// the engines already use (`palaceForDomain` returns the same palaces in Korean), not new doctrine.

const PALACE_ID: Partial<Record<JudgmentDomain, string>> = {
  MONEY_INFLOW: 'WEALTH_PALACE',
  MONEY_RETENTION: 'PROPERTY_PALACE',
  CAREER: 'CAREER_PALACE',
  OUTCOME: 'CAREER_PALACE',
  MOVEMENT: 'TRAVEL_PALACE',
  RELATION_STABILITY: 'SPOUSE_PALACE',
  RELATION_BOND: 'SPOUSE_PALACE',
  CONFLICT: 'SIBLING_PALACE',
  INFLUENCE: 'SIBLING_PALACE',
  HEALTH_ENERGY: 'HEALTH_PALACE',
  OPPORTUNITY: 'SELF_PALACE',
  DECISION: 'SELF_PALACE',
  GENERAL: 'SELF_PALACE',
};

const PALACE_LABEL: Record<string, string> = {
  WEALTH_PALACE: '재백궁', PROPERTY_PALACE: '전택궁', CAREER_PALACE: '관록궁', TRAVEL_PALACE: '천이궁',
  SPOUSE_PALACE: '부처궁', SIBLING_PALACE: '형제궁', HEALTH_PALACE: '질액궁', SELF_PALACE: '명궁',
};

/** The 궁 자미두수 reads for this axis — identity from the ASKED AXIS, never from an evidence string. */
export function ziweiPalaceTarget(axis: JudgmentDomain): SemanticTarget | null {
  const id = PALACE_ID[axis];
  return id ? target('PALACE', id, PALACE_LABEL[id]) : null;
}

/**
 * The 기문 board. ONE board is cast per question instant, so every axis reading shares its identity — which
 * is the honest position: they are readings of the same board, not claims about different objects.
 */
/**
 * The identity of an UNMIGRATED discipline's finished reading of one axis. Never a seat.
 *
 * Used when a discipline reaches the adapter with a judgment but no premise graph, so no structure is
 * available to name. Keeping it in its own namespace is what stops it comparing equal to another discipline's
 * real seat for the same axis.
 */
export function adaptedReadingTarget(
  discipline: 'MYUNGRI' | 'ZIWEI' | 'QIMEN', axis: string, label: string,
): SemanticTarget {
  return target('ADAPTED_READING', `${discipline}:${axis}`, label);
}

export function qimenBoardTarget(): SemanticTarget {
  return target('BOARD_SEAT', 'QIMEN_BOARD', '기문 국');
}

const SEAT_LABEL: Record<string, string> = { YEAR: '년주', MONTH: '월주', DAY: '일주', HOUR: '시주' };

/**
 * The relation between two natal seats. Sorted so 년↔월 and 월↔년 are ONE identity — an unsorted pair would
 * make the same structural relation compare unequal to itself depending on which seat the engine listed first.
 */
export function natalSeatPairTarget(a: string, b: string): SemanticTarget {
  const [x, y] = [a, b].sort();
  return target('NATAL_SEAT_PAIR', `${x}_${y}`, `원국 ${SEAT_LABEL[x] ?? x}↔${SEAT_LABEL[y] ?? y}`);
}
