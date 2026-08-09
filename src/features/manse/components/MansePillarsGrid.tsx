import { Card } from '@/components/Card';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';

import type {
  ManseAggregateStatus,
  ManseFourPillars,
  ManseHourStatus,
} from '../types';
import { PillarColumn } from './PillarColumn';

// Presentation-only Four Pillars grid. Column order: 시 | 일 | 월 | 년.
// The grid never computes anything; it renders the slots it is given and shows
// product-facing status messages for the presentation states.

const AGGREGATE_PENDING_MESSAGE =
  '사주 명식은 계산 엔진 연동 후 표시됩니다.';

const AGGREGATE_UNAVAILABLE_MESSAGE =
  '만세력 결과를 표시할 수 없습니다.';

// Hour-pillar notes. 'approximate'/'unknown' are derivable from the raw input;
// 'ambiguous'/'unavailable' are ENGINE-determined. 'available'/'pending' show no
// note (either resolved, or covered by the aggregate pending message).
const HOUR_STATUS_MESSAGE: Record<ManseHourStatus, string | null> = {
  available: null,
  approximate:
    '출생시간이 대략적으로 입력되어 시주가 확정되지 않았습니다.',
  unknown: '출생시간을 알 수 없어 시주를 확정할 수 없습니다.',
  ambiguous:
    '출생시간 기준을 하나로 확정할 수 없어 시주가 확정되지 않았습니다.',
  unavailable: '출생시간 정보로는 시주를 확정할 수 없습니다.',
  pending: null,
};

export function MansePillarsGrid({
  pillars,
  aggregateStatus,
  hourStatus,
  unavailableReason,
}: {
  pillars: ManseFourPillars;
  aggregateStatus: ManseAggregateStatus;
  hourStatus: ManseHourStatus;
  unavailableReason?: string | null;
}) {
  if (aggregateStatus === 'unavailable') {
    return (
      <Stack gap="sm">
        <Text variant="headingMedium">사주 명식</Text>
        <Card>
          <Stack gap="xs">
            <Text variant="bodyMedium" colorToken="textSecondary">
              {AGGREGATE_UNAVAILABLE_MESSAGE}
            </Text>
            {unavailableReason ? (
              <Text variant="bodySmall" colorToken="textSecondary">
                {unavailableReason}
              </Text>
            ) : null}
          </Stack>
        </Card>
      </Stack>
    );
  }

  const hourMessage = HOUR_STATUS_MESSAGE[hourStatus];

  return (
    <Stack gap="sm">
      <Text variant="headingMedium">사주 명식</Text>
      <Card>
        <Stack direction="row" gap="sm">
          <PillarColumn pillar={pillars.hour} />
          <PillarColumn pillar={pillars.day} />
          <PillarColumn pillar={pillars.month} />
          <PillarColumn pillar={pillars.year} />
        </Stack>
      </Card>

      {aggregateStatus === 'pending' ? (
        <Text variant="bodySmall" colorToken="textSecondary">
          {AGGREGATE_PENDING_MESSAGE}
        </Text>
      ) : null}

      {hourMessage ? (
        <Text variant="bodySmall" colorToken="textSecondary">
          {hourMessage}
        </Text>
      ) : null}
    </Stack>
  );
}
