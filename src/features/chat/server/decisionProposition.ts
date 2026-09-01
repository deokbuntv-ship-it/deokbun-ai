// DECISION SEMANTICS V1 — THE PROPOSITION THE USER ACTUALLY ASKED THE SYSTEM TO JUDGE.
//
// The V6.1 decline census found that 30 of 40 non-directional consultations were proposition-targeting
// failures, and 0 were proven chart insufficiency. The pipeline reduced every question to (axis, mode,
// topic): one narrow `JudgmentDomain`, one `QuestionIntent`, one coarse asked-matter id. Nothing carried
// WHAT the person wanted decided.
//
// Two measured consequences:
//
//   · A question about KEEPING money bound to MONEY_INFLOW while the judges had a directional
//     MONEY_RETENTION reading; a question about whether a relationship LASTS bound to RELATION_BOND while
//     the material judgment sat on RELATION_STABILITY. Cross filters candidates by `questionAxis === asked`,
//     so the relevant direction was dropped by an equality test. 12 declines.
//
//   · With one axis and no proposition, a question naming two options ("남는 쪽과 옮기는 쪽") could not even
//     record that two options existed.
//
// This module is the missing contract. It is PURE, DETERMINISTIC and OFFLINE — it reuses the resolvers the
// server already runs (domain, intent, timing, asked-target, comparison) and adds no provider call.
//
// WHAT IT DELIBERATELY DOES NOT DO: it does not judge. `options` is representational only. The current Judge
// contract expresses a stance about an AXIS, never about an ACTION, so no layer here may conclude that
// option A beats option B — that requires a Judge-contract change and is explicitly a later batch.
import {
  routeConsultationJudgeDomain,
  type ConsultationJudgeDomain,
  type JudgmentDomain,
  type QuestionIntent,
  type SemanticTarget,
} from '@/features/divination';
import { classifyConsultationDomain, focusClause, type ConsultationDomain } from './consultationDomain';

export const DECISION_PROPOSITION_VERSION = 'decision-proposition@1.0.0';

/** What SHAPE of thing the person asked. Read from the ask (the focus clause), never from the narration. */
export type PropositionKind =
  | 'SHOULD_I_DO_X'   // a single action, weighed against not doing it
  | 'A_VS_B'          // two or more named alternatives
  | 'WILL_X_HAPPEN'   // an occurrence, not a choice
  | 'WHEN_X'          // the period itself is the requested answer
  | 'WHY_X'           // a cause is requested
  | 'WHAT_AM_I';      // a description of the person, not a decision

/** What a satisfying answer has to deliver. */
export type RequestedOutcome = 'DIRECTION' | 'OCCURRENCE' | 'PERIOD' | 'CAUSE' | 'DESCRIPTION';

/**
 * WHY an axis is bound to this proposition — and therefore how much authority it may carry.
 *
 * This is the field that keeps V6's off-axis repair intact while widening what the system may look at.
 * Membership in `bearingAxes` is NOT a vote; the ROLE is.
 *
 *   PRIMARY    — directly answers the proposition. The ONLY role that may decide the direction.
 *   OUTCOME    — a result materially caused by the proposition; may colour what the direction MEANS.
 *   CONSTRAINT — materially limits or qualifies it; may produce compound truth, never replace the answer.
 *   TIMING     — temporal bearing only.
 *   CONTEXT    — explanatory only. May never make OPEN/BLOCKED/proceed/hold for the user's decision.
 */
export type AxisRole = 'PRIMARY' | 'OUTCOME' | 'CONSTRAINT' | 'TIMING' | 'CONTEXT';
export type BearingAxis = { readonly axis: JudgmentDomain; readonly role: AxisRole };

export type DecisionProposition = {
  readonly kind: PropositionKind;
  /** The consultation domain the proposition belongs to, or null when the question names none. */
  readonly askedDomain: ConsultationJudgeDomain | null;
  /** The concrete thing being asked about, in the user's own words. Preserved for traceability — never judged. */
  readonly decisionObject: string | null;
  readonly requestedOutcome: RequestedOutcome;
  /**
   * Named alternatives the user supplied. REPRESENTATIONAL ONLY: the current Judge contract cannot evaluate
   * an option, so nothing downstream may derive "A is better than B" from this list.
   */
  readonly options: readonly string[];
  /** Whether the proposition itself is scoped in time, from the question's own framing. */
  readonly temporalScope: 'PRESENT' | 'NEAR_TERM' | 'UNSPECIFIED';
  /** Another person who is part of the proposition, when the question puts one there. */
  readonly counterparty: 'PARTNER' | 'FORMER_PARTNER' | 'OTHER' | null;
  /** Role-tagged axes. Exactly one PRIMARY whenever a domain resolved; never an untyped axis list. */
  readonly bearingAxes: readonly BearingAxis[];
  readonly provenance: readonly ['deokbunai.decision-proposition.v1'];
};

