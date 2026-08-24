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
// signature-orange active state to match the tab bar (§ real-device QA #1).
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
        const color = isActive ? theme.brandPrimary : theme.textSecondary;
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
    letterSpacing: -0.2,
  },
});
