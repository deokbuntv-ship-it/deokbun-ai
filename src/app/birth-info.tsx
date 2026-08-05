import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/theme';
import { MaxContentWidth } from '@/constants/theme';

type Gender = 'male' | 'female';
type CalendarType = 'solar' | 'lunar';
type LunarMonthType = 'normal' | 'leap';
type BirthTimeAccuracy = 'exact' | 'approximate' | 'unknown';
type ApproximateTimePeriod = 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night';

type SelectOption<T extends string> = {
  value: T;
  label: string;
};

const GENDER_OPTIONS: SelectOption<Gender>[] = [
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' },
];

const CALENDAR_TYPE_OPTIONS: SelectOption<CalendarType>[] = [
  { value: 'solar', label: '양력' },
  { value: 'lunar', label: '음력' },
];

const LUNAR_MONTH_TYPE_OPTIONS: SelectOption<LunarMonthType>[] = [
  { value: 'normal', label: '평달' },
  { value: 'leap', label: '윤달' },
];

const BIRTH_TIME_ACCURACY_OPTIONS: SelectOption<BirthTimeAccuracy>[] = [
  { value: 'exact', label: '정확히 알고 있음' },
  { value: 'approximate', label: '대략적인 시간대만 알고 있음' },
  { value: 'unknown', label: '전혀 모름' },
];

const APPROXIMATE_TIME_PERIOD_OPTIONS: SelectOption<ApproximateTimePeriod>[] = [
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
  onSelect: (value: T) => void;
}) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  return (
    <Stack direction="row" gap="sm" style={styles.optionRow}>
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <Pressable
            key={option.value}
            onPress={() => onSelect(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
          >
            <Card
              style={{
                borderColor: isSelected ? theme.primary : theme.border,
                borderWidth: isSelected ? 2 : 1,
              }}
            >
              <Text variant="bodyMedium">{option.label}</Text>
            </Card>
          </Pressable>
        );
      })}
    </Stack>
  );
}

function isValidYear(value: string): boolean {
  return /^\d{4}$/.test(value);
}

function isValidMonth(value: string): boolean {
  const num = Number(value);
  return /^\d{1,2}$/.test(value) && num >= 1 && num <= 12;
}

function isValidDay(value: string): boolean {
  const num = Number(value);
  return /^\d{1,2}$/.test(value) && num >= 1 && num <= 31;
}

function isValidHour(value: string): boolean {
  const num = Number(value);
  return /^\d{1,2}$/.test(value) && num >= 0 && num <= 23;
}

function isValidMinute(value: string): boolean {
  const num = Number(value);
  return /^\d{1,2}$/.test(value) && num >= 0 && num <= 59;
}

