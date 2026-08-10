import { useState } from 'react';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { AdminSelect } from '@/features/admin';
import { canonicalForFamous } from '@/features/publicSite';
import type {
  ApproximateTimePeriod,
  BirthInfoDraft,
  BirthTimeAccuracy,
  CalendarType,
  Gender,
  LunarMonthType,
} from '@/features/consultation';

import { FamousAiPanel } from './FamousAiPanel';
import type {
  FamousBirthSource,
  FamousIndexPolicy,
  FamousInput,
  FamousProfile,
  FamousStatus,
} from '../types';

// Create/edit form for a Famous profile. Reuses the canonical BirthInfoDraft
// contract for birth data (no astrology calculation here). Presentation/service
// only — persistence + admin authorization live in famousService + RLS.

const STATUS_OPTIONS = [
  { value: 'draft' as FamousStatus, label: '초안' },
  { value: 'published' as FamousStatus, label: '공개' },
  { value: 'archived' as FamousStatus, label: '보관' },
];
const VISIBILITY_OPTIONS = [
  { value: 'private' as const, label: '비공개' },
  { value: 'public' as const, label: '공개' },
];
const BIRTH_SOURCE_OPTIONS = [
  { value: 'confirmed' as FamousBirthSource, label: '확인됨' },
  { value: 'reported' as FamousBirthSource, label: '보도' },
  { value: 'estimated' as FamousBirthSource, label: '추정' },
  { value: 'unknown' as FamousBirthSource, label: '모름' },
];
const INDEX_OPTIONS = [
  { value: 'index' as FamousIndexPolicy, label: 'index' },
  { value: 'noindex' as FamousIndexPolicy, label: 'noindex' },
];
const GENDER_OPTIONS = [
  { value: 'male' as Gender, label: '남성' },
  { value: 'female' as Gender, label: '여성' },
];
const CALENDAR_OPTIONS = [
  { value: 'solar' as CalendarType, label: '양력' },
  { value: 'lunar' as CalendarType, label: '음력' },
];
const LUNAR_MONTH_OPTIONS = [
  { value: 'regular' as LunarMonthType, label: '평달' },
  { value: 'leap' as LunarMonthType, label: '윤달' },
];
const TIME_ACCURACY_OPTIONS = [
  { value: 'exact' as BirthTimeAccuracy, label: '정확' },
  { value: 'approximate' as BirthTimeAccuracy, label: '대략' },
  { value: 'unknown' as BirthTimeAccuracy, label: '모름' },
];
const APPROX_PERIOD_OPTIONS = [
  { value: 'dawn' as ApproximateTimePeriod, label: '새벽' },
  { value: 'morning' as ApproximateTimePeriod, label: '오전' },
  { value: 'afternoon' as ApproximateTimePeriod, label: '오후' },
  { value: 'evening' as ApproximateTimePeriod, label: '저녁' },
  { value: 'night' as ApproximateTimePeriod, label: '밤' },
];

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function FamousEditor({
  initial,
  submitting,
  errorMessage,
  onSubmit,
  onArchive,
}: {
  initial: FamousProfile | null;
  submitting: boolean;
  errorMessage: string | null;
  onSubmit: (input: FamousInput) => void;
  onArchive?: () => void;
}) {
  const b = initial?.birthInfo ?? null;

  const [name, setName] = useState(initial?.name ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [occupation, setOccupation] = useState(initial?.occupation ?? '');
  const [shortDescription, setShortDescription] = useState(
    initial?.shortDescription ?? '',
  );
  const [bio, setBio] = useState(initial?.bio ?? '');
  const [status, setStatus] = useState<FamousStatus>(initial?.status ?? 'draft');
  const [visibility, setVisibility] = useState<'private' | 'public'>(
    initial?.isPublic ? 'public' : 'private',
  );
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle ?? '');
  const [seoDescription, setSeoDescription] = useState(
    initial?.seoDescription ?? '',
  );
  const [canonicalUrl, setCanonicalUrl] = useState(initial?.canonicalUrl ?? '');
  const [indexPolicy, setIndexPolicy] = useState<FamousIndexPolicy>(
    initial?.indexPolicy ?? 'noindex',
  );
  const [birthSource, setBirthSource] = useState<FamousBirthSource>(
    initial?.birthSource ?? 'unknown',
  );
  const [birthSourceNote, setBirthSourceNote] = useState(
    initial?.birthSourceNote ?? '',
  );

  // Birth info (canonical BirthInfoDraft fields).
  const [gender, setGender] = useState<Gender | null>(b?.gender ?? null);
  const [calendarType, setCalendarType] = useState<CalendarType | null>(
    b?.calendarType ?? null,
  );
  const [lunarMonthType, setLunarMonthType] = useState<LunarMonthType | null>(
    b?.lunarMonthType ?? null,
  );
  const [birthYear, setBirthYear] = useState(b?.birthYear ?? '');
  const [birthMonth, setBirthMonth] = useState(b?.birthMonth ?? '');
  const [birthDay, setBirthDay] = useState(b?.birthDay ?? '');
  const [birthTimeAccuracy, setBirthTimeAccuracy] =
    useState<BirthTimeAccuracy | null>(b?.birthTimeAccuracy ?? null);
  const [birthHour, setBirthHour] = useState(b?.birthHour ?? '');
  const [birthMinute, setBirthMinute] = useState(b?.birthMinute ?? '');
  const [approximateTimePeriod, setApproximateTimePeriod] =
    useState<ApproximateTimePeriod | null>(b?.approximateTimePeriod ?? null);
  const [birthPlace, setBirthPlace] = useState(b?.birthPlace ?? '');

  const [localError, setLocalError] = useState<string | null>(null);

  const buildBirthInfo = (): BirthInfoDraft | null => {
    if (!calendarType || !birthYear || !birthMonth || !birthDay) {
      return null;
    }
    return {
      displayName: name.trim() || '유명인',
      gender,
      calendarType,
      lunarMonthType: calendarType === 'lunar' ? lunarMonthType : null,
      birthYear: birthYear.trim(),
      birthMonth: birthMonth.trim(),
      birthDay: birthDay.trim(),
      birthTimeAccuracy,
      birthHour: birthTimeAccuracy === 'exact' ? birthHour.trim() : '',
      birthMinute: birthTimeAccuracy === 'exact' ? birthMinute.trim() : '',
      approximateTimePeriod:
        birthTimeAccuracy === 'approximate' ? approximateTimePeriod : null,
      birthPlace: birthPlace.trim(),
    };
  };

  const handleSubmit = () => {
    const trimmedName = name.trim();
    const trimmedSlug = slug.trim().toLowerCase();
    if (trimmedName.length === 0) {
      setLocalError('이름을 입력해 주세요.');
      return;
    }
    if (!SLUG_PATTERN.test(trimmedSlug)) {
      setLocalError('slug은 소문자/숫자/하이픈만 사용할 수 있습니다. 예) hong-gildong');
      return;
    }
    setLocalError(null);
    onSubmit({
      name: trimmedName,
      slug: trimmedSlug,
      category: category.trim() || null,
      occupation: occupation.trim() || null,
      shortDescription: shortDescription.trim() || null,
      bio: bio.trim() || null,
      birthInfo: buildBirthInfo(),
      birthSource,
      birthSourceNote: birthSourceNote.trim() || null,
      status,
      isPublic: visibility === 'public',
      seoTitle: seoTitle.trim() || null,
      seoDescription: seoDescription.trim() || null,
      canonicalUrl: canonicalUrl.trim() || null,
      indexPolicy,
    });
  };

  // Birth data as interpretation context only (never asserted as biography).
  const birthSummary =
    birthYear && birthMonth && birthDay
      ? [
          `${birthYear}-${birthMonth}-${birthDay}`,
          calendarType === 'lunar' ? '음력' : calendarType === 'solar' ? '양력' : '',
          birthPlace.trim(),
        ]
          .filter((p) => p.length > 0)
          .join(' ')
      : null;

  return (
    <Stack gap="xl">
      <FamousAiPanel
        famousId={initial?.id ?? null}
        name={name}
        occupation={occupation}
        category={category}
        birthSummary={birthSummary}
        onApplyOneLiner={setShortDescription}
        onApplyIntroduction={setBio}
        onApplySeoTitle={setSeoTitle}
        onApplySeoDescription={setSeoDescription}
        onApplySlug={(s) => setSlug(s.toLowerCase())}
        onApplyIndexPolicy={setIndexPolicy}
      />

      <Stack gap="sm">
        <Text variant="headingMedium">기본 정보</Text>
        <Card>
          <Stack gap="md">
            <Input label="이름" value={name} onChangeText={setName} required />
            <Input
              label="slug (URL)"
              value={slug}
              onChangeText={setSlug}
              placeholder="hong-gildong"
              autoCapitalize="none"
              required
            />
            <Input label="분류" value={category} onChangeText={setCategory} />
            <Input
              label="직업"
              value={occupation}
              onChangeText={setOccupation}
            />
            <Input
              label="한 줄 소개"
              value={shortDescription}
              onChangeText={setShortDescription}
            />
            <Input label="소개" value={bio} onChangeText={setBio} multiline />
            <AdminSelect
              label="상태"
              options={STATUS_OPTIONS}
              value={status}
              onChange={setStatus}
            />
            <AdminSelect
              label="공개 여부"
              options={VISIBILITY_OPTIONS}
              value={visibility}
              onChange={setVisibility}
            />
          </Stack>
        </Card>
      </Stack>

      <Stack gap="sm">
        <Text variant="headingMedium">출생 정보</Text>
        <Card>
          <Stack gap="md">
            <AdminSelect
              label="성별"
              options={GENDER_OPTIONS}
              value={gender}
              onChange={setGender}
            />
            <AdminSelect
              label="달력"
              options={CALENDAR_OPTIONS}
              value={calendarType}
              onChange={(v) => {
                setCalendarType(v);
                if (v === 'solar') setLunarMonthType(null);
              }}
            />
            {calendarType === 'lunar' ? (
              <AdminSelect
                label="윤달 구분"
                options={LUNAR_MONTH_OPTIONS}
                value={lunarMonthType}
                onChange={setLunarMonthType}
              />
            ) : null}
            <Stack direction="row" gap="sm">
              <Input
                label="연"
                value={birthYear}
                onChangeText={setBirthYear}
                keyboardType="number-pad"
                maxLength={4}
                style={{ flex: 1 }}
              />
              <Input
                label="월"
                value={birthMonth}
                onChangeText={setBirthMonth}
                keyboardType="number-pad"
                maxLength={2}
                style={{ flex: 1 }}
              />
              <Input
                label="일"
                value={birthDay}
                onChangeText={setBirthDay}
                keyboardType="number-pad"
                maxLength={2}
                style={{ flex: 1 }}
              />
            </Stack>
            <AdminSelect
              label="출생시간 정확도"
              options={TIME_ACCURACY_OPTIONS}
              value={birthTimeAccuracy}
              onChange={(v) => {
                setBirthTimeAccuracy(v);
                if (v !== 'exact') {
                  setBirthHour('');
                  setBirthMinute('');
                }
                if (v !== 'approximate') setApproximateTimePeriod(null);
              }}
            />
            {birthTimeAccuracy === 'exact' ? (
              <Stack direction="row" gap="sm">
                <Input
                  label="시"
                  value={birthHour}
                  onChangeText={setBirthHour}
                  keyboardType="number-pad"
                  maxLength={2}
                  style={{ flex: 1 }}
                />
                <Input
                  label="분"
                  value={birthMinute}
                  onChangeText={setBirthMinute}
                  keyboardType="number-pad"
                  maxLength={2}
                  style={{ flex: 1 }}
                />
              </Stack>
            ) : null}
            {birthTimeAccuracy === 'approximate' ? (
              <AdminSelect
                label="시간대"
                options={APPROX_PERIOD_OPTIONS}
                value={approximateTimePeriod}
                onChange={setApproximateTimePeriod}
              />
            ) : null}
            <Input
              label="출생지"
              value={birthPlace}
              onChangeText={setBirthPlace}
            />
            <AdminSelect
              label="출생정보 출처"
              options={BIRTH_SOURCE_OPTIONS}
              value={birthSource}
              onChange={setBirthSource}
            />
            <Input
              label="출처 메모"
              value={birthSourceNote}
              onChangeText={setBirthSourceNote}
            />
          </Stack>
        </Card>
      </Stack>

      <Stack gap="sm">
        <Text variant="headingMedium">SEO</Text>
        <Card>
          <Stack gap="md">
            <Input
              label="SEO 제목"
              value={seoTitle}
              onChangeText={setSeoTitle}
            />
            <Input
              label="SEO 설명"
              value={seoDescription}
              onChangeText={setSeoDescription}
              multiline
            />
            <Input
              label="Canonical URL (선택 — 비우면 자동 생성)"
              value={canonicalUrl}
              onChangeText={setCanonicalUrl}
              placeholder="비우면 자동"
              autoCapitalize="none"
            />
            <Text variant="caption" colorToken="textSecondary">
              {canonicalUrl.trim().length > 0
                ? '직접 지정한 값이 사용됩니다.'
                : `자동: ${
                    canonicalForFamous(slug.trim().toLowerCase()) ??
                    'PUBLIC_BASE_URL 미설정 — 배포 후 자동 생성됩니다.'
                  }`}
            </Text>
            <AdminSelect
              label="색인 정책"
              options={INDEX_OPTIONS}
              value={indexPolicy}
              onChange={setIndexPolicy}
            />
          </Stack>
        </Card>
      </Stack>

      {localError || errorMessage ? (
        <Text variant="bodySmall" colorToken="danger">
          {localError ?? errorMessage}
        </Text>
      ) : null}

      <Stack direction="row" gap="sm" style={{ flexWrap: 'wrap' }}>
        <Button
          label={submitting ? '저장 중...' : '저장'}
          disabled={submitting}
          onPress={handleSubmit}
        />
        {onArchive ? (
          <Button
            label="보관"
            variant="secondary"
            disabled={submitting}
            onPress={onArchive}
          />
        ) : null}
      </Stack>
    </Stack>
  );
}
