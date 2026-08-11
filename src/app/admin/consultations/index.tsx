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
  adminConsultationsService,
  type AdminConsultationDetail,
  type AdminConsultationListItem,
  type AdminTableColumn,
} from '@/features/admin';
import { adminMono, adminTheme } from '@/features/admin/adminTheme';

// ADMIN_04/05 CONSULTATIONS + DETAIL (Stitch final_lock_2 / final_lock_4).
// Read-only monitoring. Message CONTENT is never returned by the service
// (metadata-only: role + length) — the detail drawer respects that (§26). Model/
// token/cost/latency have no source yet → shown as 미연결, never fabricated.
type ListStatus = 'loading' | 'ready' | 'error';
const PAGE_SIZE = 25;

function d(iso: string | null): string {
  return iso ? iso.slice(0, 16).replace('T', ' ') : '–';
}

export default function AdminConsultationsScreen() {
  const [rows, setRows] = useState<AdminConsultationListItem[]>([]);
  const [status, setStatus] = useState<ListStatus>('loading');
  const [searchText, setSearchText] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const loadTokenRef = useRef(0);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminConsultationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback((search: string, nextOffset: number) => {
    const token = loadTokenRef.current + 1;
    loadTokenRef.current = token;
    setStatus('loading');
    adminConsultationsService
      .listConsultations({ search, limit: PAGE_SIZE, offset: nextOffset })
      .then((r) => {
        if (token !== loadTokenRef.current) return;
        setRows(r);
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

  const openDetail = (item: AdminConsultationListItem) => {
    setSelectedId(item.conversationId);
    setDetail(null);
    setDetailLoading(true);
    adminConsultationsService
      .getConsultation(item.conversationId)
      .then((x) => setDetail(x))
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  };

  const columns: AdminTableColumn<AdminConsultationListItem>[] = [
    { key: 'id', label: '상담 ID', flex: 2, mono: true, render: (r) => r.conversationId.slice(0, 12) },
    { key: 'user', label: '사용자', flex: 2, render: (r) => r.userDisplayName ?? '–' },
    { key: 'subject', label: '분석 대상자', flex: 2, render: (r) => r.subjectLabel ?? '–' },
    { key: 'created', label: '시작 시각', flex: 2, render: (r) => d(r.createdAt) },
    { key: 'msgs', label: '메시지 수', flex: 1, align: 'right', mono: true, render: (r) => String(r.messageCount) },
    { key: 'action', label: '상태', flex: 1, align: 'right', render: () => <AdminBadge label="완료" tone="success" /> },
  ];

  return (
    <Stack gap="xl">
      <AdminPageHeader title="상담 관리" subtitle="플랫폼 내 진행된 사용자 AI 상담 이력 및 상태를 모니터링합니다." />

      <AdminSearchInput
        value={searchText}
        onChangeText={setSearchText}
        onSubmit={() => {
          setOffset(0);
          setAppliedSearch(searchText.trim());
        }}
        placeholder="상담 ID, 사용자 검색"
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
          <AdminTable columns={columns} rows={rows} keyExtractor={(r) => r.conversationId} onRowPress={openDetail} />
          <AdminPagination
            offset={offset}
            limit={PAGE_SIZE}
            pageSize={rows.length}
            onPrev={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
            onNext={() => setOffset((o) => o + PAGE_SIZE)}
          />
        </Stack>
      )}

      <AdminDetailDrawer
        visible={selectedId !== null}
        onClose={() => setSelectedId(null)}
        title="상담 상세"
        badge={selectedId ? { label: selectedId.slice(0, 12), tone: 'neutral' } : undefined}
      >
        {detailLoading ? (
          <Text variant="bodyMedium" style={{ color: adminTheme.inkMuted }}>불러오는 중...</Text>
        ) : !detail ? (
          <Text variant="bodyMedium" style={{ color: adminTheme.inkMuted }}>상담 정보를 불러오지 못했습니다.</Text>
        ) : (
          <>
            <Section title="상담 정보">
              <Row label="사용자" value={detail.userDisplayName ?? '–'} />
              <Row label="분석 대상자" value={detail.subjectLabel ?? '–'} />
              <Row label="시작 시각" value={d(detail.createdAt)} />
              <Row label="최근 활동" value={d(detail.updatedAt)} />
              <Row label="메시지 수" value={String(detail.messageCount)} />
              <Row label="요약 저장" value={detail.hasSummary ? '있음' : '없음'} />
            </Section>

            <Section title="대화 (메타데이터)">
              <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>
                상담 내용은 개인정보 보호를 위해 원문 대신 메타데이터(역할 · 길이)만
                표시됩니다.
              </Text>
              {detail.messages.map((m) => (
                <Row key={m.seq} label={`#${m.seq} · ${m.role}`} value={`${m.length}자`} />
              ))}
            </Section>

            <Section title="기술 정보">
              <Row label="모델 / 토큰 / 비용 / 지연" value="미연결" />
              <Text variant="caption" style={{ color: adminTheme.inkMuted }}>
                모델·토큰·비용·응답시간 등 기술 지표는 상담-레벨 계측 연동 후
                표시됩니다. 임의 값을 표시하지 않습니다.
              </Text>
            </Section>
          </>
        )}
      </AdminDetailDrawer>
    </Stack>
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
