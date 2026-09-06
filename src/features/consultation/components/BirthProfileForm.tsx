import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Input } from '@/components/Input';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import {
  isValidDayString,
  isValidHourString,
  isValidMinuteString,
  isValidMonthString,
  isValidYearString,
} from '@/features/consultation/birthProfileValidation';
import { isSolarTermBoundaryTimeRequired } from '@/features/consultation/birthBoundaryGate';
import { BoundaryTimeNotice } from '@/features/consultation/components/BoundaryTimeNotice';
import type {
  ApproximateTimePeriod,
  BirthInfoDraft,
  BirthTimeAccuracy,
  CalendarType,
  Gender,
  LunarMonthType,
} from '@/features/consultation/types/consultation';

// Reusable SELF birth-profile form (onboarding). Collects the app birth fields, validates with the SHARED
// pure validators (birthProfileValidation), and hands a complete BirthInfoDraft to `onSubmit`. It owns no
// persistence — the caller decides what to do with the draft (create the canonical SELF subject). Field UI
// mirrors the proven birth-info form; advanced/technical calendar internals stay downstream (§25/§82).

type SelectOption<T extends string> = { value: T; label: string };
const GENDER_OPTIONS: SelectOption<Gender>[] = [
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' },
];
const CALENDAR_OPTIONS: SelectOption<CalendarType>[] = [
  { value: 'solar', label: '양력' },
  { value: 'lunar', label: '음력' },
];
const LUNAR_MONTH_OPTIONS: SelectOption<LunarMonthType>[] = [
  { value: 'regular', label: '평달' },
  { value: 'leap', label: '윤달' },
];
const TIME_ACCURACY_OPTIONS: SelectOption<BirthTimeAccuracy>[] = [
  { value: 'exact', label: '정확히 알아요' },
  { value: 'approximate', label: '대략 알아요' },
  { value: 'unknown', label: '몰라요' },
];
const PERIOD_OPTIONS: SelectOption<ApproximateTimePeriod>[] = [
  { value: 'dawn', label: '새벽' },
  { value: 'morning', label: '오전' },
  { value: 'afternoon', label: '오후' },
  { value: 'evening', label: '저녁' },
  { value: 'night', label: '밤' },
];

function SelectField<T extends string>({
  options,
  value,
  onSelect,
}: {
  options: SelectOption<T>[];
  value: T | null;
  onSelect: (v: T) => void;
}) {
  return (
    <Stack direction="row" gap="sm" style={styles.optionRow}>
      {options.map((o) => (
        <Chip key={o.value} label={o.label} selected={o.value === value} onPress={() => onSelect(o.value)} />
      ))}
    </Stack>
  );
}

