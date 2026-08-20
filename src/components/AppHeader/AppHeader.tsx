import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LineIcon } from '@/components/LineIcon';
import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, spacing } from '@/theme';

import { notificationBadgeText } from './notificationBadge';

// Consumer TopAppBar (Stitch header spec, no hamburger):
//  - Home:     brand "덕분이"            + 나 ▾ switcher   (brand + showSwitcher)
//  - Top tabs: "상담" / "운세우편함"      + 나 ▾ switcher   (title + showSwitcher)
//  - Centered: "AI 상담" / "MY"          (centerTitle; optional back/switcher)
//  - Detail:   "← 운세우편"  + rightSlot (showBack + rightSlot)
// Handles the top safe-area inset and the 20px container margin itself, so it can
// sit above a padded ScrollView inside a Screen(padded={false}).
const H_MARGIN = 20;

type AppHeaderProps = {
  title?: string;
  brand?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  showSwitcher?: boolean;
  subjectLabel?: string;
  onSwitcher?: () => void;
  rightSlot?: React.ReactNode;
  centerTitle?: boolean;
  // Notification bell (retention §5). Rendered before the switcher/rightSlot when onBell is set. The badge is
  // BOUNDED (1..9, then 9+) so a large unread count can never blow out the header.
  onBell?: () => void;
  bellCount?: number;
};

function Bell({ onPress, count, danger }: { onPress?: () => void; count: number; danger: string }) {
  const badge = notificationBadgeText(count);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={badge ? `알림 ${badge}개` : '알림'}
      hitSlop={8}
      style={styles.bell}
    >
      <LineIcon name="bell" size={22} />
      {badge ? (
        <View style={[styles.badge, { backgroundColor: danger }]}>
          <Text variant="bodySmall" style={styles.badgeText}>
            {badge}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function Switcher({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="분석 대상자 선택"
      hitSlop={8}
      style={styles.switcher}
    >
      <Text variant="bodyMedium" colorToken="textPrimary" style={styles.switcherLabel}>
        {label}
      </Text>
      <Text variant="bodyMedium" colorToken="textSecondary">
        ▾
      </Text>
    </Pressable>
  );
}

export function AppHeader({
  title,
  brand = false,
  showBack = false,
  onBack,
  showSwitcher = false,
  subjectLabel = '나',
  onSwitcher,
  rightSlot,
  centerTitle = false,
  onBell,
  bellCount = 0,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  const back = showBack ? (
    <Pressable
      onPress={onBack}
      accessibilityRole="button"
      accessibilityLabel="뒤로"
      hitSlop={8}
      style={styles.back}
    >
      <Text variant="headingMedium" colorToken="textPrimary">
        ←
      </Text>
    </Pressable>
  ) : null;

  const rightInner = rightSlot ?? (showSwitcher ? (
    <Switcher label={subjectLabel} onPress={onSwitcher} />
  ) : null);
  // Bell sits to the LEFT of the switcher/rightSlot. Grouped so both share the right edge.
  const right =
    onBell || rightInner ? (
      <View style={styles.rightGroup}>
        {onBell ? <Bell onPress={onBell} count={bellCount} danger={theme.danger} /> : null}
        {rightInner}
      </View>
    ) : null;

  const wrapStyle = [
    styles.header,
    { paddingTop: insets.top + spacing.sm, backgroundColor: theme.background },
  ];

  if (centerTitle) {
    return (
      <View style={wrapStyle}>
        <View style={styles.side}>{back}</View>
        <Text variant="headingMedium" style={styles.centerTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={[styles.side, styles.sideRight]}>{right}</View>
      </View>
    );
  }

  return (
    <View style={wrapStyle}>
      <View style={styles.leftGroup}>
        {back}
        <Text variant="headingMedium" style={styles.title} numberOfLines={1}>
          {brand ? '덕분이' : title}
        </Text>
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: H_MARGIN,
    paddingBottom: spacing.sm,
    minHeight: 52,
    gap: spacing.sm,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },
  title: {
    fontWeight: '700',
    flexShrink: 1,
  },
  centerTitle: {
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  side: {
    minWidth: 44,
    justifyContent: 'center',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  back: {
    minWidth: 32,
    minHeight: 44,
    justifyContent: 'center',
  },
  switcher: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minHeight: 44,
    paddingLeft: spacing.sm,
  },
  switcherLabel: {
    fontWeight: '600',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bell: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
  },
});
