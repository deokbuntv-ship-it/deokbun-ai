import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';

import type { ReportCtaView } from './reportCta';

// Conversation-level report action (Commercial UX V4 §6/§7/§8/§9). ONE action area per conversation —
// never rendered per message. Presentational only: the screen owns the state machine (resolveReportCtaView)
// and the async generate()/navigation; this renders the resolved state. Copy is deterministic UI text,
// never LLM-generated (§9).
export function ReportCtaFooter({
  view,
  error,
  onGenerate,
  onOpen,
}: {
  view: ReportCtaView;
  error: boolean;
  onGenerate: () => void;
  onOpen: (reportId: string) => void;
}) {
  if (view.mode === 'hidden') return null;

  return (
    <Card radius="xl">
      <Stack gap="sm">
        {error ? (
          <Text variant="bodySmall" colorToken="danger">
            보고서를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.
          </Text>
        ) : null}

        {view.mode === 'generating' ? (
          <Button label="보고서를 정리하는 중..." disabled onPress={() => {}} radius="lg" />
        ) : view.mode === 'created' ? (
          <>
            <Text variant="bodyMedium" style={{ lineHeight: 23 }}>
              상담 내용을 보고서로 정리했어요.{'\n'}우편함에 넣어두었습니다.
            </Text>
            <Button label="보고서 확인하기" radius="lg" onPress={() => onOpen(view.reportId)} />
          </>
        ) : view.mode === 'view' ? (
          <>
            <Text variant="bodySmall" colorToken="textSecondary">
              이 상담은 보고서로 저장되어 있어요.
            </Text>
            <Button
              label="보고서 보기"
              variant="secondary"
              radius="lg"
              onPress={() => onOpen(view.reportId)}
            />
          </>
        ) : (
          <>
            <Text variant="bodySmall" colorToken="textSecondary">
              이 상담을 보고서로 정리해 우편함에 저장할 수 있어요.
            </Text>
            <Button label="상담 보고서 만들기" radius="lg" onPress={onGenerate} />
          </>
        )}
      </Stack>
    </Card>
  );
}
