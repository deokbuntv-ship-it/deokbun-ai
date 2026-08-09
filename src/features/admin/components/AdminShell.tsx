import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, spacing } from '@/theme';

import type { AdminNavKey } from '../types';
import { AdminSidebar } from './AdminSidebar';

// Web desktop/tablet admin shell: fixed sidebar + scrollable main content.
// Presentation-only; access control is enforced by the admin route layout before
// this ever renders.
export function AdminShell({
  children,
  activeKey = 'dashboard',
}: {
  children: ReactNode;
  activeKey?: AdminNavKey;
}) {
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
      <AdminSidebar activeKey={activeKey} />
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: spacing.xl }}>
          {children}
        </ScrollView>
      </View>
    </View>
  );
}
