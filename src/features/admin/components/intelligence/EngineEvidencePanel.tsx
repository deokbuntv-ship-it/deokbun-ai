import { View } from 'react-native';

import { Text } from '@/components/Text';
import { toGroundingView } from '@/features/intelligence';
import type { ConsultationGrounding } from '@/features/chat/prompts/grounding';

import { adminTheme } from '../../adminTheme';
import { AdminBadge } from '../AdminBadge';
import { AdminPanel, AdminPanelEmpty, TONE_TO_ADMIN_BADGE } from './AdminPanel';

// ADMIN Engine Evidence panel (§24). Shows each engine's DISTINCT availability state —
// Available / Not Activated (미사용) / Missing Birth Time / Not Connected / Calculation
// Failed — never collapsed into a single "on/off" (§11/§24). Fail-closed: when grounding
// is unavailable (current default) it shows the reason, not an empty engine table. The
// summary is engine-provided and only shown for available engines (never fabricated).
export function EngineEvidencePanel({ grounding }: { grounding: ConsultationGrounding }) {
  const view = toGroundingView(grounding);

  if (view.status === 'unavailable') {
    return (
      <AdminPanel title="엔진 근거" subtitle="Engine Evidence">
        <AdminPanelEmpty text={`근거 미연결 · 사유: ${view.reasonLabel}`} />
      </AdminPanel>
    );
  }

  return (
    <AdminPanel
      title="엔진 근거"
      subtitle="Engine Evidence"
      right={
        <Text variant="caption" style={{ color: adminTheme.inkMuted }}>
          활용 {view.usedCount}/3
        </Text>
      }
    >
      {view.engines.map((e) => (
        <View
          key={e.engineKey}
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
            paddingVertical: 6,
            borderBottomWidth: 1,
            borderBottomColor: adminTheme.border,
          }}
        >
          <View style={{ flex: 1, gap: 3 }}>
            <Text variant="bodySmall" style={{ color: adminTheme.ink, fontWeight: '700' }}>
              {e.engineLabel}
            </Text>
            {e.summary ? (
              <Text variant="caption" style={{ color: adminTheme.inkVariant }}>
                {e.summary}
              </Text>
            ) : null}
            {e.detail ? (
              <Text variant="caption" style={{ color: adminTheme.inkMuted }}>
                {e.detail}
              </Text>
            ) : null}
          </View>
          <AdminBadge label={e.availabilityLabel} tone={TONE_TO_ADMIN_BADGE[e.availabilityTone]} />
        </View>
      ))}
    </AdminPanel>
  );
}
