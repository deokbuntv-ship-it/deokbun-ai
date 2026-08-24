import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/theme';

import { CONSUMER_NAV_ITEMS, type ConsumerNavKey } from './consumerNav';
import { ConsumerNavGlyph } from './ConsumerNavGlyph';

// Consumer bottom navigation for PUSHED detail screens (today, monthly, compatibility, compatibility-chat,
// report, shared-report). The primary tab bar (app-tabs) is bound to the tab navigator and can't host a
// root-Stack detail route, so detail screens render THIS mirror. ONE authoritative implementation for web +
// native (ConsumerNavGlyph resolves per platform), consuming the shared CONSUMER_NAV_ITEMS
// (홈·상담·궁합·운세우편함·MY) so the 5-item nav never drifts. Icon + label, equal distribution, safe-area aware,
// ink active state to match the tab bar (DESIGN_FREEZE_FINAL C02).
//
// WHERE THE BAR IS HIDDEN — the canonical rule (owner decision, DESIGN_FREEZE_FINAL C02 amendment).
// Exactly THREE exceptions; every other consumer screen keeps the bar, including the 궁합 결과 and 덕 충전:
//   1. 몰입형 상담 채팅 (/chat) — the composer owns the bottom safe area.
//   2. 온보딩 (/login, /onboarding/*) — the user is being routed, not browsing.
//   3. 미완료 출생정보 입력 (/birth-info) — a critical form. This bar navigates with router.replace, so
//      offering it here would silently discard whatever the user has typed.
export type DetailNavKey = ConsumerNavKey;

const NAV_HEIGHT = 56;

export function DetailBottomNav({ active }: { active?: DetailNavKey }) {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.navBar,
        {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      {CONSUMER_NAV_ITEMS.map((item) => {
        const isActive = item.key === active;
        const color = isActive ? theme.brandPrimary : theme.textNavInactive;
        return (
          <Pressable
            key={item.key}
            style={styles.navItem}
            onPress={() => router.replace(item.route)}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: isActive }}
          >
            <ConsumerNavGlyph name={item.key} color={color} active={isActive} />
            <Text style={[styles.navLabel, { color, fontWeight: isActive ? '700' : '500' }]} numberOfLines={1} allowFontScaling maxFontSizeMultiplier={1.2}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    minHeight: NAV_HEIGHT,
    flexDirection: 'row',
    alignItems: 'stretch',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 6,
  },
  navItem: {
    flex: 1, // equal distribution across the 5 items
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 4,
    paddingHorizontal: 2, // keep 5 labels from touching at 360px (Galaxy S8) width
  },
  navLabel: {
    fontSize: 11,
    // '운세우편함' is 5 Korean glyphs — it must stay on ONE line at 360dp. Tightening the tracking is
    // the sanctioned way to buy that room; wrapping is a QA failure.
    letterSpacing: -0.24,
  },
});
