import { useState } from 'react';
import { Modal, Pressable, ScrollView, TextInput, View } from 'react-native';

import { Text } from '@/components/Text';
import {
  REPORT_ACK_TEXT,
  REPORT_DETAIL_MAX,
  REPORT_REASONS,
  REPORT_REASON_LABEL,
  type ReportReason,
} from '@/features/intelligence/aiContentReport';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

// AI 답변 신고 시트 — **앱을 벗어나지 않고** 신고한다 (구글 AI 생성 콘텐츠 정책).
//
// ⚠ 톤 규칙: 사용자는 이미 불편한 상태로 들어온다. 겁주지 않고, 과장하지 않고,
//   지키지 못할 약속(개별 회신·처리 기한)을 하지 않는다.
//
// ⚠ 실패를 성공처럼 보이지 않는다. 저장이 실패하면 "받았습니다" 를 띄우지 않는다 —
//   그건 거짓말이고, 사용자는 신고했다고 믿은 채 떠난다.
export type SubmitResult = 'ok' | 'already' | 'auth' | 'failed';

export function AiReportSheet({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: ReportReason, detail: string) => Promise<SubmitResult>;
}) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [detail, setDetail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<SubmitResult | null>(null);

  const close = () => {
    setReason(null);
    setDetail('');
    setDone(null);
    setBusy(false);
    onClose();
  };

  const send = async () => {
    if (!reason || busy) return;
    setBusy(true);
    setDone(await onSubmit(reason, detail));
    setBusy(false);
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
          accessibilityLabel="AI 답변 신고"
          style={{
            backgroundColor: theme.background,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
            padding: spacing.lg,
            gap: spacing.md,
            maxHeight: '85%',
          }}
        >
          {done === null ? (
            <ScrollView contentContainerStyle={{ gap: spacing.md }}>
              <Text variant="headingMedium">이 답변을 신고합니다</Text>
              <Text variant="bodySmall" colorToken="textSecondary">
                어떤 점이 문제였는지 알려 주시면 확인하는 데 도움이 됩니다.
              </Text>

              <View style={{ gap: spacing.sm }}>
                {REPORT_REASONS.map((r) => (
                  <Pressable
                    key={r}
                    onPress={() => setReason(r)}
                    accessibilityRole="radio"
                    aria-checked={reason === r}
                    accessibilityLabel={REPORT_REASON_LABEL[r]}
                    style={{
                      ...box,
                      borderColor: reason === r ? theme.textPrimary : theme.border,
                      borderWidth: reason === r ? 2 : 1,
                    }}
                  >
                    <Text variant="bodyMedium">{REPORT_REASON_LABEL[r]}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={{ gap: spacing.xs }}>
                <Text variant="bodySmall" colorToken="textSecondary">
                  더 알려 주실 내용이 있다면 적어 주세요 (선택)
                </Text>
                <TextInput
                  accessibilityLabel="신고 상세 설명"
                  placeholder="선택 입력"
                  placeholderTextColor={theme.textSecondary}
                  value={detail}
                  onChangeText={(t) => setDetail(t.slice(0, REPORT_DETAIL_MAX))}
                  multiline
                  style={{ ...box, minHeight: 80, color: theme.textPrimary, textAlignVertical: 'top' }}
                />
                {/* ⚠ 개인정보를 적지 말라고 먼저 알린다. 신고 칸은 사람들이 전화번호를 적는 자리다. */}
                <Text variant="caption" colorToken="textSecondary">
                  이름·연락처 같은 개인정보는 적지 말아 주세요. {detail.length}/{REPORT_DETAIL_MAX}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="취소" style={{ ...box, flex: 1 }}>
                  <Text variant="bodyMedium" style={{ textAlign: 'center' }}>취소</Text>
                </Pressable>
                <Pressable
                  onPress={() => void send()}
                  disabled={!reason || busy}
                  accessibilityRole="button"
                  accessibilityLabel="신고 보내기"
                  aria-disabled={!reason || busy}
                  style={{
                    ...box,
                    flex: 1,
                    backgroundColor: reason && !busy ? theme.textPrimary : theme.border,
                  }}
                >
                  <Text
                    variant="bodyMedium"
                    style={{ textAlign: 'center', color: reason && !busy ? theme.background : theme.textSecondary }}
                  >
                    {busy ? '보내는 중…' : '신고 보내기'}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          ) : (
            <View style={{ gap: spacing.md }}>
              <Text variant="headingMedium">
                {done === 'ok' ? '신고를 받았습니다' : done === 'already' ? '이미 접수된 신고입니다' : '보내지 못했습니다'}
              </Text>
              <Text variant="bodySmall" colorToken="textSecondary">
                {done === 'ok'
                  ? REPORT_ACK_TEXT
                  : done === 'already'
                    ? '이 답변은 이미 신고해 주셨습니다. 확인 중입니다.'
                    : done === 'auth'
                      ? '로그인 상태를 확인한 뒤 다시 시도해 주세요.'
                      : '잠시 뒤 다시 시도해 주세요. 신고는 저장되지 않았습니다.'}
              </Text>
              <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="닫기" style={box}>
                <Text variant="bodyMedium" style={{ textAlign: 'center' }}>닫기</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
