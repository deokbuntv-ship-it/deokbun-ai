import { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/Text';
import {
  AI_CONSENT_CHECKBOX_LABEL,
  AI_CONSENT_DEFAULT_CHECKED,
  AI_CONSENT_PROCESSORS,
  AI_CONSENT_PURPOSE,
  AI_CONSENT_SENT_ITEMS,
  AI_CONSENT_TITLE,
  AI_CONSENT_WITHDRAW_NOTE,
} from '@/features/legal/aiProcessingConsent';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

// 제3자 AI 처리 동의 시트 (애플 5.1.2(i)).
//
// ⚠ **개인정보가 외부 AI 로 처음 나가기 전에** 뜬다. 서버(`chat` Edge)도 같은 것을 확인하므로,
//   이 화면을 건너뛰어도 AI 는 돌지 않는다 — 화면은 안내이고 판정은 서버가 한다.
//
// ⚠ 기본값은 **미체크**다. 미리 체크된 동의는 명시적 동의가 아니다.
// ⚠ 톤 규칙: 겁주지 않고, 과장하지 않고, 동의하지 않아도 되는 선택임을 분명히 한다.
export function AiConsentSheet({
  visible,
  onClose,
  onAgree,
}: {
  visible: boolean;
  onClose: () => void;
  onAgree: () => Promise<boolean> | boolean;
}) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const [checked, setChecked] = useState<boolean>(AI_CONSENT_DEFAULT_CHECKED);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const close = () => {
    setChecked(AI_CONSENT_DEFAULT_CHECKED);
    setBusy(false);
    setFailed(false);
    onClose();
  };

  const agree = async () => {
    if (!checked || busy) return;
    setBusy(true);
    const ok = await onAgree();
    setBusy(false);
    // ⚠ 저장이 실패하면 닫지 않는다. 닫으면 사용자는 동의했다고 믿은 채 떠난다.
    if (ok) close();
    else setFailed(true);
  };

  const box = {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: theme.surface,
  } as const;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <View
          accessibilityLabel={AI_CONSENT_TITLE}
          style={{
            backgroundColor: theme.background,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
            padding: spacing.lg,
            gap: spacing.md,
            maxHeight: '90%',
          }}
        >
          <Text variant="headingMedium">{AI_CONSENT_TITLE}</Text>

          <ScrollView contentContainerStyle={{ gap: spacing.md }}>
            <View style={{ ...box, gap: spacing.xs }}>
              <Text variant="bodySmall" colorToken="textSecondary">무엇을 보내나요</Text>
              {AI_CONSENT_SENT_ITEMS.map((item) => (
                <Text key={item} variant="bodyMedium">· {item}</Text>
              ))}
            </View>

            <View style={{ ...box, gap: spacing.xs }}>
              <Text variant="bodySmall" colorToken="textSecondary">누구에게 보내나요</Text>
              {AI_CONSENT_PROCESSORS.map((p) => (
                <Text key={p.name} variant="bodyMedium">
                  · {p.name} — {p.role} ({p.region})
                </Text>
              ))}
            </View>

            <View style={{ ...box, gap: spacing.xs }}>
              <Text variant="bodySmall" colorToken="textSecondary">왜 보내나요</Text>
              <Text variant="bodyMedium">{AI_CONSENT_PURPOSE}</Text>
            </View>

            <Text variant="bodySmall" colorToken="textSecondary">{AI_CONSENT_WITHDRAW_NOTE}</Text>
          </ScrollView>

          <Pressable
            onPress={() => setChecked((v) => !v)}
            accessibilityRole="checkbox"
            aria-checked={checked}
            accessibilityLabel={AI_CONSENT_CHECKBOX_LABEL}
            style={{ ...box, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
          >
            <Text variant="bodyMedium">{checked ? '☑' : '☐'}</Text>
            <Text variant="bodyMedium" style={{ flex: 1 }}>{AI_CONSENT_CHECKBOX_LABEL}</Text>
          </Pressable>

          {failed ? (
            <Text variant="bodySmall" style={{ color: theme.textSecondary }}>
              저장하지 못했습니다. 잠시 뒤 다시 시도해 주세요. 동의는 기록되지 않았습니다.
            </Text>
          ) : null}

          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="나중에" style={{ ...box, flex: 1 }}>
              <Text variant="bodyMedium" style={{ textAlign: 'center' }}>나중에</Text>
            </Pressable>
            <Pressable
              onPress={() => void agree()}
              disabled={!checked || busy}
              accessibilityRole="button"
              accessibilityLabel="동의하고 계속"
              aria-disabled={!checked || busy}
              style={{ ...box, flex: 1, backgroundColor: checked && !busy ? theme.textPrimary : theme.border }}
            >
              <Text
                variant="bodyMedium"
                style={{ textAlign: 'center', color: checked && !busy ? theme.background : theme.textSecondary }}
              >
                {busy ? '저장 중…' : '동의하고 계속'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