// ── PROPOSITION KIND — read from the ask ──────────────────────────────────────────────────────────────
// Each pattern is a general Korean interrogative construction, not a topic word.
const CMP = /어느\s*(?:쪽|것|게|편)|둘\s*중|두\s*개\s*중|중에\s*(?:어느|뭐|무엇)|아니면|\S+할지\s*\S*할지|나을까요|골라야|택해야|선택하는\s*게/;
const WHEN = /언제|몇\s*월|어느\s*(?:시기|때)|시기[를가는]|시점[을이는]|타이밍/;
const WHY = /왜\s|왜요|이유(?:가|는|를)|원인(?:이|은)|때문(?:인가|일까)/;
const WHAT_AM_I = /어떤\s*사람|제\s*성격|성향(?:이|은)|타고난\s*(?:성격|기질|결)|저는\s*어떤/;
const SHOULD = /[가-힣]+도\s*(?:될까|괜찮|되나|좋을까|하나)|할까요|말까|괜찮을까|나을까|맞을까|진행해도|시작해도|계속\s*(?:\S+\s*)?(?:해도|가도|다녀도|버티|끌고)|의미가\s*있을까/;
const WILL = /있을까요|될까요|가능성|생길까|올까요|이어질|잘\s*될/;

function propositionKind(focus: string, whole: string): PropositionKind {
  // A comparison is recognised first: it is the most specific shape and it survives any other cue.
  if (CMP.test(focus)) return 'A_VS_B';
  if (WHY.test(focus)) return 'WHY_X';
  if (WHAT_AM_I.test(focus)) return 'WHAT_AM_I';
  // A "when" ask outranks a bare should/will, because the period IS what was requested.
  if (WHEN.test(focus)) return 'WHEN_X';
  if (SHOULD.test(focus)) return 'SHOULD_I_DO_X';
  if (WILL.test(focus)) return 'WILL_X_HAPPEN';
  // Nothing in the ask — fall back to the whole question, same order.
  if (CMP.test(whole)) return 'A_VS_B';
  if (WHEN.test(whole)) return 'WHEN_X';
  if (SHOULD.test(whole)) return 'SHOULD_I_DO_X';
  if (WILL.test(whole)) return 'WILL_X_HAPPEN';
  if (WHY.test(whole)) return 'WHY_X';
  if (WHAT_AM_I.test(whole)) return 'WHAT_AM_I';
  return 'WILL_X_HAPPEN';
}

const OUTCOME_OF: Record<PropositionKind, RequestedOutcome> = {
  SHOULD_I_DO_X: 'DIRECTION', A_VS_B: 'DIRECTION', WILL_X_HAPPEN: 'OCCURRENCE',
  WHEN_X: 'PERIOD', WHY_X: 'CAUSE', WHAT_AM_I: 'DESCRIPTION',
};

// ── OPTIONS — preserved, never judged ─────────────────────────────────────────────────────────────────
// Split on the connectives Korean uses to lay two choices side by side. Each side is trimmed to the clause
// head so the stored option is the thing chosen between, not the whole sentence.
// "…남는 쪽과 …옮기는 쪽 중" — the 과/와 conjunction after a 쪽/것 head is how Korean lays two choices side
// by side, and it is as common as 아니면 in real consultation questions.
const OPTION_SPLIT = /\s*,?\s*(?:아니면|또는|vs\.?|혹은)\s*|(?<=쪽|것)(?:과|와)\s+|\s*,\s*(?=\S+(?:할지|하는\s*게|하느냐|쪽))/;
const OPTION_TAIL = /(?:할지|하는\s*게|하느냐|하는\s*것|쪽(?:과|와|이|을|은)?|중에서?|중)\s*.*$/;

function extractOptions(focus: string, whole: string): string[] {
  const source = CMP.test(focus) ? focus : whole;
  const parts = source.split(OPTION_SPLIT).map((s) => s.trim()).filter((s) => s.length > 0);
  if (parts.length < 2) return [];
  const cleaned = parts
    .map((p) => p.replace(/^[^가-힣A-Za-z0-9]+/, '').replace(OPTION_TAIL, '').trim())
    .map((p) => p.split(/\s+/).slice(-6).join(' ').trim())
    .filter((p) => p.length >= 2 && p.length <= 40);
  return [...new Set(cleaned)].slice(0, 3);
}

// ── DECISION OBJECT — the thing being decided about, in the user's words ──────────────────────────────
// Bounded and honest: the clause fragment that carries the ask, stripped of the interrogative tail. It is a
// traceability field, not an input to any judgment.
const ASK_TAIL = /(?:할까요|될까요|괜찮을까요|나을까요|맞을까요|있을까요|궁금합니다|궁금해요|봐주세요|알고\s*싶어요|모르겠어요|고민입니다|고민\s*중입니다)\s*[.?!]?\s*$/;

