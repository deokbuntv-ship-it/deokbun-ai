import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { useAuth } from '@/features/auth';

import { inAppNotificationService } from './services/inAppNotificationService';

// ONE shared unread-notification state for the whole authenticated consumer app (global-bell §6/§7). Every
// eligible screen's header reads the SAME count from here — navigating between screens never triggers a new
// fetch (no N+1 from header remounts). The count refreshes on auth change and when the app returns to the
// foreground (AppState 'active', which react-native-web maps to tab visibility), and updates OPTIMISTICALLY
// when the user reads notifications, so the badge stays correct without an app restart. IN-APP only — no push.
type NotificationUnreadValue = {
  unreadCount: number;
  refresh: () => void; // re-fetch from the server (e.g. after opening the list)
  markOneRead: () => void; // optimistic: one item read → decrement (never below 0)
  markAllRead: () => void; // optimistic: everything read → 0
};

const NotificationUnreadContext = createContext<NotificationUnreadValue | null>(null);

export function NotificationUnreadProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    inAppNotificationService
      .unreadCount()
      .then((n) => setUnreadCount(Number.isFinite(n) && n > 0 ? n : 0))
      .catch(() => {
        /* non-blocking — a failed count never breaks a header */
      });
  }, [isAuthenticated]);

  // Fetch once per auth transition (login/logout). Logout zeroes the badge immediately.
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Refresh when the app/tab regains focus so notifications created while away (e.g. a trigger) surface —
  // ONE listener for the whole app, not a per-screen fetch.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  const markOneRead = useCallback(() => setUnreadCount((c) => Math.max(0, c - 1)), []);
  const markAllRead = useCallback(() => setUnreadCount(0), []);

  const value = useMemo<NotificationUnreadValue>(
    () => ({ unreadCount, refresh, markOneRead, markAllRead }),
    [unreadCount, refresh, markOneRead, markAllRead],
  );

  return <NotificationUnreadContext.Provider value={value}>{children}</NotificationUnreadContext.Provider>;
}

// Safe to call without a provider (returns a zero/no-op value) so AppHeader never hard-depends on the provider
// being mounted (e.g. isolated tests / pre-auth trees).
const FALLBACK: NotificationUnreadValue = {
  unreadCount: 0,
  refresh: () => {},
  markOneRead: () => {},
  markAllRead: () => {},
};

export function useNotificationUnread(): NotificationUnreadValue {
  return useContext(NotificationUnreadContext) ?? FALLBACK;
}
