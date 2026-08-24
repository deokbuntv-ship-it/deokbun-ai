import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { LineIcon } from '@/components/LineIcon';
import { Text } from '@/components/Text';
import { useNotificationUnread } from '@/features/retention/NotificationUnreadContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, maxFontScale, spacing } from '@/theme';

import { notificationBadgeText } from './notificationBadge';

// Consumer TopAppBar (DESIGN_FREEZE_FINAL C01). Props are UNCHANGED from the previous header — only
// the presentation moved — so no screen had to be rewired.
//  - Home:      brand "덕분이"        + PersonPill      (brand + showSwitcher)
//  - Top tabs:  "상담" / "운세우편함"  + PersonPill      (title + showSwitcher)
//  - Centered:  "MY" / "덕"           (centerTitle; optional back/switcher)
//  - Detail:    "← 운세우편"  + rightSlot                (showBack + rightSlot)
//  - Immersive: back + PersonPill, NO bell               (chat: showBack + showSwitcher + showBell=false)
// H56 · 20px margins · title 17/700 · 44×44 bell hit area. Handles the top safe-area inset and the
// container margin itself, so it can sit above a padded ScrollView inside a Screen(padded={false}).
//
// The bell badge stays a COUNT (1..9, then 9+), never a bare dot: a dot throws away the one piece of
// information the badge exists to carry.
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
  // Global notification bell. When true, AppHeader renders the ONE shared bell — it reads the shared unread
  // count (useNotificationUnread) and navigates to /notifications; no per-screen wiring, no per-screen fetch.
  // Bell exceptions are exactly four: login · onboarding · the notification centre itself · immersive chat.
  showBell?: boolean;
};

function Bell({ onPress, count, danger, ring }: { onPress?: () => void; count: number; danger: string; ring: string }) {
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
        // 1.5px ring in the header's own background colour keeps the pill legible where it overlaps the glyph.
        <View style={[styles.badge, { backgroundColor: danger, borderColor: ring }]}>
          <Text variant="caption" maxFontSizeMultiplier={maxFontScale.control} style={styles.badgeText}>
            {badge}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

// C09 PersonPill — always-visible answer to "whose chart am I looking at right now?". Tapping it
// opens the person selector; it never routes into a consultation.
function PersonPill({ label, onPress, tint, border, text }: { label: string; onPress?: () => void; tint: string; border: string; text: string }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`분석 대상자 ${label} 선택`}
      hitSlop={6}
      style={({ pressed }) => [styles.pill, { backgroundColor: pressed ? border : tint, borderColor: border }]}
    >
      <Avatar label={label} size={22} />
      <Text
        variant="bodySmall"
        numberOfLines={1}
        ellipsizeMode="tail"
        style={[styles.pillLabel, { color: text }]}
      >
        {label}
      </Text>
      <LineIcon name="chevron-down" size={14} color={text} />
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
  showBell = false,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const router = useRouter();
  const { unreadCount } = useNotificationUnread();

  const back = showBack ? (
    <Pressable
      onPress={onBack}
      accessibilityRole="button"
      accessibilityLabel="뒤로"
      hitSlop={8}
      style={styles.back}
    >
      <LineIcon name="back" size={22} color={theme.textPrimary} />
    </Pressable>
  ) : null;

  const rightInner = rightSlot ?? (showSwitcher ? (
    <PersonPill
      label={subjectLabel}
      onPress={onSwitcher}
      tint={theme.backgroundElevated}
      border={theme.backgroundSelected}
      text={theme.textPrimary}
    />
  ) : null);
  // Bell sits to the LEFT of the switcher/rightSlot. Grouped so both share the right edge.
  const right =
    showBell || rightInner ? (
      <View style={styles.rightGroup}>
        {showBell ? (
          <Bell
            onPress={() => router.push('/notifications')}
            count={unreadCount}
            danger={theme.danger}
            ring={theme.background}
          />
        ) : null}
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
        <Text variant="headingMedium" style={styles.title} numberOfLines={1} ellipsizeMode="tail">
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
    minHeight: 56,
    gap: spacing.sm,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
    minWidth: 0,
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
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minHeight: 34,
    maxWidth: 156,
    paddingLeft: 4,
    paddingRight: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    flexShrink: 1,
  },
  pillLabel: {
    fontWeight: '600',
    flexShrink: 1,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
    minWidth: 0,
  },
  bell: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 4,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 1.5,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FDFBF6',
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
  },
});
