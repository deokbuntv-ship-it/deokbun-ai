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
export { supabaseEdgeConsultationAdapter } from './adapters/supabaseEdgeConsultationAdapter';
export { supabaseEdgeSummaryAdapter } from './adapters/supabaseEdgeSummaryAdapter';
export type { SummaryTransport } from './adapters/supabaseEdgeSummaryAdapter';
export { chatConfig } from './config/chatConfig';
export { evaluateMessage } from './gateway/AIGateway';
export type { GatewayResult } from './gateway/AIGateway';
export { computeConversationMemory } from './memory/conversationMemory';
export { buildPrompt } from './prompts/promptBuilder';
export { buildSummaryPrompt } from './prompts/summaryPromptBuilder';
export { selectConsultationContext } from './selectors/contextSelector';
export { createChatService } from './services/chatService';
export type { AuthGuard, GroundingBuilder } from './services/chatService';
export { createServerConsultationService } from './services/createServerConsultationService';
// 끊긴 상담의 요청 번호 보관소 (2026-09-17) — 대화를 다시 열어도 서버에 저장된 답을 꺼낼 수 있게 한다.
export {
  clearPendingAnswer,
  readPendingAnswer,
  rememberPendingAnswer,
  PENDING_ANSWER_TTL_MS,
  type PendingAnswer,
} from './services/pendingAnswerStore';
export type {
  ConsultationTransport,
  ConsultationTransportResult,
} from './services/consultationTransport';
export {
  buildConsultationGrounding,
  createSajuGroundingBuilder,
  type SajuGroundingDeps,
} from './services/consultationGrounding';
export { conversationService } from './services/conversationService';
export type {
    ConversationSubjectSnapshot,
    ConversationSummaryItem,
    LoadedConversation, PersistableMessageRole
} from './services/conversationService';
export { useConversationPersistence } from './hooks/useConversationPersistence';
export {
  executeConversationBoundSend,
  assertAuthenticatedForConversation,
  isConversationAuthRequiredError,
  ConversationAuthRequiredError,
} from './services/conversationBoundSend';
export type { ConversationAuthSnapshot } from './services/conversationBoundSend';
export { createSingleFlight } from './services/singleFlight';
export type { SingleFlight } from './services/singleFlight';
export type { MessagesHydrationStatus } from './hooks/useConversationPersistence';
export { mapConsultationError } from './consultationErrors';
export type {
    ConsultationErrorCode,
    ConsultationErrorKind,
    ConsultationErrorView,
} from './consultationErrors';

