import { StyleSheet, View } from 'react-native';

import { AnswerBlock, isLongAnswer } from '@/components/AnswerBlock';
import { Markdown } from '@/components/Markdown';
import { Text } from '@/components/Text';
import type { ChatMessage } from '@/features/chat/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, spacing } from '@/theme';

// DESIGN_FREEZE_FINAL C10/C11 — the message.
//
// Length decides the FORM, not the role:
//   • user question      → compact cream bubble, right-aligned, max 82% width.
//   • short AI reply     → white bubble with the ✨ avatar (3 sentences or fewer).
//   • long interpretation→ NOT a bubble. An AnswerBlock reading card (see isLongAnswer).
// Bubbling a 500-word Korean interpretation is what made this screen read as a ChatGPT clone and
// made the text genuinely hard to follow.
export function ChatBubble({ message }: { message: ChatMessage }) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  if (message.role === 'assistant') {
    if (isLongAnswer(message.text)) {
      // The conversation renders ONE disclosure in its footer, so the block does not repeat it.
      return <AnswerBlock source={message.text} showDisclosure={false} />;
    }
    return (
      <View style={styles.assistantRow}>
        <View style={[styles.avatar, { backgroundColor: theme.surfaceButter }]}>
          <Text style={styles.avatarGlyph}>✨</Text>
        </View>
        <View style={[styles.assistantBubble, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Markdown source={message.text} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.userRow}>
      <View style={[styles.userBubble, { backgroundColor: '#F3EADA', borderColor: '#E9DCC6' }]}>
        <Text variant="bodyMedium" style={styles.userText}>
          {message.text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  assistantRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  avatarGlyph: { fontSize: 13, lineHeight: 18 },
  assistantBubble: {
    flexShrink: 1,
    maxWidth: '86%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    // 5/16/16/16 — the small corner points back at the speaker.
    borderTopLeftRadius: 5,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderWidth: 1,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  userBubble: {
    maxWidth: '82%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 16,
    borderWidth: 1,
  },
  userText: { fontSize: 14.5, lineHeight: 23 },
});
