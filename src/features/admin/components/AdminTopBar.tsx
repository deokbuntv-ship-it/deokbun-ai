import { StyleSheet, TextInput, View } from 'react-native';

import { Text } from '@/components/Text';
import { environmentLabel, resolveEnvironment } from '@/config/environment';

import { adminTheme } from '../adminTheme';

// Shared admin top bar (Stitch §9). Left: the REAL resolved environment label (§7.2 — was a hardcoded
// "운영 서버" literal that lied in staging/dev builds; now reflects the actual backend target). Center: unified
// search (presentational). Right: notifications affordance + admin identity (neutral placeholder).
export function AdminTopBar() {
  const env = resolveEnvironment().env;
  return (
    <View style={styles.bar}>
      <Text
        variant="bodyMedium"
        style={[styles.env, env !== 'production' ? styles.envNonProd : null]}
      >
        {environmentLabel(env)} 서버
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
  envNonProd: {
    color: adminTheme.warning, // non-production stands out so operators never mistake the target
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
