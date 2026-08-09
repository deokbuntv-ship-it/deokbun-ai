import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { Card } from '@/components/Card';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import {
  AdminPageHeader,
  AdminStateView,
  adminOpsService,
  type AdminDashboardOverview,
} from '@/features/admin';

type Status = 'loading' | 'ready' | 'error';

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ width: 180 }}>
      <Card>
        <Stack gap="xs">
          <Text variant="bodySmall" colorToken="textSecondary">
            {label}
          </Text>
          <Text variant="displayMedium">{value}</Text>
        </Stack>
      </Card>
    </View>
  );
}

export default function AdminDashboardScreen() {
  const [overview, setOverview] = useState<AdminDashboardOverview | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const loadTokenRef = useRef(0);

  const load = useCallback(() => {
    const token = loadTokenRef.current + 1;
    loadTokenRef.current = token;
    setStatus('loading');

    adminOpsService
      .getDashboardOverview()
      .then((result) => {
        if (token !== loadTokenRef.current) {
          return;
        }
        setOverview(result);
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
    load();
  }, [load]);

  return (
    <Stack gap="xl">
      <AdminPageHeader title="대시보드" subtitle="덕분AI 운영 현황" />

      {status === 'loading' ? (
        <AdminStateView state="loading" />
      ) : status === 'error' || overview === null ? (
        <AdminStateView
          state="error"
          message="운영 지표를 불러오지 못했습니다. 관리자 권한 또는 운영 지표 DB 설정을 확인해 주세요."
          onRetry={load}
        />
      ) : (
        <Stack gap="lg">
          <Stack gap="sm">
            <Text variant="headingMedium">서비스</Text>
            <View
              style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}
            >
              <StatCard label="사용자" value={String(overview.userCount)} />
              <StatCard label="상담 대상" value={String(overview.subjectCount)} />
              <StatCard label="상담" value={String(overview.conversationCount)} />
              <StatCard
                label="오늘 상담"
                value={String(overview.conversationToday)}
              />
            </View>
          </Stack>

          <Stack gap="sm">
            <Text variant="headingMedium">AI 사용량</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              <StatCard
                label="AI 요청"
                value={String(overview.aiRequestCount)}
              />
              <StatCard
                label="AI 실패"
                value={String(overview.aiErrorCount)}
              />
              <StatCard
                label="오늘 AI 요청"
                value={String(overview.aiTodayRequestCount)}
              />
              <StatCard
                label="입력 토큰"
                value={String(overview.aiInputTokens)}
              />
              <StatCard
                label="출력 토큰"
                value={String(overview.aiOutputTokens)}
              />
            </View>
            <Text variant="caption" colorToken="textSecondary">
              AI 지표는 chat Edge Function이 기록한 사용량 로그 기준입니다(엔진
              연동/재배포 후 누적).
            </Text>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}
