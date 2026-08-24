import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { BottomSheet } from '@/components/BottomSheet';
import { LineIcon } from '@/components/LineIcon';
import { StateView } from '@/components/StateView';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import {
  useConsultationDraft,
  useConsultationSubjects,
  type ConsultationSubjectRecord,
} from '@/features/consultation';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

// DESIGN_FREEZE_FINAL C08 — 분석 대상자 선택. Rows H58; the selected person is marked with a 1.5px ink
// border + check, NOT a background fill — background colour is a scarce budget (max two pastels per
// screen) and selection does not need to spend it.
//
// Lists the user's real saved subjects (no hardcoded 나/배우자/아이). Selecting applies the subject +
// birthInfo snapshot to the consultation draft, exactly as before; only the presentation changed.
type PersonSelectorSheetProps = {
  visible: boolean;
  onClose: () => void;
  // true when the sheet was opened to START a consultation (proceed to chat on select);
  // false/omitted when used as the header subject-switcher (just apply + close). This is
  // an explicit signal, NOT inferred from global pending state, so switching a subject
  // can never be misrouted into a new consultation. §21/§28.
  startConsultationOnSelect?: boolean;
};

export function PersonSelectorSheet({
  visible,
  onClose,
  startConsultationOnSelect = false,
}: PersonSelectorSheetProps) {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  const { draft, updateSubject, updateBirthInfo } = useConsultationDraft();
  const { subjects, status, reload } = useConsultationSubjects();

  useEffect(() => {
    if (visible) {
      reload();
    }
  }, [visible, reload]);

  const selectSubject = (record: ConsultationSubjectRecord) => {
    updateSubject({
      id: record.id,
      displayName: record.displayName,
      relationship: record.relationship,
    });
    updateBirthInfo(record.birthInfo);
    onClose();
    // Proceed into chat only when the sheet was opened to start a consultation; chat
    // consumes any pending question. The header switcher just applies + closes. §28.
    if (startConsultationOnSelect) {
      router.push({ pathname: '/chat', params: { startNew: '1' } });
    }
  };

  const addSubject = () => {
    onClose();
    router.push('/birth-info');
  };

  const addButton = (
    <Pressable
      onPress={addSubject}
      accessibilityRole="button"
      accessibilityLabel="새 대상 추가"
      style={({ pressed }) => [
        styles.addBtn,
        { borderColor: theme.actionSecondaryBorder, backgroundColor: pressed ? theme.backgroundSelected : 'transparent' },
      ]}
    >
      <Text variant="bodyLarge" colorToken="textSecondary" style={styles.addLabel}>
        ＋ 새 대상 추가
      </Text>
    </Pressable>
  );

  return (
    <BottomSheet visible={visible} onClose={onClose} title="분석 대상자 선택">
      {status === 'loading' ? (
        <StateView kind="loading" skeletonLines={3} />
      ) : status === 'error' ? (
        <StateView
          kind="error"
          description="대상을 불러오지 못했어요. 네트워크를 확인하고 다시 시도해 주세요."
          actionLabel="다시 시도"
          onAction={reload}
        />
      ) : subjects.length === 0 ? (
        <StateView
          kind="empty"
          emoji="👥"
          title="아직 등록한 사람이 없어요"
          description="가족이나 친구를 등록하면 그 사람의 사주도 보고, 궁합도 볼 수 있어요."
        />
      ) : (
        subjects.map((subject) => {
          const selected = draft.subject?.id === subject.id;
          return (
            <Pressable
              key={subject.id}
              onPress={() => selectSubject(subject)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.row,
                {
                  borderColor: selected ? theme.brandPrimary : theme.border,
                  borderWidth: selected ? 1.5 : 1,
                  backgroundColor: pressed ? theme.backgroundSelected : theme.surface,
                },
              ]}
            >
              <Avatar label={subject.displayName} selected={selected} size={38} />
              <Stack gap="xs" style={styles.rowText}>
                <Text variant="bodyLarge" numberOfLines={1} style={styles.rowName}>
                  {subject.displayName}
                  {subject.isSelf ? ' (본인)' : ''}
                </Text>
                {subject.relationship ? (
                  <Text variant="bodySmall" colorToken="textSecondary" numberOfLines={1}>
                    {subject.relationship}
                  </Text>
                ) : null}
              </Stack>
              {selected ? <LineIcon name="check" size={20} color={theme.brandPrimary} strokeWidth={2} /> : null}
            </Pressable>
          );
        })
      )}
      {addButton}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.xl,
    minHeight: 58,
  },
  rowText: { flex: 1, minWidth: 0 },
  rowName: { fontWeight: '600' },
  addBtn: {
    marginTop: spacing.xs,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderStyle: 'dashed',
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addLabel: { fontWeight: '700' },
});
