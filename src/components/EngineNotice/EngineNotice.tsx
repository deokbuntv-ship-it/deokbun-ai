import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

// Truthful engine/data-unavailable notice on a soft AI-accent surface (§7, §45).
// Used wherever real canonical fortune/analysis data does not exist yet, in place
// of any fabricated score or interpretation. Optional `footnote` for provenance
// or a "what will appear here" line.
type EngineNoticeProps = {
  title: string;
  message: string;
  footnote?: string;
  style?: StyleProp<ViewStyle>;
};

export function EngineNotice({
  title,
  message,
  footnote,
  style,
}: EngineNoticeProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.accentSurface,
          borderColor: theme.border,
          borderRadius: radius.lg,
        },
        style,
      ]}
    >
      <Stack gap="xs">
        <Text variant="headingMedium">{title}</Text>
        <Text variant="bodyMedium" colorToken="textSecondary">
          {message}
        </Text>
        {footnote ? (
          <Text variant="caption" colorToken="textSecondary">
            {footnote}
          </Text>
        ) : null}
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    borderWidth: 1,
  },
});
