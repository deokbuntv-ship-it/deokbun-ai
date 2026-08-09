import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Text } from '@/components/Text';
import {
  AdminDataTable,
  AdminPageHeader,
  AdminPagination,
  AdminSearchInput,
  AdminStateView,
  adminUsersService,
  type AdminColumn,
  type AdminUserListItem,
} from '@/features/admin';
import { Stack } from '@/components/Stack';

type ListStatus = 'loading' | 'ready' | 'error';

const PAGE_SIZE = 25;

const COLUMNS: AdminColumn[] = [
  { key: 'name', header: '이름', flex: 3 },
  { key: 'createdAt', header: '가입일', flex: 2 },
  { key: 'subjects', header: '대상', flex: 1, align: 'right' },
  { key: 'conversations', header: '상담', flex: 1, align: 'right' },
];

function formatDate(iso: string | null): string {
  return iso ? iso.slice(0, 10) : '–';
}

export default function AdminUsersScreen() {
  const router = useRouter();

  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [status, setStatus] = useState<ListStatus>('loading');
  const [searchText, setSearchText] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [offset, setOffset] = useState(0);

  const loadTokenRef = useRef(0);

  const load = useCallback((search: string, nextOffset: number) => {
    const token = loadTokenRef.current + 1;
    loadTokenRef.current = token;
    setStatus('loading');

    adminUsersService
      .listUsers({ search, limit: PAGE_SIZE, offset: nextOffset })
      .then((rows) => {
        if (token !== loadTokenRef.current) {
          return;
        }
        setUsers(rows);
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
        title="사용자"
        subtitle="가입한 사용자와 저장된 상담 대상을 읽기 전용으로 확인합니다."
      />

      <AdminSearchInput
        value={searchText}
        onChangeText={setSearchText}
        onSubmit={runSearch}
        placeholder="이름 또는 이메일 검색"
      />

      {status === 'loading' ? (
        <AdminStateView state="loading" />
      ) : status === 'error' ? (
        <AdminStateView
          state="error"
          message="사용자 목록을 불러오지 못했습니다. 관리자 권한 또는 DB 설정을 확인해 주세요."
          onRetry={() => load(appliedSearch, offset)}
        />
      ) : (
        <Stack gap="md">
          <AdminDataTable
            columns={COLUMNS}
            rows={users}
            keyExtractor={(item) => item.userId}
            onRowPress={(item) =>
              router.push({
                pathname: '/admin/users/[userId]',
                params: { userId: item.userId },
              })
            }
            renderCell={(item, columnKey) => {
              if (columnKey === 'name') {
                return (
                  <Text variant="bodyMedium">
                    {item.displayName ?? '(이름 없음)'}
                  </Text>
                );
              }
              if (columnKey === 'createdAt') {
                return (
                  <Text variant="bodySmall" colorToken="textSecondary">
                    {formatDate(item.createdAt)}
                  </Text>
                );
              }
              if (columnKey === 'subjects') {
                return (
                  <Text variant="bodyMedium">{String(item.subjectCount)}</Text>
                );
              }
              return (
                <Text variant="bodyMedium">
                  {String(item.conversationCount)}
                </Text>
              );
            }}
          />
          <AdminPagination
            offset={offset}
            limit={PAGE_SIZE}
            pageSize={users.length}
            onPrev={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
            onNext={() => setOffset((o) => o + PAGE_SIZE)}
          />
        </Stack>
      )}
    </Stack>
  );
}
