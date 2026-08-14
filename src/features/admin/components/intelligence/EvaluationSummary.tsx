import { View } from 'react-native';

import { Text } from '@/components/Text';
import { toEvaluationView } from '@/features/intelligence';
import type { QualityReview } from '@/features/intelligence';

import { adminTheme } from '../../adminTheme';
import { AdminBadge } from '../AdminBadge';
import { AdminPanel, AdminPanelEmpty, TONE_TO_ADMIN_BADGE } from './AdminPanel';

// ADMIN Evaluation / response-quality panel (§30/§31). This is the quality of the
// generated ANSWER — NOT the reading (Assessment ≠ Evaluation, §30). Fail-closed: when
// the auto-evaluator isn't connected or nothing is evaluated, it shows the honest
// not-evaluated state instead of inventing dimension scores.
export function EvaluationSummary({ review }: { review: QualityReview }) {
  const view = toEvaluationView(review);

  if (view.status === 'not_evaluated') {
    return (
      <AdminPanel title="응답 평가" subtitle="Evaluation · 답변 품질(해석과 별개)">
        <AdminPanelEmpty
          text={
            view.reason === 'evaluator_not_connected'
              ? '자동 평가기가 아직 연결되지 않았습니다. 평가 결과가 없습니다.'
              : '아직 평가되지 않았습니다.'
          }
        />
      </AdminPanel>
    );
  }

  return (
    <AdminPanel
      title="응답 평가"
      subtitle="Evaluation · 답변 품질(해석과 별개)"
      right={<AdminBadge label={view.overallLabel} tone={TONE_TO_ADMIN_BADGE[view.overallTone]} />}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text variant="caption" style={{ color: adminTheme.inkMuted }}>
          {`검토 상태 · ${view.reviewStatusLabel}${view.isAdminReview ? ' (운영자)' : ' (자동)'}`}
        </Text>
        {view.reviewer ? (
          <Text variant="caption" style={{ color: adminTheme.inkMuted }}>
            {`검토자 ${view.reviewer}`}
          </Text>
        ) : null}
      </View>
      {view.dimensions.map((row) => (
        <View
          key={row.dimensionKey}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 3 }}
        >
          <Text variant="bodySmall" style={{ color: adminTheme.inkVariant }}>
            {row.dimensionLabel}
          </Text>
          <AdminBadge label={row.statusLabel} tone={TONE_TO_ADMIN_BADGE[row.tone]} />
        </View>
      ))}
    </AdminPanel>
  );
}
