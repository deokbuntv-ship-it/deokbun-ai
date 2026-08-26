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
import type { ContradictionResolutionKind, Discipline, JudgmentDomain } from '../contracts';
import { ALL_AXES } from '../axisOntology';

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
  | 'ASKED_MATTER'        // 질문이 지목한 사안 그 자체 (자리·궁·판이 아니라 "무엇을 물었는가")
  | 'COMPOSITE';          // 서로 다른 대상 사이의 관계를 다루는 복합 결론

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

// ── V4D §24/§25/§26 — CLOSED-WORLD IDS ──────────────────────────────────────────────────────────
//
// V4C validated a target id with a REGEX PER KIND. A regex is a SHAPE gate, and a shape gate cannot say
// "this id names something that exists". The independent audit walked straight through it:
//
//   COMPOSITE       accepted `X`, `RIVAL` (a bare relation with no members), `A:|||`, `RIVAL:|` (two EMPTY
//                   children), `COMPOSITE:COMPOSITE:COMPOSITE` — it validated nothing but the character class
//   BOARD_SEAT      accepted `QIMEN_BOARD:LOTTERY_WINNINGS` — an optional suffix NOTHING has ever minted
//   ADAPTED_READING accepted `MYUNGRI:NOT_AN_AXIS` and `QIMEN:STRENGTH_YONGSHIN` — the axis half was
//                   `[A-Z_]+`, so any SCREAMING_SNAKE token passed, including one that reads like the
//                   withheld doctrine gap
//   DOCTRINE_GAP    accepted `AXIS:NOT_A_REAL_AXIS`
//   NATAL_SEAT_PAIR accepted `YEAR_DAY` — UNSORTED. `natalSeatPairTarget` sorts, the regex did not, so a
//                   persisted `YEAR_DAY` restored and never equalled the `DAY_YEAR` the engine mints for the
//                   same relation: the exact identity split this file exists to prevent.
//
// A restored target the kernel has no structure for is worse than a rejected one, because `sameTarget`
// compares it against a real target as an equal. Every id is now checked against a CLOSED registry, and
// `target()` and `isCanonicalTarget()` run the SAME function — V4C shared only the regex, which is how the
// mint path and the restore path were able to drift apart in the first place.
const AXIS = new Set<string>(ALL_AXES);
const DISCIPLINE = new Set<string>(['MYUNGRI', 'ZIWEI', 'QIMEN']);
const SEAT = new Set(['DAY', 'HOUR', 'MONTH', 'YEAR']);
const FAMILY = new Set(['WEALTH', 'OFFICER', 'OUTPUT', 'PEER', 'RESOURCE']);
const SCOPE = new Set(['NATAL', 'DAEWOON', 'SEWOON', 'WOLWOON', 'PRESENT_MOMENT', 'UNSCOPED']);
const FOOTING = new Set(['SEASON', 'ROOT']);
/**
 * V4D §10 — THE MATTER THE QUESTION NAMED.
 *
 * NOT new doctrine and NOT a new Korean keyword table: these ids are a 1:1 ASCII renaming of the topics the
 * server ALREADY classifies every question into. They exist because the axis map collapses several of them
 * onto one axis (사업/창업 → OPPORTUNITY, 이직/이사 → MOVEMENT), so the axis alone cannot say WHICH matter was
 * asked — and a question that names none has NO asked target, which §11 requires be left UNKNOWN rather than
 * inferred from the axis.
 */
const ASKED_MATTER = new Set([
  'BUSINESS', 'STARTUP', 'JOB_CHANGE', 'OCCUPATION', 'MONEY', 'MARRIAGE', 'ROMANCE',
  'RELATIONSHIP', 'HEALTH', 'EXAM', 'RELOCATION', 'CONTRACT',
]);
const PALACE_KEYS = new Set(Object.keys(PALACE_LABEL));

/** §25 — the class of an adapted reading that names no structure at all. */
const ADAPTED_CONTEXT = 'CONTEXT';

