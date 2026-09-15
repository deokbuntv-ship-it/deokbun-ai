import { logDbError } from '@/features/analysis';
import { REPORT_REASON_LABEL, type ReportReason } from '@/features/intelligence/aiContentReport';
import { getSupabaseClient } from '@/services/supabase';

// 관리자 — AI 답변 신고 큐 (`ai_content_reports`, 마이그레이션 20260917000000).
//
// ⚠ 신고자 식별자를 화면까지 끌고 오지 않는다. `admin_ai_content_reports` RPC 가 `user_id`
//   대신 **익명 해시 12자(`reporter_key`)** 를 준다 — 운영에 필요한 것은 "무엇이 신고됐나"
//   이지 "누가 신고했나" 가 아니다. 같은 사람의 연속 신고는 같은 키로 묶여 보인다.
//
// ⚠ RPC 가 없는 환경(마이그레이션 미적용)에서 빈 목록을 그리지 않는다. 빈 목록은
//   "신고가 없다" 로 읽히는데 그건 **모른다** 다.

export type AdminAiReport = {
  id: string;
  messageId: string;
  surface: string;
  reason: ReportReason;
  detail: string | null;
  status: 'open' | 'reviewed' | 'dismissed';
  adminNote: string | null;
  reporterKey: string;
  createdAt: string;
  reviewedAt: string | null;
};

export type ListOutcome =
  | { kind: 'ok'; rows: AdminAiReport[] }
  /** RPC 자체가 없다 — 이 환경에는 아직 신고 기능이 설치되지 않았다. */
  | { kind: 'not_installed' }
  | { kind: 'forbidden' }
  | { kind: 'failed' };

export const REPORT_STATUS_LABEL: Readonly<Record<AdminAiReport['status'], string>> = {
  open: '미확인',
  reviewed: '확인함',
  dismissed: '해당 없음',
};

export const NOT_INSTALLED_LABEL = '이 환경에는 아직 신고 기능이 설치되지 않았습니다.';

/** ⚠ 코드로 가른다. 메시지 문자열로 가르면 Supabase 가 문구를 바꾸는 순간 조용히 틀린다. */
export function classifyReportError(error: { code?: string | null } | null | undefined): Exclude<ListOutcome['kind'], 'ok'> {
  const code = (error?.code ?? '').trim().toUpperCase();
  if (code === 'PGRST202' || code === '42883') return 'not_installed';
  if (code === 'P0001' || code === '42501' || code === 'PGRST301') return 'forbidden';
  return 'failed';
}

const row = (r: Record<string, unknown>): AdminAiReport => ({
  id: String(r.id),
  messageId: String(r.message_id ?? ''),
  surface: String(r.surface ?? ''),
  reason: r.reason as ReportReason,
  detail: (r.detail as string | null) ?? null,
  status: (r.status as AdminAiReport['status']) ?? 'open',
  adminNote: (r.admin_note as string | null) ?? null,
  reporterKey: String(r.reporter_key ?? ''),
  createdAt: String(r.created_at ?? ''),
  reviewedAt: (r.reviewed_at as string | null) ?? null,
});

async function list(status: string | null): Promise<ListOutcome> {
  try {
    const { data, error } = await getSupabaseClient().rpc('admin_ai_content_reports', {
      p_status: status,
      p_limit: 200,
    });
    if (error) {
      logDbError(error, 'admin_ai_content_reports', 'rpc');
      return { kind: classifyReportError(error) };
    }
    return { kind: 'ok', rows: ((data ?? []) as Record<string, unknown>[]).map(row) };
  } catch {
    return { kind: 'failed' };
  }
}

/** 처리 상태를 바꾼다. 트리거가 `reviewed_at`·`reviewed_by` 를 서버에서 채운다. */
async function setStatus(id: string, status: AdminAiReport['status'], note: string | null): Promise<boolean> {
  try {
    const { error } = await getSupabaseClient()
      .from('ai_content_reports')
      .update({ status, admin_note: note })
      .eq('id', id);
    if (error) {
      logDbError(error, 'ai_content_reports', 'update');
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export const adminAiReportService = { list, setStatus };
export { REPORT_REASON_LABEL };
