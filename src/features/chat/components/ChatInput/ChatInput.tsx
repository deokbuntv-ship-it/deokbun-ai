import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { LineIcon } from '@/components/LineIcon';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

// Bottom composer (DESIGN_FREEZE_FINAL D10): a pill text field + a circular ink send button carrying
// the shared `send` glyph (one icon family — no ad-hoc ↑ character). Disabled is a token surface, not
// opacity, so the glyph never drops below AA.
type ChatInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
};

export function ChatInput({ value, onChangeText, onSend, disabled, placeholder }: ChatInputProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  return (
    <View style={styles.inputArea}>
      <View style={styles.row}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder ?? '결과에 대해 더 궁금한 점을 물어보세요'}
          placeholderTextColor={theme.textMuted}
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
          accessibilityState={{ disabled: !!disabled }}
          style={({ pressed }) => [
            styles.send,
            {
              backgroundColor: disabled
                ? theme.actionDisabledBg
                : pressed
                  ? theme.brandPrimaryPressed
                  : theme.brandPrimary,
            },
          ]}
        >
          <LineIcon
            name="send"
            size={20}
            color={disabled ? theme.actionDisabledText : theme.brandPrimaryText}
            strokeWidth={2}
          />
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
    paddingVertical: 13,
    minHeight: 48,
    maxHeight: 120,
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  send: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
