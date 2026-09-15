import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

// DESIGN_FREEZE_FINAL C21 — every non-normal state in the consumer app renders through THIS, so a
// screen never invents its own empty/error look.
//   loading   — a skeleton in the real layout position (not a centred spinner).
//   empty     — emoji 30 + title + explanation + Secondary CTA.
//   error     — title + explanation + Primary "다시 시도".
//   preparing — a status card (left bar), for genuinely-not-built-yet surfaces.
//   disabled  — a quiet sunken plane.
// Copy rule: human sentences, never error codes ("INSUFFICIENT_DUK" → "덕이 조금 부족해요"), and
// never baby-talk.
export type StateViewKind = 'loading' | 'empty' | 'error' | 'preparing' | 'disabled';

type StateViewProps = {
  kind: StateViewKind;
  emoji?: string;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  // loading only: how many skeleton bars to reserve, matching the real content's shape.
  skeletonLines?: number;
  style?: StyleProp<ViewStyle>;
};

export function StateView({
  kind,
  emoji,
  title,
  description,
  actionLabel,
  onAction,
  skeletonLines = 3,
  style,
}: StateViewProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  if (kind === 'loading') {
    return (
      <View
        style={[styles.skeletonWrap, style]}
        accessibilityRole="progressbar"
        accessibilityLabel={title ?? '불러오는 중'}
      >
        {Array.from({ length: skeletonLines }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.skeletonBar,
              {
                backgroundColor: theme.backgroundElevated,
                width: i === skeletonLines - 1 ? '62%' : '100%',
              },
            ]}
          />
        ))}
      </View>
    );
  }

  if (kind === 'preparing') {
    return (
      <Card use="status" statusColor={theme.warning} radius="xl" style={style}>
        <Stack gap="xs">
          <Text variant="bodyLarge" style={styles.title}>
            {title ?? '아직 준비 중이에요'}
          </Text>
          {description ? (
            <Text variant="bodyMedium" colorToken="textSecondary">
              {description}
            </Text>
          ) : null}
        </Stack>
      </Card>
    );
  }

  if (kind === 'disabled') {
    return (
      <View style={[styles.disabled, { backgroundColor: theme.backgroundElevated }, style]}>
        <Text variant="bodyMedium" colorToken="textSecondary">
          {title ?? '지금은 이용할 수 없어요'}
        </Text>
      </View>
    );
  }

  const isError = kind === 'error';
  return (
    <View style={[styles.block, style]}>
      <Stack gap="sm" align="center">
        {!isError && emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
        <Text variant="bodyLarge" style={[styles.title, styles.center]}>
          {title ?? (isError ? '잠시 불러오지 못했어요' : '아직 아무것도 없어요')}
        </Text>
        {description ? (
          <Text variant="bodyMedium" colorToken="textSecondary" style={styles.center}>
            {description}
          </Text>
        ) : null}
        {actionLabel && onAction ? (
          <Button
            label={actionLabel}
            variant={isError ? 'brand' : 'secondary'}
            radius="lg"
            onPress={onAction}
            style={styles.action}
          />
        ) : null}
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonWrap: { gap: spacing.sm, paddingVertical: spacing.xs },
  skeletonBar: { height: 14, borderRadius: radius.sm },
  block: { paddingVertical: spacing.xl, paddingHorizontal: spacing.md },
  emoji: { fontSize: 30, lineHeight: 38 },
  title: { fontWeight: '700' },
  center: { textAlign: 'center' },
  action: { alignSelf: 'stretch', marginTop: spacing.sm },
  disabled: { borderRadius: radius.xl, padding: spacing.lg },
});
