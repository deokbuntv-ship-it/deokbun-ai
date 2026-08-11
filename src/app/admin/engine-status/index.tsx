import { View } from 'react-native';

import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { AdminPageHeader } from '@/features/admin';
import { adminTheme } from '@/features/admin/adminTheme';

// ADMIN_09_ENGINE_STATUS (Stitch final_lock_6). Real-time engine health/perf.
// No engine-telemetry API is connected yet, so each engine card shows a truthful
// "연결 준비 중" state instead of fabricated success rates/latency (§27 Mock 금지).
const ENGINES = ['명리 엔진', '자미두수 엔진', '기문둔갑 엔진'] as const;

function EngineCard({ name }: { name: string }) {
  return (
    <View
      style={{
        flex: 1,
        minWidth: 260,
        backgroundColor: adminTheme.surface,
        borderWidth: 1,
        borderColor: adminTheme.border,
        borderRadius: 8,
        padding: 20,
        gap: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text variant="headingMedium" style={{ color: adminTheme.ink }}>
          {name}
        </Text>
        <View
          style={{
            backgroundColor: adminTheme.neutralBg,
            borderRadius: 2,
            paddingHorizontal: 8,
            paddingVertical: 3,
          }}
        >
          <Text variant="caption" style={{ color: adminTheme.inkMuted, fontWeight: '600' }}>
            연결 준비 중
          </Text>
        </View>
      </View>
      <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>
        성공률 · 처리 시간 등 실시간 지표는 해석엔진 텔레메트리 연결 후
        표시됩니다.
      </Text>
    </View>
  );
}

export default function AdminEngineStatusScreen() {
  return (
    <Stack gap="xl">
      <AdminPageHeader
        title="해석엔진 상태"
        subtitle="AI 운세 및 사주 해석 엔진의 실시간 가동 상태 및 성능 지표입니다."
      />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        {ENGINES.map((name) => (
          <EngineCard key={name} name={name} />
        ))}
      </View>
      <View
        style={{
          backgroundColor: adminTheme.infoBg,
          borderWidth: 1,
          borderColor: adminTheme.border,
          borderRadius: 8,
          padding: 16,
        }}
      >
        <Text variant="bodySmall" style={{ color: adminTheme.info }}>
          AI Gateway · Auth · Database · Fortune Worker 상태 모니터링은 운영
          텔레메트리 연동 후 제공됩니다. 실제 지표가 없는 항목은 가짜 값을
          표시하지 않습니다.
        </Text>
      </View>
    </Stack>
  );
}
