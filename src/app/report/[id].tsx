import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
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
import { toPremiumReportView, type PremiumReportView as PremiumReportVM } from '@/features/chat/report/reportPresentation';
import { reportService } from '@/features/chat/report/reportService';
import { spacing } from '@/theme';

// 상담 보고서 상세 (Commercial UX V4 §5–§28). Owner-only premium view of a saved report. RLS-scoped load;
// a logged-out visitor is redirected to login (§24); a missing/other-owner id → a calm not-found (§25/§26,
// no raw security detail). Reload/direct-URL safe — always reads the DB (§22/§23). The consumer bottom
// nav is preserved on this pushed detail screen via ConsumerBottomNav (§10–§14), active on 운세우편함.
type Status = 'loading' | 'ready' | 'notfound' | 'error';

export default function ConsultationReportDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const { authState } = useAuth();

  const [view, setView] = useState<PremiumReportVM | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    if (authState.status !== 'authenticated') return;
    let active = true;
    setStatus('loading');
    reportService
      .loadReport(id)
      .then((report) => {
        if (!active) return;
        if (!report) {
          setStatus('notfound');
          return;
        }
        setView(toPremiumReportView(report));
        setStatus('ready');
      })
      .catch(() => {
        if (active) setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [id, authState.status]);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/inbox');
  };

  // §24 — a logged-out visitor cannot view a report. Redirect to login (RLS also protects the data).
  if (authState.status === 'unauthenticated') {
    return <Redirect href="/login" />;
  }

  return (
    <Screen padded={false} frame>
      <AppHeader title="상담 보고서" showBack onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          {status === 'loading' || authState.status === 'loading' ? (
            <Card radius="xl">
              <Text variant="bodyMedium" colorToken="textSecondary">
                보고서를 불러오는 중입니다...
              </Text>
            </Card>
          ) : status === 'ready' && view ? (
            <PremiumReportView view={view} mode="owner" />
          ) : (
            // §26 — not found / error: one calm line + a way back. No raw security detail (§25).
            <Card radius="xl">
              <Stack gap="md">
                <Text variant="headingMedium">보고서를 찾을 수 없어요.</Text>
                <Text variant="bodyMedium" colorToken="textSecondary">
                  삭제되었거나 접근할 수 없는 보고서예요.
                </Text>
                <Button label="우편함으로 돌아가기" radius="lg" onPress={() => router.replace('/inbox')} />
              </Stack>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* Preserve the consumer bottom navigation on this pushed detail screen (§10–§14). */}
      <ConsumerBottomNav active="inbox" />
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
