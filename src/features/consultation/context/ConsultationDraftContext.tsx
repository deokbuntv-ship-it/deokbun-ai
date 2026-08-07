import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { useAuth } from '@/features/auth';
import { consultationDraftService } from '@/features/consultation/services/consultationDraftService';
import {
  initialConsultationDraft,
  type BirthInfoDraft,
  type ConsultationDraft,
  type ConsultationSubject,
} from '@/features/consultation/types/consultation';

type ConsultationDraftAction =
  | { type: 'UPDATE_SUBJECT'; payload: ConsultationSubject }
  | { type: 'UPDATE_BIRTH_INFO'; payload: BirthInfoDraft }
  | { type: 'HYDRATE'; payload: ConsultationDraft }
  | { type: 'RESET_DRAFT' };

function consultationDraftReducer(
  state: ConsultationDraft,
  action: ConsultationDraftAction,
): ConsultationDraft {
  switch (action.type) {
    case 'UPDATE_SUBJECT':
      return { ...state, subject: action.payload };
    case 'UPDATE_BIRTH_INFO':
      return { ...state, birthInfo: action.payload };
    case 'HYDRATE':
      return {
        subject: action.payload.subject,
        birthInfo: action.payload.birthInfo,
      };
    case 'RESET_DRAFT':
      return { ...initialConsultationDraft };
    default:
      return state;
  }
}

export type DraftHydrationStatus = 'idle' | 'loading' | 'ready';

type ConsultationDraftContextValue = {
  draft: ConsultationDraft;
  hydrationStatus: DraftHydrationStatus;
  lastSavedAt: string | null;
  updateSubject: (subject: ConsultationSubject) => void;
  updateBirthInfo: (birthInfo: BirthInfoDraft) => void;
  resetDraft: () => void;
};

const ConsultationDraftContext =
  createContext<ConsultationDraftContextValue | null>(null);

function isDraftEmpty(draft: ConsultationDraft): boolean {
  return draft.subject === null && draft.birthInfo === null;
}

export function ConsultationDraftProvider({ children }: { children: ReactNode }) {
  const { authState } = useAuth();

  const [draft, dispatch] = useReducer(
    consultationDraftReducer,
    initialConsultationDraft,
  );
  const [hydrationStatus, setHydrationStatus] =
    useState<DraftHydrationStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // Always-latest draft, so consecutive updateSubject/updateBirthInfo calls build
  // `nextDraft` from the newest value instead of a stale render closure (Req 2).
  const draftRef = useRef(draft);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  // Which user's draft is currently hydrated. Keyed by user id (not a one-time
  // boolean) so switching users re-hydrates safely (Req 1).
  const hydratedUserIdRef = useRef<string | null>(null);

  // Serializes writes so out-of-order network completion cannot persist stale
  // data. Each write already carries the FULL draft, so no field clobbers another.
  const saveChainRef = useRef<Promise<unknown>>(Promise.resolve());

  const enqueueWrite = (
    userId: string,
    nextDraft: ConsultationDraft,
    kind: 'save' | 'reset',
  ) => {
    saveChainRef.current = saveChainRef.current
      .catch(() => {})
      .then(() =>
        kind === 'reset'
          ? consultationDraftService.clearDraft(userId)
          : consultationDraftService.saveDraft(userId, nextDraft),
      )
      .then((result) => {
        setLastSavedAt((result as { updatedAt: string | null }).updatedAt);
      })
      .catch(() => {
        // Persistence failure must never break the in-memory experience.
      });
  };

  // Hydration keyed on the authenticated user id (Req 1):
  // - logout / unauthenticated -> immediately clear in-memory draft + lastSavedAt
  // - user switch A->B -> clear first so B never sees A's draft, then load B
  // - fresh login with in-progress work -> keep & persist it (no data loss)
  // - otherwise (F5 / fresh) -> restore from DB
  useEffect(() => {
    let cancelled = false;

    const status = authState.status;
    const userId = authState.user?.id ?? null;

    if (status === 'loading') {
      setHydrationStatus('idle');
      return;
    }

    if (status === 'unauthenticated' || userId === null) {
      hydratedUserIdRef.current = null;
      dispatch({ type: 'RESET_DRAFT' });
      setLastSavedAt(null);
      setHydrationStatus('ready');
      return;
    }

    if (hydratedUserIdRef.current === userId) {
      // Already hydrated for this user; keep any in-memory edits.
      return;
    }

    const previousUserId = hydratedUserIdRef.current;
    const inMemoryDraft = draftRef.current;

    if (previousUserId !== null && previousUserId !== userId) {
      // Different authenticated user: never expose the previous user's draft.
      dispatch({ type: 'RESET_DRAFT' });
      setLastSavedAt(null);
    }

    setHydrationStatus('loading');

    if (previousUserId === null && !isDraftEmpty(inMemoryDraft)) {
      // Fresh login while a draft is already in progress in memory: adopt and
      // persist it for this user instead of wiping the user's work.
      hydratedUserIdRef.current = userId;
      enqueueWrite(userId, inMemoryDraft, 'save');
      setHydrationStatus('ready');
      return;
    }

    consultationDraftService
      .loadDraft(userId)
      .then((loaded) => {
        if (cancelled) {
          return;
        }
        hydratedUserIdRef.current = userId;
        if (loaded !== null) {
          dispatch({ type: 'HYDRATE', payload: loaded.draft });
          setLastSavedAt(loaded.updatedAt);
        } else {
          setLastSavedAt(null);
        }
        setHydrationStatus('ready');
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        // Fail-open to memory-only so a transient DB error doesn't block chat.
        hydratedUserIdRef.current = userId;
        setHydrationStatus('ready');
      });

    return () => {
      cancelled = true;
    };
  }, [authState.status, authState.user?.id]);

  const value = useMemo<ConsultationDraftContextValue>(() => {
    const persistIfPossible = (
      nextDraft: ConsultationDraft,
      kind: 'save' | 'reset',
    ) => {
      if (authState.status === 'authenticated' && authState.user) {
        enqueueWrite(authState.user.id, nextDraft, kind);
      }
    };

    return {
      draft,
      hydrationStatus,
      lastSavedAt,
      updateSubject: (subject) => {
        const nextDraft: ConsultationDraft = {
          ...draftRef.current,
          subject,
        };
        draftRef.current = nextDraft; // sync for consecutive calls (Req 2)
        dispatch({ type: 'UPDATE_SUBJECT', payload: subject });
        persistIfPossible(nextDraft, 'save');
      },
      updateBirthInfo: (birthInfo) => {
        const nextDraft: ConsultationDraft = {
          ...draftRef.current,
          birthInfo,
        };
        draftRef.current = nextDraft; // sync for consecutive calls (Req 2)
        dispatch({ type: 'UPDATE_BIRTH_INFO', payload: birthInfo });
        persistIfPossible(nextDraft, 'save');
      },
      resetDraft: () => {
        const nextDraft: ConsultationDraft = { ...initialConsultationDraft };
        draftRef.current = nextDraft;
        dispatch({ type: 'RESET_DRAFT' });
        persistIfPossible(nextDraft, 'reset');
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, hydrationStatus, lastSavedAt, authState.status, authState.user]);

  return (
    <ConsultationDraftContext.Provider value={value}>
      {children}
    </ConsultationDraftContext.Provider>
  );
}

export function useConsultationDraft(): ConsultationDraftContextValue {
  const context = useContext(ConsultationDraftContext);

  if (context === null) {
    throw new Error(
      'useConsultationDraft must be used within ConsultationDraftProvider',
    );
  }

  return context;
}
