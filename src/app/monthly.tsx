import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { AiDisclosure } from '@/components/AiDisclosure';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { DetailBottomNav } from '@/components/DetailBottomNav';
import { FortuneReading } from '@/components/Reading';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import { setPendingConsultationIntent, useConsultationDraft, useConsultationSubjects } from '@/features/consultation';
import { isSolarTermBoundaryTimeRequired } from '@/features/consultation/birthBoundaryGate';
import { BoundaryTimeNotice } from '@/features/consultation/components/BoundaryTimeNotice';
import {
  monthlyFortuneService,
  monthlyToneVariant,
  parseMonthKey,
  toMonthlyDetailView,
  trackMonthlyEvent,
  type MonthlyFortuneRecord,
} from '@/features/monthly';
import { colors } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Status = 'loading' | 'ready' | 'unavailable' | 'error' | 'no-self' | 'auth';

// Tone/status colours now live in the shared FortuneReading (DESIGN_FREEZE tokens, no hardcoded hex).

// 이번 달 운세 상세 (§52–§55). A gated, pushed screen. On open it load-or-creates the CURRENT month's canonical
// record (0 LLM on a cache hit); a ?ym=YYYY-MM param opens a PAST record read-only (never regenerates history,
// §42). Refresh = DB read. Consultation CTAs re-ground INDEPENDENTLY (they carry only a question, never the
// monthly text as evidence, §68). The month judgment is server-owned; the LLM only verbalized it.
export default function MonthlyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ ym?: string }>();
  const requestedMonth = typeof params.ym === 'string' ? parseMonthKey(params.ym) : null;
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  const { subjects, status: subjectsStatus } = useConsultationSubjects();
  const { updateSubject, updateBirthInfo } = useConsultationDraft();
  const self = subjects.find((s) => s.isSelf) ?? null;

  const [status, setStatus] = useState<Status>('loading');
  const [record, setRecord] = useState<MonthlyFortuneRecord | null>(null);
  const loadToken = useRef(0);

  const load = useCallback(async () => {
    const token = ++loadToken.current;
    setStatus('loading');

    // A specific past month → read-only load (never regenerate history, §42).
    if (requestedMonth) {
      const r = await monthlyFortuneService.getByMonth(requestedMonth.year, requestedMonth.month);
      if (token !== loadToken.current) return;
      setRecord(r);
      setStatus(r ? 'ready' : 'unavailable');
      return;
    }

    if (subjectsStatus === 'loading' || subjectsStatus === 'idle') return; // wait for the SELF subject
    if (!self) {
      setStatus('no-self');
      return;
    }

    const outcome = await monthlyFortuneService.ensureCurrentMonth({ birthInput: self.birthInfo, subjectId: self.id });
    if (token !== loadToken.current) return;
    if (outcome.status === 'ok') {
      setRecord(outcome.record);
      setStatus('ready');
      trackMonthlyEvent(outcome.cacheHit ? 'monthly_fortune_cache_hit' : 'monthly_fortune_generated', {
        fortune_month: `${outcome.record.year}-${String(outcome.record.month).padStart(2, '0')}`,
        cache_status: outcome.cacheHit ? 'hit' : 'miss',
        overall_tier: outcome.record.overallTier,
      });
    } else if (outcome.status === 'auth') {
      setStatus('auth');
    } else if (outcome.status === 'unavailable') {
      setStatus('unavailable');
    } else {
      setStatus('error');
    }
  }, [requestedMonth, self, subjectsStatus]);

  useEffect(() => {
    trackMonthlyEvent('monthly_fortune_detail_opened', requestedMonth ? { fortune_month: `${requestedMonth.year}-${String(requestedMonth.month).padStart(2, '0')}` } : {});
  }, [requestedMonth]);

  useEffect(() => {
    void load();
  }, [load]);

  const askInConsultation = (question: string) => {
    // Route to 상담 about the USER (canonical SELF), carrying ONLY the question — the consultation server
    // recomputes its own grounding (the monthly result is never sent as evidence, §68).
    if (self) {
      updateSubject({ id: self.id, displayName: self.displayName, relationship: self.relationship });
      updateBirthInfo(self.birthInfo);
    }
    setPendingConsultationIntent({ question });
    trackMonthlyEvent('monthly_fortune_consultation_clicked', record ? { fortune_month: `${record.year}-${String(record.month).padStart(2, '0')}` } : {});
    router.push({ pathname: '/chat', params: { startNew: '1' } });
  };

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  if (status === 'auth') return <Redirect href="/login" />;

  return (
    <Screen padded={false} frame>
      <AppHeader title="이번 달 운세" showBack showBell onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          {status === 'loading' ? (
            <View style={styles.center}>
              <ActivityIndicator color={theme.primary} />
              <Text variant="bodyMedium" colorToken="textSecondary" style={{ marginTop: 12 }}>
                이번 달 운세를 준비하고 있어요...
              </Text>
            </View>
          ) : status === 'ready' && record ? (
            (() => {
              const view = toMonthlyDetailView(record);
              return (
                <Stack gap="lg">
                  <FortuneReading
                    toneLabel={view.overallTier}
                    toneVariant={view.toneVariant}
                    modeLabel={view.primaryModeLabel}
                    meta={view.monthLabel}
                    leadLabel="이번 달 한마디"
                    headline={view.headline}
                    verdict={view.verdict}
                    signalsTitle="이번 달 핵심"
                    domainSignals={view.domainSignals}
                    transition={
                      view.transition
                        ? {
                            dateLabel: `${view.transition.dateLabel} 무렵부터 흐름이 달라져요.`,
                            lines: [`초반 · ${view.transition.early.tierLabel}`, `중반 이후 · ${view.transition.later.tierLabel}`],
                          }
                        : null
                    }
                    highlightsTitle="이번 달 기회"
                    highlights={view.opportunities}
                    cautionsTitle="이번 달 조심할 점"
                    cautions={view.cautions}
                    actionsTitle="이번 달 이렇게 보내보세요"
                    actions={view.actions}
                    evidence={view.evidence}
                    followUps={view.followUps}
                    onFollowUp={askInConsultation}
                  />
                  {/* AI-generated-content disclosure (§2) — one line under the fortune result. */}
                  <AiDisclosure />
                </Stack>
              );
            })()
          ) : status === 'no-self' ? (
            <Card radius="xl">
              <Stack gap="md">
                <Text variant="bodyMedium">먼저 본인의 출생정보를 등록해 주세요.</Text>
                <Button label="MY로 이동" onPress={() => router.replace('/my')} />
              </Stack>
            </Card>
          ) : status === 'unavailable' && isSolarTermBoundaryTimeRequired(self?.birthInfo) ? (
            // 절기 경계일 — see the same branch in today.tsx. Nothing is produced at all, so the generic
            // "일부 해석이 제한될 수 있어요" wording below would be misleading here.
            <BoundaryTimeNotice
              context="surface"
              onEditBirthInfo={() =>
                router.push({ pathname: '/birth-info', params: { subjectId: self?.id ?? '' } })
              }
            />
          ) : status === 'unavailable' ? (
            <Card radius="xl">
              <Stack gap="md">
                <Text variant="headingMedium">이번 달 운세를 준비하지 못했어요.</Text>
                <Text variant="bodyMedium" colorToken="textSecondary">
                  출생정보를 확인해 주세요. 시간을 알 수 없는 경우 일부 해석이 제한될 수 있어요.
                </Text>
                <Button label="MY로 이동" variant="secondary" onPress={() => router.replace('/my')} />
              </Stack>
            </Card>
          ) : (
            <Card radius="xl">
              <Stack gap="md">
                <Text variant="bodyMedium" colorToken="textSecondary">
                  이번 달 운세를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
                </Text>
                <Button label="다시 시도" onPress={() => void load()} />
              </Stack>
            </Card>
          )}
        </View>
      </ScrollView>
      <DetailBottomNav />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40, alignItems: 'center' },
  wrapper: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  center: { paddingTop: 80, alignItems: 'center' },
  sectionTitle: { fontWeight: '700' },
  hero: { borderLeftWidth: 4 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  pillRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  tonePill: { alignSelf: 'flex-start', borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  modePill: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  verdict: { fontWeight: '600', lineHeight: 24 },
  keyTitle: { fontWeight: '700', letterSpacing: 0.2 },
  signalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowDivider: { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)', paddingTop: 12, marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  flex1: { flex: 1 },
  chipWrap: { flexWrap: 'wrap' },
});