/**
 * §26 — THE REGISTERED COMPOSITIONS. A composite is a RELATION over CHILD targets, and both halves are
 * closed: the relation is listed here, and every child must itself be a canonical key.
 *
 *   TWO     exactly two DISTINCT children          `RELATION:<childA>|<childB>`
 *   SPAN    one or two children                    `RELATION:<childA>[|<childB>]`
 *   GROUPS  two named groups of >= 1 child each    `RELATION:<a>|<b>.<c>`
 *   EITHER  SPAN or GROUPS
 *
 * TWO vs SPAN is a real distinction, not a convenience. A RIVALRY is two DIFFERENT structures reaching rival
 * answers, so a rivalry with itself is meaningless. A named DECOMPOSITION ("돈이 들어오는 것과 남는 것") is two
 * AXES read at one or two structures — when both axes are read at the same seat there is genuinely one child,
 * and requiring two would reject a conclusion the kernel legitimately produces.
 *
 * The group separator distinguishes SPAN from GROUPS, so one relation may legally take both forms — which is
 * what INFLOW_VS_RETENTION already does (a 명리 two-group split AND a cross compound frame).
 */
export type CompositionRelation =
  | 'RIVAL'            // crossRules — two rival ANSWERS to the asked question
  | 'RIVAL_VS_WEALTH'  // myungriRules CONTESTED_SHARE
  | ContradictionResolutionKind;  // the 8 named decompositions, INFLOW_VS_RETENTION among them

type CompositionForm = 'TWO' | 'SPAN' | 'GROUPS' | 'EITHER';

const COMPOSITION: Record<CompositionRelation, CompositionForm> = {
  RIVAL: 'TWO',
  RIVAL_VS_WEALTH: 'GROUPS',
  INFLOW_VS_RETENTION: 'EITHER',
  DIFFERENT_DOMAIN: 'SPAN',
  DIFFERENT_TIMESCALE: 'SPAN',
  OPPORTUNITY_VS_OUTCOME: 'SPAN',
  BOND_VS_STABILITY: 'SPAN',
  ACTION_VS_TIMING: 'SPAN',
  DIRECTNESS: 'SPAN',
  RELIABILITY: 'SPAN',
};

// A child key contains none of `| . ~` — EXCEPT a nested composite, which is genuinely reachable: a 명리
// compound (CONTESTED_SHARE / INFLOW_VS_RETENTION) can be one half of a cross rivalry. Escaping is the
// IDENTITY MAP on every flat child, so a flat composite's key stays byte-identical to what V4C minted, and
// the nested case stops being ambiguous instead of being banned — banning it would drop a real conclusion.
const esc = (k: string) => k.replace(/~/g, '~~').replace(/\|/g, '~p').replace(/\./g, '~d');
const unesc = (k: string) =>
  k.replace(/~(.?)/g, (_, c) => (c === 'p' ? '|' : c === 'd' ? '.' : c === '~' ? '~' : ' '));

/** Sorted AND unique in one predicate: an unsorted or duplicated child list is not a valid identity. */
const ascending = (ks: string[]) => ks.every((k, i) => i === 0 || ks[i - 1] < k);

type IdValidator = (id: string, depth: number) => boolean;
const oneOf = (s: ReadonlySet<string>): IdValidator => (id) => s.has(id);

/**
 * A composite may contain composites — a cross compound can span a 명리 compound, which can itself span the
 * contest that established one of its halves. That is three levels, and it is REACHABLE, so the cap is a
 * defence against hostile input rather than a semantic limit. It exists because `validComposite` recurses
 * on a string that arrives from persisted JSON.
 */
const MAX_COMPOSITE_DEPTH = 3;

/** Is `key` a canonical `${kind}:${id}`? `depth` is the composite nesting level of this key. */
function isCanonicalKey(key: string, depth: number): boolean {
  const at = key.indexOf(':');
  if (at <= 0) return false;
  const kind = key.slice(0, at);
  if (!(kind in VALIDATE)) return false;
  if (kind === 'COMPOSITE' && depth > MAX_COMPOSITE_DEPTH) return false;   // bounded, never a tower
  return VALIDATE[kind as TargetKind](key.slice(at + 1), depth);
}

