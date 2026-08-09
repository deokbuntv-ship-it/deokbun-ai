import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import {
  AdminDataTable,
  AdminDetailSection,
  AdminPageHeader,
  AdminStateView,
  adminConsultationsService,
  type AdminColumn,
  type AdminConsultationDetail,
  type AdminMessageMeta,
} from '@/features/admin';

type DetailStatus = 'loading' | 'ready' | 'error' | 'notfound';

function formatDate(iso: string | null): string {
  return iso ? iso.slice(0, 10) : '–';
}

const ROLE_LABEL: Record<string, string> = {
  user: '사용자',
  assistant: 'AI',
};

const MESSAGE_COLUMNS: AdminColumn[] = [
  { key: 'seq', header: '#', flex: 1 },
  { key: 'role', header: '역할', flex: 2 },
  { key: 'length', header: '길이', flex: 1, align: 'right' },
];

export default function AdminConsultationDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ conversationId?: string }>();
  const conversationId =
    typeof params.conversationId === 'string'
      ? params.conversationId
      : undefined;

  const [detail, setDetail] = useState<AdminConsultationDetail | null>(null);
  const [status, setStatus] = useState<DetailStatus>('loading');
  const loadTokenRef = useRef(0);

  const load = useCallback(() => {
    if (conversationId === undefined) {
      setStatus('notfound');
      return;
    }
    const token = loadTokenRef.current + 1;
    loadTokenRef.current = token;
    setStatus('loading');

    adminConsultationsService
      .getConsultation(conversationId)
      .then((result) => {
        if (token !== loadTokenRef.current) {
          return;
        }
        if (result === null) {
          setStatus('notfound');
          return;
        }
        setDetail(result);
        setStatus('ready');
      })
      .catch(() => {
        if (token !== loadTokenRef.current) {
          return;
        }
        setStatus('error');
      });
  }, [conversationId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Stack gap="xl">
      <Stack direction="row" gap="sm" align="center">
        <Button
          label="← 목록"
          variant="secondary"
          onPress={() => router.push('/admin/consultations')}
        />
      </Stack>

      {status === 'loading' ? (
        <AdminStateView state="loading" />
      ) : status === 'notfound' ? (
        <AdminStateView state="empty" message="상담을 찾을 수 없습니다." />
      ) : status === 'error' || detail === null ? (
        <AdminStateView
          state="error"
          message="상담 정보를 불러오지 못했습니다."
          onRetry={load}
        />
      ) : (
        <>
          <AdminPageHeader
            title="상담 상세"
            subtitle="메타데이터만 표시됩니다 (대화 원문 미노출)."
          />
          <AdminDetailSection
            title="정보"
            rows={[
              { label: '상담 ID', value: detail.conversationId },
              { label: '사용자', value: detail.userDisplayName ?? '–' },
              { label: '대상', value: detail.subjectLabel ?? '–' },
              { label: '생성일', value: formatDate(detail.createdAt) },
              { label: '최근', value: formatDate(detail.updatedAt) },
              { label: '메시지 수', value: String(detail.messageCount) },
              { label: '요약 존재', value: detail.hasSummary ? '있음' : '없음' },
            ]}
          />
          <Stack gap="sm">
            <Text variant="headingMedium">메시지 (메타데이터)</Text>
            {detail.messages.length === 0 ? (
              <AdminStateView state="empty" message="메시지가 없습니다." />
            ) : (
              <AdminDataTable
                columns={MESSAGE_COLUMNS}
                rows={detail.messages}
                keyExtractor={(m: AdminMessageMeta) => String(m.seq)}
                renderCell={(m, columnKey) => {
                  if (columnKey === 'seq') {
                    return (
                      <Text variant="bodySmall" colorToken="textSecondary">
                        {String(m.seq)}
                      </Text>
                    );
                  }
                  if (columnKey === 'role') {
                    return (
                      <Text variant="bodyMedium">
                        {ROLE_LABEL[m.role] ?? m.role}
                      </Text>
                    );
                  }
                  return (
                    <Text variant="bodySmall" colorToken="textSecondary">
                      {String(m.length)}
                    </Text>
                  );
                }}
              />
            )}
            <Card>
              <Text variant="caption" colorToken="textSecondary">
                개인정보 보호: 상담 대화 원문과 요약 텍스트는 관리자 화면에
                노출되지 않습니다. 운영에 필요한 메타데이터만 제공됩니다.
              </Text>
            </Card>
          </Stack>
        </>
      )}
    </Stack>
  );
}
