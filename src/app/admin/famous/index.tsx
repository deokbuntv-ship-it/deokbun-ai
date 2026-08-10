import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button';
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
import {
  famousService,
  type FamousListItem,
  type FamousStatus,
} from '@/features/famous';

type ListStatus = 'loading' | 'ready' | 'error';

const PAGE_SIZE = 25;

const STATUS_FILTER_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'draft', label: '초안' },
  { value: 'published', label: '공개' },
  { value: 'archived', label: '보관' },
];
const VISIBILITY_FILTER_OPTIONS = [
  { value: '', label: '전체 공개여부' },
  { value: 'public', label: '공개' },
  { value: 'private', label: '비공개' },
];
const CALC_FILTER_OPTIONS = [
  { value: '', label: '전체 계산상태' },
  { value: 'not_calculated', label: '미계산' },
  { value: 'current', label: '최신' },
  { value: 'stale', label: '갱신필요' },
  { value: 'failed', label: '실패' },
  { value: 'unavailable', label: '불가' },
];

type FamousFilters = {
  search: string;
  status: string;
  visibility: string;
  calc: string;
};

const COLUMNS: AdminColumn[] = [
  { key: 'name', header: '이름', flex: 3 },
  { key: 'slug', header: 'slug', flex: 3 },
  { key: 'status', header: '상태', flex: 2 },
  { key: 'calc', header: '계산', flex: 2 },
];

const STATUS_LABEL: Record<string, string> = {
  draft: '초안',
  published: '공개',
  archived: '보관',
};
const CALC_LABEL: Record<string, string> = {
  not_calculated: '미계산',
  current: '최신',
  stale: '갱신필요',
  failed: '실패',
  unavailable: '불가',
};

export default function AdminFamousListScreen() {
  const router = useRouter();

  const [items, setItems] = useState<FamousListItem[]>([]);
  const [status, setStatus] = useState<ListStatus>('loading');
  const [searchText, setSearchText] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('');
  const [calcFilter, setCalcFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const loadTokenRef = useRef(0);

  const load = useCallback((nextOffset: number, f: FamousFilters) => {
    const token = loadTokenRef.current + 1;
    loadTokenRef.current = token;
    setStatus('loading');
    famousService
      .listFamous({
        search: f.search,
        status: (f.status || null) as FamousStatus | null,
        isPublic:
          f.visibility === '' ? null : f.visibility === 'public' ? true : false,
        calculationState:
          (f.calc || null) as FamousListItem['calculationState'] | null,
        limit: PAGE_SIZE,
        offset: nextOffset,
      })
      .then((rows) => {
        if (token !== loadTokenRef.current) return;
        setItems(rows);
        setStatus('ready');
      })
      .catch(() => {
        if (token !== loadTokenRef.current) return;
        setStatus('error');
      });
  }, []);

  const filters: FamousFilters = {
    search: appliedSearch,
    status: statusFilter,
    visibility: visibilityFilter,
    calc: calcFilter,
  };

  useEffect(() => {
    load(offset, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, offset, appliedSearch, statusFilter, visibilityFilter, calcFilter]);

  return (
    <Stack gap="xl">
      <Stack direction="row" gap="md" align="center" style={{ flexWrap: 'wrap' }}>
        <AdminPageHeader
          title="유명인"
          subtitle="유명인 데이터 / SEO 소스 관리 (읽기/쓰기)."
        />
        <Button label="새 유명인" onPress={() => router.push('/admin/famous/new')} />
      </Stack>

      <AdminSearchInput
        value={searchText}
        onChangeText={setSearchText}
        onSubmit={() => {
          setOffset(0);
          setAppliedSearch(searchText.trim());
        }}
        placeholder="이름 또는 slug 검색"
      />

      <Stack direction="row" gap="md" style={{ flexWrap: 'wrap' }}>
        <AdminSelect
          label="상태"
          options={STATUS_FILTER_OPTIONS}
          value={statusFilter}
          onChange={(v) => {
            setOffset(0);
            setStatusFilter(v);
          }}
          style={{ flex: 1, minWidth: 150 }}
        />
        <AdminSelect
          label="공개여부"
          options={VISIBILITY_FILTER_OPTIONS}
          value={visibilityFilter}
          onChange={(v) => {
            setOffset(0);
            setVisibilityFilter(v);
          }}
          style={{ flex: 1, minWidth: 150 }}
        />
        <AdminSelect
          label="계산상태"
          options={CALC_FILTER_OPTIONS}
          value={calcFilter}
          onChange={(v) => {
            setOffset(0);
            setCalcFilter(v);
          }}
          style={{ flex: 1, minWidth: 150 }}
        />
      </Stack>

      {status === 'loading' ? (
        <AdminStateView state="loading" />
      ) : status === 'error' ? (
        <AdminStateView
          state="error"
          message="유명인 목록을 불러오지 못했습니다. 관리자 권한 또는 DB 설정을 확인해 주세요."
          onRetry={() => load(offset, filters)}
        />
      ) : items.length === 0 ? (
        <AdminStateView state="empty" message="등록된 유명인이 없습니다." />
      ) : (
        <Stack gap="md">
          <AdminDataTable
            columns={COLUMNS}
            rows={items}
            keyExtractor={(item) => item.id}
            onRowPress={(item) =>
              router.push({
                pathname: '/admin/famous/[id]',
                params: { id: item.id },
              })
            }
            renderCell={(item, columnKey) => {
              if (columnKey === 'name') {
                return <Text variant="bodyMedium">{item.name}</Text>;
              }
              if (columnKey === 'slug') {
                return (
                  <Text variant="bodySmall" colorToken="textSecondary">
                    {item.slug}
                  </Text>
                );
              }
              if (columnKey === 'status') {
                return (
                  <Text variant="bodySmall">
                    {STATUS_LABEL[item.status] ?? item.status}
                    {item.isPublic ? ' · 공개' : ''}
                  </Text>
                );
              }
              return (
                <Text variant="bodySmall" colorToken="textSecondary">
                  {CALC_LABEL[item.calculationState] ?? item.calculationState}
                </Text>
              );
            }}
          />
          <AdminPagination
            offset={offset}
            limit={PAGE_SIZE}
            pageSize={items.length}
            onPrev={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
            onNext={() => setOffset((o) => o + PAGE_SIZE)}
          />
        </Stack>
      )}
    </Stack>
  );
}
