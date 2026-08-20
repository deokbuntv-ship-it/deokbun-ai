import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { LineIcon } from '@/components/LineIcon';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

// Home question composer (Stitch 01_HOME / v4): white card containing a text
// input + a navy "질문하기" button. Submitting hands the (possibly empty) text to
// the caller, which starts a consultation. It does NOT call the LLM — navigation
// only (constitution 제7조: UI never calls the LLM directly).
type QuestionComposerProps = {
  placeholder?: string;
  onSubmit: (text: string) => void;
};

export function QuestionComposer({
  placeholder = '덕분이에게 무엇이든 물어보세요',
  onSubmit,
}: QuestionComposerProps) {
  const [value, setValue] = useState('');
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  const submit = () => {
    onSubmit(value.trim());
    setValue('');
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.inputRow}>
        <View style={styles.leadingIcon}>
          <LineIcon name="chat" size={20} color={theme.textSecondary} />
        </View>
        <TextInput
          style={[styles.input, { color: theme.textPrimary }]}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          value={value}
          onChangeText={setValue}
          onSubmitEditing={submit}
          returnKeyType="send"
          multiline
        />
      </View>
      <View style={styles.actionRow}>
        <Button label="➤  질문하기" onPress={submit} radius="lg" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  leadingIcon: {
    paddingTop: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 92,
    textAlignVertical: 'top',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
