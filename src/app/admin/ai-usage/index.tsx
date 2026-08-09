import { useCallback, useEffect, useRef, useState } from 'react';

import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import {
  AdminDataTable,
  AdminPageHeader,
  AdminPagination,
  AdminStateView,
  adminOpsService,
  type AdminAiUsageItem,
  type AdminColumn,
} from '@/features/admin';

type Status = 'loading' | 'ready' | 'error';

const PAGE_SIZE = 50;

const COLUMNS: AdminColumn[] = [
  { key: 'createdAt', header: '시각', flex: 3 },
  { key: 'model', header: '모델', flex: 3 },
  { key: 'status', header: '상태', flex: 2 },
  { key: 'input', header: '입력', flex: 1, align: 'right' },
  { key: 'output', header: '출력', flex: 1, align: 'right' },
  { key: 'latency', header: '지연(ms)', flex: 2, align: 'right' },
];

function formatDateTime(iso: string | null): string {
  return iso ? iso.slice(0, 16).replace('T', ' ') : '–';
}

export default function AdminAiUsageScreen() {
  const [items, setItems] = useState<AdminAiUsageItem[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [offset, setOffset] = useState(0);
  const loadTokenRef = useRef(0);

  const load = useCallback((nextOffset: number) => {
    const token = loadTokenRef.current + 1;
    loadTokenRef.current = token;
    setStatus('loading');

    adminOpsService
      .listAiUsage({ limit: PAGE_SIZE, offset: nextOffset })
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
    load(offset);
  }, [load, offset]);

  return (
    <Stack gap="xl">
      <AdminPageHeader
        title="AI 사용량"
        subtitle="LLM 호출 사용량/오류 로그 (원문 미포함)."
      />

      {status === 'loading' ? (
        <AdminStateView state="loading" />
      ) : status === 'error' ? (
        <AdminStateView
          state="error"
          message="AI 사용량 로그를 불러오지 못했습니다. 운영 지표 DB 설정을 확인해 주세요."
          onRetry={() => load(offset)}
        />
      ) : items.length === 0 ? (
        <AdminStateView
          state="empty"
          message="기록된 AI 사용량이 없습니다. (Edge Function 재배포 후 상담이 발생하면 누적됩니다.)"
        />
      ) : (
        <Stack gap="md">
          <AdminDataTable
            columns={COLUMNS}
            rows={items}
            keyExtractor={(item) => item.id}
            renderCell={(item, columnKey) => {
              if (columnKey === 'createdAt') {
                return (
                  <Text variant="bodySmall" colorToken="textSecondary">
                    {formatDateTime(item.createdAt)}
                  </Text>
                );
              }
              if (columnKey === 'model') {
                return <Text variant="bodySmall">{item.model ?? '–'}</Text>;
              }
              if (columnKey === 'status') {
                return (
                  <Text
                    variant="bodySmall"
                    colorToken={item.status === 'error' ? 'danger' : 'textSecondary'}
                  >
                    {item.status === 'error'
                      ? `오류${item.errorCode ? ` (${item.errorCode})` : ''}`
                      : '성공'}
                  </Text>
                );
              }
              if (columnKey === 'input') {
                return (
                  <Text variant="bodySmall">
                    {item.inputTokens ?? '–'}
                  </Text>
                );
              }
              if (columnKey === 'output') {
                return (
                  <Text variant="bodySmall">
                    {item.outputTokens ?? '–'}
                  </Text>
                );
              }
              return (
                <Text variant="bodySmall" colorToken="textSecondary">
                  {item.latencyMs ?? '–'}
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
