import {
  TabList,
  TabListProps,
  Tabs,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
} from 'expo-router/ui';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, type SemanticColors } from '@/theme';

import { CONSUMER_NAV_ITEMS, type ConsumerNavKey } from './consumerNav';
import { ConsumerNavGlyph } from './ConsumerNavGlyph';

// FINAL Stitch user app is MOBILE-FIRST. On web we render an app-like phone canvas (centered, max ~430px)
// with a real BOTTOM tab bar — NOT a desktop top navigation. The 5-tab IA (홈·상담·궁합·운세우편함·MY) +
// glyphs come from the SHARED CONSUMER_NAV_ITEMS / ConsumerNavGlyph so the tab bar and the detail-screen
// mirror (DetailBottomNav) never drift. Native uses NativeTabs (app-tabs.tsx).
const CANVAS_MAX = 430;
// Nav body height ex-safe-area (§52). 56 keeps the interactive bar in the owner's 56–64px range and drives
// the TabSlot content reservation. Unchanged for 5 items — width is absorbed by flex:1, not extra height.
const NAV_HEIGHT = 56;

type ThemeColors = SemanticColors;

type NavItemProps = TabTriggerSlotProps & {
  tab: ConsumerNavKey;
  label: string;
  theme: ThemeColors;
};

function NavItem({ tab, label, theme, isFocused, ...props }: NavItemProps) {
  const color = isFocused ? theme.primary : theme.textSecondary;
  return (
    <Pressable {...props} style={styles.navItem}>
      <ConsumerNavGlyph name={tab} color={color} active={!!isFocused} />
      <Text style={[styles.navLabel, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

type BottomNavProps = TabListProps & {
  insetBottom: number;
  theme: ThemeColors;
};

function BottomNav({ insetBottom, theme, children, ...props }: BottomNavProps) {
  return (
    <View
      {...props}
      style={[
        styles.navBar,
        {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          paddingBottom: Math.max(insetBottom, 8),
        },
      ]}>
      {children}
    </View>
  );
}

export default function AppTabs() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.viewport, { backgroundColor: theme.backgroundSelected }]}>
      <View
        style={[
          styles.canvas,
          { backgroundColor: theme.background, borderColor: theme.border },
        ]}>
        <Tabs>
          <TabSlot
            style={[styles.slot, { paddingBottom: NAV_HEIGHT + Math.max(insets.bottom, 8) }]}
          />
          <TabList asChild>
            <BottomNav insetBottom={insets.bottom} theme={theme}>
              {CONSUMER_NAV_ITEMS.map((item) => (
                <TabTrigger key={item.key} name={item.key} href={item.route} asChild>
                  <NavItem tab={item.key} label={item.label} theme={theme} />
                </TabTrigger>
              ))}
            </BottomNav>
          </TabList>
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: {
    flex: 1,
    width: '100%',
    alignItems: 'center', // center the phone canvas on wide (desktop) viewports
  },
  canvas: {
    flex: 1,
    width: '100%',
    maxWidth: CANVAS_MAX,
    position: 'relative',
    overflow: 'hidden',
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  slot: {
    height: '100%',
  },
  navBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'stretch',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 6,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 4,
    paddingHorizontal: 2, // keep 5 labels from colliding at 375px
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
