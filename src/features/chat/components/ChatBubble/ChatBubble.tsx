import { StyleSheet, View } from 'react-native';

import { Markdown } from '@/components/Markdown';
import { Text } from '@/components/Text';
import type { ChatMessage } from '@/features/chat/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

type ChatBubbleProps = {
  message: ChatMessage;
};

// AI answers are long-form insight, so they render as a document-width block with
// the safe Markdown renderer (headings/lists/emphasis, presentation-only — never
// alters generated meaning, no raw HTML). User messages stay compact right-aligned
// bubbles (§17/§35).
export function ChatBubble({ message }: ChatBubbleProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  const isAssistant = message.role === 'assistant';

  if (isAssistant) {
    return (
      <View style={styles.assistantRow}>
        <View
          style={[
            styles.assistantBlock,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Markdown source={message.text} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.userRow}>
      <View style={[styles.userBubble, { backgroundColor: theme.primary }]}>
        <Text variant="bodyMedium" colorToken="primaryText">
          {message.text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  assistantRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  assistantBlock: {
    width: '100%',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  userBubble: {
    maxWidth: '80%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.xl,
  },
});
