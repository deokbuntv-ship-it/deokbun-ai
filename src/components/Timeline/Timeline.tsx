import { View } from 'react-native';

import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

// Vertical timeline (Stitch 05_FORTUNE_DETAIL 월별 흐름). A highlighted node uses
// the warm-orange accent ring to mark the important/current period. Rendered only
// with real canonical data — the caller supplies the items.
export type TimelineItem = {
  period: string;
  title: string;
  body?: string;
  highlighted?: boolean;
};

export function Timeline({ items }: { items: TimelineItem[] }) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  return (
    <View>
      {items.map((item, i) => {
        const last = i === items.length - 1;
        const dot = 16;
        return (
          <View key={`${item.period}-${i}`} style={{ flexDirection: 'row', gap: spacing.md }}>
            <View style={{ width: 16, alignItems: 'center' }}>
              <View
                style={{
                  width: item.highlighted ? dot : 11,
                  height: item.highlighted ? dot : 11,
                  borderRadius: dot / 2,
                  borderWidth: item.highlighted ? 3 : 2,
                  borderColor: item.highlighted ? theme.accent : theme.border,
                  // Highlighted node is a hollow ORANGE RING (bullseye); others are
                  // hollow gray dots. No filled orange dot (§ Stitch focal look).
                  backgroundColor: theme.surface,
                  marginTop: 4,
                }}
              />
              {!last ? (
                <View
                  style={{
                    flex: 1,
                    width: 2,
                    backgroundColor: theme.border,
                    marginTop: 4,
                  }}
                />
              ) : null}
            </View>
            <Stack
              gap="xs"
              style={{
                flex: 1,
                marginBottom: last ? 0 : spacing.lg,
                // Highlighted entry sits on a warm peach-tinted rounded block.
                backgroundColor: item.highlighted ? '#F28C3314' : undefined,
                borderRadius: item.highlighted ? radius.lg : 0,
                padding: item.highlighted ? spacing.md : 0,
              }}
            >
              <Text
                variant="bodySmall"
                style={{ color: item.highlighted ? theme.accent : theme.textSecondary, fontWeight: item.highlighted ? '700' : '400' }}
              >
                {item.period}
              </Text>
              <Text
                variant="bodyLarge"
                colorToken={item.highlighted ? 'accent' : 'textPrimary'}
                style={{ fontWeight: '700' }}
              >
                {item.title}
              </Text>
              {item.body ? (
                <Text variant="bodyMedium" colorToken="textSecondary">
                  {item.body}
                </Text>
              ) : null}
            </Stack>
          </View>
        );
      })}
    </View>
  );
}
