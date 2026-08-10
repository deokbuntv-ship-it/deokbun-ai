import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { AdminSearchInput, AdminSelect } from '@/features/admin';
import { famousService, type FamousListItem } from '@/features/famous';
import { CONTENT_CATEGORIES } from '@/features/publicSite';

import type {
  ContentChannel,
  ContentInput,
  ContentItem,
  ContentSourceType,
  ContentStatus,
} from '../types';

const CHANNEL_OPTIONS = [
  { value: 'generic' as ContentChannel, label: '일반' },
  { value: 'naver_blog' as ContentChannel, label: '네이버 블로그' },
  { value: 'instagram' as ContentChannel, label: '인스타그램' },
  { value: 'youtube' as ContentChannel, label: '유튜브' },
  { value: 'video' as ContentChannel, label: '영상' },
];
const SOURCE_OPTIONS = [
  { value: 'operator' as ContentSourceType, label: '운영자 주제' },
  { value: 'famous' as ContentSourceType, label: '유명인' },
  { value: 'topic' as ContentSourceType, label: '일반 주제' },
];
// Operator-editable status subset (generating/publish_pending/failed are set by
// system flows: CONTENT-02 generation, CONTENT-07 publishing).
const STATUS_OPTIONS = [
  { value: 'draft' as ContentStatus, label: '초안' },
  { value: 'ready' as ContentStatus, label: '준비완료' },
  { value: 'published' as ContentStatus, label: '발행' },
  { value: 'cancelled' as ContentStatus, label: '취소' },
];

const CATEGORY_OPTIONS = [
  { value: '', label: '미분류' },
  ...CONTENT_CATEGORIES.map((c) => ({ value: c.slug, label: c.label })),
];

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Inline famous picker (search + select). Uses famousService (admin RLS).
function FamousPicker({
  selectedLabel,
  onSelect,
}: {
  selectedLabel: string | null;
  onSelect: (id: string, label: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FamousListItem[]>([]);
  const [searching, setSearching] = useState(false);

  const run = () => {
    setSearching(true);
    famousService
      .listFamous({ search: query.trim(), limit: 10, offset: 0 })
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setSearching(false));
  };

  return (
    <Stack gap="sm">
      <Text variant="bodySmall" colorToken="textSecondary">
        {selectedLabel ? `선택됨: ${selectedLabel}` : '유명인을 검색해 선택하세요.'}
      </Text>
      <AdminSearchInput
        value={query}
        onChangeText={setQuery}
        onSubmit={run}
        placeholder="유명인 이름/slug 검색"
      />
      {searching ? (
        <Text variant="caption" colorToken="textSecondary">
          검색 중...
        </Text>
      ) : (
        results.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => onSelect(item.id, item.name)}
            accessibilityRole="button"
          >
            <View style={{ paddingVertical: 6 }}>
              <Text variant="bodySmall">
                {item.name}{' '}
                <Text variant="caption" colorToken="textSecondary">
                  ({item.slug})
                </Text>
              </Text>
            </View>
          </Pressable>
        ))
      )}
    </Stack>
  );
}

