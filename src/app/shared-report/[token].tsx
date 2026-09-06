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
import { SharedReportPreview } from '@/features/chat/report/SharedReportPreview';
import type { SharePreview } from '@/features/chat/report/sharePreview';
import { isValidShareToken } from '@/features/chat/report/shareToken';
import { ShareCardHead } from '@/features/chat/report/ShareCardHead';

// 공유받은 상담 보고서 (Commercial UX V4 §22–§29). Lives inside the (tabs) group → renders within the REAL
// consumer nav shell.
//
// AUTH-GATE ORDERING (P0-B, §C): the RENDER branches on auth state FIRST. Read-only: no owner controls
// (§28/§29). Revoked/expired/invalid → one indistinguishable "cannot view" state (§H/§41).
//
// §22 NARROWED, 2026-09-06 (owner decision). Previously a logged-out visitor was redirected straight to
// /login and saw nothing. That lost them: someone tapping a friend's link has no idea what it is yet, and
// a login wall in front of an unknown thing is where people leave. Now there are TWO reads:
//   · logged out  → `loadSharePreview`  → the CONCLUSION only, from a separate anon-granted RPC
//   · authed      → `loadSharedReport`  → the full bounded DTO, authenticated-only grant UNCHANGED
// The narrowing is in the server's returned payload, not in this component — a field the anonymous
// reader must not see never arrives, so devtools shows nothing extra. The shape-valid token is still
// stashed in the ephemeral store (never `returnTo`, no open redirect) so signing up returns here.
type FetchStatus = 'loading' | 'ready' | 'unavailable';

// The card must be emitted on EVERY branch — including the logged-out <Redirect> — because the
// crawler that builds a messenger preview is never logged in. Wrapping is the only way to get a
// head next to a <Redirect>, which cannot take a sibling on its own.
export default function SharedReportScreen() {
  return (
    <>
      <ShareCardHead />
      <SharedReportBody />
    </>
  );
}

function SharedReportBody() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();
  const token = typeof params.token === 'string' ? params.token : '';
  const { authState } = useAuth();
  const { state: onboardingState } = useOnboarding();

  const [view, setView] = useState<PremiumReportVM | null>(null);
  const [status, setStatus] = useState<FetchStatus>('loading');
  // Anonymous half. Fetched only while logged out; cleared implicitly once the full view loads.
  const [preview, setPreview] = useState<SharePreview | null>(null);
  const [previewStatus, setPreviewStatus] = useState<FetchStatus>('loading');

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

  // Fetch the ANONYMOUS preview while logged out. Separate RPC, separate permission, separate
  // state — the full-read effect above is untouched and still never runs for a logged-out visitor.
  useEffect(() => {
    if (authState.status !== "unauthenticated") return;
    if (!isValidShareToken(token)) { setPreviewStatus("unavailable"); return; }
    let active = true;
    setPreviewStatus("loading");
    shareService
      .loadSharePreview(token)
      .then((o) => {
        if (!active) return;
        if (o.status === "ok") { setPreview(o.preview); setPreviewStatus("ready"); }
        else setPreviewStatus("unavailable");
      })
      .catch(() => { if (active) setPreviewStatus("unavailable"); });
    return () => { active = false; };
  }, [token, authState.status]);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  // ── Auth gate FIRST (render-level) ──────────────────────────────────────────
  // The share CARD (what a messenger renders before anyone clicks) is emitted on EVERY branch,
  // including the logged-out redirect — the crawler that builds the preview is never logged in.
  // It is deliberately identical for every share: see ShareCardHead for why.
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
    // §22 UPDATED 2026-09-06 (owner decision). The FULL body is still never fetched before login —
    // `get_shared_report` keeps its authenticated-only grant and is not called on this branch.
    // What changed is that a logged-out visitor now gets the CONCLUSION, from a separate,
    // deliberately narrower RPC. Value first, account second: a login wall in front of a link a
    // friend sent loses the visitor before they know what it is.
    if (previewStatus === 'loading') {
      return (
        <Screen padded={false} frame>
          <AppHeader title="공유받은 결과" />
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
    if (previewStatus === 'ready' && preview) {
      return (
        <Screen padded={false} frame>
          <AppHeader title="공유받은 결과" />
          <ScrollView contentContainerStyle={styles.previewScroll} showsVerticalScrollIndicator={false}>
            <SharedReportPreview
              preview={preview}
              onOpenFull={() => {
                // The token is already stashed by the effect above; stash again so a direct tap is
                // safe even if that effect has not run in this render pass. Idempotent.
                if (isValidShareToken(token)) setPendingShareToken(token);
                router.push('/login');
              }}
            />
          </ScrollView>
        </Screen>
      );
    }
    // Invalid / revoked / expired → the SAME indistinguishable state as the full read (§41), and
    // still no login wall: there is nothing behind it to log in for.
    return (
      <Screen padded={false} frame>
        <AppHeader title="공유받은 결과" />
        <View style={styles.centerPad}>
          <Card radius="xl">
            <Stack gap="sm">
              <Text variant="bodyMedium">지금은 볼 수 없는 링크예요.</Text>
              <Text variant="bodySmall" colorToken="textSecondary">
                링크가 만료되었거나 공유가 중단되었을 수 있어요. 보내주신 분께 다시 요청해 주세요.
              </Text>
              <Button label="덕분이 둘러보기" variant="secondary" radius="lg" onPress={() => router.replace('/')} />
            </Stack>
          </Card>
        </View>
      </Screen>
    );
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
  previewScroll: { flexGrow: 1, paddingBottom: 40 },
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
