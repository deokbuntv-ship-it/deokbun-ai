import { useRouter } from 'expo-router';
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

// 인연 tab — relationship foundation (§25/§26). Broader than 연애: 배우자/자녀/
// 부모/파트너/동료 등. Compatibility (궁합) results require real canonical
// analysis from the engine, so this shows a truthful engine-unavailable state
// and never fabricates compatibility data. The AI CTA routes into consultation.
const RELATIONSHIP_TYPES = [
  '배우자',
  '연인',
  '자녀',
  '부모',
  '사업 파트너',
  '동료',
  '지인',
];

const COMPAT_DIMENSIONS = [
  '감정 궁합',
  '소통',
  '재물',
  '일상',
  '갈등',
  '관계 시점',
];

export default function RelationshipScreen() {
  const router = useRouter();

  return (
    <Screen padded>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wrapper}>
          <Stack gap="xl">
            <Stack gap="xs">
              <Text variant="displayMedium">인연</Text>
              <Text variant="bodyMedium" colorToken="textSecondary">
                소중한 사람과의 관계 흐름과 궁합을 살펴봅니다.
              </Text>
            </Stack>

            {/* 궁합 보기 — primary entry (truthful engine state). */}
            <Stack gap="sm">
              <Text variant="headingMedium">궁합 보기</Text>
              <EngineNotice
                title="궁합 분석 준비 중"
                message="두 사람의 궁합은 저장된 사람 정보를 바탕으로 운세 엔진이 연결되면 분석할 수 있어요. 지금은 임의의 궁합 점수나 결과를 보여 드리지 않습니다."
                footnote="분석 대상은 AI 상담에서 등록·선택할 수 있습니다."
              />
              <Button
                label="AI에게 관계 상담하기"
                onPress={() => router.push('/consult')}
              />
            </Stack>

            {/* Relationship types (informational chips). */}
            <Stack gap="sm">
              <Text variant="headingMedium">관계 유형</Text>
              <Stack direction="row" gap="sm" style={styles.chipWrap}>
                {RELATIONSHIP_TYPES.map((label) => (
                  <Chip key={label} label={label} />
                ))}
              </Stack>
              <Text variant="caption" colorToken="textSecondary">
                연애뿐 아니라 가족·직장 등 다양한 관계를 다룹니다.
              </Text>
            </Stack>

            {/* Compatibility dimensions — labels only until real data. */}
            <Stack gap="sm">
              <Text variant="headingMedium">분석 항목</Text>
              <Card>
                <Stack gap="md">
                  {COMPAT_DIMENSIONS.map((label) => (
                    <Stack
                      key={label}
                      direction="row"
                      gap="sm"
                      align="center"
                      style={styles.rowBetween}
                    >
                      <Text variant="bodyMedium">{label}</Text>
                      <StatusBadge label="준비 중" tone="neutral" />
                    </Stack>
                  ))}
                </Stack>
              </Card>
            </Stack>
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
  chipWrap: {
    flexWrap: 'wrap',
  },
  rowBetween: {
    justifyContent: 'space-between',
  },
});
