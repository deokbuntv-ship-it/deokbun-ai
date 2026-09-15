// 고객문의 — the pure half. No React, no react-native, no supabase, so every rule here is
// testable without a harness. The service and both screens import from here.
//
// WHY CS EXISTS AT ALL (2026-09-04): the shipped privacy policy already promises an in-app
// inquiry channel — "개인정보 처리에 관한 문의는 서비스 내 문의 채널을 통해 접수하실 수
// 있습니다" (legalContent.ts:86) — and there was none. Both stores also require a working
// support contact before review.

export const INQUIRY_CATEGORIES = ['payment', 'consultation', 'account', 'bug', 'other'] as const;
export type InquiryCategory = (typeof INQUIRY_CATEGORIES)[number];

export const INQUIRY_CATEGORY_LABEL: Record<InquiryCategory, string> = {
  payment: '결제·덕',
  consultation: '상담 내용',
  account: '계정',
  bug: '오류 신고',
  other: '기타',
};

export type InquiryStatus = 'RECEIVED' | 'IN_PROGRESS' | 'ANSWERED';

export const INQUIRY_STATUS_LABEL: Record<InquiryStatus, string> = {
  RECEIVED: '접수됨',
  IN_PROGRESS: '확인 중',
  ANSWERED: '답변 완료',
};

export type SupportInquiry = {
  id: string;
  category: InquiryCategory;
  message: string;
  status: InquiryStatus;
  answer: string | null;
  answeredAt: string | null;
  createdAt: string;
};

/** Mirrors the DB CHECK (1..4000). Kept here so the UI can disable the button before a round trip. */
export const MESSAGE_MIN = 1;
export const MESSAGE_MAX = 4000;

export type InquiryDraft = {
  category: InquiryCategory;
  message: string;
  contactEmail: string;
};

/**
 * Validate a draft. Returns the reason so the UI can say WHICH thing is wrong rather than
 * greying out a button with no explanation.
 *
 * `contactEmail` is optional on purpose — requiring it would make an inquiry feel like a
 * signup, and we already know the account's address. It is only validated when non-empty.
 */
export function validateInquiry(draft: InquiryDraft): { ok: true } | { ok: false; reason: string } {
  const message = draft.message.trim();
  if (message.length < MESSAGE_MIN) return { ok: false, reason: '문의 내용을 입력해 주세요.' };
  if (message.length > MESSAGE_MAX) {
    return { ok: false, reason: `문의 내용은 ${MESSAGE_MAX}자까지 쓸 수 있어요. (현재 ${message.length}자)` };
  }
  if (!INQUIRY_CATEGORIES.includes(draft.category)) return { ok: false, reason: '문의 유형을 선택해 주세요.' };
  const email = draft.contactEmail.trim();
  if (email.length > 0 && !isPlausibleEmail(email)) {
    return { ok: false, reason: '답변 받을 이메일 주소를 다시 확인해 주세요.' };
  }
  return { ok: true };
}

/**
 * Shape check only — never a deliverability claim. Deliberately permissive: rejecting a real
 * address because a regex disagreed is worse than accepting one that bounces, and this field
 * is optional anyway.
 */
export function isPlausibleEmail(value: string): boolean {
  const v = value.trim();
  if (v.length === 0 || v.length > 254) return false;
  if (/\s/.test(v)) return false;
  const at = v.indexOf('@');
  if (at <= 0 || at !== v.lastIndexOf('@')) return false;
  const domain = v.slice(at + 1);
  return domain.includes('.') && !domain.startsWith('.') && !domain.endsWith('.');
}

export type SubmitOutcome = 'SUBMITTED' | 'UNAUTHENTICATED' | 'INVALID' | 'NETWORK' | 'FAILED';

export function submitOutcomeMessage(outcome: SubmitOutcome): string | null {
  switch (outcome) {
    case 'SUBMITTED':
      return null;
    case 'UNAUTHENTICATED':
      return '로그인이 만료되었어요. 다시 로그인한 뒤 보내 주세요.';
    case 'NETWORK':
      return '연결이 끊겼어요. 잠시 후 다시 시도해 주세요. 문의는 아직 접수되지 않았어요.';
    case 'INVALID':
      return '문의 내용을 확인해 주세요.';
    case 'FAILED':
      return '문의 접수 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.';
  }
}

/**
 * What the user is told about response time.
 *
 * ⚠ This deliberately promises NOTHING measurable. There is one operator and no SLA; printing
 * "24시간 내 답변" would be a commitment the service cannot keep, and an unmet promise in a
 * support channel is worse than no promise.
 */
export const RESPONSE_TIME_NOTICE =
  '확인하는 대로 순서대로 답변드려요. 답변은 이 화면에서 확인하실 수 있어요.';
