import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import { useConsultationDraft } from '@/features/consultation';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, spacing } from '@/theme';

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
};

const WELCOME_MESSAGE_TEXT =
  '안녕하세요. 덕분AI입니다. 😊\n\n출생정보 등록이 완료되었습니다.\n상담을 시작할 준비가 되었습니다.\n\n궁금한 점이나 고민이 있으시면 편하게 말씀해 주세요.';

function createUserMessageId(): string {
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function ChatScreen() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const { draft } = useConsultationDraft();

  const isDraftReady = draft.subject !== null && draft.birthInfo !== null;

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome-message', role: 'assistant', text: WELCOME_MESSAGE_TEXT },
  ]);
  const [inputText, setInputText] = useState('');

  const scrollViewRef = useRef<ScrollView>(null);

  const canSend = inputText.trim().length > 0;

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
              {messages.map((message) => {
                const isAssistant = message.role === 'assistant';

                return (
                  <View
                    key={message.id}
                    style={[
                      styles.messageRow,
                      { justifyContent: isAssistant ? 'flex-start' : 'flex-end' },
                    ]}
                  >
                    <View
                      style={[
                        styles.bubble,
                        {
                          backgroundColor: isAssistant
                            ? theme.backgroundElevated
                            : theme.primary,
                        },
                      ]}
                    >
                      <Text
                        variant="bodyMedium"
                        colorToken={isAssistant ? 'textPrimary' : 'primaryText'}
                      >
                        {message.text}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </Stack>
          </View>
        </ScrollView>

        <View style={styles.inputArea}>
          <View style={styles.contentWrapper}>
            <Stack direction="row" gap="sm" align="flex-end">
              <Input
                value={inputText}
                onChangeText={setInputText}
                placeholder="메시지를 입력해 주세요"
                multiline
                accessibilityLabel="메시지 입력창"
                style={styles.inputWrapper}
                inputStyle={styles.inputField}
              />
              <Button
                label="전송"
                disabled={!canSend}
                onPress={handleSend}
                accessibilityLabel="메시지 전송"
              />
            </Stack>
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
  messageRow: {
    flexDirection: 'row',
  },
  bubble: {
    maxWidth: '80%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.md,
  },
  inputArea: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
  },
  inputField: {
    minHeight: 44,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
});
