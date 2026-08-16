import type { SelectedConsultationContext } from '@/features/chat/types/chatArchitecture';
import type { ConsultationDraft } from '@/features/consultation';

const GENDER_LABELS: Record<string, string> = {
  male: '남성',
  female: '여성',
};

const APPROXIMATE_TIME_PERIOD_LABELS: Record<string, string> = {
  dawn: '새벽',
  morning: '오전',
  afternoon: '오후',
  evening: '저녁',
  night: '밤',
};

function buildBirthTimeSummary(
  birthInfo: NonNullable<ConsultationDraft['birthInfo']>,
): string {
  if (birthInfo.birthTimeAccuracy === 'exact') {
    return `${birthInfo.birthHour}시 ${birthInfo.birthMinute}분`;
  }

  if (birthInfo.birthTimeAccuracy === 'approximate') {
    const period = birthInfo.approximateTimePeriod
      ? APPROXIMATE_TIME_PERIOD_LABELS[birthInfo.approximateTimePeriod]
      : '';
    return `${period} 무렵`;
  }

  return '출생시간 미상';
}

export function selectConsultationContext(
  draft: ConsultationDraft,
): SelectedConsultationContext | null {
  if (draft.subject === null || draft.birthInfo === null) {
    return null;
  }

  const { subject, birthInfo } = draft;

  const subjectDisplayName = subject.displayName;
  const gender = birthInfo.gender ? GENDER_LABELS[birthInfo.gender] : '';
  const birthDate = `${birthInfo.birthYear}.${birthInfo.birthMonth}.${birthInfo.birthDay}`;
  const birthTimeSummary = buildBirthTimeSummary(birthInfo);
  const birthPlace = birthInfo.birthPlace.trim();
  const birthTimeAccuracy: 'exact' | 'approximate' | 'unknown' =
    birthInfo.birthTimeAccuracy === 'exact'
      ? 'exact'
      : birthInfo.birthTimeAccuracy === 'approximate'
        ? 'approximate'
        : 'unknown';

  return {
    subjectDisplayName,
    gender,
    birthDate,
    birthTimeSummary,
    birthPlace,
    birthTimeAccuracy,
    inputCalendar: birthInfo.calendarType === 'lunar' ? 'LUNAR' : 'SOLAR',
  };
}