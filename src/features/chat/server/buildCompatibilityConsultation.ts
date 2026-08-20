// 궁합(compatibility) server orchestrator (Compatibility V1). The SAME trust boundary + ONE LLM call as
// the solo path, but for a PAIR: it recomputes BOTH people's charts from birth INPUT, builds the
// DETERMINISTIC pairwise evidence (합충형파해·삼합/방합·십신·오행 → transparent tier), reuses the SAME
// Decision Engine (mode='compatibility'), validator, and structured-result builder. It CALCULATES no
// 역학 itself beyond invoking the frozen engine; the tier is deterministic (no LLM). The solo
// `buildServerConsultation` is untouched → zero regression risk to the proven single-subject flow.
import { CONSULTATION_PROMPT_VERSION } from '@/features/chat/prompts/consultationPromptVersion';
import { buildCompatibilityPrompt } from '@/features/chat/prompts/compatibilityPrompt';
import {
  GROUNDING_UNAVAILABLE,
  toSafeGrounding,
  type ConsultationGrounding,
} from '@/features/chat/prompts/grounding';
import {
  composeConsultationText,
  firstStructuredRejectionReason,
  SEMANTIC_REJECTION_MESSAGE,
} from '@/features/chat/prompts/structuredConsultation';
import { selectConsultationContext } from '@/features/chat/selectors/contextSelector';
import { buildConsultationGrounding } from '@/features/chat/services/consultationGrounding';
import { resolveQuestionMonths } from '@/features/chat/services/questionMonths';
import { resolveQuestionYears } from '@/features/chat/services/questionYears';
import { buildStructuredConsultationResult } from '@/features/chat/services/structuredConsultationResult';
import { buildCompatibilityEvidence } from '@/features/compatibility/engine';
import type { EngineEvidence, EngineEvidenceSection } from '@/features/analysis';
import type { BirthInfoDraft, ConsultationDraft } from '@/features/consultation';
import {
  ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER,
  executeSajuFromBirthInput,
  type SajuEngineResult,
} from '@/features/interpretation';
import { toSajuEngineInput } from '@/features/manse/services/birthInputMapper';
import {
  ANSWER_PLAN_VERSION,
  DECISION_POLICY_VERSION,
  deriveAnswerPlan,
  renderAnswerPlanDirective,
} from './answerPlan';
import { CERTAINTY_REGEN_DIRECTIVE, COMPAT_REGEN_DIRECTIVE, classifyWithGuards } from './certaintyGuard';
import { buildConsultationDecisionMeta } from './decisionMeta';
import {
  classifyConsultationSafetyRoute,
  isHardStopRoute,
  safeResponseForRoute,
} from './consultationSafety';
import { buildResolvedTemporalContext } from './resolvedTemporalContext';
import type {
  CompatibilityResultMeta,
  ServerConsultationDeps,
  ServerConsultationDiagnostics,
  ServerConsultationRequest,
  ServerConsultationResult,
  ServerGroundingMeta,
} from './serverConsultationTypes';

const MAX_CONTEXT_TURNS = 12;
const MAX_TURN_CHARS = 4000;

function sanitizeConversation(
  turns: ServerConsultationRequest['conversationContext'],
): { role: 'user' | 'assistant'; text: string }[] {
  if (!Array.isArray(turns)) return [];
  const out: { role: 'user' | 'assistant'; text: string }[] = [];
  for (const turn of turns.slice(-MAX_CONTEXT_TURNS)) {
    if (turn === null || typeof turn !== 'object') continue;
    const role = (turn as { role?: unknown }).role;
    if (role !== 'user' && role !== 'assistant') continue;
    const raw = (turn as { content?: unknown }).content;
    if (typeof raw !== 'string') continue;
    const text = raw.trim().slice(0, MAX_TURN_CHARS);
    if (text.length === 0) continue;
    out.push({ role, text });
  }
  return out;
}

