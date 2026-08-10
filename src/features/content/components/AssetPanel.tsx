import { Image } from 'expo-image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { AdminSelect, confirmDestructive } from '@/features/admin';

import { imageWorkloadStatus, videoWorkloadStatus } from '../assetProviders';
import { assetService } from '../services/assetService';
import {
  imageGenerationService,
  suggestImageSubject,
} from '../services/imageGenerationService';
import {
  videoGenerationService,
  suggestVideoSubject,
} from '../services/videoGenerationService';
import type {
  AssetKind,
  ContentAsset,
  ContentItem,
  ImageAspectRatio,
  VideoAspectRatio,
} from '../types';

const VIDEO_ASPECT_OPTIONS = [
  { value: '9:16' as VideoAspectRatio, label: '9:16 (쇼츠/릴스)' },
  { value: '16:9' as VideoAspectRatio, label: '16:9 (가로)' },
];
const VIDEO_POLL_MAX = 40; // bounded: ~40 × 9s ≈ 6분
const VIDEO_POLL_INTERVAL_MS = 9000;

const KIND_OPTIONS = [
  { value: 'image' as AssetKind, label: '이미지' },
  { value: 'video' as AssetKind, label: '영상' },
];
const ASPECT_OPTIONS = [
  { value: '16:9' as ImageAspectRatio, label: '16:9 (웹/대표)' },
  { value: '4:5' as ImageAspectRatio, label: '4:5 (인스타)' },
  { value: '1:1' as ImageAspectRatio, label: '1:1 (카드)' },
];
const IMG_ERROR_LABEL: Record<string, string> = {
  IMAGE_GENERATION_INCOMPLETE: '이미지가 생성되었지만 저장에 실패했습니다.',
  PROVIDER_NOT_CONFIGURED: '이미지 provider가 설정되지 않았습니다.',
};

// http(s)-only URL guard (no javascript:/data: etc.).
function isSafeUrl(url: string): boolean {
  return /^https?:\/\/\S+$/.test(url.trim());
}

