import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react';

import {
    initialConsultationDraft,
    type BirthInfoDraft,
    type ConsultationDraft,
    type ConsultationSubject,
    type ConsultationTopic,
    type QuestionDraft,
} from '@/features/consultation/types/consultation';

type ConsultationDraftAction =
  | { type: 'UPDATE_SUBJECT'; payload: ConsultationSubject }
  | { type: 'UPDATE_TOPIC'; payload: ConsultationTopic }
  | { type: 'UPDATE_BIRTH_INFO'; payload: BirthInfoDraft }
  | { type: 'UPDATE_QUESTION'; payload: QuestionDraft }
  | { type: 'RESET_DRAFT' };

function consultationDraftReducer(
  state: ConsultationDraft,
  action: ConsultationDraftAction,
): ConsultationDraft {
  switch (action.type) {
    case 'UPDATE_SUBJECT':
      return { ...state, subject: action.payload };
    case 'UPDATE_TOPIC':
      return { ...state, topic: action.payload };
    case 'UPDATE_BIRTH_INFO':
      return { ...state, birthInfo: action.payload };
    case 'UPDATE_QUESTION':
      return { ...state, question: action.payload };
    case 'RESET_DRAFT':
      return { ...initialConsultationDraft };
    default:
      return state;
  }
}

type ConsultationDraftContextValue = {
  draft: ConsultationDraft;
  updateSubject: (subject: ConsultationSubject) => void;
  updateTopic: (topic: ConsultationTopic) => void;
  updateBirthInfo: (birthInfo: BirthInfoDraft) => void;
  updateQuestion: (question: QuestionDraft) => void;
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
      updateTopic: (topic) => dispatch({ type: 'UPDATE_TOPIC', payload: topic }),
      updateBirthInfo: (birthInfo) =>
        dispatch({ type: 'UPDATE_BIRTH_INFO', payload: birthInfo }),
      updateQuestion: (question) =>
        dispatch({ type: 'UPDATE_QUESTION', payload: question }),
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