function hasMinimalBirthInput(b: unknown): b is BirthInfoDraft {
  if (b === null || typeof b !== 'object') return false;
  const r = b as Record<string, unknown>;
  return (
    typeof r.birthYear === 'string' && r.birthYear.trim().length > 0 &&
    typeof r.birthMonth === 'string' && r.birthMonth.trim().length > 0 &&
    typeof r.birthDay === 'string' && r.birthDay.trim().length > 0
  );
}

// Broad timing-intent gate (§27/§76 cost guard): only a temporal question pays for the asker's full
// grounding (세운/월운 + question-time Qimen). A pure natal 궁합 question ("우리 궁합 좋아?") runs just the
// two frozen Saju charts — cheaper than a solo consultation, never 3×.
function wantsTiming(question: string): boolean {
  const q = question.trim();
  if (resolveQuestionYears(q, null).length > 0) return true;
  if (resolveQuestionMonths(q, null, null).intent !== 'NONE') return true;
  return /(올해|내년|작년|내후년|언제|시기|시점|이번\s*(달|주|해)|다음\s*(달|주|해)|요즘|지금|관계운|연애운|무렵)/.test(q);
}

async function runFrozenSaju(
  birth: BirthInfoDraft,
  deps: ServerConsultationDeps,
): Promise<SajuEngineResult | null> {
  try {
    const execution = await executeSajuFromBirthInput(toSajuEngineInput(birth), {
      digestProvider: deps.digestProvider,
      historicalTimezoneResolver: deps.historicalTimezoneResolver ?? ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER,
    });
    if (!execution.success) return null;
    return execution.engineResult;
  } catch {
    return null;
  }
}

// Pull ONLY the asker's TEMPORAL sections (세운/월운/대운/시간축) from a solo grounding, to layer onto the
// pairwise natal evidence for a temporal 궁합 question. The asker's own timeline governs 관계운 by year.
function askerTemporalSections(myungri: EngineEvidence): EngineEvidenceSection[] {
  if (myungri.availability !== 'available' || !Array.isArray(myungri.sections)) return [];
  return myungri.sections.filter((s) => /세운|월운|대운|시간축/.test(s.label));
}

function metaFrom(grounding: ConsultationGrounding): ServerGroundingMeta {
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
    mode: 'compatibility',
    questionTimeSource: 'SERVER_RECEIPT_TIME',
  };
}

/**
 * Build a full 궁합 consultation on the server (trusted). Reason codes fail closed exactly like the solo
 * path. A merely UNAVAILABLE pairwise grounding is NOT a failure — the prompt then answers within the
 * stated limits and never fabricates a pair verdict.
 */
