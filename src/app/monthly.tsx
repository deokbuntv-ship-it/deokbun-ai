import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

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

const TONE_COLOR: Record<ReturnType<typeof monthlyToneVariant>, string> = {
  positive: '#1F8A54',
  neutral: '#5B6472',
  change: '#B26A00',
  caution: '#C0392B',
};
const STATUS_COLOR: Record<string, string> = { positive: '#1F8A54', neutral: '#5B6472', caution: '#C0392B' };

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
      <AppHeader title="이번 달 운세" showBack onBack={handleBack} />
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
                  {/* HERO — the month, answered (§53). tone + mode, headline, verdict. */}
                  <Card radius="xl" style={[styles.hero, { borderColor: TONE_COLOR[view.toneVariant] }]}>
                    <Stack gap="sm">
                      <View style={styles.heroTop}>
                        <View style={styles.pillRow}>
                          <View style={[styles.tonePill, { borderColor: TONE_COLOR[view.toneVariant] }]}>
                            <Text variant="bodySmall" style={{ color: TONE_COLOR[view.toneVariant], fontWeight: '700' }}>
                              {view.overallTier}
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
                        <Text variant="bodySmall" colorToken="textSecondary">{view.monthLabel}</Text>
                      </View>
                      <Text variant="headingLarge">{view.headline}</Text>
                      <Text variant="bodyLarge" style={styles.verdict}>{view.verdict}</Text>
                    </Stack>
                  </Card>

                  {/* 이번 달 핵심 — deterministic domain statuses. */}
                  {view.domainSignals.length > 0 ? (
                    <Card radius="lg">
                      <Stack gap="sm">
                        <Text variant="bodySmall" colorToken="textSecondary" style={styles.keyTitle}>이번 달 핵심</Text>
                        {view.domainSignals.map((s, i) => (
                          <View key={`s${i}`} style={styles.signalRow}>
                            <Text variant="bodyMedium" style={{ fontWeight: '600' }}>{s.label}</Text>
                            <Text variant="bodyMedium" style={{ color: STATUS_COLOR[s.variant], fontWeight: '700' }}>{s.status}</Text>
                          </View>
                        ))}
                      </Stack>
                    </Card>
                  ) : null}

                  {/* 기회 — grouped rows in ONE card (§55). */}
                  {view.opportunities.length > 0 ? (
                    <Stack gap="sm">
                      <Text variant="bodyLarge" style={styles.sectionTitle}>이번 달 기회</Text>
                      <Card radius="lg">
                        <Stack gap="md">
                          {view.opportunities.map((h, i) => (
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

                  {/* 조심할 점 */}
                  {view.cautions.length > 0 ? (
                    <Stack gap="sm">
                      <Text variant="bodyLarge" style={styles.sectionTitle}>이번 달 조심할 점</Text>
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

                  {/* 이번 달 이렇게 보내보세요 — the action plan (§23). */}
                  {view.actions.length > 0 ? (
                    <Stack gap="sm">
                      <Text variant="bodyLarge" style={styles.sectionTitle}>이번 달 이렇게 보내보세요</Text>
                      <Card radius="lg" style={{ borderColor: theme.primary, borderWidth: 1 }}>
                        <Stack gap="sm">
                          {view.actions.map((a, i) => (
                            <View key={`a${i}`} style={styles.actionRow}>
                              <Text variant="bodyMedium" style={{ color: theme.primary, fontWeight: '700' }}>{i + 1}</Text>
                              <Text variant="bodyMedium" style={styles.flex1}>{a}</Text>
                            </View>
                          ))}
                        </Stack>
                      </Card>
                    </Stack>
                  ) : null}

                  {/* 이어서 물어보기 — SHORT chip labels; the RICH question is sent to 상담 (§65/§68). */}
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
