import { useEffect, useRef, useState } from 'react';

import { useAuth } from '@/features/auth';
import {
  conversationService,
  type PersistableMessageRole,
} from '@/features/chat/services/conversationService';
import type { ChatMessage } from '@/features/chat/types/chat';

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
  persistMessage: (message: ChatMessage) => void;
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

  // Which user's conversation is currently hydrated (keyed by user id, Req).
  const hydratedUserIdRef = useRef<string | null>(null);
  // Active conversation id for this session (null until restored or created).
  const conversationIdRef = useRef<string | null>(null);
  // Message ids already persisted or restored — prevents duplicate inserts.
  const persistedIdsRef = useRef<Set<string>>(new Set());
  // Serializes writes so out-of-order completion can't reorder/duplicate.
  const saveChainRef = useRef<Promise<unknown>>(Promise.resolve());
  // In-flight lazy conversation creation, shared so rapid sends create one row.
  const creationRef = useRef<Promise<string> | null>(null);

  const resetInMemory = () => {
    conversationIdRef.current = null;
    persistedIdsRef.current = new Set();
    creationRef.current = null;
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
      // Logout / unauthenticated: drop any in-memory conversation immediately and
      // never create a conversation from this transition.
      hydratedUserIdRef.current = null;
      resetInMemory();
      setRestoredMessages([]);
      setResetToken((token) => token + 1);
      setHydrationStatus('ready');
      return;
    }

    if (hydratedUserIdRef.current === userId) {
      // Already hydrated for this user; keep the active in-memory conversation.
      return;
    }

    // New / switched authenticated user: clear first so the previous user's
    // conversation is never exposed, then hydrate.
    resetInMemory();
    setRestoredMessages(null);
    setResetToken((token) => token + 1);
    setHydrationStatus('loading');

    if (startNew) {
      // Explicit new consultation: skip restoring the latest conversation.
      hydratedUserIdRef.current = userId;
      conversationIdRef.current = null;
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
          loaded.messages.forEach((message) => {
            persistedIdsRef.current.add(message.id);
          });
          setRestoredMessages(loaded.messages);
        } else {
          conversationIdRef.current = null;
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
        conversationIdRef.current = null;
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

  const persistMessage = (message: ChatMessage) => {
    if (authState.status !== 'authenticated' || authState.user === null) {
      return;
    }
    if (persistedIdsRef.current.has(message.id)) {
      return;
    }
    persistedIdsRef.current.add(message.id);

    const role: PersistableMessageRole = message.role;

    saveChainRef.current = saveChainRef.current
      .catch(() => {})
      .then(() => ensureConversationId())
      .then((conversationId) =>
        conversationService.saveMessage(conversationId, {
          role,
          content: message.text,
          clientMessageId: message.id,
        }),
      )
      .catch(() => {
        // Best-effort: a failed save must not break the in-memory experience.
      });
  };

  return { hydrationStatus, restoredMessages, resetToken, persistMessage };
}
