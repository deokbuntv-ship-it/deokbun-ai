import type { ChatMessage } from '@/features/chat/types/chat';
import type { LLMMessage } from '@/features/chat/types/chatArchitecture';

// Builds the message array for a conversation-summary LLM call. This is separate
// from the chat prompt (promptBuilder.ts) and only compresses PAST messages —
// it never produces new advice. The resulting summary text (not this prompt) is
// what gets stored.
const SUMMARY_SYSTEM_INSTRUCTION =
  '너는 상담 대화를 다음 상담에 참고할 수 있도록 간결하게 요약하는 역할이다. ' +
  '사용자의 핵심 고민, 이미 다룬 내용, 중요한 맥락을 보존하되 짧게 정리한다. ' +
  '새로운 조언이나 해석을 만들지 말고 요약만 한다.';

export function buildSummaryPrompt(
  existingSummary: string | null,
  messagesToSummarize: ChatMessage[],
): LLMMessage[] {
  const messages: LLMMessage[] = [];

  messages.push({ role: 'system', content: SUMMARY_SYSTEM_INSTRUCTION });

  if (existingSummary !== null && existingSummary.trim().length > 0) {
    messages.push({ role: 'system', content: `기존 요약:\n${existingSummary}` });
  }

  for (const message of messagesToSummarize) {
    messages.push({ role: message.role, content: message.text });
  }

  messages.push({
    role: 'user',
    content: '위 대화를 다음 상담에 참고할 수 있도록 간결하게 요약해 주세요.',
  });

  return messages;
}
