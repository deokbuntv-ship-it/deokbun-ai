import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import { toReportDetailView, type ReportDetailView } from '@/features/chat/report/reportPresentation';
import { reportService } from '@/features/chat/report/reportService';
import { spacing } from '@/theme';

// 상담 보고서 상세 (Commercial UX V4 §17/§22/§23/§24/§26). Owner-only: the report is loaded by id
// through reportService (RLS-scoped) — a logged-out visitor is redirected to login (§24); a report
// that does not exist OR belongs to another user simply returns null → a safe "not found" state
// (§25, no raw security detail). Reload/direct-URL safe: the data always comes from the DB, never an
// in-memory hand-off (§22/§23). The view is a deterministic projection (toReportDetailView) that hides
// empty sections and carries no engine/debug language.
type Status = 'loading' | 'ready' | 'notfound' | 'error';

export default function ConsultationReportDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const { authState } = useAuth();

  const [view, setView] = useState<ReportDetailView | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    // Wait for auth to resolve before querying (an unauthenticated read would just 404).
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
        setView(toReportDetailView(report));
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
            <Stack gap="xl">
              {/* header — title + generation date */}
              <Stack gap="xs">
                <Text variant="displayMedium">{view.title}</Text>
                {view.dateLabel ? (
                  <Text variant="bodySmall" colorToken="textSecondary">
                    {view.dateLabel}
                  </Text>
                ) : null}
              </Stack>

              {/* sections — empty ones are already filtered out (§18) */}
              {view.sections.map((section, i) => (
                <Card key={i} radius="xl">
                  <Stack gap="sm">
                    <Text variant="headingMedium" style={styles.bold}>
                      {section.title}
                    </Text>
                    {section.kind === 'paragraph' ? (
                      <Text variant="bodyMedium" style={styles.body}>
                        {section.body}
                      </Text>
                    ) : (
                      <Stack gap="xs">
                        {section.items.map((it, j) => (
                          <View key={j} style={styles.bulletRow}>
                            <Text variant="bodyMedium" colorToken="textSecondary">
                              ·
                            </Text>
                            <Text variant="bodyMedium" style={styles.bulletText}>
                              {it}
                            </Text>
                          </View>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </Card>
              ))}
            </Stack>
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
  bold: {
    fontWeight: '700',
  },
  body: {
    lineHeight: 23,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bulletText: {
    flex: 1,
    lineHeight: 23,
  },
});
