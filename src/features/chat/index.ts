export { ChatBubble } from './components/ChatBubble';
export { ChatInput } from './components/ChatInput';

export type {
    ChatMessage,
    ChatServiceInput,
    ChatServiceResult,
    ConversationMemoryResult,
    ConversationMemoryState,
    LLMMessage,
    LLMMessageRole,
    LLMRequest,
    LLMResponse,
    PromptBuildInput,
    SelectedConsultationContext
} from './types';

export { unconfiguredLLMAdapter } from './adapters/llmAdapter';
export type { LLMAdapter } from './adapters/llmAdapter';
export { supabaseEdgeLLMAdapter } from './adapters/supabaseEdgeLLMAdapter';
export { chatConfig } from './config/chatConfig';
export { evaluateMessage } from './gateway/AIGateway';
export type { GatewayResult } from './gateway/AIGateway';
export { computeConversationMemory } from './memory/conversationMemory';
export { buildPrompt } from './prompts/promptBuilder';
export { selectConsultationContext } from './selectors/contextSelector';
export { createChatService } from './services/chatService';
export type { AuthGuard } from './services/chatService';

