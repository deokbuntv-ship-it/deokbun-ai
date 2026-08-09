import { Slot, useRouter } from 'expo-router';
import { Platform } from 'react-native';

import { AdminGate, AdminShell, useAdminAuthorization } from '@/features/admin';

// Admin route group. Access control lives HERE so admin child routes (<Slot/>)
// never mount unless authorization is explicitly granted.
export default function AdminLayout() {
  const router = useRouter();
  const status = useAdminAuthorization();

  // Leave to the normal app (root). Uses replace to avoid any admin redirect loop.
  const leave = () => router.replace('/');
  const login = () => router.replace('/login');

  // Web-only operations UI. Native never renders the admin shell.
  if (Platform.OS !== 'web') {
    return <AdminGate variant="native-blocked" onLeave={leave} />;
  }

  // FAIL CLOSED: the shell + child routes render ONLY when the DB authority
  // explicitly returns 'admin'. Every other status — including 'unavailable'
  // (authority not yet applied / error) — renders a gate, never the shell.
  if (status === 'admin') {
    return (
      <AdminShell>
        <Slot />
      </AdminShell>
    );
  }

  return <AdminGate variant={status} onLeave={leave} onLogin={login} />;
}
