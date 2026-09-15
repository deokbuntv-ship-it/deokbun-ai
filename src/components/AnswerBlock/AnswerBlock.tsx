import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AiDisclosure } from '@/components/AiDisclosure';
import { useReduceMotion } from '@/components/Candle';
import { Markdown } from '@/components/Markdown';
import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

// DESIGN_FREEZE_FINAL C11 — 덕분이의 해석.
//
// A long Korean interpretation is READING, not chat. Putting it in a speech bubble is what made the
// old screen read as a ChatGPT clone and made 500 words of Korean genuinely hard to follow. So a long
// answer is a letter/interpretation CARD: reading measure 16/28, 16px between paragraphs, the AI
// notice as one quiet line at the bottom — never a big warning box at the top.
//
// Entry is a whole-block fade (160ms). Deliberately NOT a typewriter: streaming characters implies
// the answer is being invented as you watch and makes the text unreadable while it arrives.

/**
 * Long-form or short? The freeze's rule: 4+ sentences, or any markdown heading/list structure, means
 * the answer is something to READ and must not be bubbled.
 */
export function isLongAnswer(text: string): boolean {
  if (/^\s*#{1,3}\s+/m.test(text)) return true;
  if (/^\s*[-*]\s+/m.test(text)) return true;
  const sentences = text.split(/[.!?。！？\n]+/).filter((s) => s.trim().length > 0);
  return sentences.length >= 4;
}

type AnswerBlockProps = {
  source: string;
  /** Section label. Defaults to the frozen "✨ 덕분이의 해석". */
  title?: string;
  /** Hide the footer notice when the parent already renders one for the whole conversation. */
  showDisclosure?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AnswerBlock({ source, title = '✨ 덕분이의 해석', showDisclosure = true, style }: AnswerBlockProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const reduceMotion = useReduceMotion();
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) {
      fade.setValue(1); // final state only
      return;
    }
    Animated.timing(fade, { toValue: 1, duration: 160, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, [fade, reduceMotion, source]);

  return (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border, opacity: fade },
        style,
      ]}
    >
      <Text variant="bodySmall" style={{ color: theme.textSecondary, fontWeight: '700' }}>
        {title}
      </Text>
      <View style={styles.body}>
        <Markdown source={source} reading />
      </View>
      {showDisclosure ? <AiDisclosure style={styles.disclosure} /> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.xl,
    paddingVertical: 17,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  body: { gap: spacing.lg },
  disclosure: { paddingTop: spacing.xs },
});
