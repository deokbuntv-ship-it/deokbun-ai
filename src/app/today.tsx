import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

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
import {
  todayFortuneService,
  toTodayDetailView,
  toneVariant,
  trackTodayEvent,
  type DailyFortuneRecord,
} from '@/features/today';
import { colors } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Status = 'loading' | 'ready' | 'unavailable' | 'error' | 'no-self' | 'auth';

// Tone/status colours now live in the shared FortuneReading (DESIGN_FREEZE tokens, no hardcoded hex).

// 오늘의 운세 상세 (§35–§40). A gated, pushed screen (auth + onboarding guaranteed by the gate). On open it
// load-or-creates today's canonical record (0 LLM on a cache hit); a ?date= param opens a PAST record
// read-only (never regenerates). Refresh = DB read. Consultation CTAs re-ground INDEPENDENTLY (they carry
// only a question, never the daily text as evidence, §43/§53).
export default function TodayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();
  const requestedDate = typeof params.date === 'string' ? params.date : null;
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  const { subjects, status: subjectsStatus } = useConsultationSubjects();
  const { updateSubject, updateBirthInfo } = useConsultationDraft();
  const self = subjects.find((s) => s.isSelf) ?? null;

  const [status, setStatus] = useState<Status>('loading');
  const [record, setRecord] = useState<DailyFortuneRecord | null>(null);
  const loadToken = useRef(0);

  const load = useCallback(async () => {
    const token = ++loadToken.current;
    setStatus('loading');

    // A specific past day → read-only load (never regenerate history, §47).
    if (requestedDate) {
      const r = await todayFortuneService.getByDate(requestedDate);
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

    const outcome = await todayFortuneService.ensureToday({ birthInput: self.birthInfo, subjectId: self.id });
    if (token !== loadToken.current) return;
    if (outcome.status === 'ok') {
      setRecord(outcome.record);
      setStatus('ready');
      trackTodayEvent(outcome.cacheHit ? 'today_fortune_cache_hit' : 'today_fortune_generated', {
        fortune_date: outcome.record.fortuneDate,
        cache_status: outcome.cacheHit ? 'hit' : 'miss',
        overall_tier: outcome.record.overallTone,
      });
    } else if (outcome.status === 'auth') {
      setStatus('auth');
    } else if (outcome.status === 'unavailable') {
      setStatus('unavailable');
    } else {
      setStatus('error');
    }
  }, [requestedDate, self, subjectsStatus]);

  useEffect(() => {
    trackTodayEvent('today_fortune_detail_opened', requestedDate ? { fortune_date: requestedDate } : {});
  }, [requestedDate]);

  useEffect(() => {
    void load();
  }, [load]);

  const askInConsultation = (question: string) => {
    // Route to 상담 about the USER (canonical SELF), carrying ONLY the question — the consultation server
    // recomputes its own grounding (the daily result is never sent as evidence).
    if (self) {
      updateSubject({ id: self.id, displayName: self.displayName, relationship: self.relationship });
      updateBirthInfo(self.birthInfo);
    }
    setPendingConsultationIntent({ question });
    trackTodayEvent('today_fortune_consultation_clicked', record ? { fortune_date: record.fortuneDate } : {});
    router.push({ pathname: '/chat', params: { startNew: '1' } });
  };

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  if (status === 'auth') return <Redirect href="/login" />;

  return (
    <Screen padded={false} frame>
      <AppHeader title="오늘의 운세" showBack showBell onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          {status === 'loading' ? (
            <View style={styles.center}>
              <ActivityIndicator color={theme.primary} />
              <Text variant="bodyMedium" colorToken="textSecondary" style={{ marginTop: 12 }}>
                오늘의 운세를 준비하고 있어요...
              </Text>
            </View>
          ) : status === 'ready' && record ? (
            (() => {
              const view = toTodayDetailView(record);
              return (
                <Stack gap="lg">
                  <FortuneReading
                    toneLabel={view.overallTone}
                    toneVariant={view.toneVariant}
                    modeLabel={view.primaryModeLabel}
                    meta={`${view.dot}${view.weekday ? ` ${view.weekday}` : ''}`}
                    leadLabel="오늘의 한마디"
                    headline={view.headline}
                    verdict={view.verdict}
                    signalsTitle="오늘의 핵심"
                    domainSignals={view.domainSignals}
                    highlightsTitle="오늘 좋은 흐름"
                    highlights={view.highlights}
                    cautionsTitle="오늘 조심할 것"
                    cautions={view.cautions}
                    actionsTitle="오늘 이렇게 해보세요"
                    actions={view.actionTip ? [view.actionTip] : []}
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
          ) : status === 'unavailable' ? (
            <Card radius="xl">
              <Stack gap="md">
                <Text variant="headingMedium">오늘의 운세를 준비하지 못했어요.</Text>
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
                  오늘의 운세를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
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
  // HERO: a single strong summary card with a tone-colored left accent (§33) — no heavy fill (§34).
  hero: { borderLeftWidth: 4 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  pillRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  tonePill: { alignSelf: 'flex-start', borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  modePill: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  verdict: { fontWeight: '600', lineHeight: 24 },
  keyTitle: { fontWeight: '700', letterSpacing: 0.2 },
  signalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowDivider: { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)', paddingTop: 12, marginTop: 2 },
  chipWrap: { flexWrap: 'wrap' },
});
