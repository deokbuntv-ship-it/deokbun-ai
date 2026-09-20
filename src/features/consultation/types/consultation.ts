import type { BirthCountry } from '@/features/consultation/birthRange';

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
  /**
   * 태어난 곳이 대한민국인가 해외인가 (2026-09-21).
   *
   * ⚠ **계산에는 쓰지 않는다.** V1 은 장소와 상관없이 언제나 한국 시간으로 계산한다
   *   (`birthInputMapper.ts`). 이 값은 **어떤 안내를 보여 줄지**만 고른다. 넣지 않아도 되며
   *   (옛 데이터), 없으면 대한민국으로 본다.
   */
  birthCountry?: BirthCountry | null;
};

export type ConsultationDraft = {
  subject: ConsultationSubject | null;
  birthInfo: BirthInfoDraft | null;
};

export const initialConsultationDraft: ConsultationDraft = {
  subject: null,
  birthInfo: null,
};