function extractDecisionObject(focus: string): string | null {
  const trimmed = focus.replace(ASK_TAIL, '').replace(/[.?!]\s*$/, '').trim();
  if (trimmed.length < 2) return null;
  const words = trimmed.split(/\s+/);
  const obj = words.slice(-8).join(' ').trim();
  return obj.length >= 2 && obj.length <= 60 ? obj : null;
}

// ── COUNTERPARTY / TEMPORAL SCOPE ─────────────────────────────────────────────────────────────────────
const FORMER = /헤어진|전\s*(?:남자|여자)\s*친구|전남친|전여친|재회|다시\s*(?:만나|연락)|되돌[릴리]|그\s*사람/;
const PARTNER = /만나는\s*사람|남자\s*친구|여자\s*친구|남친|여친|배우자|상대(?:방|가|는|에게)|애인|지금\s*만나/;
const NEAR = /올해|내년|이번\s*달|다음\s*달|곧|조만간|앞으로|하반기|상반기|몇\s*(?:달|개월|년)/;
const PRESENT = /지금|현재|요즘|당장|이번에/;

// ── BEARING AXES — the heart of the contract ──────────────────────────────────────────────────────────
//
// Exactly ONE PRIMARY. Widening the axis set without this rule would re-open the off-axis contamination V6
// closed, and would ALSO increase declines: Cross resolves conflicts among candidates, so two PRIMARY axes
// pointing different ways would force UNRESOLVED where one axis answered cleanly.
//
// The sibling axis of the same content domain is bound at OUTCOME — it describes what the primary direction
// RESULTS IN (money that comes in is what there is to keep; a bond is what a lasting relationship is made
// of) — so it may colour the meaning without ever deciding it.
// '그대로' / '남지 않' is the ordinary way of saying nothing STAYS — a retention statement with no retention noun.
// "통장은 그대로" / "남지 않는다" is the ordinary way of saying nothing STAYS — a retention statement made
// with no retention noun in it at all.
const RETENTION = /모으|모이|모일|남[아을는]|쌓|저축|지키|유지|새(?:나가|어)|아끼|절약|목돈|통장|그대로[예입이]|안\s*남|남지\s*않/;
const INFLOW = /벌|들어오|수입|소득|매출|버는|불리|굴리|투자|늘리/;
// 이어지- is the same stem as 이어질, and a relationship ENDING is a question about whether it lasts, not
// about attraction — both belong to the stability side.
const LASTING = /오래|계속|이어지|이어질|편해질|결혼|평생|잘\s*될|안정|같이\s*살|버틸|끝납|끝나|깨지/;
const MEETING = /만날|만나고|인연|소개팅|새로운\s*사람|고백|썸|끌리/;

