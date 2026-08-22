import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import {
  AdminBadge,
  AdminPageHeader,
  AdminSelect,
  AdminStateView,
  AdminTable,
  KpiCard,
  type AdminTableColumn,
} from '@/features/admin';
import { adminMono, adminTheme } from '@/features/admin/adminTheme';
import {
  adminEconomyService,
  type EconomyOverview,
} from '@/features/admin/services/adminEconomyService';

// ADMIN 덕 경제 (Sprint J5) — Duk economy operations console over the is_admin()-gated ledger RPCs. Read-only
// aggregates + one AUDITED manual-adjustment path. Accounting lives on the append-only ledger: an adjustment is
// never an edit, it appends an immutable ADMIN_ADJUSTMENT row + an audit record (server-side). Reads fail CLOSED
// to an error/empty state, never a misleading zero (§86). The unit shown to operators is "덕". No PII beyond the
// server's own wallet snapshot for an explicitly entered user ID; no secrets/tokens are ever returned.
type Loadable = 'loading' | 'ready' | 'error';
type WalletState = 'idle' | 'loading' | 'ready' | 'error';

const BUCKETS = ['PLUS', 'REWARD', 'PAID'] as const;
type Bucket = (typeof BUCKETS)[number];
const BUCKET_LABEL: Record<Bucket, string> = {
  PLUS: '무료 (PLUS)',
  REWARD: '보상 (REWARD)',
  PAID: '유료 (PAID)',
};
const BUCKET_OPTIONS = BUCKETS.map((b) => ({ value: b, label: BUCKET_LABEL[b] }));

const ACTION_LABEL: Record<string, string> = { DUK_ADJUST: '덕 조정' };

// ---- safe coercion of the loosely-typed jsonb the RPCs return -------------------------------------------------
function readNum(v: unknown): number {
  const x = typeof v === 'string' ? Number(v) : v;
  return typeof x === 'number' && Number.isFinite(x) ? x : 0;
}
function readStr(v: unknown): string {
  if (typeof v === 'string') return v;
  return v === null || v === undefined ? '' : String(v);
}
function asRows(v: unknown): Record<string, unknown>[] {
  return Array.isArray(v) ? (v as Record<string, unknown>[]) : [];
}
function numRecord(v: unknown): Record<string, number> {
  if (v === null || typeof v !== 'object') return {};
  const out: Record<string, number> = {};
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) out[k] = readNum(val);
  return out;
}
function fmt(nv: number): string {
  return nv.toLocaleString();
}
function fmtDateTime(v: unknown): string {
  const s = readStr(v);
  return s ? s.slice(0, 16).replace('T', ' ') : '–';
}
function shortId(v: unknown): string {
  const s = readStr(v);
  if (!s) return '–';
  return s.length > 8 ? `${s.slice(0, 8)}…` : s;
}
// Keep only digits and a single leading minus so the parsed amount is always a clean integer.
function sanitizeAmount(t: string): string {
  const cleaned = t.replace(/[^0-9-]/g, '');
  const negative = cleaned.startsWith('-');
  return (negative ? '-' : '') + cleaned.replace(/-/g, '');
}

function DeltaText({ value }: { value: number }) {
  const color = value > 0 ? adminTheme.success : value < 0 ? adminTheme.danger : adminTheme.ink;
  const label = value > 0 ? `+${fmt(value)}` : fmt(value);
  return (
    <Text variant="bodySmall" style={{ color, fontFamily: adminMono, fontWeight: '700' }}>
      {label}
    </Text>
  );
}

const LEDGER_COLUMNS: AdminTableColumn<Record<string, unknown>>[] = [
  { key: 'bucket', label: '버킷', flex: 1, render: (r) => readStr(r.bucket) || '–' },
  { key: 'delta', label: '증감(덕)', flex: 1, align: 'right', render: (r) => <DeltaText value={readNum(r.delta)} /> },
  { key: 'reason', label: '사유', flex: 2, render: (r) => readStr(r.reason) || '–' },
  { key: 'created_at', label: '시각', flex: 2, render: (r) => fmtDateTime(r.created_at) },
];

