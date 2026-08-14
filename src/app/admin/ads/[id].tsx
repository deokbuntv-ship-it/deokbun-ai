import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { StatusBadge } from '@/components/StatusBadge';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { AdminDetailSection, AdminPageHeader, AdminSelect, AdminStateView } from '@/features/admin';
import { adminTheme } from '@/features/admin/adminTheme';
import {
  AD_STATUS_LABELS,
  AD_STATUS_OPTIONS,
  AD_STATUS_TONES,
  AD_TYPE_LABELS,
  CONTRACT_TYPE_LABELS,
  formatKrw,
  isValidAdCheckUrl,
  type AdInput,
  type Advertisement,
  type AdPerformanceRow,
  type AdStatus,
} from '@/features/ads';
import { AdEditor, AdFunnelPanel, TrackingUrlCard } from '@/features/ads/components';
import { adAdvertisementService } from '@/features/ads/services/adAdvertisementService';
import { resolveAppOrigin } from '@/features/ads/services/appOrigin';
import { adPerformanceService } from '@/features/ads/services/adPerformanceService';

type LoadStatus = 'loading' | 'ready' | 'notfound' | 'error';

export default function AdminAdDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [ad, setAd] = useState<Advertisement | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [perf, setPerf] = useState<{ connected: boolean; row: AdPerformanceRow | null }>({
    connected: false,
    row: null,
  });
  const origin = resolveAppOrigin();

  const load = useCallback(async () => {
    if (!id) return;
    setStatus('loading');
    try {
      const found = await adAdvertisementService.getAd(id);
      if (!found) {
        setStatus('notfound');
        return;
      }
      setAd(found);
      setStatus('ready');
      // Funnel is best-effort; a not-deployed tracking backend is not an error here.
      try {
        const result = await adPerformanceService.getPerformance();
        if (result.connected) {
          setPerf({ connected: true, row: result.rows.find((r) => r.ad.id === id) ?? null });
        } else {
          setPerf({ connected: false, row: null });
        }
      } catch {
        setPerf({ connected: false, row: null });
      }
    } catch {
      setStatus('error');
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const runAction = async (fn: () => Promise<Advertisement>, failMsg: string) => {
    setBusy(true);
    setActionError(null);
    try {
      const updated = await fn();
      setAd(updated);
      setEditing(false);
    } catch {
      setActionError(failMsg);
    } finally {
      setBusy(false);
    }
  };

  const openAdCheck = () => {
    if (ad?.adCheckUrl && isValidAdCheckUrl(ad.adCheckUrl) && typeof window !== 'undefined') {
      window.open(ad.adCheckUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (status !== 'ready' || !ad) {
    if (status === 'notfound') {
      return (
        <Stack gap="lg">
          <AdminPageHeader title="광고" />
          <Text variant="bodyMedium" style={{ color: adminTheme.inkVariant }}>
            해당 광고를 찾을 수 없습니다.
          </Text>
          <Button label="← 목록" variant="secondary" onPress={() => router.replace('/admin/ads')} />
        </Stack>
      );
    }
    return (
      <Stack gap="lg">
        <AdminPageHeader title="광고" />
        <AdminStateView state={status === 'loading' ? 'loading' : 'error'} onRetry={load} />
      </Stack>
    );
  }

  const published = ad.publicTrackingCode !== null;

  return (
    <Stack gap="xl">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <View style={{ gap: 8 }}>
          <Button label="← 목록" variant="secondary" onPress={() => router.replace('/admin/ads')} />
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <Text variant="headingLarge" style={{ color: adminTheme.ink }}>
              {ad.publisherNickname}
            </Text>
            <StatusBadge label={AD_STATUS_LABELS[ad.status]} tone={AD_STATUS_TONES[ad.status]} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {!published ? (
            <Button
              label={busy ? '발행 중...' : '발행'}
              onPress={() => runAction(() => adAdvertisementService.publishAd(ad.id), '발행에 실패했어요. 다시 시도해 주세요.')}
              disabled={busy}
            />
          ) : null}
          {ad.adCheckUrl ? <Button label="광고 확인" variant="secondary" onPress={openAdCheck} /> : null}
          <Button label={editing ? '편집 닫기' : '수정'} variant="tertiary" onPress={() => setEditing((v) => !v)} />
        </View>
      </View>

      {actionError ? (
        <Text variant="bodySmall" colorToken="danger">
          {actionError}
        </Text>
      ) : null}

      <AdminDetailSection
        title="광고 정보"
        rows={[
          { label: '광고 형태', value: AD_TYPE_LABELS[ad.adType] },
          { label: '상태', value: AD_STATUS_LABELS[ad.status] },
          { label: '광고 시작일', value: ad.startDate ?? '—' },
          { label: '계약 형태', value: CONTRACT_TYPE_LABELS[ad.contractType] },
          { label: '광고비', value: formatKrw(ad.costKrw, '미입력') },
          { label: '광고 확인 링크', value: ad.adCheckUrl ?? '—' },
          { label: '메모', value: ad.notes ?? '—' },
          { label: '발행 시각', value: ad.publishedAt ? ad.publishedAt.slice(0, 16).replace('T', ' ') : '미발행' },
        ]}
      />

      <TrackingUrlCard code={ad.publicTrackingCode} origin={origin} />

      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <Text variant="bodySmall" style={{ color: adminTheme.inkVariant }}>
          상태 변경
        </Text>
        <AdminSelect
          options={AD_STATUS_OPTIONS}
          value={ad.status}
          onChange={(next: AdStatus) =>
            runAction(() => adAdvertisementService.setStatus(ad.id, next), '상태 변경에 실패했어요.')
          }
        />
        <Text variant="caption" style={{ color: adminTheme.inkMuted }}>
          삭제 대신 상태를 변경해 과거 데이터를 보존합니다.
        </Text>
      </View>

      <View style={{ gap: 8 }}>
        <Text variant="headingMedium" style={{ color: adminTheme.ink }}>
          이 광고의 유입 · 전환
        </Text>
        <View style={{ backgroundColor: adminTheme.surface, borderWidth: 1, borderColor: adminTheme.border, borderRadius: 8 }}>
          <AdFunnelPanel connected={perf.connected} perf={perf.row} />
        </View>
      </View>

      {editing ? (
        <View style={{ maxWidth: 640, gap: 12 }}>
          <Text variant="headingMedium" style={{ color: adminTheme.ink }}>
            광고 수정
          </Text>
          <AdEditor
            initial={ad}
            submitting={busy}
            errorMessage={actionError}
            onSubmit={(input: AdInput) =>
              runAction(() => adAdvertisementService.updateAd(ad.id, input), '수정에 실패했어요.')
            }
            onCancel={() => setEditing(false)}
          />
        </View>
      ) : null}
    </Stack>
  );
}
