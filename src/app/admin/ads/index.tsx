import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { StatusBadge } from '@/components/StatusBadge';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import {
  AdminDataTable,
  AdminPageHeader,
  AdminPagination,
  AdminSearchInput,
  AdminSelect,
  AdminStateView,
  type AdminColumn,
} from '@/features/admin';
import { adminTheme } from '@/features/admin/adminTheme';
import {
  AD_STATUS_LABELS,
  AD_STATUS_TONES,
  AD_TYPE_LABELS,
  CONTRACT_TYPE_LABELS,
  formatKrw,
  type AdListItem,
  type AdStatus,
} from '@/features/ads';
import { adAdvertisementService } from '@/features/ads/services/adAdvertisementService';

// ADMIN 광고 목록 (§4/§13). Read/list of the Advertisement primary entity. Mirrors the
// content/famous list convention: search + status filter, AdminDataTable, offset paging,
// AdminStateView. Traffic/전환 columns live on the 성과 screen (§31) to keep the list fast.
const PAGE_SIZE = 25;
type ListStatus = 'loading' | 'ready' | 'error';

const STATUS_FILTER_OPTIONS = [
  { value: '' as const, label: '전체 상태' },
  ...(Object.keys(AD_STATUS_LABELS) as AdStatus[]).map((s) => ({ value: s, label: AD_STATUS_LABELS[s] })),
];

const COLUMNS: AdminColumn[] = [
  { key: 'status', header: '상태', flex: 0.8 },
  { key: 'adType', header: '광고 형태', flex: 1 },
  { key: 'publisher', header: '닉네임/채널명', flex: 1.4 },
  { key: 'startDate', header: '시작일', flex: 0.9 },
  { key: 'contractType', header: '계약 형태', flex: 1 },
  { key: 'costKrw', header: '광고비', flex: 0.9, align: 'right' },
];

export default function AdminAdsListScreen() {
  const router = useRouter();
  const [rows, setRows] = useState<AdListItem[]>([]);
  const [status, setStatus] = useState<ListStatus>('loading');
  const [searchText, setSearchText] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdStatus | ''>('');
  const [offset, setOffset] = useState(0);
  const loadToken = useRef(0);

  const load = useCallback(async () => {
    const token = loadToken.current + 1;
    loadToken.current = token;
    setStatus('loading');
    try {
      const data = await adAdvertisementService.listAds({
        search: appliedSearch,
        status: statusFilter || null,
        limit: PAGE_SIZE,
        offset,
      });
      if (token !== loadToken.current) return;
      setRows(data);
      setStatus('ready');
    } catch {
      if (token !== loadToken.current) return;
      setStatus('error');
    }
  }, [appliedSearch, statusFilter, offset]);

  useEffect(() => {
    void load();
  }, [load]);

  const renderCell = (item: AdListItem, key: string) => {
    switch (key) {
      case 'status':
        return <StatusBadge label={AD_STATUS_LABELS[item.status]} tone={AD_STATUS_TONES[item.status]} />;
      case 'adType':
        return AD_TYPE_LABELS[item.adType];
      case 'publisher':
        return item.publisherNickname;
      case 'startDate':
        return item.startDate ?? '—';
      case 'contractType':
        return CONTRACT_TYPE_LABELS[item.contractType];
      case 'costKrw':
        return formatKrw(item.costKrw, '미입력');
      default:
        return null;
    }
  };

  return (
    <Stack gap="xl">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <AdminPageHeader title="광고" subtitle="광고 1건을 등록·발행하고, 유입부터 첫 상담·리텐션까지 성과를 추적합니다." />
        <View style={{ flexDirection: 'row', gap: 8, paddingTop: 4 }}>
          <ActionLink label="광고 성과" onPress={() => router.push('/admin/ads/performance')} tone="secondary" />
          <ActionLink label="+ 광고 신규등록" onPress={() => router.push('/admin/ads/new')} tone="primary" />
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <View style={{ flex: 1, minWidth: 220 }}>
          <AdminSearchInput
            value={searchText}
            onChangeText={setSearchText}
            onSubmit={() => {
              setOffset(0);
              setAppliedSearch(searchText);
            }}
            placeholder="닉네임/채널명 검색"
          />
        </View>
        <AdminSelect
          options={STATUS_FILTER_OPTIONS}
          value={statusFilter}
          onChange={(v) => {
            setOffset(0);
            setStatusFilter(v);
          }}
        />
      </View>

      {status === 'ready' && rows.length === 0 ? (
        <View style={{ padding: 32, alignItems: 'center', gap: 12 }}>
          <Text variant="bodyMedium" style={{ color: adminTheme.inkVariant }}>
            아직 등록된 광고가 없습니다.
          </Text>
          <ActionLink label="+ 광고 신규등록" onPress={() => router.push('/admin/ads/new')} tone="primary" />
        </View>
      ) : status !== 'ready' ? (
        <AdminStateView state={status === 'loading' ? 'loading' : 'error'} onRetry={load} />
      ) : (
        <>
          <AdminDataTable
            columns={COLUMNS}
            rows={rows}
            keyExtractor={(r) => r.id}
            renderCell={renderCell}
            onRowPress={(r) => router.push(`/admin/ads/${r.id}`)}
          />
          <AdminPagination
            offset={offset}
            limit={PAGE_SIZE}
            pageSize={rows.length}
            onPrev={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            onNext={() => setOffset(offset + PAGE_SIZE)}
          />
        </>
      )}
    </Stack>
  );
}

// Small inline button (avoids importing Button styling variants inconsistently).
function ActionLink({ label, onPress, tone }: { label: string; onPress: () => void; tone: 'primary' | 'secondary' }) {
  return (
    <Text
      accessibilityRole="button"
      onPress={onPress}
      variant="bodySmall"
      style={{
        color: tone === 'primary' ? '#FFFFFF' : adminTheme.ink,
        backgroundColor: tone === 'primary' ? adminTheme.navy : adminTheme.surface,
        borderWidth: 1,
        borderColor: tone === 'primary' ? adminTheme.navy : adminTheme.border,
        borderRadius: 6,
        paddingHorizontal: 14,
        paddingVertical: 9,
        fontWeight: '700',
        overflow: 'hidden',
      }}
    >
      {label}
    </Text>
  );
}
