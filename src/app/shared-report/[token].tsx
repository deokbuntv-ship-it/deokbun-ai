import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ConsumerBottomNav } from '@/components/ConsumerBottomNav';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import { PremiumReportView } from '@/features/chat/report/PremiumReportView';
import { setPendingShareToken } from '@/features/chat/report/pendingSharedReport';
import { premiumViewFromSharedContent, type PremiumReportView as PremiumReportVM } from '@/features/chat/report/reportPresentation';
import { shareService } from '@/features/chat/report/shareService';
import { isValidShareToken } from '@/features/chat/report/shareToken';
import { spacing } from '@/theme';

// 공유받은 상담 보고서 (Commercial UX V4 §22–§29). A recipient MUST be logged in — the report body is
// NEVER shown before login (§22). If logged out, the shape-valid token is stashed in an ephemeral store
// and login proceeds; after login the continuation returns here (§24, no open redirect). The report is
// read through the get_shared_report RPC, which returns a BOUNDED DTO (§27) — no owner id, conversation,
// grounding, or account data ever reaches this screen. Read-only: no edit / regenerate / owner controls
// (§28/§29). Revoked / expired / invalid → an indistinguishable "no longer shared" state (§41).
type Status = 'checking' | 'loading' | 'ready' | 'unavailable';

export default function SharedReportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();
  const token = typeof params.token === 'string' ? params.token : '';
  const { authState } = useAuth();

  const [view, setView] = useState<PremiumReportVM | null>(null);
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    if (authState.status === 'loading') return; // wait for auth to resolve
    // §22 — logged out: stash the token (never the report) and send to login; the report body is not
    // fetched or shown. After login the continuation returns to this exact route.
    if (authState.status === 'unauthenticated') {
      if (isValidShareToken(token)) setPendingShareToken(token);
      router.replace('/login');
      return;
    }
    // Authenticated: validate + fetch the bounded DTO.
    if (!isValidShareToken(token)) {
      setStatus('unavailable');
      return;
    }
    let active = true;
    setStatus('loading');
    shareService
      .loadSharedReport(token)
      .then((content) => {
        if (!active) return;
        if (!content) {
          setStatus('unavailable');
          return;
        }
        setView(premiumViewFromSharedContent(content));
        setStatus('ready');
      })
      .catch(() => {
        if (active) setStatus('unavailable');
      });
    return () => {
      active = false;
    };
  }, [token, authState.status, router]);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <Screen padded={false} frame>
      <AppHeader title="공유받은 보고서" showBack onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          {status === 'ready' && view ? (
            <PremiumReportView
              view={view}
              mode="shared"
              footer={
                // A gentle, non-ad invitation — the shared view doubles as a soft entry point (§47).
                <Card radius="xl">
                  <Stack gap="sm">
                    <Text variant="bodySmall" colorToken="textSecondary">
                      덕분AI에서 나만의 상담 보고서도 만들어 볼 수 있어요.
                    </Text>
                    <Button
                      label="덕분AI 홈으로"
                      variant="secondary"
                      radius="lg"
                      onPress={() => router.replace('/')}
                    />
                  </Stack>
                </Card>
              }
            />
          ) : status === 'ready' || status === 'loading' || status === 'checking' ? (
            <Card radius="xl">
              <Text variant="bodyMedium" colorToken="textSecondary">
                보고서를 불러오는 중입니다...
              </Text>
            </Card>
          ) : (
            // §41 — revoked / expired / invalid / not found → one calm, indistinguishable message.
            <Card radius="xl">
              <Stack gap="md">
                <Text variant="headingMedium">이 보고서는 더 이상 공유되지 않습니다.</Text>
                <Text variant="bodyMedium" colorToken="textSecondary">
                  공유가 취소되었거나 링크가 만료되었을 수 있어요.
                </Text>
                <Button label="덕분AI 홈으로" radius="lg" onPress={() => router.replace('/')} />
              </Stack>
            </Card>
          )}
        </View>
      </ScrollView>

      <ConsumerBottomNav />
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
});
