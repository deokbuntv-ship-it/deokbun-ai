import { StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Chip } from '@/components/Chip';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import type { CompatibilityResultMeta } from '@/features/chat/server';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

// DESIGN_FREEZE_FINAL C13/C14 — 궁합 결과 헤더 + 섹션.
//
// The freeze bans a SCORE or a GRADE: a relationship must not be reduced to a number or a rank. What
// is rendered instead is the engine's own plain-language verdict — `overallLabel` is the server's
// categorical reading, not a computed percentage, and it stays because engine Decision/Evidence
// semantics are product logic, not presentation. No number is invented, ranked, or derived here.
//
// Layout: a blush plane with A × B, the one-line reading, and the dimension titles as keyword chips;
// the dimension verdicts follow as prose sections.
export function CompatibilityTierCard({ meta }: { meta: CompatibilityResultMeta }) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  return (
    <Stack gap="lg">
      <View style={[styles.header, { backgroundColor: theme.surfaceBlush }]}>
        <View style={styles.pairRow}>
          <View style={styles.person}>
            <Avatar label={meta.selfLabel} size={46} />
            <Text variant="caption" numberOfLines={1} style={{ color: theme.onBlush, fontWeight: '700' }}>
              {meta.selfLabel}
            </Text>
          </View>
          <Text style={styles.glyph}>💕</Text>
          <View style={styles.person}>
            <Avatar label={meta.targetLabel} size={46} />
            <Text variant="caption" numberOfLines={1} style={{ color: theme.onBlush, fontWeight: '700' }}>
              {meta.targetLabel}
            </Text>
          </View>
        </View>

        <Text variant="headingLarge" style={[styles.headline, { color: theme.onBlush }]}>
          {meta.overallLabel}
        </Text>

        {/* Dimension titles as keyword chips — the shape of the reading at a glance, no ranking. */}
        <View style={styles.chips}>
          {meta.dimensions.map((d) => (
            <Chip key={d.key} label={d.title} tone="blush" />
          ))}
        </View>

        {meta.reducedPrecision ? (
          <Text variant="bodySmall" style={{ color: theme.onBlush }}>
            한 분 이상 출생시간이 정확하지 않아 세부 정밀도는 제한될 수 있어요.
          </Text>
        ) : null}
      </View>

      {/* C14 — each dimension as a readable section, not a dot list. */}
      <Stack gap="lg">
        {meta.dimensions.map((d) => (
          <Stack key={d.key} gap="xs">
            <Text variant="bodyLarge" style={styles.sectionTitle}>
              {d.title}
            </Text>
            <Text variant="bodyLarge" colorToken="textSecondary">
              {d.verdict}
            </Text>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}

const styles = StyleSheet.create({
  header: {
    borderRadius: radius.xl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  pairRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  person: { alignItems: 'center', gap: 4, flexShrink: 1, minWidth: 0 },
  glyph: { fontSize: 20, lineHeight: 26 },
  headline: { textAlign: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
  sectionTitle: { fontWeight: '700' },
});
