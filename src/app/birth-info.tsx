import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import {
    consultationSubjectService,
    createTempSubjectId,
    isSavedSubjectId,
    useConsultationDraft,
    type ApproximateTimePeriod,
    type BirthInfoDraft,
    type BirthTimeAccuracy,
    type CalendarType,
    type Gender,
    type LunarMonthType,
} from '@/features/consultation';
import { setPendingCompatibilitySubjectId } from '@/features/compatibility/services/pendingCompatibilitySubject';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, spacing } from '@/theme';

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
  { value: 'regular', label: '평달' },
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

type EditStatus = 'loading' | 'ready' | 'invalid' | 'notfound' | 'error';

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
  const router = useRouter();
  const params = useLocalSearchParams<{ subjectId?: string; origin?: string; self?: string }>();
  const subjectId =
    typeof params.subjectId === 'string' ? params.subjectId : undefined;
  const isEditMode = subjectId !== undefined;
  // Entered from the 궁합 flow (§2/§4): after save we return to /compatibility (never /chat), and we show
  // an explicit "궁합으로 돌아가기" action instead of the onboarding "상담 시작" buttons.
  const fromCompatibility = params.origin === 'compatibility';

  const { updateSubject, updateBirthInfo } = useConsultationDraft();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  const [displayName, setDisplayName] = useState('');
  const [relationship, setRelationship] = useState('');
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

  // Pre-check 본인 when the 궁합 "본인 정보 등록하기" entry passed self=1 (create mode only; edit mode
  // overwrites from the loaded record).
  const [isSelf, setIsSelf] = useState(() => params.self === '1');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [editStatus, setEditStatus] = useState<EditStatus>(
    isEditMode ? 'loading' : 'ready',
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Edit mode: validate the id and prefill the form from the saved subject.
  useEffect(() => {
    if (!isEditMode) {
      return;
    }
    // Only real UUIDs are editable. temp:* / legacy 'self' / malformed ids are
    // rejected without any DB lookup.
    if (subjectId === undefined || !isSavedSubjectId(subjectId)) {
      setEditStatus('invalid');
      return;
    }

    let cancelled = false;
    setEditStatus('loading');

    consultationSubjectService
      .getSubject(subjectId)
      .then((record) => {
        if (cancelled) {
          return;
        }
        if (record === null) {
          // RLS / non-existent: no fallback data is fabricated.
          setEditStatus('notfound');
          return;
        }

        setDisplayName(record.displayName ?? '');
        setRelationship(record.relationship ?? '');
        setIsSelf(record.isSelf);

        const birthInfo = record.birthInfo;
        setGender(birthInfo.gender);
        setCalendarType(birthInfo.calendarType);
        setLunarMonthType(birthInfo.lunarMonthType);
        setYear(birthInfo.birthYear);
        setMonth(birthInfo.birthMonth);
        setDay(birthInfo.birthDay);
        setBirthTimeAccuracy(birthInfo.birthTimeAccuracy);
        setHour(birthInfo.birthHour);
        setMinute(birthInfo.birthMinute);
        setApproximatePeriod(birthInfo.approximateTimePeriod);
        setBirthPlace(birthInfo.birthPlace);

        setEditStatus('ready');
      })
      .catch(() => {
        if (!cancelled) {
          setEditStatus('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isEditMode, subjectId]);

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

  const buildBirthInfo = (): BirthInfoDraft | null => {
    if (!isFormValid || gender === null || calendarType === null || birthTimeAccuracy === null) {
      return null;
    }

    return {
      displayName: displayName.trim(),
      gender,
      calendarType,
      lunarMonthType: calendarType === 'lunar' ? lunarMonthType : null,
      birthYear: year,
      birthMonth: month,
      birthDay: day,
      birthTimeAccuracy,
      birthHour: birthTimeAccuracy === 'exact' ? hour : '',
      birthMinute: birthTimeAccuracy === 'exact' ? minute : '',
      approximateTimePeriod: birthTimeAccuracy === 'approximate' ? approximatePeriod : null,
      birthPlace: birthPlace.trim(),
    };
  };

  const relationshipValue = (): string | null =>
    relationship.trim().length > 0 ? relationship.trim() : null;

  const startConsultation = () => {
    // Explicit "start new consultation" signal → chat starts a fresh conversation.
    router.push({ pathname: '/chat', params: { startNew: '1' } });
  };

  // Create flow — start immediately with a TEMPORARY (unsaved) subject.
  const handleStartConsultation = () => {
    const birthInfo = buildBirthInfo();
    if (birthInfo === null) {
      return;
    }

    updateSubject({
      id: createTempSubjectId(),
      displayName: birthInfo.displayName || '본인',
      relationship: relationshipValue(),
    });
    updateBirthInfo(birthInfo);
    startConsultation();
  };

  // Create flow — save to DB, then start with the saved (UUID) subject.
  const handleSaveAndStart = async () => {
    if (isSaving) {
      return;
    }
    const birthInfo = buildBirthInfo();
    if (birthInfo === null) {
      return;
    }

    setSaveError(null);
    setIsSaving(true);
    try {
      const record = await consultationSubjectService.createSubject({
        displayName: birthInfo.displayName || (isSelf ? '본인' : '대상'),
        relationship: relationshipValue(),
        isSelf,
        birthInfo,
      });

      updateSubject({
        id: record.id,
        displayName: record.displayName,
        relationship: record.relationship,
      });
      updateBirthInfo(record.birthInfo);
      startConsultation();
    } catch (error) {
      const code = (error as { code?: string } | null)?.code;
      setSaveError(
        code === '23505'
          ? '이미 본인으로 등록된 대상이 있습니다. "본인으로 저장"을 해제해 주세요.'
          : '대상 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  // 궁합 flow — create the subject, then RETURN to /compatibility (never /chat, never an LLM call §8).
  // The new TARGET is auto-selected there via the ephemeral pending id; a new 본인 is not auto-selected.
  const handleSaveForCompatibility = async () => {
    if (isSaving) return;
    const birthInfo = buildBirthInfo();
    if (birthInfo === null) return;

    setSaveError(null);
    setIsSaving(true);
    try {
      const record = await consultationSubjectService.createSubject({
        displayName: birthInfo.displayName || (isSelf ? '본인' : '상대방'),
        relationship: relationshipValue(),
        isSelf,
        birthInfo,
      });
      if (!isSelf) setPendingCompatibilitySubjectId(record.id);
      router.replace('/compatibility');
    } catch (error) {
      const code = (error as { code?: string } | null)?.code;
      setSaveError(
        code === '23505'
          ? '이미 본인으로 등록된 대상이 있습니다. "본인으로 저장"을 해제해 주세요.'
          : '저장에 실패했습니다. 잠시 후 다시 시도해 주세요.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel/back BEFORE save → return to 궁합 without creating a record (§4). Never forces Home.
  const handleCompatibilityBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/compatibility');
  };

  // Edit flow — update the saved subject only (never touches drafts/conversations).
  const handleSaveEdit = async () => {
    if (isSaving || subjectId === undefined) {
      return;
    }
    const birthInfo = buildBirthInfo();
    if (birthInfo === null) {
      return;
    }

    setSaveError(null);
    setIsSaving(true);
    try {
      await consultationSubjectService.updateSubject(subjectId, {
        displayName: displayName.trim() || '대상',
        relationship: relationshipValue(),
        birthInfo,
      });

      // is_self reassignment (sequential, clear-then-set inside the service).
      if (isSelf) {
        await consultationSubjectService.setPrimarySubject(subjectId);
      } else {
        await consultationSubjectService.updateSubject(subjectId, {
          isSelf: false,
        });
      }

      router.back();
    } catch (error) {
      const code = (error as { code?: string } | null)?.code;
      setSaveError(
        code === '23505'
          ? '본인 지정에 실패했습니다. 다시 시도해 주세요.'
          : '대상 수정에 실패했습니다. 잠시 후 다시 시도해 주세요.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting || subjectId === undefined) {
      return;
    }
    setDeleteError(null);
    setIsDeleting(true);
    try {
      await consultationSubjectService.deleteSubject(subjectId);
      router.back();
    } catch {
      setDeleteError('대상 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isEditMode && editStatus !== 'ready') {
    const message =
      editStatus === 'loading'
        ? '대상 정보를 불러오는 중입니다...'
        : editStatus === 'invalid'
          ? '유효하지 않은 대상입니다.'
          : editStatus === 'notfound'
            ? '대상을 찾을 수 없습니다.'
            : '대상 정보를 불러오지 못했습니다.';

    return (
      <Screen frame>
        <Stack style={{ flex: 1, paddingTop: 24 }} align="center" gap="md">
          <Card>
            <Text variant="bodyMedium" colorToken="textSecondary">
              {message}
            </Text>
          </Card>
          <Button label="돌아가기" variant="secondary" onPress={() => router.back()} />
        </Stack>
      </Screen>
    );
  }

  return (
    <Screen frame>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          <Stack gap="xxl">
            <Stack gap="xs">
              {fromCompatibility ? (
                <Pressable
                  onPress={handleCompatibilityBack}
                  accessibilityRole="button"
                  accessibilityLabel="궁합으로 돌아가기"
                  hitSlop={8}
                  style={{ marginBottom: spacing.sm }}
                >
                  <Text variant="bodyMedium" style={{ color: theme.secondary, fontWeight: '600' }}>
                    ← 궁합으로 돌아가기
                  </Text>
                </Pressable>
              ) : null}
              <Text variant="headingLarge">
                {isEditMode
                  ? '대상 편집'
                  : fromCompatibility
                    ? params.self === '1'
                      ? '본인 정보 등록'
                      : '상대방 추가'
                    : '출생정보 입력'}
              </Text>
              <Text variant="bodyMedium" colorToken="textSecondary">
                {fromCompatibility
                  ? '저장하면 궁합 화면으로 돌아가 바로 궁합을 볼 수 있어요.'
                  : '정확한 분석을 위해 알고 있는 범위에서 입력해 주세요.'}
              </Text>
            </Stack>

            <Input
              label="표시 이름"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="예) 나, 홍길동, 첫째 아이"
              helperText="실명을 입력하지 않아도 괜찮습니다."
            />

            <Input
              label="관계"
              value={relationship}
              onChangeText={setRelationship}
              placeholder="예) 본인, 배우자, 자녀 (선택)"
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
                  출생시간에 따라 일부 해석 범위가 제한될 수 있습니다. 덕분이는
                  알 수 없는 출생시간을 임의로 추측하지 않습니다.
                </Text>
              ) : null}
            </Stack>

            <Input
              label="출생지"
              value={birthPlace}
              onChangeText={setBirthPlace}
              placeholder="예) 대한민국 고양시"
              helperText="도시 수준으로 입력해도 괜찮습니다."
              required
            />

            <Stack gap="sm">
              <Pressable
                onPress={() => setIsSelf((value) => !value)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelf }}
              >
                <Card
                  style={{
                    borderColor: isSelf ? theme.primary : theme.border,
                    borderWidth: isSelf ? 2 : 1,
                  }}
                >
                  <Text variant="bodyMedium">
                    {isSelf ? '☑' : '☐'} {isEditMode ? '본인으로 지정' : '본인으로 저장'}
                  </Text>
                </Card>
              </Pressable>

              {isEditMode ? (
                <>
                  <Button
                    label={isSaving ? '저장 중...' : '수정 저장'}
                    disabled={!isFormValid || isSaving}
                    onPress={handleSaveEdit}
                  />

                  {saveError ? (
                    <Text variant="bodySmall" colorToken="danger">
                      {saveError}
                    </Text>
                  ) : null}

                  {confirmDelete ? (
                    <Card
                      style={{ borderColor: theme.border, borderWidth: 1 }}
                    >
                      <Stack gap="sm">
                        <Text variant="bodyMedium">
                          이 대상을 삭제하시겠습니까?
                        </Text>
                        <Stack direction="row" gap="sm">
                          <Button
                            label={isDeleting ? '삭제 중...' : '삭제'}
                            disabled={isDeleting}
                            onPress={handleDelete}
                          />
                          <Button
                            label="취소"
                            variant="secondary"
                            disabled={isDeleting}
                            onPress={() => setConfirmDelete(false)}
                          />
                        </Stack>
                        {deleteError ? (
                          <Text variant="bodySmall" colorToken="danger">
                            {deleteError}
                          </Text>
                        ) : null}
                      </Stack>
                    </Card>
                  ) : (
                    <Button
                      label="대상 삭제"
                      variant="secondary"
                      disabled={isSaving}
                      onPress={() => {
                        setDeleteError(null);
                        setConfirmDelete(true);
                      }}
                    />
                  )}
                </>
              ) : fromCompatibility ? (
                <>
                  <Button
                    label={isSaving ? '저장 중...' : '저장하고 궁합으로'}
                    disabled={!isFormValid || isSaving}
                    onPress={handleSaveForCompatibility}
                  />
                  {saveError ? (
                    <Text variant="bodySmall" colorToken="danger">
                      {saveError}
                    </Text>
                  ) : null}
                </>
              ) : (
                <>
                  <Button
                    label="상담 시작하기"
                    disabled={!isFormValid || isSaving}
                    onPress={handleStartConsultation}
                  />
                  <Button
                    label={isSaving ? '저장 중...' : '대상으로 저장하고 시작'}
                    variant="secondary"
                    disabled={!isFormValid || isSaving}
                    onPress={handleSaveAndStart}
                  />

                  {saveError ? (
                    <Text variant="bodySmall" colorToken="danger">
                      {saveError}
                    </Text>
                  ) : null}
                </>
              )}
            </Stack>
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
