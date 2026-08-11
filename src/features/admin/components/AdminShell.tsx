import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

import { adminTheme } from '../adminTheme';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';

// Web admin shell (Stitch): fixed navy sidebar + [shared top bar over a
// soft-gray, 1440px-capped scrollable canvas]. Presentation-only; access control
// is enforced by the admin route layout before this ever renders.
export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: adminTheme.pageBg }}>
      <AdminSidebar />
      <View style={{ flex: 1 }}>
        <AdminTopBar />
        <ScrollView
          style={{ flex: 1, backgroundColor: adminTheme.pageBg }}
          contentContainerStyle={{ padding: 24, alignItems: 'center' }}
        >
          <View style={{ width: '100%', maxWidth: 1440 }}>{children}</View>
        </ScrollView>
      </View>
    </View>
  );
}
