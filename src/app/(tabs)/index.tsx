import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { InsightCard } from '@/components/InsightCard';
import { LineIcon, type LineIconName } from '@/components/LineIcon';
import { ListRow } from '@/components/ListRow';
import { PersonSelectorSheet } from '@/components/PersonSelectorSheet';
import { QuestionComposer } from '@/components/QuestionComposer';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import {
  conversationService,
  type ConversationSummaryItem,
} from '@/features/chat';
import {
  isSavedSubjectId,
  setPendingConsultationIntent,
  useConsultationDraft,
} from '@/features/consultation';
import { fortuneMailService, type FortuneMailItem } from '@/features/fortune';
import {
  clientTodayFortuneDateGuess,
  todayFortuneService,
  toneVariant,
  toTodayPreview,
  trackTodayEvent,
  type TodayPreview,
} from '@/features/today';
import {
  clientCurrentMonthGuess,
  monthlyFortuneService,
  monthlyToneVariant,
  toMonthlyPreview,
  trackMonthlyEvent,
  type MonthlyPreview,
} from '@/features/monthly';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/theme';

const TODAY_TONE_COLOR: Record<ReturnType<typeof toneVariant>, string> = {
  positive: '#1F8A54',
  neutral: '#5B6472',
  change: '#B26A00',
  caution: '#C0392B',
};
// 이번 달 운세 pills reuse the SAME restrained palette as Today (no new colors).
const MONTHLY_TONE_COLOR: Record<ReturnType<typeof monthlyToneVariant>, string> = TODAY_TONE_COLOR;

// 01_HOME — Personal AI Consultation Hub (Stitch v4). Greeting → question
// composer → popular questions → recent consultation → recent fortune mail. The
// popular-question list is a data array (server-replaceable). Recent items come
// from real services; fortune mail is empty until the engine ships (no mock).

// Server-replaceable list (not tightly coupled to UI). Later: fetch from server.
const POPULAR_QUESTIONS: { q: string; icon: LineIconName }[] = [
  { q: '올해 재물운의 흐름이 어떻게 될까?', icon: 'wallet' },
  { q: '이직을 준비하는데 언제가 좋을까?', icon: 'briefcase' },
  { q: '올해 나에게 올 가장 큰 변화는?', icon: 'swap' },
  { q: '새로운 인연을 만날 수 있을까?', icon: 'heart' },
  { q: '건강 측면에서 조심해야 할 것은?', icon: 'leaf' },
];
// V4 §13 breadth: whole-flow · diagnostic · timing · decision · relationship — demonstrates
// the range of questions, not a catalog of fortune products. Copy-only (server-replaceable).
const QUICK_PROMPTS: string[] = [
  '올해 전체 흐름이 궁금해',
  '요즘 일이 자꾸 꼬이는 이유가 있을까?',
  '이직하기 좋은 시기가 언제야?',
  '사업을 확장해도 될까?',
  '연애 흐름은 어때?',
];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return '늦은 밤이에요.';
  if (h < 12) return '좋은 아침이에요.';
  if (h < 18) return '좋은 오후예요.';
  return '편안한 저녁이에요.';
}

function formatWhen(iso: string | null): string {
  if (!iso) return '';
  const day = iso.slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);
  return day === today ? '오늘' : day;
}

function preview(summary: string | null): string | undefined {
  if (!summary) return undefined;
  const t = summary.trim();
  if (!t) return undefined;
  return t.length > 60 ? `${t.slice(0, 60)}…` : t;
}

