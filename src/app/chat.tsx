import {
    useFocusEffect,
    useLocalSearchParams,
    useRootNavigationState,
    useRouter,
} from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AiDisclosure } from '@/components/AiDisclosure';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { InsufficientDuk } from '@/components/InsufficientDuk';
import { SessionMeter } from '@/components/SessionMeter';
import { StateView } from '@/components/StateView';
import { PersonSelectorSheet } from '@/components/PersonSelectorSheet';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useConsumerLayout } from '@/hooks/useConsumerLayout';
import { useAuth } from '@/features/auth';
import {
    ChatBubble,
    ChatInput,
    createServerConsultationService,
    executeConversationBoundSend,
    isConversationAuthRequiredError,
    mapConsultationError,
    supabaseEdgeConsultationAdapter,
    useConversationPersistence,
    type ChatMessage,
    type ConsultationErrorView,
} from '@/features/chat';
import { getCandleAvailability } from '@/features/duk/dukWalletService';
import { isBalanceShort } from '@/features/duk/consumerDukView';
import { DUK_PRICES, dukLabel } from '@/features/duk/pricing';
import { getSessionStatus, isSessionExhausted, type SessionStatus } from '@/features/duk/dukClientContract';
import { refreshWallet, useWallet } from '@/features/duk/useWallet';
import {
    consumePendingQuestion,
    consumePendingQuestionOrigin,
    isSavedSubjectId,
    setPendingConsultationIntent,
    useConsultationDraft,
    type BirthInfoDraft,
    type ConsultationSubject,
} from '@/features/consultation';
import {
    isPopularQuestionCategory,
    trackPopularQuestionConsultationStart,
    trackPopularQuestionFirstAnswerSuccess,
    type PopularQuestionCategory,
} from '@/features/popular-questions';
import {
    ConsultationLoading,
    StructuredConsultationResult,
} from '@/features/intelligence/components';
import { computeAnswerAnchorOffset } from '@/features/chat/scrollAnchor';
import { ReportCtaFooter } from '@/features/chat/report/ReportCtaFooter';
import { isReportEligible, resolveReportCtaView } from '@/features/chat/report/reportCta';
import { reportService } from '@/features/chat/report/reportService';
import { feedbackService } from '@/features/chat/services/feedbackService';
import { CONSULTATION_PROMPT_VERSION } from '@/features/chat/prompts/consultationPromptVersion';
import type { FeedbackVerdict } from '@/features/intelligence';
import { colors, spacing } from '@/theme';

