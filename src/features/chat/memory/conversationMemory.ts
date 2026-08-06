import { chatConfig } from '@/features/chat/config/chatConfig';
import type { ChatMessage } from '@/features/chat/types/chat';
import type {
    ConversationMemoryResult,
    ConversationMemoryState,
} from '@/features/chat/types/chatArchitecture';

export function computeConversationMemory(
  messages: ChatMessage[],
  memoryState: ConversationMemoryState,
): ConversationMemoryResult {
  const existingSummary = memoryState.summary;

  let unsummarizedMessages: ChatMessage[];

  if (memoryState.lastSummarizedMessageId === null) {
    unsummarizedMessages = messages;
  } else {
    const checkpointIndex = messages.findIndex(
      (message) => message.id === memoryState.lastSummarizedMessageId,
    );

    if (checkpointIndex === -1) {
      return {
        recentMessages: messages.slice(-chatConfig.maxRecentMessages),
        messagesToSummarize: [],
        existingSummary,
        shouldUpdateSummary: false,
      };
    }

    unsummarizedMessages = messages.slice(checkpointIndex + 1);
  }

  const recentMessages = unsummarizedMessages.slice(
    -chatConfig.maxRecentMessages,
  );
  const messagesToSummarize = unsummarizedMessages.slice(
    0,
    Math.max(0, unsummarizedMessages.length - chatConfig.maxRecentMessages),
  );

  const shouldUpdateSummary =
    messagesToSummarize.length >= chatConfig.summaryThreshold;

  return {
    recentMessages,
    messagesToSummarize,
    existingSummary,
    shouldUpdateSummary,
  };
}
