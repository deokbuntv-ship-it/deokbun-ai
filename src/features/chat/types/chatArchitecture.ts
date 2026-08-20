import type { ConsultationDraft } from '@/features/consultation';
import type { ConsultationGrounding } from '@/features/chat/prompts/grounding';
import type { ConsultationMode } from '@/features/chat/prompts/consultationMode';
import type { StructuredConsultationViewModel } from '@/features/intelligence/types/consultationViewModel';
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
  // Birth-time certainty, so the prompt can honor the birth-time-unknown / approximate
  // policy (§23/§24) without fabricating a 시주. Optional for backward compatibility.
  birthTimeAccuracy?: 'exact' | 'approximate' | 'unknown';
  // Which calendar the RAW birthDate label is in (Codex FIX #5). The deterministic grounding uses
  // the canonical (立春/Jie) Four Pillars regardless; this only disambiguates the display label so
  // the LLM never guesses which calendar the raw date is.
  inputCalendar?: 'SOLAR' | 'LUNAR';
};

export type PromptBuildInput = {
  selectedContext: SelectedConsultationContext;
  conversationSummary: string | null;
  recentMessages: ChatMessage[];
  currentUserMessage: string;
  // Deterministic engine grounding (Codex integration seam, §12). Optional — defaults
  // to GROUNDING_UNAVAILABLE (fail-closed: interpret only the stated birth facts).
  grounding?: ConsultationGrounding;
  // Response-shaping mode (§14). Optional — defaults to classifying currentUserMessage.
  mode?: ConsultationMode;
  // Deterministic Decision-Engine directive (Answer-Seeking V1.4): the SERVER's computed decision (support
  // level → assertiveness, comparison/ranking permission, claim permissions) as a compact system
  // instruction the LLM verbalizes. Optional — absent → the LLM falls back to the static policy alone.
  answerPlanDirective?: string | null;
};

// Response contract seam (§33/§37). The LLM answer stays a natural-language string
// (backward-compatible with the current UI + parseStructuredAiResponse fallback); this
// metadata makes a consultation TRACEABLE (which prompt/mode/grounding produced it) for
// Consultation-Intelligence and future evaluation. `model`/`engineVersion` are filled
// when the edge/Codex supply them.
export type ConsultationResponseMetadata = {
  promptVersion: string;
  mode: ConsultationMode;
  grounded: boolean;
  model?: string | null;
  engineVersion?: string | null;
  assessmentVersion?: string | null;
};

export type ConsultationResponse = {
  answer: string;
  followUpSuggestions?: string[];
  metadata?: ConsultationResponseMetadata;
};

export type LLMRequest = {
  model: string;
  messages: LLMMessage[];
  maxOutputTokens: number;
  temperature: number;
  // Correlation id forwarded to the Edge Function for end-to-end tracing
  // (client → edge logs → usage persistence). Optional; never PII.
  requestId?: string;
};

export type LLMResponse = {
  text: string;
};

export type ConversationMemoryState = {
  summary: string | null;
  lastSummarizedMessageId: string | null;
};

export type ConversationMemoryResult = {
  recentMessages: ChatMessage[];
  messagesToSummarize: ChatMessage[];
  existingSummary: string | null;
  shouldUpdateSummary: boolean;
};

export type ChatServiceInput = {
  userMessage: string;
  draft: ConsultationDraft;
  messages: ChatMessage[];
  conversationMemory: ConversationMemoryState;
  // A retry reuses the first attempt's opaque id so the Edge can return the completed response at 0 LLM.
  requestId?: string;
};

export type ChatServiceResult =
  | {
      success: true;
      responseText: string;
      // Validated structured long-form result (sprint §14). Present when the LLM returned the
      // structured schema and it parsed; absent → the UI renders `responseText` (plain fallback).
      structuredResult?: StructuredConsultationViewModel;
      // Correlation id for tracing/logging this request (optional; additive).
      requestId?: string;
      // Prompt/mode/grounding traceability (optional; additive — the UI ignores it).
      meta?: ConsultationResponseMetadata;
    }
  | {
      success: false;
      errorCode:
        | 'NOT_CONFIGURED'
        | 'INVALID_INPUT'
        | 'REQUEST_FAILED'
        | 'AUTH_REQUIRED';
      requestId?: string;
    };
