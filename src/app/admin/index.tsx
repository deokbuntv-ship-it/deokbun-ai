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

// ADMIN_01_DASHBOARD (Stitch final_lock_1). "서비스가 정상인가?"를 빠르게 판단하는
// 운영 콘솔. KPI/추이는 실제 adminOpsService 데이터에 연결. 가격 정산 API가 없어
// AI 비용은 가짜 값 대신 "준비 중"으로 표시(§27 Mock 금지).
type Status = 'loading' | 'ready' | 'error';
const TREND_DAYS = 30;

export default function AdminDashboardScreen() {
  const [overview, setOverview] = useState<AdminDashboardOverview | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [trends, setTrends] = useState<AdminDailyActivityPoint[]>([]);
  const [trendsOk, setTrendsOk] = useState<boolean>(true);
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
            <KpiCard label="오늘 AI 비용" value="준비 중" sub="정산 API 연동 필요" />
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
