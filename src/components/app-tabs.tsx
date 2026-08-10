import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

// Final product IA (§2): 홈 · 운세 · AI 상담 · 인연 · MY.
// AI 상담 is the product center — placed in the middle slot. Single icon family
// (SF Symbols on iOS, Material on Android/web) via one NativeTabs bar; no
// parallel nav system. 운세 우편함 / records live under MY (not a bottom tab).
export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>홈</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="fortune">
        <NativeTabs.Trigger.Label>운세</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="sparkles" md="auto_awesome" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="consult">
        <NativeTabs.Trigger.Label>AI 상담</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="bubble.left.and.bubble.right.fill"
          md="forum"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="relationship">
        <NativeTabs.Trigger.Label>인연</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.2.fill" md="group" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="my">
        <NativeTabs.Trigger.Label>MY</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.crop.circle.fill" md="account_circle" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
