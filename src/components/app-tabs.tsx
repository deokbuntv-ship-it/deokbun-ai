import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { colors as semantic } from '@/theme';

// FINAL Stitch bottom navigation (owner nav decision) — 5 tabs: 홈 · 상담 · 궁합 · 운세우편함 · MY.
// Order/labels mirror the shared CONSUMER_NAV_ITEMS (NativeTabs children can't be data-driven, so the
// order is kept literal here). Single icon family (SF Symbols iOS / Material Android-web), deep-navy
// active label. AI 상담(/chat), 궁합 상담(/compatibility-chat), and 운세우편 상세 are pushed screens, not tabs.
export default function AppTabs() {
  const scheme = useColorScheme();
  const key = scheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[key];
  const brand = semantic[key]; // signature-orange selected state (§15)

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={brand.brandPrimarySoft}
      labelStyle={{ selected: { color: brand.brandPrimary } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>홈</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="consult">
        <NativeTabs.Trigger.Label>상담</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="bubble.left.and.bubble.right.fill" md="chat" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="compatibility">
        <NativeTabs.Trigger.Label>궁합</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.2.fill" md="group" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="inbox">
        <NativeTabs.Trigger.Label>운세우편함</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="envelope.fill" md="mail" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="my">
        <NativeTabs.Trigger.Label>MY</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.fill" md="person" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
