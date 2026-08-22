import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';

import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import {
  AdminDataTable,
  AdminPageHeader,
  AdminPagination,
  AdminSelect,
  AdminStateView,
  KpiCard,
  adminOpsService,
  type AdminAiUsageItem,
  type AdminColumn,
} from '@/features/admin';
import { adminTheme } from '@/features/admin/adminTheme';
import { aggregateUsageCost } from '@/features/admin/operational/operationalContracts';
import { adminPricingRepository, UNPRICED_LABEL } from '@/features/admin/operational/modelPricing';

// ADMIN_08_AI_COST (Stitch ai_final_lock). Cost KPIs / trend / thresholds require
// a pricing/settlement contract that is not connected → they render truthful
// "연결 준비 중" states (no fabricated KRW). The real, connected data below is the
// LLM usage/error log (token counts). No fake cost values (§9/§10/§27).
const COST_KPIS = ['오늘 비용', '이번 달 비용', '월 예상 비용', '상담당 평균 비용'];

function AiCostHeader() {
  return (
    <Stack gap="md">
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        {COST_KPIS.map((label) => (
          <KpiCard key={label} label={label} value="—" sub="비용 데이터 연결 준비 중" />
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        {/* Cost trend chart shell */}
        <View style={{ flex: 2, minWidth: 320, backgroundColor: adminTheme.surface, borderWidth: 1, borderColor: adminTheme.border, borderRadius: 8, padding: 20, gap: 8, minHeight: 160, justifyContent: 'center', alignItems: 'center' }}>
          <Text variant="headingMedium" style={{ color: adminTheme.ink }}>비용 추이 및 예측</Text>
          <Text variant="bodySmall" style={{ color: adminTheme.inkMuted, textAlign: 'center' }}>
            비용 추이/예측 차트는 가격 정산 API 연동 후 표시됩니다. 임의의 비용
            값을 표시하지 않습니다.
          </Text>
        </View>
        {/* Threshold UI (no persistence API → not saved) */}
        <View style={{ flex: 1, minWidth: 260, backgroundColor: adminTheme.surface, borderWidth: 1, borderColor: adminTheme.border, borderRadius: 8, padding: 20, gap: 10 }}>
          <Text variant="headingMedium" style={{ color: adminTheme.ink }}>비용 임계값 설정</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>주의 임계값</Text>
            <Text variant="bodySmall" style={{ color: adminTheme.inkVariant }}>— (연동 후 설정)</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>위험 임계값</Text>
            <Text variant="bodySmall" style={{ color: adminTheme.inkVariant }}>— (연동 후 설정)</Text>
          </View>
          <Text variant="caption" style={{ color: adminTheme.warning }}>
            저장 기능 미연결 — 임계값은 설정 저장 API 연동 후 반영됩니다.
          </Text>
        </View>
      </View>
    </Stack>
  );
}

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

// Model-breakdown cost from the CURRENTLY-LOADED usage rows (§5.5/§5.6). Verified-pricing models show a real USD
// cost; unverified models (e.g. gpt-5.6-terra) show "가격 미확인" — never a fabricated number. Windowed all-time
// cost still needs server aggregation, so this is scoped to the loaded page and labeled as such.
function CostByModel({ items }: { items: AdminAiUsageItem[] }) {
  const agg = useMemo(
    () =>
      aggregateUsageCost(
        items.map((i) => ({
          model: i.model ?? 'unknown',
          inputTokens: i.inputTokens ?? 0,
          cachedInputTokens: 0,
          outputTokens: i.outputTokens ?? 0,
        })),
        adminPricingRepository.asMap(),
      ),
    [items],
  );
  if (agg.byModel.length === 0) return null;
  return (
    <View style={{ gap: 8 }}>
      <Text variant="headingMedium" style={{ color: adminTheme.ink }}>
        모델별 비용 · 현재 조회된 로그 기준
      </Text>
      <Text variant="caption" style={{ color: adminTheme.inkMuted }}>
        검증된 단가 모델만 비용(USD)을 표시합니다. 단가 미확인 모델은 “가격 미확인”으로 표시돼요. 전체 기간 집계는 정산 연동 후 제공됩니다.
      </Text>
      {agg.byModel.map((m) => (
        <View key={m.model} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
          <Text variant="bodySmall" style={{ color: adminTheme.ink }}>
            {m.model}
          </Text>
          <Text variant="bodySmall" style={{ color: adminTheme.inkVariant }}>
            {m.requests}건 · 입력 {m.inputTokens.toLocaleString()} · 출력 {m.outputTokens.toLocaleString()} ·{' '}
            {m.cost ? `$${m.cost.total.toFixed(4)}` : UNPRICED_LABEL}
          </Text>
        </View>
      ))}
    </View>
  );
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
        title="AI 사용량 · 비용"
        subtitle="청구 및 사용량 분석. 비용 지표는 정산 연동 후, 사용량 로그는 실데이터입니다."
      />

      <AiCostHeader />

      <CostByModel items={items} />

      <Text variant="headingMedium" style={{ color: adminTheme.ink }}>
        모델별 사용량 로그
      </Text>

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
