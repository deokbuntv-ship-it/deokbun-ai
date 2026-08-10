import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';

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
                편하게 이야기를 나누는 AI 상담
              </Text>
            </Stack>

            {/* 2. 메인 상담 시작 카드 */}
            <Card elevation="md">
              <Stack gap="md">
                <Text variant="headingMedium">편하게 이야기를 시작해 보세요</Text>
                <Text variant="bodyMedium" colorToken="textSecondary">
                  궁금한 점이나 고민이 있다면 덕분AI와 자유롭게 대화해 보세요.
                </Text>
                <Button label="상담 시작하기" onPress={handleStartConsultation} />
              </Stack>
            </Card>

            {/* 2-1. 콘텐츠 둘러보기 */}
            <Card elevation="sm">
              <Stack gap="md">
                <Text variant="headingMedium">콘텐츠 둘러보기</Text>
                <Text variant="bodySmall" colorToken="textSecondary">
                  사주·명리·운세·유명인 이야기를 만나보세요.
                </Text>
                <Stack direction="row" gap="sm">
                  <Button
                    label="콘텐츠"
                    variant="secondary"
                    onPress={() => router.push('/content')}
                  />
                  <Button
                    label="유명인"
                    variant="secondary"
                    onPress={() => router.push('/famous')}
                  />
                </Stack>
              </Stack>
            </Card>

            {/* 3. 운세 리포트 영역 */}
            <Card elevation="sm">
              <Stack gap="xs">
                <Text variant="headingMedium">운세 리포트</Text>
                <Text variant="bodySmall" colorToken="textSecondary">
                  상세 기능은 추후 확정됩니다.
                </Text>
              </Stack>
            </Card>

            {/* 4. 오늘의 운세 discovery entry → /today */}
            <Card elevation="sm">
              <Stack gap="md">
                <Stack gap="xs">
                  <Text variant="headingMedium">오늘의 운세</Text>
                  <Text variant="bodySmall" colorToken="textSecondary">
                    하루의 흐름을 확인하고 오늘을 준비해 보세요.
                  </Text>
                </Stack>
                <Button
                  label="오늘의 운세 보기"
                  variant="secondary"
                  onPress={() => router.push('/today')}
                />
              </Stack>
            </Card>

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
});
