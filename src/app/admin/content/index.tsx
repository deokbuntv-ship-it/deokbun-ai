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
  AdminStateView,
  type AdminColumn,
} from '@/features/admin';
import { contentService, type ContentListItem } from '@/features/content';

type ListStatus = 'loading' | 'ready' | 'error';

const PAGE_SIZE = 25;

const COLUMNS: AdminColumn[] = [
  { key: 'title', header: '제목', flex: 4 },
  { key: 'channel', header: '채널', flex: 2 },
  { key: 'status', header: '상태', flex: 2 },
  { key: 'updated', header: '수정', flex: 2 },
];

const CHANNEL_LABEL: Record<string, string> = {
  generic: '일반',
  naver_blog: '네이버 블로그',
  instagram: '인스타그램',
  youtube: '유튜브',
  video: '영상',
};
const STATUS_LABEL: Record<string, string> = {
  draft: '초안',
  generating: '생성중',
  ready: '준비완료',
  publish_pending: '게시대기',
  published: '게시됨',
  failed: '실패',
  cancelled: '취소',
};

function formatDate(iso: string | null): string {
  return iso ? iso.slice(0, 10) : '–';
}

export default function AdminContentListScreen() {
  const router = useRouter();

  const [items, setItems] = useState<ContentListItem[]>([]);
  const [status, setStatus] = useState<ListStatus>('loading');
  const [searchText, setSearchText] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const loadTokenRef = useRef(0);

  const load = useCallback((search: string, nextOffset: number) => {
    const token = loadTokenRef.current + 1;
    loadTokenRef.current = token;
    setStatus('loading');
    contentService
      .listContent({ search, limit: PAGE_SIZE, offset: nextOffset })
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

  useEffect(() => {
    load(appliedSearch, offset);
  }, [load, appliedSearch, offset]);

  return (
    <Stack gap="xl">
      <Stack direction="row" gap="md" align="center" style={{ flexWrap: 'wrap' }}>
        <AdminPageHeader
          title="콘텐츠"
          subtitle="채널별 콘텐츠를 하나의 스튜디오에서 관리합니다."
        />
        <Button
          label="새 콘텐츠"
          onPress={() => router.push('/admin/content/new')}
        />
      </Stack>

      <AdminSearchInput
        value={searchText}
        onChangeText={setSearchText}
        onSubmit={() => {
          setOffset(0);
          setAppliedSearch(searchText.trim());
        }}
        placeholder="제목 검색"
      />

      {status === 'loading' ? (
        <AdminStateView state="loading" />
      ) : status === 'error' ? (
        <AdminStateView
          state="error"
          message="콘텐츠 목록을 불러오지 못했습니다. 관리자 권한 또는 DB 설정을 확인해 주세요."
          onRetry={() => load(appliedSearch, offset)}
        />
      ) : items.length === 0 ? (
        <AdminStateView state="empty" message="콘텐츠가 없습니다." />
      ) : (
        <Stack gap="md">
          <AdminDataTable
            columns={COLUMNS}
            rows={items}
            keyExtractor={(item) => item.id}
            onRowPress={(item) =>
              router.push({
                pathname: '/admin/content/[id]',
                params: { id: item.id },
              })
            }
            renderCell={(item, columnKey) => {
              if (columnKey === 'title') {
                return <Text variant="bodyMedium">{item.title || '(제목 없음)'}</Text>;
              }
              if (columnKey === 'channel') {
                return (
                  <Text variant="bodySmall" colorToken="textSecondary">
                    {CHANNEL_LABEL[item.channel] ?? item.channel}
                  </Text>
                );
              }
              if (columnKey === 'status') {
                return (
                  <Text variant="bodySmall">
                    {STATUS_LABEL[item.status] ?? item.status}
                  </Text>
                );
              }
              return (
                <Text variant="bodySmall" colorToken="textSecondary">
                  {formatDate(item.updatedAt)}
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
