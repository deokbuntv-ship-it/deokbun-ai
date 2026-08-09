import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, spacing } from '@/theme';

import { AdminSidebar } from './AdminSidebar';

// Web desktop/tablet admin shell: fixed sidebar + scrollable main content.
// Presentation-only; access control is enforced by the admin route layout before
// this ever renders. Active nav state is derived inside AdminSidebar.
export function AdminShell({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        backgroundColor: theme.background,
      }}
    >
      <AdminSidebar />
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: spacing.xl }}>
          {children}
        </ScrollView>
      </View>
    </View>
  );
}
