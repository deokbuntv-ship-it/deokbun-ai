// Server trust boundary — the authoritative consultation orchestrator (Server-Trust sprint §11–§17).
//
// This is what the Edge Function runs. It is RUNTIME-NEUTRAL (pure TS + dependency injection) so the
// exact same code path is exercised by Node/Jest tests and by the Deno Edge — the security logic is
// therefore verified where it can run (Node), while only the Deno *execution* of the engines is ungated.
//
// It CALCULATES nothing new: it composes the already-approved runtime-neutral pieces —
// selectConsultationContext → buildConsultationGrounding (FROZEN Saju + Ziwei + question-time Qimen) →
// buildPrompt → callLLM → classifyConsultationOutput — but does so on the SERVER from a birth INPUT it
// recomputes, so a modified client can no longer fabricate facts / availability / provenance / consensus.
import { CONSULTATION_PROMPT_VERSION } from '@/features/chat/prompts/consultationPromptVersion';
import { classifyConsultationMode } from '@/features/chat/prompts/consultationMode';
import {
  GROUNDING_UNAVAILABLE,
  toSafeGrounding,
  type ConsultationGrounding,
} from '@/features/chat/prompts/grounding';
import { buildPrompt } from '@/features/chat/prompts/promptBuilder';
import {
  composeConsultationText,
  firstStructuredRejectionReason,
  SEMANTIC_REJECTION_MESSAGE,
  type ConsultationOutcome,
  type ParsedStructuredConsultation,
} from '@/features/chat/prompts/structuredConsultation';
import { selectConsultationContext } from '@/features/chat/selectors/contextSelector';
import {
  buildConsultationGrounding, resolveJudgmentDomain, resolveQuestionIntent,
} from '@/features/chat/services/consultationGrounding';
import { classifyTimingQuestion } from '@/features/chat/selectors/qimenActivation';
import { buildStructuredConsultationResult } from '@/features/chat/services/structuredConsultationResult';
import {
  ANSWER_PLAN_VERSION,
  DECISION_POLICY_VERSION,
  deriveAnswerPlan,
  renderAnswerPlanDirective,
} from './answerPlan';
import { CERTAINTY_REGEN_DIRECTIVE, classifyWithGuards } from './certaintyGuard';
import {
  classifyConsultationSafetyRoute,
  isHardStopRoute,
  safeResponseForRoute,
  type SafetyRoute,
} from './consultationSafety';
import { buildConsultationDecisionMeta } from './decisionMeta';
import { classifyConsultationDomain } from './consultationDomain';
import {
  buildConsultationContentPlan, renderContentPlanDirective, renderVerifiedEvidenceSection,
  type ConsultationContentPlan,
} from './consultationContentPlan';
import {
  extendGraph, refinementFailure, renderVerdictDirective, NO_SIGNAL,
  isDeclinedToDecide, buildDeclinedSummary, type CrossDivinationVerdict,
} from '@/features/divination';
import {
  buildGroundedNarrativePlan, classifyGroundedViolations, composeGroundedFallback, gateAgainstGroundedNarrative,
  narrativeIntentOf, renderGroundedSections, untraceableFacts,
  type GroundedViolationCategory, type NarrativeIntent,
} from './groundedNarrative';
import { groundingFromStoredDecision, priorAxisContextFor } from './storedDecisionGrounding';
import { buildResolvedTemporalContext } from './resolvedTemporalContext';
import { DEOKBUNAI_SAJU_RULE_SET_VERSION } from '@/features/interpretation';
import {
  classifyContinuationIntent,
  classifyFollowUpIntent,
  previousDecisionFromMeta,
  renderFollowUpDirective,
  resolveFollowUpAction,
  type PreviousDecision,
} from '@/features/chat/services/followUpContext';
import type { ConsultationDomain } from './consultationDomain';
import type { ChatMessage } from '@/features/chat/types/chat';
import type { BirthInfoDraft, ConsultationDraft } from '@/features/consultation';
import type {
  ConsultationDecisionMeta,
  PriorHistoryLoad,
  ServerConsultationDeps,
  ServerConsultationDiagnostics,
  ServerConsultationRequest,
  ServerConsultationResult,
  ServerGroundingMeta,
  UntrustedTurn,
} from './serverConsultationTypes';

// Server-side conversation bounds (§20). History is untrusted context; cap it so it can neither blow the
// prompt budget nor smuggle huge payloads. Keeps the most recent turns.
const MAX_CONTEXT_TURNS = 12;
const MAX_TURN_CHARS = 4000;

// Untrusted turns → the ChatMessage[] buildPrompt expects. CRITICAL (§8/§20): only user/assistant roles
// survive — any injected `system` (or unknown role) is DROPPED, so a client can never author an
// authoritative system message via the conversation history. Content is coerced + bounded.
function sanitizeConversation(turns: UntrustedTurn[] | undefined): ChatMessage[] {
  if (!Array.isArray(turns)) return [];
  const safe: ChatMessage[] = [];
  for (const turn of turns.slice(-MAX_CONTEXT_TURNS)) {
    if (turn === null || typeof turn !== 'object') continue;
    const role = (turn as { role?: unknown }).role;
    if (role !== 'user' && role !== 'assistant') continue; // drops 'system' + anything else
    const rawContent = (turn as { content?: unknown }).content;
    if (typeof rawContent !== 'string') continue;
    const text = rawContent.trim().slice(0, MAX_TURN_CHARS);
    if (text.length === 0) continue;
    safe.push({ id: `ctx-${safe.length}`, role, text });
  }
  return safe;
}

