import type { LLMAdapter } from '@/features/chat/adapters/llmAdapter';
import { chatConfig } from '@/features/chat/config/chatConfig';
import { evaluateMessage } from '@/features/chat/gateway/AIGateway';
import { buildPrompt } from '@/features/chat/prompts/promptBuilder';
import { selectConsultationContext } from '@/features/chat/selectors/contextSelector';
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

    const gatewayResult = evaluateMessage(trimmedUserMessage);

    if (gatewayResult.type === 'INVALID_INPUT') {
      return { success: false, errorCode: 'INVALID_INPUT' };
    }

    if (gatewayResult.type === 'LOCAL_RESPONSE') {
      return { success: true, responseText: gatewayResult.text };
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
