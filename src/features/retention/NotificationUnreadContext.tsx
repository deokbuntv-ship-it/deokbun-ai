import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
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
  // Scope the unread state to the ACTUAL user id (not just isAuthenticated) so an account switch cannot leak
  // one user's count into another's session (privacy §B1). A monotonically-increasing token discards any
  // in-flight count response from a previous user before it can land.
  const { authState } = useAuth();
  const userId = authState.user?.id ?? null;
  const [unreadState, setUnreadState] = useState<{ ownerUserId: string | null; count: number }>({
    ownerUserId: null,
    count: 0,
  });
  // Render-time owner check closes the passive-effect window during a direct A→B account switch.
  const unreadCount = unreadState.ownerUserId === userId ? unreadState.count : 0;
  const tokenRef = useRef(0);

  const refresh = useCallback(() => {
    const token = ++tokenRef.current; // invalidate any earlier in-flight response
    if (!userId) {
      setUnreadState({ ownerUserId: null, count: 0 });
      return;
    }
    inAppNotificationService
      .unreadCount()
      .then((n) => {
        if (token !== tokenRef.current) return; // a newer refresh (or a user change) superseded this one
        setUnreadState({ ownerUserId: userId, count: Number.isFinite(n) && n > 0 ? n : 0 });
      })
      .catch(() => {
        /* non-blocking — a failed count never breaks a header */
      });
  }, [userId]);

  // On ANY user change (login / logout / A→B switch): clear the badge IMMEDIATELY (so B never sees A's count),
  // discard A's in-flight response (token bump inside refresh), then fetch for the current user.
  useEffect(() => {
    tokenRef.current += 1;
    setUnreadState({ ownerUserId: userId, count: 0 });
    refresh();
  }, [userId, refresh]);

  // Refresh when the app/tab regains focus so notifications created while away (e.g. a trigger) surface —
  // ONE listener for the whole app, not a per-screen fetch.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    // Same web hazard as Candle: RNW AppState.addEventListener returns undefined when AppState is
    // unavailable (no document.visibilityState). Native always returns a subscription.
    return () => sub?.remove();
  }, [refresh]);

  const markOneRead = useCallback(() => setUnreadState((s) =>
    s.ownerUserId === userId ? { ...s, count: Math.max(0, s.count - 1) } : { ownerUserId: userId, count: 0 }), [userId]);
  const markAllRead = useCallback(() => setUnreadState({ ownerUserId: userId, count: 0 }), [userId]);

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
