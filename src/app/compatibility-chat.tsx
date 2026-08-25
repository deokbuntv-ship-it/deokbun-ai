import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { AnswerBlock, isLongAnswer } from '@/components/AnswerBlock';
import { Card } from '@/components/Card';
import { DetailBottomNav } from '@/components/DetailBottomNav';
import { StateView } from '@/components/StateView';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { useConsumerLayout } from '@/hooks/useConsumerLayout';
import { useAuth } from '@/features/auth';
import { ChatInput, conversationService, createSingleFlight, supabaseEdgeConsultationAdapter, type ChatMessage } from '@/features/chat';
import { feedbackService } from '@/features/chat/services/feedbackService';
import { toConsultationPresentation } from '@/features/chat/presentation/consultationPresentationVM';
import { CONSULTATION_PROMPT_VERSION } from '@/features/chat/prompts/consultationPromptVersion';
import { reportService } from '@/features/chat/report/reportService';
import type { CompatibilityResultMeta } from '@/features/chat/server';
import type { FeedbackVerdict } from '@/features/intelligence';
import { useConsultationSubjects, type ConsultationSubjectRecord } from '@/features/consultation';
import { createCompatibilityConsultationService } from '@/features/compatibility/services/compatibilityConsultationService';
import { InsufficientDuk } from '@/components/InsufficientDuk';
import { SessionMeter } from '@/components/SessionMeter';
import { getCandleAvailability } from '@/features/duk/dukWalletService';
import { getSessionStatus, isSessionExhausted, type SessionStatus } from '@/features/duk/dukClientContract';
import { DUK_PRICES, dukLabel } from '@/features/duk/pricing';
import { mapConsumerError } from '@/features/errors/consumerErrorCopy';
import { AiDisclosure } from '@/components/AiDisclosure';
import { CompatibilityTierCard } from '@/features/compatibility/components/CompatibilityTierCard';
import { trackProductEvent } from '@/services/productEvents';
import { ConsultationLoading, StructuredConsultationResult } from '@/features/intelligence/components';
import type { StructuredConsultationViewModel } from '@/features/intelligence/types/consultationViewModel';
import { spacing } from '@/theme';

const INITIAL_QUESTION =
  '우리 궁합은 전반적으로 어때? 잘 맞는 점과 부딪히기 쉬운 점, 그리고 오래 잘 지내려면 무엇을 신경 쓰면 좋을지 편하게 알려줘.';

type CompatMessage = ChatMessage & {
  structuredResult?: StructuredConsultationViewModel;
  compatibility?: CompatibilityResultMeta;
};

