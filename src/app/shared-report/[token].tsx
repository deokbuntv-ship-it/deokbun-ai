import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { DetailBottomNav } from '@/components/DetailBottomNav';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import { isOnboarded, useOnboarding } from '@/features/onboarding';
import { PremiumReportView } from '@/features/chat/report/PremiumReportView';
import { setPendingShareToken } from '@/features/chat/report/pendingSharedReport';
import { premiumViewFromSharedContent, type PremiumReportView as PremiumReportVM } from '@/features/chat/report/reportPresentation';
import { shareService } from '@/features/chat/report/shareService';
import { isValidShareToken } from '@/features/chat/report/shareToken';

// 공유받은 상담 보고서 (Commercial UX V4 §22–§29). Lives inside the (tabs) group → renders within the REAL
// consumer nav shell.
//
// AUTH-GATE ORDERING (P0-B, §C): the RENDER branches on auth state FIRST, so a logged-out visitor NEVER
// reaches the fetch, the report body, or the unavailable state — it stores the shape-valid token in an
// ephemeral store (never `returnTo`, no open redirect) and hands off to /login via a DECLARATIVE Redirect
// (robust on a fresh/incognito direct load, unlike an effect-based router.replace). The RPC is called ONLY
// when authenticated. Read-only: no owner controls (§28/§29). Revoked/expired/invalid → one
// indistinguishable "cannot view" state (§H/§41).
type FetchStatus = 'loading' | 'ready' | 'unavailable';

export default function SharedReportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();
  const token = typeof params.token === 'string' ? params.token : '';
  const { authState } = useAuth();
  const { state: onboardingState } = useOnboarding();

  const [view, setView] = useState<PremiumReportVM | null>(null);
  const [status, setStatus] = useState<FetchStatus>('loading');

  // Stash the token BEFORE any redirect (logged out OR authenticated-but-not-onboarded), shape-valid only.
  // Never in returnTo. FINAL OVERRIDE: a new/incomplete member must finish onboarding first, then the
  // resolver consumes this token to bring them straight back here — so we preserve it across BOTH hops.
  useEffect(() => {
    const willRedirect =
      authState.status === 'unauthenticated' ||
      (authState.status === 'authenticated' && !isOnboarded(onboardingState));
    if (willRedirect && isValidShareToken(token)) {
      setPendingShareToken(token);
    }
  }, [authState.status, onboardingState, token]);

  // Fetch the bounded DTO ONLY when authenticated AND fully onboarded (§C/§47 — never before, so an
  // incomplete member can never see a shared report ahead of finishing signup).
  useEffect(() => {
    if (authState.status !== 'authenticated' || !isOnboarded(onboardingState)) return;
    if (!isValidShareToken(token)) {
      setStatus('unavailable');
      return;
    }
    let active = true;
    setStatus('loading');
    shareService
      .loadSharedReport(token)
      .then((outcome) => {
        if (!active) return;
        if (outcome.status === 'ok') {
          setView(premiumViewFromSharedContent(outcome.content));
          setStatus('ready');
        } else {
          // 'unavailable' AND 'error' (infra, e.g. 42883) both render the generic screen; the 'error'
          // case was already logged with its pgCode (§14 — never silently presented as expired/revoked).
          setStatus('unavailable');
        }
      })
      .catch(() => {
        if (active) setStatus('unavailable');
      });
    return () => {
      active = false;
    };
  }, [token, authState.status, onboardingState]);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  // ── Auth gate FIRST (render-level) ──────────────────────────────────────────
  if (authState.status === 'loading') {
    return (
      <Screen padded={false} frame>
        <AppHeader title="공유받은 보고서" />
        <View style={styles.centerPad}>
          <Card radius="xl">
            <Text variant="bodyMedium" colorToken="textSecondary">
              불러오는 중입니다...
            </Text>
          </Card>
        </View>
      </Screen>
    );
  }
  if (authState.status === 'unauthenticated') {
    // The report body is NEVER fetched or shown before login (§22).
    return <Redirect href="/login" />;
  }
  // Authenticated but onboarding facts still resolving → hold (never flash the report).
  if (onboardingState === 'AUTHENTICATED_LOADING') {
    return (
      <Screen padded={false} frame>
        <AppHeader title="공유받은 보고서" />
        <View style={styles.centerPad}>
          <Card radius="xl">
            <Text variant="bodyMedium" colorToken="textSecondary">
              불러오는 중입니다...
            </Text>
          </Card>
        </View>
      </Screen>
    );
  }
  // FINAL OVERRIDE (§47): a new/incomplete member must finish onboarding before viewing. The token was
  // stashed above; the resolver returns them here once COMPLETE.
  if (!isOnboarded(onboardingState)) {
    return <Redirect href="/onboarding" />;
  }

  // ── Authenticated: bounded, read-only view ──────────────────────────────────
  return (
    <Screen padded={false} frame>
      <AppHeader title="공유받은 보고서" showBack onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          {status === 'loading' ? (
            <Card radius="xl">
              <Text variant="bodyMedium" colorToken="textSecondary">
                보고서를 불러오는 중입니다...
              </Text>
            </Card>
          ) : status === 'ready' && view ? (
            <PremiumReportView
              view={view}
              mode="shared"
              footer={
                <Card radius="xl">
                  <Stack gap="sm">
                    <Text variant="bodySmall" colorToken="textSecondary">
                      덕분이에서 나만의 상담 보고서도 만들어 볼 수 있어요.
                    </Text>
                    <Button label="덕분이 홈으로" variant="secondary" radius="lg" onPress={() => router.replace('/')} />
                  </Stack>
                </Card>
              }
            />
          ) : (
            // §41 — revoked / expired / invalid / not found → one calm, indistinguishable message.
            <Card radius="xl">
              <Stack gap="md">
                <Text variant="headingMedium">이 보고서를 확인할 수 없습니다.</Text>
                <Text variant="bodyMedium" colorToken="textSecondary">
                  공유가 종료되었거나 링크가 만료되었을 수 있어요.
                </Text>
                <Button label="덕분이 홈으로" radius="lg" onPress={() => router.replace('/')} />
              </Stack>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* The recipient is signed in — let them explore the app via the real consumer nav (§47). */}
      <DetailBottomNav />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    alignItems: 'center',
  },
  wrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  centerPad: {
    padding: 20,
  },
});
