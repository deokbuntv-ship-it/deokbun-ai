import { useEffect, useRef, useState } from 'react';

import { useAuth } from '@/features/auth';
import { supabaseEdgeLLMAdapter } from '@/features/chat/adapters/supabaseEdgeLLMAdapter';
import { chatConfig } from '@/features/chat/config/chatConfig';
import { computeConversationMemory } from '@/features/chat/memory/conversationMemory';
import { buildSummaryPrompt } from '@/features/chat/prompts/summaryPromptBuilder';
import {
  conversationService,
  type PersistableMessageRole,
} from '@/features/chat/services/conversationService';
import type { ChatMessage } from '@/features/chat/types/chat';
import type { ConversationMemoryState } from '@/features/chat/types/chatArchitecture';

export type MessagesHydrationStatus = 'idle' | 'loading' | 'ready';

type UseConversationPersistenceOptions = {
  // One-shot navigation signal ("start a new consultation"). When true, the
  // latest conversation is NOT restored; a fresh conversation is created lazily
  // on the first user message.
  startNew: boolean;
};

type UseConversationPersistenceResult = {
  hydrationStatus: MessagesHydrationStatus;
  restoredMessages: ChatMessage[] | null;
  // Increments on every reset (login / logout / user switch / start-new) so the
  // screen can re-seed its visible messages.
  resetToken: number;
  // Current conversation memory (summary + checkpoint) for the chat prompt.
  conversationMemory: ConversationMemoryState;
  persistMessage: (message: ChatMessage) => void;
};

const EMPTY_MEMORY: ConversationMemoryState = {
  summary: null,
  lastSummarizedMessageId: null,
};

