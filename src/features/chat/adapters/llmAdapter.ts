import type {
    LLMRequest,
    LLMResponse,
} from '@/features/chat/types/chatArchitecture';

export type LLMAdapter = {
  generateResponse(request: LLMRequest): Promise<LLMResponse>;
};

export const unconfiguredLLMAdapter: LLMAdapter = {
  async generateResponse() {
    throw new Error('LLM adapter is not configured.');
  },
};