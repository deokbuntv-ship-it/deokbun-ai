import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import {
  AdminPageHeader,
  AdminStateView,
  KpiCard,
  TrendChart,
  adminOpsService,
  type AdminDailyActivityPoint,
  type AdminDashboardOverview,
} from '@/features/admin';
import { adminTheme } from '@/features/admin/adminTheme';
import { NOT_INSTALLED_LABEL, adminPricingService, summarizeWindow } from '@/features/admin/services/adminPricingService';

// ADMIN_01_DASHBOARD (Stitch final_lock_1). "서비스가 정상인가?"를 빠르게 판단하는
// 운영 콘솔. KPI/추이는 실제 adminOpsService 데이터에 연결.
//
// ⚠ 2026-09-07 — "오늘 AI 비용" 이 **"준비 중 · 정산 API 연동 필요"** 였다. 그 문장이 틀렸다:
//   필요한 것은 정산 API 가 아니라 **단가**였고, 이제 오너가 화면에서 넣는다. 단가가 있으면
//   실제 금액이, 없으면 "단가 미입력" 이 나온다. **어느 쪽도 0원이 아니다** — 돈을 안 쓴 것과
//   얼마인지 모르는 것은 다르다(§27 Mock 금지의 본뜻).
type Status = 'loading' | 'ready' | 'error';
const TREND_DAYS = 30;
/** 자정으로 자르면 새벽 1시에 "오늘 비용 0원" 이 뜬다. AI 사용량 화면과 같은 창을 쓴다. */
const COST_WINDOW_HOURS = 24;

/** `undefined` 로딩 · `null` 모름 · 문자열 표시값. */
type TodayCost = { value: string; sub: string } | null;

