import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

// Recommended follow-up questions (§18). These are HELPERS only — the free-form composer
// always stays available (§18). Tapping a chip pre-fills / sends a question but never
// replaces open conversation with a fixed wizard (§16). Renders nothing when empty.
export function FollowUpSuggestions({
  suggestions,
  onSelect,
}: {
  suggestions: string[];
  onSelect: (q: string) => void;
}) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  if (suggestions.length === 0) return null;
  return (
    <View style={{ gap: spacing.sm }}>
      <Text variant="bodySmall" colorToken="textSecondary">
        이어서 물어볼 수 있어요
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
        {suggestions.map((q, i) => (
          <Pressable
            key={`${i}-${q}`}
            onPress={() => onSelect(q)}
            accessibilityRole="button"
            accessibilityLabel={`후속 질문: ${q}`}
            style={{
              borderWidth: 1,
              borderColor: theme.border,
              backgroundColor: theme.backgroundElevated,
              borderRadius: radius.xl,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
            }}
          >
            <Text variant="bodySmall" style={{ color: theme.textPrimary }}>
              {q}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
