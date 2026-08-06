import { chatConfig } from '@/features/chat/config/chatConfig';
import { selectConsultationContext } from '@/features/chat/selectors/contextSelector';
import { buildPrompt } from '@/features/chat/prompts/promptBuilder';
import type { LLMAdapter } from '@/features/chat/adapters/llmAdapter';
import type {
  ChatServiceInput,
  ChatServiceResult,
} from '@/features/chat/types/chatArchitecture';

export function createChatService(adapter: LLMAdapter) {
  async function sendMessage(
    input: ChatServiceInput,
  ): Promise<ChatServiceResult> {
    const trimmedUserMessage = input.userMessage.trim();

    if (trimmedUserMessage.length === 0) {
      return { success: false, errorCode: 'INVALID_INPUT' };
    }

    const selectedContext = selectConsultationContext(input.draft);

    if (selectedContext === null) {
      return { success: false, errorCode: 'INVALID_INPUT' };
    }

    const recentMessages = input.messages.slice(-chatConfig.maxRecentMessages);

    const promptMessages = buildPrompt({
      selectedContext,
      conversationSummary: input.conversationSummary,
      recentMessages,
      currentUserMessage: trimmedUserMessage,
    });

    try {
      const response = await adapter.generateResponse({
        model: chatConfig.defaultModel,
        messages: promptMessages,
        maxOutputTokens: chatConfig.maxOutputTokens,
        temperature: chatConfig.temperature,
      });

      return { success: true, responseText: response.text };
    } catch {
      return { success: false, errorCode: 'REQUEST_FAILED' };
    }
  }

  return { sendMessage };
}
