import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import {
  useConsultationDraft,
  useConsultationSubjects,
  type ConsultationSubjectRecord,
} from '@/features/consultation';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

// 06_PERSON_SELECTOR — 분석 대상자 선택 bottom sheet. Lists the user's real saved
// subjects (no hardcoded 나/배우자/아이). Selecting a person applies it to the
// consultation draft (subject + birthInfo snapshot), matching the existing
// consult flow. "새 대상자 추가" routes to the existing /birth-info entry.
type PersonSelectorSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function PersonSelectorSheet({ visible, onClose }: PersonSelectorSheetProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
  };

  const addSubject = () => {
    onClose();
    router.push('/birth-info');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable
          style={styles.backdrop}
          accessibilityLabel="닫기"
          onPress={onClose}
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.surface,
              paddingBottom: insets.bottom + spacing.lg,
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: '#C6C9D0' }]} />

          <Stack
            direction="row"
            align="center"
            style={styles.sheetHeader}
          >
            <Text variant="headingMedium" style={styles.sheetTitle}>
              분석 대상자 선택
            </Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="닫기" hitSlop={8}>
              <Text variant="headingMedium" colorToken="textSecondary">
                ✕
              </Text>
            </Pressable>
          </Stack>

          <ScrollView
            style={styles.list}
            contentContainerStyle={{ gap: spacing.md }}
            showsVerticalScrollIndicator={false}
          >
            {status === 'loading' ? (
              <Text variant="bodyMedium" colorToken="textSecondary">
                대상을 불러오는 중입니다...
              </Text>
            ) : status === 'error' ? (
              <Text variant="bodyMedium" colorToken="textSecondary">
                대상을 불러오지 못했습니다.
              </Text>
            ) : subjects.length === 0 ? (
              <Text variant="bodyMedium" colorToken="textSecondary">
                저장된 대상이 없습니다. 아래에서 새 대상자를 추가해 주세요.
              </Text>
            ) : (
              subjects.map((subject) => {
                const selected = draft.subject?.id === subject.id;
                return (
                  <Pressable
                    key={subject.id}
                    onPress={() => selectSubject(subject)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    style={[
                      styles.row,
                      {
                        borderColor: selected ? theme.primary : theme.border,
                        borderWidth: selected ? 1.5 : 1,
                        backgroundColor: theme.surface,
                      },
                    ]}
                  >
                    <Avatar label={subject.displayName} selected={selected} size={44} />
                    <Stack gap="xs" style={styles.rowText}>
                      <Text variant="bodyLarge" style={styles.rowName}>
                        {subject.displayName}
                        {subject.isSelf ? ' (본인)' : ''}
                      </Text>
                      {subject.relationship ? (
                        <Text variant="bodySmall" colorToken="textSecondary">
                          {subject.relationship}
                        </Text>
                      ) : null}
                    </Stack>
                    {selected ? (
                      <View style={[styles.check, { borderColor: theme.textSecondary }]}>
                        <Text
                          variant="bodySmall"
                          style={{ color: theme.textSecondary, fontWeight: '700' }}
                        >
                          ✓
                        </Text>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })
            )}

            <Pressable
              onPress={addSubject}
              accessibilityRole="button"
              style={[styles.addBtn, { backgroundColor: theme.backgroundSelected }]}
            >
              <Text variant="bodyLarge" style={styles.addLabel}>
                +  새 대상자 추가
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: 20,
    paddingTop: spacing.sm,
    maxHeight: '80%',
    // Soft UPWARD shadow so the sheet lifts off the dimmed screen (RN Web maps
    // shadow* to boxShadow). The shadows token helper only emits downward offsets.
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  sheetHeader: {
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  sheetTitle: {
    fontWeight: '700',
  },
  list: {
    flexGrow: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    minHeight: 72,
  },
  rowText: {
    flex: 1,
  },
  rowName: {
    fontWeight: '500',
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    marginTop: spacing.md,
    borderRadius: radius.xl,
    minHeight: 62,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addLabel: {
    fontWeight: '700',
  },
});
