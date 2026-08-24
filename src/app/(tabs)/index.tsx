import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { CandleStrip } from '@/components/Candle';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { DukBalance } from '@/components/DukBalance';
import { LineIcon } from '@/components/LineIcon';
import { ListRow } from '@/components/ListRow';
import { PersonSelectorSheet } from '@/components/PersonSelectorSheet';
import { PriceConfirmSheet } from '@/components/PriceConfirmSheet';
import { QuestionComposer } from '@/components/QuestionComposer';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { StateView } from '@/components/StateView';
import { Text } from '@/components/Text';
import {
  conversationService,
  type ConversationSummaryItem,
} from '@/features/chat';
import {
  isSavedSubjectId,
  setPendingConsultationIntent,
  useConsultationDraft,
  useConsultationSubjects,
} from '@/features/consultation';
import { birthMonthDay, isBirthdayTodayKst, trackRetentionEvent } from '@/features/retention';
import { useAuth } from '@/features/auth';
import { useWallet } from '@/features/duk/useWallet';
import { walletStateOf } from '@/features/duk/consumerDukView';
import { getCandleAvailability } from '@/features/duk/dukWalletService';
import { CANDLE_DUK, DUK_PRICES, WELCOME_DUK, dukLabel } from '@/features/duk/pricing';
import { consumeWelcomePending } from '@/features/duk/welcomeSignal';
import {
  resolveActivePopularQuestions,
  trackPopularQuestionClick,
  trackPopularQuestionImpression,
  type PopularQuestion,
} from '@/features/popular-questions';
import { fortuneMailService, type FortuneMailItem } from '@/features/fortune';
import {
  clientTodayFortuneDateGuess,
  todayFortuneService,
  toTodayPreview,
  trackTodayEvent,
  type TodayPreview,
} from '@/features/today';
import {
  clientCurrentMonthGuess,
  monthlyFortuneService,
  toMonthlyPreview,
  trackMonthlyEvent,
  type MonthlyPreview,
} from '@/features/monthly';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useConsumerLayout } from '@/hooks/useConsumerLayout';
import { colors, radius, spacing } from '@/theme';

// D05 HOME — DESIGN_FREEZE_FINAL.
//
// The old Home stacked seven identical cards, so nothing had priority and 덕 was invisible. The
// frozen order answers, WITHOUT SCROLLING, the four questions a returning user actually opens the
// app with:
//   ① 오늘 한 줄  — the butter hero, the one colour plane and the only reason to open this daily
//   ② 🍀 잔액 · 🕯️ 오늘의 초  — what I have / how I get more
//   ③ 비용 안내 스트립 — what things cost, BEFORE I commit to anything
//   ④ 질문 입력 — the single primary CTA
// then 지금 많이 물어봐요 → 궁합 / 이번 달 → 새 운세 → 최근 상담.
//
// Data rules that did NOT change: no LLM is fired on render (previews are stored reads); popular
// questions come ONLY from the authoritative DB config and the section disappears if it is empty
// (never a curated fallback); impressions fire once per Home view after the list settles; the
// birthday card is deterministic from the canonical SELF birth date; the bell's unread count is the
// shared global state, not a per-screen fetch.

const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

