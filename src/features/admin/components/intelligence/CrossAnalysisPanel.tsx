import { View } from 'react-native';

import { Text } from '@/components/Text';
import { toCrossAnalysisView } from '@/features/intelligence';
import type { DomainCross } from '@/features/analysis';

import { adminTheme } from '../../adminTheme';
import { AdminBadge } from '../AdminBadge';
import { AdminPanel, AdminPanelEmpty, TONE_TO_ADMIN_BADGE } from './AdminPanel';

// ADMIN Cross Analysis panel (§27). Renders the backend-provided agreement class per
// domain + EACH engine's independent signal — NEVER merged into one score (§25/§27) and
// NEVER reconciled here (Codex classifies). Fail-closed: no live caller yet ⇒ [] ⇒ honest
// empty state.
export function CrossAnalysisPanel({ domains }: { domains: DomainCross[] }) {
  const view = toCrossAnalysisView(domains);

  if (view.status === 'empty') {
    return (
      <AdminPanel title="교차 분석" subtitle="Cross Analysis">
        <AdminPanelEmpty text="교차 분석 데이터가 아직 없습니다. 엔진 연결 후 표시됩니다." />
      </AdminPanel>
    );
  }

  return (
    <AdminPanel title="교차 분석" subtitle="Cross Analysis · 엔진 신호는 병합하지 않습니다">
      {view.domains.map((d) => (
        <View
          key={d.domainKey}
          style={{
            gap: 6,
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: adminTheme.border,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text variant="bodySmall" style={{ color: adminTheme.ink, fontWeight: '700' }}>
              {d.domainLabel}
            </Text>
            <AdminBadge label={d.agreementLabel} tone={TONE_TO_ADMIN_BADGE[d.agreementTone]} />
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {d.signals.map((s, i) => (
              <View
                key={`${d.domainKey}-${i}`}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 4,
                  backgroundColor: adminTheme.neutralBg,
                }}
              >
                <Text variant="caption" style={{ color: adminTheme.inkVariant, fontWeight: '600' }}>
                  {s.engineLabel}
                </Text>
                <Text variant="caption" style={{ color: adminTheme.inkMuted }}>
                  {s.available ? s.polarityLabel || '—' : '미참여'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </AdminPanel>
  );
}
