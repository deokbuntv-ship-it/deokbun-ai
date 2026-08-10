import { View } from 'react-native';

import { Card } from '@/components/Card';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius } from '@/theme';

// Dependency-free, UNIVERSAL (web + native) trend bar chart. Recharts was
// investigated (React 19 makes v3 compatible; .web.tsx could isolate it) but not
// adopted: proving the native bundle stays clean (§95) is impractical here, and
// this View-based chart delivers the same real trend value with zero bundle risk.
//
// Real data only — an all-zero series renders an explicit empty state, never a
// fake chart (§50). Accessible: title + total + per-bar accessibilityLabel (not
// color alone, §49/§80).
export function TrendChart({
  title,
  unit = '건',
  days,
  values,
}: {
  title: string;
  unit?: string;
  days: string[]; // yyyy-mm-dd per point
  values: number[];
}) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  const total = values.reduce((a, b) => a + b, 0);
  const max = Math.max(1, ...values);
  const CHART_H = 72;

  return (
    <Card elevation="sm">
      <Stack gap="sm">
        <Stack direction="row" align="center" style={{ justifyContent: 'space-between' }}>
          <Text variant="bodySmall" style={{ fontWeight: '600' }}>
            {title}
          </Text>
          <Text variant="caption" colorToken="textSecondary">
            {total.toLocaleString()}
            {unit} · 최근 {values.length}일
          </Text>
        </Stack>

        {total === 0 ? (
          <Text variant="caption" colorToken="textSecondary">
            아직 집계할 데이터가 없습니다.
          </Text>
        ) : (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              height: CHART_H,
              gap: 2,
            }}
            accessibilityRole="image"
            accessibilityLabel={`${title} 최근 ${values.length}일 추이, 합계 ${total}${unit}`}
          >
            {values.map((v, i) => (
              <View
                key={i}
                accessibilityLabel={`${days[i] ?? ''}: ${v}${unit}`}
                style={{
                  flex: 1,
                  height: Math.max(2, Math.round((v / max) * CHART_H)),
                  backgroundColor: theme.primary,
                  opacity: v === 0 ? 0.25 : 1,
                  borderRadius: radius.sm,
                  minWidth: 3,
                }}
              />
            ))}
          </View>
        )}
      </Stack>
    </Card>
  );
}
