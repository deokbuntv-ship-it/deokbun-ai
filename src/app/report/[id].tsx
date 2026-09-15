import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { DeleteConfirmSheet } from '@/components/DeleteConfirmSheet';
import { DetailBottomNav } from '@/components/DetailBottomNav';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import { PremiumReportView } from '@/features/chat/report/PremiumReportView';
import { ShareReportSheet } from '@/features/chat/report/ShareReportSheet';
import { toPremiumReportView, type PremiumReportView as PremiumReportVM } from '@/features/chat/report/reportPresentation';
import { toPremiumProductView } from '@/features/premium/presentation/premiumReportProjection';
import type { PremiumReportPayload } from '@/features/premium/types';
import { reportService, type ReportType } from '@/features/chat/report/reportService';

// 보고서 삭제 (2026-09-13 CTO: 대화를 지워도 보고서는 남고, 보고서는 따로 지울 수 있다). 무엇이 지워지고 무엇이
// 남는지를 버튼보다 먼저 — 프리미엄은 산 것이라 다시 보려면 새로 사야 한다는 것까지.
function reportDeleteLines(type: ReportType, hasConversation: boolean): string[] {
  const noun = type === 'premium' ? '리포트' : '보고서';
  return [
    `${noun}와 공유 링크가 함께 지워져요. 되돌릴 수 없어요.`,
    '링크를 받은 사람도 더 이상 볼 수 없어요.',
    ...(type === 'premium' ? ['프리미엄 리포트는 지운 뒤 다시 보려면 새로 구매해야 해요.'] : []),
    ...(hasConversation ? ['원래 상담 기록은 그대로 남아요.'] : []),
  ];
}

// 상담 보고서 상세 (Commercial UX V4 §5–§28). Lives INSIDE the (tabs) group so it renders within the REAL
// consumer navigation shell (app-tabs) — the real bottom bar, not a custom footer. Owner-only: RLS load;
// logged-out → declarative Redirect to login (§24); missing/other-owner id → a calm not-found (§25/§26).
// Reload/direct-URL safe (§22/§23).
type Status = 'loading' | 'ready' | 'notfound' | 'error';

export default function ConsultationReportDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const { authState } = useAuth();

  const [view, setView] = useState<PremiumReportVM | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [shareVisible, setShareVisible] = useState(false);
  const [meta, setMeta] = useState<{ type: ReportType; hasConversation: boolean } | null>(null);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
        // A premium row carries its own payload shape, so it takes its own projection into the SAME
        // view-model. The renderer below is untouched — that is the point of the projection.
        setView(report.reportType === 'premium'
          ? toPremiumProductView(report.payload as PremiumReportPayload)
          : toPremiumReportView(report));
        setMeta({ type: report.reportType, hasConversation: report.conversationId !== null });
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

  const confirmDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    setDeleteError(null);
    const deleted = await reportService.deleteReport(id);
    setDeleting(false);
    if (!deleted) {
      setDeleteError('삭제하지 못했어요. 잠시 후 다시 시도해 주세요.');
      return;
    }
    setDeleteVisible(false);
    router.replace('/inbox');
  };

  // §24 — a logged-out visitor cannot view a report. Declarative redirect (robust on direct/fresh loads).
  if (authState.status === 'unauthenticated') {
    return <Redirect href="/login" />;
  }

  return (
    <Screen padded={false} frame>
      <AppHeader title={view?.eyebrow === '프리미엄 리포트' ? '프리미엄 리포트' : '상담 보고서'} showBack showBell onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          {status === 'loading' || authState.status === 'loading' ? (
            <Card radius="xl">
              <Text variant="bodyMedium" colorToken="textSecondary">
                보고서를 불러오는 중입니다...
              </Text>
            </Card>
          ) : status === 'ready' && view ? (
            <PremiumReportView
              view={view}
              mode="owner"
              footer={
                <Stack gap="sm">
                  <Button label="보고서 공유하기" radius="lg" onPress={() => setShareVisible(true)} />
                  <Button
                    label={meta?.type === 'premium' ? '리포트 삭제' : '보고서 삭제'}
                    variant="tertiary"
                    radius="lg"
                    onPress={() => {
                      setDeleteError(null);
                      setDeleteVisible(true);
                    }}
                  />
                </Stack>
              }
            />
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

      {/* The real consumer bottom nav on this pushed detail screen (§10–§14). */}
      <DetailBottomNav active="inbox" />

      <ShareReportSheet visible={shareVisible} onClose={() => setShareVisible(false)} reportId={id} />

      <DeleteConfirmSheet
        visible={deleteVisible}
        title={meta?.type === 'premium' ? '이 리포트를 삭제할까요?' : '이 보고서를 삭제할까요?'}
        lines={reportDeleteLines(meta?.type ?? 'consultation', meta?.hasConversation ?? false)}
        confirmLabel="삭제"
        busy={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onClose={() => setDeleteVisible(false)}
      />
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
