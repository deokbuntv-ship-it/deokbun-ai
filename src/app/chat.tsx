import {
    useLocalSearchParams,
    useRootNavigationState,
    useRouter,
} from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { PersonSelectorSheet } from '@/components/PersonSelectorSheet';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import {
    ChatBubble,
    ChatInput,
    createChatService,
    mapConsultationError,
    supabaseEdgeLLMAdapter,
    useConversationPersistence,
    type ChatMessage,
    type ConsultationErrorView,
} from '@/features/chat';
import {
    consumePendingQuestion,
    isSavedSubjectId,
    setPendingConsultationIntent,
    useConsultationDraft,
    type BirthInfoDraft,
    type ConsultationSubject,
} from '@/features/consultation';
import {
    ConsultationLoading,
    StructuredConsultationResult,
} from '@/features/intelligence/components';
import { computeAnswerAnchorOffset } from '@/features/chat/scrollAnchor';
import { spacing } from '@/theme';

const WELCOME_MESSAGE_TEXT =
  '안녕하세요. 덕분AI입니다. 😊\n\n출생정보 등록이 완료되었습니다.\n상담을 시작할 준비가 되었습니다.\n\n궁금한 점이나 고민이 있으시면 편하게 말씀해 주세요.';

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-message',
  role: 'assistant',
  text: WELCOME_MESSAGE_TEXT,
};