export function AssetPanel({
  item,
  onHeroChanged,
}: {
  item: ContentItem;
  onHeroChanged: () => void;
}) {
  const [assets, setAssets] = useState<ContentAsset[]>([]);
  const [kind, setKind] = useState<AssetKind>('image');
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI image generation (IMAGE_STANDARD)
  const [aspect, setAspect] = useState<ImageAspectRatio>('16:9');
  const [subject, setSubject] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ url: string; width: number | null } | null>(
    null,
  );

  // AI video generation (VIDEO_STANDARD, async)
  const [videoAspect, setVideoAspect] = useState<VideoAspectRatio>('9:16');
  const [videoSubject, setVideoSubject] = useState('');
  const [videoStatus, setVideoStatus] = useState<
    'idle' | 'processing' | 'completed' | 'failed'
  >('idle');
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollAttemptsRef = useRef(0);

  useEffect(
    () => () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    },
    [],
  );

  const load = useCallback(() => {
    assetService
      .listByContent(item.id)
      .then(setAssets)
      .catch(() => setAssets([]));
  }, [item.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAttach = () => {
    if (busy) return;
    if (!isSafeUrl(url)) {
      setError('http(s) URL을 입력해 주세요.');
      return;
    }
    setBusy(true);
    setError(null);
    assetService
      .attachManual({ contentId: item.id, kind, externalUrl: url.trim() })
      .then(() => {
        setUrl('');
        load();
      })
      .catch(() => setError('첨부에 실패했습니다.'))
      .finally(() => setBusy(false));
  };

  const setHero = (heroUrl: string | null) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    assetService
      .setContentHero(item.id, heroUrl)
      .then(() => onHeroChanged())
      .catch(() => setError('대표 이미지 설정에 실패했습니다.'))
      .finally(() => setBusy(false));
  };

  // In-flight lock prevents double-charge from repeated clicks (§18). Each call
  // creates a NEW asset; the existing hero is untouched until the operator applies.
  const handleGenerateImage = () => {
    if (generating) return;
    setGenerating(true);
    setGenError(null);
    imageGenerationService
      .generate({
        contentId: item.id,
        workload: 'IMAGE_STANDARD',
        aspectRatio: aspect,
        subject: subject.trim() || suggestImageSubject(item),
        category: item.category,
        targetUse: 'content hero',
      })
      .then((res) => {
        setPreview({ url: res.asset.externalUrl ?? '', width: res.asset.width });
        load();
      })
      .catch((e: unknown) => {
        const code = e instanceof Error ? e.message : 'IMAGE_GENERATION_FAILED';
        setGenError(
          IMG_ERROR_LABEL[code] ??
            'AI 이미지 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.',
        );
      })
      .finally(() => setGenerating(false));
  };

  // Bounded polling of the async video job (no infinite loop; §28).
  const pollVideo = useCallback((assetId: string) => {
    pollAttemptsRef.current += 1;
    videoGenerationService
      .pollStatus(assetId)
      .then((res) => {
        if (res.status === 'completed') {
          setVideoStatus('completed');
          setVideoPreviewUrl(res.externalUrl);
          load();
          return;
        }
        if (res.status === 'failed') {
          setVideoStatus('failed');
          setVideoError('영상 생성에 실패했습니다.');
          return;
        }
        if (pollAttemptsRef.current >= VIDEO_POLL_MAX) {
          setVideoStatus('failed');
          setVideoError('영상 생성이 시간 내에 완료되지 않았습니다 (TIMEOUT).');
          return;
        }
        pollTimerRef.current = setTimeout(
          () => pollVideo(assetId),
          VIDEO_POLL_INTERVAL_MS,
        );
      })
      .catch(() => {
        if (pollAttemptsRef.current >= VIDEO_POLL_MAX) {
          setVideoStatus('failed');
          setVideoError('영상 상태 확인에 실패했습니다.');
          return;
        }
        pollTimerRef.current = setTimeout(
          () => pollVideo(assetId),
          VIDEO_POLL_INTERVAL_MS,
        );
      });
  }, [load]);

  // Cost safety: explicit confirmation + in-flight lock (video is expensive).
  const handleGenerateVideo = async () => {
    if (videoStatus === 'processing') return;
    const ok = await confirmDestructive(
      'AI 영상 생성은 이미지보다 비용이 큽니다. 1건을 생성할까요?',
    );
    if (!ok) return;
    setVideoStatus('processing');
    setVideoError(null);
    setVideoPreviewUrl(null);
    pollAttemptsRef.current = 0;
    try {
      const started = await videoGenerationService.start({
        contentId: item.id,
        workload: 'VIDEO_STANDARD',
        aspectRatio: videoAspect,
        subject: videoSubject.trim() || suggestVideoSubject(item),
        category: item.category,
        targetUse: 'content video',
      });
      pollTimerRef.current = setTimeout(
        () => pollVideo(started.asset.id),
        VIDEO_POLL_INTERVAL_MS,
      );
    } catch {
      setVideoStatus('failed');
      setVideoError(
        'AI 영상 생성을 시작하지 못했습니다. 관리자 권한/서버 설정(GEMINI_API_KEY·Edge 배포)을 확인해 주세요.',
      );
    }
  };

  const applyVideo = () => {
    if (!videoPreviewUrl || busy) return;
    setBusy(true);
    setError(null);
    assetService
      .setContentVideo(item.id, videoPreviewUrl)
      .then(() => onHeroChanged())
      .catch(() => setError('대표 영상 설정에 실패했습니다.'))
      .finally(() => setBusy(false));
  };

  const clearVideo = () => {
    if (busy) return;
    setBusy(true);
    assetService
      .setContentVideo(item.id, null)
      .then(() => onHeroChanged())
      .catch(() => setError('영상 해제에 실패했습니다.'))
      .finally(() => setBusy(false));
  };

  return (
    <Stack gap="sm">
      <Text variant="headingMedium">미디어</Text>

      <Card>
        <Stack gap="md">
          <Text variant="bodyMedium">대표 이미지</Text>
          {item.heroImageUrl ? (
            <>
              <Text variant="caption" colorToken="textSecondary">
                {item.heroImageUrl}
              </Text>
              <Button
                label="대표 이미지 해제"
                variant="secondary"
                disabled={busy}
                onPress={() => setHero(null)}
              />
            </>
          ) : (
            <Text variant="caption" colorToken="textSecondary">
              설정된 대표 이미지가 없습니다. 아래에서 이미지를 첨부해 설정하세요.
            </Text>
          )}
        </Stack>
      </Card>

      {/* Manual attach (works today; no provider needed) */}
      <Card>
        <Stack gap="md">
          <Text variant="bodyMedium">외부 미디어 첨부 (직접 호스팅한 URL)</Text>
          <AdminSelect
            label="종류"
            options={KIND_OPTIONS}
            value={kind}
            onChange={setKind}
          />
          <Input
            label="미디어 URL"
            value={url}
            onChangeText={setUrl}
            placeholder="https://..."
            autoCapitalize="none"
          />
          <Button
            label={busy ? '처리 중...' : '첨부'}
            disabled={busy}
            onPress={handleAttach}
          />
          {error ? (
            <Text variant="bodySmall" colorToken="danger">
              {error}
            </Text>
          ) : null}
        </Stack>
      </Card>

      {/* AI image generation — IMAGE_STANDARD (OpenAI/LOW, resolved server-side) */}
      <Card>
        <Stack gap="md">
          <Text variant="bodyMedium">
            AI 이미지 생성 ({imageWorkloadStatus('IMAGE_STANDARD')})
          </Text>
          <Text variant="caption" colorToken="textSecondary">
            콘텐츠 맥락으로 이미지를 제안 생성합니다. 실존 인물의 얼굴/브랜드/캐릭터는
            생성하지 않습니다. 생성 후 검토하여 대표 이미지로 적용하세요(자동 적용 없음).
          </Text>
          <AdminSelect
            label="비율"
            options={ASPECT_OPTIONS}
            value={aspect}
            onChange={setAspect}
          />
          <Input
            label="주제/스타일 힌트 (선택 — 비우면 자동)"
            value={subject}
            onChangeText={setSubject}
            placeholder={suggestImageSubject(item)}
          />
          <Button
            label={generating ? '생성 중... (최대 1분)' : 'AI 이미지 생성'}
            disabled={generating}
            onPress={handleGenerateImage}
          />
          {genError ? (
            <Text variant="bodySmall" colorToken="danger">
              {genError}
            </Text>
          ) : null}

          {preview && preview.url ? (
            <Stack gap="sm">
              <Image
                source={{ uri: preview.url }}
                style={{ width: '100%', height: 200, borderRadius: 8 }}
                contentFit="cover"
                transition={150}
              />
              <Stack direction="row" gap="sm" style={{ flexWrap: 'wrap' }}>
                <Button
                  label="대표 이미지로 설정"
                  disabled={busy || generating}
                  onPress={() => setHero(preview.url)}
                />
                <Button
                  label="다시 생성"
                  variant="secondary"
                  disabled={generating}
                  onPress={handleGenerateImage}
                />
                <Button
                  label="버리기"
                  variant="secondary"
                  disabled={generating}
                  onPress={() => setPreview(null)}
                />
              </Stack>
            </Stack>
          ) : null}
        </Stack>
      </Card>

      {/* AI video generation — VIDEO_STANDARD (Google Veo, server-resolved, async) */}
      <Card>
        <Stack gap="md">
          <Text variant="bodyMedium">
            AI 영상 생성 ({videoWorkloadStatus('VIDEO_STANDARD')})
          </Text>
          <Text variant="caption" colorToken="textSecondary">
            짧은 개념 영상(약 8초, 720p, 오디오 없음)을 생성합니다. 실존 인물
            얼굴/브랜드/캐릭터는 생성하지 않습니다. 생성에는 시간이 걸리며(수 분),
            검토 후 적용하세요(자동 적용 없음).
          </Text>

          {item.videoUrl ? (
            <Stack gap="xs">
              <Text variant="caption" colorToken="success">
                적용된 영상이 있습니다.
              </Text>
              <Stack direction="row" gap="sm" style={{ flexWrap: 'wrap' }}>
                <Button
                  label="영상 열기"
                  variant="secondary"
                  onPress={() => Linking.openURL(item.videoUrl as string)}
                />
                <Button
                  label="영상 해제"
                  variant="secondary"
                  disabled={busy}
                  onPress={clearVideo}
                />
              </Stack>
            </Stack>
          ) : null}

          <AdminSelect
            label="비율"
            options={VIDEO_ASPECT_OPTIONS}
            value={videoAspect}
            onChange={setVideoAspect}
          />
          <Input
            label="주제/스타일 힌트 (선택 — 비우면 자동)"
            value={videoSubject}
            onChangeText={setVideoSubject}
            placeholder={suggestVideoSubject(item)}
          />
          <Button
            label={
              videoStatus === 'processing'
                ? '영상 생성 중... (수 분 소요)'
                : 'AI 영상 생성'
            }
            disabled={videoStatus === 'processing'}
            onPress={handleGenerateVideo}
          />
          {videoStatus === 'processing' ? (
            <Text variant="caption" colorToken="textSecondary">
              처리 중입니다. 이 화면을 열어두면 완료 시 미리보기가 표시됩니다.
            </Text>
          ) : null}
          {videoError ? (
            <Text variant="bodySmall" colorToken="danger">
              {videoError}
            </Text>
          ) : null}

          {videoStatus === 'completed' && videoPreviewUrl ? (
            <Stack gap="sm">
              <Button
                label="생성된 영상 미리보기 열기"
                variant="secondary"
                onPress={() => Linking.openURL(videoPreviewUrl)}
              />
              <Button
                label={busy ? '적용 중...' : '이 영상을 대표 영상으로 적용'}
                disabled={busy}
                onPress={applyVideo}
              />
            </Stack>
          ) : null}
        </Stack>
      </Card>

      {assets.length > 0 ? (
        <Card>
          <Stack gap="sm">
            <Text variant="bodyMedium">첨부/생성 자산</Text>
            {assets.map((a) => (
              <Stack key={a.id} gap="xs">
                <Text variant="bodySmall">
                  {a.kind === 'image' ? '이미지' : '영상'} · {a.status}
                  {a.provider ? ` · ${a.provider}` : ''}
                </Text>
                {a.externalUrl ? (
                  <Text variant="caption" colorToken="textSecondary">
                    {a.externalUrl}
                  </Text>
                ) : null}
                {a.kind === 'image' &&
                a.externalUrl &&
                a.status === 'completed' ? (
                  <Button
                    label="대표 이미지로 설정"
                    variant="secondary"
                    disabled={busy}
                    onPress={() => setHero(a.externalUrl)}
                  />
                ) : null}
              </Stack>
            ))}
          </Stack>
        </Card>
      ) : null}
    </Stack>
  );
}
