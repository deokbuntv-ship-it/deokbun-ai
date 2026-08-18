import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/theme';

// Native counterpart of DetailBottomNav.web (see that file for the architecture note). The app is
// mobile-web-first and the web bar carries the shared glyph set; on native (no inline SVG without an extra
// dependency, matching the app's LineIcon-null-on-native convention) the detail bar is label-forward with
// the same items/order/routes and an accent-color active state. Same exports as the .web file so imports
// resolve identically on both platforms.
export type DetailNavKey = 'home' | 'consult' | 'inbox' | 'my';

const ITEMS: { key: DetailNavKey; label: string; route: '/' | '/consult' | '/inbox' | '/my' }[] = [
  { key: 'home', label: '홈', route: '/' },
  { key: 'consult', label: '상담', route: '/consult' },
  { key: 'inbox', label: '운세우편함', route: '/inbox' },
  { key: 'my', label: 'MY', route: '/my' },
];

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
        const isActive = item.key === active;
        const color = isActive ? theme.primary : theme.textSecondary;
        return (
          <Pressable
            key={item.key}
            style={styles.navItem}
            onPress={() => router.replace(item.route)}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: isActive }}
          >
            <Text style={[styles.navLabel, { color, fontWeight: isActive ? '700' : '600' }]} numberOfLines={1}>
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
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'stretch',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  navLabel: {
    fontSize: 11,
    letterSpacing: -0.2,
  },
});
