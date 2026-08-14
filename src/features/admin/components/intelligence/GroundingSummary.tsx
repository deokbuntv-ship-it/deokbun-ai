import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/Text';
import { toGroundingView } from '@/features/intelligence';
import type { ConsultationGrounding } from '@/features/chat/prompts/grounding';

import { adminTheme } from '../../adminTheme';
import { AdminPanel, AdminPanelEmpty } from './AdminPanel';

// ADMIN Consultation Grounding inspection (§28). Summary FIRST (grounded? how many
// engines?) → expandable per-engine detail. NEVER exposes system prompts / credentials
// (§28) — it only reports availability + the engine-provided summary text. Fail-closed:
// unavailable grounding shows the reason.
export function GroundingSummary({ grounding }: { grounding: ConsultationGrounding }) {
  const [open, setOpen] = useState(false);
  const view = toGroundingView(grounding);

  if (view.status === 'unavailable') {
    return (
      <AdminPanel title="상담 그라운딩" subtitle="Consultation Grounding">
        <AdminPanelEmpty text={`미연결 · 사유: ${view.reasonLabel}`} />
      </AdminPanel>
    );
  }

  return (
    <AdminPanel title="상담 그라운딩" subtitle="Consultation Grounding">
      <Text variant="bodySmall" style={{ color: adminTheme.ink }}>
        {`활용된 관점 ${view.usedCount}개 · 이 상담은 실제 근거로 그라운딩되어 있습니다.`}
      </Text>
      <Pressable onPress={() => setOpen((v) => !v)} accessibilityRole="button">
        <Text variant="caption" style={{ color: adminTheme.info, fontWeight: '700' }}>
          {open ? '상세 접기 ▴' : '상세 보기 ▾'}
        </Text>
      </Pressable>
      {open ? (
        <View style={{ gap: 6 }}>
          {view.engines.map((e) => (
            <View key={e.engineKey} style={{ gap: 2 }}>
              <Text variant="caption" style={{ color: adminTheme.inkMuted }}>
                {`${e.engineLabel} · ${e.availabilityLabel}`}
              </Text>
              {e.summary ? (
                <Text variant="bodySmall" style={{ color: adminTheme.inkVariant }}>
                  {e.summary}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
    </AdminPanel>
  );
}
