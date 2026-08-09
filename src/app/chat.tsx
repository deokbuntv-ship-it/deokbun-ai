import {
    useLocalSearchParams,
    useRootNavigationState,
    useRouter,
} from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import {
    ChatBubble,
    ChatInput,
    createChatService,
    supabaseEdgeLLMAdapter,
    useConversationPersistence,
    type ChatMessage,
} from '@/features/chat';
import {
    isSavedSubjectId,
    useConsultationDraft,
    type BirthInfoDraft,
    type ConsultationSubject,
} from '@/features/consultation';
import { spacing } from '@/theme';

const WELCOME_MESSAGE_TEXT =
  '안녕하세요. 덕분AI입니다. 😊\n\n출생정보 등록이 완료되었습니다.\n상담을 시작할 준비가 되었습니다.\n\n궁금한 점이나 고민이 있으시면 편하게 말씀해 주세요.';

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-message',
  role: 'assistant',
  text: WELCOME_MESSAGE_TEXT,
};

const ADAPTER_NOT_CONFIGURED_MESSAGE_TEXT =
  '현재 AI 상담 기능을 준비하고 있습니다.\n잠시 후 다시 시도해 주세요.';

const AUTH_REQUIRED_MESSAGE_TEXT =
  'AI 상담을 이용하려면 로그인이 필요합니다.\n아래 "로그인하기" 버튼을 눌러 로그인해 주세요.';

function createMessageId(role: ChatMessage['role']): string {
  return `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    startNew?: string;
    conversationId?: string;
  }>();
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
  const [isAuthRequired, setIsAuthRequired] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  const chatServiceRef = useRef(
    createChatService(supabaseEdgeLLMAdapter, () => isAuthenticated),
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
    setInputText('');
    setIsAuthRequired(false);
  }, [messagesHydrationStatus, resetToken, restoredMessages]);

  const scrollToEnd = () => {
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    });
  };

  const handleSend = async () => {
    if (isSending) {
      return;
    }

    const trimmedInput = inputText.trim();

    if (trimmedInput.length === 0) {
      return;
    }

    const previousMessages = messages;

    const userMessage: ChatMessage = {
      id: createMessageId('user'),
      role: 'user',
      text: trimmedInput,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInputText('');
    scrollToEnd();
    persistMessage(userMessage);

    setIsSending(true);

    try {
      const result = await chatServiceRef.current.sendMessage({
        userMessage: trimmedInput,
        draft,
        messages: previousMessages,
        conversationMemory,
      });

      if (result.success) {
        const assistantMessage: ChatMessage = {
          id: createMessageId('assistant'),
          role: 'assistant',
          text: result.responseText,
        };

        setMessages((currentMessages) => [
          ...currentMessages,
          assistantMessage,
        ]);
        persistMessage(assistantMessage);
      } else {
        if (result.errorCode === 'AUTH_REQUIRED') {
          setIsAuthRequired(true);
        }

        const errorText =
          result.errorCode === 'AUTH_REQUIRED'
            ? AUTH_REQUIRED_MESSAGE_TEXT
            : ADAPTER_NOT_CONFIGURED_MESSAGE_TEXT;

        const assistantMessage: ChatMessage = {
          id: createMessageId('assistant'),
          role: 'assistant',
          text: errorText,
        };

        // Error placeholders are intentionally NOT persisted.
        setMessages((currentMessages) => [
          ...currentMessages,
          assistantMessage,
        ]);
      }

      scrollToEnd();
    } finally {
      setIsSending(false);
    }
  };

  if (
    draftHydrationStatus !== 'ready' ||
    messagesHydrationStatus !== 'ready'
  ) {
    return (
      <Screen>
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
      <Screen>
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
    <Screen>
      <View style={styles.container}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.messageScroll}
          contentContainerStyle={styles.messageScrollContent}
          onContentSizeChange={() => {
            scrollViewRef.current?.scrollToEnd({ animated: false });
          }}
        >
          <View style={styles.contentWrapper}>
            <Stack gap="sm">
              {messages.map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}
            </Stack>
          </View>
        </ScrollView>

        <View style={styles.inputArea}>
          <View style={styles.contentWrapper}>
            {isAuthRequired && !isAuthenticated ? (
              <Stack gap="xs" style={styles.loginPrompt}>
                <Button
                  label="로그인하기"
                  onPress={() => router.push('/login')}
                />
              </Stack>
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
  loginPrompt: {
    marginBottom: spacing.sm,
  },
});