export default function BirthInfoScreen() {
  const { topicId } = useLocalSearchParams<{ topicId?: string }>();

  void topicId;

  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [calendarType, setCalendarType] = useState<CalendarType | null>(null);
  const [lunarMonthType, setLunarMonthType] = useState<LunarMonthType | null>(null);

  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');

  const [birthTimeAccuracy, setBirthTimeAccuracy] = useState<BirthTimeAccuracy | null>(null);
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [approximatePeriod, setApproximatePeriod] = useState<ApproximateTimePeriod | null>(null);

  const [birthPlace, setBirthPlace] = useState('');

  const handleCalendarTypeSelect = (value: CalendarType) => {
    setCalendarType(value);
    if (value === 'solar') {
      setLunarMonthType(null);
    }
  };

  const handleBirthTimeAccuracySelect = (value: BirthTimeAccuracy) => {
    setBirthTimeAccuracy(value);
    if (value !== 'exact') {
      setHour('');
      setMinute('');
    }
    if (value !== 'approximate') {
      setApproximatePeriod(null);
    }
  };

  const isDateValid = isValidYear(year) && isValidMonth(month) && isValidDay(day);

  const isBirthTimeValid =
    birthTimeAccuracy === 'exact'
      ? isValidHour(hour) && isValidMinute(minute)
      : birthTimeAccuracy === 'approximate'
        ? approximatePeriod !== null
        : birthTimeAccuracy === 'unknown';

  const isFormValid =
    gender !== null &&
    calendarType !== null &&
    (calendarType !== 'lunar' || lunarMonthType !== null) &&
    isDateValid &&
    birthTimeAccuracy !== null &&
    isBirthTimeValid &&
    birthPlace.trim().length > 0;

  const handleGoToQuestion = () => {
    // 이번 Sprint 범위 아님: 질문 입력 화면으로 아직 이동하지 않음
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          <Stack gap="xxl">
            <Stack gap="xs">
              <Text variant="headingLarge">출생정보 입력</Text>
              <Text variant="bodyMedium" colorToken="textSecondary">
                정확한 분석을 위해 알고 있는 범위에서 입력해 주세요.
              </Text>
            </Stack>

            <Stack gap="sm">
              <Text variant="headingMedium">상담 대상</Text>
              <Card>
                <Text variant="bodyLarge">본인</Text>
              </Card>
            </Stack>

            <Input
              label="표시 이름"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="예) 나, 홍길동, 첫째 아이"
              helperText="실명을 입력하지 않아도 괜찮습니다."
            />

            <Stack gap="sm">
              <Text variant="headingMedium">성별</Text>
              <SelectField options={GENDER_OPTIONS} value={gender} onSelect={setGender} />
            </Stack>

            <Stack gap="sm">
              <Text variant="headingMedium">달력 구분</Text>
              <SelectField
                options={CALENDAR_TYPE_OPTIONS}
                value={calendarType}
                onSelect={handleCalendarTypeSelect}
              />
              {calendarType === 'lunar' ? (
                <SelectField
                  options={LUNAR_MONTH_TYPE_OPTIONS}
                  value={lunarMonthType}
                  onSelect={setLunarMonthType}
                />
              ) : null}
            </Stack>

            <Stack gap="sm">
              <Text variant="headingMedium">생년월일</Text>
              <Stack direction="row" gap="sm">
                <Input
                  label="연도"
                  value={year}
                  onChangeText={setYear}
                  placeholder="1990"
                  keyboardType="number-pad"
                  maxLength={4}
                  style={styles.dateField}
                />
                <Input
                  label="월"
                  value={month}
                  onChangeText={setMonth}
                  placeholder="1"
                  keyboardType="number-pad"
                  maxLength={2}
                  style={styles.dateField}
                />
                <Input
                  label="일"
                  value={day}
                  onChangeText={setDay}
                  placeholder="1"
                  keyboardType="number-pad"
                  maxLength={2}
                  style={styles.dateField}
                />
              </Stack>
            </Stack>

            <Stack gap="sm">
              <Text variant="headingMedium">출생시간</Text>
              <SelectField
                options={BIRTH_TIME_ACCURACY_OPTIONS}
                value={birthTimeAccuracy}
                onSelect={handleBirthTimeAccuracySelect}
              />

              {birthTimeAccuracy === 'exact' ? (
                <Stack direction="row" gap="sm">
                  <Input
                    label="시"
                    value={hour}
                    onChangeText={setHour}
                    placeholder="0-23"
                    keyboardType="number-pad"
                    maxLength={2}
                    style={styles.dateField}
                  />
                  <Input
                    label="분"
                    value={minute}
                    onChangeText={setMinute}
                    placeholder="0-59"
                    keyboardType="number-pad"
                    maxLength={2}
                    style={styles.dateField}
                  />
                </Stack>
              ) : null}

              {birthTimeAccuracy === 'approximate' ? (
                <SelectField
                  options={APPROXIMATE_TIME_PERIOD_OPTIONS}
                  value={approximatePeriod}
                  onSelect={setApproximatePeriod}
                />
              ) : null}

              {birthTimeAccuracy === 'unknown' ? (
                <Text variant="bodySmall" colorToken="textSecondary">
                  출생시간에 따라 일부 해석 범위가 제한될 수 있습니다. 덕분AI는
                  알 수 없는 출생시간을 임의로 추측하지 않습니다.
                </Text>
              ) : null}
            </Stack>

            <Input
              label="출생지"
              value={birthPlace}
              onChangeText={setBirthPlace}
              placeholder="예) 대한민국 고양시"
              required
            />

            <Button
              label="질문 입력으로 이동"
              disabled={!isFormValid}
              onPress={handleGoToQuestion}
            />
          </Stack>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 24,
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  optionRow: {
    flexWrap: 'wrap',
  },
  dateField: {
    flex: 1,
  },
});
