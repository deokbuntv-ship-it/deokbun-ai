// 명식 표 — 원국 4주 · 십성 · 지장간 · 오행 개수 (오너 결정 F3 = C 수준).
//
// ⚠ 이 컴포넌트는 아무것도 계산하지 않는다. `famous_snapshots.result` 를 그대로 그린다.
// 대운은 스냅샷에 없으므로 그릴 수도 없다 — 막는 것이 아니라 애초에 없다.
//
// 360dp 판단: **가로 스크롤이 아니라 세로 재배치.** 네 기둥을 가로로 늘어놓으면 360dp 에서 한 칸이
// 80dp 남짓이 되어 지장간 세 글자가 줄바꿈으로 깨진다. 가로 스크롤은 "표가 더 있다" 는 사실 자체가
// 안 보여서(스크롤 힌트가 없다) 독자가 시주를 못 보고 지나간다. 좁은 화면에서는 기둥을 위에서
// 아래로 쌓고, 넓은 화면에서는 가로로 붙인다 — 어느 쪽이든 잘리는 것이 없다.
import { View, StyleSheet, useWindowDimensions } from 'react-native';

import { Card } from '@/components/Card';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';

import { colors, radius, spacing } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type FamousChartPillarView = {
  position: string;
  stem: { hanja: string; hangul: string; yinYang: string; element: string; tenGod: string | null };
  branch: {
    hanja: string; hangul: string; element: string;
    hiddenStems: { hanja: string; hangul: string; role: string; tenGod: string }[];
  };
};

export type FamousChartView = {
  hourKnown: boolean;
  pillars: { year: FamousChartPillarView; month: FamousChartPillarView; day: FamousChartPillarView; hour: FamousChartPillarView | null };
  elementCounts: { element: string; count: number }[];
  observedSlots?: number;
};

function Pillar({ pillar, label, missing }: { pillar: FamousChartPillarView | null; label: string; missing?: boolean }) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  if (missing || !pillar) {
    return (
      <View
        style={[styles.pillar, { borderColor: theme.border, backgroundColor: theme.backgroundElevated }]}
        // ⚠ 빈 자리를 시각적으로만 비워 두면 스크린리더는 아무 말도 하지 않는다. 없다는 사실이
        // 이 표에서 가장 중요한 정보이므로 이름으로 말한다.
        accessibilityRole="text"
        accessibilityLabel={`${label}주 없음 — 태어난 시각을 몰라 세우지 않았습니다`}
      >
        <Text variant="caption" colorToken="textSecondary">{label}주</Text>
        <Text variant="headingMedium" colorToken="textSecondary">—</Text>
        <Text variant="caption" colorToken="textSecondary" style={styles.center}>
          시각 미상
        </Text>
      </View>
    );
  }

  const hidden = pillar.branch.hiddenStems
    .map((h) => `${h.hangul}(${h.role}·${h.tenGod})`)
    .join(' · ');

  return (
    <View
      style={[styles.pillar, { borderColor: theme.border, backgroundColor: theme.surface }]}
      accessibilityRole="text"
      accessibilityLabel={[
        `${label}주.`,
        `천간 ${pillar.stem.hangul} ${pillar.stem.yinYang}${pillar.stem.element}`,
        pillar.stem.tenGod ? `십성 ${pillar.stem.tenGod}.` : '일간, 십성의 기준.',
        `지지 ${pillar.branch.hangul} ${pillar.branch.element}.`,
        `지장간 ${hidden}.`,
      ].join(' ')}
    >
      <Text variant="caption" colorToken="textSecondary">{label}주</Text>
      <Text variant="headingLarge" style={styles.center}>{pillar.stem.hanja}</Text>
      <Text variant="caption" colorToken="textSecondary" style={styles.center}>
        {`${pillar.stem.hangul} · ${pillar.stem.yinYang}${pillar.stem.element}`}
      </Text>
      <Text variant="bodySmall" style={[styles.center, styles.god]}>
        {pillar.stem.tenGod ?? '일간'}
      </Text>

      <View style={[styles.rule, { backgroundColor: theme.border }]} />

      <Text variant="headingLarge" style={styles.center}>{pillar.branch.hanja}</Text>
      <Text variant="caption" colorToken="textSecondary" style={styles.center}>
        {`${pillar.branch.hangul} · ${pillar.branch.element}`}
      </Text>
      <Text variant="caption" colorToken="textSecondary" style={styles.center}>
        {hidden}
      </Text>
    </View>
  );
}

export function FamousChartTable({ chart }: { chart: FamousChartView }) {
  const { width } = useWindowDimensions();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  // 네 기둥이 나란히 서려면 한 칸에 최소 96dp 는 있어야 지장간이 안 깨진다.
  const stacked = width > 0 && width < 420;

  return (
    <Card radius="xl">
      <Stack gap="md">
        <Text variant="headingMedium">명식 (사주 원국)</Text>

        <View style={stacked ? styles.columnWrap : styles.rowWrap}>
          <Pillar pillar={chart.pillars.hour} label="시" missing={!chart.hourKnown} />
          <Pillar pillar={chart.pillars.day} label="일" />
          <Pillar pillar={chart.pillars.month} label="월" />
          <Pillar pillar={chart.pillars.year} label="년" />
        </View>

        <View style={[styles.rule, { backgroundColor: theme.border }]} />

        <Stack gap="xs">
          <Text variant="bodySmall" colorToken="textSecondary">오행 개수</Text>
          <View
            style={styles.elements}
            accessibilityRole="text"
            accessibilityLabel={`오행 개수. ${chart.elementCounts.map((c) => `${c.element} ${c.count}개`).join(', ')}`}
          >
            {chart.elementCounts.map((c) => (
              <View
                key={c.element}
                style={[styles.chip, { borderColor: theme.border, backgroundColor: c.count === 0 ? theme.backgroundElevated : theme.surface }]}
              >
                <Text variant="bodySmall" colorToken={c.count === 0 ? 'textSecondary' : 'textPrimary'}>
                  {`${c.element} ${c.count}`}
                </Text>
              </View>
            ))}
          </View>
        </Stack>
      </Stack>
    </Card>
  );
}

const styles = StyleSheet.create({
  rowWrap: { flexDirection: 'row', gap: spacing.sm },
  columnWrap: { flexDirection: 'column', gap: spacing.sm },
  pillar: {
    flex: 1, minWidth: 0, borderWidth: 1, borderRadius: radius.lg,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, gap: 2,
  },
  center: { textAlign: 'center' },
  god: { textAlign: 'center', fontWeight: '700' },
  rule: { height: 1, width: '100%' },
  elements: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: { borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.sm, paddingVertical: 4 },
});
