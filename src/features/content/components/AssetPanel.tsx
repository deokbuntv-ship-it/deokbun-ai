import { Image } from 'expo-image';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { AdminSelect } from '@/features/admin';

import { generationStatus, imageWorkloadStatus } from '../assetProviders';
import { assetService } from '../services/assetService';
import {
  imageGenerationService,
  suggestImageSubject,
} from '../services/imageGenerationService';
import type {
  AssetKind,
  ContentAsset,
  ContentItem,
  ImageAspectRatio,
} from '../types';

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

  const videoGen = generationStatus('video');

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

      {/* Video generation — no provider selected yet (owner decision) */}
      <Card>
        <Stack gap="xs">
          <Text variant="bodyMedium">AI 영상 생성</Text>
          <Text variant="caption" colorToken="textSecondary">
            영상 생성: {videoGen}. provider 선택(비용/락인)은 소유자 결정 사항이며,
            선택 후 서버측 연동이 필요합니다. (가짜 미디어를 생성하지 않습니다.)
          </Text>
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
