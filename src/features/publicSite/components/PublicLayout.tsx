import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { MaxContentWidth } from '@/constants/theme';

// Centered, max-width scroll container for public (consumer-facing) pages.
// Mirrors the home screen's layout so the public surface matches the app.
export function PublicScreen({ children }: { children: ReactNode }) {
  return (
    <Screen padded>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>{children}</View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 24,
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
});
