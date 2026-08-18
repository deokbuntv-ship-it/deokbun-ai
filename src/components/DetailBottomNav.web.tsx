import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/theme';

// Consumer bottom navigation for PUSHED detail screens on WEB (report/[id], shared-report/[token],
// mail-detail). The primary tab bar (app-tabs.web) is bound to the expo-router-ui <Tabs> navigator and
// its <TabSlot> renders ONLY declared tab routes — a root-Stack detail route cannot be nested into it
// without the slot falling back to the home tab (verified). So detail screens render THIS bar, which is a
// faithful mirror of app-tabs.web — the SAME glyphs, 58px height, colors, spacing, and active color — so
// it is visually indistinguishable from the real nav. It navigates with the router (replace) and marks
// the `active` section. The primary navigator is left completely untouched (zero regression).
export type DetailNavKey = 'home' | 'consult' | 'inbox' | 'my';

const NAV_HEIGHT = 56;

const ITEMS: { key: DetailNavKey; label: string; route: '/' | '/consult' | '/inbox' | '/my' }[] = [
  { key: 'home', label: '홈', route: '/' },
  { key: 'consult', label: '상담', route: '/consult' },
  { key: 'inbox', label: '운세우편함', route: '/inbox' },
  { key: 'my', label: 'MY', route: '/my' },
];

// Identical inline-SVG glyphs to app-tabs.web (this is a .web.tsx file → renders through react-dom).
function TabGlyph({ name, color, active }: { name: DetailNavKey; color: string; active: boolean }) {
  const common = {
    width: 22,
    height: 22,
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
      {ITEMS.map((item) => {
        const color = item.key === active ? theme.primary : theme.textSecondary;
        return (
          <Pressable
            key={item.key}
            style={styles.navItem}
            onPress={() => router.replace(item.route)}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: item.key === active }}
          >
            <TabGlyph name={item.key} color={color} active={item.key === active} />
            <Text style={[styles.navLabel, { color }]} numberOfLines={1}>
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
