import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

type ChatInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

// Stitch AI-상담 bottom composer: a full-pill text field + a circular navy send
// button with a white ↑ glyph (not a rectangular "전송" text button).
export function ChatInput({ value, onChangeText, onSend, disabled }: ChatInputProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  return (
    <View style={styles.inputArea}>
      <View style={styles.row}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="결과에 대해 더 궁금한 점을 물어보세요"
          placeholderTextColor={theme.textSecondary}
          multiline
          accessibilityLabel="메시지 입력창"
          style={[
            styles.field,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              color: theme.textPrimary,
            },
          ]}
        />
        <Pressable
          onPress={onSend}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel="메시지 전송"
          style={[
            styles.send,
            { backgroundColor: theme.primary, opacity: disabled ? 0.5 : 1 },
          ]}
        >
          <Text style={styles.sendGlyph}>↑</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputArea: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-end',
  },
  field: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 12,
    minHeight: 48,
    maxHeight: 120,
    fontSize: 15,
    lineHeight: 20,
    textAlignVertical: 'top',
  },
  send: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendGlyph: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
});
