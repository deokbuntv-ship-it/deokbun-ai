import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { View } from 'react-native';

import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { AdminPageHeader, AdminStateView } from '@/features/admin';
import { adminRetentionService, type AdminRetentionOverview } from '@/features/admin/services/adminRetentionService';
import { adminTheme } from '@/features/admin/adminTheme';

// ADMIN 리텐션 / 알림 (§21-23) — read-only operability dashboard over the retention foundation. Real aggregate
// counts only (admin-guarded RPC), never any user's notification content. Metric honesty (§86): a failed load
// shows an explicit error state, not a misleading zero. There is intentionally NO create/send here: external
// push/email and a scheduler are not connected, so the screen states that plainly rather than implying an
// operator can dispatch notifications today.
type ScreenStatus = 'loading' | 'ready' | 'error';

export default function AdminRetentionScreen() {
  const [status, setStatus] = useState<ScreenStatus>('loading');
  const [data, setData] = useState<AdminRetentionOverview | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    const overview = await adminRetentionService.getOverview();
    if (overview === null) {
      setStatus('error');
      return;
    }
    setData(overview);
    setStatus('ready');
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const pct = (on: number, total: number): string => (total > 0 ? `${Math.round((on / total) * 100)}%` : '—');

  return (
    <Stack gap="xl">
      <AdminPageHeader
        title="리텐션 / 알림"
        subtitle="인앱 알림·중요한 일정·알림 수신 설정 현황입니다. 발송/스케줄러는 아직 연결되어 있지 않습니다."
      />

      {status !== 'ready' || !data ? (
        <AdminStateView state={status === 'loading' ? 'loading' : 'error'} onRetry={load} />
      ) : (
        <Stack gap="xl">
          <Section title="인앱 알림">
            <Tile label="전체" value={data.inAppTotal} />
            <Tile label="안읽음" value={data.inAppUnread} tone="warning" />
            <Tile label="읽음" value={data.inAppRead} />
          </Section>

          <Section title="중요한 일정">
            <Tile label="활성 일정" value={data.lifeEventsActive} />
          </Section>

          <Section title="알림 수신 설정 (동의 사용자 기준)">
            <Tile label="설정 사용자" value={data.notifPrefUsers} />
            <Tile label="월간운세 ON" value={`${data.notifPrefMonthlyOn} · ${pct(data.notifPrefMonthlyOn, data.notifPrefUsers)}`} />
            <Tile label="생일 ON" value={`${data.notifPrefBirthdayOn} · ${pct(data.notifPrefBirthdayOn, data.notifPrefUsers)}`} />
            <Tile label="마케팅 ON" value={`${data.notifPrefMarketingOn} · ${pct(data.notifPrefMarketingOn, data.notifPrefUsers)}`} />
          </Section>

          <Section title="최근 30일 열람">
            <Tile label="알림 열람" value={data.notificationOpened30d} />
            <Tile label="생일 메시지 열람" value={data.birthdayOpened30d} />
          </Section>

          <View style={{ borderWidth: 1, borderColor: adminTheme.border, borderRadius: 10, padding: 16, backgroundColor: adminTheme.warningBg }}>
            <Text variant="bodySmall" style={{ color: adminTheme.warning, fontWeight: '700' }}>
              발송 기능 미연결
            </Text>
            <Text variant="bodySmall" style={{ color: adminTheme.inkVariant, marginTop: 4, lineHeight: 18 }}>
              외부 푸시·이메일 발송과 예약 스케줄러는 아직 연결되어 있지 않습니다. 이 화면은 현황 조회 전용이며,
              여기서 사용자에게 알림을 생성·발송하지 않습니다. (발송 파이프라인 연결 후 관리 기능이 추가됩니다.)
            </Text>
          </View>
        </Stack>
      )}
    </Stack>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack gap="sm">
      <Text variant="bodyLarge" style={{ fontWeight: '700', color: adminTheme.ink }}>
        {title}
      </Text>
      <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>{children}</View>
    </Stack>
  );
}

function Tile({ label, value, tone }: { label: string; value: number | string; tone?: 'warning' }) {
  return (
    <View
      style={{
        minWidth: 150,
        flexGrow: 1,
        borderWidth: 1,
        borderColor: adminTheme.border,
        borderRadius: 10,
        padding: 16,
        backgroundColor: adminTheme.surface,
        gap: 6,
      }}
    >
      <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>
        {label}
      </Text>
      <Text variant="headingMedium" style={{ fontWeight: '700', color: tone === 'warning' ? adminTheme.warning : adminTheme.ink }}>
        {value}
      </Text>
    </View>
  );
}
