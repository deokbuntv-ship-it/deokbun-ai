import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { EngineNotice } from '@/components/EngineNotice';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { StatusBadge } from '@/components/StatusBadge';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import { useConsultationDraft } from '@/features/consultation';
import {
  ANALYSIS_BASIS_LABELS,
  FORTUNE_CATEGORY_LABELS,
  FORTUNE_CATEGORY_ORDER,
  FORTUNE_PERIOD_LABELS,
  FORTUNE_PERIOD_ORDER,
  fortuneService,
  type FortunePeriod,
  type FortuneViewState,
} from '@/features/fortune';

// 운세 tab — fortune overview foundation (§11–§17). The canonical engine is not
// connected, so every period renders a truthful engine-unavailable state; no
// score/text is fabricated. The category structure, analysis-basis (§16) and
// expert-view (§17) seams are laid out ready for real canonical data.
const PERIOD_MESSAGE: Record<FortunePeriod, string> = {
  today: '오늘의 운세는 운세 엔진 연결 후 실제 분석 결과가 준비되면 표시됩니다.',
  week: '이번 주 운세는 운세 엔진 연결 후 실제 분석 결과가 준비되면 표시됩니다.',
  month: '이번 달 운세는 운세 엔진 연결 후 실제 분석 결과가 준비되면 표시됩니다.',
  year: '올해 운세는 운세 엔진 연결 후 실제 분석 결과가 준비되면 표시됩니다.',
};

function isFortunePeriod(v: string | undefined): v is FortunePeriod {
  return (
    v === 'today' || v === 'week' || v === 'month' || v === 'year'
  );
}

export default function FortuneScreen() {
  const router = useRouter();
  const { draft } = useConsultationDraft();
  const subject = draft.subject;

  // Optional deep-link period (e.g. home "월간운세" → /fortune?period=month).
  const params = useLocalSearchParams<{ period?: string }>();
  const [period, setPeriod] = useState<FortunePeriod>(
    isFortunePeriod(params.period) ? params.period : 'today',
  );
  const [state, setState] = useState<FortuneViewState>({ status: 'loading' });
  const [showBasis, setShowBasis] = useState(false);

  // Fortune seam: resolves per (subject, period). Returns 'engine_unavailable'
  // until the engine ships — the APP never calculates here.
  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    fortuneService.getFortune(period, subject?.id ?? null).then((next) => {
      if (active) {
        setState(next);
      }
    });
    return () => {
      active = false;
    };
  }, [period, subject?.id]);

  return (
    <Screen padded>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wrapper}>
          <Stack gap="xl">
            {/* Header + active-subject selector */}
            <Stack gap="xs">
              <Text variant="displayMedium">운세</Text>
              <Stack
                direction="row"
                gap="sm"
                align="center"
                style={styles.rowBetween}
              >
                <Text variant="bodyMedium" colorToken="textSecondary">
                  분석 대상: {subject?.displayName ?? '미선택'}
                </Text>
                <Button
                  label={subject ? '대상 변경' : '대상 선택'}
                  variant="tertiary"
                  onPress={() => router.push('/consult')}
                />
              </Stack>
            </Stack>

            {/* Time period tabs */}
            <Stack direction="row" gap="sm" style={styles.periodRow}>
              {FORTUNE_PERIOD_ORDER.map((p) => (
                <Chip
                  key={p}
                  label={FORTUNE_PERIOD_LABELS[p]}
                  selected={p === period}
                  onPress={() => setPeriod(p)}
                />
              ))}
            </Stack>

            {/* State body */}
            {state.status === 'loading' ? (
              <Card>
                <Text variant="bodyMedium" colorToken="textSecondary">
                  운세 정보를 확인하고 있어요.
                </Text>
              </Card>
            ) : state.status === 'ready' ? (
              // Real presentation renders here once the engine ships. Not
              // reachable yet — intentionally no fabricated fallback.
              <Card>
                <Text variant="bodyMedium" colorToken="textSecondary">
                  {FORTUNE_PERIOD_LABELS[period]} 운세를 불러왔습니다.
                </Text>
              </Card>
            ) : (
              <EngineNotice
                title="운세 엔진 연결 준비 중"
                message={PERIOD_MESSAGE[period]}
                footnote="정확한 해석을 위해 임의의 점수나 문구를 표시하지 않습니다."
              />
            )}

            {/* Canonical category structure (labels only until real data). */}
            <Stack gap="sm">
              <Text variant="headingMedium">분석 항목</Text>
              <Card>
                <Stack gap="md">
                  {FORTUNE_CATEGORY_ORDER.map((key) => (
                    <Stack
                      key={key}
                      direction="row"
                      gap="sm"
                      align="center"
                      style={styles.rowBetween}
                    >
                      <Text variant="bodyMedium">
                        {FORTUNE_CATEGORY_LABELS[key]}
                      </Text>
                      <StatusBadge label="준비 중" tone="neutral" />
                    </Stack>
                  ))}
                </Stack>
              </Card>
            </Stack>

            {/* Analysis basis (§16) — expandable seam. */}
            <Stack gap="sm">
              <Button
                label={showBasis ? '분석 기준 닫기' : '이 운세는 어떻게 나오나요?'}
                variant="secondary"
                onPress={() => setShowBasis((v) => !v)}
              />
              {showBasis ? (
                <Card>
                  <Stack gap="sm">
                    <Text variant="bodyMedium">
                      운세는 다음 분석을 종합해 제공될 예정입니다.
                    </Text>
                    <Stack direction="row" gap="sm" style={styles.basisRow}>
                      <Chip label={ANALYSIS_BASIS_LABELS.myeongri} />
                      <Chip label={ANALYSIS_BASIS_LABELS.ziwei} />
                      <Chip label={ANALYSIS_BASIS_LABELS.synthesis} />
                    </Stack>
                    <Text variant="bodySmall" colorToken="textSecondary">
                      기문둔갑은 계약·이동처럼 시점과 선택이 중요한 질문에서 상담
                      시 활용됩니다. 매일의 운세에 항상 사용되지는 않습니다.
                    </Text>
                    <Text variant="caption" colorToken="textSecondary">
                      실제 분석 근거는 운세 엔진 연결 후 제공됩니다.
                    </Text>
                  </Stack>
                </Card>
              ) : null}
            </Stack>

            {/* Expert view seam (§17). */}
            <Stack
              direction="row"
              gap="sm"
              align="center"
              style={styles.rowBetween}
            >
              <Text variant="bodyMedium">전문 분석 보기</Text>
              <StatusBadge label="준비 중" tone="neutral" />
            </Stack>

            {/* AI follow-up (§9/§10 conversion). */}
            <Card>
              <Stack gap="md">
                <Text variant="bodyMedium">
                  더 궁금한 점은 AI 상담으로 물어볼 수 있어요.
                </Text>
                <Button
                  label="AI 상담 시작"
                  onPress={() => router.push('/consult')}
                />
              </Stack>
            </Card>
          </Stack>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  wrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  periodRow: {
    flexWrap: 'wrap',
  },
  basisRow: {
    flexWrap: 'wrap',
  },
  rowBetween: {
    justifyContent: 'space-between',
  },
});
