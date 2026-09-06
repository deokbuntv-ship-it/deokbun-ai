import { useState } from 'react';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { FamousChartTable } from '@/features/publicSite';

import { FAMOUS_CHART_BLOCKED_NOTICE } from '../famousDisclosure';
import { famousBodyService, type FamousComposeResult } from '../services/famousBodyService';
import type { FamousCalculationState } from '../types';

// 명식 계산 + 해설 초안 (S1·S3).
//
// 버튼이 둘인 이유. 보통은 [명식 계산 + 본문 생성] 하나로 끝난다 — 서버가 명식을 먼저 세우고,
// 서지 않으면 LLM 을 아예 부르지 않는다. 그런데 생년월일을 고친 뒤에는 **글은 그대로 두고 명식만**
// 다시 세우고 싶을 때가 있다. 그 경우까지 본문 생성을 태우면 쓸데없이 원가가 붙고, 운영자가 손본
// 글을 덮어쓸 위험이 생긴다. 그래서 [명식만 다시 계산] 을 따로 둔다.
//
// ⚠ 이 패널은 아무것도 저장하지 않는다. 본문은 초안으로만 받고, [본문에 적용] 이 편집기의 소개란을
// 채운다. 저장은 평소의 저장 버튼이 한다.
const CALC_LABEL: Record<string, string> = {
  not_calculated: '아직 계산하지 않음',
  current: '최신',
  stale: '생년월일이 바뀜 — 다시 계산 필요',
  failed: '계산 실패',
};

export function FamousBodyPanel({
  famousId,
  calculationState,
  onApplyBody,
}: {
  famousId: string | null;
  calculationState: FamousCalculationState | null;
  onApplyBody: (markdown: string) => void;
}) {
  const [running, setRunning] = useState<null | 'chart' | 'body'>(null);
  const [result, setResult] = useState<FamousComposeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  const run = (withBody: boolean) => {
    if (running || !famousId) return;
    setRunning(withBody ? 'body' : 'chart');
    setError(null);
    setResult(null);
    setApplied(false);
    famousBodyService
      .compose({ famousId, withBody })
      .then(setResult)
      .catch(() =>
        setError('요청에 실패했습니다. 관리자 권한과 Edge 배포(famous-compose) 를 확인해 주세요.'),
      )
      .finally(() => setRunning(null));
  };

  // 저장 전 새 프로필에는 id 가 없다 — 서버가 붙잡을 행이 없으므로 먼저 저장을 시킨다.
  if (!famousId) {
    return (
      <Card use="status">
        <Text variant="bodySmall" colorToken="textSecondary">
          명식과 해설은 저장한 뒤에 만들 수 있습니다. 생년월일을 넣고 먼저 저장해 주세요.
        </Text>
      </Card>
    );
  }

  const state = calculationState ?? 'not_calculated';
  const latest = result?.chart ?? null;

  return (
    <Stack gap="sm">
      <Text variant="headingMedium">명식 · 해설 초안</Text>
      <Card>
        <Stack gap="md">
          <Text variant="bodySmall" colorToken="textSecondary">
            {`현재 상태: ${CALC_LABEL[state] ?? state}`}
          </Text>
          {state !== 'current' ? (
            <Text variant="caption" colorToken="textSecondary">
              {FAMOUS_CHART_BLOCKED_NOTICE}
            </Text>
          ) : null}

          <Stack direction="row" gap="sm">
            <Button
              label={running === 'body' ? '생성 중…' : '명식 계산 + 본문 생성'}
              onPress={() => run(true)}
              disabled={running !== null}
            />
            <Button
              label={running === 'chart' ? '계산 중…' : '명식만 다시 계산'}
              variant="secondary"
              onPress={() => run(false)}
              disabled={running !== null}
            />
          </Stack>

          {error ? (
            <Text variant="bodySmall" colorToken="danger">{error}</Text>
          ) : null}

          {result?.message ? (
            <Text
              variant="bodySmall"
              colorToken={result.outcome === 'ok' ? 'textSecondary' : 'danger'}
            >
              {result.message}
            </Text>
          ) : null}

          {/* 왜 버렸는지를 보여 준다. 이유 없이 "실패" 만 뜨면 운영자가 같은 버튼만 다시 누른다. */}
          {result?.violations.length ? (
            <Stack gap="xs">
              {result.violations.map((v, i) => (
                <Text key={`${v.id}-${i}`} variant="caption" colorToken="danger">
                  {`· ${v.why}`}
                </Text>
              ))}
            </Stack>
          ) : null}

          {latest ? <FamousChartTable chart={latest} /> : null}

          {result?.body ? (
            <Stack gap="sm">
              {result.unglossedTerms.length > 0 ? (
                <Text variant="caption" colorToken="textSecondary">
                  {`풀이 없이 쓰인 용어: ${result.unglossedTerms.join(', ')} — 적용 후 손보는 것을 권합니다.`}
                </Text>
              ) : null}
              {result.usage?.total ? (
                <Text variant="caption" colorToken="textSecondary">
                  {`토큰 ${result.usage.total} (입력 ${result.usage.input ?? '?'} · 출력 ${result.usage.output ?? '?'})`}
                </Text>
              ) : null}
              <Card use="status">
                <Text variant="bodySmall">{result.body}</Text>
              </Card>
              <Button
                label={applied ? '적용됨' : '본문에 적용'}
                onPress={() => {
                  onApplyBody(result.body ?? '');
                  setApplied(true);
                }}
                disabled={applied}
              />
            </Stack>
          ) : null}
        </Stack>
      </Card>
    </Stack>
  );
}