const AUDIT_COLUMNS: AdminTableColumn<Record<string, unknown>>[] = [
  { key: 'created_at', label: '시각', flex: 2, render: (r) => fmtDateTime(r.created_at) },
  { key: 'action', label: '작업', flex: 1, render: (r) => ACTION_LABEL[readStr(r.action)] ?? (readStr(r.action) || '–') },
  { key: 'target', label: '대상 사용자', flex: 2, mono: true, render: (r) => shortId(r.target_user_id) },
  { key: 'amount', label: '증감(덕)', flex: 1, align: 'right', render: (r) => <DeltaText value={readNum(r.amount)} /> },
  { key: 'bucket', label: '버킷', flex: 1, render: (r) => readStr(r.bucket) || '–' },
  { key: 'note', label: '사유', flex: 2, render: (r) => readStr(r.reason_note) || '–' },
];

export default function AdminEconomyScreen() {
  // 1. 경제 개요 --------------------------------------------------------------------------------------------------
  const [ovState, setOvState] = useState<Loadable>('loading');
  const [overview, setOverview] = useState<EconomyOverview | null>(null);

  const loadOverview = useCallback(async () => {
    setOvState('loading');
    const data = await adminEconomyService.getOverview();
    if (data === null) {
      setOvState('error');
      return;
    }
    setOverview(data);
    setOvState('ready');
  }, []);

  // 4. 감사 로그 --------------------------------------------------------------------------------------------------
  const [auditState, setAuditState] = useState<Loadable>('loading');
  const [audit, setAudit] = useState<Record<string, unknown>[]>([]);

  const loadAudit = useCallback(async () => {
    setAuditState('loading');
    try {
      const rows = await adminEconomyService.listAuditLog(100);
      setAudit(rows);
      setAuditState('ready');
    } catch {
      setAuditState('error');
    }
  }, []);

  useEffect(() => {
    void loadOverview();
    void loadAudit();
  }, [loadOverview, loadAudit]);

  // 2. 사용자 지갑 조회 -------------------------------------------------------------------------------------------
  const [walletInput, setWalletInput] = useState('');
  const [walletState, setWalletState] = useState<WalletState>('idle');
  const [wallet, setWallet] = useState<Record<string, unknown> | null>(null);
  const [walletUserId, setWalletUserId] = useState('');

  const lookupWallet = useCallback(async (rawId: string) => {
    const id = rawId.trim();
    if (id.length === 0) {
      setWalletState('idle');
      return;
    }
    setWalletUserId(id);
    setWalletState('loading');
    const data = await adminEconomyService.getUserWallet(id);
    if (data === null) {
      setWallet(null);
      setWalletState('error');
      return;
    }
    setWallet(data);
    setWalletState('ready');
  }, []);

  // 3. 덕 수동 조정 -----------------------------------------------------------------------------------------------
  const [adjUserId, setAdjUserId] = useState('');
  const [adjAmount, setAdjAmount] = useState('');
  const [adjBucket, setAdjBucket] = useState<Bucket>('PLUS');
  const [adjNote, setAdjNote] = useState('');
  const [adjBusy, setAdjBusy] = useState(false);
  const [adjResult, setAdjResult] = useState<{ ok: boolean; message: string } | null>(null);

  const parsedAmount = Number.parseInt(adjAmount, 10);
  const amountValid = Number.isInteger(parsedAmount) && parsedAmount !== 0;
  const canSubmit = adjUserId.trim().length > 0 && amountValid && adjNote.trim().length > 0 && !adjBusy;

  const submitAdjust = useCallback(async () => {
    if (!canSubmit) return;
    const targetId = adjUserId.trim();
    setAdjBusy(true);
    setAdjResult(null);
    const newId = await adminEconomyService.adjustDuk({
      userId: targetId,
      amount: parsedAmount,
      bucket: adjBucket,
      note: adjNote.trim(),
    });
    setAdjBusy(false);
    if (newId === null) {
      setAdjResult({ ok: false, message: '조정에 실패했어요. 권한 또는 입력 값을 확인해 주세요.' });
      return;
    }
    setAdjResult({ ok: true, message: '조정 완료 · 원장 기록됨' });
    setAdjAmount('');
    setAdjNote('');
    void loadOverview();
    void loadAudit();
    if (walletUserId && walletUserId === targetId) {
      void lookupWallet(targetId);
    }
  }, [
    canSubmit,
    adjUserId,
    parsedAmount,
    adjBucket,
    adjNote,
    loadOverview,
    loadAudit,
    walletUserId,
    lookupWallet,
  ]);

  return (
    <Stack gap="xl">
      <AdminPageHeader
        title="덕 경제"
        subtitle="덕 지급·사용 현황과 사용자 지갑을 조회하고, 감사 기록이 남는 수동 조정을 수행합니다."
      />

      {/* 1. 경제 개요 */}
      <Stack gap="md">
        <SectionHeader
          title="경제 개요"
          caption="지급·사용 내역은 최근 30일 기준입니다. 잔액·채무·구매·취소는 누적 기준입니다."
        />
        {ovState !== 'ready' || overview === null ? (
          <AdminStateView state={ovState === 'loading' ? 'loading' : 'error'} onRetry={loadOverview} />
        ) : (
          <Stack gap="lg">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
              <KpiCard label="총 지급 (30일)" value={`${fmt(overview.totalGranted)} 덕`} sub="지급 합계" />
              <KpiCard label="총 사용 (30일)" value={`${fmt(overview.totalSpent)} 덕`} sub="사용 합계" />
              <KpiCard label="PLUS 잔액" value={`${fmt(overview.bucketBalances.PLUS ?? 0)} 덕`} sub="무료 버킷" />
              <KpiCard label="REWARD 잔액" value={`${fmt(overview.bucketBalances.REWARD ?? 0)} 덕`} sub="보상 버킷" />
              <KpiCard label="PAID 잔액" value={`${fmt(overview.bucketBalances.PAID ?? 0)} 덕`} sub="유료 버킷" />
              <KpiCard
                label="미해결 채무"
                value={`${fmt(overview.debt.openCount)}건`}
                sub={`미해결 ${fmt(overview.debt.openAmount)} 덕 · 해결 ${fmt(overview.debt.resolvedCount)}건`}
              />
              <KpiCard
                label="구매"
                value={`${fmt(overview.purchases.count)}건`}
                sub={`지급 ${fmt(overview.purchases.grantedDuk)} 덕`}
              />
              <KpiCard label="구매 취소" value={`${fmt(overview.revocations)}건`} sub="환불·취소" />
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
              <ReasonList title="지급 사유별 (30일)" entries={overview.grantsByReason} positive />
              <ReasonList title="사용 사유별 (30일)" entries={overview.spendsByReason} positive={false} />
            </View>
          </Stack>
        )}
      </Stack>

      {/* 2. 사용자 지갑 조회 */}
      <Stack gap="md">
        <SectionHeader title="사용자 지갑 조회" caption="사용자 ID를 입력해 서버 기준 지갑 스냅샷을 조회합니다." />
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <Input
            label="사용자 ID"
            value={walletInput}
            onChangeText={setWalletInput}
            placeholder="사용자 ID"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={() => lookupWallet(walletInput)}
            style={{ flexGrow: 1, minWidth: 280 }}
          />
          <Button label="조회" variant="secondary" onPress={() => lookupWallet(walletInput)} />
        </View>
        {walletState === 'idle' ? (
          <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>
            사용자 ID를 입력한 뒤 조회하세요.
          </Text>
        ) : walletState === 'loading' ? (
          <AdminStateView state="loading" />
        ) : walletState === 'error' || wallet === null ? (
          <AdminStateView
            state="error"
            message="지갑을 불러오지 못했습니다. 사용자 ID와 권한을 확인해 주세요."
            onRetry={() => lookupWallet(walletUserId)}
          />
        ) : (
          <WalletView wallet={wallet} userId={walletUserId} />
        )}
      </Stack>

      {/* 3. 덕 수동 조정 */}
      <Stack gap="md">
        <SectionHeader title="덕 수동 조정" caption="양수는 지급, 음수는 차감입니다. 차감은 해당 버킷 잔액을 넘을 수 없습니다." />
        <Card>
          <Stack gap="md">
            <Input
              label="사용자 ID"
              required
              value={adjUserId}
              onChangeText={setAdjUserId}
              placeholder="사용자 ID"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <Input
                label="조정 수량 (덕)"
                required
                value={adjAmount}
                onChangeText={(t) => setAdjAmount(sanitizeAmount(t))}
                placeholder="예: 10 또는 -5"
                helperText="0이 아닌 정수"
                style={{ width: 220 }}
              />
              <View style={{ gap: 6 }}>
                <Text variant="bodySmall">버킷</Text>
                <AdminSelect options={BUCKET_OPTIONS} value={adjBucket} onChange={setAdjBucket} />
              </View>
            </View>
            <Input
              label="사유"
              required
              value={adjNote}
              onChangeText={setAdjNote}
              placeholder="조정 사유를 입력하세요 (감사 로그에 기록됩니다)"
            />
            <Text variant="bodySmall" style={{ color: adminTheme.warning }}>
              조정은 되돌릴 수 없는 원장 기록으로 남습니다.
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Button variant="primary" label={adjBusy ? '적용 중…' : '조정 적용'} onPress={submitAdjust} disabled={!canSubmit} />
              {adjResult ? (
                <Text
                  variant="bodySmall"
                  style={{ color: adjResult.ok ? adminTheme.success : adminTheme.danger, fontWeight: '700' }}
                >
                  {adjResult.message}
                </Text>
              ) : null}
            </View>
          </Stack>
        </Card>
      </Stack>

      {/* 4. 감사 로그 */}
      <Stack gap="md">
        <SectionHeader title="감사 로그" caption="관리자 권한 작업(덕 조정 등)의 변경 불가 기록입니다." />
        {auditState === 'loading' ? (
          <AdminStateView state="loading" />
        ) : auditState === 'error' ? (
          <AdminStateView state="error" onRetry={loadAudit} />
        ) : audit.length === 0 ? (
          <AdminStateView state="empty" message="기록된 감사 로그가 없습니다." />
        ) : (
          <AdminTable
            columns={AUDIT_COLUMNS}
            rows={audit}
            keyExtractor={(r) => readStr(r.id) || readStr(r.created_at)}
          />
        )}
      </Stack>
    </Stack>
  );
}

