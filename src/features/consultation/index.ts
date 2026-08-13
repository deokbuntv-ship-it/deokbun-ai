export { ConsultationDraftProvider, useConsultationDraft } from './context';
export type { DraftHydrationStatus } from './context/ConsultationDraftContext';

export type {
    ApproximateTimePeriod, BirthInfoDraft, BirthTimeAccuracy, CalendarType, ConsultationDraft, ConsultationSubject, Gender, LunarMonthType
} from './types/consultation';

export { initialConsultationDraft } from './types/consultation';

export { consultationDraftService } from './services/consultationDraftService';
export type {
    LoadedConsultationDraft, SavedConsultationDraft
} from './services/consultationDraftService';

export { consultationSubjectService } from './services/consultationSubjectService';
export type {
    CreateSubjectInput, UpdateSubjectInput
} from './services/consultationSubjectService';
export { useConsultationSubjects } from './hooks/useConsultationSubjects';
export type { SubjectsStatus } from './hooks/useConsultationSubjects';
export type { ConsultationSubjectRecord } from './types/subject';
export {
    createTempSubjectId, isSavedSubjectId, isTempSubjectId
} from './types/subject';

export {
    clearPendingConsultationIntent,
    consumePendingQuestion,
    consumePendingReturnTo,
    isSafeReturnTo,
    peekPendingConsultationIntent,
    setPendingConsultationIntent,
} from './pendingConsultationIntent';
export type { PendingConsultationIntent } from './pendingConsultationIntent';

