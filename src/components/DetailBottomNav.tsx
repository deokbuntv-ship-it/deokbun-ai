import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/theme';

import { CONSUMER_NAV_ITEMS, type ConsumerNavKey } from './consumerNav';

// Native counterpart of DetailBottomNav.web (see that file for the architecture note). Label-forward on
// native (no inline SVG without an extra dependency), same items/order/routes from the shared
// CONSUMER_NAV_ITEMS (홈·상담·궁합·운세우편함·MY) with an active-color state.
export type DetailNavKey = ConsumerNavKey;

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
    paddingHorizontal: 2,
  },
  navLabel: {
    fontSize: 11,
    letterSpacing: -0.2,
  },
});