function todayLine(name: string): string {
  const d = new Date();
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${WEEKDAY[d.getDay()]}요일 · ${name}님의 오늘`;
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
  const { hPad, maxWidth, roomyHero } = useConsumerLayout();

  // 덕 balance (Sprint J1 §3). Shared server-authoritative wallet. Home is behind the onboarding
  // gate, so this only renders for signed-in users; the balance is refreshed when the tab mounts.
  const { isAuthenticated } = useAuth();
  const wallet = useWallet();
  useEffect(() => {
    if (isAuthenticated) void wallet.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);
  const walletState = walletStateOf({
    signedOut: !isAuthenticated,
    error: wallet.error,
    totalSpendable: wallet.loading && !wallet.state ? undefined : wallet.state?.totalSpendable ?? (wallet.error ? null : 0),
  });
  const balance = wallet.state?.totalSpendable ?? 0;
  const displayWalletState = wallet.loading && !wallet.state ? 'loading' : walletState;

  // 🕯️ Home tile copy comes from the SERVER's candle eligibility — the tile itself never lights the
  // candle (that ritual lives in the wallet) and never invents a countdown.
  const [candleEligible, setCandleEligible] = useState<boolean | null>(null);
  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    void getCandleAvailability(Math.floor(Date.now() / 1000))
      .then((a) => {
        if (active) setCandleEligible(a.canLight);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  // One-shot post-onboarding welcome/economy card (§6/§7). Consumed once per fresh onboarding; never grants 덕.
  const [showWelcome, setShowWelcome] = useState(false);
  useEffect(() => {
    if (consumeWelcomePending()) setShowWelcome(true);
  }, []);

  const [sheetVisible, setSheetVisible] = useState(false);
  // Distinguish opening the person sheet to START a consultation vs. to SWITCH the
  // active subject (header), so selecting a person only routes to chat in the former.
  const [sheetForConsult, setSheetForConsult] = useState(false);
  const [recent, setRecent] = useState<ConversationSummaryItem | null>(null);
  const [mail, setMail] = useState<FortuneMailItem | null>(null);
  // Time-of-day / date must be deterministic on first render so the web static export hydrates
  // without a text mismatch (React #418). Resolve after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // 오늘의 운세 hero (§31–§34): read the latest stored record for a lightweight preview. NO LLM is
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

  // 이번 달 운세 (§48–§51): stored read only; generation happens on /monthly.
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

  // 지금 많이 물어봐요 — admin-managed, analytics-backed conversion surface. The DB is the SINGLE source of
  // truth: we start EMPTY and only render what active-question loading returns. On any failure (pre-migration /
  // unreachable) or 0 active rows the list stays empty and the section is omitted — we never substitute
  // curated/stale questions in production (that would show unauthorised config and fabricate impressions).
  // NO LLM, NO ranking.
  const [popularQuestions, setPopularQuestions] = useState<PopularQuestion[]>([]);
  const [popularLoaded, setPopularLoaded] = useState(false);
  const impressedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    let active = true;
    resolveActivePopularQuestions(5)
      .then((qs) => {
        if (!active) return;
        setPopularQuestions(qs);
        setPopularLoaded(true);
      })
      .catch(() => {
        if (active) setPopularLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  // One impression per question per Home view (deduped — NOT per render), fired once the list has SETTLED so
  // impressions attribute to what is actually shown (§ funnel). impressedRef resets on unmount → next Home
  // visit is a fresh view boundary.
  useEffect(() => {
    if (!popularLoaded) return;
    popularQuestions.forEach((q, i) => {
      if (impressedRef.current.has(q.analyticsKey)) return;
      impressedRef.current.add(q.analyticsKey);
      trackPopularQuestionImpression({
        questionKey: q.analyticsKey,
        category: q.category,
        placement: 'home',
        position: i + 1,
      });
    });
  }, [popularLoaded, popularQuestions]);

  // 생일 축하 (retention §7.2/§16.3) — deterministic from the canonical SELF birth date (0 LLM), shown only on
  // the actual birthday in Korea time. Never permanently occupies Home.
  const { subjects: allSubjects } = useConsultationSubjects();
  const selfSubject = allSubjects.find((s) => s.isSelf) ?? null;
  const selfBirthMd = selfSubject ? birthMonthDay(selfSubject.birthInfo) : null;
  const isBirthday = selfBirthMd ? isBirthdayTodayKst(selfBirthMd, Date.now()) : false;

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

  // ── Consultation entry ─────────────────────────────────────────────────────
  // The cost sheet (C06) now sits between "I typed a question" and "I am in a paid consultation", so
  // 보유/필요/남는 덕 are visible BEFORE the first charged turn. The question itself still rides the
  // EPHEMERAL store (never the URL — it is sensitive, §20) and is consumed by chat; the UI still
  // never calls the LLM and still never charges anything.
  const [pendingQuestion, setPendingQuestion] = useState<string>('');
  const [pendingOrigin, setPendingOrigin] = useState<{ key: string; category: string } | null>(null);
  const [priceSheetVisible, setPriceSheetVisible] = useState(false);

  const askQuestion = (question: string, origin?: { key: string; category: string }) => {
    setPendingQuestion(question);
    setPendingOrigin(origin ?? null);
    setPriceSheetVisible(true);
  };

  const confirmConsult = useCallback(() => {
    setPriceSheetVisible(false);
    if (pendingQuestion.trim().length > 0) {
      setPendingConsultationIntent({
        question: pendingQuestion,
        ...(pendingOrigin
          ? { originQuestionKey: pendingOrigin.key, originQuestionCategory: pendingOrigin.category }
          : {}),
      });
    }
    if (!subject) {
      setSheetForConsult(true);
      setSheetVisible(true);
      return;
    }
    router.push({ pathname: '/chat', params: { startNew: '1' } });
  }, [pendingQuestion, pendingOrigin, subject, router]);

  // A tap on a popular question: record the click (one tap = one click) then open the cost sheet
  // carrying the stable origin so chat can attribute consultation_start / first_answer_success
  // without text-matching.
  const onPopularPress = (q: PopularQuestion, position: number) => {
    trackPopularQuestionClick({
      questionKey: q.analyticsKey,
      category: q.category,
      placement: 'home',
      position,
    });
    askQuestion(q.questionText, { key: q.analyticsKey, category: q.category });
  };

  const subjectName = subject?.displayName ?? '나';

  return (
    <Screen padded={false}>
      <AppHeader
        brand
        showSwitcher
        subjectLabel={subjectName}
        onSwitcher={() => {
          setSheetForConsult(false);
          setSheetVisible(true);
        }}
        showBell
      />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: hPad }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.wrapper, { maxWidth }]}>
          <Stack gap="xl">
            {/* ① 오늘 — the ONE colour plane on this screen. Full-bleed butter, so it reads as the
                day's headline rather than one more card in a stack. */}
            <Pressable
              onPress={openToday}
              accessibilityRole="button"
              accessibilityLabel="오늘의 운세 보기"
              style={({ pressed }) => [
                styles.hero,
                {
                  backgroundColor: pressed ? theme.backgroundSelected : theme.surfaceButter,
                  marginHorizontal: -hPad,
                  paddingHorizontal: hPad,
                },
              ]}
            >
              <Stack gap="sm">
                <Text variant="bodySmall" style={{ color: theme.onButter, fontWeight: '600' }} numberOfLines={1}>
                  {mounted ? todayLine(subjectName) : ' '}
                </Text>
                <Text
                  variant={roomyHero ? 'displayLarge' : 'displayMedium'}
                  style={{ color: theme.onButter }}
                  numberOfLines={3}
                >
                  {todayIsToday && todayPreview ? todayPreview.headline : '오늘의 흐름을\n확인해 보세요'}
                </Text>
                {todayIsToday && todayPreview ? (
                  <View style={styles.heroChips}>
                    <Chip label={todayPreview.overallTone} tone="sage" />
                    {todayPreview.primaryModeLabel ? (
                      <Chip label={todayPreview.primaryModeLabel} tone="sky" />
                    ) : null}
                  </View>
                ) : null}
                {/* Text CTA, not a button: the freeze bans generic "자세히 / 더보기" and bans making a
                    text link look like a filled control. The destination is in the words. */}
                <Text variant="bodySmall" style={[styles.heroCta, { color: theme.onButter }]}>
                  오늘의 운세 보기 〉
                </Text>
              </Stack>
            </Pressable>

            {/* ② 🍀 덕 · 🕯️ 오늘의 초 — 2-up. Both tiles flex, so a wider screen widens the tiles
                instead of stranding them at a fixed width. */}
            {isAuthenticated ? (
              <View style={styles.twoUp}>
                <DukBalance
                  variant="card"
                  state={displayWalletState}
                  total={balance}
                  onPress={() => router.push('/wallet')}
                  onTopup={() => router.push('/duk-topup')}
                  style={styles.tile}
                />
                <CandleStrip
                  lit={candleEligible === false}
                  hint={
                    candleEligible === null
                      ? '상태를 확인하는 중이에요'
                      : candleEligible
                        ? `밝히면 +${dukLabel(CANDLE_DUK)}`
                        : '내일 다시 밝힐 수 있어요'
                  }
                  onPress={() => router.push('/wallet')}
                />
              </View>
            ) : null}

            {/* ③ 비용 안내 — answers "얼마지?" before any commitment, and doubles as the 덕 explainer
                entry point. */}
            <Pressable
              onPress={() => router.push('/wallet')}
              accessibilityRole="button"
              accessibilityLabel="덕이란? 덕 지갑 열기"
              style={({ pressed }) => [
                styles.costStrip,
                { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElevated },
              ]}
            >
              <Text variant="bodySmall" colorToken="textSecondary" numeric style={styles.flex1} numberOfLines={1}>
                {`💬 상담 ${dukLabel(DUK_PRICES.general)} · 💕 궁합 ${dukLabel(DUK_PRICES.compatibility)}`}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.textPrimary, fontWeight: '700' }}>
                덕이란?
              </Text>
              <LineIcon name="chevron-right" size={16} color={theme.textSecondary} />
            </Pressable>

            {/* 가입 축하 + 덕 사용법 (§6/§7) — one-shot, dismissible, shown once right after onboarding.
                Explains the economy without a tutorial; the 10덕 itself was granted server-side on
                consent, not here. */}
            {showWelcome ? (
              <Card use="reward" tone="sage" radius="xl">
                <Stack gap="sm">
                  <Text variant="bodyLarge" style={{ color: theme.onSage, fontWeight: '700' }}>
                    가입을 축하해요 🎉
                  </Text>
                  <Text variant="bodyMedium" style={{ color: theme.onSage }}>
                    시작 선물로 {dukLabel(WELCOME_DUK)}을 드렸어요. 덕으로 상담과 궁합을 이용할 수 있어요.
                  </Text>
                  <Button label="덕 보러 가기" radius="lg" onPress={() => { setShowWelcome(false); router.push('/wallet'); }} />
                  <Pressable onPress={() => setShowWelcome(false)} accessibilityRole="button" style={styles.welcomeDismiss}>
                    <Text variant="bodySmall" style={{ color: theme.onSage }}>닫기</Text>
                  </Pressable>
                </Stack>
              </Card>
            ) : null}

            {/* 생일 축하 — deterministic, birthday-only, 0 LLM. The birthday 덕 is granted server-side
                (async job); we INVITE the user to confirm it in the wallet rather than asserting a
                balance here (§29 honest, no fake number). */}
            {isBirthday ? (
              <Card use="reward" tone="butter" radius="xl">
                <Stack gap="sm">
                  <Text variant="bodyLarge" style={{ color: theme.onButter, fontWeight: '700' }}>
                    생일을 축하드려요 🎂
                  </Text>
                  <Text variant="bodyMedium" style={{ color: theme.onButter }}>
                    오늘은 특별한 날이에요. 생일 선물 덕을 준비했어요 — 지갑에서 확인해보세요.
                  </Text>
                  <Button
                    label="덕 확인하기"
                    radius="lg"
                    onPress={() => { trackRetentionEvent('birthday_message_opened'); router.push('/wallet'); }}
                  />
                </Stack>
              </Card>
            ) : null}

            {/* ④ 질문 입력 — the single Primary CTA on Home. */}
            <QuestionComposer costLabel={dukLabel(DUK_PRICES.general)} onSubmit={(q) => askQuestion(q)} />

            {/* ⑤ 지금 많이 물어봐요 — admin-managed conversion surface. Each row is a one-tap
                consultation entry carrying a stable analytics key through the funnel. Hidden entirely
                if the owner deactivated every question (respects owner intent — no empty title). */}
            {popularQuestions.length > 0 ? (
              <Stack gap="sm">
                <Text variant="headingMedium">지금 많이 물어봐요</Text>
                <View>
                  {popularQuestions.map((q, i) => (
                    <View
                      key={q.analyticsKey}
                      style={i > 0 ? { borderTopWidth: 1, borderTopColor: theme.lineHairline } : undefined}
                    >
                      <ListRow label={q.questionText} onPress={() => onPopularPress(q, i + 1)} />
                    </View>
                  ))}
                </View>
              </Stack>
            ) : null}

            {/* ⑥ 궁합 · 이번 달 — 2-up interactive tiles. */}
            <View style={styles.twoUp}>
              <Pressable
                onPress={() => router.push('/compatibility')}
                accessibilityRole="button"
                accessibilityLabel="궁합 보러 가기"
                style={({ pressed }) => [
                  styles.tile,
                  styles.miniTile,
                  { backgroundColor: pressed ? theme.backgroundSelected : theme.surfaceBlush },
                ]}
              >
                <Text style={styles.tileEmoji}>💕</Text>
                <Text variant="bodySmall" style={{ color: theme.onBlush, fontWeight: '700' }} numberOfLines={1}>
                  궁합 보기
                </Text>
                <Text variant="caption" numeric style={{ color: theme.onBlush }} numberOfLines={1}>
                  🍀 {dukLabel(DUK_PRICES.compatibility)}
                </Text>
              </Pressable>
              <Pressable
                onPress={openMonthly}
                accessibilityRole="button"
                accessibilityLabel="이번 달 흐름 보러 가기"
                style={({ pressed }) => [
                  styles.tile,
                  styles.miniTile,
                  { backgroundColor: pressed ? theme.backgroundSelected : theme.surfaceSky },
                ]}
              >
                <Text style={styles.tileEmoji}>🌼</Text>
                <Text variant="bodySmall" style={{ color: theme.textPrimary, fontWeight: '700' }} numberOfLines={1}>
                  이번 달 흐름
                </Text>
                <Text variant="caption" colorToken="textSecondary" numberOfLines={1}>
                  {monthlyIsCurrent && monthlyPreview ? monthlyPreview.monthLabel : '흐름 확인하기'}
                </Text>
              </Pressable>
            </View>

            {/* ⑦ 새 운세 — one row, not a card stack. Empty until the fortune engine ships (no mock). */}
            <Stack gap="sm">
              <Text variant="headingMedium">운세우편함</Text>
              {mail ? (
                <ListRow
                  label={mail.title}
                  sublabel={mail.preview}
                  leading={<Text style={styles.rowEmoji}>💌</Text>}
                  onPress={() => router.push('/inbox')}
                />
              ) : (
                <StateView
                  kind="empty"
                  emoji="💌"
                  title="아직 도착한 운세가 없어요"
                  description="새 운세와 리포트가 도착하면 여기에 모아둘게요."
                  actionLabel="운세우편함 열기"
                  onAction={() => router.push('/inbox')}
                />
              )}
            </Stack>

            {/* ⑧ 최근 상담 (real). */}
            {recent ? (
              <Stack gap="sm">
                <Text variant="headingMedium">최근 상담</Text>
                <Card radius="xl">
                  <Pressable
                    onPress={() => router.push({ pathname: '/chat', params: { conversationId: recent.id } })}
                    accessibilityRole="button"
                    accessibilityLabel="최근 상담 이어보기"
                  >
                    <Stack gap="sm">
                      <View style={styles.rowBetween}>
                        <Text variant="bodyLarge" style={styles.recentTitle} numberOfLines={1}>
                          {`${subjectName}님 상담`}
                        </Text>
                        <Text variant="bodySmall" colorToken="textMuted">
                          {formatWhen(recent.updatedAt)}
                        </Text>
                      </View>
                      <Text variant="bodyMedium" colorToken="textSecondary" numberOfLines={2}>
                        {preview(recent.summary) ?? '상담을 이어가 보세요.'}
                      </Text>
                    </Stack>
                  </Pressable>
                </Card>
              </Stack>
            ) : null}
          </Stack>
        </View>
      </ScrollView>

      <PriceConfirmSheet
        visible={priceSheetVisible}
        onClose={() => setPriceSheetVisible(false)}
        productLabel="상담"
        required={DUK_PRICES.general}
        walletState={displayWalletState}
        balance={balance}
        subjectName={subjectName}
        subjectRelationship={subject?.relationship ?? null}
        onChangeSubject={() => {
          setPriceSheetVisible(false);
          setSheetForConsult(false);
          setSheetVisible(true);
        }}
        onConfirm={confirmConsult}
      />

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
    paddingTop: spacing.xs,
    paddingBottom: 40,
    alignItems: 'center',
  },
  wrapper: {
    width: '100%',
    alignSelf: 'center',
  },
  hero: {
    paddingVertical: spacing.xl,
  },
  heroChips: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  heroCta: {
    fontSize: 13.5,
    fontWeight: '700',
    textDecorationLine: 'underline',
    marginTop: spacing.xs,
  },
  twoUp: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'stretch',
  },
  tile: {
    flex: 1,
    minWidth: 0,
  },
  miniTile: {
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: 2,
    minHeight: 92,
    justifyContent: 'center',
  },
  tileEmoji: { fontSize: 22, lineHeight: 28 },
  rowEmoji: { fontSize: 22, lineHeight: 28 },
  costStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
  },
  welcomeDismiss: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  recentTitle: {
    flex: 1,
    fontWeight: '700',
  },
  flex1: {
    flex: 1,
  },
});
