// 제3자 AI 처리 동의 — 순수 계약 (애플 5.1.2(i)).
//
// WHY THIS EXISTS. 애플 심사 지침 5.1.2(i) (2026-09-10 원문 확인):
//   "You must clearly disclose where personal data will be shared with third parties,
//    including with third-party AI, and obtain explicit permission before doing so."
//
// 지금까지는 필수 동의 3항목(약관·개인정보·만14세)에 녹아 있었다. 심사관이 "AI 전송에
// 대한 명시적 동의" 를 따로 물으면 가리킬 것이 없었다.
//
// ⚠ 이 파일은 **문안과 버전**만 정한다. 저장은 서비스가, 서버 확인은 `chat` Edge 가 한다.
// ⚠ 문안이 실질적으로 바뀌면 버전을 올린다 → 사용자가 다시 동의한다. `terms.ts` 의
//   `TERMS_VERSION` 과 같은 방식이다.

export const AI_CONSENT_VERSION = 'ai-processing@2026-09-1';

/** 무엇을 보내는가 — **코드 기준**이다. 화면에 있는 말이 아니라 실제로 나가는 것이다. */
export const AI_CONSENT_SENT_ITEMS: readonly string[] = [
  '생년월일과 태어난 시각',
  '성별',
  '태어난 지역',
  '상담에서 직접 입력한 질문과 그 대화 내용',
  '궁합을 볼 때는 상대방으로 등록한 사람의 생년월일시',
];

/** 누구에게 — 업체명을 명시한다. "제3자" 라고만 쓰면 5.1.2(i) 를 만족하지 못한다. */
export const AI_CONSENT_PROCESSORS: readonly { name: string; role: string; region: string }[] = [
  { name: 'OpenAI', role: 'AI 해석문 생성', region: '미국' },
  { name: 'Supabase', role: '데이터 저장·인증', region: '미국·싱가포르' },
];

/** 왜 보내는가. */
export const AI_CONSENT_PURPOSE =
  '입력하신 정보로 계산한 명식을 바탕으로 AI가 해석문을 만듭니다. 계산은 앱의 엔진이 하고, '
  + '그 결과를 사람이 읽을 수 있는 글로 바꾸는 일만 AI가 합니다.';

/** 동의하지 않거나 철회하면 무엇이 안 되는가. 겁주지 않고 사실만. */
export const AI_CONSENT_WITHDRAW_NOTE =
  '동의하지 않으셔도 앱을 쓰실 수 있습니다. 다만 상담·오늘의 운세·이달의 운세·궁합·리포트처럼 '
  + 'AI가 글을 만드는 기능은 이용하실 수 없습니다. 동의는 [MY] → [설정]에서 언제든 철회하실 수 있고, '
  + '철회하시면 그때부터 새로 보내지 않습니다.';

export const AI_CONSENT_TITLE = 'AI 처리 동의';
export const AI_CONSENT_CHECKBOX_LABEL = '위 내용을 확인했고, AI 처리에 동의합니다';
export const AI_CONSENT_REQUIRED_NOTICE =
  'AI 처리에 동의하시면 이용하실 수 있습니다.';

/** ⚠ 기본값은 **미체크**. 미리 체크된 동의는 명시적 동의가 아니다. */
export const AI_CONSENT_DEFAULT_CHECKED = false as const;

export type AiConsentState =
  | { granted: true; version: string; grantedAt: string }
  | { granted: false; reason: 'none' | 'revoked' | 'auth' | 'unknown'; revokedAt?: string };

/** RPC(`ai_consent_state`) 응답을 읽는다. 모양이 어긋나면 **동의한 것으로 보지 않는다.** */
export function parseConsentState(raw: unknown): AiConsentState {
  if (!raw || typeof raw !== 'object') return { granted: false, reason: 'unknown' };
  const o = raw as Record<string, unknown>;
  if (o.granted === true && typeof o.version === 'string' && typeof o.grantedAt === 'string') {
    return { granted: true, version: o.version, grantedAt: o.grantedAt };
  }
  const reason = o.reason;
  const known = reason === 'none' || reason === 'revoked' || reason === 'auth';
  return {
    granted: false,
    reason: known ? reason : 'unknown',
    ...(typeof o.revokedAt === 'string' ? { revokedAt: o.revokedAt } : {}),
  };
}

/** 서버가 동의 없음으로 거절했을 때 쓰는 코드. 클라이언트가 이 값을 보고 동의 화면으로 보낸다. */
export const AI_CONSENT_REQUIRED_CODE = 'AI_CONSENT_REQUIRED';
