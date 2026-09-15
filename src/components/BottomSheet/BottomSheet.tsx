import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, shadows, spacing } from '@/theme';

// DESIGN_FREEZE_FINAL C20 — the ONE bottom-sheet shell. R24 top, 38×4 drag handle, backdrop
// rgba(46,42,36,.32), max 80% of screen height, dismissable by backdrop tap / hardware back.
// Every sheet in the app (person selector, price confirm, candle grant) mounts through here so
// the enter motion, safe-area handling, and dismissal semantics can't drift per screen.
type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  // Sticky action area pinned below the scrollable body (CTA + caption).
  footer?: React.ReactNode;
};

export function BottomSheet({ visible, onClose, title, children, footer }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} accessibilityRole="button" accessibilityLabel="닫기" onPress={onClose} />
        <View
          style={[
            styles.sheet,
            shadows.sheet,
            { backgroundColor: theme.surface, paddingBottom: insets.bottom + spacing.lg },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: theme.border }]} />
          {title ? (
            <Text variant="headingMedium" style={styles.title}>
              {title}
            </Text>
          ) : null}
          <ScrollView
            style={styles.body}
            contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.sm }}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(46,42,36,0.32)' },
  sheet: {
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: 20,
    paddingTop: spacing.sm,
    maxHeight: '80%',
  },
  handle: { width: 38, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.md },
  title: { marginBottom: spacing.lg },
  body: { flexGrow: 0 },
  footer: { paddingTop: spacing.md, gap: spacing.sm },
});
