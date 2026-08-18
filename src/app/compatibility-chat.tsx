import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/AppHeader';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import { ChatInput, supabaseEdgeConsultationAdapter, type ChatMessage } from '@/features/chat';
import type { CompatibilityResultMeta } from '@/features/chat/server';
import { useConsultationSubjects, type ConsultationSubjectRecord } from '@/features/consultation';
import { createCompatibilityConsultationService } from '@/features/compatibility/services/compatibilityConsultationService';
import { CompatibilityTierCard } from '@/features/compatibility/components/CompatibilityTierCard';
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
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ selfId?: string; targetId?: string }>();
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
  const initialSentRef = useRef(false);
  const scrollRef = useRef<ScrollView>(null);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/compatibility');
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
      if (result.compatibility) setTier(result.compatibility);
      setMessages((prev) => [
        ...prev,
        {
          id: newId('assistant'),
          role: 'assistant',
          text: result.responseText,
          ...(result.structuredResult ? { structuredResult: result.structuredResult } : {}),
          ...(result.compatibility ? { compatibility: result.compatibility } : {}),
        },
      ]);
    } finally {
      setSending(false);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    }
  };

  // Auto-send the initial overview once both people are loaded.
  useEffect(() => {
    if (initialSentRef.current) return;
    if (status !== 'ready') return;
    if (!self || !target) return;
    initialSentRef.current = true;
    void send(INITIAL_QUESTION);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, self, target]);

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
          <StructuredConsultationResult vm={m.structuredResult} onSelectFollowUp={(q) => void send(q)} />
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
        <View style={[styles.composer, { paddingBottom: insets.bottom + spacing.sm }]}>
          <View style={styles.wrapper}>
            <ChatInput
              value={input}
              onChangeText={setInput}
              onSend={() => void send(input)}
              disabled={sending || !self || !target}
            />
          </View>
        </View>
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
  composer: { paddingHorizontal: 20, paddingTop: spacing.sm },
});
