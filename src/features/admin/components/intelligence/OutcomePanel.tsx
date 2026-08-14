import { View } from 'react-native';

import { Text } from '@/components/Text';
import { toOutcomeListView } from '@/features/intelligence';
import type { ConsultationOutcome } from '@/features/intelligence';

import { adminTheme } from '../../adminTheme';
import { AdminBadge } from '../AdminBadge';
import { AdminPanel, AdminPanelEmpty, TONE_TO_ADMIN_BADGE } from './AdminPanel';

// ADMIN Outcome panel (§34). Preserves user_report → unverified: the verification status
// is surfaced verbatim from the contract and NEVER promoted to 'verified' or AI-inferred
// (§34). Fail-closed: [] ⇒ honest empty state.
export function OutcomePanel({ outcomes }: { outcomes: ConsultationOutcome[] }) {
  const view = toOutcomeListView(outcomes);

  if (view.status === 'empty') {
    return (
      <AdminPanel title="결과 기록" subtitle="Outcome">
        <AdminPanelEmpty text="기록된 결과가 없습니다." />
      </AdminPanel>
    );
  }

  return (
    <AdminPanel title="결과 기록" subtitle="Outcome · 사용자 보고는 미검증으로 유지됩니다">
      {view.rows.map((r) => (
        <View
          key={r.outcomeId}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            paddingVertical: 6,
            borderBottomWidth: 1,
            borderBottomColor: adminTheme.border,
          }}
        >
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="bodySmall" style={{ color: adminTheme.ink, fontWeight: '600' }}>
              {r.typeLabel}
            </Text>
            <Text variant="caption" style={{ color: adminTheme.inkMuted }}>
              {`출처 ${r.sourceLabel}${r.occurredAtPeriod ? ` · ${r.occurredAtPeriod}` : ''} · 신뢰도 ${r.confidenceLabel}`}
            </Text>
          </View>
          <AdminBadge label={r.verificationLabel} tone={TONE_TO_ADMIN_BADGE[r.verificationTone]} />
        </View>
      ))}
    </AdminPanel>
  );
}
