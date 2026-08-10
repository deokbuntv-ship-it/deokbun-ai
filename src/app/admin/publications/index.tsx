import { useCallback, useEffect, useRef, useState } from 'react';

import { Stack } from '@/components/Stack';
import { StatusBadge, type BadgeTone } from '@/components/StatusBadge';
import { Text } from '@/components/Text';
import {
  AdminDataTable,
  AdminPageHeader,
  AdminStateView,
  type AdminColumn,
} from '@/features/admin';
import {
  publicationService,
  type ScheduledPublicationItem,
} from '@/features/content';

type Status = 'loading' | 'ready' | 'error';

const COLUMNS: AdminColumn[] = [
  { key: 'title', header: '콘텐츠', flex: 4 },
  { key: 'channel', header: '채널', flex: 2 },
  { key: 'status', header: '상태', flex: 2 },
  { key: 'when', header: '예약/발행', flex: 3 },
];

const CHANNEL_LABEL: Record<string, string> = {
  web: '웹',
  naver_blog: '네이버 블로그',
  instagram: '인스타그램',
  youtube: '유튜브',
  video: '영상',
};
const STATUS_LABEL: Record<string, string> = {
  draft: '초안',
  scheduled: '예약',
  queued: '대기',
  processing: '처리중',
  published: '발행됨',
  failed: '실패',
  cancelled: '취소',
};
const STATUS_TONE: Record<string, BadgeTone> = {
  draft: 'neutral',
  scheduled: 'warning',
  queued: 'warning',
  processing: 'info',
  published: 'success',
  failed: 'danger',
  cancelled: 'neutral',
};

function fmt(iso: string | null): string {
  return iso ? iso.slice(0, 16).replace('T', ' ') : '–';
}

export default function AdminPublicationsScreen() {
  const [items, setItems] = useState<ScheduledPublicationItem[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const tokenRef = useRef(0);

  const load = useCallback(() => {
    const token = tokenRef.current + 1;
    tokenRef.current = token;
    setStatus('loading');
    publicationService
      .listScheduled(200)
      .then((rows) => {
        if (token !== tokenRef.current) return;
        setItems(rows);
        setStatus('ready');
      })
      .catch(() => {
        if (token !== tokenRef.current) return;
        setStatus('error');
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Stack gap="xl">
      <AdminPageHeader
        title="발행 현황"
        subtitle="예약/발행 파이프라인 (읽기 전용). 자동 외부 발행은 소유자 승인 전까지 비활성입니다."
      />

      {status === 'loading' ? (
        <AdminStateView state="loading" />
      ) : status === 'error' ? (
        <AdminStateView
          state="error"
          message="발행 현황을 불러오지 못했습니다. SCHEDULER_SETUP.sql 적용 및 관리자 권한을 확인해 주세요."
          onRetry={load}
        />
      ) : items.length === 0 ? (
        <AdminStateView state="empty" message="예약/발행 기록이 없습니다." />
      ) : (
        <AdminDataTable
          columns={COLUMNS}
          rows={items}
          keyExtractor={(item) => item.id}
          renderCell={(item, columnKey) => {
            if (columnKey === 'title') {
              return (
                <Text variant="bodySmall">
                  {item.contentTitle || '(제목 없음)'}
                </Text>
              );
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
                <Text
                  variant="bodySmall"
                  colorToken={item.status === 'failed' ? 'danger' : 'textPrimary'}
                >
                  {STATUS_LABEL[item.status] ?? item.status}
                </Text>
              );
            }
            return (
              <Text variant="bodySmall" colorToken="textSecondary">
                {item.scheduledAt
                  ? `예약 ${fmt(item.scheduledAt)}`
                  : item.publishedAt
                    ? `발행 ${fmt(item.publishedAt)}`
                    : '–'}
              </Text>
            );
          }}
        />
      )}
    </Stack>
  );
}
