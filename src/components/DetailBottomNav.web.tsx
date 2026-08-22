import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/theme';

import { CONSUMER_NAV_ITEMS, type ConsumerNavKey } from './consumerNav';
import { ConsumerNavGlyph } from './ConsumerNavGlyph';

// Consumer bottom navigation for PUSHED detail screens on WEB (report/[id], shared-report/[token],
// compatibility-chat). The primary tab bar (app-tabs.web) is bound to the expo-router-ui
// <Tabs> navigator and its <TabSlot> renders ONLY declared tab routes — a root-Stack detail route cannot
// be nested into it without the slot falling back to the home tab (verified). So detail screens render
// THIS bar, a faithful mirror of app-tabs.web. Both consume the SAME CONSUMER_NAV_ITEMS + ConsumerNavGlyph
// (single source of truth), so the 5-item nav (홈·상담·궁합·운세우편함·MY) never drifts between them.
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
            <ConsumerNavGlyph name={item.key} color={color} active={isActive} />
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
    paddingHorizontal: 2, // keep 5 labels from touching at 375px width
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
