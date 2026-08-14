import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';

import { Stack } from '@/components/Stack';
import {
  AdminPageHeader,
  ConsultationInspector,
  NOT_CONNECTED_INSPECTOR,
  adminIntelligenceService,
} from '@/features/admin';

// ADMIN Consultation Intelligence Inspector route (§21/§22). Read-only. Gated on the
// intelligence seam: until adminIntelligenceService.isConnected() is true (Codex wires
// the pipeline + applies the schema), the inspector renders the fail-closed
// NOT_CONNECTED_INSPECTOR — the full trace layout in honest not-connected states, never a
// fabricated case (§37). When connected, this screen will load a real run trace and pass
// it to the same ConsultationInspector with no layout rewrite (§70).
export default function AdminConsultationIntelligenceScreen() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let alive = true;
    adminIntelligenceService
      .isConnected()
      .then((c) => {
        if (alive) setConnected(c);
      })
      .catch(() => {
        if (alive) setConnected(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
      <Stack gap="xl">
        <AdminPageHeader
          title="상담 인텔리전스"
          subtitle="상담 한 건이 왜 그렇게 나왔는지 추적합니다 — 근거 → 어세스먼트 → 교차분석 → 그라운딩 → 응답 → 평가 → 피드백 → 결과."
        />
        <ConsultationInspector connected={connected} data={NOT_CONNECTED_INSPECTOR} />
      </Stack>
    </ScrollView>
  );
}
