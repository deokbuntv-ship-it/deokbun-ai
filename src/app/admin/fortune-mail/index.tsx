import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { TextInput, View, type StyleProp, type ViewStyle } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import {
  AdminBadge,
  AdminPageHeader,
  AdminStateView,
  AdminTable,
  type AdminBadgeTone,
  type AdminTableColumn,
} from '@/features/admin';
import { adminMono, adminTheme } from '@/features/admin/adminTheme';
import { AdminConfirmDialog } from '@/features/admin/components/AdminConfirmDialog';
import {
  adminEmailCampaignService,
  type EmailCampaignDetail,
  type EmailCampaignStatus,
  type EmailCampaignSummary,
} from '@/features/admin/services/adminEmailCampaignService';
import { renderMonthlyEmail } from '@/features/fortune/email/emailContent';
import type { MonthlyFortuneRecord } from '@/features/monthly/types';

// ADMIN 월간 운세 이메일 캠페인 콘솔 (Sprint J4). Operator surface over adminEmailCampaignService: create a
// monthly-fortune campaign, build its recipient set, preview the (synthetic) email, and drive scheduling /
// sending / cancel / retry per campaign. Every write goes through the server RPCs — no client-side send, no
// fabricated rows (a failed load shows an honest empty/error, never sample data). The list & detail never show
// recipient PII, only aggregate counts. Real delivery still needs the email provider (EMAIL_PROVIDER_LIVE is
// external-blocked): 지금 발송 enqueues the campaign; actual mail goes out once the provider is connected.
type ScreenStatus = 'loading' | 'ready' | 'error';

const STATUS_META: Record<EmailCampaignStatus, { label: string; tone: AdminBadgeTone }> = {
  DRAFT: { label: '초안', tone: 'neutral' },
  SCHEDULED: { label: '발송 예약', tone: 'info' },
  PROCESSING: { label: '발송 중', tone: 'warning' },
  SENT: { label: '발송 완료', tone: 'success' },
  PARTIAL: { label: '일부 발송', tone: 'warning' },
  FAILED: { label: '발송 실패', tone: 'danger' },
  CANCELLED: { label: '취소됨', tone: 'neutral' },
};

// Per-recipient delivery states → consumer-friendly Korean (never a raw backend enum). Unknown keys fall back
// to the key so a new server state still renders truthfully rather than being hidden.
const DELIVERY_LABEL: Record<string, string> = {
  PENDING: '발송 대기',
  PROCESSING: '처리 중',
  SENT: '발송 완료',
  FAILED: '실패',
  SKIPPED: '제외',
  CANCELLED: '취소',
};

