import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react';

import {
  initialConsultationDraft,
  type BirthInfoDraft,
  type ConsultationDraft,
  type ConsultationSubject,
} from '@/features/consultation/types/consultation';

type ConsultationDraftAction =
  | { type: 'UPDATE_SUBJECT'; payload: ConsultationSubject }
  | { type: 'UPDATE_BIRTH_INFO'; payload: BirthInfoDraft }
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
    case 'RESET_DRAFT':
      return { ...initialConsultationDraft };
    default:
      return state;
  }
}

type ConsultationDraftContextValue = {
  draft: ConsultationDraft;
  updateSubject: (subject: ConsultationSubject) => void;
  updateBirthInfo: (birthInfo: BirthInfoDraft) => void;
  resetDraft: () => void;
};

const ConsultationDraftContext = createContext<ConsultationDraftContextValue | null>(
  null,
);

export function ConsultationDraftProvider({ children }: { children: ReactNode }) {
  const [draft, dispatch] = useReducer(
    consultationDraftReducer,
    initialConsultationDraft,
  );

  const value = useMemo<ConsultationDraftContextValue>(
    () => ({
      draft,
      updateSubject: (subject) => dispatch({ type: 'UPDATE_SUBJECT', payload: subject }),
      updateBirthInfo: (birthInfo) =>
        dispatch({ type: 'UPDATE_BIRTH_INFO', payload: birthInfo }),
      resetDraft: () => dispatch({ type: 'RESET_DRAFT' }),
    }),
    [draft],
  );

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
