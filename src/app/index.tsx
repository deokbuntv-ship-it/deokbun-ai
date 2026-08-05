import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';

type ConsultationMethod = {
  id: string;
  title: string;
  description: string;
};

const CONSULTATION_METHODS: ConsultationMethod[] = [
  {
    id: 'myeongrihak',
    title: '명리학',
    description: '타고난 성향과 장기적인 흐름',
  },
  {
    id: 'jamidusu',
    title: '자미두수',
    description: '삶의 영역별 구조와 변화',
  },
  {
    id: 'gimundungap',
    title: '기문둔갑',
    description: '특정 시점의 선택과 방향',
  },
];

const RECOMMENDED_TOPICS: string[] = [
  '나의 성향과 강점',
  '직업과 사업 방향',
  '재물 흐름',
  '인간관계',
  '중요한 결정과 시기',
];

export default function HomeScreen() {
  const router = useRouter();

  const handleStartConsultation = () => {
    router.push('/consult');
  };

  return (
    <Screen padded>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          <Stack gap="xxl">
            {/* 1. 상단 인사 영역 */}
            <Stack gap="xs">
              <Text variant="displayMedium">덕분AI</Text>
              <Text variant="bodyMedium" colorToken="textSecondary">
                세 가지 관점으로 더 깊게 보는 AI 상담
              </Text>
            </Stack>

            {/* 2. 메인 상담 시작 카드 */}
            <Card elevation="md">
              <Stack gap="md">
                <Text variant="headingMedium">새로운 상담을 시작해 보세요</Text>
                <Text variant="bodyMedium" colorToken="textSecondary">
                  명리학과 자미두수를 중심으로 분석하고, 질문에 따라 기문둔갑
                  관점을 더합니다.
                </Text>
                <Button label="상담 시작하기" onPress={handleStartConsultation} />
              </Stack>
            </Card>

            {/* 3. 상담 방식 소개 영역 */}
            <Stack gap="md">
              <Text variant="headingMedium">상담 방식 소개</Text>
              <Stack gap="sm">
                {CONSULTATION_METHODS.map((method) => (
                  <Card key={method.id} elevation="sm">
                    <Stack gap="xs">
                      <Text variant="bodyLarge">{method.title}</Text>
                      <Text variant="bodySmall" colorToken="textSecondary">
                        {method.description}
                      </Text>
                    </Stack>
                  </Card>
                ))}
              </Stack>
              <Text variant="caption" colorToken="textSecondary">
                기문둔갑은 모든 상담에서 사용되지 않으며, 질문과 시점 조건에
                따라 활용됩니다.
              </Text>
            </Stack>

            {/* 4. 추천 상담 주제 */}
            <Stack gap="md">
              <Text variant="headingMedium">추천 상담 주제</Text>
              <Stack direction="row" gap="sm" style={styles.topicWrap}>
                {RECOMMENDED_TOPICS.map((topic) => (
                  <View key={topic} style={styles.topicChip}>
                    <Text variant="bodySmall">{topic}</Text>
                  </View>
                ))}
              </Stack>
            </Stack>

            {/* 5. 최근 상담 영역 (Empty State) */}
            <Stack gap="md">
              <Text variant="headingMedium">최근 상담</Text>
              <Card elevation="sm">
                <Stack gap="md" align="center">
                  <Text variant="bodyMedium" colorToken="textSecondary">
                    아직 저장된 상담이 없습니다.
                  </Text>
                  <Button
                    label="첫 상담 시작하기"
                    variant="secondary"
                    onPress={handleStartConsultation}
                  />
                </Stack>
              </Card>
            </Stack>

            {/* 6. 안내 문구 */}
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
    paddingVertical: 24,
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  topicWrap: {
    flexWrap: 'wrap',
  },
  topicChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(128, 128, 128, 0.12)',
  },
});
