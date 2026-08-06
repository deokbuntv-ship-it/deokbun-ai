import type {
    LLMMessage,
    PromptBuildInput,
} from '@/features/chat/types/chatArchitecture';

const SYSTEM_INSTRUCTION =
  'You are the consultation assistant for DeokbunAI.';

function buildContextMessage(
  selectedContext: PromptBuildInput['selectedContext'],
): string {
  return [
    `대상: ${selectedContext.subjectDisplayName}`,
    `성별: ${selectedContext.gender}`,
    `생년월일: ${selectedContext.birthDate}`,
    `출생시간: ${selectedContext.birthTimeSummary}`,
    `출생지: ${selectedContext.birthPlace}`,
  ].join('\n');
}

export function buildPrompt(input: PromptBuildInput): LLMMessage[] {
  const messages: LLMMessage[] = [];

  messages.push({ role: 'system', content: SYSTEM_INSTRUCTION });

  messages.push({
    role: 'system',
    content: buildContextMessage(input.selectedContext),
  });

  if (input.conversationSummary !== null) {
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
