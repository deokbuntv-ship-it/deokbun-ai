// GROUNDED ACTION PLAN V1 — the ACTION SOURCE the consultation schema never had.
//
// The V4 rescore's second root cause: `CONSULTATION_JSON_SCHEMA` has no action field, so procedure reached
// the reader only when the model volunteered it in prose. `consultationPresentationVM` states the
// consequence in its own header — "no 'actions' are invented because the schema has no action source" — and
// the measured result was a ceiling, not a spread: most answers sat at exactly 3/5 on action usefulness.
//
// The fix is NOT a prompt asking for more practical advice. It is a deterministic presentation-level plan
// built from material the server already owns: the GroundedNarrativePlan's claim catalog, the claims' own
// ids, polarities and roles, and the Cross verdict's authoritative temporal claims.
//
// THIS IS NOT A JUDGE. It creates no divination conclusion, ranks nothing metaphysical, and introduces no
// fact. Every item is one authoritative claim's own text plus a FIXED procedural frame that asserts nothing
// about the chart — the same construction the grounded fallback already uses for its boundary sentence. Each
// item carries the claim ids it stands on, so every action reason is traceable, and `untraceableFacts` over
// any rendered item is empty by construction.
import type { GroundedClaim, GroundedNarrativePlan, NarrativeIntent } from './groundedNarrative';
import { joinDistinctSentences, realize } from './koreanRealization';

export const GROUNDED_ACTION_PLAN_VERSION = 'grounded-action-plan@1.0.0';

/** One procedural line and the authoritative claims it stands on. `sourceClaimIds` is never empty. */
export type GroundedActionItem = {
  text: string;
  sourceClaimIds: readonly string[];
};

export type GroundedActionPlan = {
  intent: NarrativeIntent;
  recommendationBoundary: GroundedNarrativePlan['actionBoundary'];
  /** What to check before acting — always reason-bound, never a generic "알아보세요". */
  verifyItems: readonly GroundedActionItem[];
  /** What currently argues for moving / where the fit works / one side of a comparison. */
  supportConditions: readonly GroundedActionItem[];
  /** What argues for holding / where it becomes costly / the other side. */
  cautionConditions: readonly GroundedActionItem[];
  /** DECISION + COMPARISON only, and never under a DECLINED verdict. */
  proceedCondition?: GroundedActionItem;
  /** DECISION + COMPARISON only. Under DECLINED this carries the UNRESOLVED framing instead. */
  holdCondition?: GroundedActionItem;
  /** TIMING only, and ONLY when an authoritative temporal claim exists (§3 — no invented checkpoint). */
  timingCheckpoint?: GroundedActionItem;
  /** The union of every claim id any item above stands on. */
  sourceClaimIds: readonly string[];
  provenance: readonly ['deokbunai.grounded-action-plan.v1'];
};

// ── FIXED PROCEDURAL FRAMES ──────────────────────────────────────────────────────────────────────────
//
// Each frame is a suffix appended to a claim's own sentence. None of them names a technical entity, a date,
// a money threshold, a percentage, a count, or a deadline — the five things the brief forbids inventing —
// so a frame can never become a product fact. They say only HOW FAR the evidence reaches.
const FRAME = {
  VERIFY: '이 부분이 실제로 어떤지 먼저 확인하십시오.',
  SUPPORT: '여기까지는 밀고 가셔도 됩니다.',
  LIMIT: '이 조건이 풀리기 전에는 크게 벌리지 마십시오.',
  PROCEED: '이 조건이 유지되는 동안은 진행하셔도 됩니다.',
  HOLD: '이 조건이 그대로면 확정은 미루십시오.',
  UNRESOLVED: '어느 쪽인지 지금 근거로는 정해지지 않아, 한쪽으로 확정하지 마십시오.',
  CHECKPOINT: '이 흐름이 바뀌는지 한 번 더 확인하고 다음 결정을 하십시오.',
  NOTICE: '이 자리가 다시 건드려지는지 지켜보십시오.',
  SLOW: '이 지점에서 반응을 한 박자 늦추십시오.',
  FIT_WORKS: '이 결이 힘을 받는 자리에 시간을 쓰십시오.',
  FIT_COSTS: '이 자리에서는 같은 결이 비용으로 돌아옵니다.',
  FIT_CONDITION: '이 조건이 갖춰진 자리인지 보고 고르십시오.',
  DECISIVE: '여기가 두 쪽을 가르는 지점입니다.',
} as const;

