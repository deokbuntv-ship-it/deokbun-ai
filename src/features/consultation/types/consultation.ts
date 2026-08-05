export type Gender = 'male' | 'female';

export type CalendarType = 'solar' | 'lunar';

export type LunarMonthType = 'regular' | 'leap';

export type BirthTimeAccuracy = 'exact' | 'approximate' | 'unknown';

export type ApproximateTimePeriod =
  | 'dawn'
  | 'morning'
  | 'afternoon'
  | 'evening'
  | 'night';

export type ConsultationSubject = {
  id: string;
  displayName: string;
  relationship: string | null;
};

export type ConsultationTopic = {
  id: string;
  title: string;
};

export type BirthInfoDraft = {
  displayName: string;
  gender: Gender | null;
  calendarType: CalendarType | null;
  lunarMonthType: LunarMonthType | null;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  birthTimeAccuracy: BirthTimeAccuracy | null;
  birthHour: string;
  birthMinute: string;
  approximateTimePeriod: ApproximateTimePeriod | null;
  birthPlace: string;
};

export type QuestionDraft = {
  text: string;
  recommendedQuestionId: string | null;
};

export type ConsultationDraft = {
  subject: ConsultationSubject | null;
  topic: ConsultationTopic | null;
  birthInfo: BirthInfoDraft | null;
  question: QuestionDraft | null;
};

export const initialConsultationDraft: ConsultationDraft = {
  subject: null,
  topic: null,
  birthInfo: null,
  question: null,
};
