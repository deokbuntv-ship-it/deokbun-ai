import { View } from 'react-native';

import { Text } from '@/components/Text';

import { adminMono, adminTheme } from '../adminTheme';
import type {
  AdminFortuneMailDetail,
  AdminFortuneMailStatus,
} from '../services/adminFortuneMailService';
import { AdminBadge, type AdminBadgeTone } from './AdminBadge';
import { AdminDetailDrawer } from './AdminDetailDrawer';

// ADMIN_07_FORTUNE_MAIL_DETAIL (Stitch final_lock_5). Fully-implemented detail
// drawer: given a real AdminFortuneMailDetail it renders every field + timeline;
// with no data (pipeline unconnected) it shows a truthful "연결 준비 중". Actions
// (다시 생성/즉시 발송/발송 취소) are DISABLED "기능 연결 준비 중" — never faked.
const STATUS: Record<AdminFortuneMailStatus, { label: string; tone: AdminBadgeTone }> = {
  queued: { label: '생성 대기', tone: 'neutral' },
  generating: { label: '생성 중', tone: 'warning' },
  generated: { label: '생성 완료', tone: 'info' },
  scheduled: { label: '발송 예약', tone: 'info' },
  sent: { label: '발송 완료', tone: 'success' },
  gen_failed: { label: '생성 실패', tone: 'danger' },
  send_failed: { label: '발송 실패', tone: 'danger' },
};

type Props = {
  visible: boolean;
  onClose: () => void;
  detail: AdminFortuneMailDetail | null;
  loading?: boolean;
};

export function FortuneMailDetailDrawer({ visible, onClose, detail, loading }: Props) {
  const status = detail ? STATUS[detail.status] : undefined;

  return (
    <AdminDetailDrawer
      visible={visible}
      onClose={onClose}
      title={detail ? detail.id : '운세우편 상세'}
      badge={status ? { label: status.label, tone: status.tone } : undefined}
      footer={
        <>
          <DisabledAction label="발송 취소" tone="danger" />
          <DisabledAction label="다시 생성" />
          <DisabledAction label="즉시 발송" />
        </>
      }
    >
      {loading ? (
        <Text variant="bodyMedium" style={{ color: adminTheme.inkMuted }}>불러오는 중...</Text>
      ) : !detail ? (
        <View style={{ gap: 8 }}>
          <Text variant="headingMedium" style={{ color: adminTheme.ink }}>연결 준비 중</Text>
          <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>
            운세 생성·발송 파이프라인 연결 후 이곳에서 실제 운세우편 상세(메타데이터,
            콘텐츠 미리보기, 생성/발송 타임라인)를 확인할 수 있습니다. 임의의 샘플
            데이터를 표시하지 않습니다.
          </Text>
        </View>
      ) : (
        <>
          <Section title="생성 메타데이터">
            <Row label="사용자" value={detail.user} />
            <Row label="분석 대상자" value={detail.subject} />
            <Row label="운세 유형" value={detail.type} />
            <Row label="생성 시각" value={detail.createdAt} />
            <Row label="발송 예정" value={detail.scheduledAt ?? '–'} />
            <Row label="발송 시각" value={detail.sentAt ?? '–'} />
            <Row label="모델" value={detail.model ?? '–'} mono />
            <Row label="프롬프트 버전" value={detail.promptVersion ?? '–'} mono />
            <Row label="토큰" value={detail.tokens != null ? detail.tokens.toLocaleString() : '–'} mono />
            <Row label="비용" value={detail.cost ?? '–'} mono />
          </Section>

          <Section title="콘텐츠 미리보기">
            <Text variant="bodyMedium" style={{ color: adminTheme.ink, fontWeight: '600' }}>{detail.title}</Text>
            <Text variant="bodySmall" style={{ color: adminTheme.inkVariant }}>{detail.contentPreview}</Text>
          </Section>

          <Section title="이벤트 타임라인">
            {detail.timeline.map((t, i) => (
              <View key={`${t.label}-${i}`} style={{ gap: 2 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                  <Text variant="bodySmall" style={{ color: adminTheme.ink, fontWeight: '600' }}>{t.label}</Text>
                  <Text variant="caption" style={{ color: adminTheme.inkMuted, fontFamily: adminMono }}>{t.at}</Text>
                </View>
                {t.note ? (
                  <Text variant="caption" style={{ color: adminTheme.inkMuted }}>{t.note}</Text>
                ) : null}
              </View>
            ))}
          </Section>
        </>
      )}
    </AdminDetailDrawer>
  );
}

function DisabledAction({ label, tone }: { label: string; tone?: 'danger' }) {
  return (
    <View style={{ paddingHorizontal: 14, paddingVertical: 9, borderRadius: 4, backgroundColor: adminTheme.neutralBg, opacity: 0.7 }}>
      <Text variant="bodySmall" style={{ color: tone === 'danger' ? adminTheme.danger : adminTheme.inkMuted, fontWeight: '600' }}>
        {label} (준비 중)
      </Text>
    </View>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ borderWidth: 1, borderColor: adminTheme.border, borderRadius: 8, padding: 16, gap: 10 }}>
      <Text variant="bodyLarge" style={{ color: adminTheme.ink, fontWeight: '700' }}>{title}</Text>
      {children}
    </View>
  );
}
function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
      <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>{label}</Text>
      <Text variant="bodySmall" style={{ color: adminTheme.ink, fontFamily: mono ? adminMono : undefined, flexShrink: 1, textAlign: 'right' }}>{value}</Text>
    </View>
  );
}
