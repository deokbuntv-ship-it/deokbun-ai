import { View } from 'react-native';

import { Text } from '@/components/Text';
import { toHumanReviewView } from '@/features/intelligence';
import type { QualityReview } from '@/features/intelligence';

import { adminTheme } from '../../adminTheme';
import { AdminBadge } from '../AdminBadge';
import { AdminPanel } from './AdminPanel';

// ADMIN Human Review panel (§33). The audit found human review has NO standalone
// persistence path — it is a projection of QualityReview.reviewStatus/reviewer/reviewedAt.
// So this panel presents the current review status truthfully and shows the review ACTION
// as not-connected (writePathConnected === false) rather than pretending it can write.
export function HumanReviewPanel({ review }: { review: QualityReview }) {
  const view = toHumanReviewView(review);
  return (
    <AdminPanel
      title="휴먼 리뷰"
      subtitle="Human Review"
      right={<AdminBadge label={view.reviewStatusLabel} tone={view.reviewed ? 'success' : 'neutral'} />}
    >
      <View style={{ gap: 4 }}>
        {view.reviewer ? (
          <Text variant="caption" style={{ color: adminTheme.inkMuted }}>
            {`검토자 ${view.reviewer}${view.reviewedAt ? ` · ${view.reviewedAt.slice(0, 16).replace('T', ' ')}` : ''}`}
          </Text>
        ) : null}
        <Text variant="caption" style={{ color: adminTheme.inkMuted }}>
          휴먼 리뷰 저장 경로가 아직 연결되지 않아, 이 화면에서는 검토를 기록할 수 없습니다.
        </Text>
      </View>
    </AdminPanel>
  );
}
