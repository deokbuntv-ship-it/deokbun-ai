import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { useAuth } from '@/features/auth';
import {
  DELETE_CONFIRM_PHRASE,
  deletionOutcomeMessage,
  deletionSummaryLines,
  dukForfeitLine,
  isDeleteConfirmed,
  type AccountDeletionPreview,
} from '@/features/account/accountDeletionContract';
import { deleteAccount, fetchDeletionPreview } from '@/features/account/accountDeletionService';
import { unregisterOnLogout } from '@/features/retention';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useConsumerLayout } from '@/hooks/useConsumerLayout';
import { colors, spacing } from '@/theme';

// 계정 탈퇴 (회원 탈퇴).
//
// TONE: warm on the way out, and NOT ONE STEP HARDER than it has to be. There is no retention
// offer, no "정말 떠나시나요?" loop, no survey, no hidden entry point — the row sits directly
// under 로그아웃 in MY. The single typed word exists to stop an accidental tap on an
// irreversible action, which is the opposite of a dark pattern: it protects the user, not the
// metric.
//
// The counts come from the server so the sentence is true for THIS account. A zero count is
// omitted rather than shown — telling someone they are about to lose nothing is not
// information, it is filler.
export default function AccountDeleteScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const { hPad, maxWidth } = useConsumerLayout();
  const { isAuthenticated, authState } = useAuth();

  const [preview, setPreview] = useState<AccountDeletionPreview | null>(null);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    void fetchDeletionPreview().then((p) => {
      if (active) setPreview(p);
    });
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  if (authState.status === 'unauthenticated') return <Redirect href="/login" />;

  const summary = preview ? deletionSummaryLines(preview) : [];
  const forfeit = preview ? dukForfeitLine(preview.dukBalance) : null;
  const armed = isDeleteConfirmed(typed) && !busy;

  const handleDelete = async () => {
    setErrorText(null);
    setBusy(true);
    // Disable this device's push registration WHILE still authenticated (owner RLS), exactly as
    // logout does — otherwise the row is unreachable the moment the account is gone.
    await unregisterOnLogout().catch(() => {});

    const outcome = await deleteAccount();

    if (outcome === 'DELETED') {
      // The service already signed out. Reset to the entry screen; there is no account to
      // return to and no back stack worth keeping.
      router.replace('/login');
      return;
    }
    setBusy(false);
    if (outcome === 'CANCELLED') return; // the user backed out of the Apple sheet — say nothing
    setErrorText(deletionOutcomeMessage(outcome));
  };

  return (
    <Screen padded={false}>
      <AppHeader title="계정 탈퇴" showBack onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: hPad }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.wrapper, { maxWidth }]}>
          <Stack gap="lg">
            <Stack gap="sm">
              <Text variant="headingLarge">그동안 함께해 주셔서 고마웠어요.</Text>
              <Text variant="bodyMedium" colorToken="textSecondary" style={styles.body}>
                탈퇴하면 {authState.user?.email ? `${authState.user.email} ` : ''}계정과 그동안의 기록이
                모두 사라져요. 되돌릴 수 없어요.
              </Text>
            </Stack>

            {summary.length > 0 ? (
              <Stack gap="xs">
                <Text variant="headingMedium">지금 지워지는 것</Text>
                {summary.map((line) => (
                  <Text key={line} variant="bodyMedium" colorToken="textSecondary">
                    · {line}
                  </Text>
                ))}
              </Stack>
            ) : null}

            {forfeit ? (
              <Text variant="bodyMedium" colorToken="textSecondary" style={styles.body}>
                {forfeit}
              </Text>
            ) : null}

            <Text variant="bodySmall" colorToken="textMuted" style={styles.body}>
              같은 소셜 계정으로 다시 가입하실 수 있지만, 완전히 새 계정이 되고 이전 기록은
              돌아오지 않아요. 법령에 따라 보관해야 하는 결제·거래 기록은 개인정보와 분리해
              따로 보관됩니다.
            </Text>

            <Stack gap="sm">
              <Input
                label={`계속하려면 "${DELETE_CONFIRM_PHRASE}" 를 입력해 주세요`}
                value={typed}
                onChangeText={setTyped}
                placeholder={DELETE_CONFIRM_PHRASE}
                autoCorrect={false}
                editable={!busy}
                accessibilityLabel="탈퇴 확인 입력"
              />
              {errorText ? (
                <Text variant="bodySmall" colorToken="danger">
                  {errorText}
                </Text>
              ) : null}
            </Stack>

            <Stack gap="sm">
              <Button
                label="탈퇴하기"
                variant="danger"
                radius="lg"
                disabled={!armed}
                loading={busy}
                onPress={handleDelete}
              />
              <Button
                label="돌아가기"
                variant="secondary"
                radius="lg"
                disabled={busy}
                onPress={() => router.back()}
              />
            </Stack>

            <Text variant="caption" colorToken="textMuted" style={[styles.body, { color: theme.textMuted }]}>
              탈퇴 처리에는 잠시 시간이 걸릴 수 있어요. 화면을 닫지 말고 기다려 주세요.
            </Text>
          </Stack>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingTop: spacing.lg, paddingBottom: 40, alignItems: 'center' },
  wrapper: { width: '100%', alignSelf: 'center' },
  body: { lineHeight: 22 },
});