export function useConversationPersistence(
  options: UseConversationPersistenceOptions,
): UseConversationPersistenceResult {
  const { startNew } = options;
  const { authState } = useAuth();

  const [hydrationStatus, setHydrationStatus] =
    useState<MessagesHydrationStatus>('idle');
  const [restoredMessages, setRestoredMessages] = useState<ChatMessage[] | null>(
    null,
  );
  const [resetToken, setResetToken] = useState(0);
  const [conversationMemory, setConversationMemory] =
    useState<ConversationMemoryState>(EMPTY_MEMORY);

  // Which user's conversation is currently hydrated (keyed by user id).
  const hydratedUserIdRef = useRef<string | null>(null);
  // Active conversation id for this session (null until restored or created).
  const conversationIdRef = useRef<string | null>(null);
  // Message ids already saved or in-flight — prevents duplicate insert attempts.
  const persistedIdsRef = useRef<Set<string>>(new Set());
  // Serializes writes so out-of-order completion can't reorder/duplicate.
  const saveChainRef = useRef<Promise<unknown>>(Promise.resolve());
  // In-flight lazy conversation creation, shared so rapid sends create one row.
  const creationRef = useRef<Promise<string> | null>(null);

  // Ordered messages CONFIRMED persisted in the DB (restore + successful saves).
  // This — not the UI message list — is the summary input, so welcome/error
  // placeholders and failed saves are never summarized.
  const persistedMessagesRef = useRef<ChatMessage[]>([]);
  // Canonical summary/checkpoint (mirrored to state for the prompt).
  const summaryStateRef = useRef<ConversationMemoryState>(EMPTY_MEMORY);
  // Single-flight controls for summary generation.
  const summaryRunningRef = useRef(false);
  const summaryPendingRef = useRef(false);
  // Bumped on every conversation-context change; stale async work is discarded
  // by comparing against this token.
  const activeConversationTokenRef = useRef(0);

  const resetInMemory = () => {
    conversationIdRef.current = null;
    persistedIdsRef.current = new Set();
    creationRef.current = null;
    saveChainRef.current = Promise.resolve();
    persistedMessagesRef.current = [];
    summaryStateRef.current = EMPTY_MEMORY;
    summaryPendingRef.current = false;
    activeConversationTokenRef.current += 1;
    setConversationMemory(EMPTY_MEMORY);
  };

  useEffect(() => {
    let cancelled = false;

    const status = authState.status;
    const userId = authState.user?.id ?? null;

    if (status === 'loading') {
      setHydrationStatus('idle');
      return;
    }

    if (status === 'unauthenticated' || userId === null) {
      // Logout / unauthenticated: drop everything immediately; never create a
      // conversation from this transition.
      hydratedUserIdRef.current = null;
      resetInMemory();
      setRestoredMessages([]);
      setResetToken((token) => token + 1);
      setHydrationStatus('ready');
      return;
    }

    if (hydratedUserIdRef.current === userId) {
      return;
    }

    // New / switched authenticated user: clear first (never expose the previous
    // user's data), then hydrate.
    resetInMemory();
    setRestoredMessages(null);
    setResetToken((token) => token + 1);
    setHydrationStatus('loading');

    if (startNew) {
      hydratedUserIdRef.current = userId;
      setRestoredMessages([]);
      setHydrationStatus('ready');
      return;
    }

    conversationService
      .loadLatestConversation()
      .then((loaded) => {
        if (cancelled) {
          return;
        }
        hydratedUserIdRef.current = userId;
        if (loaded !== null) {
          conversationIdRef.current = loaded.conversationId;
          persistedMessagesRef.current = loaded.messages;
          loaded.messages.forEach((message) => {
            persistedIdsRef.current.add(message.id);
          });
          const restoredMemory: ConversationMemoryState = {
            summary: loaded.summary,
            lastSummarizedMessageId: loaded.lastSummarizedMessageId,
          };
          summaryStateRef.current = restoredMemory;
          setConversationMemory(restoredMemory);
          setRestoredMessages(loaded.messages);
        } else {
          setRestoredMessages([]);
        }
        setHydrationStatus('ready');
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        // Fail-open to a fresh in-memory conversation; do not block chat.
        hydratedUserIdRef.current = userId;
        setRestoredMessages([]);
        setHydrationStatus('ready');
      });

    return () => {
      cancelled = true;
    };
  }, [authState.status, authState.user?.id, startNew]);

  const ensureConversationId = (): Promise<string> => {
    if (conversationIdRef.current !== null) {
      return Promise.resolve(conversationIdRef.current);
    }
    if (creationRef.current !== null) {
      return creationRef.current;
    }
    const creation = conversationService
      .createConversation()
      .then((id) => {
        conversationIdRef.current = id;
        return id;
      })
      .catch((error) => {
        creationRef.current = null; // allow a later retry
        throw error;
      });
    creationRef.current = creation;
    return creation;
  };

  const runSummaryLoop = async () => {
    summaryRunningRef.current = true;
    try {
      while (summaryPendingRef.current) {
        summaryPendingRef.current = false;

        const token = activeConversationTokenRef.current;
        const conversationId = conversationIdRef.current;
        if (conversationId === null) {
          break;
        }

        const result = computeConversationMemory(
          persistedMessagesRef.current,
          summaryStateRef.current,
        );
        if (
          !result.shouldUpdateSummary ||
          result.messagesToSummarize.length === 0
        ) {
          break;
        }

        let summaryText: string;
        try {
          const promptMessages = buildSummaryPrompt(
            result.existingSummary,
            result.messagesToSummarize,
          );
          const response = await supabaseEdgeLLMAdapter.generateResponse({
            model: chatConfig.defaultModel,
            messages: promptMessages,
            maxOutputTokens: chatConfig.maxOutputTokens,
            temperature: chatConfig.temperature,
          });
          summaryText = response.text;
        } catch {
          // Generation failed → keep existing summary/checkpoint.
          break;
        }

        // Discard if the conversation context changed while generating.
        if (
          token !== activeConversationTokenRef.current ||
          conversationId !== conversationIdRef.current
        ) {
          break;
        }

        const checkpoint =
          result.messagesToSummarize[result.messagesToSummarize.length - 1].id;

        try {
          await conversationService.saveSummary(
            conversationId,
            summaryText,
            checkpoint,
          );
        } catch {
          // Save failed → do NOT advance memory/checkpoint.
          break;
        }

        // Re-check staleness before applying to memory state.
        if (
          token !== activeConversationTokenRef.current ||
          conversationId !== conversationIdRef.current
        ) {
          break;
        }

        const newMemory: ConversationMemoryState = {
          summary: summaryText,
          lastSummarizedMessageId: checkpoint,
        };
        summaryStateRef.current = newMemory;
        setConversationMemory(newMemory);
        // Loop: re-evaluate for remaining backlog or newly pending messages.
      }
    } finally {
      summaryRunningRef.current = false;
    }
  };

  const maybeUpdateSummary = () => {
    summaryPendingRef.current = true;
    if (summaryRunningRef.current) {
      return;
    }
    void runSummaryLoop();
  };

  const persistMessage = (message: ChatMessage) => {
    if (authState.status !== 'authenticated' || authState.user === null) {
      return;
    }
    if (persistedIdsRef.current.has(message.id)) {
      return;
    }
    persistedIdsRef.current.add(message.id);

    const role: PersistableMessageRole = message.role;
    const tokenAtEnqueue = activeConversationTokenRef.current;

    saveChainRef.current = saveChainRef.current
      .catch(() => {})
      .then(() => {
        // Abort if the conversation context changed before this write ran, so a
        // previous user's message is never written into a new conversation.
        if (tokenAtEnqueue !== activeConversationTokenRef.current) {
          throw new Error('stale-context');
        }
        return ensureConversationId();
      })
      .then((conversationId) =>
        conversationService.saveMessage(conversationId, {
          role,
          content: message.text,
          clientMessageId: message.id,
        }),
      )
      .then(() => {
        // Only AFTER a confirmed DB write does the message become a summary
        // input, and only if still the same conversation context.
        if (tokenAtEnqueue !== activeConversationTokenRef.current) {
          return;
        }
        persistedMessagesRef.current = [
          ...persistedMessagesRef.current,
          message,
        ];
        maybeUpdateSummary();
      })
      .catch(() => {
        // Save failed (or stale) → not a persisted message; allow a later retry
        // and keep it out of the summary input.
        persistedIdsRef.current.delete(message.id);
      });
  };

  return {
    hydrationStatus,
    restoredMessages,
    resetToken,
    conversationMemory,
    persistMessage,
  };
}