function newId(role: string): string {
  return `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function CompatibilityChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ selfId?: string; targetId?: string; new?: string }>();
  const startNew = params.new === '1';
  const { isAuthenticated } = useAuth();
  // §J (Sprint F.1) — read LIVE auth, not a value captured once. The service's auth guard reads this ref, so a
  // login while the screen stays mounted is seen immediately (no stale AUTH_REQUIRED after logging in).
  const isAuthenticatedRef = useRef(isAuthenticated);
  isAuthenticatedRef.current = isAuthenticated;
  const { subjects, status } = useConsultationSubjects();
  const { hPad, maxWidth } = useConsumerLayout();
  // Candle eligibility decides the C07 primary action (light today's candle vs come back tomorrow).
  const [candleEligible, setCandleEligible] = useState(false);
  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    void getCandleAvailability(Math.floor(Date.now() / 1000))
      .then((a) => {
        if (active) setCandleEligible(a.canLight);
      })
      .catch(() => {});
    // Read the server's compatibility session so the remaining-question count is REAL from the first render.
    void getSessionStatus('compatibility')
      .then((s) => {
        if (active) setSession(s);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const self = useMemo(
    () => subjects.find((s) => s.id === params.selfId) ?? subjects.find((s) => s.isSelf) ?? null,
    [subjects, params.selfId],
  );
  const target = useMemo(
    () => subjects.find((s) => s.id === params.targetId) ?? null,
    [subjects, params.targetId],
  );

  const serviceRef = useRef(
    createCompatibilityConsultationService(supabaseEdgeConsultationAdapter, () => isAuthenticatedRef.current),
  );
  const [messages, setMessages] = useState<CompatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [tier, setTier] = useState<CompatibilityResultMeta | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  // Authoritative server balance snapshot for the INSUFFICIENT_DUK paywall card (Sprint J1 §10). Never client-computed.
  const [insufficientSnap, setInsufficientSnap] = useState<{ balance: number; required: number; shortfall: number } | null>(null);
  // §P0 — the SERVER's compatibility session, held raw. 12덕 buys ONE session of 5 successful questions; the
  // 6th question would open a NEW paid session (reserve_session_duk does not resume an exhausted session). The
  // UI must therefore show the REAL remaining count and require explicit consent before a new paid session —
  // it previously promised "이어서 물어봐도 덕은 더 들지 않아요" unconditionally and let the 6th question charge
  // 12덕 silently. Never counts sends locally; the count is the server's.
  const [session, setSession] = useState<SessionStatus | null>(null);
  const refreshCompatSession = async () => setSession(await getSessionStatus('compatibility'));
  // Exhausted = the SERVER's session hit its successful-turn limit AND is still within its TTL (shared helper —
  // an expired session is not exhausted; a new one would start anyway). Gates the composer so the NEXT question
  // cannot silently become a second 12덕 purchase.
  const compatExhausted = isSessionExhausted(session, Date.now());
  const [reportId, setReportId] = useState<string | null>(null);
  const [reportBusy, setReportBusy] = useState(false);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, FeedbackVerdict>>({});
  const hydratedRef = useRef(false);
  const resultViewedRef = useRef(false);
  const trackResultViewed = (overall?: string) => {
    if (resultViewedRef.current) return;
    resultViewedRef.current = true;
    void trackProductEvent('compatibility_result_viewed', {
      surface: 'compatibility_chat',
      consultationMode: 'compatibility',
      properties: { compatibility_tier: overall },
    });
  };
  const conversationIdRef = useRef<string | null>(null);
  // §K (Sprint F.1) — single-flight conversation creation. Two concurrent sends must never both observe
  // conversationIdRef.current === null and create two conversations; the in-flight promise is shared.
  const createConversationSingleFlight = useRef(createSingleFlight<string>());
  // Synchronous re-entrancy lock (the `sending` STATE updates a tick later) so a same-frame double-tap
  // cannot start two sends.
  const sendingRef = useRef(false);
  const persistedIdsRef = useRef<Set<string>>(new Set());
  const scrollRef = useRef<ScrollView>(null);

  // Create-or-restore the owned 궁합 conversation exactly once (single-flight). Auth precedes creation
  // (§B/§J): never INSERT for an unauthenticated caller. Returns the owned conversation id.
  const ensureCompatConversationId = (tierForCreate: CompatibilityResultMeta | null): Promise<string> => {
    if (conversationIdRef.current !== null) return Promise.resolve(conversationIdRef.current);
    if (!isAuthenticatedRef.current || !self || !target) {
      return Promise.reject(new Error('AUTH_OR_SUBJECT_REQUIRED'));
    }
    return createConversationSingleFlight.current(() =>
      conversationService
        .createConversation(
          target.id,
          {
            self: { id: self.id, displayName: self.displayName },
            target: { id: target.id, displayName: target.displayName, relationship: target.relationship },
          },
          { consultationMode: 'compatibility', compatibilityMeta: tierForCreate ?? undefined },
        )
        .then((id) => {
          conversationIdRef.current = id;
          return id;
        }),
    );
  };

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/compatibility');
  };

  // Best-effort persistence of a Q&A pair (§7). The 궁합 conversation is created LAZILY on the first
  // answer so it carries the deterministic tier (compatibility_meta) from creation. Idempotent + only
  // when authenticated; a failure never blocks the answer UX. subject_snapshot freezes the pair (§14).
  const persistPair = async (
    userMsg: CompatMessage,
    assistantMsg: CompatMessage,
    tierForCreate: CompatibilityResultMeta | null,
  ) => {
    if (!isAuthenticatedRef.current || !self || !target) return;
    try {
      // §K — single-flight; concurrent sends share one creation and can never double-create.
      const cid = await ensureCompatConversationId(tierForCreate);
      for (const m of [userMsg, assistantMsg]) {
        if (persistedIdsRef.current.has(m.id)) continue;
        persistedIdsRef.current.add(m.id);
        await conversationService.saveMessage(cid, {
          role: m.role,
          content: m.text,
          clientMessageId: m.id,
          ...(m.structuredResult ? { structuredResult: m.structuredResult } : {}),
        });
      }
    } catch {
      // fail-open: keep the in-memory conversation; a later message can retry conversation creation.
    }
  };

  const send = async (question: string) => {
    // §K — synchronous re-entrancy lock (before any await/state update) so a same-frame double-tap
    // cannot start two sends (the `sending` state updates a tick later).
    if (!self || !target || sending || sendingRef.current) return;
    const q = question.trim();
    if (q.length === 0) return;
    sendingRef.current = true;
    setErrorText(null);
    setInsufficientSnap(null);
    setInput('');
    const userMsg: CompatMessage = { id: newId('user'), role: 'user', text: q };
    const history = messages;
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);
    try {
      const result = await serviceRef.current.sendMessage({
        self: { id: self.id, birthInfo: self.birthInfo, label: self.displayName },
        target: { id: target.id, birthInfo: target.birthInfo, label: target.displayName, relationship: target.relationship },
        userMessage: q,
        messages: history,
        conversationMemory: { summary: null, lastSummarizedMessageId: null },
      });
      if (!result.success) {
        if (result.errorCode === 'INSUFFICIENT_DUK' && result.insufficientDuk) {
          // Actionable paywall instead of a generic failure (§10). Numbers are the server snapshot; the client
          // never grants — it only routes to where 덕 can be earned (candle) or topped up.
          setInsufficientSnap(result.insufficientDuk);
        } else {
          // Shared consumer error copy (§10) — distinct wording per code instead of one generic fallback, and
          // never a raw backend term.
          setErrorText(mapConsumerError(result.errorCode).message);
        }
        return;
      }
      if (result.compatibility) {
        setTier(result.compatibility);
        trackResultViewed(result.compatibility.overall);
      }
      const assistantMsg: CompatMessage = {
        id: newId('assistant'),
        role: 'assistant',
        text: result.responseText,
        ...(result.structuredResult ? { structuredResult: result.structuredResult } : {}),
        ...(result.compatibility ? { compatibility: result.compatibility } : {}),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      // Persist the Q&A pair (best-effort) so a refresh restores it with ZERO new LLM call (§9).
      void persistPair(userMsg, assistantMsg, result.compatibility ?? tier);
      // A successful turn changed the server's remaining-question count → re-read it (never decrement locally),
      // so the meter is accurate and the exhausted consent gate appears BEFORE a new paid session can start.
      void refreshCompatSession().catch(() => {});
    } finally {
      setSending(false);
      sendingRef.current = false;
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    }
  };

  // Load-first (§9/§54): once both people are ready, try to RESTORE the latest 궁합 conversation for
  // this pair (messages + tier) with NO LLM call. Only when there is none (or 새 궁합 상담) do we auto-send
  // the initial overview. This is what prevents a refresh from regenerating the whole answer.
  useEffect(() => {
    if (hydratedRef.current) return;
    if (status !== 'ready' || !self || !target) return;
    hydratedRef.current = true;
    let cancelled = false;

    if (!isAuthenticated || startNew) {
      // No persistence (logged-out) or an explicit new consultation → fresh in-memory + auto-send.
      if (startNew) void trackProductEvent('compatibility_new_conversation_started', { surface: 'compatibility_chat', consultationMode: 'compatibility' });
      void send(INITIAL_QUESTION);
      return;
    }

    (async () => {
      const loaded = await conversationService
        .loadLatestCompatibilityConversation(target.id)
        .catch(() => null);
      if (cancelled) return;
      if (loaded && loaded.messages.length > 0) {
        conversationIdRef.current = loaded.conversationId;
        loaded.messages.forEach((m) => persistedIdsRef.current.add(m.id));
        setMessages(loaded.messages as CompatMessage[]);
        const restoredTier = loaded.compatibilityMeta as CompatibilityResultMeta | null;
        if (restoredTier) setTier(restoredTier);
        void trackProductEvent('compatibility_conversation_resumed', { surface: 'compatibility_chat', consultationMode: 'compatibility' });
        trackResultViewed(restoredTier?.overall);
        // Restore 👍/👎 per message so a reload keeps feedback selected (§31).
        void feedbackService.loadFeedbackForConversation(loaded.conversationId).then((fm) => {
          if (!cancelled) setFeedbackMap(fm);
        });
      } else {
        void trackProductEvent('compatibility_started', { surface: 'compatibility_chat', consultationMode: 'compatibility' });
        void send(INITIAL_QUESTION);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, self, target, isAuthenticated, startNew]);

  // Deterministic 궁합 report (ZERO extra LLM): composed from the tier + the validated pair answers.
  const handleGenerateReport = async () => {
    if (!tier || reportBusy) return;
    const answers = messages
      .filter((m) => m.role === 'assistant' && m.structuredResult)
      .map((m) => toConsultationPresentation(m.structuredResult!));
    if (answers.length === 0) return;
    const questions = messages.filter((m) => m.role === 'user').map((m) => m.text);
    setReportBusy(true);
    try {
      const report = await reportService.createCompatibilityReport({
        selfLabel: tier.selfLabel,
        targetLabel: tier.targetLabel,
        overallLabel: tier.overallLabel,
        dimensions: tier.dimensions.map((d) => ({ title: d.title, verdict: d.verdict })),
        questions,
        answers,
        generatedAt: new Date().toISOString(),
      });
      if (report) {
        setReportId(report.id);
        void trackProductEvent('compatibility_report_created', {
          surface: 'compatibility_chat',
          consultationMode: 'compatibility',
          properties: { compatibility_tier: tier.overall },
        });
        router.push({ pathname: '/report/[id]', params: { id: report.id } });
      } else {
        setErrorText('보고서를 만들지 못했어요. 잠시 후 다시 시도해 주세요.');
      }
    } finally {
      setReportBusy(false);
    }
  };

  // Persist 👍/👎 for an assistant message (non-blocking; optimistic local update). One row per
  // (user, message) — a re-vote updates it (§30). No PII: only the message id + verdict + versions.
  const submitFeedback = async (messageId: string, verdict: FeedbackVerdict) => {
    setFeedbackMap((prev) => ({ ...prev, [messageId]: verdict }));
    void trackProductEvent(
      verdict === 'helpful' ? 'compatibility_feedback_positive' : 'compatibility_feedback_negative',
      { surface: 'compatibility_chat', consultationMode: 'compatibility', properties: { compatibility_tier: tier?.overall } },
    );
    await feedbackService.saveFeedback({
      conversationId: conversationIdRef.current,
      messageId,
      verdict,
      consultationMode: 'compatibility',
      policyVersion: CONSULTATION_PROMPT_VERSION,
      engineVersion: tier?.engineVersion ?? null,
    });
  };

  const renderMessage = (m: CompatMessage) => {
    if (m.role === 'user') {
      return (
        <View key={m.id} style={styles.userRow}>
          <View style={styles.userBubble}>
            <Text variant="bodyMedium" style={styles.userText}>
              {m.text}
            </Text>
          </View>
        </View>
      );
    }
    if (m.structuredResult) {
      return (
        <View key={m.id}>
          <StructuredConsultationResult
            vm={m.structuredResult}
            onSelectFollowUp={(q) => {
              void trackProductEvent('compatibility_followup_clicked', {
                surface: 'compatibility_chat',
                consultationMode: 'compatibility',
              });
              void send(q);
            }}
            onFeedback={(verdict) => void submitFeedback(m.id, verdict)}
            initialFeedback={feedbackMap[m.id] ?? null}
          />
        </View>
      );
    }
    // Fallback (no structured result): render the interpretation with the SAME reading system as solo chat —
    // a long answer becomes an AnswerBlock reading card (not a bubble/plain card), a short one a compact card.
    return (
      <View key={m.id}>
        {isLongAnswer(m.text) ? (
          <AnswerBlock source={m.text} showDisclosure={false} />
        ) : (
          <Card radius="xl">
            <Text variant="bodyLarge">{m.text}</Text>
          </Card>
        )}
      </View>
    );
  };

  const pairTitle = self && target ? `${self.displayName} × ${target.displayName}` : '궁합';

  return (
    <Screen padded={false} frame>
      <AppHeader title="궁합 상담" showBack onBack={handleBack} />
      <View style={styles.body}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.scroll, { paddingHorizontal: hPad }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.wrapper, { maxWidth }]}>
            <Stack gap="lg">
              {!tier ? (
                <Text variant="headingMedium">{pairTitle}</Text>
              ) : null}
              {status !== 'ready' ? (
                <StateView kind="loading" skeletonLines={5} />
              ) : !self || !target ? (
                <StateView
                  kind="empty"
                  emoji="👥"
                  title="대상 정보를 찾을 수 없어요"
                  description="궁합 탭에서 두 사람을 다시 선택해 주세요."
                  actionLabel="궁합으로 가기"
                  onAction={() => router.replace('/compatibility')}
                />
              ) : null}

              {tier ? <CompatibilityTierCard meta={tier} /> : null}
              {messages.map(renderMessage)}
              {sending ? <ConsultationLoading /> : null}
              {tier && !sending ? (
                <Button
                  label={reportId ? '궁합 보고서 보기' : reportBusy ? '보고서 만드는 중…' : '궁합 보고서 만들기'}
                  variant={reportId ? 'secondary' : 'primary'}
                  onPress={
                    reportId
                      ? () => router.push({ pathname: '/report/[id]', params: { id: reportId } })
                      : handleGenerateReport
                  }
                  disabled={reportBusy}
                />
              ) : null}
              {insufficientSnap ? (
                <InsufficientDuk
                  product="compatibility"
                  snapshot={insufficientSnap}
                  candleEligible={candleEligible}
                  onCandle={() => router.push('/wallet')}
                  onTopup={() => router.push('/duk-topup')}
                />
              ) : null}
              {errorText ? (
                <Card use="status" radius="xl">
                  <Stack gap="xs">
                    <Text variant="bodyMedium">{errorText}</Text>
                    <Text variant="bodySmall" colorToken="textSecondary">
                      이번 질문은 전달되지 않았어요. 질문 횟수는 그대로예요.
                    </Text>
                  </Stack>
                </Card>
              ) : null}
              {/* AI-generated-content disclosure (§2) — this is analysis/해석, not a certainty or guarantee. */}
              <AiDisclosure />
            </Stack>
          </View>
        </ScrollView>
        <View style={[styles.composer, { paddingHorizontal: hPad }]}>
          <View style={[styles.wrapper, { maxWidth }]}>
            {/* HONEST remaining-question line (§P0). Was a hardcoded "이어서 물어봐도 덕은 더 들지 않아요" with
                session={null} — an unconditional promise that became FALSE at the 5-turn limit, where the next
                question silently opened a NEW 12덕 session. Now the SERVER's real count drives it. */}
            {tier ? <SessionMeter session={session} style={styles.meter} /> : null}
            {compatExhausted ? (
              // Explicit CONSENT before another paid session — the same gate the 상담 flow already has. No new
              // session and no charge happen on render; only this tap navigates to start a new 궁합 상담, and the
              // server still charges once on the first successful answer of that new session.
              <Card use="status" radius="xl" style={styles.meter}>
                <Stack gap="sm">
                  <Text variant="bodyLarge">이번 궁합 상담의 질문을 모두 썼어요</Text>
                  <Text variant="bodySmall" colorToken="textSecondary">
                    {`이어서 더 물어보려면 새 궁합 상담을 시작해야 해요. 새로 시작하면 ${dukLabel(DUK_PRICES.compatibility)}이 들어요. 지금까지 내용은 기록에 남아 있어요.`}
                  </Text>
                  <Button
                    label={`새 궁합 상담 시작하기  🍀 ${dukLabel(DUK_PRICES.compatibility)}`}
                    radius="lg"
                    onPress={() => router.replace('/compatibility')}
                  />
                </Stack>
              </Card>
            ) : (
              <ChatInput
                value={input}
                onChangeText={setInput}
                onSend={() => void send(input)}
                disabled={sending || !self || !target}
              />
            )}
          </View>
        </View>
        {/* Consumer bottom nav (§5) — same DetailBottomNav as the primary tab bar; 궁합 active since this
            is part of the 궁합 flow. It owns the bottom safe-area, so the composer above never overlaps it. */}
        <DetailBottomNav active="compatibility" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1 },
  scroll: { flexGrow: 1, paddingTop: 12, paddingBottom: 24, alignItems: 'center' },
  wrapper: { width: '100%', alignSelf: 'center' },
  meter: { alignSelf: 'center', marginBottom: spacing.sm },
  userRow: { alignItems: 'flex-end' },
  userBubble: {
    maxWidth: '82%',
    backgroundColor: '#F3EADA',
    borderColor: '#E9DCC6',
    borderWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 16,
  },
  userText: { fontSize: 14.5, lineHeight: 23 },
  composer: { paddingTop: spacing.sm, paddingBottom: spacing.sm },
});
