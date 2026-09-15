import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, shadows, spacing } from '@/theme';

// Home question composer (DESIGN_FREEZE_FINAL D05). One of the very few elev.raised surfaces — this
// is the screen's primary CTA and it should sit slightly above the page.
//
// The cost rides ON the button ("물어보기 🍀 5덕"), which is the freeze's rule for any CTA that spends
// 덕: the price is never a footnote the user discovers after committing. The amount is passed in by
// the caller from the canonical economy source — this component defines no price of its own.
//
// Submitting hands the text to the caller, which starts a consultation. It does NOT call the LLM
// (constitution 제7조: UI never calls the LLM directly).
type QuestionComposerProps = {
  placeholder?: string;
  /** Consumer cost label for the CTA, e.g. "5덕". Omit for a free composer. */
  costLabel?: string;
  onSubmit: (text: string) => void;
};

export function QuestionComposer({
  placeholder = '올해 이직해도 괜찮을까요?',
  costLabel,
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
    <View style={[styles.card, shadows.sm, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text variant="bodySmall" colorToken="textSecondary" style={styles.label}>
        무엇이 궁금하세요?
      </Text>
      <TextInput
        // 홈의 질문 입력칸 — 보이는 라벨이 없으므로 접근 이름을 직접 준다.
        accessibilityLabel="질문 입력"
        style={[styles.input, { color: theme.textPrimary }]}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        value={value}
        onChangeText={setValue}
        onSubmitEditing={submit}
        returnKeyType="send"
        multiline
      />
      <Button
        label={costLabel ? `물어보기  🍀 ${costLabel}` : '물어보기'}
        onPress={submit}
        radius="lg"
      />
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
  label: {
    fontWeight: '700',
  },
  input: {
    fontSize: 15,
    lineHeight: 24,
    minHeight: 68,
    textAlignVertical: 'top',
  },
});