// Minimal presence guard so a totally-empty payload fails fast. NOT a calendar validator — the engine
// fail-closes on an impossible/unsupported birth (grounding UNAVAILABLE), never fabricating a chart.
function hasMinimalBirthInput(b: unknown): b is BirthInfoDraft {
  if (b === null || typeof b !== 'object') return false;
  const r = b as Record<string, unknown>;
  return (
    typeof r.birthYear === 'string' && r.birthYear.trim().length > 0 &&
    typeof r.birthMonth === 'string' && r.birthMonth.trim().length > 0 &&
    typeof r.birthDay === 'string' && r.birthDay.trim().length > 0
  );
}

function metaFrom(grounding: ConsultationGrounding, mode: string): ServerGroundingMeta {
  const engines =
    grounding.status === 'available'
      ? {
          myungri: grounding.evidence.myungri.availability,
          ziwei: grounding.evidence.ziwei.availability,
          qimen: grounding.evidence.qimen.availability,
        }
      : { myungri: 'unavailable', ziwei: 'unavailable', qimen: 'unavailable' };
  return {
    grounded: grounding.status === 'available',
    engineVersion: grounding.status === 'available' ? grounding.engineVersion ?? null : null,
    engines,
    promptVersion: CONSULTATION_PROMPT_VERSION,
    answerPlanVersion: ANSWER_PLAN_VERSION,
    decisionPolicyVersion: DECISION_POLICY_VERSION,
    mode,
    questionTimeSource: 'SERVER_RECEIPT_TIME',
  };
}

/**
 * FINAL_VERDICT_AUTHORITY_CLAMP — deterministic presentation-layer backstop, exposed as a PURE function so
 * it is directly testable (mirrors `evaluateConsultationSafetyStop`'s pattern below). NOT a rejection, NOT
 * a regeneration: applied only to an already-ACCEPTED outcome, after a valid substantive answer already
 * exists. For a declined verdict (INSUFFICIENT_DATA/INSUFFICIENT_EVIDENCE), `coreSummary` — the one field
 * whose own schema purpose is "결론... 그래서 어떤 방향이 유리한지" (final decision authority) — is replaced
 * with a server-authored, QUESTION-AWARE, non-directional sentence (`buildDeclinedSummary` — audit-driven
 * remediation §5: the previous byte-identical generic sentence protected direction but discarded question
 * specificity too; the new sentence still cannot assert a direction, invent a fact, or invent timing — it is
 * a fixed template with only a bounded scope phrase and one of 3 deterministic reason categories varying).
 * Every other field (reasoning, evidence, counterevidence, cautions) is returned exactly as the LLM produced
 * it. Returns null for a non-ACCEPTED outcome (nothing to clamp) and the ORIGINAL result object unchanged
 * (same reference) for a directional/decided verdict, a STRUCTURAL_ANSWER/NOT_APPLICABLE verdict, or no
 * verdict at all — so FAVORABLE/CAUTION/MIXED rendering is untouched by construction, not by a second
 * condition someone could later drift out of sync.
 */
export function applyVerdictAuthorityClamp(
  outcome: ConsultationOutcome,
  verdict: CrossDivinationVerdict | null,
  // GROUNDED_NARRATIVE_V2 §14 — the declined sentence now speaks in the shape of the question that was
  // actually asked (설명/성향/시기/비교), resolved from the verdict's own already-computed questionIntent.
  // Default 'DECISION' preserves the previous wording for every existing caller/test.
  intent: NarrativeIntent = 'DECISION',
): ParsedStructuredConsultation | null {
  if (outcome.kind !== 'ACCEPTED') return null;
  if (verdict === null || !isDeclinedToDecide(verdict)) return outcome.result;
  return { ...outcome.result, coreSummary: buildDeclinedSummary(verdict, intent) };
}

/**
 * CRISIS HARD-STOP, exposed as a PURE pre-check (Sprint E.1 §12-14 / HIGH 5). Returns the controlled safe
 * result for a hard-stop route (self-harm / death-lifespan / medical), or `null` for NORMAL /
 * FINANCIAL_GUARANTEE (the caller then runs the normal consultation). It takes ONLY the question + the server
 * receipt time — NO birth, NO grounding, NO LLM, NO I/O — so the Edge can enforce the stop BEFORE any paid
 * reservation, global-spend guard, previous-decision load, or provider call. This is the SINGLE source of the
 * hard-stop response shape: `buildServerConsultation` calls it too, so the Edge pre-check and the orchestrator
 * can never drift.
 */
function safetyStopResult(
  route: SafetyRoute,
  question: string,
  nowEpochSeconds: number,
): ServerConsultationResult {
  return {
    ok: true,
    text: safeResponseForRoute(route) ?? SEMANTIC_REJECTION_MESSAGE,
    groundingMeta: metaFrom(GROUNDING_UNAVAILABLE, 'safety'),
    diagnostics: { outputClassification: 'SAFETY_ROUTED', safetyRoute: route },
    resolvedTemporalContext: buildResolvedTemporalContext(question, nowEpochSeconds, GROUNDING_UNAVAILABLE),
  };
}

