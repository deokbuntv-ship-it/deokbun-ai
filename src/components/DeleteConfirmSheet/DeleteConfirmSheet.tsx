import { StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { spacing } from '@/theme';

// 삭제 확인 — 상담 기록과 보고서가 같은 모양으로 묻는다. 계정 탈퇴 화면과 같은 순서로, **무엇이 지워지고
// 무엇이 남는지**를 버튼보다 먼저 보여 준다. 되돌릴 수 없으므로 진행 중에는 닫히지 않는다(반쯤 지운 채
// 사라지는 화면이 없게).
type DeleteConfirmSheetProps = {
  visible: boolean;
  title: string;
  /** What goes and what stays — one short line each. */
  lines: readonly string[];
  confirmLabel: string;
  busy: boolean;
  /** Shown when the delete did not go through — nothing was deleted. */
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
};

export function DeleteConfirmSheet({
  visible,
  title,
  lines,
  confirmLabel,
  busy,
  error,
  onConfirm,
  onClose,
}: DeleteConfirmSheetProps) {
  const close = () => {
    if (!busy) onClose();
  };
  return (
    <BottomSheet
      visible={visible}
      onClose={close}
      title={title}
      footer={
        <View style={styles.actions}>
          <Button label={confirmLabel} variant="danger" radius="lg" loading={busy} onPress={onConfirm} />
          <Button label="취소" variant="secondary" radius="lg" disabled={busy} onPress={close} />
        </View>
      }
    >
      <View style={styles.body}>
        {lines.map((line) => (
          <Text key={line} variant="bodyMedium" colorToken="textSecondary">
            {line}
          </Text>
        ))}
        {error ? (
          <Text variant="bodySmall" colorToken="danger" accessibilityRole="alert">
            {error}
          </Text>
        ) : null}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing.sm },
  actions: { gap: spacing.sm },
});