function clampInt(value: string, min: number, max: number, fallback: number): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function fmtDateTime(iso: string | null): string {
  if (!iso) return '–';
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return '–';
  const d = new Date(t);
  const p = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// A synthetic record purely for the preview Card (§4.8) — NEVER a real user's fortune and NEVER sent. The
// renderer only reads year/month + the result copy; the tier is display-irrelevant here (cast, not a real tier).
function buildPreviewRecord(year: number, month: number): MonthlyFortuneRecord {
  return {
    id: 'preview',
    year,
    month,
    timezone: 'Asia/Seoul',
    overallTier: 'STEADY' as any,
    result: {
      headline: '미리보기 예시',
      verdict: '',
      overallSummary: '실제 발송 시 각 사용자의 이번 달 운세가 들어갑니다.',
      overallTier: 'STEADY' as any,
      opportunities: [],
      cautions: [],
      actions: [],
    },
    evidenceVersion: null,
    planVersion: null,
    policyVersion: null,
    model: null,
    createdAt: '',
    updatedAt: '',
  };
}

type CreateResult = { recipients: { pending: number; skippedNoConsent: number; skippedInvalidEmail: number } | null };

export default function AdminFortuneMailScreen() {
  const [status, setStatus] = useState<ScreenStatus>('loading');
  const [campaigns, setCampaigns] = useState<EmailCampaignSummary[]>([]);

  // Create form.
  const [year, setYear] = useState(() => String(new Date().getFullYear()));
  const [month, setMonth] = useState(() => String(new Date().getMonth() + 1));
  const [subject, setSubject] = useState(() => `[덕분이] ${new Date().getMonth() + 1}월 운세가 도착했어요`);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createResult, setCreateResult] = useState<CreateResult | null>(null);

  // Selected campaign detail + per-campaign actions.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<EmailCampaignDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(false);
  // ⚠ 즉시 발송은 회수가 안 된다. 누르는 순간이 아니라 **확인한 순간**에 나가게 한다.
  //   그리고 확인 문구에 수신자 수를 넣는다 — 몇 명에게 가는지 모르고 누르는 일이 없어야 한다.
  const [sendNowFor, setSendNowFor] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [scheduleInput, setScheduleInput] = useState('');

  const load = useCallback(async (silent = false) => {
    if (!silent) setStatus('loading');
    try {
      const list = await adminEmailCampaignService.list();
      setCampaigns(list);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const loadDetail = useCallback(async (id: string) => {
    setDetail(null);
    setDetailError(false);
    setDetailLoading(true);
    const d = await adminEmailCampaignService.get(id);
    setDetail(d);
    setDetailError(d === null);
    setDetailLoading(false);
  }, []);

  const selectCampaign = useCallback(
    (id: string) => {
      setSelectedId(id);
      setActionMsg(null);
      setScheduleInput('');
      void loadDetail(id);
    },
    [loadDetail],
  );

  const closeDetail = () => {
    setSelectedId(null);
    setDetail(null);
    setDetailError(false);
    setActionMsg(null);
  };

  const preview = useMemo(() => {
    const y = clampInt(year, 2000, 2100, new Date().getFullYear());
    const m = clampInt(month, 1, 12, 1);
    return renderMonthlyEmail(buildPreviewRecord(y, m), subject);
  }, [year, month, subject]);

  const create = async () => {
    setCreateError(null);
    setCreateResult(null);
    const y = Number.parseInt(year, 10);
    const m = Number.parseInt(month, 10);
    const subj = subject.trim();
    if (!Number.isInteger(y) || y < 2020 || y > 2100) {
      setCreateError('연도를 올바르게 입력해 주세요.');
      return;
    }
    if (!Number.isInteger(m) || m < 1 || m > 12) {
      setCreateError('월을 1~12 사이로 입력해 주세요.');
      return;
    }
    if (subj.length === 0) {
      setCreateError('이메일 제목을 입력해 주세요.');
      return;
    }
    setCreating(true);
    const id = await adminEmailCampaignService.create({ year: y, month: m, subject: subj });
    if (!id) {
      setCreating(false);
      setCreateError('캠페인을 만들지 못했어요. 권한 또는 연결 상태를 확인해 주세요.');
      return;
    }
    const recipients = await adminEmailCampaignService.buildRecipients(id);
    setCreateResult({ recipients });
    await load(true);
    setCreating(false);
    selectCampaign(id);
  };

  // Detail actions — each disables all buttons while in flight (double-submit safety) and re-fetches list +
  // detail on success so the counts/status stay authoritative. The success/failure line is set last so the
  // detail re-fetch (which does not touch actionMsg) never wipes it.
  const runReturningCount = async (
    id: string,
    fn: (campaignId: string) => Promise<number | null>,
    okMsg: (count: number) => string,
    failMsg: string,
  ) => {
    setActionBusy(true);
    const count = await fn(id);
    if (count !== null) {
      await load(true);
      await loadDetail(id);
    }
    setActionBusy(false);
    setActionMsg(count === null ? failMsg : okMsg(count));
  };

  const doSchedule = async (id: string) => {
    const raw = scheduleInput.trim();
    const t = Date.parse(raw);
    if (!Number.isFinite(t)) {
      setActionMsg('예약 시각을 올바른 형식(예: 2026-09-01T09:00:00+09:00)으로 입력해 주세요.');
      return;
    }
    setActionBusy(true);
    const ok = await adminEmailCampaignService.schedule(id, new Date(t).toISOString());
    if (ok) {
      await load(true);
      await loadDetail(id);
    }
    setActionBusy(false);
    setActionMsg(ok ? '발송을 예약했어요.' : '예약하지 못했어요. 캠페인 상태를 확인해 주세요.');
  };

  const doSendNow = async (id: string) => {
    setActionBusy(true);
    const ok = await adminEmailCampaignService.sendNow(id);
    if (ok) {
      await load(true);
      await loadDetail(id);
    }
    setActionBusy(false);
    setActionMsg(
      ok
        ? '발송을 시작했어요. 실제 메일 전송은 이메일 제공자 연동 후 진행됩니다.'
        : '발송을 시작하지 못했어요. 캠페인 상태를 확인해 주세요.',
    );
  };

  return (
    <Stack gap="xl">
      <AdminPageHeader
        title="월간 운세 이메일"
        subtitle="이번 달 운세를 이메일로 안내하는 캠페인을 만들고, 대상자 집계·미리보기·예약·발송을 관리합니다."
      />

      <View style={{ borderWidth: 1, borderColor: adminTheme.border, borderRadius: 10, padding: 14, backgroundColor: adminTheme.warningBg }}>
        <Text variant="bodySmall" style={{ color: adminTheme.warning, fontWeight: '700' }}>
          이메일 발송 준비 중
        </Text>
        <Text variant="bodySmall" style={{ color: adminTheme.inkVariant, marginTop: 4, lineHeight: 18 }}>
          발송은 이메일 제공자 연동 후 실제 전송됩니다 (현재 준비 중). 지금은 캠페인 생성·대상자 집계·예약·발송 등록까지
          가능하며, 실제 메일 전송은 제공자 연결 후 진행됩니다.
        </Text>
      </View>

      {/* (1) 새 캠페인 */}
      <Card>
        <Stack gap="md">
          <Text variant="bodyLarge" style={{ fontWeight: '700', color: adminTheme.ink }}>
            새 캠페인
          </Text>
          <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
            <Field label="연도" style={{ width: 120 }}>
              <TextField value={year} onChangeText={(t) => setYear(t.replace(/[^0-9]/g, ''))} keyboard="numeric" placeholder="2026" />
            </Field>
            <Field label="월 (1–12)" style={{ width: 120 }}>
              <TextField value={month} onChangeText={(t) => setMonth(t.replace(/[^0-9]/g, ''))} keyboard="numeric" placeholder="9" />
            </Field>
          </View>
          <Field label="이메일 제목">
            <TextField value={subject} onChangeText={setSubject} placeholder="예: [덕분이] 9월 운세가 도착했어요" />
          </Field>

          {createError ? (
            <Text variant="bodySmall" style={{ color: adminTheme.danger }}>
              {createError}
            </Text>
          ) : null}

          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <Button variant="primary" label={creating ? '만드는 중…' : '캠페인 만들기'} onPress={() => void create()} disabled={creating} />
          </View>

          {createResult ? (
            <View style={{ borderWidth: 1, borderColor: adminTheme.border, borderRadius: 8, padding: 12, backgroundColor: adminTheme.successBg }}>
              <Text variant="bodySmall" style={{ color: adminTheme.success, fontWeight: '700' }}>
                {createResult.recipients
                  ? `대상 ${createResult.recipients.pending}명 · 동의 제외 ${createResult.recipients.skippedNoConsent} · 이메일 오류 ${createResult.recipients.skippedInvalidEmail}`
                  : '캠페인을 만들었어요. 대상자 집계는 아래 목록에서 확인해 주세요.'}
              </Text>
            </View>
          ) : null}
        </Stack>
      </Card>

      {/* (2) 미리보기 — 서비스 호출 없음 */}
      <Card>
        <Stack gap="sm">
          <Text variant="bodyLarge" style={{ fontWeight: '700', color: adminTheme.ink }}>
            이메일 미리보기
          </Text>
          <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>
            예시 데이터입니다. 실제 발송 시 각 사용자의 이번 달 운세로 채워집니다.
          </Text>
          <View style={{ borderWidth: 1, borderColor: adminTheme.border, borderRadius: 8, overflow: 'hidden' }}>
            <View style={{ backgroundColor: adminTheme.tableHeaderBg, paddingHorizontal: 14, paddingVertical: 10, gap: 2 }}>
              <Text variant="caption" style={{ color: adminTheme.inkMuted, fontWeight: '700' }}>
                제목
              </Text>
              <Text variant="bodyMedium" style={{ color: adminTheme.ink, fontWeight: '700' }}>
                {preview.subject}
              </Text>
            </View>
            <View style={{ padding: 14 }}>
              <Text variant="bodySmall" style={{ color: adminTheme.inkVariant, fontFamily: adminMono, lineHeight: 20 }}>
                {preview.content}
              </Text>
            </View>
          </View>
        </Stack>
      </Card>

      {/* (3) 캠페인 목록 */}
      <Stack gap="sm">
        <Text variant="bodyLarge" style={{ fontWeight: '700', color: adminTheme.ink }}>
          캠페인 목록
        </Text>
        {status === 'loading' ? (
          <AdminStateView state="loading" />
        ) : status === 'error' ? (
          <AdminStateView state="error" message="캠페인 목록을 불러오지 못했어요." onRetry={() => void load()} />
        ) : campaigns.length === 0 ? (
          <Card>
            <Stack gap="sm" align="flex-start">
              <Text variant="bodyLarge" style={{ fontWeight: '700', color: adminTheme.ink }}>
                아직 캠페인이 없어요
              </Text>
              <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>
                위에서 첫 캠페인을 만들어 보세요. 방금 만들었다면 새로고침해 주세요.
              </Text>
              <Button label="새로고침" variant="secondary" onPress={() => void load()} />
            </Stack>
          </Card>
        ) : (
          <AdminTable
            columns={buildColumns()}
            rows={campaigns}
            keyExtractor={(r) => r.id}
            onRowPress={(r) => selectCampaign(r.id)}
          />
        )}
      </Stack>

      {/* (4) 선택한 캠페인 상세 + 액션 */}
      <AdminConfirmDialog
        visible={sendNowFor !== null}
        busy={actionBusy}
        title="지금 발송할까요?"
        what="이 캠페인의 대기 중인 메일이 발송 대기열로 넘어갑니다. 한 번 나간 메일은 회수할 수 없습니다."
        scope={
          detail
            ? `대상자 ${detail.campaign.totalCount}명에게 발송됩니다. 동의하지 않았거나 주소가 잘못된 사람은 이미 제외된 숫자입니다.`
            : '대상자 수를 아직 불러오지 못했습니다. 목록을 다시 연 뒤에 발송하십시오.'
        }
        reversible={
          '아직 나가지 않은 건은 캠페인을 취소해 멈출 수 있습니다. **이미 나간 메일은 되돌릴 수 없습니다.** '
          + '이메일 제공자(EMAIL_PROVIDER)가 아직 연결되지 않았다면 실제 전송은 일어나지 않고 대기 상태로만 남습니다.'
        }
        confirmLabel="발송합니다"
        onCancel={() => setSendNowFor(null)}
        onConfirm={() => {
          const id = sendNowFor;
          setSendNowFor(null);
          if (id) void doSendNow(id);
        }}
      />

      {selectedId ? (
        <CampaignDetailPanel
          loading={detailLoading}
          error={detailError}
          detail={detail}
          busy={actionBusy}
          message={actionMsg}
          scheduleInput={scheduleInput}
          onScheduleInputChange={setScheduleInput}
          onFillTomorrow={() => setScheduleInput(new Date(Date.now() + 86_400_000).toISOString())}
          onSchedule={() => void doSchedule(selectedId)}
          onSendNow={() => setSendNowFor(selectedId)}
          onCancel={() =>
            void runReturningCount(
              selectedId,
              adminEmailCampaignService.cancel,
              (c) => `발송 대기 ${c}건을 취소했어요.`,
              '취소하지 못했어요. 캠페인 상태를 확인해 주세요.',
            )
          }
          onRetry={() =>
            void runReturningCount(
              selectedId,
              adminEmailCampaignService.retryFailed,
              (c) => `실패 ${c}건을 재시도 대기로 되돌렸어요.`,
              '재시도하지 못했어요. 캠페인 상태를 확인해 주세요.',
            )
          }
          onReload={() => void loadDetail(selectedId)}
          onClose={closeDetail}
        />
      ) : null}
    </Stack>
  );
}

function buildColumns(): AdminTableColumn<EmailCampaignSummary>[] {
  return [
    { key: 'created', label: '생성', flex: 1.6, render: (r) => fmtDateTime(r.createdAt) },
    { key: 'target', label: '대상 월', flex: 1.2, render: (r) => `${r.targetYear}년 ${r.targetMonth}월` },
    { key: 'subject', label: '제목', flex: 3, render: (r) => r.subject || '(제목 없음)' },
    {
      key: 'status',
      label: '상태',
      flex: 1.2,
      render: (r) => <AdminBadge label={STATUS_META[r.status].label} tone={STATUS_META[r.status].tone} />,
    },
    { key: 'sent', label: '발송', flex: 0.7, align: 'right', render: (r) => String(r.sentCount) },
    { key: 'failed', label: '실패', flex: 0.7, align: 'right', render: (r) => String(r.failedCount) },
    { key: 'skipped', label: '제외', flex: 0.7, align: 'right', render: (r) => String(r.skippedCount) },
    { key: 'total', label: '전체', flex: 0.7, align: 'right', render: (r) => String(r.totalCount) },
  ];
}

function CampaignDetailPanel({
  loading,
  error,
  detail,
  busy,
  message,
  scheduleInput,
  onScheduleInputChange,
  onFillTomorrow,
  onSchedule,
  onSendNow,
  onCancel,
  onRetry,
  onReload,
  onClose,
}: {
  loading: boolean;
  error: boolean;
  detail: EmailCampaignDetail | null;
  busy: boolean;
  message: string | null;
  scheduleInput: string;
  onScheduleInputChange: (t: string) => void;
  onFillTomorrow: () => void;
  onSchedule: () => void;
  onSendNow: () => void;
  onCancel: () => void;
  onRetry: () => void;
  onReload: () => void;
  onClose: () => void;
}) {
  if (loading) {
    return (
      <Card>
        <AdminStateView state="loading" message="캠페인 정보를 불러오는 중이에요." />
      </Card>
    );
  }
  if (error || !detail) {
    return (
      <Card>
        <Stack gap="sm" align="flex-start">
          <Text variant="bodyMedium" style={{ color: adminTheme.inkVariant }}>
            캠페인 정보를 불러오지 못했어요.
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button label="다시 시도" variant="secondary" onPress={onReload} />
            <Button label="닫기" variant="tertiary" onPress={onClose} />
          </View>
        </Stack>
      </Card>
    );
  }

  const c = detail.campaign;
  const meta = STATUS_META[c.status];
  const canSchedule = c.status === 'DRAFT' || c.status === 'SCHEDULED';
  const canSend = c.status === 'DRAFT' || c.status === 'SCHEDULED';
  const canCancel = c.status === 'DRAFT' || c.status === 'SCHEDULED' || c.status === 'PROCESSING';
  const canRetry = c.failedCount > 0;
  const breakdown = Object.entries(detail.deliveryStatusBreakdown);

  return (
    <Card>
      <Stack gap="md">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
          <Stack gap="xs" style={{ flexShrink: 1 }}>
            <Text variant="bodyLarge" style={{ fontWeight: '700', color: adminTheme.ink }}>
              {c.targetYear}년 {c.targetMonth}월 캠페인
            </Text>
            <Text variant="bodyMedium" style={{ color: adminTheme.inkVariant }}>
              {c.subject || '(제목 없음)'}
            </Text>
          </Stack>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <AdminBadge label={meta.label} tone={meta.tone} />
            <Button label="닫기" variant="tertiary" onPress={onClose} />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
          <StatTile label="전체" value={c.totalCount} />
          <StatTile label="발송" value={c.sentCount} tone="success" />
          <StatTile label="실패" value={c.failedCount} tone={c.failedCount > 0 ? 'danger' : undefined} />
          <StatTile label="제외" value={c.skippedCount} />
        </View>

        <View style={{ flexDirection: 'row', gap: 20, flexWrap: 'wrap' }}>
          <Meta label="예약 시각" value={fmtDateTime(c.scheduledAt)} />
          <Meta label="완료 시각" value={fmtDateTime(c.completedAt)} />
          <Meta label="템플릿" value={c.templateVersion || '–'} mono />
        </View>

        {breakdown.length > 0 ? (
          <Stack gap="sm">
            <Text variant="bodySmall" style={{ color: adminTheme.inkVariant, fontWeight: '700' }}>
              발송 상태 분포
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
              {breakdown.map(([k, v]) => (
                <StatTile key={k} label={DELIVERY_LABEL[k] ?? k} value={v} />
              ))}
            </View>
          </Stack>
        ) : null}

        <View style={{ height: 1, backgroundColor: adminTheme.border }} />

        <Stack gap="sm">
          <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>
            발송은 이메일 제공자 연동 후 실제 전송됩니다 (현재 준비 중).
          </Text>

          <Field label="발송 예약 시각 (ISO)">
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <View style={{ flexGrow: 1, minWidth: 220 }}>
                <TextField
                  value={scheduleInput}
                  onChangeText={onScheduleInputChange}
                  placeholder="2026-09-01T09:00:00+09:00"
                />
              </View>
              <Button label="+1일" variant="tertiary" onPress={onFillTomorrow} disabled={busy} />
              <Button label="발송 예약" variant="secondary" onPress={onSchedule} disabled={busy || !canSchedule} />
            </View>
          </Field>

          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <Button variant="primary" label="지금 발송" onPress={onSendNow} disabled={busy || !canSend} />
            <Button label="발송 취소" variant="danger" onPress={onCancel} disabled={busy || !canCancel} />
            <Button label="실패 재시도" variant="secondary" onPress={onRetry} disabled={busy || !canRetry} />
          </View>

          {message ? (
            <Text variant="bodySmall" style={{ color: adminTheme.inkVariant }}>
              {message}
            </Text>
          ) : null}
        </Stack>
      </Stack>
    </Card>
  );
}

function TextField({
  value,
  onChangeText,
  placeholder,
  keyboard = 'default',
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboard?: 'default' | 'numeric';
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      accessibilityLabel={placeholder}
      placeholder={placeholder}
      placeholderTextColor={adminTheme.inkMuted}
      keyboardType={keyboard}
      autoCapitalize="none"
      style={{
        borderWidth: 1,
        borderColor: adminTheme.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: adminTheme.ink,
        backgroundColor: adminTheme.surface,
      }}
    />
  );
}

function Field({ label, children, style }: { label: string; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ gap: 6 }, style]}>
      <Text variant="bodySmall" style={{ color: adminTheme.inkVariant, fontWeight: '600' }}>
        {label}
      </Text>
      {children}
    </View>
  );
}

function Meta({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={{ gap: 2 }}>
      <Text variant="caption" style={{ color: adminTheme.inkMuted }}>
        {label}
      </Text>
      <Text variant="bodySmall" style={{ color: adminTheme.ink, fontFamily: mono ? adminMono : undefined }}>
        {value}
      </Text>
    </View>
  );
}

function StatTile({ label, value, tone }: { label: string; value: number | string; tone?: AdminBadgeTone }) {
  const color =
    tone === 'danger'
      ? adminTheme.danger
      : tone === 'success'
        ? adminTheme.success
        : tone === 'warning'
          ? adminTheme.warning
          : adminTheme.ink;
  return (
    <View
      style={{
        minWidth: 92,
        flexGrow: 1,
        borderWidth: 1,
        borderColor: adminTheme.border,
        borderRadius: 8,
        padding: 12,
        backgroundColor: adminTheme.surface,
        gap: 4,
      }}
    >
      <Text variant="caption" style={{ color: adminTheme.inkMuted }}>
        {label}
      </Text>
      <Text variant="headingMedium" style={{ color, fontWeight: '700' }}>
        {String(value)}
      </Text>
    </View>
  );
}
