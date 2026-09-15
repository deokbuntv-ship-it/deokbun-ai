import { logDbError } from '@/features/analysis';
import {
  validateReport,
  type AiContentReportInput,
  type ReportReason,
} from '@/features/intelligence/aiContentReport';
import { getSupabaseClient } from '@/services/supabase';

// AI 답변 신고 저장 (`ai_content_reports`, 마이그레이션 20260917000000).
//
// ⚠ 피드백(`feedbackService`)과 **다르다.** 피드백은 실패해도 조용히 넘어가는 신호지만,
//   신고는 사용자가 "접수됐다" 는 답을 기다리는 행동이다. 그래서 여기서는 **성공·실패를
//   그대로 돌려준다.** 실패했는데 "받았습니다" 를 보이면 그건 거짓말이다.
//
// PRIVACY: 무엇을 저장하나 — 어떤 답변(client_message_id) · 사유 코드 · 사용자가 직접 적은
//   설명(선택). 질문·답변 원문, 이름, 출생정보는 **저장하지 않는다.**

const TABLE = 'ai_content_reports';

export type SubmitOutcome =
  | { status: 'ok' }
  /** 같은 답변을 이미 신고했다. 사용자에게는 실패가 아니라 "이미 접수됨" 이다. */
  | { status: 'already' }
  | { status: 'invalid'; reason: 'MESSAGE_REQUIRED' | 'REASON_REQUIRED' | 'DETAIL_TOO_LONG' }
  | { status: 'auth' }
  | { status: 'failed' };

async function submitReport(input: AiContentReportInput): Promise<SubmitOutcome> {
  const v = validateReport(input);
  if (!v.ok) return { status: 'invalid', reason: v.reason };

  try {
    const { error } = await getSupabaseClient().from(TABLE).insert({
      conversation_id: v.value.conversationId,
      message_id: v.value.messageId,
      surface: v.value.surface,
      reason: v.value.reason,
      detail: v.value.detail,
    });
    if (!error) return { status: 'ok' };

    // 23505 = 유니크 위반. 같은 답변을 두 번 신고한 것이므로 실패가 아니다.
    if (error.code === '23505') return { status: 'already' };
    // 42501 = RLS/트리거 거절 (로그인 안 했거나 남의 대화로 위장).
    if (error.code === '42501') return { status: 'auth' };
    logDbError(error, 'ai_content_report', 'persist');
    return { status: 'failed' };
  } catch {
    return { status: 'failed' };
  }
}

/** 이 대화에서 이미 신고한 답변들. 버튼을 "신고됨" 으로 되돌려 놓기 위해서다. */
async function listReportedMessages(conversationId: string): Promise<Set<string>> {
  try {
    const { data, error } = await getSupabaseClient()
      .from(TABLE)
      .select('message_id')
      .eq('conversation_id', conversationId);
    if (error) return new Set();
    return new Set(((data as { message_id: string }[] | null) ?? []).map((r) => r.message_id));
  } catch {
    return new Set();
  }
}

export const aiReportService = { submitReport, listReportedMessages };
export type { ReportReason };
