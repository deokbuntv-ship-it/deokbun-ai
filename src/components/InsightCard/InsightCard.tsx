import { Pressable, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Stack } from '@/components/Stack';
import { StatusBadge, type BadgeTone } from '@/components/StatusBadge';
import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/theme';

// Insight card (Stitch home 최근 운세우편 + 운세우편함 item). Category tag +
// timestamp + small unread "insight point" (NOT a red notification badge, §10) +
// headline + body + optional CTA. Content is supplied by the caller — renders
// only real data, never fabricated fortune text.
type InsightCardProps = {
  tag?: { label: string; tone?: BadgeTone };
  timestamp?: string;
  unread?: boolean;
  title: string;
  body?: string;
  muted?: boolean;
  ctaLabel?: string;
  onPress?: () => void;
  onCta?: () => void;
};

export function InsightCard({
  tag,
  timestamp,
  unread = false,
  title,
  body,
  muted = false,
  ctaLabel,
  onPress,
  onCta,
}: InsightCardProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  const inner = (
    <Card>
      <Stack gap="sm">
        {tag || timestamp || unread ? (
          <Stack
            direction="row"
            gap="sm"
            align="center"
            style={{ justifyContent: 'space-between' }}
          >
            <Stack direction="row" gap="sm" align="center">
              {tag ? <StatusBadge label={tag.label} tone={tag.tone ?? 'neutral'} /> : null}
              {timestamp ? (
                <Text variant="bodySmall" colorToken="textSecondary">
                  {timestamp}
                </Text>
              ) : null}
            </Stack>
            {unread ? (
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: theme.accent,
                }}
              />
            ) : null}
          </Stack>
        ) : null}
        <Text
          variant="headingMedium"
          colorToken={muted ? 'textSecondary' : 'textPrimary'}
        >
          {title}
        </Text>
        {body ? (
          <Text variant="bodyMedium" colorToken="textSecondary">
            {body}
          </Text>
        ) : null}
        {ctaLabel ? <Button label={ctaLabel} onPress={onCta} /> : null}
      </Stack>
    </Card>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button">
        {inner}
      </Pressable>
    );
  }
  return inner;
}
