import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { DetailBottomNav } from '@/components/DetailBottomNav';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { StateView } from '@/components/StateView';
import { Text } from '@/components/Text';
import { colors, radius, spacing } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useConsumerLayout } from '@/hooks/useConsumerLayout';
import {
  useConsultationDraft,
  useConsultationSubjects,
  type ConsultationSubjectRecord,
} from '@/features/consultation';

// D11 분석 대상자 — DESIGN_FREEZE_FINAL.
//
// Selection is shown with a 1.5px ink border + a 선택됨 badge and NOT a coloured fill: the pastel
// budget is two families per screen and selection does not need to spend one.
//
// Action hierarchy is Primary 1 / Secondary 1 / Tertiary 3. The old equal-weight button grid made
// every action look equally likely and broke at 360dp; here the two consultation actions lead and
// management is demoted to text.
//
// Subject CRUD, the canonical SELF record, and every route are unchanged — presentation only.
export default function SubjectsScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const { hPad, maxWidth } = useConsumerLayout();
  const { draft, updateSubject, updateBirthInfo } = useConsultationDraft();
  const { subjects, status, reload } = useConsultationSubjects();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const applySubjectToDraft = (record: ConsultationSubjectRecord) => {
    updateSubject({
      id: record.id,
      displayName: record.displayName,
      relationship: record.relationship,
    });
    updateBirthInfo(record.birthInfo);
  };

  const openConsultation = (record: ConsultationSubjectRecord) => {
    if (draft.subject?.id !== record.id) {
      applySubjectToDraft(record);
    }
    router.push('/chat');
  };

  const viewAsSubject = (record: ConsultationSubjectRecord) => {
    applySubjectToDraft(record);
    router.replace('/');
  };

  const manageSubject = (record: ConsultationSubjectRecord) => {
    router.push({ pathname: '/birth-info', params: { subjectId: record.id } });
  };

  const openHistory = (record: ConsultationSubjectRecord) => {
    router.push({ pathname: '/subject-history', params: { subjectId: record.id } });
  };

  const openManse = (record: ConsultationSubjectRecord) => {
    router.push({ pathname: '/subject-manse', params: { subjectId: record.id } });
  };

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/my');
  };

  const renderList = () => {
    if (status === 'loading') {
      return <StateView kind="loading" skeletonLines={5} />;
    }
    if (status === 'error') {
      return (
        <StateView
          kind="error"
          description="대상을 불러오지 못했어요. 네트워크를 확인하고 다시 시도해 주세요."
          actionLabel="다시 시도"
          onAction={reload}
        />
      );
    }
    // The SELF subject always exists once onboarding completes, so "only me" is the real empty state
    // for this screen — the user has not added anyone else yet.
    if (subjects.length === 0 || (subjects.length === 1 && subjects[0].isSelf)) {
      return (
        <Stack gap="md">
          {subjects.map((subject) => renderCard(subject))}
          <StateView
            kind="empty"
            emoji="👥"
            title="아직 등록한 사람이 없어요"
            description="가족이나 친구를 등록하면 그 사람의 사주도 보고, 궁합도 볼 수 있어요."
          />
        </Stack>
      );
    }
    return <Stack gap="md">{subjects.map((subject) => renderCard(subject))}</Stack>;
  };

  const renderCard = (subject: ConsultationSubjectRecord) => {
    const isCurrent = draft.subject?.id === subject.id;
    return (
      <Card
        key={subject.id}
        radius="xl"
        style={isCurrent ? { borderColor: theme.brandPrimary, borderWidth: 1.5 } : undefined}
      >
        <Stack gap="md">
          <Stack direction="row" gap="md" align="center">
            <Avatar label={subject.displayName} selected={isCurrent} size={44} />
            <Stack gap="xs" style={styles.flex1}>
              <Text variant="bodyLarge" style={styles.name} numberOfLines={1} ellipsizeMode="tail">
                {subject.displayName}
                {subject.isSelf ? ' (본인)' : ''}
              </Text>
              {subject.relationship ? (
                <Text variant="bodySmall" colorToken="textSecondary" numberOfLines={1}>
                  {subject.relationship}
                </Text>
              ) : null}
            </Stack>
            {isCurrent ? (
              <View style={[styles.selectedChip, { backgroundColor: theme.backgroundSelected }]}>
                <Text variant="caption" colorToken="textSecondary" style={styles.name}>
                  선택됨
                </Text>
              </View>
            ) : null}
          </Stack>

          {/* Primary 1 / Secondary 1 */}
          <Button label="상담 열기" radius="lg" onPress={() => openConsultation(subject)} />
          {!isCurrent ? (
            <Button label="이 사람으로 보기" variant="secondary" radius="lg" onPress={() => viewAsSubject(subject)} />
          ) : null}

          {/* Tertiary 3 — quiet, wrapping, never a grid of equal-weight buttons. */}
          <View style={styles.tertiaryRow}>
            <Button label="상담 기록" variant="tertiary" onPress={() => openHistory(subject)} />
            <Text variant="bodySmall" colorToken="textMuted">·</Text>
            <Button label="만세력" variant="tertiary" onPress={() => openManse(subject)} />
            <Text variant="bodySmall" colorToken="textMuted">·</Text>
            <Button label="관리" variant="tertiary" onPress={() => manageSubject(subject)} />
          </View>
        </Stack>
      </Card>
    );
  };

  return (
    <Screen padded={false}>
      <AppHeader title="분석 대상자" centerTitle showBack onBack={handleBack} showBell />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingHorizontal: hPad }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.wrapper, { maxWidth }]}>
          <Stack gap="lg">
            {renderList()}
            <Button label="＋ 새 대상 추가" radius="lg" onPress={() => router.push('/birth-info')} />
          </Stack>
        </View>
      </ScrollView>
      {/* Reached from MY, so the bar keeps MY active (freeze D11). */}
      <DetailBottomNav active="my" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingTop: spacing.md,
    paddingBottom: 40,
    alignItems: 'center',
  },
  wrapper: {
    width: '100%',
    alignSelf: 'center',
  },
  flex1: { flex: 1, minWidth: 0 },
  name: { fontWeight: '700' },
  selectedChip: { borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  tertiaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' },
});
