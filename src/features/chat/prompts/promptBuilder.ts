import type {
    LLMMessage,
    PromptBuildInput,
    SelectedConsultationContext,
} from '@/features/chat/types/chatArchitecture';
import { classifyConsultationMode } from './consultationMode';
import { buildResponsePolicy, SYSTEM_CONSTITUTION } from './consultationPolicy';
import { renderGroundingContext, toSafeGrounding } from './grounding';
import { STRUCTURED_OUTPUT_INSTRUCTION } from './structuredConsultation';

// Consultation prompt composition (directive §8). Layers, in order:
//   m[0] system: SYSTEM_CONSTITUTION      — static, mode-independent hard rules (cacheable)
//   m[1] system: context                  — subject facts + grounding + mode response policy
//   m[2] system: conversationSummary      — ONLY when present (raw, unchanged)
//   …recent turns (verbatim) → current user message (trimmed, last)
//
// The 2-system-message shape + raw-summary + user-last order is preserved from the prior
// builder, so existing UI/adapter and role-sequence contracts keep working; what changed
// is that the system instruction is now a real consultation constitution, and a typed
// grounding block enforces "interpret, don't calculate" (§3) instead of a 1-line stub.

// Strip characters that could forge prompt STRUCTURE out of a user-controlled free-text
// profile field before it enters a SYSTEM message (§80 — second-order prompt injection).
// A name/place never legitimately contains line breaks or the 【】/[] markers this prompt
// uses for section headers, so removing them cannot lose real data but blocks a hostile
// profile name from forging a fake 【계산 근거】 block or a "규칙 무시" system line.
function sanitizeContextValue(raw: string, maxLen = 80): string {
  const collapsed = raw
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[【】〔〕［］[\]]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return collapsed.length > maxLen ? `${collapsed.slice(0, maxLen)}…` : collapsed;
}

function buildSubjectBlock(ctx: SelectedConsultationContext, groundingAvailable: boolean): string {
  const calendarLabel = ctx.inputCalendar === 'LUNAR' ? '음력' : '양력';
  const lines = [
    '[상담 대상]',
    `대상: ${sanitizeContextValue(ctx.subjectDisplayName)}`,
    `성별: ${ctx.gender}`,
  ];
  if (groundingAvailable) {
    // Codex pipeline FIX #4: with a deterministic 명식 present, the CANONICAL identity for reasoning
    // is the confirmed 사주 in 【계산 근거】 — identical for the same birth instant whether entered as
    // 양력 or 음력. The raw input date/calendar is kept ONLY as NON-reasoning audit metadata (clearly
    // marked), so a Solar vs Lunar entry of the SAME person can never split the LLM reasoning payload.
    lines.push(
      '생년월일: 아래 【계산 근거】의 확정 명식(년/월/일/시 간지)을 기준으로 하며, 같은 출생 순간이면 양력·음력 입력과 무관하게 동일합니다.',
      `출생시간: ${ctx.birthTimeSummary}`,
      `출생지: ${sanitizeContextValue(ctx.birthPlace)}`,
      `※ 입력 원본(참고용, 비추론): ${ctx.birthDate} (${calendarLabel})`,
    );
  } else {
    // No deterministic 명식 → the raw labeled date is all we have; the model must not fabricate a chart.
    lines.push(
      `생년월일: ${ctx.birthDate} (${calendarLabel} 입력)`,
      `출생시간: ${ctx.birthTimeSummary}`,
      `출생지: ${sanitizeContextValue(ctx.birthPlace)}`,
    );
  }
  // Birth-time-unknown / approximate policy (§23/§24): make the limit explicit so the
  // model does not fabricate a 시주 or treat an approximate time as exact.
  if (ctx.birthTimeAccuracy === 'unknown') {
    lines.push(
      '※ 출생시간을 알 수 없습니다. 시(時)에 의존하는 해석은 제한되며, 시주를 임의로 만들지 마십시오.',
    );
  } else if (ctx.birthTimeAccuracy === 'approximate') {
    lines.push('※ 출생시간이 대략적입니다. 정확한 시각처럼 단정하지 마십시오.');
  }
  return lines.join('\n');
}

function buildContextMessage(input: PromptBuildInput): string {
  const hasHistory =
    input.recentMessages.length > 0 ||
    (input.conversationSummary !== null && input.conversationSummary.trim().length > 0);
  const mode = input.mode ?? classifyConsultationMode(input.currentUserMessage, hasHistory);
  // Codex FIX C §5: sanitize at the buildPrompt boundary so a DIRECT caller (bypassing chatService's
  // guard) can never hand malformed grounding to the renderer — it degrades to fail-closed UNAVAILABLE.
  const grounding = toSafeGrounding(input.grounding ?? null);

  return [
    buildSubjectBlock(input.selectedContext, grounding.status === 'available'),
    '',
    renderGroundingContext(grounding),
    '',
    buildResponsePolicy(mode, grounding.status === 'available'),
    '',
    STRUCTURED_OUTPUT_INSTRUCTION,
  ].join('\n');
}

export function buildPrompt(input: PromptBuildInput): LLMMessage[] {
  const messages: LLMMessage[] = [];

  messages.push({ role: 'system', content: SYSTEM_CONSTITUTION });

  messages.push({ role: 'system', content: buildContextMessage(input) });

  if (input.conversationSummary !== null && input.conversationSummary.trim().length > 0) {
    messages.push({ role: 'system', content: input.conversationSummary });
  }

  for (const message of input.recentMessages) {
    messages.push({
      role: message.role,
      content: message.text,
    });
  }

  const trimmedUserMessage = input.currentUserMessage.trim();

  messages.push({ role: 'user', content: trimmedUserMessage });

  return messages;
}
