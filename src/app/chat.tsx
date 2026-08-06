import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import { ChatBubble, ChatInput, type ChatMessage } from '@/features/chat';
import { useConsultationDraft } from '@/features/consultation';
import { spacing } from '@/theme';

const WELCOME_MESSAGE_TEXT =
  '안녕하세요. 덕분AI입니다. 😊\n\n출생정보 등록이 완료되었습니다.\n상담을 시작할 준비가 되었습니다.\n\n궁금한 점이나 고민이 있으시면 편하게 말씀해 주세요.';

function createUserMessageId(): string {
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function ChatScreen() {
  const { draft } = useConsultationDraft();

  const isDraftReady = draft.subject !== null && draft.birthInfo !== null;

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome-message', role: 'assistant', text: WELCOME_MESSAGE_TEXT },
  ]);
  const [inputText, setInputText] = useState('');

  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = () => {
    const trimmed = inputText.trim();

    if (trimmed.length === 0) {
      return;
    }

    const newMessage: ChatMessage = {
      id: createUserMessageId(),
      role: 'user',
      text: trimmed,
    };

    setMessages((current) => [...current, newMessage]);
    setInputText('');

    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    });
  };

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
            <ChatInput
              value={inputText}
              onChangeText={setInputText}
              onSend={handleSend}
              disabled={inputText.trim().length === 0}
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
});