export function evaluateConsultationSafetyStop(
  question: string,
  nowEpochSeconds: number,
): ServerConsultationResult | null {
  const q = (question ?? '').trim();
  if (q.length === 0) return null;
  const route = classifyConsultationSafetyRoute(q);
  if (!isHardStopRoute(route)) return null;
  return safetyStopResult(route, q, nowEpochSeconds);
}

/**
 * Build a full consultation entirely on the server (trusted). Reason codes fail closed:
 *  - INVALID_INPUT      → empty question / unusable birth input
 *  - SUBJECT_FORBIDDEN  → a profile id owned by another user (never leaks their data)
 *  - SUBJECT_NOT_FOUND  → no such profile for this user
 *  - LLM_FAILED         → provider threw / returned empty
 * A merely UNAVAILABLE grounding is NOT a failure — the prompt then forbids fabrication and answers
 * within the stated limits (identical to the prior client behavior), never inventing a chart.
 */
export async function buildServerConsultation(
  request: ServerConsultationRequest,
  deps: ServerConsultationDeps,
): Promise<ServerConsultationResult> {
  const question = (request.question ?? '').trim();
  if (question.length === 0) return { ok: false, reason: 'INVALID_INPUT' };

  // 0) Pre-LLM SAFETY ROUTER (Sprint A §2-§7, hardened Sprint E.1 §12-14). A hard-stop category (self-harm /
  //    death-lifespan / medical) must never reach fortune interpretation: return a controlled, honest response
  //    with NO grounding and NO LLM call. Runs before birth resolution so even a missing/invalid birth still
  //    yields the safe response. The Edge enforces this SAME stop BEFORE any paid reservation / global spend
  //    via the shared evaluateConsultationSafetyStop — this call is the in-orchestrator backstop.
  //    FINANCIAL_GUARANTEE is NOT a hard stop (handled by the plan + the output certainty guard).
  const safetyRoute = classifyConsultationSafetyRoute(question);
  if (isHardStopRoute(safetyRoute)) return safetyStopResult(safetyRoute, question, deps.nowEpochSeconds);

  // 1) Resolve TRUSTED birth. A server-owned profile (when addressed + available) wins and the client
  //    birthInput is ignored; otherwise the server recomputes from the untrusted birthInput.
  let birthInfo: BirthInfoDraft;
  let subjectLabel = request.subjectLabel ?? null;
  if (request.subjectProfileId && deps.resolveTrustedBirth) {
    const resolved = await deps.resolveTrustedBirth(request.subjectProfileId);
    if (resolved.status === 'FORBIDDEN') return { ok: false, reason: 'SUBJECT_FORBIDDEN' };
    if (resolved.status === 'NOT_FOUND') return { ok: false, reason: 'SUBJECT_NOT_FOUND' };
    birthInfo = resolved.birthInfo;
    subjectLabel = resolved.subjectLabel ?? subjectLabel;
  } else {
    if (!hasMinimalBirthInput(request.birthInput)) return { ok: false, reason: 'INVALID_INPUT' };
    birthInfo = request.birthInput;
  }

  const draft: ConsultationDraft = {
    subject: {
      id: request.subjectProfileId ?? 'self',
      displayName: (subjectLabel ?? birthInfo.displayName ?? '상담 대상').toString(),
      relationship: null,
    },
    birthInfo,
  };

  const selectedContext = selectConsultationContext(draft);
  if (selectedContext === null) return { ok: false, reason: 'INVALID_INPUT' };

  // 2) LIVE FOLLOW-UP authority is resolved BEFORE current grounding. In particular, WHY must never run the
  //    current chart and then accidentally explain decision B: it may use only decision A's stored snapshot.
  //    Safety already ran and precedes everything (§13). When the CURRENT
  //     question is a follow-up AND the Edge supplied a SERVER-loaded previous decision (never client-
  //     trusted), apply the deterministic follow-up action as an appended directive: "왜?" explains the
  //     STORED conclusion (no new decision, even under a version mismatch); "그럼 내년은?" carries the prior
  //     domain onto the NEW next-year target (polarity re-derived by the normal target-scoped path);
  //     "둘 중에는?" describes the prior candidates with NO winner (Option B). "그럼 언제?" stays deferred.
  /** §23 — set when the standing graph was actually extended this turn (recorded, never acted on). */
  let graphExtended = false;
  const followUpIntent = classifyFollowUpIntent(question);
  // V4C §23 — A REFINEMENT MUST NOT RESTART THE READING.
  //
  // The audit's confirmed failure: "사업을 확장할까?" followed by "돈은?" produced two unrelated readings that
  // could contradict each other. The machinery to carry the prior graph forward existed, but the prior
  // decision was only ever LOADED when `classifyFollowUpIntent` recognised the question ("왜?", "그럼 내년은?",
  // "둘 중에는?") — and "돈은?" is none of those, so `previousMeta` stayed null and every continuity path
  // downstream was dead. The load condition now also covers a question that is syntactically DEPENDENT on the
  // previous turn. `true` is passed here deliberately: this is the "could this be a continuation at all?"
  // probe, asked before we know whether a prior decision exists; the real classification happens after.
  // V4F §8 — the same probe, captured so the REFINE_EXISTING/REEVALUATE_NOW distinction survives even when
  // the load below turns out to be malformed and `previousMeta` has to be treated as null.
  const continuationIfHealthy = classifyContinuationIntent(question, true);
  const mayContinue = continuationIfHealthy !== 'NEW_QUESTION';
  let followUpDirective: string | null = null;
  let followUpVersionMismatch = false;
  let previousDecision: PreviousDecision | null = null;
  let previousMeta: ConsultationDecisionMeta | null = null;
  // G6 PATCH 2 §6/§8 — FOUR STATES, NEVER COLLAPSED: NO_PRIOR_HISTORY / VALID_PRIOR_HISTORY /
  // PRIOR_HISTORY_MALFORMED_OR_UNRESTORABLE / PRIOR_HISTORY_LOAD_FAILED.
  //
  // V4E made the GRAPH fail closed (a malformed persisted verdict is rejected). This is what fails closed on
  // the LOAD: a row that never existed, a row that exists but failed decisionMeta.ts's parser, a row that
  // parsed but is itself an earlier turn's decline over malformed history (§7's durability taint), and the
  // query itself throwing are four DIFFERENT facts. Collapsing any pair of them to the same `null` lets an
  // ordinary dependent follow-up ("돈은?", "왜?", "결혼하면?") over a broken history classify exactly like the
  // first turn of a brand-new conversation and silently answer as a fresh primary reading — the same
  // "fail-open through the error path" failure §5 closed for extension, reachable one step earlier, at the
  // load. `priorHistoryProblem` is read once below, only to stop that; MALFORMED and LOAD_FAILED are kept
  // distinct for diagnostics even though both fail closed identically downstream.
  let priorHistoryProblem: 'MALFORMED' | 'LOAD_FAILED' | null = null;
  if ((followUpIntent !== 'NONE' || mayContinue) && deps.loadPreviousDecision) {
    let loaded: PriorHistoryLoad;
    try {
      loaded = await deps.loadPreviousDecision();
    } catch {
      loaded = { status: 'LOAD_FAILED' };
    }
    if (loaded.status === 'VALID') {
      previousMeta = loaded.meta;
    } else {
      previousMeta = null;
      if (loaded.status === 'MALFORMED' || loaded.status === 'LOAD_FAILED') priorHistoryProblem = loaded.status;
    }
    previousDecision = previousDecisionFromMeta(previousMeta);
    if (followUpIntent !== 'NONE') {
      // Compare to the current frozen ruleset constant without calculating current decision B.
      const action = resolveFollowUpAction(followUpIntent, previousDecision, {
        engineVersion: DEOKBUNAI_SAJU_RULE_SET_VERSION,
      });
      if (action.kind === 'EXPLAIN_PREVIOUS') followUpVersionMismatch = action.versionMismatch;
      followUpDirective = renderFollowUpDirective(action, previousDecision);
    }
  }
  // The real classification, now that we know whether a prior judgment actually exists. REEVALUATE_NOW is
  // deliberately NOT a refinement: "지금 다시 보면?" asks for a fresh reading, and binding it to the stored
  // judgment would answer a question the user did not ask.
  const continuation = classifyContinuationIntent(question, previousMeta?.divinationVerdict != null);

  // 2b) SERVER-owned grounding. WHY is a strict special case: reconstruct from stored A or remain
  //     unavailable. Every other turn uses the current server receipt time and deterministic engines.
  // V4D §22 — THE EVALUATION INSTANT IS DECIDED ONCE, HERE.
  //
  // V4C computed it inside the else-branch below, so it was out of scope by the time
  // `buildResolvedTemporalContext` ran and that call received the CURRENT clock unconditionally. A refinement
  // therefore persisted a T2 temporal context — anchor instant, reference year/month, resolved targets — beside
  // a verdict evaluated at T1. One row cannot answer to two clocks.
  //
  // The safety stop above deliberately keeps using the real current time: a hard stop is a real-time event,
  // not a refinement.
  const storedInstant = previousMeta?.divinationVerdict?.evaluatedAtEpochSeconds ?? null;
  const evaluationInstant = continuation === 'REFINE_EXISTING' && storedInstant !== null
    ? storedInstant
    : deps.nowEpochSeconds;

  let grounding: ConsultationGrounding = GROUNDING_UNAVAILABLE;
  if (followUpIntent === 'WHY') {
    grounding = toSafeGrounding(groundingFromStoredDecision(previousMeta) ?? GROUNDING_UNAVAILABLE);
    if (!followUpDirective) grounding = GROUNDING_UNAVAILABLE;
  } else if (priorHistoryProblem && continuationIfHealthy === 'REFINE_EXISTING') {
    // G6 PATCH 2 §9 — MALFORMED/LOAD-FAILED HISTORY FAILS CLOSED.
    //
    // An ordinary dependent follow-up whose prior decision row exists-but-invalid, or could not even be
    // loaded, must NOT fall through to the fresh-grounding branch below: that would run the engines at the
    // CURRENT instant and hand back an unrelated first reading dressed as a continuation of one that no
    // longer exists. No engine runs here and no professional verdict is claimed — the same honest
    // `unavailable` state the WHY branch above already uses when it has nothing to restore.
    //
    // REEVALUATE_NOW is unaffected: `continuationIfHealthy` was computed with `hasPriorDecision: true`
    // BEFORE the load above, and an explicit re-evaluation marker in `classifyContinuationIntent` is checked
    // ahead of `hasPriorDecision` — so "지금 다시 보면?" still reaches the fresh-grounding branch below
    // regardless of whether history was malformed/unloadable, exactly as G5 requires.
    grounding = { status: 'unavailable', reason: 'calculation_failed' };
    followUpDirective = '[후속 지침 — 이전 상담 복원 불가] 이전 상담 기록을 이번 답변에 안전하게 이어붙일 수 없습니다. '
      + '새로운 판정을 지어내지 말고, 이전 상담 내용을 지금 확인할 수 없다는 점을 안내한 뒤 원하시는 부분을 '
      + '다시 구체적으로 질문해 달라고 정중히 요청하십시오.';
  } else {
    // V4C §23/§24 — A REFINEMENT INHERITS THE ORIGINAL EVALUATION INSTANT (decided above, §22).
    //
    // "돈은?" is a continuation of the reading the user already received, so it must be answered from the SAME
    // moment in time. Re-grounding at the current server instant T2 produced a second, unrelated reading whose
    // 세운/월운 layers could differ from the ones the first answer stood on — which is how the two turns came
    // to contradict each other. An explicit "지금 다시 보면?" (REEVALUATE_NOW) is the one case that legitimately
    // wants a NEW instant, and it is classified apart for exactly that reason.
    try {
      grounding = toSafeGrounding(
        await buildConsultationGrounding(
          draft,
          {
            digestProvider: deps.digestProvider,
            historicalTimezoneResolver: deps.historicalTimezoneResolver,
            nowEpochSeconds: evaluationInstant,
          },
          question,
        ),
      );
    } catch {
      grounding = GROUNDING_UNAVAILABLE;
    }
    // V4B §25 — an axis drilldown is a CONTINUATION, not a second reading. When the previous turn's graph
    // already says something about the axis now being asked, that context rides along so the new answer can
    // connect to the judgment the user already received instead of silently replacing it.
    // V4D §19/§20 — A REFINEMENT EXTENDS G1; IT DOES NOT REPLACE IT WITH G2.
    //
    // The engines above have just rebuilt the same evidence at the same instant T1, which is what makes this
    // safe: the freshly-built verdict is DISCARDED and the restored graph is re-derived across the newly asked
    // axis instead, so every conclusion this turn adds cites nodes the previous answer already stood on. The
    // engine evidence stays (identical by construction — same birth, same instant, same frozen engines).
    //
    // V4E §5 — FAIL CLOSED. If extension throws, the RESTORED graph stays authoritative with a controlled
    // refinement-failure headline; the freshly built primary verdict is discarded on this path either way.
    // V4D caught the exception and kept the fresh graph — "fail-open" — which silently recast an ordinary
    // continuation ("돈은?", "왜?", "결혼하면?") as a brand-new reading: the exact production failure §19
    // existed to remove, reintroduced through the error path. The original graph and its instant T1 are
    // preserved in BOTH outcomes; only REEVALUATE_NOW ever moves the clock.
    const restored = continuation === 'REFINE_EXISTING' ? previousMeta?.divinationVerdict ?? null : null;
    if (restored && grounding.status === 'available') {
      try {
        grounding = {
          ...grounding,
          divinationVerdict: extendGraph(
            restored,
            resolveJudgmentDomain(question),
            resolveQuestionIntent(question),
            classifyTimingQuestion(question),
          ),
        };
        graphExtended = true;
      } catch {
        grounding = {
          ...grounding,
          divinationVerdict: refinementFailure(restored, resolveJudgmentDomain(question)),
        };
        graphExtended = false;
      }
    }
    const priorAxisContext = priorAxisContextFor(previousMeta, grounding, continuation);
    if (priorAxisContext.length > 0 && grounding.status === 'available') {
      grounding = { ...grounding, priorAxisContext };
    }
  }
  // §18 — a "그럼 내년은?" follow-up inherits the prior topic: the bare question classifies as 전반 on its own,
  // so the NEW decision must persist the CARRIED domain. Only for NEXT_YEAR, only a real prior domain.
  const carriedDomain: ConsultationDomain | null =
    followUpIntent === 'NEXT_YEAR' && previousDecision?.decisionMeta?.domain && previousDecision.decisionMeta.domain !== '전반'
      ? previousDecision.decisionMeta.domain
      : null;
  // §10/§14 — DOMAIN-first routing (presentation only, no new scoring): answer the question's life-domain
  // first and never open with unrelated personality analysis. Carries the prior topic on a NEXT_YEAR
  // follow-up so "그럼 내년은?" stays on the same subject (mirrors decisionMeta's carry).
  const questionDomain = carriedDomain ?? classifyConsultationDomain(question);

  // 3) SERVER-owned prompt. buildPrompt hardcodes the system layers + puts each history turn's role from
  //    the (already sanitized) message, so no client-authored system block can enter.
  const hasAuthoritativeFollowUp = followUpDirective !== null &&
    (followUpIntent === 'WHY' || followUpIntent === 'BETWEEN_CANDIDATES');
  // For authority-sensitive follow-ups, untrusted conversation prose is excluded entirely. The system
  // directive and stored server row are sufficient; forged candidate ids or a stale rationale cannot leak.
  const recentMessages = hasAuthoritativeFollowUp ? [] : sanitizeConversation(request.conversationContext);
  const safeConversationSummary = hasAuthoritativeFollowUp ? null : request.conversationSummary ?? null;
  const mode = classifyConsultationMode(question, recentMessages.length > 0);
  // SERVER-owned Decision Engine (Answer-Seeking V1.4): compute the deterministic answer plan from the
  // question + the grounding's evidence inventory, and hand the LLM a directive it verbalizes — so the
  // server (not the model) decides the support level, assertiveness, and comparison/ranking/claim
  // permissions. Reads only deterministic anchors; never authorizes an ungrounded claim.
  let effectiveGrounding = grounding;
  let plan = deriveAnswerPlan(question, effectiveGrounding);
  // AUDIT-DRIVEN REMEDIATION V1 §1 — the Content Plan computed for whichever buildMessages() call actually
  // succeeds (initial or the single regen) is captured here so its VerifiedEvidenceCatalog can be
  // server-materialized into the final "전문근거" section AFTER the LLM call, not just used transiently for
  // the prompt directive. Re-derived fresh on every call (never stale) since it closes over `effectiveGrounding`.
  // An object holder (not a bare `let`) so TS does not over-narrow the closure-mutated value to `null` at
  // the later read site.
  const contentPlanHolder: { current: ConsultationContentPlan | null } = { current: null };
  // One message builder reused for the first attempt AND the single constrained regeneration (§9); the
  // follow-up directive (when present) rides the exact same server-authored prompt.
  const buildMessages = (extraDirective?: string) => {
    // DIVINATION_ENGINE_V1 §16 — the cross-discipline 점사 verdict is a BINDING directive: the model may
    // explain/organize/simplify it, but may not reverse or dilute it. Placed after the answer plan so it is
    // the most specific instruction; absent when no discipline could speak (behavior then unchanged).
    const verdict =
      effectiveGrounding.status === 'available' ? effectiveGrounding.divinationVerdict ?? null : null;
    // CONSULTATION_EXPRESSION_ARCHITECTURE_V1 — the evidence directive rides the SAME verdict, appended last
    // so it is the most specific, final shaping instruction (mirrors how the plan/verdict directives already
    // layer). Replaces the old dump-every-evidence-line directive with a deterministic Content Plan: a
    // bounded, question-relevant evidence selection + domain facets to prioritize. The plan only selects
    // from `verdict`'s own evidence pools — it cannot add a fact or change the verdict itself.
    const contentPlan = verdict ? buildConsultationContentPlan(verdict) : null;
    contentPlanHolder.current = contentPlan;
    const planDirective = verdict && contentPlan
      ? [renderAnswerPlanDirective(plan, questionDomain), renderVerdictDirective(verdict), renderContentPlanDirective(contentPlan)]
          .filter(Boolean)
          .join('\n')
      : renderAnswerPlanDirective(plan, questionDomain);
    const base = followUpDirective ? `${planDirective}\n${followUpDirective}` : planDirective;
    return buildPrompt({
      selectedContext,
      conversationSummary: safeConversationSummary,
      recentMessages,
      currentUserMessage: question,
      mode,
      grounding: effectiveGrounding,
      answerPlanDirective: extraDirective ? `${base}\n${extraDirective}` : base,
    });
  };

  let messages;
  try {
    messages = buildMessages();
  } catch {
    effectiveGrounding = GROUNDING_UNAVAILABLE;
    plan = deriveAnswerPlan(question, effectiveGrounding);
    messages = buildMessages();
  }

  // 4) The single outbound trust exit (first attempt).
  let raw: string;
  try {
    raw = await deps.callLLM(messages);
  } catch {
    return { ok: false, reason: 'LLM_FAILED' };
  }
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    return { ok: false, reason: 'LLM_FAILED' };
  }

  // 5) SERVER-authoritative output validation (§16) + certainty/mitigation guard (Sprint A §8-§10). On a
  //    guarantee/event-certainty (or, once the kernel activates it, missing-mitigation) violation, exactly
  //    ONE constrained regeneration is allowed; a second violation → SEMANTIC_REJECTED (safe fallback).
  //    SEMANTIC_REJECTED raw text is never returned.
  // DOMAIN_TEMPORAL_WINNER_GUARD — a DOMAIN (non-temporal) comparison/ranking MAY use softer recommend/lean
  // language when the ALREADY-COMPUTED Cross verdict independently found a real direction for this exact
  // question (never inferred from the LLM's own prose, never a new fortune calculation). TEMPORAL
  // comparisons (plan.comparisonKind === 'TEMPORAL') and questions with no Cross verdict at all
  // (UNRESOLVED-equivalent) keep the full, unconditionally strict behavior — fail-closed default.
  //
  // FINAL_PROSE_DELIVERY_REPAIR_V1 §7-10 — a "verdict fidelity" mechanism (widening the guard to also forbid
  // decisive HEADLINE language whenever the verdict itself was INSUFFICIENT_DATA/INSUFFICIENT_EVIDENCE,
  // regardless of comparison intent, via a `verdictDeclinedToDecide` opt) was implemented, unit-tested, and
  // then MEASURED via the real 100-case rerun this same batch — and REVERTED after the data showed it
  // net-harmful: SEMANTIC_REJECTED fallback cases jumped from ~4-5 to 11 of 100 (nearly all non-comparison
  // questions, e.g. "내가 대표 자리에 어울리는 사람일까?", "공무원 시험을 준비해도 될까?"), because the
  // single-retry regeneration (CERTAINTY_REGEN_DIRECTIVE is framed around candidate comparisons) does not
  // reliably produce a properly-hedged headline within one attempt for a non-comparison "verdict declined"
  // question — a case that would have shipped with a mildly overconfident but substantive answer instead
  // hard-fails to the canned message, a worse outcome for the metric. The underlying verdict-fidelity gap
  // (CAREER-11/TIMING-02) is real and still open — see the root-cause report — but this specific mechanism
  // is not the fix; left at the pre-batch, verified-safe behavior (domainComparisonAllowed only, unchanged
  // since the Domain/Temporal Winner Guard batch).
  const verdictForGuard = effectiveGrounding.status === 'available' ? effectiveGrounding.divinationVerdict ?? null : null;
  const domainComparisonAllowed = plan.comparisonKind === 'DOMAIN' && verdictForGuard !== null && verdictForGuard.direction !== NO_SIGNAL;
  const guard = await classifyWithGuards({
    raw,
    grounding: effectiveGrounding,
    requireMitigation: followUpIntent === 'WHY' ? false : plan.requireMitigation,
    forbidWinner: plan.intents.includes('COMPARISON') || plan.intents.includes('RANKING'),
    domainComparisonAllowed,
    forbidChecklistTone: true, // §13 — behavioral direction, never a productivity/service checklist
    polarity: followUpIntent === 'WHY' ? previousDecision?.polarity : plan.polarity,
    regenerate: async () => {
      try {
        return await deps.callLLM(buildMessages(CERTAINTY_REGEN_DIRECTIVE));
      } catch {
        return null;
      }
    },
  });
  const outcome = guard.outcome;
  // Both downstream derivations (structuredResult, text) read from this SAME clamped value, so the
  // delivered card and the plain-text mirror never disagree.
  const narrativeIntent: NarrativeIntent = verdictForGuard
    ? narrativeIntentOf(verdictForGuard.questionIntent, plan.comparisonContext.isComparison)
    : 'DECISION';
  const clampedResult = applyVerdictAuthorityClamp(outcome, verdictForGuard, narrativeIntent);
  // GROUNDED CONSULTATION NARRATIVE V2 — the whole answer body (not just 전문근거) is now bound to the
  // authoritative claim catalog. The plan is built from the SAME content plan the accepted answer was
  // composed against, so the fact boundary is never stale relative to what the model was shown.
  const groundedPlan = verdictForGuard && contentPlanHolder.current
    ? buildGroundedNarrativePlan(verdictForGuard, contentPlanHolder.current, narrativeIntent)
    : null;
  // §11/§12 — a technical/temporal fact the grounded material never supplied is stripped from list-shaped
  // fields; in the CORE prose it cannot be excised, so the user receives the deterministic composition of
  // the same grounded claims rather than fabricated prose. ONE pass, never a regeneration loop, and never a
  // billing change: this is presentation only.
  const gated = clampedResult && groundedPlan ? gateAgainstGroundedNarrative(clampedResult, groundedPlan) : null;
  // DELIVERY QUALITY V3 §11 — THE GENERALIZABLE CONTRACT DEFECT behind the recurring CAREER-11 hard fail.
  // When the LLM's own output is discarded (SEMANTIC_REJECTED, or a STRUCTURAL_FALLBACK whose salvaged prose
  // would itself smuggle an ungrounded technical fact), the pipeline still returned the canned retry message
  // — a paid, zero-value answer — even though the SERVER already holds a complete, fully grounded answer in
  // `groundedPlan`. The rejection is not weakened in any way: every byte of the model's prose is still
  // thrown away, no regeneration is attempted, and the delivered text is the deterministic composition of
  // authoritative claims only. This is not a CAREER-11 special case and does not look at the question: it
  // applies to every rejected answer for which a grounded plan exists. The canned message survives only for
  // the genuinely answer-less case (no verdict ⇒ no plan), and safety hard-stops return long before here.
  const rejectedButGrounded = clampedResult === null
    && groundedPlan !== null
    && (outcome.kind === 'SEMANTIC_REJECTED'
      || (outcome.kind === 'STRUCTURAL_FALLBACK' && untraceableFacts(outcome.text, groundedPlan).length > 0));
  const groundedFallbackUsed = gated?.fatal === true || rejectedButGrounded;
  // The composition is run back through the SAME verdict-authority clamp the accepted path uses, so a
  // declined verdict speaks in its declined, question-shaped headline on both paths rather than in the raw
  // `primaryConclusion` — one headline contract, one place that decides it.
  const groundedFallbackResult = (): ParsedStructuredConsultation => applyVerdictAuthorityClamp(
    { kind: 'ACCEPTED', result: composeGroundedFallback(groundedPlan!) }, verdictForGuard, narrativeIntent,
  )!;
  const acceptedResult = gated
    ? (gated.fatal ? groundedFallbackResult() : gated.result)
    : rejectedButGrounded
      ? groundedFallbackResult()
      : clampedResult;
  const groundedViolations: GroundedViolationCategory[] = gated?.fatal
    ? classifyGroundedViolations(gated.violations)
    : rejectedButGrounded ? ['LLM_OUTPUT_REJECTED'] : [];
  // SERVER-owned polarity + decision/audit meta are INJECTED into the structured result from the plan
  // (Sprint C §8 / Sprint D §D1) — the LLM verbalizes the conclusion but never decides these machine values.
  // §22 — the SAME instant the verdict was evaluated at. See `evaluationInstant` above.
  const resolvedTemporalContext = buildResolvedTemporalContext(question, evaluationInstant, effectiveGrounding);
  // §23 — GRAPH REVISION. Recorded so a later turn (and an audit) can see that this graph is the previous one
  // extended, or a deliberate restart, rather than an unrelated reading that happened to land in the same
  // conversation. Purely provenance: nothing downstream branches on it.
  const graphRevision: ConsultationDecisionMeta['graphRevision'] = storedInstant === null
    ? undefined
    : continuation === 'REFINE_EXISTING' && graphExtended
      ? {
        schemaVersion: 'graph-revision@1.0.0' as const,
        kind: 'EXTENDED' as const,
        previousEvaluatedAtEpochSeconds: storedInstant,
        evaluationInstantEpochSeconds: evaluationInstant,
        axis: resolveJudgmentDomain(question),
      }
      : continuation === 'REEVALUATE_NOW'
        ? {
          schemaVersion: 'graph-revision@1.0.0' as const,
          kind: 'REEVALUATED' as const,
          previousEvaluatedAtEpochSeconds: storedInstant,
          evaluationInstantEpochSeconds: deps.nowEpochSeconds,
          axis: resolveJudgmentDomain(question),
        }
        : undefined;
  const isAuthoritativeWhy = followUpIntent === 'WHY' && followUpDirective !== null && previousMeta !== null;
  // G6 PATCH 2 §7 — DURABLE ACROSS THE LIFECYCLE. Set on THIS turn's own persisted row only when history was
  // malformed/unloadable AND this turn was itself trying to depend on it (a REFINE_EXISTING continuation, or
  // an authoritative-shaped WHY) — never on a REEVALUATE_NOW turn, whose fresh graph is genuinely trustworthy
  // and must not be poisoned, and never on a genuinely new question, which does not depend on the broken
  // history at all. `continuationIfHealthy` (not `continuation`) is used for the same reason the decline
  // branch above does: it answers "would this have continued IF history were healthy", independent of
  // whether the load actually succeeded.
  const priorHistoryUnavailable = priorHistoryProblem !== null
    && (continuationIfHealthy === 'REFINE_EXISTING' || followUpIntent === 'WHY');
  const decisionMeta: ConsultationDecisionMeta = isAuthoritativeWhy
    ? previousMeta!
    : buildConsultationDecisionMeta(
      question, plan, effectiveGrounding, resolvedTemporalContext, deps.modelId ?? null, carriedDomain,
      graphRevision, priorHistoryUnavailable,
    );
  const conclusionPolarity = isAuthoritativeWhy ? previousDecision?.polarity : plan.polarity;
  // AUDIT-DRIVEN REMEDIATION V1 §1/§2 — the ACTUAL "전문근거" technical evidence, server-materialized from
  // the VerifiedEvidenceCatalog with no LLM step. `lastContentPlan` reflects whichever buildMessages() call
  // actually produced the accepted answer (initial or the single regen), so this is never stale relative to
  // what the model was shown.
  // GROUNDED_NARRATIVE_V2 §8/§9 — the server-owned cross-synthesis ("왜 이렇게 보나요") and temporal flow
  // sections are materialized from the SAME claim catalog and shown ahead of the citations, so every
  // factual block in the answer body is either server-rendered here or LLM language that passed the
  // grounded gate above.
  const authoritativeSections = [
    // The temporal block is skipped when the accepted answer's own (already grounded-gated) futureFlow
    // survived — the presentation VM renders that under the same "앞으로의 흐름" heading, and one flow
    // section is the product, not two.
    ...(groundedPlan
      ? renderGroundedSections(groundedPlan).filter(
        (s) => !(s.title === '앞으로의 흐름' && !!acceptedResult?.futureFlow),
      )
      : []),
    ...(contentPlanHolder.current && contentPlanHolder.current.selectedEvidence.length > 0
      ? renderVerifiedEvidenceSection(contentPlanHolder.current.selectedEvidence)
      : []),
  ];
  const verifiedEvidence = authoritativeSections.length > 0 ? authoritativeSections : undefined;
  const structuredResult = acceptedResult
    ? {
        ...buildStructuredConsultationResult(acceptedResult, effectiveGrounding),
        ...(conclusionPolarity ? { conclusionPolarity } : {}),
        ...(verifiedEvidence ? { verifiedEvidence } : {}),
        decisionMeta,
      }
    : undefined;
  const text = acceptedResult
    ? composeConsultationText(acceptedResult)
    : outcome.kind === 'STRUCTURAL_FALLBACK'
      ? outcome.text
      : SEMANTIC_REJECTION_MESSAGE;

  // Safe diagnostics (no content): how the model output was classified and — when NOT rendered as a card
  // — the exact reason. Surfaced to the Edge for [chat.diag]; NOT returned to the client.
  const diagnostics: ServerConsultationDiagnostics = {
    outputClassification: outcome.kind,
    ...(guard.regenerated ? { regenerated: true } : {}),
    ...(groundedFallbackUsed ? { groundedFallback: true } : {}),
    ...(groundedViolations.length > 0 ? { groundedViolations } : {}),
    ...(safetyRoute !== 'NORMAL' ? { safetyRoute } : {}),
    ...(followUpIntent !== 'NONE' ? { followUp: followUpIntent } : {}),
    ...(followUpVersionMismatch ? { versionMismatch: true } : {}),
    ...(outcome.kind === 'ACCEPTED'
      ? {}
      : {
          rejectionReason: guard.guardRejected
            ? 'GUARD_CERTAINTY_MITIGATION'
            : firstStructuredRejectionReason(raw, effectiveGrounding),
        }),
  };

  return {
    ok: true,
    text,
    ...(structuredResult ? { structuredResult } : {}),
    groundingMeta: metaFrom(effectiveGrounding, mode),
    diagnostics,
    resolvedTemporalContext,
  };
}
