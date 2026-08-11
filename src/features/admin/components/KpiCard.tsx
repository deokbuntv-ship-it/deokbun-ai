import { View } from 'react-native';

import { Text } from '@/components/Text';

import { adminTheme } from '../adminTheme';

// KPI card (Stitch admin): white surface, 1px border, label + large value, and an
// optional trend/sub note in the top-right or below. Numbers use a slightly
// larger weight for scannability. No shadow (flat, border-defined).
export type KpiTrend = 'up' | 'down' | 'neutral' | 'danger';

type KpiCardProps = {
  label: string;
  value: string;
  trend?: { text: string; direction?: KpiTrend };
  sub?: string;
};

const TREND_COLOR: Record<KpiTrend, string> = {
  up: adminTheme.success,
  down: adminTheme.info,
  neutral: adminTheme.inkMuted,
  danger: adminTheme.danger,
};

export function KpiCard({ label, value, trend, sub }: KpiCardProps) {
  return (
    <View
      style={{
        flex: 1,
        minWidth: 200,
        backgroundColor: adminTheme.surface,
        borderWidth: 1,
        borderColor: adminTheme.border,
        borderRadius: 8,
        padding: 20,
        gap: 8,
      }}
    >
      <Text variant="bodySmall" style={{ color: adminTheme.inkVariant }}>
        {label}
      </Text>
      <Text
        variant="displayMedium"
        style={{ color: adminTheme.ink, fontWeight: '700' }}
      >
        {value}
      </Text>
      {trend ? (
        <Text
          variant="bodySmall"
          style={{ color: TREND_COLOR[trend.direction ?? 'neutral'], fontWeight: '600' }}
        >
          {trend.text}
        </Text>
      ) : sub ? (
        <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>
          {sub}
        </Text>
      ) : null}
    </View>
  );
}