const validComposite: IdValidator = (id, depth) => {
  const at = id.indexOf(':');
  if (at <= 0) return false;                                     // a bare relation names no members
  const relation = id.slice(0, at);
  if (!(relation in COMPOSITION)) return false;                  // closed relation vocabulary
  const groups = id.slice(at + 1).split('.');
  if (groups.length > 2) return false;                           // no free-form third group
  const allowed = COMPOSITION[relation as CompositionRelation];
  const form: CompositionForm = groups.length === 2 ? 'GROUPS' : allowed === 'TWO' ? 'TWO' : 'SPAN';
  if (allowed !== 'EITHER' && allowed !== form) return false;
  return groups.every((g) => {
    // Ordering and uniqueness are checked on the ESCAPED tokens, which is exactly what `compositeTarget`
    // sorts. Checking the unescaped children instead would disagree with the mint whenever a nested composite
    // is present, because escaping moves `|` (0x7C) to `~p` (0x7E 0x70) and reorders the list.
    const tokens = g.split('|');
    if (form === 'TWO' ? tokens.length !== 2 : tokens.length === 0) return false;
    if (!ascending(tokens)) return false;
    return tokens.map(unesc).every((c) => isCanonicalKey(c, depth + 1));
  });
};

const VALIDATE: Record<TargetKind, IdValidator> = {
  NATAL_SEAT: oneOf(SEAT),
  // SORTED, and now ENFORCED sorted. `DAY_DAY` stays legal: 자형 is a seat against itself.
  NATAL_SEAT_PAIR: (id) => {
    const parts = id.split('_');
    return parts.length === 2 && SEAT.has(parts[0]) && SEAT.has(parts[1]) && parts[0] <= parts[1];
  },
  TEN_GOD_FAMILY: oneOf(FAMILY),
  LUCK_LAYER: (id) => {
    const parts = id.split(':');
    return parts.length <= 2 && SCOPE.has(parts[0]) && (parts[1] === undefined || parts[1] === 'RIVAL');
  },
  DAY_MASTER_FOOTING: oneOf(FOOTING),
  PALACE: oneOf(PALACE_KEYS),
  // ONE board per question instant (see `qimenBoardTarget`). Nothing has ever minted a suffix.
  BOARD_SEAT: (id) => id === 'QIMEN_BOARD',
  DOCTRINE_GAP: (id) => id === 'STRENGTH_YONGSHIN' || (id.startsWith('AXIS:') && AXIS.has(id.slice(5))),
  // §25 — registered discipline × (registered axis | the CONTEXT class).
  ADAPTED_READING: (id) => {
    const at = id.indexOf(':');
    if (at <= 0) return false;
    const rest = id.slice(at + 1);
    return DISCIPLINE.has(id.slice(0, at)) && (AXIS.has(rest) || rest === ADAPTED_CONTEXT);
  },
  ASKED_MATTER: oneOf(ASKED_MATTER),
  COMPOSITE: validComposite,
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
  if (!VALIDATE[kind](id, 0)) {
    throw new TargetNamespaceError(`target id "${id}" is not valid for kind ${kind}`);
  }
  return { key: `${kind}:${id}`, label, kind };
}

/**
 * §26 — the ONLY way to mint a COMPOSITE.
 *
 * Children are deduped and SORTED here, so the same structural situation is one identity regardless of the
 * order the rules happened to find its members in. It also collapses the two DIFFERENT comparators the call
 * sites had drifted into: `crossRules` sorted composite children with `localeCompare` (ICU, locale-dependent)
 * while `myungriRules` used the default code-unit sort. Over the realistic key set those two disagree on 80
 * pairs, so a user-visible identity depended on the JS runtime's ICU build — in a kernel that promises two
 * runs of identical input produce identical graphs.
 */
export function compositeTarget(
  relation: CompositionRelation, groups: SemanticTarget[][], label: string,
): SemanticTarget {
  const id = `${relation}:${groups
    .map((g) => [...new Set(g.map((t) => esc(t.key)))].sort().join('|'))
    .join('.')}`;
  return target('COMPOSITE', id, label);
}

