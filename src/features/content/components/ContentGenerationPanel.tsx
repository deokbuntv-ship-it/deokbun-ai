import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { AdminSelect } from '@/features/admin';

import { contentService } from '../services/contentService';
import { contentGenerationService } from '../services/contentGenerationService';
import type {
  ContentChannel,
  ContentGenerationDraft,
  ContentGenerationResult,
  ContentSourceType,
  ContentVersion,
} from '../types';

const TEMPLATE_OPTIONS = contentGenerationService
  .listTemplates()
  .map((t) => ({ value: t.id, label: t.label }));

function templateDescription(id: string): string {
  return (
    contentGenerationService.listTemplates().find((t) => t.id === id)
      ?.description ?? ''
  );
}

export function ContentGenerationPanel({
  contentId,
  channel,
  sourceType,
  famousLabel,
  onApplyDraft,
  applying,
}: {
  contentId: string;
  channel: ContentChannel;
  sourceType: ContentSourceType;
  famousLabel: string | null;
  onApplyDraft: (draft: ContentGenerationDraft) => void;
  applying: boolean;
}) {
  const [templateId, setTemplateId] = useState(
    sourceType === 'famous' ? 'famous_v1' : 'general_v1',
  );
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [subjectName, setSubjectName] = useState(famousLabel ?? '');
  const [subjectContext, setSubjectContext] = useState('');

  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<ContentGenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [versions, setVersions] = useState<ContentVersion[]>([]);

  const loadVersions = useCallback(() => {
    contentService
      .listVersions(contentId)
      .then(setVersions)
      .catch(() => setVersions([]));
  }, [contentId]);

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  const isFamousTemplate = templateId === 'famous_v1';

  const handleGenerate = () => {
    if (generating) return;
    setGenerating(true);
    setError(null);
    setResult(null);
    contentGenerationService
      .generate({
        contentId,
        templateId,
        variables: {
          channel,
          topic: topic.trim() || undefined,
          audience: audience.trim() || undefined,
          tone: tone.trim() || undefined,
          keyPoints: keyPoints.trim() || undefined,
          subjectName: subjectName.trim() || undefined,
          subjectContext: subjectContext.trim() || undefined,
        },
      })
      .then((res) => {
        setResult(res);
        loadVersions();
      })
      .catch((e: unknown) => {
        const code = e instanceof Error ? e.message : 'CONTENT_GENERATION_FAILED';
        setError(
          code === 'CONTENT_GENERATION_EMPTY'
            ? 'AI 응답이 비어 있습니다. 다시 시도해 주세요.'
            : 'AI 생성에 실패했습니다. 관리자 권한/서버 설정(Edge 배포·OpenAI 키)을 확인해 주세요.',
        );
      })
      .finally(() => setGenerating(false));
  };

  return (
    <Stack gap="sm">
      <Text variant="headingMedium">AI 생성</Text>
      <Card>
        <Stack gap="md">
          <AdminSelect
            label="템플릿"
            options={TEMPLATE_OPTIONS}
            value={templateId}
            onChange={setTemplateId}
          />
          <Text variant="caption" colorToken="textSecondary">
            {templateDescription(templateId)}
          </Text>

          <Input
            label="주제 / 방향"
            value={topic}
            onChangeText={setTopic}
            placeholder="예) 2026년 병오년 운세 개요"
          />
          {isFamousTemplate ? (
            <>
              <Input
                label="인물명"
                value={subjectName}
                onChangeText={setSubjectName}
              />
              <Input
                label="인물 배경 / 참고 (선택)"
                value={subjectContext}
                onChangeText={setSubjectContext}
                multiline
              />
            </>
          ) : null}
          <Input
            label="대상 독자 (선택)"
            value={audience}
            onChangeText={setAudience}
            placeholder="예) 사주 입문자"
          />
          <Input
            label="톤/문체 (선택)"
            value={tone}
            onChangeText={setTone}
            placeholder="예) 친근하고 쉬운"
          />
          <Input
            label="반드시 포함할 핵심 (선택)"
            value={keyPoints}
            onChangeText={setKeyPoints}
            multiline
          />

          <Text variant="caption" colorToken="textSecondary">
            AI는 사주/자미두수/기문둔갑을 임의로 계산하지 않습니다. 생성 결과는
            검토 후 적용됩니다(자동 발행 없음).
          </Text>

          <Button
            label={generating ? '생성 중...' : 'AI로 초안 생성'}
            disabled={generating || applying}
            onPress={handleGenerate}
          />

          {error ? (
            <Text variant="bodySmall" colorToken="danger">
              {error}
            </Text>
          ) : null}
        </Stack>
      </Card>

      {result ? (
        <Card>
          <Stack gap="md">
            <Text variant="bodyMedium">생성 결과 (버전 {result.version.version})</Text>
            {result.draft.title ? (
              <Stack gap="xs">
                <Text variant="caption" colorToken="textSecondary">
                  제목
                </Text>
                <Text variant="bodyMedium">{result.draft.title}</Text>
              </Stack>
            ) : null}
            {result.draft.summary ? (
              <Stack gap="xs">
                <Text variant="caption" colorToken="textSecondary">
                  요약
                </Text>
                <Text variant="bodySmall">{result.draft.summary}</Text>
              </Stack>
            ) : null}
            <Stack gap="xs">
              <Text variant="caption" colorToken="textSecondary">
                본문
              </Text>
              <Text variant="bodySmall">{result.draft.body}</Text>
            </Stack>
            {result.draft.tags.length > 0 ? (
              <Text variant="caption" colorToken="textSecondary">
                태그: {result.draft.tags.join(', ')}
              </Text>
            ) : null}
            <Text variant="caption" colorToken="textSecondary">
              {result.provenance.provider} · {result.provenance.model} ·{' '}
              {result.provenance.promptVersion} · 토큰{' '}
              {result.provenance.tokenUsage.total_tokens ?? '–'}
            </Text>
            <Button
              label={applying ? '적용 중...' : '이 초안을 본문에 적용'}
              disabled={applying}
              onPress={() => onApplyDraft(result.draft)}
            />
          </Stack>
        </Card>
      ) : null}

      {versions.length > 0 ? (
        <Card>
          <Stack gap="sm">
            <Text variant="bodyMedium">생성/편집 이력</Text>
            {versions.map((v) => (
              <Stack key={v.id} direction="row" gap="sm" align="center">
                <Text variant="bodySmall">v{v.version}</Text>
                <Text variant="caption" colorToken="textSecondary">
                  {v.source === 'ai'
                    ? `AI · ${v.model ?? '?'} · ${v.promptVersion ?? '?'}`
                    : '수동'}
                  {v.totalTokens != null ? ` · ${v.totalTokens} 토큰` : ''}
                  {v.createdAt ? ` · ${v.createdAt.slice(0, 16).replace('T', ' ')}` : ''}
                </Text>
              </Stack>
            ))}
          </Stack>
        </Card>
      ) : null}
    </Stack>
  );
}
