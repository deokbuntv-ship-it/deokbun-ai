import type { ConsultationDraft } from '@/features/consultation';
import type { ChatMessage } from './chat';

export type LLMMessageRole = 'system' | 'user' | 'assistant';

export type LLMMessage = {
  role: LLMMessageRole;
  content: string;
};

export type SelectedConsultationContext = {
  subjectDisplayName: string;
  gender: string;
  birthDate: string;
  birthTimeSummary: string;
  birthPlace: string;
};

export type PromptBuildInput = {
  selectedContext: SelectedConsultationContext;
  conversationSummary: string | null;
  recentMessages: ChatMessage[];
  currentUserMessage: string;
};

export type LLMRequest = {
  model: string;
  messages: LLMMessage[];
  maxOutputTokens: number;
  temperature: number;
};

export type LLMResponse = {
  text: string;
};

export type ChatServiceInput = {
  userMessage: string;
  draft: ConsultationDraft;
  messages: ChatMessage[];
  conversationSummary: string | null;
};

export type ChatServiceResult =
  | {
      success: true;
      responseText: string;
    }
  | {
      success: false;
      errorCode: 'NOT_CONFIGURED' | 'INVALID_INPUT' | 'REQUEST_FAILED';
    };
