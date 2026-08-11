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

// FINAL Stitch user app is MOBILE-FIRST. On web we therefore render an app-like
// phone canvas (centered, max ~430px) with a real BOTTOM tab bar — NOT a desktop
// top navigation. The 4-tab IA (홈 · 상담 · 운세우편함 · MY) and tab behavior are
// unchanged; this file only changes presentation (web). Native uses NativeTabs.
const CANVAS_MAX = 430;
const NAV_HEIGHT = 58;

type TabKey = 'home' | 'consult' | 'inbox' | 'my';
type ThemeColors = SemanticColors;

// Crisp line icons via inline SVG. This is a `.web.tsx` file, so it renders
// through react-dom — no icon-font/vector-icons dependency needed.
function TabGlyph({ name, color, active }: { name: TabKey; color: string; active: boolean }) {
  const common = {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: active ? 2.3 : 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'home':
      return (
        <svg {...common}>
          <path d="M3 11 12 4l9 7" />
          <path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />
        </svg>
      );
    case 'consult':
      return (
        <svg {...common}>
          <path d="M21 11.5a8 8 0 0 1-11.6 7.1L4 20l1.4-4.3A8 8 0 1 1 21 11.5z" />
        </svg>
      );
    case 'inbox':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="m3.5 7 8.5 6 8.5-6" />
        </svg>
      );
    case 'my':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4.5 20c0-3.8 3.4-6 7.5-6s7.5 2.2 7.5 6" />
        </svg>
      );
  }
}

type NavItemProps = TabTriggerSlotProps & {
  tab: TabKey;
  label: string;
  theme: ThemeColors;
};

function NavItem({ tab, label, theme, isFocused, ...props }: NavItemProps) {
  const color = isFocused ? theme.primary : theme.textSecondary;
  return (
    <Pressable {...props} style={styles.navItem}>
      <TabGlyph name={tab} color={color} active={!!isFocused} />
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
              <TabTrigger name="home" href="/" asChild>
                <NavItem tab="home" label="홈" theme={theme} />
              </TabTrigger>
              <TabTrigger name="consult" href="/consult" asChild>
                <NavItem tab="consult" label="상담" theme={theme} />
              </TabTrigger>
              <TabTrigger name="inbox" href="/inbox" asChild>
                <NavItem tab="inbox" label="운세우편함" theme={theme} />
              </TabTrigger>
              <TabTrigger name="my" href="/my" asChild>
                <NavItem tab="my" label="MY" theme={theme} />
              </TabTrigger>
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
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
