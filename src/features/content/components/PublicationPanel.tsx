import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';

import { publicationService } from '../services/publicationService';
import type { ContentItem, ContentPublication } from '../types';

const CHANNEL_LABEL: Record<string, string> = {
  web: '웹',
  naver_blog: '네이버 블로그',
  instagram: '인스타그램',
  youtube: '유튜브',
  video: '영상',
};
const STATUS_LABEL: Record<string, string> = {
  draft: '초안',
  scheduled: '예약',
  queued: '대기',
  processing: '처리중',
  published: '발행됨',
  failed: '실패',
  cancelled: '취소',
};

// Builds Naver-optimized export text from the canonical content (no channel
// variant table yet — derived on the fly). The operator copies this and publishes
// to Naver Blog by hand (Naver has no official personal-blog write API), then marks
// it published here. No scraping / browser automation.
function buildNaverExport(item: ContentItem): string {
  return [
    item.title,
    '',
    item.body ?? item.summary ?? '',
    item.tags.length > 0 ? '' : null,
    item.tags.length > 0 ? item.tags.map((t) => `#${t}`).join(' ') : null,
  ]
    .filter((line): line is string => line !== null)
    .join('\n');
}

export function PublicationPanel({ item }: { item: ContentItem }) {
  const [publications, setPublications] = useState<ContentPublication[]>([]);
  const [externalUrl, setExternalUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const exportText = buildNaverExport(item);
  const canCopy = Platform.OS === 'web';

  const loadPublications = useCallback(() => {
    publicationService
      .listByContent(item.id)
      .then(setPublications)
      .catch(() => setPublications([]));
  }, [item.id]);

  useEffect(() => {
    loadPublications();
  }, [loadPublications]);

  const handleCopy = () => {
    if (
      typeof navigator !== 'undefined' &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === 'function'
    ) {
      navigator.clipboard
        .writeText(exportText)
        .then(() => setCopied(true))
        .catch(() => setCopied(false));
    }
  };

  const handleMarkPublished = () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    publicationService
      .recordManualPublish({
        contentId: item.id,
        channel: 'naver_blog',
        provider: 'manual',
        externalUrl: externalUrl.trim() || null,
      })
      .then(() => {
        setExternalUrl('');
        loadPublications();
      })
      .catch(() => setError('발행 기록 저장에 실패했습니다.'))
      .finally(() => setBusy(false));
  };

  return (
    <Stack gap="sm">
      <Text variant="headingMedium">채널 발행</Text>

      {/* Naver Blog — manual publish (no official write API) */}
      <Card>
        <Stack gap="md">
          <Text variant="bodyMedium">네이버 블로그 (수동 발행)</Text>
          <Text variant="caption" colorToken="textSecondary">
            네이버는 개인 블로그 글쓰기 공식 API를 제공하지 않습니다. 아래 내용을
            복사해 네이버 블로그에 직접 게시한 뒤, 게시 URL을 입력하고 발행
            완료로 기록하세요.
          </Text>

          <Input
            label="복사용 콘텐츠"
            value={exportText}
            editable={false}
            multiline
            selectTextOnFocus
            inputStyle={{ minHeight: 160 }}
          />
          {canCopy ? (
            <Button
              label={copied ? '복사됨' : '클립보드에 복사'}
              variant="secondary"
              onPress={handleCopy}
            />
          ) : (
            <Text variant="caption" colorToken="textSecondary">
              위 내용을 길게 눌러 전체 선택 후 복사하세요.
            </Text>
          )}

          <Text variant="caption" colorToken="textSecondary">
            발행 체크리스트: 대표 이미지 첨부 · 카테고리 선택 · 공개 설정 확인 ·
            태그 입력
          </Text>

          <Input
            label="게시 URL (선택)"
            value={externalUrl}
            onChangeText={setExternalUrl}
            placeholder="https://blog.naver.com/..."
            autoCapitalize="none"
          />
          <Button
            label={busy ? '저장 중...' : '발행 완료로 기록'}
            disabled={busy}
            onPress={handleMarkPublished}
          />
          {error ? (
            <Text variant="bodySmall" colorToken="danger">
              {error}
            </Text>
          ) : null}
        </Stack>
      </Card>

      {/* Publication history (all channels) */}
      {publications.length > 0 ? (
        <Card>
          <Stack gap="sm">
            <Text variant="bodyMedium">발행 이력</Text>
            {publications.map((p) => (
              <Stack key={p.id} gap="xs">
                <Stack direction="row" gap="sm" align="center">
                  <Text variant="bodySmall">
                    {CHANNEL_LABEL[p.channel] ?? p.channel}
                  </Text>
                  <Text variant="caption" colorToken="textSecondary">
                    {STATUS_LABEL[p.status] ?? p.status}
                    {p.publishedAt
                      ? ` · ${p.publishedAt.slice(0, 16).replace('T', ' ')}`
                      : ''}
                    {p.provider ? ` · ${p.provider}` : ''}
                  </Text>
                </Stack>
                {p.externalUrl ? (
                  <Text variant="caption" colorToken="textSecondary">
                    {p.externalUrl}
                  </Text>
                ) : null}
              </Stack>
            ))}
          </Stack>
        </Card>
      ) : null}
    </Stack>
  );
}
