import { useCallback, useEffect, useState } from 'react';
import { TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { AdminPageHeader, AdminSelect, AdminStateView } from '@/features/admin';
import { adminMono, adminTheme } from '@/features/admin/adminTheme';
import {
  NOT_INSTALLED_LABEL,
  REPORT_STATUS_LABEL,
  adminAiReportService,
  type AdminAiReport,
} from '@/features/admin/services/adminAiReportService';
import { REPORT_REASON_LABEL } from '@/features/intelligence/aiContentReport';

// ADMIN — AI 답변 신고 큐 (구글 AI 생성 콘텐츠 정책).
//
// 정책은 신고를 **받는 것**만이 아니라 그것을 **필터링·모더레이션에 반영**하라고 말한다.
// 그래서 화면이 목록만이 아니라 처리 상태를 갖는다.
//
// ⚠ 신고자를 알아볼 수 없다 — RPC 가 익명 해시 12자만 준다. 같은 사람이 반복 신고하면
//   같은 키로 보이므로 패턴은 보이되 사람은 보이지 않는다.
//
// ⚠ 빈 목록과 "모른다" 를 섞지 않는다. RPC 가 없으면 그렇게 말한다.
type ScreenStatus = 'loading' | 'ready' | 'not_installed' | 'forbidden' | 'error';

const FILTERS = [
  { value: 'open', label: '미확인' },
  { value: 'ALL', label: '전체' },
  { value: 'reviewed', label: '확인함' },
  { value: 'dismissed', label: '해당 없음' },
];

export default function AdminAiReportsScreen() {
  const [status, setStatus] = useState<ScreenStatus>('loading');
  const [filter, setFilter] = useState('open');
  const [rows, setRows] = useState<AdminAiReport[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    const res = await adminAiReportService.list(filter === 'ALL' ? null : filter);
    if (res.kind === 'ok') {
      setRows(res.rows);
      setStatus('ready');
      return;
    }
    setStatus(res.kind === 'not_installed' ? 'not_installed' : res.kind === 'forbidden' ? 'forbidden' : 'error');
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const mark = async (r: AdminAiReport, next: AdminAiReport['status']) => {
    setSavingId(r.id);
    const ok = await adminAiReportService.setStatus(r.id, next, (notes[r.id] ?? '').trim() || null);
    setSavingId(null);
    if (ok) void load();
  };

  const openCount = rows.filter((r) => r.status === 'open').length;

  return (
    <Stack gap="lg" style={{ padding: 24 }}>
      <AdminPageHeader
        title="AI 답변 신고"
        subtitle="사용자가 앱 안에서 신고한 AI 답변입니다. 구글 AI 생성 콘텐츠 정책이 요구하는 창구입니다."
      />

      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <AdminSelect value={filter} options={FILTERS} onChange={setFilter} label="상태" />
        <Button label="새로고침" onPress={() => void load()} variant="secondary" />
        {status === 'ready' ? (
          <Text variant="bodySmall" style={{ color: adminTheme.inkVariant }}>
            {rows.length.toLocaleString()}건{filter === 'ALL' && openCount > 0 ? ` · 미확인 ${openCount}건` : ''}
          </Text>
        ) : null}
      </View>

      {status === 'loading' ? (
        <AdminStateView state="loading" />
      ) : status === 'not_installed' ? (
        <Text variant="bodySmall" style={{ color: adminTheme.inkVariant }}>
          {NOT_INSTALLED_LABEL} 마이그레이션 20260917000000_ai_content_reports.sql 을 적용하면 이 화면이 켜집니다.
          화면이 고장난 것이 아닙니다.
        </Text>
      ) : status === 'forbidden' ? (
        <Text variant="bodySmall" style={{ color: adminTheme.warning }}>
          ⚠ 이 계정에는 신고를 볼 권한이 없습니다. 관리자 권한을 확인해 주세요.
        </Text>
      ) : status === 'error' ? (
        <Text variant="bodySmall" style={{ color: adminTheme.warning }}>
          ⚠ 목록을 불러오지 못했습니다. 신고가 없는 것이 아니라 **모르는 상태**입니다. 잠시 뒤 다시 시도해 주세요.
        </Text>
      ) : rows.length === 0 ? (
        <Text variant="bodySmall" style={{ color: adminTheme.inkVariant }}>
          {filter === 'open' ? '미확인 신고가 없습니다.' : '신고가 없습니다.'}
        </Text>
      ) : (
        <Stack gap="md">
          {rows.map((r) => (
            <View
              key={r.id}
              style={{
                gap: 8,
                borderWidth: 1,
                borderColor: r.status === 'open' ? adminTheme.warning : adminTheme.border,
                borderRadius: 10,
                padding: 16,
                backgroundColor: adminTheme.surface,
              }}
            >
              <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <Text variant="bodyMedium" style={{ color: adminTheme.ink }}>
                  {REPORT_REASON_LABEL[r.reason] ?? r.reason}
                </Text>
                <Text variant="caption" style={{ color: adminTheme.inkVariant }}>
                  {REPORT_STATUS_LABEL[r.status]} · {r.surface} · {new Date(r.createdAt).toLocaleString('ko-KR')}
                </Text>
              </View>

              <Text variant="caption" style={{ fontFamily: adminMono, color: adminTheme.inkMuted }}>
                답변 {r.messageId} · 신고자 {r.reporterKey}
              </Text>

              {r.detail ? (
                <Text variant="bodySmall" style={{ color: adminTheme.ink }}>
                  “{r.detail}”
                </Text>
              ) : (
                <Text variant="caption" style={{ color: adminTheme.inkMuted }}>
                  상세 설명 없음 (선택 입력)
                </Text>
              )}

              {r.adminNote ? (
                <Text variant="caption" style={{ color: adminTheme.inkVariant }}>운영 메모: {r.adminNote}</Text>
              ) : null}

              {r.status === 'open' ? (
                <>
                  <TextInput
                    accessibilityLabel="운영 메모"
                    placeholder="처리 메모 (선택)"
                    placeholderTextColor={adminTheme.inkMuted}
                    value={notes[r.id] ?? ''}
                    onChangeText={(t) => setNotes((n) => ({ ...n, [r.id]: t }))}
                    style={{
                      borderWidth: 1, borderColor: adminTheme.border, borderRadius: 8,
                      padding: 10, color: adminTheme.ink,
                    }}
                  />
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Button
                      label={savingId === r.id ? '저장 중…' : '확인함'}
                      variant="primary"
                      onPress={() => void mark(r, 'reviewed')}
                      disabled={savingId === r.id}
                    />
                    <Button
                      label="해당 없음"
                      variant="secondary"
                      onPress={() => void mark(r, 'dismissed')}
                      disabled={savingId === r.id}
                    />
                  </View>
                </>
              ) : null}
            </View>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
