import { useCallback, useEffect, useState } from 'react';
import { TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { AdminPageHeader, AdminSelect, AdminStateView } from '@/features/admin';
import { adminMono, adminTheme } from '@/features/admin/adminTheme';
import {
  INQUIRY_CATEGORY_LABEL,
  INQUIRY_STATUS_LABEL,
  type InquiryStatus,
} from '@/features/support/supportContract';
import { adminAnswerInquiry, adminListInquiries, type AdminInquiry } from '@/features/support/supportService';

// ADMIN 고객문의 — the operator queue. Unanswered first, oldest first, so the list reads
// top-down as "what to do next" (the ordering is in the RPC, not here).
//
// The admin can ONLY answer and re-status: the user's original message is not editable by
// anyone, by construction (admin_answer_inquiry touches no other column). Fail-closed — if the
// RPC is missing in this environment the screen says so instead of showing an empty list that
// would read as "no inquiries".
type ScreenStatus = 'loading' | 'ready' | 'error';

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'RECEIVED', label: '접수됨' },
  { value: 'IN_PROGRESS', label: '확인 중' },
  { value: 'ANSWERED', label: '답변 완료' },
];

export default function AdminSupportScreen() {
  const [status, setStatus] = useState<ScreenStatus>('loading');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('ALL');
  const [rows, setRows] = useState<AdminInquiry[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    const res = await adminListInquiries(filter === 'ALL' ? null : (filter as InquiryStatus));
    if (res.kind === 'unavailable') {
      setErrorText(res.reason);
      setStatus('error');
      return;
    }
    setRows(res.rows);
    setStatus('ready');
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const answer = async (row: AdminInquiry) => {
    const text = (drafts[row.id] ?? '').trim();
    if (text.length === 0) return;
    setSavingId(row.id);
    const res = await adminAnswerInquiry(row.id, text, 'ANSWERED');
    setSavingId(null);
    if (!res.ok) {
      setErrorText(res.reason ?? '답변 저장에 실패했습니다.');
      return;
    }
    setDrafts((d) => ({ ...d, [row.id]: '' }));
    void load();
  };

  const setRowStatus = async (row: AdminInquiry, next: InquiryStatus) => {
    setSavingId(row.id);
    await adminAnswerInquiry(row.id, null, next);
    setSavingId(null);
    void load();
  };

  return (
    <Stack gap="lg" style={{ padding: 24 }}>
      <AdminPageHeader
        title="고객문의"
        subtitle="사용자 문의 접수와 답변. 미답변이 위로, 오래된 순으로 정렬됩니다. 원문은 수정할 수 없습니다."
      />

      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <AdminSelect label="상태" value={filter} options={STATUS_OPTIONS} onChange={setFilter} />
        <Button label="새로고침" variant="secondary" onPress={() => void load()} />
      </View>

      {status !== 'ready' ? (
        <AdminStateView
          state={status === 'loading' ? 'loading' : 'error'}
          message={errorText ?? undefined}
          onRetry={() => void load()}
        />
      ) : rows.length === 0 ? (
        <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>
          해당 상태의 문의가 없습니다.
        </Text>
      ) : (
        <Stack gap="md">
          {rows.map((r) => (
            <View
              key={r.id}
              style={{
                backgroundColor: adminTheme.surface,
                borderWidth: 1,
                borderColor: adminTheme.border,
                borderRadius: 8,
                padding: 16,
                gap: 10,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <Text variant="bodyMedium" style={{ color: adminTheme.ink, fontWeight: '700' }}>
                  {INQUIRY_CATEGORY_LABEL[r.category]}
                </Text>
                <Text
                  variant="caption"
                  style={{ color: r.status === 'ANSWERED' ? adminTheme.success : adminTheme.warning, fontWeight: '700' }}
                >
                  {INQUIRY_STATUS_LABEL[r.status]}
                </Text>
              </View>

              {/* Contact block. The account email is shown because the operator has to reply
                  somewhere; contact_email overrides it when the user supplied one. */}
              <Text variant="caption" style={{ color: adminTheme.inkMuted, fontFamily: adminMono }} selectable>
                {r.userDisplayName ?? '(이름 없음)'} · {r.contactEmail ?? r.userEmail ?? '(이메일 없음)'}
                {r.contactEmail ? ' (문의 시 입력)' : ''} · {r.platform ?? '?'} {r.appVersion ?? ''} ·{' '}
                {new Date(r.createdAt).toLocaleString('ko-KR')}
              </Text>

              <View style={{ backgroundColor: adminTheme.pageBg, borderRadius: 6, padding: 12 }}>
                <Text variant="bodySmall" style={{ color: adminTheme.ink, lineHeight: 21 }} selectable>
                  {r.message}
                </Text>
              </View>

              {r.answer ? (
                <View style={{ gap: 4 }}>
                  <Text variant="caption" style={{ color: adminTheme.inkMuted }}>
                    보낸 답변 · {r.answeredAt ? new Date(r.answeredAt).toLocaleString('ko-KR') : ''}
                  </Text>
                  <Text variant="bodySmall" style={{ color: adminTheme.inkVariant, lineHeight: 21 }} selectable>
                    {r.answer}
                  </Text>
                </View>
              ) : null}

              <TextInput
                value={drafts[r.id] ?? ''}
                onChangeText={(v) => setDrafts((d) => ({ ...d, [r.id]: v }))}
                multiline
                placeholder={r.answer ? '답변 수정 내용을 입력하면 덮어씁니다' : '답변을 입력하세요'}
                placeholderTextColor={adminTheme.inkMuted}
                accessibilityLabel="답변 입력"
                style={{
                  minHeight: 88,
                  borderWidth: 1,
                  borderColor: adminTheme.border,
                  borderRadius: 6,
                  padding: 12,
                  color: adminTheme.ink,
                  fontSize: 14,
                  lineHeight: 21,
                  textAlignVertical: 'top',
                }}
              />

              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <Button
                  label="답변 등록"
                  variant="primary"
                  onPress={() => void answer(r)}
                  disabled={savingId === r.id || (drafts[r.id] ?? '').trim().length === 0}
                  loading={savingId === r.id}
                />
                {r.status !== 'IN_PROGRESS' && r.status !== 'ANSWERED' ? (
                  <Button
                    label="확인 중으로"
                    variant="secondary"
                    onPress={() => void setRowStatus(r, 'IN_PROGRESS')}
                    disabled={savingId === r.id}
                  />
                ) : null}
              </View>
            </View>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
