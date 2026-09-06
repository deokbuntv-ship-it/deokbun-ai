// Account deletion (회원 탈퇴) — the pure half. No React, no react-native, no supabase, so
// every rule here is testable without a harness. The service and the screen import from here;
// nothing here imports from them.
//
// DESIGN DECISIONS (recorded here because this file is the contract):
//
// 1. IMMEDIATE, NO GRACE PERIOD. The privacy policy this app already ships says deletion is
//    "지체 없이 파기"(legalContent.ts:74) and that the user may leave "언제든지"(:80). A 30-day
//    soft-delete would contradict shipped text and would introduce a "deleted but still
//    logged-in-able" state that all 45 user-linked tables would have to learn about. The
//    mis-tap risk is handled where it belongs — in the confirmation UI (typed phrase), not by
//    keeping the account alive.
//
// 2. NO DARK PATTERNS. One screen, one typed confirmation, one button. No retention offer, no
//    "정말요?" loop, no hidden entry point. The entry row sits directly under 로그아웃 in MY.
//    The typed phrase exists to prevent an accidental tap, not to wear the user down — it is a
//    single short Korean word.
//
// 3. THE PHRASE IS "탈퇴". Short enough to type on a phone, impossible to hit by accident, and
//    it is the word the button itself uses, so nobody has to hunt for what to type.

/** Outcomes the deletion Edge Function can produce, normalized for the UI. */
export type AccountDeletionOutcome =
  | 'DELETED'
  | 'UNAUTHENTICATED'
  | 'CANCELLED' // the user dismissed the Apple re-authorization sheet
  | 'NETWORK'
  | 'FAILED';

export type AccountDeletionPreview = {
  dukBalance: number;
  subjectCount: number;
  consultationCount: number;
  reportCount: number;
};

/** The word the user types to arm the delete button. */
export const DELETE_CONFIRM_PHRASE = '탈퇴';

/**
 * Whether the typed confirmation matches. Whitespace-tolerant because a Korean IME on iOS
 * happily leaves a trailing space, and failing a user for that is a dark pattern by accident.
 */
export function isDeleteConfirmed(typed: string): boolean {
  return typed.trim() === DELETE_CONFIRM_PHRASE;
}

/** Map an Edge response / thrown error onto the outcome the screen renders. */
export function toDeletionOutcome(input: {
  status?: number | null;
  code?: string | null;
  threw?: boolean;
}): AccountDeletionOutcome {
  if (input.code === 'CANCELLED') return 'CANCELLED';
  if (input.code === 'DELETED') return 'DELETED';
  if (input.status === 401 || input.code === 'UNAUTHENTICATED') return 'UNAUTHENTICATED';
  if (input.threw) return 'NETWORK';
  return 'FAILED';
}

/** User-facing message per outcome. 'DELETED' has no message — the screen navigates away. */
export function deletionOutcomeMessage(outcome: AccountDeletionOutcome): string | null {
  switch (outcome) {
    case 'DELETED':
      return null;
    case 'CANCELLED':
      return null; // the user backed out on purpose; saying anything would nag
    case 'UNAUTHENTICATED':
      return '로그인이 만료되었어요. 다시 로그인한 뒤 시도해 주세요.';
    case 'NETWORK':
      return '연결이 끊겼어요. 잠시 후 다시 시도해 주세요. 탈퇴는 아직 진행되지 않았어요.';
    case 'FAILED':
      return '탈퇴 처리 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.';
  }
}

/**
 * The lines shown above the confirmation, built from the user's real numbers.
 *
 * Only counts the user can verify elsewhere in the app are listed — 덕, 분석 대상자, 상담,
 * 리포트. Naming tables would be noise, and naming things they cannot check would read as a
 * scare tactic. A zero count is omitted rather than shown as "0개": telling someone they are
 * about to lose nothing is not information.
 */
export function deletionSummaryLines(preview: AccountDeletionPreview): string[] {
  const lines: string[] = [];
  if (preview.subjectCount > 0) lines.push(`분석 대상자 ${preview.subjectCount}명`);
  if (preview.consultationCount > 0) lines.push(`상담 기록 ${preview.consultationCount}건`);
  if (preview.reportCount > 0) lines.push(`저장한 리포트 ${preview.reportCount}건`);
  return lines;
}

/**
 * The 덕 line. Separate from the list above because unused 덕 is the one thing with a policy
 * consequence: 「덕 유료 이용 정책」§5 says 덕 is account-bound, non-transferable and
 * non-refundable, so leaving means forfeiting the balance. We say that plainly instead of
 * hiding it — and we do NOT offer to "keep it for you", which would be a retention pattern.
 */
export function dukForfeitLine(dukBalance: number): string | null {
  if (dukBalance <= 0) return null;
  return `남은 ${dukBalance}덕은 함께 사라지며 환불되지 않아요.`;
}

/**
 * Whether Apple grant revocation should be attempted for this account.
 *
 * Apple requires that deleting an account created with Sign in with Apple also revokes the
 * app's tokens. Revocation needs a fresh authorization code, and only the iOS native sheet can
 * mint one — on web/Android we have no way to obtain it, so we skip rather than block. The
 * server records the skip reason; deletion proceeds either way.
 */
export function shouldRevokeApple(input: { providers: readonly string[]; platform: string }): boolean {
  return input.platform === 'ios' && input.providers.includes('apple');
}
