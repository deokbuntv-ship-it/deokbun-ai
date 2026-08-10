import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { AdminSelect } from '@/features/admin';

import { generationStatus } from '../assetProviders';
import { assetService } from '../services/assetService';
import type { AssetKind, ContentAsset, ContentItem } from '../types';

const KIND_OPTIONS = [
  { value: 'image' as AssetKind, label: '이미지' },
  { value: 'video' as AssetKind, label: '영상' },
];

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

  const imageGen = generationStatus('image');
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

      {/* AI generation seam — provider not configured (owner decision) */}
      <Card>
        <Stack gap="xs">
          <Text variant="bodyMedium">AI 미디어 생성</Text>
          <Text variant="caption" colorToken="textSecondary">
            이미지 생성: {imageGen} · 영상 생성: {videoGen}
          </Text>
          <Text variant="caption" colorToken="textSecondary">
            AI 이미지/영상 생성 provider가 아직 설정되지 않았습니다. provider 선택은
            비용/락인이 있는 소유자 결정 사항이며, 선택 후 서버측 생성 연동이
            필요합니다. (가짜 미디어를 생성하지 않습니다.)
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
