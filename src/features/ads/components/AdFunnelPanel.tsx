import { View } from 'react-native';

import { Text } from '@/components/Text';
import { adminTheme } from '@/features/admin/adminTheme';
import { formatRate, type AdFunnelCounts, type AdPerformanceRow } from '@/features/ads';

// Per-ad funnel (§16). Renders the ordered acquisition steps with REAL counts only. When
// the tracking backend isn't deployed yet, `connected=false` shows a truthful "집계 준비 중"
// state — never fabricated numbers (§37).
const STEPS: { key: keyof AdFunnelCounts; label: string }[] = [
  { key: 'clicks', label: '유입' },
  { key: 'birthInfoCompleted', label: '출생정보 완료' },
  { key: 'signups', label: '가입' },
  { key: 'firstConsultations', label: '첫 상담' },
  { key: 'd1', label: 'D1' },
  { key: 'd7', label: 'D7' },
  { key: 'd30', label: 'D30' },
];

function Row({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: adminTheme.border,
      }}
    >
      <Text variant="bodySmall" style={{ color: adminTheme.inkVariant }}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
        {sub ? (
          <Text variant="caption" style={{ color: adminTheme.inkMuted }}>
            {sub}
          </Text>
        ) : null}
        <Text variant="bodyMedium" style={{ color: adminTheme.ink, fontWeight: '700' }}>
          {value}
        </Text>
      </View>
    </View>
  );
}

export function AdFunnelPanel({
  connected,
  perf,
}: {
  connected: boolean;
  perf: AdPerformanceRow | null;
}) {
  if (!connected || !perf) {
    return (
      <View style={{ padding: 16 }}>
        <Text variant="bodySmall" style={{ color: adminTheme.inkVariant }}>
          유입·전환 집계는 추적 백엔드(광고 트래킹 마이그레이션 + ad-track 함수) 배포 후 표시됩니다.
        </Text>
      </View>
    );
  }
  const c = perf.counts;
  const rateFor = (key: keyof AdFunnelCounts): string | undefined => {
    if (key === 'birthInfoCompleted') return formatRate(perf.birthConversion);
    if (key === 'signups') return formatRate(perf.signupConversion);
    if (key === 'firstConsultations') return formatRate(perf.clickToFirstConsult);
    if (key === 'd1') return formatRate(perf.d1Retention);
    if (key === 'd7') return formatRate(perf.d7Retention);
    if (key === 'd30') return formatRate(perf.d30Retention);
    return undefined;
  };
  return (
    <View>
      {STEPS.map((s) => {
        const raw = c[s.key];
        const value = typeof raw === 'number' ? String(raw) : '—';
        return <Row key={s.key} label={s.label} value={value} sub={rateFor(s.key)} />;
      })}
      {c.uniqueVisitors !== null ? (
        <Row label="고유 유입(추정)" value={String(c.uniqueVisitors)} />
      ) : null}
    </View>
  );
}
