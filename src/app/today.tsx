import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { DetailBottomNav } from '@/components/DetailBottomNav';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import { setPendingConsultationIntent, useConsultationDraft, useConsultationSubjects } from '@/features/consultation';
import {
  clientTodayFortuneDateGuess,
  formatFortuneDateLabel,
  todayFortuneService,
  toneVariant,
  trackTodayEvent,
  type DailyFortuneRecord,
} from '@/features/today';
import { colors } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Status = 'loading' | 'ready' | 'unavailable' | 'error' | 'no-self' | 'auth';

const TONE_COLOR: Record<ReturnType<typeof toneVariant>, string> = {
  positive: '#1F8A54',
  neutral: '#5B6472',
  change: '#B26A00',
  caution: '#C0392B',
};

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

  const label = record ? formatFortuneDateLabel(record.fortuneDate) : formatFortuneDateLabel(requestedDate ?? clientTodayFortuneDateGuess(Date.now()));

  return (
    <Screen padded={false} frame>
      <AppHeader title="오늘의 운세" showBack onBack={handleBack} />
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
            <Stack gap="xl">
              <Stack gap="xs">
                <Text variant="bodySmall" colorToken="textSecondary">
                  {label.dot} {label.weekday ? `${label.weekday}요일` : ''}
                </Text>
                <View style={[styles.tonePill, { borderColor: TONE_COLOR[toneVariant(record.overallTone)] }]}>
                  <Text variant="bodySmall" style={{ color: TONE_COLOR[toneVariant(record.overallTone)], fontWeight: '700' }}>
                    {record.overallTone}
                  </Text>
                </View>
                <Text variant="headingLarge">{record.result.headline}</Text>
                <Text variant="bodyMedium" colorToken="textSecondary">
                  {record.result.overallSummary}
                </Text>
              </Stack>

              {record.result.highlights.length > 0 ? (
                <Stack gap="sm">
                  <Text variant="bodyLarge" style={styles.sectionTitle}>오늘 좋은 흐름</Text>
                  {record.result.highlights.map((h, i) => (
                    <Card key={`h${i}`} radius="lg">
                      <Stack gap="xs">
                        <Text variant="bodyMedium" style={{ fontWeight: '700' }}>
                          {h.domain ? `${h.domain} · ` : ''}{h.title}
                        </Text>
                        <Text variant="bodyMedium" colorToken="textSecondary">{h.body}</Text>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              ) : null}

              {record.result.cautions.length > 0 ? (
                <Stack gap="sm">
                  <Text variant="bodyLarge" style={styles.sectionTitle}>오늘 조심할 것</Text>
                  {record.result.cautions.map((c, i) => (
                    <Card key={`c${i}`} radius="lg">
                      <Stack gap="xs">
                        <Text variant="bodyMedium" style={{ fontWeight: '700' }}>{c.title}</Text>
                        <Text variant="bodyMedium" colorToken="textSecondary">{c.body}</Text>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              ) : null}

              <Stack gap="sm">
                <Text variant="bodyLarge" style={styles.sectionTitle}>오늘 이렇게 해보세요</Text>
                <Card radius="lg" style={{ borderColor: theme.primary, borderWidth: 1 }}>
                  <Text variant="bodyMedium">{record.result.actionTip}</Text>
                </Card>
              </Stack>

              {record.result.consultationPrompts.length > 0 ? (
                <Stack gap="sm">
                  <Text variant="bodyLarge" style={styles.sectionTitle}>더 자세히 물어보기</Text>
                  <Stack direction="row" gap="sm" style={styles.chipWrap}>
                    {record.result.consultationPrompts.map((q) => (
                      <Chip key={q} label={q} onPress={() => askInConsultation(q)} />
                    ))}
                  </Stack>
                </Stack>
              ) : null}
            </Stack>
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
  tonePill: { alignSelf: 'flex-start', borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  chipWrap: { flexWrap: 'wrap' },
});
