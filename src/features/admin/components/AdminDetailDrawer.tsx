import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';

import { adminTheme } from '../adminTheme';

// Shared right-side detail drawer (Stitch §3). Overlay scrim + fixed right panel
// (~480px) with header (title + optional badge + close), scrollable content, and
// an optional footer action area. Escape/scrim/✕ all close. Used by USER_DETAIL,
// CONSULTATION_DETAIL and FORTUNE_MAIL_DETAIL — no per-screen drawer duplication.
type AdminDetailDrawerProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  badge?: { label: string; tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger' };
  subtitle?: string;
  footer?: ReactNode;
  children: ReactNode;
};

const BADGE_BG: Record<string, string> = {
  neutral: adminTheme.neutralBg,
  info: adminTheme.infoBg,
  success: adminTheme.successBg,
  warning: adminTheme.warningBg,
  danger: adminTheme.dangerBg,
};
const BADGE_FG: Record<string, string> = {
  neutral: adminTheme.inkVariant,
  info: adminTheme.info,
  success: adminTheme.success,
  warning: adminTheme.warning,
  danger: adminTheme.danger,
};

export function AdminDetailDrawer({
  visible,
  onClose,
  title,
  badge,
  subtitle,
  footer,
  children,
}: AdminDetailDrawerProps) {
  const tone = badge?.tone ?? 'neutral';
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.scrim} accessibilityRole="button" accessibilityLabel="닫기" onPress={onClose} />
        <View style={styles.panel}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text variant="headingMedium" style={{ color: adminTheme.ink }} numberOfLines={1}>
                {title}
              </Text>
              {badge ? (
                <View style={[styles.badge, { backgroundColor: BADGE_BG[tone] }]}>
                  <Text variant="caption" style={{ color: BADGE_FG[tone], fontWeight: '700' }}>
                    {badge.label}
                  </Text>
                </View>
              ) : null}
            </View>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="닫기" hitSlop={8}>
              <Text variant="headingMedium" style={{ color: adminTheme.inkMuted }}>
                ✕
              </Text>
            </Pressable>
          </View>
          {subtitle ? (
            <Text variant="bodySmall" style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}

          <ScrollView style={styles.content} contentContainerStyle={{ padding: 20, gap: 16 }}>
            {children}
          </ScrollView>

          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row' },
  scrim: { flex: 1, backgroundColor: 'rgba(4,22,39,0.35)' },
  panel: {
    width: 480,
    maxWidth: '92%',
    height: '100%',
    backgroundColor: adminTheme.surface,
    borderLeftWidth: 1,
    borderLeftColor: adminTheme.border,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: -8, height: 0 },
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    gap: 12,
  },
  headerText: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  badge: { borderRadius: 2, paddingHorizontal: 8, paddingVertical: 3 },
  subtitle: { color: adminTheme.inkMuted, paddingHorizontal: 20, paddingBottom: 8 },
  content: { flex: 1, borderTopWidth: 1, borderTopColor: adminTheme.border },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: adminTheme.border,
  },
});