export function BirthProfileForm({
  submitting,
  error,
  submitLabel,
  onSubmit,
}: {
  submitting: boolean;
  error: string | null;
  submitLabel: string;
  onSubmit: (birthInfo: BirthInfoDraft) => void;
}) {
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [calendarType, setCalendarType] = useState<CalendarType | null>(null);
  const [lunarMonthType, setLunarMonthType] = useState<LunarMonthType | null>(null);
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [timeAccuracy, setTimeAccuracy] = useState<BirthTimeAccuracy | null>(null);
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [period, setPeriod] = useState<ApproximateTimePeriod | null>(null);
  const [birthPlace, setBirthPlace] = useState('');

  const onCalendar = (v: CalendarType) => {
    setCalendarType(v);
    if (v === 'solar') setLunarMonthType(null);
  };
  const onTimeAccuracy = (v: BirthTimeAccuracy) => {
    setTimeAccuracy(v);
    if (v !== 'exact') {
      setHour('');
      setMinute('');
    }
    if (v !== 'approximate') setPeriod(null);
  };

  const dateValid = isValidYearString(year) && isValidMonthString(month) && isValidDayString(day);
  const timeValid =
    timeAccuracy === 'exact'
      ? isValidHourString(hour) && isValidMinuteString(minute)
      : timeAccuracy === 'approximate'
        ? period !== null
        : timeAccuracy === 'unknown';
  // 절기 경계일 — same shared judgment as birth-info.tsx and the Edge. Advisory: deliberately NOT part of
  // `valid`, so the submit button stays enabled and the user chooses.
  const showBoundaryWarning =
    dateValid
    && isSolarTermBoundaryTimeRequired({
      calendarType,
      lunarMonthType,
      birthYear: year,
      birthMonth: month,
      birthDay: day,
      birthTimeAccuracy: timeAccuracy,
    });
  const valid =
    gender !== null &&
    calendarType !== null &&
    (calendarType !== 'lunar' || lunarMonthType !== null) &&
    dateValid &&
    timeAccuracy !== null &&
    timeValid &&
    birthPlace.trim().length > 0;

  const submit = () => {
    if (!valid || submitting || gender === null || calendarType === null || timeAccuracy === null) return;
    onSubmit({
      displayName: displayName.trim(),
      gender,
      calendarType,
      lunarMonthType: calendarType === 'lunar' ? lunarMonthType : null,
      birthYear: year,
      birthMonth: month,
      birthDay: day,
      birthTimeAccuracy: timeAccuracy,
      birthHour: timeAccuracy === 'exact' ? hour : '',
      birthMinute: timeAccuracy === 'exact' ? minute : '',
      approximateTimePeriod: timeAccuracy === 'approximate' ? period : null,
      birthPlace: birthPlace.trim(),
    });
  };

  return (
    <Stack gap="xl">
      <Input label="이름 (선택)" value={displayName} onChangeText={setDisplayName} placeholder="예) 나, 홍길동" helperText="실명을 입력하지 않아도 괜찮아요." />

      <Stack gap="sm">
        <Text variant="headingMedium">성별</Text>
        <SelectField options={GENDER_OPTIONS} value={gender} onSelect={setGender} />
      </Stack>

      <Stack gap="sm">
        <Text variant="headingMedium">달력</Text>
        <SelectField options={CALENDAR_OPTIONS} value={calendarType} onSelect={onCalendar} />
        {calendarType === 'lunar' ? <SelectField options={LUNAR_MONTH_OPTIONS} value={lunarMonthType} onSelect={setLunarMonthType} /> : null}
      </Stack>

      <Stack gap="sm">
        <Text variant="headingMedium">생년월일</Text>
        <Stack direction="row" gap="sm">
          <Input label="연도" value={year} onChangeText={setYear} placeholder="1994" keyboardType="number-pad" maxLength={4} style={styles.field} />
          <Input label="월" value={month} onChangeText={setMonth} placeholder="5" keyboardType="number-pad" maxLength={2} style={styles.field} />
          <Input label="일" value={day} onChangeText={setDay} placeholder="20" keyboardType="number-pad" maxLength={2} style={styles.field} />
        </Stack>
      </Stack>

      <Stack gap="sm">
        <Text variant="headingMedium">태어난 시간</Text>
        <SelectField options={TIME_ACCURACY_OPTIONS} value={timeAccuracy} onSelect={onTimeAccuracy} />
        {timeAccuracy === 'exact' ? (
          <Stack direction="row" gap="sm">
            <Input label="시" value={hour} onChangeText={setHour} placeholder="0-23" keyboardType="number-pad" maxLength={2} style={styles.field} />
            <Input label="분" value={minute} onChangeText={setMinute} placeholder="0-59" keyboardType="number-pad" maxLength={2} style={styles.field} />
          </Stack>
        ) : null}
        {timeAccuracy === 'approximate' ? <SelectField options={PERIOD_OPTIONS} value={period} onSelect={setPeriod} /> : null}
        {timeAccuracy === 'unknown' ? (
          <Text variant="bodySmall" colorToken="textSecondary">
            시간을 모르셔도 괜찮아요. 다만 일부 해석 범위가 제한될 수 있고, 덕분이는 모르는 시간을 임의로 추측하지 않아요.
          </Text>
        ) : null}
        {showBoundaryWarning ? (
          <BoundaryTimeNotice
            context="form"
            onEnterTime={() => onTimeAccuracy('exact')}
            onSaveAnyway={submit}
          />
        ) : null}
      </Stack>

      <Input label="태어난 곳" value={birthPlace} onChangeText={setBirthPlace} placeholder="예) 서울" helperText="도시 수준으로 입력해도 괜찮아요." required />

      <Stack gap="sm">
        <Button label={submitting ? '저장 중...' : submitLabel} onPress={submit} disabled={!valid || submitting} />
        {error ? (
          <Text variant="bodySmall" colorToken="danger">
            {error}
          </Text>
        ) : null}
      </Stack>
    </Stack>
  );
}

const styles = StyleSheet.create({
  optionRow: { flexWrap: 'wrap' },
  field: { flex: 1 },
});