const MAX_PER_BUCKET = 2;

/** Section headings, by what the reader actually asked. Fixed text — see the frames note above. */
const ACTION_TITLE: Record<NarrativeIntent, string> = {
  DECISION: '이렇게 움직이시면 됩니다',
  COMPARISON: '어느 쪽을 먼저 보시면 됩니다',
  TIMING: '시점을 이렇게 보시면 됩니다',
  EXPLANATION: '이렇게 이해하시면 됩니다',
  TRAIT: '이 결을 이렇게 쓰시면 됩니다',
};

const claimsOf = (plan: GroundedNarrativePlan, ids: readonly string[]): GroundedClaim[] =>
  ids.map((id) => plan.claims.find((c) => c.id === id)).filter((c): c is GroundedClaim => !!c);

/**
 * Pools, built from the plan's OWN role/polarity assignments. Nothing here re-decides what a claim means:
 * SUPPORT/LIMIT is the polarity the Cross verdict already stamped on it.
 */
function pools(plan: GroundedNarrativePlan) {
  const evidence = plan.claims.filter((c) => c.role === 'EVIDENCE');
  return {
    supports: [...claimsOf(plan, plan.positiveClaims), ...evidence.filter((c) => c.polarity === 'SUPPORT')],
    limits: [...claimsOf(plan, plan.cautionClaims), ...evidence.filter((c) => c.polarity === 'LIMIT')],
    reasons: claimsOf(plan, plan.coreReasons),
    synthesis: claimsOf(plan, plan.contradictionClaims),
    timing: claimsOf(plan, plan.timingClaims),
  };
}

/**
 * Build the plan. Pure and deterministic: the same narrative plan in ⇒ the same action plan out.
 *
 * One claim is spent in exactly one item, so the section never says the same thing twice, and the buckets are
 * filled in the order the intent cares about — a "why is this happening" question is never handed
 * proceed/hold decision boilerplate, and a timing question never gets a checkpoint the verdict did not
 * authorize.
 */
