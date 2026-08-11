import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import {
  AdminBadge,
  AdminPageHeader,
  AdminStateView,
  AdminTable,
  FortuneMailDetailDrawer,
  KpiCard,
  adminFortuneMailService,
  type AdminBadgeTone,
  type AdminFortuneMailDetail,
  type AdminFortuneMailListItem,
  type AdminFortuneMailStatus,
  type AdminTableColumn,
} from '@/features/admin';
import { adminTheme } from '@/features/admin/adminTheme';

// ADMIN_06_FORTUNE_MAIL (Stitch final_lock_7) + row → ADMIN_07 detail drawer.
// Pipeline unconnected → KPIs/list are truthfully empty and no mail is fabricated
// (§27). The table + detail-drawer call seam is fully wired: real rows will render
// and open FortuneMailDetailDrawer with complete field/timeline detail.
const KPIS = ['금일 발송 예정', '생성 중', '발송 완료 (24h)', '실패'];

const STATUS_META: Record<AdminFortuneMailStatus, { label: string; tone: AdminBadgeTone }> = {
  queued: { label: '생성 대기', tone: 'neutral' },
  generating: { label: '생성 중', tone: 'warning' },
  generated: { label: '생성 완료', tone: 'info' },
  scheduled: { label: '발송 예약', tone: 'info' },
  sent: { label: '발송 완료', tone: 'success' },
  gen_failed: { label: '생성 실패', tone: 'danger' },
  send_failed: { label: '발송 실패', tone: 'danger' },
};

type Status = 'loading' | 'ready' | 'error';

export default function AdminFortuneMailScreen() {
  const [rows, setRows] = useState<AdminFortuneMailListItem[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminFortuneMailDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    let active = true;
    adminFortuneMailService
      .listMail()
      .then((r) => {
        if (!active) return;
        setRows(r);
        setStatus('ready');
      })
      .catch(() => active && setStatus('error'));
    return () => {
      active = false;
    };
  }, []);

  const openDetail = (item: AdminFortuneMailListItem) => {
    setOpenId(item.id);
    setDetail(null);
    setDetailLoading(true);
    adminFortuneMailService
      .getMailDetail(item.id)
      .then((d) => setDetail(d))
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  };

  const columns: AdminTableColumn<AdminFortuneMailListItem>[] = [
    { key: 'id', label: '운세우편 ID', flex: 2, mono: true, render: (r) => r.id.slice(0, 12) },
    { key: 'user', label: '사용자', flex: 2, render: (r) => r.user },
    { key: 'subject', label: '분석 대상자', flex: 1.5, render: (r) => r.subject },
    { key: 'type', label: '종류', flex: 1, render: (r) => r.type },
    { key: 'title', label: '제목', flex: 3, render: (r) => r.title },
    { key: 'created', label: '생성 시각', flex: 2, render: (r) => r.createdAt },
    { key: 'scheduled', label: '발송 예정', flex: 2, render: (r) => r.scheduledAt ?? '–' },
    {
      key: 'status',
      label: '상태',
      flex: 1.5,
      render: (r) => <AdminBadge label={STATUS_META[r.status].label} tone={STATUS_META[r.status].tone} />,
    },
  ];

  return (
    <Stack gap="xl">
      <Stack direction="row" align="center" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <AdminPageHeader title="운세우편 관리" subtitle="발송 예정 및 완료된 운세 리포트를 모니터링합니다." />
        <View style={{ backgroundColor: adminTheme.neutralBg, borderRadius: 4, paddingHorizontal: 16, paddingVertical: 10 }}>
          <Text variant="bodySmall" style={{ color: adminTheme.inkMuted, fontWeight: '600' }}>+ 수동 발송 예약 (준비 중)</Text>
        </View>
      </Stack>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        {KPIS.map((label) => (
          <KpiCard key={label} label={label} value="—" sub="연결 준비 중" />
        ))}
      </View>

      {status === 'loading' ? (
        <AdminStateView state="loading" />
      ) : status === 'error' ? (
        <AdminStateView state="error" message="운세우편 목록을 불러오지 못했습니다." />
      ) : rows.length === 0 ? (
        <View style={{ backgroundColor: adminTheme.surface, borderWidth: 1, borderColor: adminTheme.border, borderRadius: 8, padding: 40, alignItems: 'center', gap: 8 }}>
          <Text variant="headingMedium" style={{ color: adminTheme.ink }}>아직 운세우편이 없습니다</Text>
          <Text variant="bodySmall" style={{ color: adminTheme.inkMuted, textAlign: 'center' }}>
            운세 생성·발송 파이프라인 연결 후 실제 운세우편이 이곳에 표시됩니다. 임의의
            샘플 데이터를 표시하지 않습니다.
          </Text>
        </View>
      ) : (
        <AdminTable columns={columns} rows={rows} keyExtractor={(r) => r.id} onRowPress={openDetail} />
      )}

      <FortuneMailDetailDrawer visible={openId !== null} onClose={() => setOpenId(null)} detail={detail} loading={detailLoading} />
    </Stack>
  );
}
