import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { DetailBottomNav } from '@/components/DetailBottomNav';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import { ChatInput, conversationService, supabaseEdgeConsultationAdapter, type ChatMessage } from '@/features/chat';
import { feedbackService } from '@/features/chat/services/feedbackService';
import { toConsultationPresentation } from '@/features/chat/presentation/consultationPresentationVM';
import { CONSULTATION_PROMPT_VERSION } from '@/features/chat/prompts/consultationPromptVersion';
import { reportService } from '@/features/chat/report/reportService';
import type { CompatibilityResultMeta } from '@/features/chat/server';
import type { FeedbackVerdict } from '@/features/intelligence';
import { useConsultationSubjects, type ConsultationSubjectRecord } from '@/features/consultation';
import { createCompatibilityConsultationService } from '@/features/compatibility/services/compatibilityConsultationService';
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
  const { subjects, status } = useConsultationSubjects();

  const self = useMemo(
    () => subjects.find((s) => s.id === params.selfId) ?? subjects.find((s) => s.isSelf) ?? null,
    [subjects, params.selfId],
  );
  const target = useMemo(
    () => subjects.find((s) => s.id === params.targetId) ?? null,
    [subjects, params.targetId],
  );

  const serviceRef = useRef(
    createCompatibilityConsultationService(supabaseEdgeConsultationAdapter, () => isAuthenticated),
  );
  const [messages, setMessages] = useState<CompatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [tier, setTier] = useState<CompatibilityResultMeta | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
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
  const persistedIdsRef = useRef<Set<string>>(new Set());
  const scrollRef = useRef<ScrollView>(null);

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
    if (!isAuthenticated || !self || !target) return;
    try {
      if (conversationIdRef.current === null) {
        conversationIdRef.current = await conversationService.createConversation(
          target.id,
          {
            self: { id: self.id, displayName: self.displayName },
            target: { id: target.id, displayName: target.displayName, relationship: target.relationship },
          },
          { consultationMode: 'compatibility', compatibilityMeta: tierForCreate ?? undefined },
        );
      }
      const cid = conversationIdRef.current;
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
    if (!self || !target || sending) return;
    const q = question.trim();
    if (q.length === 0) return;
    setErrorText(null);
    setInput('');
    const userMsg: CompatMessage = { id: newId('user'), role: 'user', text: q };
    const history = messages;
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);
    try {
      const result = await serviceRef.current.sendMessage({
        self: { birthInfo: self.birthInfo, label: self.displayName },
        target: { birthInfo: target.birthInfo, label: target.displayName, relationship: target.relationship },
        userMessage: q,
        messages: history,
        conversationMemory: { summary: null, lastSummarizedMessageId: null },
      });
      if (!result.success) {
        setErrorText(
          result.errorCode === 'AUTH_REQUIRED'
            ? '로그인이 필요합니다. 다시 로그인해 주세요.'
            : '답변을 가져오지 못했어요. 잠시 후 다시 시도해 주세요.',
        );
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
    } finally {
      setSending(false);
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
          <Card radius="lg" style={styles.userBubble}>
            <Text variant="bodyMedium" style={{ lineHeight: 22 }}>
              {m.text}
            </Text>
          </Card>
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
    return (
      <Card key={m.id} radius="xl">
        <Text variant="bodyMedium" style={{ lineHeight: 23 }}>
          {m.text}
        </Text>
      </Card>
    );
  };

  const pairTitle = self && target ? `${self.displayName} × ${target.displayName}` : '궁합';

  return (
    <Screen padded={false} frame>
      <AppHeader title="궁합 상담" showBack onBack={handleBack} />
      <View style={styles.body}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.wrapper}>
            <Stack gap="lg">
              <Text variant="headingMedium" style={{ fontWeight: '700' }}>
                {pairTitle}
              </Text>
              {status !== 'ready' ? (
                <Card>
                  <Text variant="bodyMedium" colorToken="textSecondary">
                    불러오는 중입니다...
                  </Text>
                </Card>
              ) : !self || !target ? (
                <Card>
                  <Text variant="bodyMedium" colorToken="textSecondary">
                    대상 정보를 찾을 수 없어요. 다시 선택해 주세요.
                  </Text>
                </Card>
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
              {errorText ? (
                <Card>
                  <Text variant="bodyMedium" colorToken="textSecondary">
                    {errorText}
                  </Text>
                </Card>
              ) : null}
            </Stack>
          </View>
        </ScrollView>
        <View style={styles.composer}>
          <View style={styles.wrapper}>
            <ChatInput
              value={input}
              onChangeText={setInput}
              onSend={() => void send(input)}
              disabled={sending || !self || !target}
            />
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
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24, alignItems: 'center' },
  wrapper: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  userRow: { alignItems: 'flex-end' },
  userBubble: { maxWidth: '86%', backgroundColor: undefined },
  composer: { paddingHorizontal: 20, paddingTop: spacing.sm, paddingBottom: spacing.sm },
});
