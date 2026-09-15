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
    <Card radius="xl">
      <Stack gap="sm">
        {tag || timestamp || unread ? (
          // Meta row wraps instead of overflowing the card: the tag+timestamp group takes the available width
          // (flex:1) and wraps, and a long timestamp shrinks + flows to a second line on narrow screens
          // (Galaxy S8) — no clipping, no font-size hacks (§ real-device QA #2).
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, flex: 1 }}>
              {tag ? <StatusBadge label={tag.label} tone={tag.tone ?? 'neutral'} pill /> : null}
              {timestamp ? (
                <Text variant="bodySmall" colorToken="textSecondary" style={{ flexShrink: 1 }}>
                  {timestamp}
                </Text>
              ) : null}
            </View>
            {unread ? (
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  marginTop: 4,
                  backgroundColor: theme.accent,
                }}
              />
            ) : null}
          </View>
        ) : null}
        <Text
          variant="headingMedium"
          colorToken={muted ? 'textSecondary' : 'textPrimary'}
          numberOfLines={2}
          style={{ fontWeight: '700' }}
        >
          {title}
        </Text>
        {body ? (
          <Text variant="bodyMedium" colorToken="textSecondary" numberOfLines={2}>
            {body}
          </Text>
        ) : null}
        {ctaLabel ? <Button label={ctaLabel} onPress={onCta} radius="lg" /> : null}
      </Stack>
    </Card>
  );

  // Composition guard (§34): expose exactly ONE interactive control so the card can never
  // render a <button> inside a <button> — invalid DOM that throws a hydration error on web.
  // A CTA button, when present, IS that control, so only a CTA-less card becomes a
  // whole-card Pressable. (No caller passes both today; this keeps that structurally safe.)
  if (onPress && !ctaLabel) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button">
        {inner}
      </Pressable>
    );
  }
  return inner;
}
