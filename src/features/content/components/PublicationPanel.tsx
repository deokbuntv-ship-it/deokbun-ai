import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { AdminSelect } from '@/features/admin';

import { buildInstagramCaption, validateInstagram } from '../instagram';
import { providerConnectionService } from '../services/providerConnectionService';
import { publicationService } from '../services/publicationService';
import type {
  ContentItem,
  ContentPublication,
  ProviderConnection,
  PublicationChannel,
} from '../types';

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
const SCHEDULE_CHANNEL_OPTIONS = [
  { value: 'naver_blog' as PublicationChannel, label: '네이버 블로그' },
  { value: 'instagram' as PublicationChannel, label: '인스타그램' },
  { value: 'youtube' as PublicationChannel, label: '유튜브' },
  { value: 'video' as PublicationChannel, label: '영상' },
];

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

function webCopy(text: string, onDone: () => void) {
  if (
    typeof navigator !== 'undefined' &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === 'function'
  ) {
    navigator.clipboard.writeText(text).then(onDone).catch(() => {});
  }
}

export function PublicationPanel({ item }: { item: ContentItem }) {
  const [publications, setPublications] = useState<ContentPublication[]>([]);
  const [igConnection, setIgConnection] = useState<ProviderConnection | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Naver
  const [naverUrl, setNaverUrl] = useState('');
  const [naverCopied, setNaverCopied] = useState(false);
  const naverExport = buildNaverExport(item);

  // Instagram
  const [igUrl, setIgUrl] = useState('');
  const [igCopied, setIgCopied] = useState(false);
  const igCaption = buildInstagramCaption(item);
  const igWarnings = validateInstagram(igCaption, Boolean(item.heroImageUrl));

  // Schedule
  const [scheduleChannel, setScheduleChannel] =
    useState<PublicationChannel>('naver_blog');
  const [scheduleAt, setScheduleAt] = useState('');

  const canCopy = Platform.OS === 'web';

  const loadPublications = useCallback(() => {
    publicationService
      .listByContent(item.id)
      .then(setPublications)
      .catch(() => setPublications([]));
  }, [item.id]);

  useEffect(() => {
    loadPublications();
    providerConnectionService
      .getStatus('instagram')
      .then(setIgConnection)
      .catch(() => setIgConnection(null));
  }, [loadPublications]);

  const markPublished = (
    channel: PublicationChannel,
    externalUrl: string,
    reset: () => void,
  ) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    publicationService
      .recordManualPublish({
        contentId: item.id,
        channel,
        provider: 'manual',
        externalUrl: externalUrl.trim() || null,
      })
      .then(() => {
        reset();
        loadPublications();
      })
      .catch(() => setError('발행 기록 저장에 실패했습니다.'))
      .finally(() => setBusy(false));
  };

  const handleSchedule = () => {
    if (busy) return;
    const iso = scheduleAt.trim().replace(' ', 'T');
    const parsed = new Date(iso);
    if (scheduleAt.trim().length === 0 || Number.isNaN(parsed.getTime())) {
      setError('예약 시각을 YYYY-MM-DD HH:mm 형식으로 입력해 주세요.');
      return;
    }
    setBusy(true);
    setError(null);
    publicationService
      .schedulePublication({
        contentId: item.id,
        channel: scheduleChannel,
        scheduledAt: parsed.toISOString(),
        provider: 'manual',
      })
      .then(() => {
        setScheduleAt('');
        loadPublications();
      })
      .catch(() => setError('예약 저장에 실패했습니다.'))
      .finally(() => setBusy(false));
  };

  const igStatusLabel =
    igConnection && igConnection.status === 'connected'
      ? `연결됨 (${igConnection.externalAccountName ?? '계정'})`
      : 'OAUTH_REQUIRED (Meta 앱/App Review 필요)';

  return (
    <Stack gap="sm">
      <Text variant="headingMedium">채널 발행</Text>

      {/* Naver Blog — manual publish */}
      <Card>
        <Stack gap="md">
          <Text variant="bodyMedium">네이버 블로그 (수동 발행)</Text>
          <Text variant="caption" colorToken="textSecondary">
            네이버는 개인 블로그 글쓰기 공식 API가 없습니다. 아래 내용을 복사해
            직접 게시한 뒤 URL을 입력하고 발행 완료로 기록하세요.
          </Text>
          <Input
            label="복사용 콘텐츠"
            value={naverExport}
            editable={false}
            multiline
            selectTextOnFocus
            inputStyle={{ minHeight: 140 }}
          />
          {canCopy ? (
            <Button
              label={naverCopied ? '복사됨' : '클립보드에 복사'}
              variant="secondary"
              onPress={() => webCopy(naverExport, () => setNaverCopied(true))}
            />
          ) : null}
          <Input
            label="게시 URL (선택)"
            value={naverUrl}
            onChangeText={setNaverUrl}
            placeholder="https://blog.naver.com/..."
            autoCapitalize="none"
          />
          <Button
            label={busy ? '저장 중...' : '네이버 발행 완료로 기록'}
            disabled={busy}
            onPress={() =>
              markPublished('naver_blog', naverUrl, () => setNaverUrl(''))
            }
          />
        </Stack>
      </Card>

      {/* Instagram — Meta Graph API (gated) + manual fallback */}
      <Card>
        <Stack gap="md">
          <Text variant="bodyMedium">인스타그램</Text>
          <Text variant="caption" colorToken="textSecondary">
            상태: {igStatusLabel}. 공식 API 발행에는 Meta 앱·전문계정·App Review가
            필요합니다(소유자 작업). 그 전까지는 아래 캡션으로 직접 게시 후 기록하세요.
          </Text>
          {igWarnings.map((w, idx) => (
            <Text key={idx} variant="caption" colorToken="danger">
              • {w}
            </Text>
          ))}
          <Input
            label="캡션"
            value={igCaption}
            editable={false}
            multiline
            selectTextOnFocus
            inputStyle={{ minHeight: 120 }}
          />
          {canCopy ? (
            <Button
              label={igCopied ? '복사됨' : '캡션 복사'}
              variant="secondary"
              onPress={() => webCopy(igCaption, () => setIgCopied(true))}
            />
          ) : null}
          <Input
            label="게시 URL (선택)"
            value={igUrl}
            onChangeText={setIgUrl}
            placeholder="https://www.instagram.com/p/..."
            autoCapitalize="none"
          />
          <Button
            label={busy ? '저장 중...' : '인스타그램 발행 완료로 기록'}
            disabled={busy}
            onPress={() =>
              markPublished('instagram', igUrl, () => setIgUrl(''))
            }
          />
        </Stack>
      </Card>

      {/* Scheduling (persistence only; execution is DEPLOY_REQUIRED) */}
      <Card>
        <Stack gap="md">
          <Text variant="bodyMedium">예약</Text>
          <Text variant="caption" colorToken="textSecondary">
            예약 정보만 저장합니다. 실제 자동 실행(pg_cron→Edge)은 배포/소유자 승인
            후 활성화됩니다. 예약이 곧 자동 발행을 의미하지 않습니다.
          </Text>
          <AdminSelect
            label="채널"
            options={SCHEDULE_CHANNEL_OPTIONS}
            value={scheduleChannel}
            onChange={setScheduleChannel}
          />
          <Input
            label="예약 시각 (YYYY-MM-DD HH:mm)"
            value={scheduleAt}
            onChangeText={setScheduleAt}
            placeholder="2026-08-15 09:00"
            autoCapitalize="none"
          />
          <Button
            label={busy ? '저장 중...' : '예약 저장'}
            disabled={busy}
            onPress={handleSchedule}
          />
        </Stack>
      </Card>

      {error ? (
        <Text variant="bodySmall" colorToken="danger">
          {error}
        </Text>
      ) : null}

      {publications.length > 0 ? (
        <Card>
          <Stack gap="sm">
            <Text variant="bodyMedium">발행/예약 이력</Text>
            {publications.map((p) => (
              <Stack key={p.id} gap="xs">
                <Stack direction="row" gap="sm" align="center">
                  <Text variant="bodySmall">
                    {CHANNEL_LABEL[p.channel] ?? p.channel}
                  </Text>
                  <Text variant="caption" colorToken="textSecondary">
                    {STATUS_LABEL[p.status] ?? p.status}
                    {p.scheduledAt
                      ? ` · 예약 ${p.scheduledAt.slice(0, 16).replace('T', ' ')}`
                      : ''}
                    {p.publishedAt
                      ? ` · 발행 ${p.publishedAt.slice(0, 16).replace('T', ' ')}`
                      : ''}
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