export default function HomeScreen() {
  const router = useRouter();
  const { draft } = useConsultationDraft();
  const subject = draft.subject;
  const subjectId =
    subject && isSavedSubjectId(subject.id) ? subject.id : null;

  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  const [sheetVisible, setSheetVisible] = useState(false);
  // Distinguish opening the person sheet to START a consultation vs. to SWITCH the
  // active subject (header), so selecting a person only routes to chat in the former.
  const [sheetForConsult, setSheetForConsult] = useState(false);
  const [recent, setRecent] = useState<ConversationSummaryItem | null>(null);
  const [mail, setMail] = useState<FortuneMailItem | null>(null);
  // Time-of-day greeting must be deterministic on first render so the web static
  // export hydrates without a text mismatch (React #418). Resolve after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // 오늘의 운세 Home card (§31–§34): read the latest stored record for a lightweight preview. NO LLM is
  // fired on Home render — generation happens only when the user opens /today.
  const [todayPreview, setTodayPreview] = useState<TodayPreview | null>(null);
  const [todayIsToday, setTodayIsToday] = useState(false);
  useEffect(() => {
    trackTodayEvent('today_fortune_card_viewed');
    let active = true;
    todayFortuneService
      .loadLatest()
      .then((rec) => {
        if (!active || !rec) return;
        setTodayPreview(toTodayPreview(rec));
        setTodayIsToday(rec.fortuneDate === clientTodayFortuneDateGuess(Date.now()));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const openToday = () => {
    trackTodayEvent('today_fortune_opened');
    router.push('/today');
  };

  // 이번 달 운세 Home card (§48–§51): read the latest stored record for a lightweight preview. NO LLM is fired
  // on Home render — generation happens only when the user opens /monthly.
  const [monthlyPreview, setMonthlyPreview] = useState<MonthlyPreview | null>(null);
  const [monthlyIsCurrent, setMonthlyIsCurrent] = useState(false);
  useEffect(() => {
    trackMonthlyEvent('monthly_fortune_card_viewed');
    let active = true;
    monthlyFortuneService
      .loadLatest()
      .then((rec) => {
        if (!active || !rec) return;
        const guess = clientCurrentMonthGuess(Date.now());
        setMonthlyPreview(toMonthlyPreview(rec));
        setMonthlyIsCurrent(rec.year === guess.year && rec.month === guess.month);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const openMonthly = () => {
    trackMonthlyEvent('monthly_fortune_opened');
    router.push('/monthly');
  };

  useEffect(() => {
    let active = true;
    if (!subjectId) {
      setRecent(null);
      return;
    }
    conversationService
      .listConversationsForSubject(subjectId)
      .then((rows) => {
        if (active) setRecent(rows[0] ?? null);
      })
      .catch(() => {
        if (active) setRecent(null);
      });
    return () => {
      active = false;
    };
  }, [subjectId]);

  useEffect(() => {
    let active = true;
    fortuneMailService
      .listMail(subjectId)
      .then((rows) => {
        if (active) setMail(rows[0] ?? null);
      })
      .catch(() => {
        if (active) setMail(null);
      });
    return () => {
      active = false;
    };
  }, [subjectId]);

  // Start a (new) consultation with an optional prefilled question. UI never
  // calls the LLM — this only navigates into the chat screen.
  const startConsult = (question: string) => {
    // The question rides the EPHEMERAL store (never the URL — it is sensitive, §20) and
    // is consumed by chat. This covers both the has-subject and no-subject paths.
    if (question.trim().length > 0) {
      setPendingConsultationIntent({ question });
    }
    if (!subject) {
      setSheetForConsult(true);
      setSheetVisible(true);
      return;
    }
    router.push({ pathname: '/chat', params: { startNew: '1' } });
  };

  return (
    <Screen padded={false}>
      <AppHeader
        brand
        showSwitcher
        subjectLabel={subject?.displayName ?? '나'}
        onSwitcher={() => {
          setSheetForConsult(false);
          setSheetVisible(true);
        }}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wrapper}>
          <Stack gap="xl">
            <Text variant="displayMedium">
              {mounted ? greeting() : '안녕하세요.'}
              {'\n'}오늘은 무엇이 궁금하세요?
            </Text>

            <QuestionComposer onSubmit={startConsult} />

            <Stack direction="row" gap="sm" style={styles.chipWrap}>
              {QUICK_PROMPTS.map((q) => (
                <Chip
                  key={q}
                  label={q}
                  onPress={() => startConsult(q)}
                  style={styles.quickChip}
                />
              ))}
            </Stack>

            {/* 오늘의 운세 — daily retention entry (no LLM on Home; generation happens on /today).
                Composition (§34): a single CTA <Button> is the ONE interactive control; the card body
                is display-only. We deliberately do NOT wrap the <Card> in a <Pressable>, because the
                <Button> already renders a role="button" node — on web RN-Web renders both as real
                <button> elements, and a <button> nested inside a <button> is invalid DOM (a hydration
                error). One card = one button. */}
            <Stack gap="md">
              <Text variant="bodyLarge" style={styles.sectionTitle}>
                오늘의 운세
              </Text>
              <Card radius="xl">
                <Stack gap="sm">
                  {todayIsToday && todayPreview ? (
                    <>
                      <View style={styles.rowBetween}>
                        <View style={styles.todayPills}>
                          <View style={[styles.tonePill, { borderColor: TODAY_TONE_COLOR[todayPreview.toneVariant] }]}>
                            <Text variant="bodySmall" style={{ color: TODAY_TONE_COLOR[todayPreview.toneVariant], fontWeight: '700' }}>
                              {todayPreview.overallTone}
                            </Text>
                          </View>
                          {todayPreview.primaryModeLabel ? (
                            <View style={[styles.todayModePill, { borderColor: theme.border }]}>
                              <Text variant="bodySmall" colorToken="textSecondary" style={{ fontWeight: '600' }}>
                                {todayPreview.primaryModeLabel}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                        <Text variant="bodySmall" colorToken="textSecondary">
                          {todayPreview.dot}
                        </Text>
                      </View>
                      <Text variant="bodyLarge" style={{ fontWeight: '700' }} numberOfLines={2}>
                        {todayPreview.headline}
                      </Text>
                    </>
                  ) : (
                    <Text variant="bodyMedium" colorToken="textSecondary">
                      오늘 하루의 흐름을 확인해보세요. 사주로 오늘을 짚어드릴게요.
                    </Text>
                  )}
                  <Button
                    label="오늘 운세 보기"
                    onPress={openToday}
                    radius="lg"
                    accessibilityLabel="오늘의 운세 보기"
                  />
                </Stack>
              </Card>
            </Stack>

            {/* 이번 달 운세 — monthly retention entry (no LLM on Home; generation happens on /monthly).
                Same one-card-one-button composition as Today (no wrapping Pressable → no nested <button>). */}
            <Stack gap="md">
              <Text variant="bodyLarge" style={styles.sectionTitle}>
                이번 달 운세
              </Text>
              <Card radius="xl">
                <Stack gap="sm">
                  {monthlyIsCurrent && monthlyPreview ? (
                    <>
                      <View style={styles.rowBetween}>
                        <View style={styles.todayPills}>
                          <View style={[styles.tonePill, { borderColor: MONTHLY_TONE_COLOR[monthlyPreview.toneVariant] }]}>
                            <Text variant="bodySmall" style={{ color: MONTHLY_TONE_COLOR[monthlyPreview.toneVariant], fontWeight: '700' }}>
                              {monthlyPreview.overallTier}
                            </Text>
                          </View>
                          {monthlyPreview.primaryModeLabel ? (
                            <View style={[styles.todayModePill, { borderColor: theme.border }]}>
                              <Text variant="bodySmall" colorToken="textSecondary" style={{ fontWeight: '600' }}>
                                {monthlyPreview.primaryModeLabel}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                        <Text variant="bodySmall" colorToken="textSecondary">
                          {monthlyPreview.monthLabel}
                        </Text>
                      </View>
                      <Text variant="bodyLarge" style={{ fontWeight: '700' }} numberOfLines={2}>
                        {monthlyPreview.headline}
                      </Text>
                    </>
                  ) : (
                    <Text variant="bodyMedium" colorToken="textSecondary">
                      이번 달의 큰 흐름을 확인해보세요. 사주로 이번 달을 짚어드릴게요.
                    </Text>
                  )}
                  <Button
                    label="이번 달 운세 보기"
                    onPress={openMonthly}
                    radius="lg"
                    accessibilityLabel="이번 달 운세 보기"
                  />
                </Stack>
              </Card>
            </Stack>

            {/* 지금 많이 물어보는 질문 (server-replaceable list) */}
            <Stack gap="md">
              <Text variant="bodyLarge" style={styles.sectionTitle}>
                지금 많이 물어보는 질문
              </Text>
              <View>
                {POPULAR_QUESTIONS.map(({ q, icon }, i) => (
                  <View
                    key={q}
                    style={
                      i > 0
                        ? { borderTopWidth: 1, borderTopColor: theme.border }
                        : undefined
                    }
                  >
                    <ListRow
                      label={q}
                      leading={
                        <LineIcon name={icon} size={20} color={theme.textSecondary} />
                      }
                      onPress={() => startConsult(q)}
                    />
                  </View>
                ))}
              </View>
            </Stack>

            {/* 궁합 — discoverable entry to the pushed 궁합 flow (NOT a 5th nav tab). */}
            <Stack gap="md">
              <Text variant="bodyLarge" style={styles.sectionTitle}>
                궁합
              </Text>
              <Pressable
                onPress={() => router.push('/compatibility')}
                accessibilityRole="button"
                accessibilityLabel="궁합 보러 가기"
              >
                <Card radius="xl">
                  <Stack direction="row" gap="md" align="center">
                    <LineIcon name="heart" size={22} color={theme.secondary} />
                    <View style={styles.flex1}>
                      <Text variant="bodyLarge" style={{ fontWeight: '700' }}>
                        두 사람 궁합 보기
                      </Text>
                      <Text variant="bodySmall" colorToken="textSecondary">
                        본인과 상대방의 사주로 잘 맞는 점·조율할 점을 봐드려요.
                      </Text>
                    </View>
                    <Text variant="bodyLarge" style={styles.chevron}>
                      ›
                    </Text>
                  </Stack>
                </Card>
              </Pressable>
            </Stack>

            {/* 최근 상담 (real) */}
            <Stack gap="md">
              <Text variant="bodyLarge" style={styles.sectionTitle}>
                최근 상담
              </Text>
              {recent ? (
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/chat',
                      params: { conversationId: recent.id },
                    })
                  }
                  accessibilityRole="button"
                >
                  <Card radius="xl">
                    <Stack gap="sm">
                      <View style={styles.rowBetween}>
                        <Text
                          variant="bodyLarge"
                          style={styles.recentTitle}
                          numberOfLines={1}
                        >
                          {`${subject?.displayName ?? '나'}님 상담`}
                        </Text>
                        <Text variant="bodySmall" colorToken="textSecondary">
                          {formatWhen(recent.updatedAt)}
                        </Text>
                      </View>
                      <View style={styles.rowBetween}>
                        <Text
                          variant="bodyMedium"
                          colorToken="textSecondary"
                          numberOfLines={1}
                          style={styles.flex1}
                        >
                          {preview(recent.summary) ?? '상담을 이어가 보세요.'}
                        </Text>
                        <Text variant="bodyLarge" style={styles.chevron}>
                          ›
                        </Text>
                      </View>
                    </Stack>
                  </Card>
                </Pressable>
              ) : (
                <Card radius="xl">
                  <Text variant="bodyMedium" colorToken="textSecondary">
                    아직 상담 내역이 없어요. 위에서 궁금한 점을 물어보세요.
                  </Text>
                </Card>
              )}
            </Stack>

            {/* 최근 운세우편 (empty until fortune engine — no mock) */}
            <Stack gap="md">
              <Text variant="bodyLarge" style={styles.sectionTitle}>
                최근 운세우편
              </Text>
              {mail ? (
                <InsightCard
                  tag={{ label: mail.category, tone: mail.categoryTone }}
                  title={mail.title}
                  body={mail.preview}
                  ctaLabel="확인하기"
                  onCta={() => router.push('/inbox')}
                />
              ) : (
                <Card radius="xl">
                  <Stack gap="md">
                    <Text variant="bodyMedium" colorToken="textSecondary">
                      아직 도착한 운세우편이 없어요. 운세 엔진 연결 후 개인화된
                      운세가 이곳으로 도착합니다.
                    </Text>
                    <Button
                      label="운세우편함 열기"
                      variant="secondary"
                      radius="lg"
                      onPress={() => router.push('/inbox')}
                    />
                  </Stack>
                </Card>
              )}
            </Stack>
          </Stack>
        </View>
      </ScrollView>

      <PersonSelectorSheet
        visible={sheetVisible}
        startConsultationOnSelect={sheetForConsult}
        onClose={() => setSheetVisible(false)}
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
  chipWrap: {
    flexWrap: 'wrap',
  },
  quickChip: {
    flex: 1,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  recentTitle: {
    flex: 1,
    fontWeight: '700',
  },
  flex1: {
    flex: 1,
  },
  chevron: {
    color: '#C6C9D0',
    fontWeight: '600',
  },
  tonePill: {
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  todayPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  todayModePill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
});