export async function buildCompatibilityConsultation(
  request: ServerConsultationRequest,
  deps: ServerConsultationDeps,
): Promise<ServerConsultationResult> {
  const question = (request.question ?? '').trim();
  if (question.length === 0) return { ok: false, reason: 'INVALID_INPUT' };

  // 0) Pre-LLM SAFETY ROUTER (Sprint A §2-§7) — the SAME hard-stop as the solo path, applied to 궁합 too
  //    (self-harm / death-lifespan / medical questions must never reach fortune interpretation). Runs
  //    before birth resolution so it never depends on either person's birth input.
  const safetyRoute = classifyConsultationSafetyRoute(question);
  if (isHardStopRoute(safetyRoute)) {
    return {
      ok: true,
      text: safeResponseForRoute(safetyRoute) ?? SEMANTIC_REJECTION_MESSAGE,
      groundingMeta: metaFrom(GROUNDING_UNAVAILABLE),
      diagnostics: { outputClassification: 'SAFETY_ROUTED', safetyRoute },
      resolvedTemporalContext: buildResolvedTemporalContext(question, deps.nowEpochSeconds, GROUNDING_UNAVAILABLE),
    };
  }

  if (!hasMinimalBirthInput(request.birthInput)) return { ok: false, reason: 'INVALID_INPUT' };
  if (!hasMinimalBirthInput(request.partnerBirthInput)) return { ok: false, reason: 'INVALID_INPUT' };

  const selfBirth = request.birthInput;
  const targetBirth = request.partnerBirthInput;
  const selfLabel = (request.subjectLabel ?? selfBirth.displayName ?? '본인').toString();
  const targetLabel = (request.partnerLabel ?? targetBirth.displayName ?? '상대방').toString();

  const selfDraft: ConsultationDraft = {
    subject: { id: 'self', displayName: selfLabel, relationship: null },
    birthInfo: selfBirth,
  };
  const targetDraft: ConsultationDraft = {
    subject: { id: 'partner', displayName: targetLabel, relationship: request.partnerLabel ?? null },
    birthInfo: targetBirth,
  };
  const selfContext = selectConsultationContext(selfDraft);
  const targetContext = selectConsultationContext(targetDraft);
  if (selfContext === null || targetContext === null) return { ok: false, reason: 'INVALID_INPUT' };

  // 1) DETERMINISTIC pairwise evidence from BOTH frozen charts (the core: relationship, not two dumps).
  const [selfResult, targetResult] = await Promise.all([
    runFrozenSaju(selfBirth, deps),
    runFrozenSaju(targetBirth, deps),
  ]);

  let grounding: ConsultationGrounding = GROUNDING_UNAVAILABLE;
  let compatibility: CompatibilityResultMeta | undefined;

  if (selfResult && targetResult) {
    const pair = buildCompatibilityEvidence(
      { engineResult: selfResult, label: selfLabel },
      { engineResult: targetResult, label: targetLabel },
    );
    if (pair.availability === 'available') {
      let myungri: EngineEvidence = pair.evidence;

      // 2) Timing layer (temporal questions only): merge the ASKER's 세운/월운 + question-time Qimen.
      let qimen: EngineEvidence = { availability: 'not_applicable' };
      if (wantsTiming(question)) {
        try {
          const askerGrounding = await buildConsultationGrounding(selfDraft, {
            digestProvider: deps.digestProvider,
            historicalTimezoneResolver: deps.historicalTimezoneResolver,
            nowEpochSeconds: deps.nowEpochSeconds,
          }, question);
          if (askerGrounding.status === 'available') {
            const temporal = askerTemporalSections(askerGrounding.evidence.myungri);
            const askerMyungri = askerGrounding.evidence.myungri;
            myungri = {
              ...pair.evidence,
              sections: [...(pair.evidence.sections ?? []), ...temporal],
              ...(askerMyungri.timingAnchors ? { timingAnchors: askerMyungri.timingAnchors } : {}),
              hasTimingEvidence: askerMyungri.hasTimingEvidence ?? false,
            };
            qimen = askerGrounding.evidence.qimen;
          }
        } catch {
          // fail-closed: keep the natal pairwise evidence without a temporal layer.
        }
      }

      const a = pair.assessment;
      grounding = {
        status: 'available',
        evidence: { myungri, ziwei: { availability: 'engine_not_connected' }, qimen },
        // The SERVER's deterministic tier becomes the anchor the LLM must verbalize (§22).
        assessmentSummary: `${selfLabel}·${targetLabel} 종합 궁합: ${a.overallLabel} (정서 ${a.dimensions[0].signal}/갈등 ${a.dimensions[1].signal}/오행 ${a.dimensions[2].signal})${a.reducedPrecision ? ' · 한 명 이상 시주 미상으로 정밀도 제한' : ''}`,
        engineVersion: 'compatibility-engine@1.0.0',
      };
      compatibility = {
        overall: a.overall,
        overallLabel: a.overallLabel,
        dimensions: a.dimensions.map((d) => ({ key: d.key, title: d.title, signal: d.signal, verdict: d.verdict })),
        reducedPrecision: a.reducedPrecision,
        selfLabel,
        targetLabel,
        engineVersion: 'compatibility-engine@1.0.0',
        tierModelVersion: a.tierModelVersion,
      };
    }
  }

  const safeGrounding = toSafeGrounding(grounding);

  // 3) SERVER-owned Decision Engine (mode='compatibility') → directive the LLM verbalizes. One message
  //    builder reused for the first attempt AND the single constrained regeneration (§9).
  const recentMessages = sanitizeConversation(request.conversationContext);
  const plan = deriveAnswerPlan(question, safeGrounding, 'compatibility');
  const buildMessages = (extraDirective?: string) =>
    buildCompatibilityPrompt({
      self: selfContext,
      target: targetContext,
      relationship: request.partnerLabel ?? null,
      grounding: safeGrounding,
      answerPlanDirective: extraDirective
        ? `${renderAnswerPlanDirective(plan)}\n${extraDirective}`
        : renderAnswerPlanDirective(plan),
      conversationSummary: request.conversationSummary ?? null,
      recentMessages,
      currentUserMessage: question,
    });

  // 4) The single outbound trust exit (first attempt).
  let raw: string;
  try {
    raw = await deps.callLLM(buildMessages());
  } catch {
    return { ok: false, reason: 'LLM_FAILED' };
  }
  if (typeof raw !== 'string' || raw.trim().length === 0) return { ok: false, reason: 'LLM_FAILED' };

  // 5) SERVER-authoritative output validation — the SAME validator as solo — plus the certainty/mitigation
  //    guard (one constrained regeneration → safe fallback, Sprint A §8-§10).
  // 궁합 relationship-safety (§D5) is ALWAYS enforced; a poor pair tier additionally requires a constructive
  // management direction (§D6). The deterministic tier drives requireConstructive — no tier recalculation.
  const negativePairTier = compatibility?.overall === 'NEEDS_CARE' || compatibility?.overall === 'CHALLENGING';
  const guard = await classifyWithGuards({
    raw,
    grounding: safeGrounding,
    requireMitigation: plan.requireMitigation,
    forbidWinner: plan.intents.includes('COMPARISON') || plan.intents.includes('RANKING'),
    polarity: plan.polarity,
    forbidCompatibilityHarm: true,
    requireConstructive: negativePairTier,
    regenerate: async () => {
      try {
        return await deps.callLLM(buildMessages(`${CERTAINTY_REGEN_DIRECTIVE}\n${COMPAT_REGEN_DIRECTIVE}`));
      } catch {
        return null;
      }
    },
  });
  const outcome = guard.outcome;
  // Server-owned polarity + decision/audit meta injection (Sprint C §8 / Sprint D §D1). For 궁합 the solo
  // year-flow polarity is normally absent (the pair tier is the compatibility meta).
  const resolvedTemporalContext = buildResolvedTemporalContext(question, deps.nowEpochSeconds, safeGrounding);
  const decisionMeta = buildConsultationDecisionMeta(plan, safeGrounding, resolvedTemporalContext);
  const structuredResult =
    outcome.kind === 'ACCEPTED'
      ? {
          ...buildStructuredConsultationResult(outcome.result, safeGrounding),
          ...(plan.polarity ? { conclusionPolarity: plan.polarity } : {}),
          decisionMeta,
        }
      : undefined;
  const text =
    outcome.kind === 'ACCEPTED'
      ? composeConsultationText(outcome.result)
      : outcome.kind === 'STRUCTURAL_FALLBACK'
        ? outcome.text
        : SEMANTIC_REJECTION_MESSAGE;

  const diagnostics: ServerConsultationDiagnostics = {
    outputClassification: outcome.kind,
    ...(guard.regenerated ? { regenerated: true } : {}),
    ...(safetyRoute !== 'NORMAL' ? { safetyRoute } : {}),
    ...(outcome.kind === 'ACCEPTED'
      ? {}
      : {
          rejectionReason: guard.guardRejected
            ? 'GUARD_CERTAINTY_MITIGATION'
            : firstStructuredRejectionReason(raw, safeGrounding),
        }),
  };

  return {
    ok: true,
    text,
    ...(structuredResult ? { structuredResult } : {}),
    groundingMeta: metaFrom(safeGrounding),
    diagnostics,
    resolvedTemporalContext,
    ...(compatibility ? { compatibility } : {}),
  };
}
