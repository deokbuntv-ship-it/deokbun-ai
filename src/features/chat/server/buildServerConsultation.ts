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
} from './consultationSafety';
import { buildResolvedTemporalContext } from './resolvedTemporalContext';
import type { ChatMessage } from '@/features/chat/types/chat';
import type { BirthInfoDraft, ConsultationDraft } from '@/features/consultation';
import type {
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

  // 0) Pre-LLM SAFETY ROUTER (Sprint A §2-§7). A hard-stop category (self-harm / death-lifespan / medical)
  //    must never reach fortune interpretation: return a controlled, honest response with NO grounding and
  //    NO LLM call. Runs before birth resolution so even a missing/invalid birth still yields the safe
  //    response. FINANCIAL_GUARANTEE is NOT a hard stop (handled by the plan + the output certainty guard).
  const safetyRoute = classifyConsultationSafetyRoute(question);
  if (isHardStopRoute(safetyRoute)) {
    return {
      ok: true,
      text: safeResponseForRoute(safetyRoute) ?? SEMANTIC_REJECTION_MESSAGE,
      groundingMeta: metaFrom(GROUNDING_UNAVAILABLE, 'safety'),
      diagnostics: { outputClassification: 'SAFETY_ROUTED', safetyRoute },
      resolvedTemporalContext: buildResolvedTemporalContext(question, deps.nowEpochSeconds, GROUNDING_UNAVAILABLE),
    };
  }

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

  // 2) SERVER-owned grounding. nowEpochSeconds is the server receipt time → the Qimen question time and
  //    the current-year 세운/월운 are server-owned (§10). Fail-closed: any throw → UNAVAILABLE.
  let grounding: ConsultationGrounding = GROUNDING_UNAVAILABLE;
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

  // 3) SERVER-owned prompt. buildPrompt hardcodes the system layers + puts each history turn's role from
  //    the (already sanitized) message, so no client-authored system block can enter.
  const recentMessages = sanitizeConversation(request.conversationContext);
  const mode = classifyConsultationMode(question, recentMessages.length > 0);
  // SERVER-owned Decision Engine (Answer-Seeking V1.4): compute the deterministic answer plan from the
  // question + the grounding's evidence inventory, and hand the LLM a directive it verbalizes — so the
  // server (not the model) decides the support level, assertiveness, and comparison/ranking/claim
  // permissions. Reads only deterministic anchors; never authorizes an ungrounded claim.
  let effectiveGrounding = grounding;
  let plan = deriveAnswerPlan(question, effectiveGrounding);
  // One message builder reused for the first attempt AND the single constrained regeneration (§9), so the
  // strengthened directive rides the exact same server-authored prompt.
  const buildMessages = (extraDirective?: string) =>
    buildPrompt({
      selectedContext,
      conversationSummary: request.conversationSummary ?? null,
      recentMessages,
      currentUserMessage: question,
      mode,
      grounding: effectiveGrounding,
      answerPlanDirective: extraDirective
        ? `${renderAnswerPlanDirective(plan)}\n${extraDirective}`
        : renderAnswerPlanDirective(plan),
    });

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
    requireMitigation: plan.requireMitigation,
    regenerate: async () => {
      try {
        return await deps.callLLM(buildMessages(CERTAINTY_REGEN_DIRECTIVE));
      } catch {
        return null;
      }
    },
  });
  const outcome = guard.outcome;
  // SERVER-owned polarity is INJECTED into the structured result from the plan (Sprint C §8) — the LLM
  // verbalizes the conclusion but never decides this machine value.
  const structuredResult =
    outcome.kind === 'ACCEPTED'
      ? { ...buildStructuredConsultationResult(outcome.result, effectiveGrounding), ...(plan.polarity ? { conclusionPolarity: plan.polarity } : {}) }
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
    resolvedTemporalContext: buildResolvedTemporalContext(question, deps.nowEpochSeconds, effectiveGrounding),
  };
}
