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
  todayFortuneService,
  toTodayDetailView,
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
// Domain-status accents reuse the SAME restrained green/gray/red palette as the tones (no new colors, §34).
const STATUS_COLOR: Record<string, string> = { positive: '#1F8A54', neutral: '#5B6472', caution: '#C0392B' };

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
            (() => {
              const view = toTodayDetailView(record);
              return (
                <Stack gap="lg">
                  {/* HERO — the day, answered (§8/§28/§33). The strongest block: tone + mode, headline, verdict. */}
                  <Card radius="xl" style={[styles.hero, { borderColor: TONE_COLOR[view.toneVariant] }]}>
                    <Stack gap="sm">
                      <View style={styles.heroTop}>
                        <View style={styles.pillRow}>
                          <View style={[styles.tonePill, { borderColor: TONE_COLOR[view.toneVariant] }]}>
                            <Text variant="bodySmall" style={{ color: TONE_COLOR[view.toneVariant], fontWeight: '700' }}>
                              {view.overallTone}
                            </Text>
                          </View>
                          {view.primaryModeLabel ? (
                            <View style={[styles.modePill, { borderColor: theme.border }]}>
                              <Text variant="bodySmall" colorToken="textSecondary" style={{ fontWeight: '600' }}>
                                {view.primaryModeLabel}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                        <Text variant="bodySmall" colorToken="textSecondary">
                          {view.dot}{view.weekday ? ` ${view.weekday}` : ''}
                        </Text>
                      </View>
                      <Text variant="headingLarge">{view.headline}</Text>
                      <Text variant="bodyLarge" style={styles.verdict}>{view.verdict}</Text>
                    </Stack>
                  </Card>

                  {/* 오늘의 핵심 — deterministic domain statuses (only what the evidence robustly knows, §13). */}
                  {view.domainSignals.length > 0 ? (
                    <Card radius="lg">
                      <Stack gap="sm">
                        <Text variant="bodySmall" colorToken="textSecondary" style={styles.keyTitle}>오늘의 핵심</Text>
                        {view.domainSignals.map((s, i) => (
                          <View key={`s${i}`} style={styles.signalRow}>
                            <Text variant="bodyMedium" style={{ fontWeight: '600' }}>{s.label}</Text>
                            <Text variant="bodyMedium" style={{ color: STATUS_COLOR[s.variant], fontWeight: '700' }}>{s.status}</Text>
                          </View>
                        ))}
                      </Stack>
                    </Card>
                  ) : null}

                  {/* 오늘 좋은 흐름 — grouped rows in ONE card (§31: less fragmentation). */}
                  {view.highlights.length > 0 ? (
                    <Stack gap="sm">
                      <Text variant="bodyLarge" style={styles.sectionTitle}>오늘 좋은 흐름</Text>
                      <Card radius="lg">
                        <Stack gap="md">
                          {view.highlights.map((h, i) => (
                            <View key={`h${i}`} style={i > 0 ? styles.rowDivider : undefined}>
                              <Text variant="bodyMedium" style={{ fontWeight: '700' }}>
                                {h.domain ? `${h.domain} · ` : ''}{h.title}
                              </Text>
                              <Text variant="bodyMedium" colorToken="textSecondary">{h.body}</Text>
                            </View>
                          ))}
                        </Stack>
                      </Card>
                    </Stack>
                  ) : null}

                  {/* 오늘 조심할 것 */}
                  {view.cautions.length > 0 ? (
                    <Stack gap="sm">
                      <Text variant="bodyLarge" style={styles.sectionTitle}>오늘 조심할 것</Text>
                      <Card radius="lg">
                        <Stack gap="md">
                          {view.cautions.map((c, i) => (
                            <View key={`c${i}`} style={i > 0 ? styles.rowDivider : undefined}>
                              <Text variant="bodyMedium" style={{ fontWeight: '700' }}>{c.title}</Text>
                              <Text variant="bodyMedium" colorToken="textSecondary">{c.body}</Text>
                            </View>
                          ))}
                        </Stack>
                      </Card>
                    </Stack>
                  ) : null}

                  {/* 오늘 이렇게 해보세요 — one accented action card. */}
                  <Stack gap="sm">
                    <Text variant="bodyLarge" style={styles.sectionTitle}>오늘 이렇게 해보세요</Text>
                    <Card radius="lg" style={{ borderColor: theme.primary, borderWidth: 1 }}>
                      <Text variant="bodyMedium">{view.actionTip}</Text>
                    </Card>
                  </Stack>

                  {/* 이어서 물어보기 — SHORT chip labels; the RICH question is sent to 상담 (§37/§47). */}
                  {view.followUps.length > 0 ? (
                    <Stack gap="sm">
                      <Text variant="bodyLarge" style={styles.sectionTitle}>이어서 물어보기</Text>
                      <Stack direction="row" gap="sm" style={styles.chipWrap}>
                        {view.followUps.map((f) => (
                          <Chip key={f.question} label={f.displayLabel} onPress={() => askInConsultation(f.question)} />
                        ))}
                      </Stack>
                    </Stack>
                  ) : null}
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
