import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import {
  consultationSubjectService,
  isSavedSubjectId,
  type ConsultationSubjectRecord,
} from '@/features/consultation';
import {
  BirthInfoSummary,
  DerivedFactsSection,
  FortuneCycleSection,
  MansePillarsGrid,
  type ManseBirthDisplay,
  type ManseHourStatus,
  type ManseView,
  type PillarView,
} from '@/features/manse';

type ManseStatus = 'loading' | 'ready' | 'error' | 'invalid';

// ---- Shell ManseView builders (APP-28B) -----------------------------------
// These map the Saved Subject's RAW input into the presentation view model.
// They perform NO saju calculation: pillar values are always null and the
// aggregate status is always 'pending' (awaiting ENGINE integration, APP-28C).

function toBirthDisplay(record: ConsultationSubjectRecord): ManseBirthDisplay {
  const birthInfo = record.birthInfo;
  return {
    displayName: record.displayName,
    isSelf: record.isSelf,
    relationship: record.relationship,
    gender: birthInfo.gender,
    calendarType: birthInfo.calendarType,
    lunarMonthType: birthInfo.lunarMonthType,
    birthYear: birthInfo.birthYear,
    birthMonth: birthInfo.birthMonth,
    birthDay: birthInfo.birthDay,
    birthTimeAccuracy: birthInfo.birthTimeAccuracy,
    birthHour: birthInfo.birthHour,
    birthMinute: birthInfo.birthMinute,
    approximateTimePeriod: birthInfo.approximateTimePeriod,
    birthPlace: birthInfo.birthPlace,
  };
}

function emptyPillar(columnLabel: string): PillarView {
  return {
    columnLabel,
    heavenlyStem: null,
    earthlyBranch: null,
    ganzhiLabel: null,
    yinYang: null,
    element: null,
  };
}

// Hour presentation derived ONLY from the raw accuracy field (not a calculation):
// unknown/approximate are permanent truths about the input; exact stays 'pending'
// because resolving the hour pillar itself requires the ENGINE (APP-28C).
function shellHourStatus(
  accuracy: ManseBirthDisplay['birthTimeAccuracy'],
): ManseHourStatus {
  if (accuracy === 'unknown') {
    return 'unknown';
  }
  if (accuracy === 'approximate') {
    return 'approximate';
  }
  return 'pending';
}

function buildShellManseView(record: ConsultationSubjectRecord): ManseView {
  const birth = toBirthDisplay(record);
  return {
    birth,
    aggregateStatus: 'pending',
    hourStatus: shellHourStatus(birth.birthTimeAccuracy),
    pillars: {
      hour: emptyPillar('시'),
      day: emptyPillar('일'),
      month: emptyPillar('월'),
      year: emptyPillar('년'),
    },
    derivedFactsAvailable: false,
    fortuneCycleAvailable: false,
  };
}

export default function SubjectManseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ subjectId?: string }>();
  const subjectId =
    typeof params.subjectId === 'string' ? params.subjectId : undefined;

  const [view, setView] = useState<ManseView | null>(null);
  const [status, setStatus] = useState<ManseStatus>('loading');

  // Discards stale responses (unmount / manual retry). Same pattern as history.
  const loadTokenRef = useRef(0);

  // READ ONLY: this screen never calls updateSubject/updateBirthInfo or mutates
  // the draft/conversation, so opening it does not change which subject is
  // "진행 중" nor affect resume/new/history behavior.
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
        setView(buildShellManseView(record));
        setStatus('ready');
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
    <Screen>
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

  return (
    <Screen>
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

            <DerivedFactsSection available={view.derivedFactsAvailable} />

            <FortuneCycleSection available={view.fortuneCycleAvailable} />

            <Button
              label="뒤로"
              variant="secondary"
              onPress={() => router.back()}
            />
          </Stack>
        </View>
      </ScrollView>
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
