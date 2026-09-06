import { Redirect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { useAuth } from '@/features/auth';
import {
  INQUIRY_CATEGORIES,
  INQUIRY_CATEGORY_LABEL,
  INQUIRY_STATUS_LABEL,
  MESSAGE_MAX,
  RESPONSE_TIME_NOTICE,
  submitOutcomeMessage,
  validateInquiry,
  type InquiryCategory,
  type SupportInquiry,
} from '@/features/support/supportContract';
import { listMyInquiries, submitInquiry } from '@/features/support/supportService';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useConsumerLayout } from '@/hooks/useConsumerLayout';
import { colors, radius, spacing } from '@/theme';

// 문의하기 — the consumer CS surface. One question, one answer, one screen.
//
// The privacy policy already promised this channel (legalContent.ts:86); this is that channel.
// Deliberately plain: no chat UI, no attachments, no "도움말 먼저 보기" interstitial. Someone
// opening a support form already tried to solve it themselves.
export default function SupportScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const { hPad, maxWidth } = useConsumerLayout();
  const { isAuthenticated, authState } = useAuth();

  const [category, setCategory] = useState<InquiryCategory>('other');
  const [message, setMessage] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [history, setHistory] = useState<SupportInquiry[]>([]);

  const refresh = useCallback(() => {
    if (!isAuthenticated) return;
    void listMyInquiries().then(setHistory);
  }, [isAuthenticated]);

  useEffect(refresh, [refresh]);

  if (authState.status === 'unauthenticated') return <Redirect href="/login" />;

  const draft = { category, message, contactEmail };
  const valid = validateInquiry(draft);

  const send = async () => {
    setErrorText(null);
    if (!valid.ok) {
      setErrorText(valid.reason);
      return;
    }
    setBusy(true);
    const outcome = await submitInquiry(draft);
    setBusy(false);
    if (outcome === 'SUBMITTED') {
      setMessage('');
      setContactEmail('');
      setCategory('other');
      setSent(true);
      refresh();
      return;
    }
    setErrorText(submitOutcomeMessage(outcome));
  };

  return (
    <Screen padded={false}>
      <AppHeader title="문의하기" showBack onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: hPad }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.wrapper, { maxWidth }]}>
          <Stack gap="lg">
            <Text variant="bodyMedium" colorToken="textSecondary" style={styles.body}>
              불편하셨던 점이나 궁금한 것을 남겨 주세요. {RESPONSE_TIME_NOTICE}
            </Text>

            <Stack gap="xs">
              <Text variant="bodySmall" style={styles.label}>
                문의 유형
              </Text>
              <View style={styles.chips}>
                {INQUIRY_CATEGORIES.map((c) => {
                  const on = c === category;
                  return (
                    <Pressable
                      key={c}
                      onPress={() => setCategory(c)}
                      accessibilityRole="button"
                      aria-selected={on}
                      accessibilityLabel={`문의 유형 ${INQUIRY_CATEGORY_LABEL[c]}`}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: on ? theme.surfaceSky : 'transparent',
                          borderColor: on ? theme.primary : theme.lineHairline,
                        },
                      ]}
                    >
                      <Text variant="bodySmall" style={{ fontWeight: on ? '700' : '500' }}>
                        {INQUIRY_CATEGORY_LABEL[c]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Stack>

            <Stack gap="xs">
              <Text variant="bodySmall" style={styles.label}>
                문의 내용
              </Text>
              <TextInput
                value={message}
                onChangeText={(v) => {
                  setMessage(v);
                  setSent(false);
                }}
                multiline
                editable={!busy}
                maxLength={MESSAGE_MAX}
                placeholder="어떤 점이 불편하셨나요?"
                placeholderTextColor={theme.textMuted}
                accessibilityLabel="문의 내용"
                style={[
                  styles.textarea,
                  { borderColor: theme.lineHairline, color: theme.textPrimary, backgroundColor: theme.surface },
                ]}
              />
              <Text variant="caption" colorToken="textMuted" style={styles.counter}>
                {message.trim().length} / {MESSAGE_MAX}
              </Text>
            </Stack>

            <Input
              label="답변 받을 이메일 (선택)"
              value={contactEmail}
              onChangeText={setContactEmail}
              placeholder={authState.user?.email ?? 'name@example.com'}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!busy}
              accessibilityLabel="답변 받을 이메일"
            />
            <Text variant="caption" colorToken="textMuted" style={styles.body}>
              비워 두시면 가입하신 계정으로 답변드려요. 앱 버전과 기기 종류가 함께 전달돼요.
            </Text>

            {errorText ? (
              <Text variant="bodySmall" colorToken="danger">
                {errorText}
              </Text>
            ) : null}
            {sent ? (
              <Text variant="bodySmall" style={{ color: theme.success }}>
                문의가 접수되었어요. 아래에서 진행 상태를 확인하실 수 있어요.
              </Text>
            ) : null}

            <Button label="문의 보내기" radius="lg" loading={busy} disabled={busy} onPress={send} />

            {history.length > 0 ? (
              <Stack gap="sm">
                <Text variant="headingMedium">내 문의 내역</Text>
                {history.map((h) => (
                  <View key={h.id} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.lineHairline }]}>
                    <View style={styles.cardHead}>
                      <Text variant="bodySmall" style={styles.label}>
                        {INQUIRY_CATEGORY_LABEL[h.category]}
                      </Text>
                      <Text
                        variant="caption"
                        style={{ color: h.status === 'ANSWERED' ? theme.success : theme.textMuted, fontWeight: '700' }}
                      >
                        {INQUIRY_STATUS_LABEL[h.status]}
                      </Text>
                    </View>
                    <Text variant="bodySmall" colorToken="textSecondary" style={styles.body}>
                      {h.message}
                    </Text>
                    {h.answer ? (
                      <View style={[styles.answer, { backgroundColor: theme.backgroundSelected }]}>
                        <Text variant="caption" colorToken="textMuted">
                          답변
                        </Text>
                        <Text variant="bodySmall" style={styles.body}>
                          {h.answer}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ))}
              </Stack>
            ) : null}
          </Stack>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingTop: spacing.lg, paddingBottom: 40, alignItems: 'center' },
  wrapper: { width: '100%', alignSelf: 'center' },
  body: { lineHeight: 21 },
  label: { fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: { paddingHorizontal: 14, minHeight: 36, justifyContent: 'center', borderRadius: radius.lg, borderWidth: 1 },
  textarea: {
    minHeight: 132,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  counter: { textAlign: 'right' },
  card: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, gap: 6 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  answer: { borderRadius: radius.md, padding: spacing.sm, gap: 2, marginTop: 4 },
});
