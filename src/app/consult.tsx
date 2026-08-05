import { useState } from 'react';
import { Pressable } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/theme';

type Subject = {
  id: string;
  label: string;
};

const SUBJECTS: Subject[] = [{ id: 'self', label: '본인' }];

type Topic = {
  id: string;
  title: string;
  description: string;
};

const TOPICS: Topic[] = [
  {
    id: 'personality',
    title: '나의 성향과 강점',
    description: '타고난 기질과 강점을 명리학, 자미두수 관점에서 살펴봅니다.',
  },
  {
    id: 'career',
    title: '직업과 사업 방향',
    description: '적성에 맞는 방향과 시기를 함께 살펴봅니다.',
  },
  {
    id: 'wealth',
    title: '재물 흐름',
    description: '재물이 흐르는 시기와 유의할 점을 살펴봅니다.',
  },
  {
    id: 'relationship',
    title: '인간관계',
    description: '관계에서 나타나는 성향과 궁합을 살펴봅니다.',
  },
  {
    id: 'timing',
    title: '중요한 결정과 시기',
    description: '중요한 결정을 앞두고 있다면, 시점에 따른 흐름을 함께 봅니다.',
  },
];

export default function ConsultScreen() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  const selectedTopic = TOPICS.find((topic) => topic.id === selectedTopicId) ?? null;

  const handleNext = () => {
    // 이번 Sprint 범위 아님: 아직 다음 화면으로 이동하지 않음
  };

  return (
    <Screen>
      <Stack gap="xxl" style={{ flex: 1, paddingTop: 24 }}>
        <Text variant="headingLarge">상담</Text>

        <Stack gap="md">
          <Text variant="headingMedium">상담 대상</Text>
          <Stack gap="sm">
            {SUBJECTS.map((subject) => (
              <Card key={subject.id}>
                <Text variant="bodyLarge">{subject.label}</Text>
              </Card>
            ))}
          </Stack>
        </Stack>

        <Stack gap="md">
          <Text variant="headingMedium">상담 주제</Text>
          <Stack gap="sm">
            {TOPICS.map((topic) => {
              const isSelected = topic.id === selectedTopicId;

              return (
                <Pressable key={topic.id} onPress={() => setSelectedTopicId(topic.id)}>
                  <Card
                    style={{
                      borderColor: isSelected ? theme.primary : theme.border,
                      borderWidth: isSelected ? 2 : 1,
                    }}
                  >
                    <Stack gap="xs">
                      <Text variant="bodyLarge">{topic.title}</Text>
                      {isSelected ? (
                        <Text variant="bodySmall" colorToken="textSecondary">
                          {topic.description}
                        </Text>
                      ) : null}
                    </Stack>
                  </Card>
                </Pressable>
              );
            })}
          </Stack>
        </Stack>

        <Button
          label="다음 단계"
          disabled={selectedTopic === null}
          onPress={handleNext}
        />
      </Stack>
    </Screen>
  );
}
