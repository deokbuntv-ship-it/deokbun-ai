export { ChatBubble } from './components/ChatBubble';
export { ChatInput } from './components/ChatInput';

export type {
    ChatMessage,
    ChatServiceInput,
    ChatServiceResult,
    LLMMessage,
    LLMMessageRole,
    LLMRequest,
    LLMResponse,
    PromptBuildInput,
    SelectedConsultationContext
} from './types';

export { unconfiguredLLMAdapter } from './adapters/llmAdapter';
export type { LLMAdapter } from './adapters/llmAdapter';
export { chatConfig } from './config/chatConfig';
export { evaluateMessage } from './gateway/AIGateway';
export type { GatewayResult } from './gateway/AIGateway';
export { buildPrompt } from './prompts/promptBuilder';
export { selectConsultationContext } from './selectors/contextSelector';
export { createChatService } from './services/chatService';

