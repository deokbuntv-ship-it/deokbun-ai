import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import type { ChatMessage } from '@/features/chat/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, spacing } from '@/theme';

type ChatBubbleProps = {
  message: ChatMessage;
};

export function ChatBubble({ message }: ChatBubbleProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  const isAssistant = message.role === 'assistant';

  return (
    <View
      style={[
        styles.messageRow,
        { justifyContent: isAssistant ? 'flex-start' : 'flex-end' },
      ]}
    >
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isAssistant ? theme.backgroundElevated : theme.primary,
          },
        ]}
      >
        <Text
          variant="bodyMedium"
          colorToken={isAssistant ? 'textPrimary' : 'primaryText'}
        >
          {message.text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  messageRow: {
    flexDirection: 'row',
  },
  bubble: {
    maxWidth: '80%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.md,
  },
});