export function ContentEditor({
  initial,
  initialFamousLabel,
  submitting,
  errorMessage,
  onSubmit,
  onCancel,
}: {
  initial: ContentItem | null;
  initialFamousLabel?: string | null;
  submitting: boolean;
  errorMessage: string | null;
  onSubmit: (input: ContentInput) => void;
  onCancel?: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [channel, setChannel] = useState<ContentChannel>(
    initial?.channel ?? 'generic',
  );
  const [sourceType, setSourceType] = useState<ContentSourceType>(
    initial?.sourceType ?? 'operator',
  );
  const [famousId, setFamousId] = useState<string | null>(
    initial?.famousId ?? null,
  );
  const [famousLabel, setFamousLabel] = useState<string | null>(
    initialFamousLabel ?? null,
  );
  const [status, setStatus] = useState<ContentStatus>(initial?.status ?? 'draft');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [body, setBody] = useState(initial?.body ?? '');
  const [summary, setSummary] = useState(initial?.summary ?? '');
  const [tagsText, setTagsText] = useState((initial?.tags ?? []).join(', '));
  const [localError, setLocalError] = useState<string | null>(null);

  // Operator status subset; preserve non-subset statuses (e.g. generating) as-is.
  const statusOptionValue: ContentStatus =
    status === 'draft' ||
    status === 'ready' ||
    status === 'published' ||
    status === 'cancelled'
      ? status
      : 'draft';

  const handleSubmit = () => {
    if (title.trim().length === 0) {
      setLocalError('제목을 입력해 주세요.');
      return;
    }
    if (sourceType === 'famous' && !famousId) {
      setLocalError('유명인 소스를 선택해 주세요.');
      return;
    }
    const trimmedSlug = slug.trim();
    if (trimmedSlug.length > 0 && !SLUG_PATTERN.test(trimmedSlug)) {
      setLocalError('slug는 영문 소문자/숫자/하이픈만 사용할 수 있습니다.');
      return;
    }
    // Publishing requires a slug (public URL) — fail-closed, no invisible publish.
    if (statusOptionValue === 'published' && trimmedSlug.length === 0) {
      setLocalError('발행하려면 slug가 필요합니다.');
      return;
    }
    setLocalError(null);
    onSubmit({
      title: title.trim(),
      channel,
      sourceType,
      famousId: sourceType === 'famous' ? famousId : null,
      status: statusOptionValue,
      slug: trimmedSlug || null,
      category: category || null,
      body: body.trim() || null,
      summary: summary.trim() || null,
      tags: tagsText
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0),
    });
  };

  return (
    <Stack gap="xl">
      <Stack gap="sm">
        <Text variant="headingMedium">콘텐츠</Text>
        <Card>
          <Stack gap="md">
            <Input label="제목" value={title} onChangeText={setTitle} required />
            <AdminSelect
              label="채널"
              options={CHANNEL_OPTIONS}
              value={channel}
              onChange={setChannel}
            />
            <AdminSelect
              label="소스"
              options={SOURCE_OPTIONS}
              value={sourceType}
              onChange={(v) => {
                setSourceType(v);
                if (v !== 'famous') {
                  setFamousId(null);
                  setFamousLabel(null);
                }
              }}
            />
            {sourceType === 'famous' ? (
              <FamousPicker
                selectedLabel={famousLabel}
                onSelect={(id, label) => {
                  setFamousId(id);
                  setFamousLabel(label);
                }}
              />
            ) : null}
            <AdminSelect
              label="상태"
              options={STATUS_OPTIONS}
              value={statusOptionValue}
              onChange={setStatus}
            />
            <AdminSelect
              label="카테고리"
              options={CATEGORY_OPTIONS}
              value={category}
              onChange={setCategory}
            />
            <Input
              label="slug (공개 URL)"
              value={slug}
              onChangeText={setSlug}
              placeholder="예) jo-seyoung-2026"
              autoCapitalize="none"
            />
            <Text variant="caption" colorToken="textSecondary">
              발행(published) 시 /content/{'{slug}'} 로 공개됩니다. slug는 영문
              소문자·숫자·하이픈만 사용합니다.
            </Text>
          </Stack>
        </Card>
      </Stack>

      <Stack gap="sm">
        <Text variant="headingMedium">본문</Text>
        <Card>
          <Stack gap="md">
            <Input
              label="본문"
              value={body}
              onChangeText={setBody}
              multiline
              inputStyle={{ minHeight: 160 }}
            />
            <Input
              label="요약"
              value={summary}
              onChangeText={setSummary}
              multiline
            />
            <Input
              label="태그 (쉼표로 구분)"
              value={tagsText}
              onChangeText={setTagsText}
              placeholder="예) 사주, 운세, 유명인"
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
        {onCancel ? (
          <Button
            label="취소 처리"
            variant="secondary"
            disabled={submitting}
            onPress={onCancel}
          />
        ) : null}
      </Stack>
    </Stack>
  );
}
