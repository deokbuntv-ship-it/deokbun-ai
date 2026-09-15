import { Redirect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { DetailBottomNav } from '@/components/DetailBottomNav';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import {
  inAppNotificationService,
  resolveDeepLinkPath,
  trackRetentionEvent,
  useNotificationUnread,
  type InAppNotification,
} from '@/features/retention';
import { colors } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// 알림 센터 (retention §5) — the in-app EVENT/DELIVERY inbox. This is DISTINCT from 운세우편함 (§5.1): it holds
// short "새 콘텐츠/일정이 있음" pointers, NEVER the full Today/Monthly/report content. Tapping marks the item
// read and routes to an ALLOWLISTED destination only (§17) — the resolved path is a relative in-app route, so
// auth/onboarding continuation still applies (no open redirect). 0 LLM.
function formatWhen(iso: string): string {
  const day = iso.slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);
  if (day === today) return '오늘';
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (day === yesterday) return '어제';
  const [, m, d] = day.split('-');
  return m && d ? `${Number(m)}월 ${Number(d)}일` : day;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const { isAuthenticated } = useAuth();
  // The shared global unread state — keep the header badge in sync as items are read here (global-bell §6).
  const { refresh, markOneRead, markAllRead: markAllReadShared } = useNotificationUnread();

  const [items, setItems] = useState<InAppNotification[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false); // distinguish a load failure from a genuinely empty list (§J9)

  const reload = useCallback(() => {
    inAppNotificationService
      .list()
      .then((rows) => {
        setItems(rows);
        setError(false);
        setLoaded(true);
      })
      .catch(() => {
        setError(true); // do NOT render as "no notifications" — show an error + retry
        setLoaded(true);
      });
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      reload();
      refresh(); // sync the shared badge count with the server when the list opens
    }
  }, [isAuthenticated, reload, refresh]);

  const unreadInList = items.filter((n) => n.readAt === null).length;
  const hasUnread = unreadInList > 0;

  const open = (n: InAppNotification) => {
    // Mark read first (optimistic), then route to the allowlisted destination.
    if (n.readAt === null) {
      setItems((cur) => cur.map((x) => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x)));
      void inAppNotificationService.markRead(n.id);
      markOneRead(); // shared badge decrement
    }
    trackRetentionEvent('notification_opened', { category: n.category, deep_link_target: n.deepLinkTarget });
    const path = resolveDeepLinkPath(n.deepLinkTarget, n.deepLinkId);
    router.push(path as never);
  };

  const markAll = () => {
    if (!hasUnread) return;
    const now = new Date().toISOString();
    setItems((cur) => cur.map((x) => (x.readAt === null ? { ...x, readAt: now } : x)));
    void inAppNotificationService.markAllRead();
    markAllReadShared(); // shared badge → 0
  };

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  if (!isAuthenticated) return <Redirect href="/login" />;

  return (
    <Screen padded={false} frame>
      <AppHeader
        title="알림"
        showBack
        onBack={handleBack}
        rightSlot={
          hasUnread ? (
            <Pressable onPress={markAll} accessibilityRole="button" hitSlop={8} style={styles.markAll}>
              <Text variant="bodySmall" colorToken="primary" style={{ fontWeight: '700' }}>
                모두 읽기
              </Text>
            </Pressable>
          ) : undefined
        }
      />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          {/* Small unread summary — only when there is something unread, so it never reads as a status line. */}
          {unreadInList > 0 ? (
            <Text variant="bodySmall" colorToken="textSecondary" style={styles.summary}>
              읽지 않은 알림 {unreadInList}개
            </Text>
          ) : null}
          {loaded && error ? (
            <Card radius="xl">
              <Stack gap="sm">
                <Text variant="bodyMedium" colorToken="textSecondary">
                  알림을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
                </Text>
                <Pressable onPress={reload} accessibilityRole="button" style={styles.markAll}>
                  <Text variant="bodySmall" colorToken="primary" style={{ fontWeight: '700' }}>다시 시도</Text>
                </Pressable>
              </Stack>
            </Card>
          ) : loaded && items.length === 0 ? (
            <Card radius="xl">
              <Text variant="bodyMedium" colorToken="textSecondary">
                새로운 알림이 없어요.
              </Text>
            </Card>
          ) : (
            <Stack gap="sm">
              {items.map((n) => {
                const unread = n.readAt === null;
                return (
                  <Pressable key={n.id} onPress={() => open(n)} accessibilityRole="button">
                    {/* Unread rows get a subtle surface tint (existing token) + bold title + dot; read rows
                        are plain. No aggressive color — keeps the premium tone. */}
                    <Card radius="lg" style={unread ? { backgroundColor: theme.backgroundSelected } : undefined}>
                      <View style={styles.row}>
                        <View
                          style={[
                            styles.dot,
                            { backgroundColor: unread ? theme.primary : 'transparent' },
                          ]}
                        />
                        <View style={styles.flex1}>
                          <View style={styles.titleRow}>
                            <Text
                              variant="bodyMedium"
                              numberOfLines={1}
                              style={[styles.title, unread ? styles.titleUnread : null]}
                            >
                              {n.title}
                            </Text>
                            <Text variant="bodySmall" colorToken="textSecondary">
                              {formatWhen(n.createdAt)}
                            </Text>
                          </View>
                          {n.body ? (
                            <Text variant="bodySmall" colorToken="textSecondary" numberOfLines={2}>
                              {n.body}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    </Card>
                  </Pressable>
                );
              })}
            </Stack>
          )}
        </View>
      </ScrollView>
      <DetailBottomNav active="my" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40, alignItems: 'center' },
  wrapper: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  markAll: { minHeight: 44, justifyContent: 'center', paddingLeft: 8 },
  summary: { paddingHorizontal: 4, paddingBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  flex1: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { flex: 1 },
  titleUnread: { fontWeight: '700' },
});
