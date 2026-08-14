import { Text } from '@/components/Text';
import { toFeedbackView } from '@/features/intelligence';
import type { UserFeedback } from '@/features/intelligence';

import { AdminBadge } from '../AdminBadge';
import { AdminPanel, AdminPanelEmpty } from './AdminPanel';

// ADMIN User Feedback panel (§32). Read-only presentation of a submitted verdict. The
// audit found feedback persistence is NOT live (no client write wired), so the common
// case is "none" — shown honestly, never faked. When a verdict exists it is surfaced with
// its optional reason.
export function FeedbackPanel({ feedback }: { feedback: UserFeedback | null }) {
  const view = toFeedbackView(feedback);

  if (view.status === 'none') {
    return (
      <AdminPanel title="사용자 피드백" subtitle="User Feedback">
        <AdminPanelEmpty text="제출된 피드백이 없습니다. (피드백 저장 경로는 준비 중)" />
      </AdminPanel>
    );
  }

  return (
    <AdminPanel
      title="사용자 피드백"
      subtitle="User Feedback"
      right={<AdminBadge label={view.verdictLabel} tone={view.helpful ? 'success' : 'warning'} />}
    >
      {view.reasonLabel ? (
        <Text variant="bodySmall">{`사유 · ${view.reasonLabel}`}</Text>
      ) : (
        <AdminPanelEmpty text="추가 사유 없음" />
      )}
    </AdminPanel>
  );
}
