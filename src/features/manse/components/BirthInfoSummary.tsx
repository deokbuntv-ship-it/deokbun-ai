import { Card } from '@/components/Card';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { spacing } from '@/theme';

import type {
  ManseApproximatePeriod,
  ManseBirthDisplay,
  ManseCalendarType,
  ManseGender,
  ManseTimeAccuracy,
} from '../types';

// Presentation-only. Shows the subject's RAW birth input, exactly as entered.
// The APP never normalizes here — lunar dates are shown as lunar, and labels make
// clear these are the entered values (e.g. "입력 생년월일", "음력 · 윤달").

const GENDER_LABEL: Record<ManseGender, string> = {
  male: '남성',
  female: '여성',
};

const CALENDAR_LABEL: Record<ManseCalendarType, string> = {
  solar: '양력',
  lunar: '음력',
};

const APPROXIMATE_PERIOD_LABEL: Record<ManseApproximatePeriod, string> = {
  dawn: '새벽',
  morning: '오전',
  afternoon: '오후',
  evening: '저녁',
  night: '밤',
};

function calendarText(birth: ManseBirthDisplay): string {
  if (birth.calendarType === null) {
    return '–';
  }
  const base = CALENDAR_LABEL[birth.calendarType];
  // 윤달 is only meaningful for lunar input.
  if (birth.calendarType === 'lunar' && birth.lunarMonthType !== null) {
    return `${base} · ${birth.lunarMonthType === 'leap' ? '윤달' : '평달'}`;
  }
  return base;
}

function birthDateText(birth: ManseBirthDisplay): string {
  const { birthYear, birthMonth, birthDay } = birth;
  if (!birthYear && !birthMonth && !birthDay) {
    return '–';
  }
  return `${birthYear}년 ${birthMonth}월 ${birthDay}일`;
}

function birthTimeText(accuracy: ManseTimeAccuracy | null, birth: ManseBirthDisplay): string {
  if (accuracy === 'exact') {
    return `${birth.birthHour}시 ${birth.birthMinute}분 (정확)`;
  }
  if (accuracy === 'approximate') {
    const period =
      birth.approximateTimePeriod !== null
        ? APPROXIMATE_PERIOD_LABEL[birth.approximateTimePeriod]
        : '대략적인 시간대';
    return `${period} (대략)`;
  }
  if (accuracy === 'unknown') {
    return '모름';
  }
  return '–';
}

// Compact row: tighter label column + bodySmall value so the 입력 정보 card stays
// visually secondary to the 원국 8글자 (APP-29B). No information is removed.
function Row({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" gap="sm" align="flex-start">
      <Text variant="caption" colorToken="textSecondary" style={{ width: 68 }}>
        {label}
      </Text>
      <Text variant="bodySmall" style={{ flex: 1 }}>
        {value}
      </Text>
    </Stack>
  );
}

export function BirthInfoSummary({ birth }: { birth: ManseBirthDisplay }) {
  const nameLine = `${birth.displayName}${birth.isSelf ? ' (본인)' : ''}`;

  return (
    <Stack gap="xs">
      <Text variant="bodyMedium" colorToken="textSecondary">
        입력 정보
      </Text>
      <Card style={{ paddingVertical: spacing.md }}>
        <Stack gap="xs">
          <Row label="이름" value={nameLine} />
          {birth.relationship ? (
            <Row label="관계" value={birth.relationship} />
          ) : null}
          <Row
            label="성별"
            value={birth.gender !== null ? GENDER_LABEL[birth.gender] : '–'}
          />
          <Row label="입력 생년월일" value={birthDateText(birth)} />
          <Row label="달력" value={calendarText(birth)} />
          <Row
            label="출생시간"
            value={birthTimeText(birth.birthTimeAccuracy, birth)}
          />
          <Row
            label="출생지"
            value={birth.birthPlace.length > 0 ? birth.birthPlace : '–'}
          />
        </Stack>
      </Card>
    </Stack>
  );
}
