import { useCallback, useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import {
  AI_CONSENT_TITLE,
  AI_CONSENT_WITHDRAW_NOTE,
  type AiConsentState,
} from '@/features/legal/aiProcessingConsent';
import { AiConsentSheet } from '@/features/legal/components/AiConsentSheet';
import { aiConsentService } from '@/features/legal/services/aiConsentService';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

// MY → AI 처리 동의. **동의도 철회도 여기서 한다** (애플 5.1.2(i): 철회 경로가 있어야 한다).
//
// ⚠ 상태를 모를 때 "동의함" 으로 그리지 않는다. 조회가 실패하면 그렇게 말한다 —
//   모르는 것을 동의한 것으로 그리면 이 화면이 거짓말을 시작한다.
export function AiConsentSetting() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const [state, setState] = useState<AiConsentState | null>(null);
  const [sheet, setSheet] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setState(await aiConsentService.state());
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const revoke = async () => {
    setBusy(true);
    await aiConsentService.revoke();
    setBusy(false);
    void load();
  };

  const box = {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: theme.surface,
  } as const;

  const status =
    state === null
      ? '확인하는 중…'
      : state.granted
        ? '동의함'
        : state.reason === 'revoked'
          ? '철회함'
          : state.reason === 'none'
            ? '아직 동의하지 않음'
            : '확인하지 못했습니다';

  return (
    <Stack gap="xs">
      <Text variant="headingMedium">{AI_CONSENT_TITLE}</Text>
      <View style={{ ...box, gap: spacing.sm }} accessibilityLabel="AI 처리 동의 설정">
        <Text variant="bodyMedium">현재 상태: {status}</Text>
        <Text variant="caption" colorToken="textSecondary">{AI_CONSENT_WITHDRAW_NOTE}</Text>

        {state?.granted ? (
          <Pressable
            onPress={() => void revoke()}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="AI 처리 동의 철회"
            style={{ ...box, borderColor: theme.border }}
          >
            <Text variant="bodyMedium" style={{ textAlign: 'center' }}>
              {busy ? '처리 중…' : '동의 철회'}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => setSheet(true)}
            accessibilityRole="button"
            accessibilityLabel="AI 처리 동의하기"
            style={{ ...box, backgroundColor: theme.textPrimary }}
          >
            <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.background }}>
              내용 보고 동의하기
            </Text>
          </Pressable>
        )}
      </View>

      <AiConsentSheet
        visible={sheet}
        onClose={() => setSheet(false)}
        onAgree={async () => {
          const ok = await aiConsentService.grant();
          if (ok) void load();
          return ok;
        }}
      />
    </Stack>
  );
}
