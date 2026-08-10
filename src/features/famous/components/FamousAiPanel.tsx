import { useState } from 'react';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';

import { famousSuggestionService } from '../services/famousSuggestionService';
import type {
  FamousIndexPolicy,
  FamousSuggestion,
  FamousSuggestionBasis,
} from '../types';

const BASIS_LABEL: Record<FamousSuggestionBasis, string> = {
  fact: '사실 기반',
  interpretation: '해석',
  unknown: '정보 없음',
};

function BasisBadge({ basis }: { basis: FamousSuggestionBasis }) {
  return (
    <Text
      variant="caption"
      colorToken={basis === 'fact' ? 'success' : 'textSecondary'}
    >
      [{BASIS_LABEL[basis]}]
    </Text>
  );
}

export function FamousAiPanel({
  name,
  occupation,
  category,
  birthSummary,
  famousId,
  onApplyOneLiner,
  onApplyIntroduction,
  onApplySeoTitle,
  onApplySeoDescription,
  onApplySlug,
  onApplyIndexPolicy,
}: {
  name: string;
  occupation: string;
  category: string;
  birthSummary: string | null;
  famousId?: string | null;
  onApplyOneLiner: (text: string) => void;
  onApplyIntroduction: (text: string) => void;
  onApplySeoTitle: (text: string) => void;
  onApplySeoDescription: (text: string) => void;
  onApplySlug: (slug: string) => void;
  onApplyIndexPolicy: (policy: FamousIndexPolicy) => void;
}) {
  const [knownFacts, setKnownFacts] = useState('');
  const [generating, setGenerating] = useState(false);
  const [suggestion, setSuggestion] = useState<FamousSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = () => {
    if (generating) return;
    if (name.trim().length === 0) {
      setError('먼저 이름을 입력해 주세요.');
      return;
    }
    setGenerating(true);
    setError(null);
    setSuggestion(null);
    famousSuggestionService
      .generate({
        famousId: famousId ?? null,
        name: name.trim(),
        occupation: occupation.trim() || null,
        category: category.trim() || null,
        knownFacts: knownFacts.trim() || null,
        birthSummary,
      })
      .then((res) => setSuggestion(res.suggestion))
      .catch(() =>
        setError(
          'AI 제안 생성에 실패했습니다. 관리자 권한/서버 설정(Edge 배포·키)을 확인해 주세요.',
        ),
      )
      .finally(() => setGenerating(false));
  };

  return (
    <Stack gap="sm">
      <Text variant="headingMedium">AI 제안</Text>
      <Card>
        <Stack gap="md">
          <Text variant="caption" colorToken="textSecondary">
            확인된 사실만 입력하세요. AI는 없는 사실(직업/전기/출생지 등)을 지어내지
            않으며, 각 제안에 근거(사실/해석/정보 없음)를 표시합니다. 제안은 검토 후
            선택 적용되며 자동 저장/공개되지 않습니다.
          </Text>
          <Input
            label="확인된 사실 (선택)"
            value={knownFacts}
            onChangeText={setKnownFacts}
            multiline
            placeholder="예) 1990년대 데뷔한 배우, 대표작 …"
          />
          <Button
            label={generating ? '생성 중...' : 'AI 제안 생성'}
            disabled={generating}
            onPress={handleGenerate}
          />
          {error ? (
            <Text variant="bodySmall" colorToken="danger">
              {error}
            </Text>
          ) : null}
        </Stack>
      </Card>

      {suggestion ? (
        <Card>
          <Stack gap="md">
            {suggestion.oneLiner ? (
              <Stack gap="xs">
                <Stack direction="row" gap="xs" align="center">
                  <Text variant="bodySmall">한 줄 소개</Text>
                  <BasisBadge basis={suggestion.oneLiner.basis} />
                </Stack>
                <Text variant="bodySmall" colorToken="textSecondary">
                  {suggestion.oneLiner.text}
                </Text>
                <Button
                  label="한 줄 소개에 적용"
                  variant="secondary"
                  onPress={() => onApplyOneLiner(suggestion.oneLiner!.text)}
                />
              </Stack>
            ) : null}

            {suggestion.introduction ? (
              <Stack gap="xs">
                <Stack direction="row" gap="xs" align="center">
                  <Text variant="bodySmall">소개</Text>
                  <BasisBadge basis={suggestion.introduction.basis} />
                </Stack>
                <Text variant="bodySmall" colorToken="textSecondary">
                  {suggestion.introduction.text}
                </Text>
                <Button
                  label="소개에 적용"
                  variant="secondary"
                  onPress={() =>
                    onApplyIntroduction(suggestion.introduction!.text)
                  }
                />
              </Stack>
            ) : null}

            {suggestion.seoTitle ? (
              <Stack gap="xs">
                <Text variant="bodySmall">SEO 제목 ({suggestion.seoTitle.length}자)</Text>
                <Text variant="bodySmall" colorToken="textSecondary">
                  {suggestion.seoTitle}
                </Text>
                <Button
                  label="SEO 제목에 적용"
                  variant="secondary"
                  onPress={() => onApplySeoTitle(suggestion.seoTitle!)}
                />
              </Stack>
            ) : null}

            {suggestion.seoDescription ? (
              <Stack gap="xs">
                <Text variant="bodySmall">
                  SEO 설명 ({suggestion.seoDescription.length}자)
                </Text>
                <Text variant="bodySmall" colorToken="textSecondary">
                  {suggestion.seoDescription}
                </Text>
                <Button
                  label="SEO 설명에 적용"
                  variant="secondary"
                  onPress={() => onApplySeoDescription(suggestion.seoDescription!)}
                />
              </Stack>
            ) : null}

            {suggestion.recommendedSlug ? (
              <Stack gap="xs">
                <Text variant="bodySmall">추천 slug</Text>
                <Text variant="bodySmall" colorToken="textSecondary">
                  {suggestion.recommendedSlug}
                </Text>
                <Button
                  label="slug에 적용"
                  variant="secondary"
                  onPress={() => onApplySlug(suggestion.recommendedSlug!)}
                />
              </Stack>
            ) : null}

            {suggestion.indexPolicy ? (
              <Stack gap="xs">
                <Text variant="bodySmall">
                  추천 색인 정책: {suggestion.indexPolicy}
                </Text>
                <Button
                  label="색인 정책에 적용"
                  variant="secondary"
                  onPress={() => onApplyIndexPolicy(suggestion.indexPolicy!)}
                />
              </Stack>
            ) : null}

            {suggestion.topics.length > 0 ? (
              <Stack gap="xs">
                <Text variant="bodySmall">콘텐츠 주제 아이디어</Text>
                {suggestion.topics.map((t, idx) => (
                  <Text key={idx} variant="caption" colorToken="textSecondary">
                    • {t}
                  </Text>
                ))}
              </Stack>
            ) : null}

            {suggestion.disclaimer ? (
              <Text variant="caption" colorToken="textSecondary">
                ※ {suggestion.disclaimer}
              </Text>
            ) : null}
          </Stack>
        </Card>
      ) : null}
    </Stack>
  );
}
