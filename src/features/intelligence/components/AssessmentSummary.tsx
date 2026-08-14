import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import type {
  ConsumerAssessmentTile,
  ConsumerAssessmentView,
} from '@/features/intelligence';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

// Consumer "종합 평가" (Sprint 3A / Golden Flow v3 §4.5). Renders a ConsumerAssessmentView
// produced by toConsumerAssessmentView — the component NEVER decides levels or which
// axes to show; it only draws the fail-closed ViewModel. Categorical only (no score/%).

// One assessment axis tile. `strong` tone uses the teal tint; others the elevated warm
// surface. Direction arrow + timing render ONLY when the ViewModel provides them.
export function AssessmentTile({ tile }: { tile: ConsumerAssessmentTile }) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const bg = tile.tone === 'strong' ? theme.accentSurface : theme.backgroundElevated;

  return (
    <View style={[styles.tile, { backgroundColor: bg, borderColor: theme.border }]}>
      <Text variant="bodySmall" colorToken="textSecondary">
        {tile.axisLabel}
      </Text>
      <Stack direction="row" gap="xs" align="center" style={styles.levelRow}>
        <Text variant="bodyLarge" style={styles.level}>
          {tile.levelLabel}
        </Text>
        {tile.directionArrow ? (
          <Text variant="bodyMedium" style={{ color: theme.secondary }}>
            {tile.directionArrow} {tile.directionLabel}
          </Text>
        ) : null}
      </Stack>
      {tile.timingLabel ? (
        <Text variant="caption" colorToken="textSecondary">
          {tile.timingLabel}
        </Text>
      ) : null}
    </View>
  );
}

export function AssessmentSummary({ view }: { view: ConsumerAssessmentView }) {
  if (view.status === 'unavailable') {
    // FAIL-CLOSED: no fabricated 강함/보통. Honest, calm copy (design §5.1 / §209).
    return (
      <Card radius="xl">
        <Text variant="bodyMedium" colorToken="textSecondary">
          {view.reason === 'not_connected'
            ? '아직 평가를 보여드리지 않아요. 검증된 계산 근거가 연결되기 전에는 강함·보통 같은 판단을 만들지 않습니다.'
            : '이번 질문은 확인된 근거가 충분하지 않아 평가를 정리하지 못했어요. 확인 가능한 내용부터 먼저 설명드릴게요.'}
        </Text>
      </Card>
    );
  }

  return (
    <Stack gap="md">
      <View style={styles.grid}>
        {view.tiles.map((tile) => (
          <View key={tile.axisKey} style={styles.gridItem}>
            <AssessmentTile tile={tile} />
          </View>
        ))}
      </View>
      {view.missingBirthTimeAxes.length > 0 ? (
        <Card radius="lg">
          <Text variant="bodySmall" colorToken="textSecondary">
            {`출생시간이 필요한 평가: ${view.missingBirthTimeAxes.map((a) => a.axisLabel).join(' · ')}`}
          </Text>
        </Card>
      ) : null}
    </Stack>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  gridItem: {
    width: '50%',
    padding: spacing.xs,
  },
  tile: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
    minHeight: 72,
  },
  levelRow: {
    flexWrap: 'wrap',
  },
  level: {
    fontWeight: '700',
  },
});
