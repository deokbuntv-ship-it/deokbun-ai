import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { EngineNotice } from '@/components/EngineNotice';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import { useConsultationDraft } from '@/features/consultation';
import type { FortunePeriod } from '@/features/fortune';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/theme';

// Home — recurring-use dashboard (§6–§10). Fortune discovery + AI 상담 entry are
// the priority; content/famous are lower. No fabricated fortune anywhere — the
// hero shows a truthful engine-unavailable state instead of a fake score.

type QuickEntry = {
  label: string;
  period?: FortunePeriod;
  relationship?: boolean;
};

// User-language goals (§8) — NOT academic engine names. These are navigation
// shortcuts into the 운세 / 인연 tabs.
const QUICK_ENTRIES: QuickEntry[] = [
  { label: '오늘운세', period: 'today' },
  { label: '재물운', period: 'today' },
  { label: '연애·인연', period: 'today' },
  { label: '사업·직장', period: 'today' },
  { label: '건강', period: 'today' },
  { label: '월간운세', period: 'month' },
  { label: '올해운세', period: 'year' },
  { label: '궁합', relationship: true },
];

// Suggested AI questions (§10) — entry prompts only; they open AI 상담, they do
// NOT display fabricated answers.
const AI_QUESTIONS = [
  '오늘 계약해도 괜찮을까?',
  '이번 달 재물 흐름은?',
  '이직하기 좋은 시기는?',
  '이 사람과 관계 흐름은?',
];

const HERO_CATEGORIES = ['재물', '일', '관계', '건강'];

export default function HomeScreen() {
  const router = useRouter();
  const { draft } = useConsultationDraft();
  const subject = draft.subject;

  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const guideInitial = subject?.displayName?.trim().slice(0, 1) ?? '덕';

  const goQuick = (entry: QuickEntry) => {
    if (entry.relationship) {
      router.push('/relationship');
      return;
    }
    router.push({
      pathname: '/fortune',
      params: { period: entry.period ?? 'today' },
    });
  };

  return (
    <Screen padded>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          <Stack gap="xxl">
            {/* Top bar: brand + active-subject switch */}
            <Stack
              direction="row"
              gap="sm"
              align="center"
              style={styles.rowBetween}
            >
              <Text variant="headingLarge">덕분AI</Text>
              <Button
                label={subject ? '대상 변경' : '대상 등록'}
                variant="tertiary"
                onPress={() => router.push('/consult')}
              />
            </Stack>

            {/* Greeting (active subject visible) */}
            <Stack gap="xs">
              <Text variant="displayMedium">
                {subject ? `${subject.displayName}님, 반가워요` : '반가워요'}
              </Text>
              <Text variant="bodyMedium" colorToken="textSecondary">
                {subject
                  ? '오늘의 흐름을 확인하고 하루를 준비해 보세요.'
                  : '분석할 대상을 먼저 등록하면 맞춤 운세와 상담을 시작할 수 있어요.'}
              </Text>
            </Stack>

            {/* Hero — 오늘의 운세 (truthful engine state, no fake score) */}
            <Card elevation="md">
              <Stack gap="md">
                <Stack direction="row" gap="md" align="center">
                  <View
                    style={[
                      styles.guide,
                      {
                        backgroundColor: theme.accentSurface,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text variant="headingMedium" colorToken="primary">
                      {guideInitial}
                    </Text>
                  </View>
                  <Stack gap="xs" style={styles.flex1}>
                    <Text variant="headingMedium">오늘의 운세</Text>
                    <Text variant="bodySmall" colorToken="textSecondary">
                      {subject
                        ? `${subject.displayName}님의 오늘`
                        : '대상을 등록하면 맞춤 운세를 준비해요'}
                    </Text>
                  </Stack>
                </Stack>

                <EngineNotice
                  title="운세 엔진 연결 준비 중"
                  message="정확한 해석을 위해 운세 계산 엔진을 연결하고 있어요. 준비가 완료되면 이곳에서 오늘의 흐름을 확인할 수 있어요."
                  footnote="임의의 점수나 문구는 표시하지 않습니다."
                />

                <Stack direction="row" gap="sm" style={styles.chipWrap}>
                  {HERO_CATEGORIES.map((label) => (
                    <Chip key={label} label={label} />
                  ))}
                </Stack>

                <Button
                  label="오늘 운세 자세히 보기"
                  onPress={() =>
                    router.push({
                      pathname: '/fortune',
                      params: { period: 'today' },
                    })
                  }
                />
              </Stack>
            </Card>

            {/* Quick fortune entry (§8) */}
            <Stack gap="sm">
              <Text variant="headingMedium">빠른 운세</Text>
              <Stack direction="row" gap="sm" style={styles.chipWrap}>
                {QUICK_ENTRIES.map((entry) => (
                  <Chip
                    key={entry.label}
                    label={entry.label}
                    onPress={() => goQuick(entry)}
                  />
                ))}
              </Stack>
            </Stack>

            {/* Today's key points (§9) — truthful until real data */}
            <Stack gap="sm">
              <Text variant="headingMedium">오늘의 핵심 포인트</Text>
              <Card>
                <Stack gap="md">
                  <Text variant="bodyMedium" colorToken="textSecondary">
                    핵심 포인트(좋은 흐름·주의할 점 등)는 운세 엔진 연결 후
                    실제 분석 결과가 준비되면 제공됩니다.
                  </Text>
                  <Button
                    label="AI에게 먼저 물어보기"
                    variant="secondary"
                    onPress={() => router.push('/consult')}
                  />
                </Stack>
              </Card>
            </Stack>

            {/* AI question entry (§10) */}
            <Stack gap="sm">
              <Text variant="headingMedium">AI에게 물어보기</Text>
              <Stack direction="row" gap="sm" style={styles.chipWrap}>
                {AI_QUESTIONS.map((q) => (
                  <Chip
                    key={q}
                    label={q}
                    onPress={() => router.push('/consult')}
                  />
                ))}
              </Stack>
            </Stack>

            {/* Lower-priority discovery (§35/§36) */}
            <Card elevation="sm">
              <Stack gap="md">
                <Text variant="headingMedium">읽을거리</Text>
                <Text variant="bodySmall" colorToken="textSecondary">
                  사주·명리·운세·유명인 이야기를 만나보세요.
                </Text>
                <Stack direction="row" gap="sm" style={styles.chipWrap}>
                  <Button
                    label="콘텐츠"
                    variant="secondary"
                    onPress={() => router.push('/content')}
                  />
                  <Button
                    label="유명인 사주"
                    variant="secondary"
                    onPress={() => router.push('/famous')}
                  />
                </Stack>
              </Stack>
            </Card>

            {/* Disclaimer */}
            <Text variant="caption" colorToken="textSecondary">
              덕분AI의 해석은 자기이해와 의사결정을 돕기 위한 참고 정보이며,
              의료·법률·투자 등 중대한 판단의 단독 근거로 사용하지 않습니다.
            </Text>
          </Stack>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  rowBetween: {
    justifyContent: 'space-between',
  },
  chipWrap: {
    flexWrap: 'wrap',
  },
  flex1: {
    flex: 1,
  },
  guide: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
