// AI 답변 신고 — 순수 계약 (구글 AI 생성 콘텐츠 정책).
//
// WHY THIS EXISTS. 정책은 "앱을 벗어나지 않고 불쾌한 콘텐츠를 신고할 수 있어야 한다" 를
// 요구한다. 이 파일은 **무엇을 신고로 인정하는가**만 정한다 — 저장은 서비스가, 그리기는
// 시트가 한다. 순수 함수라 렌더 없이 검사할 수 있다.
//
// ⚠ `feedback.ts` 의 도움됨/도움 안 됨(품질 투표)과 **다른 것**이다. 그쪽은 신호이고
//   이쪽은 신고다. 둘을 한 곳에 담으면 서로를 덮는다 — 마이그레이션 머리말 참조.

/** 고정 목록. 자유 입력만 받으면 집계가 안 되고 개인정보가 섞여 들어온다. */
export const REPORT_REASONS = ['inappropriate', 'harmful', 'inaccurate', 'other'] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

/** 신고할 수 있는 화면. 서버 CHECK 제약과 같은 목록이다. */
export const REPORT_SURFACES = ['consultation', 'compatibility', 'today', 'monthly', 'premium', 'famous'] as const;
export type ReportSurface = (typeof REPORT_SURFACES)[number];

/**
 * 사용자에게 보이는 사유 문구.
 *
 * ⚠ 톤 규칙: 결과를 단정하지 않고, 겁주지 않고, 과장하지 않는다. 신고 화면은 사용자가
 *   이미 불편한 상태로 들어오는 자리라 문구가 더 조심스러워야 한다.
 */
export const REPORT_REASON_LABEL: Readonly<Record<ReportReason, string>> = {
  inappropriate: '부적절한 표현이 있어요',
  harmful: '위험하거나 해로울 수 있어요',
  inaccurate: '사실과 달라요',
  other: '그 밖의 이유',
};

export const REPORT_DETAIL_MAX = 1000;

/** 신고 뒤 보이는 안내. 처리 결과를 약속하지 않는다 — 지키지 못할 약속은 하지 않는다. */
export const REPORT_ACK_TEXT =
  '신고를 받았습니다. 내용을 확인해 반영하겠습니다. 개별 답변은 어려울 수 있는 점 양해 부탁드려요.';

export const REPORT_ENTRY_LABEL = '이 답변 신고하기';

export type AiContentReportInput = {
  messageId: string;
  conversationId?: string | null;
  surface?: ReportSurface;
  reason: ReportReason;
  detail?: string | null;
};

export type ReportValidation =
  | { ok: true; value: Required<Omit<AiContentReportInput, 'detail'>> & { detail: string | null } }
  | { ok: false; reason: 'MESSAGE_REQUIRED' | 'REASON_REQUIRED' | 'DETAIL_TOO_LONG' };

/**
 * 보내기 전에 검사한다.
 *
 * ⚠ 공백만 적은 설명은 **없는 것으로 눕힌다.** 공백 문자열을 "설명을 적었다" 로 세면
 *   운영자가 없는 정보를 있는 것으로 읽는다. 서버 트리거도 같은 일을 한다 — 두 겹이다.
 */
export function validateReport(input: AiContentReportInput): ReportValidation {
  const messageId = (input.messageId ?? '').trim();
  if (messageId === '') return { ok: false, reason: 'MESSAGE_REQUIRED' };
  if (!REPORT_REASONS.includes(input.reason)) return { ok: false, reason: 'REASON_REQUIRED' };

  const detailRaw = (input.detail ?? '').trim();
  if (detailRaw.length > REPORT_DETAIL_MAX) return { ok: false, reason: 'DETAIL_TOO_LONG' };

  return {
    ok: true,
    value: {
      messageId,
      conversationId: input.conversationId ?? null,
      surface: input.surface ?? 'consultation',
      reason: input.reason,
      detail: detailRaw === '' ? null : detailRaw,
    },
  };
}