function createMessageId(role: ChatMessage['role']): string {
  return `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    startNew?: string;
    conversationId?: string;
  }>();

  const [sheetVisible, setSheetVisible] = useState(false);

  // Back navigation via real router history. Going back simply unmounts this
  // screen; the conversation is already persisted, so no state is destroyed and
  // no message is re-sent. Falls back to the 상담 tab when there is no history
  // (e.g. deep link / hard refresh).
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/consult');
    }
  };

  const conversationIdParam =
    typeof params.conversationId === 'string' && params.conversationId.length > 0
      ? params.conversationId
      : undefined;
  // Consume the one-shot "start new consultation" signal exactly once, at mount
  // time, via a ref. We do NOT mutate navigation (no setParams/replace) — doing
  // that during mount crashes ("navigate before mounting the Root Layout").
  const startNewRef = useRef(params.startNew === '1');
  const rootNavState = useRootNavigationState();
  const startNewClearedRef = useRef(false);
  const qSeededRef = useRef(false);

  const { draft, hydrationStatus: draftHydrationStatus, updateSubject, updateBirthInfo } =
    useConsultationDraft();
  const { isAuthenticated } = useAuth();

  // Subject identity for subject-aware conversation hydration (chat.tsx owns the
  // draft; the persistence hook does not import ConsultationDraftContext).
  const draftReady = draftHydrationStatus === 'ready';
  const subjectId =
    draftReady && draft.subject !== null && isSavedSubjectId(draft.subject.id)
      ? draft.subject.id
      : null;
  const subjectSnapshot =
    draft.subject !== null && draft.birthInfo !== null
      ? { subject: draft.subject, birthInfo: draft.birthInfo }
      : null;

  const {
    hydrationStatus: messagesHydrationStatus,
    restoredMessages,
    resetToken,
    conversationMemory,
    restoredSubjectSnapshot,
    persistMessage,
  } = useConversationPersistence({
    startNew: startNewRef.current,
    draftReady,
    subjectId,
    subjectSnapshot,
    conversationId: conversationIdParam,
  });

  // When a specific past conversation is opened by id, its stored subject
  // snapshot is authoritative. Self-correct the draft (once per conversation) so
  // direct/F5 entry never uses a mismatched in-memory subject.
  const correctedConversationRef = useRef<string | null>(null);
  useEffect(() => {
    if (conversationIdParam === undefined) {
      return;
    }
    if (correctedConversationRef.current === conversationIdParam) {
      return;
    }
    const snapshot = restoredSubjectSnapshot as {
      subject: ConsultationSubject | null;
      birthInfo: BirthInfoDraft | null;
    } | null;
    if (
      snapshot === null ||
      snapshot.subject === null ||
      snapshot.birthInfo === null
    ) {
      return;
    }
    correctedConversationRef.current = conversationIdParam;
    if (draft.subject?.id !== snapshot.subject.id) {
      updateSubject(snapshot.subject);
      updateBirthInfo(snapshot.birthInfo);
    }
  }, [
    conversationIdParam,
    restoredSubjectSnapshot,
    draft.subject?.id,
    updateSubject,
    updateBirthInfo,
  ]);

  const isDraftReady = draft.subject !== null && draft.birthInfo !== null;

  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  // Inline, actionable error (auth / recoverable / blocked) instead of a fake assistant
  // bubble. `lastAttemptRef` holds the failed question + its context so "다시 시도" can
  // re-send the SAME message without duplicating the user bubble or its persistence (§30/§37).
  const [sendError, setSendError] = useState<ConsultationErrorView | null>(null);
  const lastAttemptRef = useRef<{ text: string; context: ChatMessage[] } | null>(null);
  // Synchronous re-entrancy lock (the `isSending` STATE updates a tick later): a
  // same-frame double-tap cannot start two sends (§30/§e).
  const isSendingRef = useRef(false);

  const scrollViewRef = useRef<ScrollView>(null);

  // The auth-gate must read LIVE auth state. useRef captures its initial value only
  // once, so the chat service reads this ref, refreshed every render — otherwise a
  // login that happens while this screen stays mounted would not lift the gate.
  const isAuthenticatedRef = useRef(isAuthenticated);
  isAuthenticatedRef.current = isAuthenticated;

  const chatServiceRef = useRef(
    createChatService(supabaseEdgeLLMAdapter, () => isAuthenticatedRef.current),
  );

  // After the root navigation is actually ready (never during mount), drop the
  // one-shot startNew param exactly once so a later F5 restores the latest
  // conversation instead of starting new again. The conversation hook keeps
  // using the captured `startNewRef`, so clearing the URL neither cancels the
  // new-consultation processing nor re-triggers hydration.
  useEffect(() => {
    if (!rootNavState?.key || startNewClearedRef.current) {
      return;
    }
    startNewClearedRef.current = true;
    if (params.startNew !== undefined) {
      router.setParams({ startNew: undefined });
    }
  }, [rootNavState?.key, params.startNew, router]);

  // Seed the visible messages once conversation hydration settles: the fixed
  // welcome message first, then any restored history. Re-seeds on reset
  // (login / logout / user switch / start-new).
  useEffect(() => {
    if (messagesHydrationStatus !== 'ready') {
      return;
    }
    setMessages([WELCOME_MESSAGE, ...(restoredMessages ?? [])]);
    // Prefill the composer once from the question preserved across the person-sheet /
    // birth-info / login journey (§28) — NEVER auto-sent (§29). The question rides the
    // ephemeral store, not the URL (§20). Only for a FRESH consultation: opening an
    // existing conversation by id must not resurface a pending question.
    const q =
      !qSeededRef.current && conversationIdParam === undefined
        ? (consumePendingQuestion() ?? '')
        : '';
    if (!qSeededRef.current && q.length > 0) {
      qSeededRef.current = true;
      setInputText(q);
    } else {
      setInputText('');
    }
    setSendError(null);
    // Returning conversation → land on the latest message; a new consultation stays at the top
    // (§G). This is the ONLY auto-scroll-to-end — new answers anchor to their START instead.
    if ((restoredMessages?.length ?? 0) > 0) {
      scrollRestoredToEnd();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesHydrationStatus, resetToken, restoredMessages, conversationIdParam]);

  // One-shot anchor target: the id of the newest message whose START the viewport should
  // align to once it lays out (§G). Set on send (user's own message) and on a new answer.
  const pendingAnchorRef = useRef<string | null>(null);

  // Land a RETURNING conversation on its latest message (only when there is restored history).
  // A NEW consultation starts at the top (welcome). Called once per (re)seed. NOT tied to
  // onContentSizeChange, so a new answer never yanks the viewport to the bottom (§G).
  const scrollRestoredToEnd = () => {
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }),
    );
  };

  // Anchor the viewport near the START of a message, given its layout Y within the content
  // Stack (§G, FROZEN). Never scrollToEnd for an assistant answer.
  const anchorMessageToStart = (layoutY: number) => {
    scrollViewRef.current?.scrollTo({ y: computeAnswerAnchorOffset(layoutY), animated: true });
  };

  // Send `text` with the given prior-message context. Used by both the first send and
  // the retry, so a recoverable retry re-sends the SAME message WITHOUT adding a second
  // user bubble or re-persisting it (§30/§37). (It cannot double-PERSIST or duplicate the
  // bubble; true end-to-end idempotency against a succeeded-server-but-failed-client
  // response would need a request key — tracked as a follow-up.) Login-before-LLM is
  // unchanged — the service gates on auth and returns AUTH_REQUIRED before any adapter
  // call, and authGuard reads LIVE auth state so an expired session re-gates on retry (§57).
  const runSend = async (text: string, context: ChatMessage[]) => {
    setIsSending(true);
    try {
      const result = await chatServiceRef.current.sendMessage({
        userMessage: text,
        draft,
        messages: context,
        conversationMemory,
      });

      if (result.success) {
        const assistantMessage: ChatMessage = {
          id: createMessageId('assistant'),
          role: 'assistant',
          // Plain text today. When the backend attaches a structured result, it renders via
          // <StructuredConsultationResult>; the client never fabricates it (P0-1 / CODEX seam).
          text: result.responseText,
        };
        setMessages((currentMessages) => [...currentMessages, assistantMessage]);
        persistMessage(assistantMessage);
        setSendError(null);
        lastAttemptRef.current = null;
        // Anchor the viewport to the START of the new answer (§G) — NOT the bottom.
        pendingAnchorRef.current = assistantMessage.id;
      } else {
        const view = mapConsultationError(result.errorCode);
        if (result.errorCode === 'AUTH_REQUIRED') {
          // Preserve the question + resume route so login returns here, not Home (§9/§28).
          setPendingConsultationIntent({ question: text, returnTo: '/chat' });
        }
        setSendError(view);
        lastAttemptRef.current = view.canRetry ? { text, context } : null;
        // The error card is fixed above the composer (always visible) — no scroll needed.
      }
    } finally {
      setIsSending(false);
      isSendingRef.current = false;
    }
  };

  // Send `rawText` as a new user message. Shared by the composer and by follow-up chips (§7)
  // so both go through the exact same proven send path (auth gate, idempotent retry, persist).
  const submitQuestion = async (rawText: string) => {
    if (isSendingRef.current) {
      return;
    }

    const trimmed = rawText.trim();

    if (trimmed.length === 0) {
      return;
    }

    isSendingRef.current = true; // lock synchronously, before any state update/await
    const previousMessages = messages;

    const userMessage: ChatMessage = {
      id: createMessageId('user'),
      role: 'user',
      text: trimmed,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInputText('');
    setSendError(null);
    // Anchor to the user's own message start (question at top, loading below) (§G).
    pendingAnchorRef.current = userMessage.id;
    persistMessage(userMessage);

    await runSend(trimmed, previousMessages);
  };

  const handleSend = () => {
    void submitQuestion(inputText);
  };

  // Follow-up chip tap (§7). Reuses the send path; the free composer always stays available.
  // Wired for the V3 FollowUpSuggestions inside a structured result — only fires when the
  // backend has attached one (CODEX seam), so it is inert until then.
  const handleSelectFollowUp = (question: string) => {
    void submitQuestion(question);
  };

  // "다시 시도" for a recoverable failure — re-sends the same question with its original
  // context. No new user bubble / no re-persist, so retry can never duplicate a message
  // or double the token cost.
  const handleRetry = async () => {
    if (isSendingRef.current) {
      return;
    }
    const attempt = lastAttemptRef.current;
    if (attempt === null) {
      return;
    }
    isSendingRef.current = true; // lock synchronously (mirror handleSend)
    setSendError(null);
    await runSend(attempt.text, attempt.context);
  };

  const header = (
    <AppHeader
      centerTitle
      title="AI 상담"
      showBack
      onBack={handleBack}
      showSwitcher
      subjectLabel={draft.subject?.displayName ?? '나'}
      onSwitcher={() => setSheetVisible(true)}
    />
  );

  if (
    draftHydrationStatus !== 'ready' ||
    messagesHydrationStatus !== 'ready'
  ) {
    return (
      <Screen padded={false} frame>
        {header}
        <Stack style={{ flex: 1, paddingTop: 24 }} align="center">
          <Card>
            <Text variant="bodyMedium" colorToken="textSecondary">
              상담 정보를 불러오는 중입니다...
            </Text>
          </Card>
        </Stack>
      </Screen>
    );
  }

  if (!isDraftReady) {
    return (
      <Screen padded={false} frame>
        {header}
        <Stack style={{ flex: 1, paddingTop: 24 }} align="center">
          <Card>
            <Text variant="bodyMedium" colorToken="textSecondary">
              상담에 필요한 정보가 부족합니다.{'\n'}상담 탭에서 다시 시작해
              주세요.
            </Text>
          </Card>
        </Stack>
      </Screen>
    );
  }

  return (
    <Screen padded={false} frame>
      {header}
      <View style={styles.container}>
        <ScrollView ref={scrollViewRef} style={styles.messageScroll} contentContainerStyle={styles.messageScrollContent}>
          <View style={styles.contentWrapper}>
            <Stack gap="sm">
              {messages.map((message) => (
                <View
                  key={message.id}
                  onLayout={(e) => {
                    // When this is the pending anchor (newest user/assistant message), align the
                    // viewport to its START once it has laid out (§G, FROZEN) — never the bottom.
                    if (pendingAnchorRef.current === message.id) {
                      pendingAnchorRef.current = null;
                      anchorMessageToStart(e.nativeEvent.layout.y);
                    }
                  }}
                >
                  {message.role === 'assistant' && message.structuredResult ? (
                    // V4 fail-closed seam: render the structured result ONLY when the backend
                    // attached one. Never fabricated client-side (CODEX seam, P0-1).
                    <StructuredConsultationResult
                      vm={message.structuredResult}
                      onSelectFollowUp={handleSelectFollowUp}
                      onRetry={handleRetry}
                    />
                  ) : (
                    <ChatBubble message={message} />
                  )}
                </View>
              ))}
              {/* One honest analysis state — no fake engine stages (§H/§10). */}
              {isSending ? <ConsultationLoading /> : null}
            </Stack>
          </View>
        </ScrollView>

        <View style={[styles.inputArea, { paddingBottom: insets.bottom + spacing.sm }]}>
          <View style={styles.contentWrapper}>
            {sendError ? (
              <Card style={styles.errorCard}>
                <Stack gap="sm">
                  <Text variant="bodyMedium" colorToken="textSecondary">
                    {sendError.message}
                  </Text>
                  {sendError.kind === 'auth' && !isAuthenticated ? (
                    <Button label="로그인하기" onPress={() => router.push('/login')} />
                  ) : null}
                  {sendError.canRetry ? (
                    <Button
                      label="다시 시도"
                      variant="secondary"
                      onPress={handleRetry}
                      disabled={isSending}
                    />
                  ) : null}
                </Stack>
              </Card>
            ) : null}
            <ChatInput
              value={inputText}
              onChangeText={setInputText}
              onSend={handleSend}
              disabled={inputText.trim().length === 0 || isSending}
            />
          </View>
        </View>
      </View>

      <PersonSelectorSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageScroll: {
    flex: 1,
  },
  messageScrollContent: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  inputArea: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  errorCard: {
    marginBottom: spacing.sm,
  },
});
