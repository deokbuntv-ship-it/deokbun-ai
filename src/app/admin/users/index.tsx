import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import {
  AdminBadge,
  AdminDetailDrawer,
  AdminPageHeader,
  AdminPagination,
  AdminSearchInput,
  AdminStateView,
  AdminTable,
  adminUsersService,
  type AdminTableColumn,
  type AdminUserDetail,
  type AdminUserListItem,
} from '@/features/admin';
import { adminMono, adminTheme } from '@/features/admin/adminTheme';

// ADMIN_02_USERS (Stitch final_lock_9). Dense user table → USER_DETAIL drawer.
// Read-only real data (adminUsersService). Email and last-seen live in the drawer
// only (§26 minimize PII in lists). CSV export / 사용자 추가 have no backend
// contract → shown as 준비 중, never faked (§4/§27).
type ListStatus = 'loading' | 'ready' | 'error';
const PAGE_SIZE = 25;

function d(iso: string | null): string {
  return iso ? iso.slice(0, 10) : '–';
}
function dt(iso: string | null): string {
  return iso ? iso.slice(0, 16).replace('T', ' ') : '–';
}

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [status, setStatus] = useState<ListStatus>('loading');
  const [searchText, setSearchText] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const loadTokenRef = useRef(0);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback((search: string, nextOffset: number) => {
    const token = loadTokenRef.current + 1;
    loadTokenRef.current = token;
    setStatus('loading');
    adminUsersService
      .listUsers({ search, limit: PAGE_SIZE, offset: nextOffset })
      .then((rows) => {
        if (token !== loadTokenRef.current) return;
        setUsers(rows);
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

  const openDetail = (item: AdminUserListItem) => {
    setSelectedId(item.userId);
    setDetail(null);
    setDetailLoading(true);
    adminUsersService
      .getUser(item.userId)
      .then((u) => setDetail(u))
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  };

  const columns: AdminTableColumn<AdminUserListItem>[] = [
    { key: 'id', label: '사용자 ID', flex: 2, mono: true, render: (r) => r.userId.slice(0, 12) },
    { key: 'name', label: '이름', flex: 2, render: (r) => r.displayName ?? '(이름 없음)' },
    { key: 'created', label: '가입일', flex: 2, render: (r) => d(r.createdAt) },
    { key: 'subjects', label: '대상자 수', flex: 1, align: 'right', mono: true, render: (r) => String(r.subjectCount) },
    { key: 'convs', label: '상담 수', flex: 1, align: 'right', mono: true, render: (r) => String(r.conversationCount) },
    { key: 'action', label: '액션', flex: 1, align: 'right', render: () => <AdminBadge label="상세" tone="info" /> },
  ];

  return (
    <Stack gap="xl">
      <Stack direction="row" align="center" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <AdminPageHeader title="사용자 관리" subtitle="가입한 사용자와 저장된 상담 대상을 읽기 전용으로 확인합니다." />
        <Stack direction="row" gap="sm">
          <Chip label="CSV 다운로드 (준비 중)" />
          <Chip label="사용자 추가 (준비 중)" />
        </Stack>
      </Stack>

      <AdminSearchInput
        value={searchText}
        onChangeText={setSearchText}
        onSubmit={() => {
          setOffset(0);
          setAppliedSearch(searchText.trim());
        }}
        placeholder="이름 검색"
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
          <AdminTable columns={columns} rows={users} keyExtractor={(r) => r.userId} onRowPress={openDetail} />
          <AdminPagination
            offset={offset}
            limit={PAGE_SIZE}
            pageSize={users.length}
            onPrev={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
            onNext={() => setOffset((o) => o + PAGE_SIZE)}
          />
        </Stack>
      )}

      <AdminDetailDrawer
        visible={selectedId !== null}
        onClose={() => setSelectedId(null)}
        title={detail?.displayName ?? '사용자'}
        subtitle={selectedId ? selectedId : undefined}
        footer={
          <View style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 4, backgroundColor: adminTheme.neutralBg }}>
            <Text variant="bodySmall" style={{ color: adminTheme.inkMuted, fontWeight: '600' }}>
              이용 제한 (API 미연결)
            </Text>
          </View>
        }
      >
        {detailLoading ? (
          <Text variant="bodyMedium" style={{ color: adminTheme.inkMuted }}>불러오는 중...</Text>
        ) : !detail ? (
          <Text variant="bodyMedium" style={{ color: adminTheme.inkMuted }}>사용자 정보를 불러오지 못했습니다.</Text>
        ) : (
          <>
            <Section title="기본 정보">
              <Row label="이메일" value={detail.email ?? '–'} />
              <Row label="가입일" value={d(detail.createdAt)} />
              <Row label="최근 접속" value={dt(detail.lastSignInAt)} />
            </Section>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Stat label="총 상담 수" value={String(detail.conversationCount)} />
              <Stat label="등록된 분석 대상자" value={String(detail.subjects.length)} />
            </View>
            <Section title="분석 대상자">
              {detail.subjects.length === 0 ? (
                <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>등록된 대상자가 없습니다.</Text>
              ) : (
                detail.subjects.map((s) => (
                  <Row
                    key={s.id}
                    label={`${s.displayName ?? '대상'}${s.isSelf ? ' (본인)' : ''}`}
                    value={`${s.relationship ?? '–'} · ${s.birthDate}`}
                  />
                ))
              )}
            </Section>
          </>
        )}
      </AdminDetailDrawer>
    </Stack>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <View style={{ backgroundColor: adminTheme.neutralBg, borderRadius: 4, paddingHorizontal: 14, paddingVertical: 9 }}>
      <Text variant="bodySmall" style={{ color: adminTheme.inkMuted, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ borderWidth: 1, borderColor: adminTheme.border, borderRadius: 8, padding: 16, gap: 10 }}>
      <Text variant="bodyLarge" style={{ color: adminTheme.ink, fontWeight: '700' }}>{title}</Text>
      {children}
    </View>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
      <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>{label}</Text>
      <Text variant="bodySmall" style={{ color: adminTheme.ink, fontFamily: adminMono, flexShrink: 1, textAlign: 'right' }}>{value}</Text>
    </View>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, borderWidth: 1, borderColor: adminTheme.border, borderRadius: 8, padding: 16, gap: 6 }}>
      <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>{label}</Text>
      <Text variant="headingMedium" style={{ color: adminTheme.ink, fontWeight: '700' }}>{value}</Text>
    </View>
  );
}
