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
} from '@/features/chat/prompts/structuredConsultation';
import { selectConsultationContext } from '@/features/chat/selectors/contextSelector';
import { buildConsultationGrounding } from '@/features/chat/services/consultationGrounding';
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
import { renderVerdictDirective } from '@/features/divination';
import { groundingFromStoredDecision } from './storedDecisionGrounding';
import { buildResolvedTemporalContext } from './resolvedTemporalContext';
import { DEOKBUNAI_SAJU_RULE_SET_VERSION } from '@/features/interpretation';
import {
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
  const followUpIntent = classifyFollowUpIntent(question);
  let followUpDirective: string | null = null;
  let followUpVersionMismatch = false;
  let previousDecision: PreviousDecision | null = null;
  let previousMeta: ConsultationDecisionMeta | null = null;
  if (followUpIntent !== 'NONE' && deps.loadPreviousDecision) {
    try {
      previousMeta = await deps.loadPreviousDecision();
    } catch {
      previousMeta = null;
    }
    previousDecision = previousDecisionFromMeta(previousMeta);
    // Compare to the current frozen ruleset constant without calculating current decision B.
    const action = resolveFollowUpAction(followUpIntent, previousDecision, {
      engineVersion: DEOKBUNAI_SAJU_RULE_SET_VERSION,
    });
    if (action.kind === 'EXPLAIN_PREVIOUS') followUpVersionMismatch = action.versionMismatch;
    followUpDirective = renderFollowUpDirective(action, previousDecision);
  }

  // 2b) SERVER-owned grounding. WHY is a strict special case: reconstruct from stored A or remain
  //     unavailable. Every other turn uses the current server receipt time and deterministic engines.
  let grounding: ConsultationGrounding = GROUNDING_UNAVAILABLE;
  if (followUpIntent === 'WHY') {
    grounding = toSafeGrounding(groundingFromStoredDecision(previousMeta) ?? GROUNDING_UNAVAILABLE);
    if (!followUpDirective) grounding = GROUNDING_UNAVAILABLE;
  } else {
    try {
      grounding = toSafeGrounding(
        await buildConsultationGrounding(
          draft,
          {
            digestProvider: deps.digestProvider,
            historicalTimezoneResolver: deps.historicalTimezoneResolver,
            nowEpochSeconds: deps.nowEpochSeconds,
          },
          question,
        ),
      );
    } catch {
      grounding = GROUNDING_UNAVAILABLE;
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
  // One message builder reused for the first attempt AND the single constrained regeneration (§9); the
  // follow-up directive (when present) rides the exact same server-authored prompt.
  const buildMessages = (extraDirective?: string) => {
    // DIVINATION_ENGINE_V1 §16 — the cross-discipline 점사 verdict is a BINDING directive: the model may
    // explain/organize/simplify it, but may not reverse or dilute it. Placed after the answer plan so it is
    // the most specific instruction; absent when no discipline could speak (behavior then unchanged).
    const verdict =
      effectiveGrounding.status === 'available' ? effectiveGrounding.divinationVerdict ?? null : null;
    const planDirective = verdict
      ? `${renderAnswerPlanDirective(plan, questionDomain)}\n${renderVerdictDirective(verdict)}`
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
  const guard = await classifyWithGuards({
    raw,
    grounding: effectiveGrounding,
    requireMitigation: followUpIntent === 'WHY' ? false : plan.requireMitigation,
    forbidWinner: plan.intents.includes('COMPARISON') || plan.intents.includes('RANKING'),
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
  // SERVER-owned polarity + decision/audit meta are INJECTED into the structured result from the plan
  // (Sprint C §8 / Sprint D §D1) — the LLM verbalizes the conclusion but never decides these machine values.
  const resolvedTemporalContext = buildResolvedTemporalContext(question, deps.nowEpochSeconds, effectiveGrounding);
  const isAuthoritativeWhy = followUpIntent === 'WHY' && followUpDirective !== null && previousMeta !== null;
  const decisionMeta: ConsultationDecisionMeta = isAuthoritativeWhy
    ? previousMeta!
    : buildConsultationDecisionMeta(question, plan, effectiveGrounding, resolvedTemporalContext, deps.modelId ?? null, carriedDomain);
  const conclusionPolarity = isAuthoritativeWhy ? previousDecision?.polarity : plan.polarity;
  const structuredResult =
    outcome.kind === 'ACCEPTED'
      ? {
          ...buildStructuredConsultationResult(outcome.result, effectiveGrounding),
          ...(conclusionPolarity ? { conclusionPolarity } : {}),
          decisionMeta,
        }
      : undefined;
  const text =
    outcome.kind === 'ACCEPTED'
      ? composeConsultationText(outcome.result)
      : outcome.kind === 'STRUCTURAL_FALLBACK'
        ? outcome.text
        : SEMANTIC_REJECTION_MESSAGE;

  // Safe diagnostics (no content): how the model output was classified and — when NOT rendered as a card
  // — the exact reason. Surfaced to the Edge for [chat.diag]; NOT returned to the client.
  const diagnostics: ServerConsultationDiagnostics = {
    outputClassification: outcome.kind,
    ...(guard.regenerated ? { regenerated: true } : {}),
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
