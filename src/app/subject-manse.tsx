import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { DetailBottomNav } from '@/components/DetailBottomNav';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import {
  consultationSubjectService,
  isSavedSubjectId,
} from '@/features/consultation';
import {
  BirthInfoSummary,
  DerivedFactsSection,
  FortuneCycleSection,
  MansePillarsGrid,
  getManseView,
  type ManseView,
} from '@/features/manse';

type ManseStatus = 'loading' | 'ready' | 'error' | 'invalid';

export default function SubjectManseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ subjectId?: string }>();
  const subjectId =
    typeof params.subjectId === 'string' ? params.subjectId : undefined;

  const [view, setView] = useState<ManseView | null>(null);
  const [status, setStatus] = useState<ManseStatus>('loading');

  // Discards stale responses (unmount / manual retry / subject switch).
  const loadTokenRef = useRef(0);

  // READ ONLY: getSubject to load the current subject, then the ENGINE-backed
  // manse view. This screen never calls updateSubject/updateBirthInfo or mutates
  // the draft/conversation, so "진행 중" / resume / new / history are unaffected.
  const loadManse = useCallback(() => {
    if (subjectId === undefined || !isSavedSubjectId(subjectId)) {
      setStatus('invalid');
      return;
    }

    const token = loadTokenRef.current + 1;
    loadTokenRef.current = token;
    setStatus('loading');

    consultationSubjectService
      .getSubject(subjectId)
      .then((record) => {
        if (token !== loadTokenRef.current) {
          return;
        }
        if (record === null) {
          setStatus('error');
          return;
        }
        // ENGINE-backed computation (Saved Subject manse = LIVE from current
        // birthInfo). getManseView never throws; ENGINE failures surface as an
        // 'unavailable' ManseView, not a screen error.
        return getManseView(record).then((manseView) => {
          if (token !== loadTokenRef.current) {
            return;
          }
          setView(manseView);
          setStatus('ready');
        });
      })
      .catch(() => {
        if (token !== loadTokenRef.current) {
          return;
        }
        setStatus('error');
      });
  }, [subjectId]);

  useEffect(() => {
    loadManse();
  }, [loadManse]);

  const renderStatusCard = (message: string, withRetry: boolean) => (
    <Screen frame>
      <Stack style={{ flex: 1, paddingTop: 24 }} align="center" gap="md">
        <Card>
          <Text variant="bodyMedium" colorToken="textSecondary">
            {message}
          </Text>
        </Card>
        {withRetry ? (
          <Button label="다시 시도" variant="secondary" onPress={loadManse} />
        ) : null}
        <Button
          label="뒤로"
          variant="secondary"
          onPress={() => router.back()}
        />
      </Stack>
    </Screen>
  );

  if (status === 'invalid') {
    return renderStatusCard('유효하지 않은 대상입니다.', false);
  }

  if (status === 'loading') {
    return renderStatusCard('만세력을 불러오는 중입니다...', false);
  }

  if (status === 'error' || view === null) {
    return renderStatusCard('만세력을 불러오지 못했습니다.', true);
  }

  const showEditCta = view.aggregateStatus === 'unavailable';

  return (
    <Screen frame>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          <Stack gap="xxl">
            <Stack gap="xs">
              <Text variant="headingLarge">만세력</Text>
              <Text variant="bodyMedium" colorToken="textSecondary">
                {view.birth.displayName} 님의 사주 명식입니다.
              </Text>
            </Stack>

            <BirthInfoSummary birth={view.birth} />

            <MansePillarsGrid
              pillars={view.pillars}
              aggregateStatus={view.aggregateStatus}
              hourStatus={view.hourStatus}
              unavailableReason={view.unavailableReason}
            />

            {view.aggregateStatus !== 'unavailable' ? (
              <>
                {/* 지장간 is rendered inside MansePillarsGrid's Card (connected to
                    each 지지). Here: 오행 분포 seam (ENGINE-11B, pending) + 대운/세운. */}
                <DerivedFactsSection available={false} />
                <FortuneCycleSection available={view.fortuneCycleAvailable} />
              </>
            ) : null}

            {showEditCta ? (
              <Button
                label="대상 편집"
                variant="secondary"
                onPress={() =>
                  router.push({
                    pathname: '/birth-info',
                    params: { subjectId },
                  })
                }
              />
            ) : null}

            <Button
              label="뒤로"
              variant="secondary"
              onPress={() => router.back()}
            />
          </Stack>
        </View>
      </ScrollView>
      <DetailBottomNav active="my" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 24,
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
});