/** Validate a target that arrived from OUTSIDE (persisted JSON). Never throws — the parser decides. */
export function isCanonicalTarget(t: unknown): t is SemanticTarget {
  if (t === null || typeof t !== 'object') return false;
  const o = t as Record<string, unknown>;
  if (typeof o.key !== 'string' || typeof o.label !== 'string' || typeof o.kind !== 'string') return false;
  // The label is display-only, but it is rendered VERBATIM into the answer, so an empty or unbounded one is
  // not acceptable input from a persisted row.
  if (o.label.length === 0 || o.label.length > 120) return false;
  if (!(o.kind in VALIDATE)) return false;
  const kind = o.kind as TargetKind;
  const prefix = `${kind}:`;
  if (!o.key.startsWith(prefix)) return false;            // §3 — kind must match the key's namespace
  return VALIDATE[kind](o.key.slice(prefix.length), 0);
}

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
  discipline: Discipline, axis: JudgmentDomain, label: string,
): SemanticTarget {
  return target('ADAPTED_READING', `${discipline}:${axis}`, label);
}

/**
 * §25 — the identity of an adapted reading with INSUFFICIENT SPECIFICITY: the discipline offered a general
 * opinion, not a reading OF anything. It gets its own identity so it can no longer agree with — or contradict
 * — another discipline's direct reading of a real structure merely by sharing an axis label.
 */
export function adaptedContextTarget(discipline: Discipline, label: string): SemanticTarget {
  return target('ADAPTED_READING', `${discipline}:${ADAPTED_CONTEXT}`, label);
}

export function qimenBoardTarget(): SemanticTarget {
  return target('BOARD_SEAT', 'QIMEN_BOARD', '기문 국');
}

const ASKED_MATTER_LABEL: Record<string, string> = {
  BUSINESS: '사업', STARTUP: '창업', JOB_CHANGE: '이직', OCCUPATION: '직업', MONEY: '재물',
  MARRIAGE: '결혼', ROMANCE: '연애', RELATIONSHIP: '인간관계', HEALTH: '건강', EXAM: '시험',
  RELOCATION: '이사', CONTRACT: '계약',
};

/**
 * The matter the question named, or null for UNKNOWN.
 *
 * Returns null rather than throwing, unlike every other constructor here, because its input comes from a
 * CLASSIFIER rather than a call-site literal: an unmapped topic is an honest UNKNOWN, not a bug worth
 * crashing the paid path over.
 */
export function askedMatterTarget(id: string | null | undefined): SemanticTarget | null {
  if (!id) return null;
  const label = ASKED_MATTER_LABEL[id];
  return label ? target('ASKED_MATTER', id, label) : null;
}

const SEAT_LABEL: Record<string, string> = { YEAR: '년주', MONTH: '월주', DAY: '일주', HOUR: '시주' };

/**
 * V4D §33 — ONE NATAL SEAT, ONE LABEL.
 *
 * The label is documented as display-only, but it is interpolated VERBATIM into assertions, and assertions are
 * compared (`screenSynthesis` rejects a restatement by assertion equality; the certification harness observes
 * an ASSERTION delta). So a label that varies while the key does not makes a compared string depend on which
 * premise a rule happened to pick.
 *
 * That was live: `myungriPremises` labelled a seat with the RELATION KIND that struck it, splitting the
 * evidence sentence off `hit.evidence.fact`, so two hits on 일주 produced `NATAL_SEAT:DAY` labelled
 * "원국 일주 천간충" in one premise and "원국 일주 지지형" in another. The relation kind belongs in the
 * ASSERTION, which is about the event; the seat's label names the seat.
 */
export function natalSeatTarget(position: string): SemanticTarget {
  return target('NATAL_SEAT', position, `원국 ${SEAT_LABEL[position] ?? position}`);
}


/**
 * The relation between two natal seats. Sorted so 년↔월 and 월↔년 are ONE identity — an unsorted pair would
 * make the same structural relation compare unequal to itself depending on which seat the engine listed first.
 */
export function natalSeatPairTarget(a: string, b: string): SemanticTarget {
  const [x, y] = [a, b].sort();
  return target('NATAL_SEAT_PAIR', `${x}_${y}`, `원국 ${SEAT_LABEL[x] ?? x}↔${SEAT_LABEL[y] ?? y}`);
}