function bindAxes(
  domain: ConsultationJudgeDomain | null,
  fallbackAxis: JudgmentDomain,
  kind: PropositionKind,
  text: string,
  focus: string,
  asksTiming: boolean,
): BearingAxis[] {
  // The ASK decides which sibling axis answers; the narration is only consulted when the ask is silent.
  // "버는 건 그대로인데 남는 게 없습니다. 돈이 좀 모일까요?" names both, and the question is about keeping.
  const hits = (re: RegExp) => (re.test(focus) ? 'FOCUS' : re.test(text) ? 'TEXT' : 'NONE');
  const prefer = (a: RegExp, b: RegExp) => {
    const ha = hits(a); const hb = hits(b);
    if (ha === hb) return null;
    if (ha === 'FOCUS') return true;
    if (hb === 'FOCUS') return false;
    return ha === 'TEXT';
  };
  const out: BearingAxis[] = [];
  const push = (axis: JudgmentDomain, role: AxisRole) => {
    if (!out.some((b) => b.axis === axis)) out.push({ axis, role });
  };

  switch (domain) {
    case 'MONEY': {
      // Which money question is it — what comes IN, or what STAYS? Both axes exist in the ontology; the
      // proposition decides which one answers and which one is the result.
      const keeps = prefer(RETENTION, INFLOW);
      if (keeps === true) { push('MONEY_RETENTION', 'PRIMARY'); push('MONEY_INFLOW', 'OUTCOME'); }
      else { push('MONEY_INFLOW', 'PRIMARY'); push('MONEY_RETENTION', 'OUTCOME'); }
      break;
    }
    case 'LOVE': {
      // Meeting someone is a BOND question; whether it lasts is a STABILITY question. Binding both as
      // PRIMARY would make two different questions compete; binding the other as OUTCOME keeps the answer.
      const lasts = prefer(LASTING, MEETING);
      if (lasts === true) { push('RELATION_STABILITY', 'PRIMARY'); push('RELATION_BOND', 'OUTCOME'); }
      else { push('RELATION_BOND', 'PRIMARY'); push('RELATION_STABILITY', 'OUTCOME'); }
      break;
    }
    case 'REUNION': {
      // Reconnection is judged on the bond — but "다시 이어지면 결국 똑같아질까" is not asking whether the
      // attraction returns, it is asking whether it would LAST this time. Same discriminator as LOVE, for the
      // same reason: the ask decides which of the two relationship axes answers it.
      const lasts = prefer(LASTING, MEETING);
      if (lasts === true) { push('RELATION_STABILITY', 'PRIMARY'); push('RELATION_BOND', 'OUTCOME'); }
      else { push('RELATION_BOND', 'PRIMARY'); push('RELATION_STABILITY', 'OUTCOME'); }
      break;
    }
    case 'CAREER': {
      push('CAREER', 'PRIMARY');
      // Leaving is a real limit on a career answer, but it is a different decision — CONSTRAINT, not a vote.
      push('MOVEMENT', 'CONSTRAINT');
      break;
    }
    case 'CHANGE': {
      push('MOVEMENT', 'PRIMARY');
      // A move driven by work is qualified by the work axis; it does not become a career answer.
      push('CAREER', 'CONSTRAINT');
      break;
    }
    case 'BUSINESS': {
      push('OPPORTUNITY', 'PRIMARY');
      // What the business RETAINS is the outcome of running it — the "돈은 남는가" half of a business ask.
      push('MONEY_RETENTION', 'OUTCOME');
      break;
    }
    case 'TIMING': {
      push('TIMING', 'PRIMARY');
      break;
    }
    default: {
      // No routed domain: the previously resolved axis stays PRIMARY, so behaviour is unchanged where the
      // ontology has nothing better to say.
      push(fallbackAxis, 'PRIMARY');
      break;
    }
  }
  // A timing-flavoured question gets TIMING bearing unless TIMING already answers it.
  if ((asksTiming || kind === 'WHEN_X') && !out.some((b) => b.axis === 'TIMING')) push('TIMING', 'TIMING');
  return out;
}

/**
 * Build the proposition. Pure: same question + same already-resolved routing in ⇒ same proposition out. No
 * I/O, no provider call, no new classifier — `askedAxis` and `intent` are the values the server already
 * resolved, passed in so this module cannot disagree with the routing that fed the judges.
 */
export function buildDecisionProposition(
  question: string,
  resolved: { askedAxis: JudgmentDomain; intent: QuestionIntent; asksTiming: boolean; askedTarget?: SemanticTarget | null },
): DecisionProposition {
  const q = (question ?? '').trim();
  const focus = focusClause(q);
  const topic: ConsultationDomain = classifyConsultationDomain(q);
  // The SAME routing the judges use, asked target included — so the proposition can never disagree with the
  // domain the consultation judges were actually pointed at.
  const askedDomain = routeConsultationJudgeDomain(resolved.askedTarget ?? undefined, resolved.askedAxis);
  const kind = propositionKind(focus, q);
  const options = kind === 'A_VS_B' ? extractOptions(focus, q) : [];
  return {
    kind,
    askedDomain,
    decisionObject: extractDecisionObject(focus),
    requestedOutcome: OUTCOME_OF[kind],
    options,
    temporalScope: PRESENT.test(focus) ? 'PRESENT' : NEAR.test(q) ? 'NEAR_TERM' : 'UNSPECIFIED',
    counterparty: FORMER.test(q) ? 'FORMER_PARTNER' : PARTNER.test(q) ? 'PARTNER' : null,
    bearingAxes: bindAxes(askedDomain, resolved.askedAxis, kind, q, focus, resolved.asksTiming),
    provenance: ['deokbunai.decision-proposition.v1'],
  };
}

/** The axes that may DECIDE the direction. Exactly the PRIMARY bindings — never membership alone. */
export const decidingAxes = (p: DecisionProposition): JudgmentDomain[] =>
  p.bearingAxes.filter((b) => b.role === 'PRIMARY').map((b) => b.axis);

/** The axes that may QUALIFY the answer (compound truth, scope, limits) but never replace it. */
export const qualifyingAxes = (p: DecisionProposition): JudgmentDomain[] =>
  p.bearingAxes.filter((b) => b.role === 'OUTCOME' || b.role === 'CONSTRAINT').map((b) => b.axis);

/** Explanatory only — must never produce a direction for the user's decision. */
export const contextAxes = (p: DecisionProposition): JudgmentDomain[] =>
  p.bearingAxes.filter((b) => b.role === 'CONTEXT' || b.role === 'TIMING').map((b) => b.axis);