export default function AdminDashboardScreen() {
  const [overview, setOverview] = useState<AdminDashboardOverview | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [trends, setTrends] = useState<AdminDailyActivityPoint[]>([]);
  const [trendsOk, setTrendsOk] = useState<boolean>(true);
  const [todayCost, setTodayCost] = useState<TodayCost>(null);
  const loadTokenRef = useRef(0);

  const load = useCallback(() => {
    const token = loadTokenRef.current + 1;
    loadTokenRef.current = token;
    setStatus('loading');
    adminOpsService
      .getDashboardOverview()
      .then((result) => {
        if (token !== loadTokenRef.current) return;
        setOverview(result);
        setStatus('ready');
      })
      .catch(() => {
        if (token !== loadTokenRef.current) return;
        setStatus('error');
      });
  }, []);

  useEffect(() => {
    load();
    adminOpsService
      .getDailyActivity(TREND_DAYS)
      .then((rows) => {
        setTrends(rows);
        setTrendsOk(true);
      })
      .catch(() => setTrendsOk(false));

    // ⚠ 대시보드가 이것 때문에 안 뜨면 안 된다. 실패하면 카드 하나만 "확인 불가" 가 된다.
    void (async () => {
      try {
        const [win, prices, fx] = await Promise.all([
          adminPricingService.costWindow(COST_WINDOW_HOURS),
          adminPricingService.listPrices(),
          adminPricingService.getFx(),
        ]);
        // ⚠ 네 갈래를 한 문장으로 묶지 않는다. "아직 안 깔렸다" 를 "고장" 으로 그리면
        //   오너가 재시도를 반복하게 된다 — 할 일은 마이그레이션 적용이다.
        if (win.kind === 'not_installed') { setTodayCost({ value: '미설치', sub: NOT_INSTALLED_LABEL }); return; }
        if (win.kind === 'forbidden') { setTodayCost({ value: '권한 없음', sub: '원가 집계를 볼 권한이 없습니다' }); return; }
        if (win.kind === 'failed') { setTodayCost({ value: '확인 불가', sub: '집계를 불러오지 못했습니다' }); return; }
        if (win.rows.length === 0) { setTodayCost({ value: '₩0', sub: `최근 ${COST_WINDOW_HOURS}시간 AI 요청 없음` }); return; }
        const sum = summarizeWindow(win.rows, prices, fx?.rate ?? null);
        // ⚠ 하나도 값을 못 매기면 합은 0이지만 그것은 **모른다** 다. ₩0 으로 그리지 않는다.
        if (sum.priced === 0) {
          setTodayCost({ value: `가격 미확인`, sub: `${sum.requests.toLocaleString()}건 · 단가를 넣으면 금액이 보입니다` });
          return;
        }
        if (sum.krw === null) {
          setTodayCost({
            value: prices.length === 0 ? '단가 미입력' : `${sum.usd.toFixed(2)}`,
            sub: prices.length === 0
              ? 'AI 사용량 화면에서 단가를 넣으면 보입니다'
              : `${sum.requests.toLocaleString()}건 · 환율 미입력`,
          });
          return;
        }
        setTodayCost({
          value: `₩${Math.round(sum.krw).toLocaleString()}`,
          sub: `최근 ${COST_WINDOW_HOURS}시간 ${sum.requests.toLocaleString()}건`
            + (sum.unpriced.length > 0 ? ` · ⚠ 단가 없는 모델 ${sum.unpriced.length}종 제외` : ''),
        });
      } catch {
        setTodayCost({ value: '확인 불가', sub: '집계를 불러오지 못했습니다' });
      }
    })();
  }, [load]);

  const trendDays = trends.map((t) => t.day);
  const successRate =
    overview && overview.aiRequestCount > 0
      ? `${((overview.aiSuccessCount / overview.aiRequestCount) * 100).toFixed(1)}%`
      : '—';

  return (
    <Stack gap="xl">
      <AdminPageHeader title="대시보드 (전체 현황)" subtitle="덕분AI 운영 현황을 한눈에 확인합니다." />

      {status === 'loading' ? (
        <AdminStateView state="loading" />
      ) : status === 'error' || overview === null ? (
        <AdminStateView
          state="error"
          message="운영 지표를 불러오지 못했습니다. 관리자 권한 또는 운영 지표 DB 설정을 확인해 주세요."
          onRetry={load}
        />
      ) : (
        <Stack gap="xl">
          {/* Primary KPIs (real data; cost pending pricing integration) */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
            <KpiCard label="전체 사용자" value={overview.userCount.toLocaleString()} />
            <KpiCard label="오늘 상담" value={overview.conversationToday.toLocaleString()} />
            <KpiCard label="AI 요청 (누적)" value={overview.aiRequestCount.toLocaleString()} />
            <KpiCard
              label="AI 상담 성공률"
              value={successRate}
              trend={
                overview.aiErrorCount > 0
                  ? { text: `시스템 오류 ${overview.aiErrorCount.toLocaleString()}건`, direction: 'danger' }
                  : { text: '오류 없음', direction: 'up' }
              }
            />
            <KpiCard
              label="오늘 AI 비용"
              value={todayCost ? todayCost.value : '불러오는 중'}
              sub={todayCost ? todayCost.sub : `최근 ${COST_WINDOW_HOURS}시간 기준`}
            />
          </View>

          {/* AI usage (real token/request counts) */}
          <Stack gap="sm">
            <Text variant="headingMedium" style={{ color: adminTheme.ink }}>
              AI 사용량
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
              <KpiCard label="오늘 AI 요청" value={overview.aiTodayRequestCount.toLocaleString()} />
              <KpiCard label="AI 실패" value={overview.aiErrorCount.toLocaleString()} />
              <KpiCard label="입력 토큰" value={overview.aiInputTokens.toLocaleString()} />
              <KpiCard label="출력 토큰" value={overview.aiOutputTokens.toLocaleString()} />
            </View>
            <Text variant="caption" style={{ color: adminTheme.inkMuted }}>
              AI 지표는 chat Edge Function이 기록한 사용량 로그 기준입니다.
            </Text>
          </Stack>

          {/* Trends */}
          <Stack gap="sm">
            <Text variant="headingMedium" style={{ color: adminTheme.ink }}>
              최근 {TREND_DAYS}일 추이
            </Text>
            {!trendsOk ? (
              <Text variant="caption" style={{ color: adminTheme.inkMuted }}>
                추이 데이터를 불러올 수 없습니다. DASHBOARD_TRENDS_SETUP.sql 적용이 필요합니다.
              </Text>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
                <View style={{ flex: 1, minWidth: 260 }}>
                  <TrendChart title="신규 사용자" unit="명" days={trendDays} values={trends.map((t) => t.newUsers)} />
                </View>
                <View style={{ flex: 1, minWidth: 260 }}>
                  <TrendChart title="상담" days={trendDays} values={trends.map((t) => t.consultations)} />
                </View>
                <View style={{ flex: 1, minWidth: 260 }}>
                  <TrendChart title="AI 요청" unit="회" days={trendDays} values={trends.map((t) => t.aiRequests)} />
                </View>
              </View>
            )}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}
