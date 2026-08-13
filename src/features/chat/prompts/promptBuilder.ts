import type {
    LLMMessage,
    PromptBuildInput,
    SelectedConsultationContext,
} from '@/features/chat/types/chatArchitecture';
import { classifyConsultationMode } from './consultationMode';
import { buildResponsePolicy, SYSTEM_CONSTITUTION } from './consultationPolicy';
import { GROUNDING_UNAVAILABLE, renderGroundingContext } from './grounding';

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

function buildSubjectBlock(ctx: SelectedConsultationContext): string {
  const lines = [
    '[상담 대상]',
    `대상: ${sanitizeContextValue(ctx.subjectDisplayName)}`,
    `성별: ${ctx.gender}`,
    `생년월일: ${ctx.birthDate}`,
    `출생시간: ${ctx.birthTimeSummary}`,
    `출생지: ${sanitizeContextValue(ctx.birthPlace)}`,
  ];
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
  const grounding = input.grounding ?? GROUNDING_UNAVAILABLE;

  return [
    buildSubjectBlock(input.selectedContext),
    '',
    renderGroundingContext(grounding),
    '',
    buildResponsePolicy(mode, grounding.status === 'available'),
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
