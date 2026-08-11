import { StyleSheet, TextInput, View } from 'react-native';

import { Text } from '@/components/Text';

import { adminTheme } from '../adminTheme';

// Shared admin top bar (Stitch §9). Left: environment label. Center: unified
// search (exact placeholder per §10 — presentational; global search API not yet
// connected, so it performs no action rather than faking results). Right:
// notifications affordance + admin identity with a NEUTRAL account placeholder
// (no external/AI-generated profile image, §10).
export function AdminTopBar() {
  return (
    <View style={styles.bar}>
      <Text variant="bodyMedium" style={styles.env}>
        운영 서버
      </Text>

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          placeholder="사용자 · 상담 · 운세우편 통합 검색"
          placeholderTextColor={adminTheme.inkMuted}
          editable={false}
        />
      </View>

      <View style={styles.right}>
        <View style={styles.iconBtn} accessible accessibilityLabel="알림" />
        <View style={styles.divider} />
        <View style={styles.avatar} accessible accessibilityLabel="관리자 계정" />
        <Text variant="bodyMedium" style={styles.adminLabel}>
          관리자
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: adminTheme.surface,
    borderBottomWidth: 1,
    borderBottomColor: adminTheme.border,
    gap: 16,
  },
  env: {
    color: adminTheme.ink,
    fontWeight: '600',
  },
  searchWrap: {
    flex: 1,
    alignItems: 'center',
  },
  search: {
    width: '100%',
    maxWidth: 420,
    height: 36,
    backgroundColor: adminTheme.pageBg,
    borderWidth: 1,
    borderColor: adminTheme.border,
    borderRadius: 6,
    paddingHorizontal: 14,
    fontSize: 14,
    color: adminTheme.ink,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: adminTheme.border,
    backgroundColor: adminTheme.surface,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: adminTheme.border,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: adminTheme.neutralBg,
    borderWidth: 1,
    borderColor: adminTheme.border,
  },
  adminLabel: {
    color: adminTheme.ink,
    fontWeight: '600',
  },
});
