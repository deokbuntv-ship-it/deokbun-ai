import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import {
  AdminDataTable,
  AdminPageHeader,
  AdminPagination,
  AdminSearchInput,
  AdminStateView,
  adminConsultationsService,
  type AdminColumn,
  type AdminConsultationListItem,
} from '@/features/admin';

type ListStatus = 'loading' | 'ready' | 'error';

const PAGE_SIZE = 25;

const COLUMNS: AdminColumn[] = [
  { key: 'user', header: '사용자', flex: 3 },
  { key: 'subject', header: '대상', flex: 2 },
  { key: 'updatedAt', header: '최근', flex: 2 },
  { key: 'messages', header: '메시지', flex: 1, align: 'right' },
];

function formatDate(iso: string | null): string {
  return iso ? iso.slice(0, 10) : '–';
}

export default function AdminConsultationsScreen() {
  const router = useRouter();

  const [items, setItems] = useState<AdminConsultationListItem[]>([]);
  const [status, setStatus] = useState<ListStatus>('loading');
  const [searchText, setSearchText] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [offset, setOffset] = useState(0);

  const loadTokenRef = useRef(0);

  const load = useCallback((search: string, nextOffset: number) => {
    const token = loadTokenRef.current + 1;
    loadTokenRef.current = token;
    setStatus('loading');

    adminConsultationsService
      .listConsultations({ search, limit: PAGE_SIZE, offset: nextOffset })
      .then((rows) => {
        if (token !== loadTokenRef.current) {
          return;
        }
        setItems(rows);
        setStatus('ready');
      })
      .catch(() => {
        if (token !== loadTokenRef.current) {
          return;
        }
        setStatus('error');
      });
  }, []);

  useEffect(() => {
    load(appliedSearch, offset);
  }, [load, appliedSearch, offset]);

  const runSearch = () => {
    setOffset(0);
    setAppliedSearch(searchText.trim());
  };

  return (
    <Stack gap="xl">
      <AdminPageHeader
        title="상담"
        subtitle="상담 메타데이터를 읽기 전용으로 확인합니다. 대화 원문은 노출되지 않습니다."
      />

      <AdminSearchInput
        value={searchText}
        onChangeText={setSearchText}
        onSubmit={runSearch}
        placeholder="사용자 이름/이메일 또는 대상 검색"
      />

      {status === 'loading' ? (
        <AdminStateView state="loading" />
      ) : status === 'error' ? (
        <AdminStateView
          state="error"
          message="상담 목록을 불러오지 못했습니다. 관리자 권한 또는 DB 설정을 확인해 주세요."
          onRetry={() => load(appliedSearch, offset)}
        />
      ) : (
        <Stack gap="md">
          <AdminDataTable
            columns={COLUMNS}
            rows={items}
            keyExtractor={(item) => item.conversationId}
            onRowPress={(item) =>
              router.push({
                pathname: '/admin/consultations/[conversationId]',
                params: { conversationId: item.conversationId },
              })
            }
            renderCell={(item, columnKey) => {
              if (columnKey === 'user') {
                return (
                  <Text variant="bodyMedium">
                    {item.userDisplayName ?? '(이름 없음)'}
                  </Text>
                );
              }
              if (columnKey === 'subject') {
                return (
                  <Text variant="bodySmall" colorToken="textSecondary">
                    {item.subjectLabel ?? '–'}
                  </Text>
                );
              }
              if (columnKey === 'updatedAt') {
                return (
                  <Text variant="bodySmall" colorToken="textSecondary">
                    {formatDate(item.updatedAt)}
                  </Text>
                );
              }
              return (
                <Text variant="bodyMedium">{String(item.messageCount)}</Text>
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