const WELCOME_MESSAGE_TEXT =
  '안녕하세요. 덕분이입니다. 😊\n\n출생정보 등록이 완료되었습니다.\n상담을 시작할 준비가 되었습니다.\n\n궁금한 점이나 고민이 있으시면 편하게 말씀해 주세요.';

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
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const { hPad, maxWidth } = useConsumerLayout();
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

  // Popular-question conversion funnel. When a consultation is seeded from a popular question, its stable
  // origin rides here so consultation_start (first send) and first_answer_success (first successful answer)
  // attribute correctly — WITHOUT text-matching. Each fires at most once per consultation.
  const popularOriginRef = useRef<{ key: string; category: PopularQuestionCategory | null } | null>(null);
  const popularStartFiredRef = useRef(false);
  const popularSuccessFiredRef = useRef(false);

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
    activeConversationId,
    ensureConversation,
    persistMessage,
  } = useConversationPersistence({
    startNew: startNewRef.current,
    draftReady,
    subjectId,
    subjectSnapshot,
    conversationId: conversationIdParam,
  });

  // Feedback (👍/👎) persistence — solo parity with 궁합. Restores per-message verdicts when the active
  // conversation changes (reload / open-from-history) so the selection survives; save is non-blocking.
  const [feedbackMap, setFeedbackMap] = useState<Record<string, FeedbackVerdict>>({});
  useEffect(() => {
    if (!activeConversationId) {
      setFeedbackMap({});
      return;
    }
    let cancelled = false;
    void feedbackService.loadFeedbackForConversation(activeConversationId).then((m) => {
      if (!cancelled) setFeedbackMap(m);
    });
    return () => {
      cancelled = true;
    };
  }, [activeConversationId]);
  const submitFeedback = async (messageId: string, verdict: FeedbackVerdict) => {
    setFeedbackMap((prev) => ({ ...prev, [messageId]: verdict }));
    await feedbackService.saveFeedback({
      conversationId: activeConversationId,
      messageId,
      verdict,
      consultationMode: 'solo',
      policyVersion: CONSULTATION_PROMPT_VERSION,
    });
  };

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
  // Authoritative server balance snapshot for the INSUFFICIENT_DUK card (never client-calculated). Sprint J1.
  const [insufficientSnap, setInsufficientSnap] = useState<{ balance: number; required: number; shortfall: number } | null>(null);
  // §8/C12 — the SERVER's session object, held raw. The UI derives the remaining-question line from
  // successfulTurnCount/turnLimit and NEVER counts sends itself, so a failed turn (which does not
  // consume a successful turn) leaves the number exactly where it was. No optimistic decrement.
  const [session, setSession] = useState<SessionStatus | null>(null);
  // Whether THIS conversation view has actually consulted (a successful turn happened here). Combined with any
  // restored history below, it gates the exhausted card so it shows ONLY on a conversation that consumed the
  // session — never on a fresh/greeting-only consultation (whose composer must stay available; the first send
  // starts a fresh server session, §5). Reset on every conversation reset. Failed turns do NOT increment it.
  const [successfulTurnsThisView, setSuccessfulTurnsThisView] = useState(0);
  const [candleEligible, setCandleEligible] = useState(false);
  // Balance pre-flight for the "새 상담 시작하기" CTA. The wallet read is the server-authoritative per-user
  // balance (getWalletState); required is the fixed policy price. When set, the CTA shows the shared
  // InsufficientDuk block IN-PLACE instead of the button — so a tap at balance<5 never opens an empty chat,
  // never creates a session, and never calls the LLM. The server still enforces on any real send.
  const wallet = useWallet();
  // Balance-sync (§5): the consultation screen must reflect the CURRENT canonical wallet on entry, not a stale
  // singleton snapshot from before an out-of-band grant/candle. Home/MY/상담 already refresh on mount/focus;
  // chat previously refreshed ONLY on exhaustion/after a charge, so it could render the "새 상담" gate against a
  // stale balance. Reuses the shared wallet refresh — no second balance source.
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) void refreshWallet().catch(() => {});
    }, [isAuthenticated]),
  );
  const [newConsultInsufficient, setNewConsultInsufficient] = useState<{ balance: number; required: number; shortfall: number } | null>(null);
  const refreshSession = useCallback(async () => {
    setSession(await getSessionStatus('general'));
  }, []);
  useEffect(() => {
    if (isAuthenticated) {
      void refreshSession();
      void getCandleAvailability(Math.floor(Date.now() / 1000))
        .then((a) => setCandleEligible(a.canLight))
        .catch(() => {});
    } else setSession(null);
  }, [isAuthenticated, refreshSession]);
  // Exhausted is a SERVER fact AND TTL-bounded: a live session at its successful-turn limit, still within its
  // 24h TTL. An EXPIRED session is NOT exhausted — getSessionStatus returns expired-but-ACTIVE rows (nothing
  // flips them terminal), so without the expiry gate a past-TTL session would pin the paywall forever; when
  // expired the composer shows and the server starts a fresh session on send. (Honors, never changes, the TTL.)
  const turnsExhausted = isSessionExhausted(session, Date.now());
  // Show the exhausted card ONLY when the session is exhausted AND this conversation actually consumed it
  // (restored turns, or a successful turn here). A fresh/greeting-only consultation keeps its composer even when
  // a PRIOR user-level session is exhausted — the first send starts a fresh server session (reserve_session_duk
  // does not resume an exhausted/expired session), charged once on first success per the frozen contract. This
  // removes the "greeting only, yet exhausted, 새 상담 no-op" deadlock (the exhausted gate could never clear
  // because it was derived purely from the persistent user-level session).
  const consultationEngagedHere = (restoredMessages?.length ?? 0) > 0 || successfulTurnsThisView > 0;
  const showExhausted = turnsExhausted && consultationEngagedHere;
  // Refresh the balance when the session is exhausted so the "새 상담 시작하기" pre-flight uses a current number.
  useEffect(() => {
    if (turnsExhausted) void refreshWallet().catch(() => {});
  }, [turnsExhausted]);
  const lastAttemptRef = useRef<{ text: string; context: ChatMessage[]; requestId?: string } | null>(null);
  // Synchronous re-entrancy lock (the `isSending` STATE updates a tick later): a
  // same-frame double-tap cannot start two sends (§30/§e).
  const isSendingRef = useRef(false);

  const scrollViewRef = useRef<ScrollView>(null);

  // The auth-gate must read LIVE auth state. useRef captures its initial value only
  // once, so the chat service reads this ref, refreshed every render — otherwise a
  // login that happens while this screen stays mounted would not lift the gate.
  const isAuthenticatedRef = useRef(isAuthenticated);
  isAuthenticatedRef.current = isAuthenticated;

  // Server Trust Boundary (Server-Trust sprint): the PRODUCTION chat path sends inputs only. The Edge
  // recomputes the deterministic grounding, builds the system prompt, calls the LLM, and validates — the
  // client is authoritative for nothing. (The local grounding pipeline `createChatService` is retained
  // only for offline/preview + as the shared-logic test harness.)
  const chatServiceRef = useRef(
    createServerConsultationService(
      supabaseEdgeConsultationAdapter,
      () => isAuthenticatedRef.current,
    ),
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
    setSuccessfulTurnsThisView(0); // reset per conversation (login / logout / user switch / start-new)
    // Prefill the composer once from the question preserved across the person-sheet /
    // birth-info / login journey (§28) — NEVER auto-sent (§29). The question rides the
    // ephemeral store, not the URL (§20). Only for a FRESH consultation: opening an
    // existing conversation by id must not resurface a pending question.
    // Consume the popular-question origin BEFORE the question — consumePendingQuestion() clears savedAt, which
    // the origin's TTL guard reads. Only in the same fresh-consultation branch that consumes the question.
    const canSeed = !qSeededRef.current && conversationIdParam === undefined;
    const origin = canSeed ? consumePendingQuestionOrigin() : null;
    const q = canSeed ? (consumePendingQuestion() ?? '') : '';
    if (!qSeededRef.current && q.length > 0) {
      qSeededRef.current = true;
      setInputText(q);
      // Attribute this consultation to the popular question it started from (null for a typed question). The
      // category is re-validated to the closed vocabulary before it can become an analytics dimension.
      popularOriginRef.current = origin
        ? { key: origin.key, category: isPopularQuestionCategory(origin.category) ? origin.category : null }
        : null;
      popularStartFiredRef.current = false;
      popularSuccessFiredRef.current = false;
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
  // user bubble or re-persisting it (§30/§37). The original request key is retained so a
  // succeeded-server/lost-response retry returns the persisted answer with zero new LLM. Login-before-LLM is
  // unchanged — the service gates on auth and returns AUTH_REQUIRED before any adapter
  // call, and authGuard reads LIVE auth state so an expired session re-gates on retry (§57).
  const runSend = async (
    text: string,
    context: ChatMessage[],
    retryRequestId?: string,
    ensuredConversationId?: string,
  ) => {
    setIsSending(true);
    // Popular-question funnel: the first send of a popular-origin consultation enters the request lifecycle
    // exactly once — strictly after, and distinct from, the Home click. Retries never re-fire (guarded).
    if (popularOriginRef.current && !popularStartFiredRef.current) {
      popularStartFiredRef.current = true;
      trackPopularQuestionConsultationStart({
        questionKey: popularOriginRef.current.key,
        category: popularOriginRef.current.category,
        placement: 'home',
      });
    }
    try {
      const result = await chatServiceRef.current.sendMessage({
        userMessage: text,
        draft,
        messages: context,
        conversationMemory,
        ...((ensuredConversationId ?? activeConversationId)
          ? { conversationId: ensuredConversationId ?? activeConversationId }
          : {}),
        ...(retryRequestId ? { requestId: retryRequestId } : {}),
      });

      if (result.success) {
        const assistantMessage: ChatMessage = {
          id: createMessageId('assistant'),
          role: 'assistant',
          // The service parses/validates the LLM's structured long-form; when present it renders
          // via <StructuredConsultationResult>, else `text` (plain fallback). Never client-fabricated.
          text: result.responseText,
          ...(result.structuredResult ? { structuredResult: result.structuredResult } : {}),
        };
        setMessages((currentMessages) => [...currentMessages, assistantMessage]);
        persistMessage(assistantMessage);
        setSendError(null);
        lastAttemptRef.current = null;
        setSuccessfulTurnsThisView((n) => n + 1); // this conversation has now consulted (gates the exhausted card)
        // Popular-question funnel: the FIRST successful answer of a popular-origin consultation, once.
        if (popularOriginRef.current && !popularSuccessFiredRef.current) {
          popularSuccessFiredRef.current = true;
          trackPopularQuestionFirstAnswerSuccess({
            questionKey: popularOriginRef.current.key,
            category: popularOriginRef.current.category,
            placement: 'home',
          });
        }
        // Anchor the viewport to the START of the new answer (§G) — NOT the bottom.
        pendingAnchorRef.current = assistantMessage.id;
        // §14/§8 — a charged turn changes the balance and the session's remaining turns; refresh both
        // (server-authoritative, fire-and-forget). No-ops when billing is off / there is no active session.
        void refreshWallet().catch(() => {});
        void refreshSession();
      } else {
        // V6 — GROUNDING_UNAVAILABLE carries the SERVER's own explanation of which birth input is missing;
        // only the server knows that, so it is preferred over the fixed client copy.
        const view = mapConsultationError(result.errorCode, result.errorDetail);
        if (result.errorCode === 'AUTH_REQUIRED') {
          // Preserve the question + resume route so login returns here, not Home (§9/§28).
          setPendingConsultationIntent({ question: text, returnTo: '/chat' });
        }
        // Sprint J1 — capture the authoritative INSUFFICIENT_DUK snapshot so the card can show a real,
        // actionable state (earn 덕 / top-up) instead of a dead-end message.
        setInsufficientSnap(result.errorCode === 'INSUFFICIENT_DUK' ? result.insufficientDuk ?? null : null);
        setSendError(view);
        lastAttemptRef.current = view.canRetry && result.requestId
          ? { text, context, requestId: result.requestId }
          : null;
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
    // A follow-up chip (handleSelectFollowUp) calls this same function and, unlike the composer,
    // is not unmounted by showExhausted — without this guard it would silently start (and charge for)
    // a new session. The visible exhausted card below is the required explicit confirmation.
    if (showExhausted) {
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
    setIsSending(true);
    try {
      // E.2 authority boundary: the very first paid request must already carry an owned conversation id.
      // Await the hook's single-flight creation and pass the returned id directly (state may render later).
      await executeConversationBoundSend({
        ensureConversation,
        persistUserMessage: () => persistMessage(userMessage),
        sendConsultation: (ensuredConversationId) =>
          runSend(trimmed, previousMessages, undefined, ensuredConversationId),
      });
    } catch (error) {
      // §B — an unauthenticated first turn fails closed at conversation creation → AUTH_REQUIRED (preserve the
      // question so login resumes here), never the generic REQUEST_FAILED that would look like a server fault.
      if (isConversationAuthRequiredError(error)) {
        setPendingConsultationIntent({ question: trimmed, returnTo: '/chat' });
        setSendError(mapConsultationError('AUTH_REQUIRED'));
        lastAttemptRef.current = null;
      } else {
        setSendError(mapConsultationError('REQUEST_FAILED'));
        lastAttemptRef.current = { text: trimmed, context: previousMessages };
      }
      setIsSending(false);
      isSendingRef.current = false;
    }
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
    try {
      const ensuredConversationId = await ensureConversation();
      await runSend(attempt.text, attempt.context, attempt.requestId, ensuredConversationId);
    } catch (error) {
      // §B — same auth-precedes-conversation boundary on retry (an expired session re-gates cleanly).
      if (isConversationAuthRequiredError(error)) {
        setPendingConsultationIntent({ question: attempt.text, returnTo: '/chat' });
        setSendError(mapConsultationError('AUTH_REQUIRED'));
        lastAttemptRef.current = null;
      } else {
        setSendError(mapConsultationError('REQUEST_FAILED'));
      }
      setIsSending(false);
      isSendingRef.current = false;
    }
  };

  // ─── Consultation report CTA (Commercial UX V4 §5/§6/§8/§9/§29) ─────────────
  // The conversation to report on: a history-opened id, else the id lazily created for this session.
  const reportConversationId = conversationIdParam ?? activeConversationId ?? null;
  const [reportId, setReportId] = useState<string | null>(null);
  const [reportJustCreated, setReportJustCreated] = useState(false);
  const [reportGenerating, setReportGenerating] = useState(false);
  const [reportError, setReportError] = useState(false);
  const isGeneratingReportRef = useRef(false); // synchronous double-tap lock (§8)
  const reportLoadedForRef = useRef<string | null>(null); // load existing report once per conversation

  // Look up an EXISTING report for this conversation once (§29) so the CTA opens it ("보고서 보기")
  // rather than offering to create a duplicate. Owner-scoped by RLS; a miss just leaves the create CTA.
  useEffect(() => {
    if (!isAuthenticated || !reportConversationId) return;
    if (reportLoadedForRef.current === reportConversationId) return;
    reportLoadedForRef.current = reportConversationId;
    // New conversation context → clear any prior conversation's report state so a just-created
    // success CTA can never bleed into a different consultation (§30). The lookup below repopulates.
    setReportId(null);
    setReportJustCreated(false);
    setReportError(false);
    let active = true;
    reportService
      .loadReportByConversation(reportConversationId)
      .then((existing) => {
        if (active && existing) setReportId(existing.id);
      })
      .catch(() => {
        // A lookup failure must never break chat; leave the create CTA available.
      });
    return () => {
      active = false;
    };
  }, [isAuthenticated, reportConversationId]);

  const handleGenerateReport = async () => {
    if (isGeneratingReportRef.current || !reportConversationId) return; // double-tap guard (§8)
    isGeneratingReportRef.current = true;
    setReportGenerating(true);
    setReportError(false);
    try {
      const report = await reportService.createOrUpdateReport(
        reportConversationId,
        new Date().toISOString(),
      );
      if (report) {
        setReportId(report.id);
        setReportJustCreated(true); // show the deterministic success copy (§9)
      } else {
        setReportError(true);
      }
    } catch {
      setReportError(true); // safe message + retry; the conversation is untouched (§31)
    } finally {
      setReportGenerating(false);
      isGeneratingReportRef.current = false;
    }
  };

  const handleOpenReport = (id: string) => {
    router.push({ pathname: '/report/[id]', params: { id } });
  };

  const reportCtaView = resolveReportCtaView({
    eligible: isReportEligible(messages),
    conversationId: reportConversationId,
    reportId,
    justCreated: reportJustCreated,
    generating: reportGenerating,
  });

  const header = (
    <AppHeader
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
        <View style={{ flex: 1, paddingHorizontal: hPad, paddingTop: spacing.xl }}>
          <StateView kind="loading" skeletonLines={5} title="상담 정보를 불러오는 중" />
        </View>
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
          <View style={[styles.contentWrapper, { maxWidth, paddingHorizontal: hPad }]}>
            <Stack gap="md">
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
                      onFeedback={(verdict) => void submitFeedback(message.id, verdict)}
                      initialFeedback={feedbackMap[message.id] ?? null}
                    />
                  ) : (
                    <ChatBubble message={message} />
                  )}
                </View>
              ))}
              {/* One honest analysis state — no fake engine stages (§H/§10). */}
              {isSending ? <ConsultationLoading /> : null}
              {/* Conversation-level report action (ONE per conversation, §7) — appears once the
                  consultation has a real answer. Hidden while a send is in flight. */}
              {!isSending ? (
                <ReportCtaFooter
                  view={reportCtaView}
                  error={reportError}
                  onGenerate={handleGenerateReport}
                  onOpen={handleOpenReport}
                />
              ) : null}
              {/* AI-generated-content disclosure (§2) — one honest footer under the conversation, not per message. */}
              <AiDisclosure style={{ marginTop: spacing.md }} />
            </Stack>
          </View>
        </ScrollView>

        <View style={[styles.inputArea, { paddingBottom: insets.bottom + spacing.sm, paddingHorizontal: hPad }]}>
          <View style={[styles.contentWrapper, { maxWidth }]}>
            {/* C12 — derived from the SERVER's successful-turn count; hidden when there is no live session. */}
            <SessionMeter session={session} style={styles.sessionHint} />
            {sendError ? (
              sendError.kind === 'insufficient' && insufficientSnap ? (
                // C07 — never an Alert. The three server numbers plus the two ways forward, inline.
                <InsufficientDuk
                  product="general"
                  snapshot={insufficientSnap}
                  candleEligible={candleEligible}
                  onCandle={() => router.push('/wallet')}
                  onTopup={() => router.push('/duk-topup')}
                  style={styles.errorCard}
                />
              ) : (
                <Card use="status" statusColor={theme.danger} radius="xl" style={styles.errorCard}>
                  <Stack gap="sm">
                    <Text variant="bodyMedium">{sendError.message}</Text>
                    {/* Say the money and the turn count are untouched BEFORE offering a retry — a
                        generation failure must never read as "you just spent a question". */}
                    {sendError.canRetry ? (
                      <Text variant="bodySmall" colorToken="textSecondary">
                        이번 질문은 전달되지 않았어요. 질문 횟수는 그대로예요.
                      </Text>
                    ) : null}
                    {sendError.kind === 'auth' && !isAuthenticated ? (
                      <Button label="로그인하기" radius="lg" onPress={() => router.push('/login')} />
                    ) : null}
                    {sendError.canRetry ? (
                      <Button
                        label="다시 시도"
                        variant="secondary"
                        radius="lg"
                        onPress={handleRetry}
                        disabled={isSending}
                      />
                    ) : null}
                  </Stack>
                </Card>
              )
            ) : null}
            {/* Turns exhausted — the SERVER confirmed 5 successful turns. The composer is replaced (not
                merely disabled) so there is no input that silently does nothing, and the next step and
                its cost are stated in the same block. */}
            {showExhausted ? (
              newConsultInsufficient ? (
                // Balance < 5 at the "새 상담" tap → the shared insufficient-Duk block (NOT a dead button, NOT a
                // new session, NOT an LLM call). Reuses the exact economy UX; the numbers are the authoritative
                // per-user balance + the fixed price.
                <InsufficientDuk
                  product="general"
                  snapshot={newConsultInsufficient}
                  candleEligible={candleEligible}
                  onCandle={() => router.push('/wallet')}
                  onTopup={() => router.push('/duk-topup')}
                  style={styles.errorCard}
                />
              ) : (
                <Card radius="xl" style={styles.errorCard}>
                  <Stack gap="sm">
                    <Text variant="bodyLarge" style={styles.exhaustedTitle}>이번 상담의 남은 질문을 모두 썼어요</Text>
                    <Text variant="bodyMedium" colorToken="textSecondary">
                      새 상담을 시작하면 다시 물어볼 수 있어요. 지금까지의 내용은 상담 기록에 남아 있어요.
                    </Text>
                    <Button
                      label={`새 상담 시작하기  🍀 ${dukLabel(DUK_PRICES.general)}`}
                      radius="lg"
                      onPress={() => {
                        const required = DUK_PRICES.general;
                        // Block ONLY on a KNOWN-short balance (shared canonical helper). An unloaded/unknown
                        // wallet must NOT read as 0 → false paywall; when unknown, proceed — the server
                        // (reserve_session_duk) is the final authority and returns INSUFFICIENT_DUK if short.
                        if (isBalanceShort(wallet.state, required)) {
                          const balance = wallet.state?.totalSpendable ?? 0;
                          setNewConsultInsufficient({ balance, required, shortfall: required - balance });
                          return;
                        }
                        // Balance OK → start a fresh consultation. push (not same-route replace, which does not
                        // remount → the old dead-tap bug) so the screen re-mounts and re-reads startNew.
                        router.push({ pathname: '/chat', params: { startNew: '1' } });
                      }}
                    />
                  </Stack>
                </Card>
              )
            ) : null}
            {!showExhausted ? (
            <ChatInput
              value={inputText}
              onChangeText={setInputText}
              onSend={handleSend}
              placeholder={isSending ? '덕분이가 읽는 중이에요…' : undefined}
              disabled={inputText.trim().length === 0 || isSending}
            />
            ) : null}
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
    alignSelf: 'center',
  },
  inputArea: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  errorCard: {
    marginBottom: spacing.sm,
  },
  sessionHint: {
    marginBottom: spacing.sm,
    alignSelf: 'center',
  },
  exhaustedTitle: {
    fontWeight: '700',
  },
});
