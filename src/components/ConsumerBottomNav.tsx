import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/Text';
import { CONSUMER_NAV_ITEMS, type ConsumerNavKey } from '@/components/consumerNavItems';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, spacing } from '@/theme';

// Consumer bottom navigation for PUSHED detail screens (Commercial UX V4 §12/§13/§14). The primary tab
// bar is a layout-bound navigator (components/app-tabs*.tsx) that only wraps the (tabs) group and cannot
// be reused on a root-Stack detail route, so a detail screen that must keep the consumer nav renders
// this lightweight bar. It reuses the SAME item set/order/routes (CONSUMER_NAV_ITEMS — the single source
// of truth) and highlights the section the screen belongs to. Tapping switches to that tab (replace, so
// the detail is left rather than stacked). Text-forward + theme-driven so it renders identically on web
// and native (the tab glyphs are native-only assets that can't be shared here); an accent rule + weight
// carry the active state.
export function ConsumerBottomNav({ active }: { active?: ConsumerNavKey }) {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        {
          paddingBottom: insets.bottom + spacing.xs,
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
        },
      ]}
    >
      {CONSUMER_NAV_ITEMS.map((item) => {
        const isActive = item.key === active;
        return (
          <Pressable
            key={item.key}
            style={styles.item}
            onPress={() => router.replace(item.route)}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: isActive }}
            hitSlop={6}
          >
            <View
              style={[
                styles.indicator,
                { backgroundColor: isActive ? theme.primary : 'transparent' },
              ]}
            />
            <Text
              variant="caption"
              style={[
                styles.label,
                { color: isActive ? theme.primary : theme.textSecondary, fontWeight: isActive ? '700' : '500' },
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.sm,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
  },
  indicator: {
    width: 22,
    height: 3,
    borderRadius: 2,
  },
  label: {
    letterSpacing: 0.3,
  },
});