function SectionHeader({ title, caption }: { title: string; caption?: string }) {
  return (
    <Stack gap="xs">
      <Text variant="headingMedium" style={{ color: adminTheme.ink, fontWeight: '700' }}>
        {title}
      </Text>
      {caption ? (
        <Text variant="bodySmall" style={{ color: adminTheme.inkMuted, lineHeight: 18 }}>
          {caption}
        </Text>
      ) : null}
    </Stack>
  );
}

function ReasonList({
  title,
  entries,
  positive,
}: {
  title: string;
  entries: Record<string, number>;
  positive: boolean;
}) {
  const rows = Object.entries(entries);
  return (
    <View
      style={{
        flex: 1,
        minWidth: 280,
        borderWidth: 1,
        borderColor: adminTheme.border,
        borderRadius: 8,
        backgroundColor: adminTheme.surface,
        padding: 16,
        gap: 8,
      }}
    >
      <Text variant="bodyLarge" style={{ fontWeight: '700', color: adminTheme.ink }}>
        {title}
      </Text>
      {rows.length === 0 ? (
        <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>
          내역이 없습니다.
        </Text>
      ) : (
        rows.map(([reason, amount]) => (
          <View key={reason} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
            <Text variant="bodySmall" style={{ color: adminTheme.inkVariant, fontFamily: adminMono }}>
              {reason}
            </Text>
            <Text
              variant="bodySmall"
              style={{ color: positive ? adminTheme.success : adminTheme.danger, fontWeight: '700', fontFamily: adminMono }}
            >
              {positive ? '+' : '-'}
              {fmt(Math.abs(amount))} 덕
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone?: 'danger' }) {
  return (
    <View style={{ gap: 2 }}>
      <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>
        {label}
      </Text>
      <Text
        variant="headingMedium"
        style={{ color: tone === 'danger' ? adminTheme.danger : adminTheme.ink, fontWeight: '700' }}
      >
        {value}
      </Text>
    </View>
  );
}

function WalletView({ wallet, userId }: { wallet: Record<string, unknown>; userId: string }) {
  const spendable = readNum(wallet.spendable);
  const buckets = numRecord(wallet.buckets);
  const reserves = asRows(wallet.active_reserves);
  const sessions = asRows(wallet.sessions);
  const debt = asRows(wallet.debt);
  const ledger = asRows(wallet.ledger);
  const openDebt = debt.filter((d) => d.resolved !== true);

  return (
    <Card>
      <Stack gap="lg">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <View style={{ gap: 4 }}>
            <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>
              사용 가능 잔액
            </Text>
            <Text variant="displayMedium" style={{ color: adminTheme.ink, fontWeight: '700' }}>
              {fmt(spendable)} 덕
            </Text>
            <Text variant="bodySmall" style={{ color: adminTheme.inkMuted, fontFamily: adminMono }}>
              {userId}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {BUCKETS.map((b) => (
              <View
                key={b}
                style={{
                  borderWidth: 1,
                  borderColor: adminTheme.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  minWidth: 96,
                  gap: 2,
                }}
              >
                <Text variant="caption" style={{ color: adminTheme.inkMuted }}>
                  {b}
                </Text>
                <Text variant="bodyLarge" style={{ color: adminTheme.ink, fontWeight: '700', fontFamily: adminMono }}>
                  {fmt(buckets[b] ?? 0)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 24, flexWrap: 'wrap' }}>
          <MiniStat label="활성 예약" value={`${reserves.length}건`} />
          <MiniStat label="최근 세션" value={`${sessions.length}건`} />
          <MiniStat
            label="미해결 채무"
            value={`${openDebt.length}건`}
            tone={openDebt.length > 0 ? 'danger' : undefined}
          />
        </View>

        {debt.length > 0 ? (
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {debt.slice(0, 8).map((d, i) => (
              <AdminBadge
                key={readStr(d.id) || String(i)}
                tone={d.resolved === true ? 'neutral' : 'danger'}
                label={`${d.resolved === true ? '해결' : '미해결'} ${fmt(readNum(d.amount))}덕`}
              />
            ))}
          </View>
        ) : null}

        <Stack gap="sm">
          <Text variant="bodyMedium" style={{ color: adminTheme.inkVariant, fontWeight: '700' }}>
            최근 원장
          </Text>
          {ledger.length === 0 ? (
            <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>
              원장 기록이 없습니다.
            </Text>
          ) : (
            <AdminTable
              columns={LEDGER_COLUMNS}
              rows={ledger.slice(0, 20)}
              keyExtractor={(r) => readStr(r.id) || readStr(r.created_at)}
            />
          )}
        </Stack>
      </Stack>
    </Card>
  );
}
