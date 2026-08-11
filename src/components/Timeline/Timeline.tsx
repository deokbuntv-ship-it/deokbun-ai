import { View } from 'react-native';

import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, spacing } from '@/theme';

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
        const dot = item.highlighted ? 14 : 10;
        return (
          <View key={`${item.period}-${i}`} style={{ flexDirection: 'row', gap: spacing.md }}>
            <View style={{ width: 16, alignItems: 'center' }}>
              <View
                style={{
                  width: dot,
                  height: dot,
                  borderRadius: dot / 2,
                  borderWidth: 2,
                  borderColor: item.highlighted ? theme.accent : theme.border,
                  backgroundColor: item.highlighted ? theme.accent : theme.surface,
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
            <Stack gap="xs" style={{ flex: 1, paddingBottom: last ? 0 : spacing.lg }}>
              <Text variant="bodySmall" colorToken="textSecondary">
                {item.period}
              </Text>
              <Text
                variant="bodyLarge"
                colorToken={item.highlighted ? 'primary' : 'textPrimary'}
                style={{ fontWeight: '600' }}
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
