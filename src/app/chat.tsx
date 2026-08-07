import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
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
    type ChatMessage,
    type ConversationMemoryState,
} from '@/features/chat';
import { useConsultationDraft } from '@/features/consultation';
import { spacing } from '@/theme';

const WELCOME_MESSAGE_TEXT =
  '안녕하세요. 덕분AI입니다. 😊\n\n출생정보 등록이 완료되었습니다.\n상담을 시작할 준비가 되었습니다.\n\n궁금한 점이나 고민이 있으시면 편하게 말씀해 주세요.';

const ADAPTER_NOT_CONFIGURED_MESSAGE_TEXT =
  '현재 AI 상담 기능을 준비하고 있습니다.\n잠시 후 다시 시도해 주세요.';

const AUTH_REQUIRED_MESSAGE_TEXT =
  'AI 상담을 이용하려면 로그인이 필요합니다.\n아래 "로그인하기" 버튼을 눌러 로그인해 주세요.';

const INITIAL_CONVERSATION_MEMORY: ConversationMemoryState = {
  summary: null,
  lastSummarizedMessageId: null,
};

function createMessageId(role: ChatMessage['role']): string {
  return `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function ChatScreen() {
  const router = useRouter();
  const { draft, hydrationStatus } = useConsultationDraft();
  const { isAuthenticated } = useAuth();

  const isDraftReady = draft.subject !== null && draft.birthInfo !== null;

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome-message', role: 'assistant', text: WELCOME_MESSAGE_TEXT },
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isAuthRequired, setIsAuthRequired] = useState(false);
  const [conversationMemory] = useState<ConversationMemoryState>(
    INITIAL_CONVERSATION_MEMORY,
  );

  const scrollViewRef = useRef<ScrollView>(null);

  const chatServiceRef = useRef(
    createChatService(supabaseEdgeLLMAdapter, () => isAuthenticated),
  );

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

  if (hydrationStatus !== 'ready') {
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
