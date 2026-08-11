import { View } from 'react-native';

import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { AdminPageHeader, KpiCard } from '@/features/admin';
import { adminTheme } from '@/features/admin/adminTheme';

// ADMIN_06_FORTUNE_MAIL (Stitch final_lock_7). Generated/scheduled fortune-mail
// monitoring. The fortune engine + mail pipeline are not connected yet, so KPIs
// and the table render a truthful "연결 준비 중" / empty state — no fabricated
// mail rows, counts, or costs (§27 Mock 금지).
const KPIS = ['금일 발송 예정', '생성 중', '발송 완료 (24h)', '실패'];

const COLUMNS = [
  '운세우편 ID',
  '사용자',
  '분석 대상자',
  '종류',
  '제목',
  '생성 시각',
  '발송 예정',
  '상태',
];

export default function AdminFortuneMailScreen() {
  return (
    <Stack gap="xl">
      <Stack direction="row" align="center" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <AdminPageHeader
          title="운세우편 관리"
          subtitle="발송 예정 및 완료된 운세 리포트를 모니터링합니다."
        />
        <View
          style={{
            backgroundColor: adminTheme.neutralBg,
            borderRadius: 4,
            paddingHorizontal: 16,
            paddingVertical: 10,
          }}
        >
          <Text variant="bodySmall" style={{ color: adminTheme.inkMuted, fontWeight: '600' }}>
            + 수동 발송 예약 (준비 중)
          </Text>
        </View>
      </Stack>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        {KPIS.map((label) => (
          <KpiCard key={label} label={label} value="—" sub="연결 준비 중" />
        ))}
      </View>

      {/* Table shell + truthful empty state */}
      <View
        style={{
          backgroundColor: adminTheme.surface,
          borderWidth: 1,
          borderColor: adminTheme.border,
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: adminTheme.tableHeaderBg,
            paddingVertical: 10,
            paddingHorizontal: 16,
            gap: 12,
          }}
        >
          {COLUMNS.map((c) => (
            <Text
              key={c}
              variant="caption"
              style={{ color: adminTheme.inkVariant, fontWeight: '700', flex: 1 }}
            >
              {c}
            </Text>
          ))}
        </View>
        <View style={{ padding: 40, alignItems: 'center', gap: 8 }}>
          <Text variant="headingMedium" style={{ color: adminTheme.ink }}>
            아직 운세우편이 없습니다
          </Text>
          <Text variant="bodySmall" style={{ color: adminTheme.inkMuted, textAlign: 'center' }}>
            운세 생성·발송 파이프라인 연결 후 실제 운세우편이 이곳에
            표시됩니다. 임의의 샘플 데이터를 표시하지 않습니다.
          </Text>
        </View>
      </View>
    </Stack>
  );
}
