import { useCallback, useEffect, useRef, useState } from 'react';

import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import {
  AdminDataTable,
  AdminPageHeader,
  AdminPagination,
  AdminSelect,
  AdminStateView,
  adminOpsService,
  type AdminAiUsageItem,
  type AdminColumn,
} from '@/features/admin';

const TYPE_FILTER_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'chat', label: '상담' },
  { value: 'content_generate', label: '콘텐츠' },
  { value: 'famous_suggest', label: 'Famous' },
  { value: 'image_generate', label: '이미지' },
  { value: 'video_generate', label: '영상' },
];

type Status = 'loading' | 'ready' | 'error';

const PAGE_SIZE = 50;

const COLUMNS: AdminColumn[] = [
  { key: 'createdAt', header: '시각', flex: 3 },
  { key: 'type', header: '유형', flex: 3 },
  { key: 'model', header: '모델', flex: 3 },
  { key: 'status', header: '상태', flex: 2 },
  { key: 'input', header: '입력', flex: 1, align: 'right' },
  { key: 'output', header: '출력', flex: 1, align: 'right' },
  { key: 'latency', header: '지연(ms)', flex: 2, align: 'right' },
];

const REQUEST_TYPE_LABEL: Record<string, string> = {
  chat: '상담',
  content_generate: '콘텐츠 생성',
  famous_suggest: 'Famous 제안',
  image_generate: '이미지 생성',
  video_generate: '영상 생성',
};

function formatDateTime(iso: string | null): string {
  return iso ? iso.slice(0, 16).replace('T', ' ') : '–';
}

// Thousands-separated counts/latency (1945 → 1,945). Null stays as an em dash.
function formatCount(n: number | null | undefined): string {
  return typeof n === 'number' ? n.toLocaleString() : '–';
}

export default function AdminAiUsageScreen() {
  const [items, setItems] = useState<AdminAiUsageItem[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [offset, setOffset] = useState(0);
  const [typeFilter, setTypeFilter] = useState('');
  const loadTokenRef = useRef(0);

  const load = useCallback(
    (nextOffset: number, requestType: string) => {
      const token = loadTokenRef.current + 1;
      loadTokenRef.current = token;
      setStatus('loading');

      adminOpsService
        .listAiUsage({
          limit: PAGE_SIZE,
          offset: nextOffset,
          requestType: requestType || null,
        })
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
    },
    [],
  );

  useEffect(() => {
    load(offset, typeFilter);
  }, [load, offset, typeFilter]);

  return (
    <Stack gap="xl">
      <AdminPageHeader
        title="AI 사용량"
        subtitle="LLM 호출 사용량/오류 로그 (원문 미포함)."
      />

      <AdminSelect
        label="유형"
        options={TYPE_FILTER_OPTIONS}
        value={typeFilter}
        onChange={(v) => {
          setOffset(0);
          setTypeFilter(v);
        }}
      />

      {status === 'loading' ? (
        <AdminStateView state="loading" />
      ) : status === 'error' ? (
        <AdminStateView
          state="error"
          message="AI 사용량 로그를 불러오지 못했습니다. 유형 필터는 SQL 업데이트(ADMIN_04_UPDATE_usage_filter.sql) 적용 후 동작합니다."
          onRetry={() => load(offset, typeFilter)}
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
              if (columnKey === 'type') {
                return (
                  <Text variant="bodySmall" colorToken="textSecondary">
                    {item.requestType
                      ? (REQUEST_TYPE_LABEL[item.requestType] ?? item.requestType)
                      : '–'}
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
                  <Text variant="bodySmall">{formatCount(item.inputTokens)}</Text>
                );
              }
              if (columnKey === 'output') {
                return (
                  <Text variant="bodySmall">{formatCount(item.outputTokens)}</Text>
                );
              }
              return (
                <Text variant="bodySmall" colorToken="textSecondary">
                  {formatCount(item.latencyMs)}
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