export function buildGroundedActionPlan(plan: GroundedNarrativePlan): GroundedActionPlan {
  const declined = plan.verdictState === 'DECLINED';
  const p = pools(plan);
  const spent = new Set<string>();

  const take = (pool: readonly GroundedClaim[], n = 1): GroundedClaim[] => {
    const out: GroundedClaim[] = [];
    for (const c of pool) {
      if (out.length >= n) break;
      if (spent.has(c.id)) continue;
      spent.add(c.id);
      out.push(c);
    }
    return out;
  };
  const item = (c: GroundedClaim, frame: string): GroundedActionItem => ({
    // The claim VERBATIM, then a fixed frame. Realization is orthography/speech level only.
    text: realize(`${c.authoritativeMeaning} ${frame}`),
    sourceClaimIds: [c.id],
  });
  const items = (pool: readonly GroundedClaim[], frame: string, n = MAX_PER_BUCKET): GroundedActionItem[] =>
    take(pool, n).map((c) => item(c, frame));

  let verifyItems: GroundedActionItem[] = [];
  let supportConditions: GroundedActionItem[] = [];
  let cautionConditions: GroundedActionItem[] = [];
  let proceedCondition: GroundedActionItem | undefined;
  let holdCondition: GroundedActionItem | undefined;
  let timingCheckpoint: GroundedActionItem | undefined;

  switch (plan.intent) {
    case 'DECISION': {
      // What to verify comes from the LIMITS first: the thing that could change the answer is what is worth
      // checking. Support/hold conditions are taken AFTER, from what is left, so nothing is said twice.
      verifyItems = items([...p.limits, ...p.reasons], FRAME.VERIFY, 1);
      // The explicit proceed/hold condition is reserved BEFORE the buckets are filled. A decision question
      // whose whole evidence set was spent on descriptive bullets is exactly the ceiling this repair exists
      // to lift — the reader asked whether to move, so the answer owes an explicit condition first.
      if (!declined) proceedCondition = take(p.supports, 1).map((c) => item(c, FRAME.PROCEED))[0];
      holdCondition = take(declined ? [...p.synthesis, ...p.limits, ...p.reasons] : [...p.limits, ...p.reasons], 1)
        .map((c) => item(c, declined ? FRAME.UNRESOLVED : FRAME.HOLD))[0];
      supportConditions = items(p.supports, FRAME.SUPPORT);
      cautionConditions = items(p.limits, FRAME.LIMIT);
      break;
    }
    case 'TIMING': {
      // §3 — a checkpoint exists ONLY when the verdict supplied an authoritative temporal claim. With no
      // grounded time there is no checkpoint, not a softer one.
      timingCheckpoint = take(p.timing, 1).map((c) => item(c, FRAME.CHECKPOINT))[0];
      verifyItems = items([...p.limits, ...p.reasons], FRAME.VERIFY, 1);
      supportConditions = items(p.supports, FRAME.SUPPORT);
      cautionConditions = items(p.limits, FRAME.LIMIT);
      break;
    }
    case 'EXPLANATION': {
      // A causal question gets the pattern, what to watch, and behaviour tied to the named risk — never
      // proceed/hold, which would answer a decision nobody asked about.
      verifyItems = items([...p.reasons, ...p.synthesis], FRAME.NOTICE, 1);
      supportConditions = items(p.supports, FRAME.NOTICE);
      cautionConditions = items(p.limits, FRAME.SLOW);
      break;
    }
    case 'TRAIT': {
      verifyItems = items([...p.reasons, ...p.synthesis], FRAME.FIT_CONDITION, 1);
      supportConditions = items(p.supports, FRAME.FIT_WORKS);
      cautionConditions = items(p.limits, FRAME.FIT_COSTS);
      break;
    }
    case 'COMPARISON': {
      // The decisive axis is whatever Cross itself resolved (synthesis/contradiction); the two sides are the
      // evidence as it stands. An unresolved comparison keeps its unresolved state — it never becomes a pick.
      verifyItems = items([...p.synthesis, ...p.reasons], FRAME.DECISIVE, 1);
      if (declined) {
        // Reserved before the buckets, for the same reason as DECISION — and an unresolved comparison must
        // still SAY it is unresolved, which is the one line that keeps it from reading as a pick.
        holdCondition = take([...p.synthesis, ...p.reasons, ...p.limits, ...p.supports], 1)
          .map((c) => item(c, FRAME.UNRESOLVED))[0];
      } else {
        proceedCondition = take(p.supports, 1).map((c) => item(c, FRAME.PROCEED))[0];
        holdCondition = take([...p.limits, ...p.reasons], 1).map((c) => item(c, FRAME.HOLD))[0];
      }
      supportConditions = items(p.supports, FRAME.SUPPORT);
      cautionConditions = items(p.limits, FRAME.LIMIT);
      break;
    }
  }

  const all = [
    ...verifyItems, ...supportConditions, ...cautionConditions,
    proceedCondition, holdCondition, timingCheckpoint,
  ].filter((x): x is GroundedActionItem => !!x);

  return {
    intent: plan.intent,
    recommendationBoundary: plan.actionBoundary,
    verifyItems, supportConditions, cautionConditions,
    ...(proceedCondition ? { proceedCondition } : {}),
    ...(holdCondition ? { holdCondition } : {}),
    ...(timingCheckpoint ? { timingCheckpoint } : {}),
    sourceClaimIds: [...new Set(all.flatMap((i) => i.sourceClaimIds))],
    provenance: ['deokbunai.grounded-action-plan.v1'],
  };
}

/**
 * The user-visible "행동" section, rendered with NO LLM step — same contract as `renderVerifiedEvidenceSection`.
 * Returns null when no claim was available to stand on, because a boundary sentence with nothing behind it is
 * exactly the generic advice this repair exists to remove.
 */
export function renderGroundedActionSection(plan: GroundedActionPlan): { title: string; body: string } | null {
  const ordered = [
    ...plan.verifyItems,
    ...plan.supportConditions,
    ...plan.cautionConditions,
    ...(plan.proceedCondition ? [plan.proceedCondition] : []),
    ...(plan.holdCondition ? [plan.holdCondition] : []),
    ...(plan.timingCheckpoint ? [plan.timingCheckpoint] : []),
  ];
  if (ordered.length === 0) return null;
  const body = joinDistinctSentences(ordered.map((i) => i.text));
  return body.length > 0 ? { title: ACTION_TITLE[plan.intent], body: realize(body) } : null;
}

export { ACTION_TITLE as GROUNDED_ACTION_TITLE };
