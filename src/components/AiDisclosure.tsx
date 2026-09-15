import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/Text';
import { AI_DISCLOSURE_SHORT, AI_DISCLOSURE_TEXT } from '@/features/legal/aiDisclosure';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, spacing } from '@/theme';

// Shared AI-generated-content disclosure (Sprint J2 §2). ONE component, ONE wording, rendered on every consumer
// surface that shows AI output. `inline` = a plain caption line (default); `card` = a subtle bordered box for a
// more prominent footer. `compact` swaps in the shorter one-liner for tight spaces. Purely presentational.
export type AiDisclosureProps = {
  variant?: 'inline' | 'card';
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AiDisclosure({ variant = 'inline', compact = false, style }: AiDisclosureProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const text = compact ? AI_DISCLOSURE_SHORT : AI_DISCLOSURE_TEXT;

  const body = (
    <Text
      variant="caption"
      colorToken="textMuted"
      style={styles.text}
      accessibilityLabel={`AI 생성 콘텐츠 안내: ${text}`}
    >
      {text}
    </Text>
  );

  if (variant === 'card') {
    return (
      <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.backgroundElevated }, style]}>
        {body}
      </View>
    );
  }
  return <View style={[styles.inline, style]}>{body}</View>;
}

const styles = StyleSheet.create({
  inline: { paddingHorizontal: spacing.xs },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  text: { fontSize: 11.5, lineHeight: 17 },
});
