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

