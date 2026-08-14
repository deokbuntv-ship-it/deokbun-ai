import { View } from 'react-native';

import { Card } from '@/components/Card';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { toConsumerAssessmentDetail } from '@/features/intelligence';
import type { AssessmentItem } from '@/features/intelligence';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, spacing } from '@/theme';

import { ConfidenceIndicator } from './ConfidenceIndicator';
import { toneColor } from './tone';

// Consumer Assessment detail sheet (§9/§26). Renders ONE axis in full using the fail-
// closed consumer adapter: level + direction + timing + agreement, confidence via
// ConfidenceIndicator (hidden when insufficient), and supporting/counter as SEPARATE
// counts (never a merged score, never raw ids — those are admin-only §9). Cautions
// surface the axis warnings gently.
function Field({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 }}>
      <Text variant="bodySmall" colorToken="textSecondary">
        {label}
      </Text>
      <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
        {value}
      </Text>
    </View>
  );
}

export function AssessmentDetailSheet({ item }: { item: AssessmentItem }) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const d = toConsumerAssessmentDetail(item);

  return (
    <Card radius="xl">
      <Stack gap="md">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="bodyLarge" style={{ fontWeight: '700' }}>
            {d.axisLabel}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <Text variant="bodyLarge" style={{ color: toneColor(d.tone, theme), fontWeight: '700' }}>
              {d.levelLabel}
            </Text>
            {d.directionArrow ? (
              <Text variant="bodyMedium" style={{ color: theme.secondary }}>
                {d.directionArrow} {d.directionLabel}
              </Text>
            ) : null}
          </View>
        </View>

        <ConfidenceIndicator label={d.confidenceLabel} />

        <Stack gap="xs">
          <Field label="흐름" value={d.directionLabel} />
          <Field label="시점" value={d.timingLabel} />
          <Field label="근거 일치도" value={d.agreementLabel} />
        </Stack>

        <View style={{ flexDirection: 'row', gap: spacing.lg }}>
          <View>
            <Text variant="caption" colorToken="textSecondary">
              뒷받침 근거
            </Text>
            <Text variant="bodyLarge" style={{ color: theme.secondary, fontWeight: '700' }}>
              ▲ {d.supportingCount}
            </Text>
          </View>
          <View>
            <Text variant="caption" colorToken="textSecondary">
              상반 신호
            </Text>
            <Text variant="bodyLarge" style={{ color: theme.accent, fontWeight: '700' }}>
              ▼ {d.counterCount}
            </Text>
          </View>
        </View>

        {d.cautions.length > 0 ? (
          <Stack gap="xs">
            <Text variant="bodySmall" colorToken="textSecondary">
              참고
            </Text>
            {d.cautions.map((c, i) => (
              <Text key={i} variant="bodySmall" style={{ color: theme.accent }}>
                · {c}
              </Text>
            ))}
          </Stack>
        ) : null}
      </Stack>
    </Card>
  );
}
