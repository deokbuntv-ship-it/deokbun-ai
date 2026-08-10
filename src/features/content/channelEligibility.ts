import type { ContentItem, ProviderConnection } from './types';

// Provider-neutral channel publish-readiness. Computes an ACCURATE, fail-closed
// status from the real connection state + content + media — never shows READY
// unless the actual prerequisites exist. Meta-specific rules stay here (not
// scattered through the content domain); adding a channel = adding a resolver.

export type PublishReadiness =
  | 'READY'
  | 'CONNECTED_NOT_READY'
  | 'OAUTH_REQUIRED'
  | 'REAUTH_REQUIRED'
  | 'ERROR'
  | 'MANUAL_ONLY'
  | 'NOT_CONFIGURED';

export type EligibilityResult = {
  readiness: PublishReadiness;
  reasons: string[];
};

export const READINESS_LABEL: Record<PublishReadiness, string> = {
  READY: '발행 준비됨',
  CONNECTED_NOT_READY: '연결됨 · 준비 필요',
  OAUTH_REQUIRED: 'OAUTH_REQUIRED (Meta 연결 필요)',
  REAUTH_REQUIRED: 'REAUTH_REQUIRED (재인증 필요)',
  ERROR: '연결 오류',
  MANUAL_ONLY: '수동 발행',
  NOT_CONFIGURED: '미설정',
};

// Instagram: official Meta Graph API. Real publish requires a CONNECTED account
// (OAuth + App Review), plus content ready + at least one media asset.
export function instagramEligibility(
  connection: ProviderConnection | null,
  item: ContentItem,
): EligibilityResult {
  const status = connection?.status ?? 'not_connected';
  if (status === 'error') {
    return { readiness: 'ERROR', reasons: ['채널 연결에 오류가 있습니다.'] };
  }
  if (status === 'expired') {
    return {
      readiness: 'REAUTH_REQUIRED',
      reasons: ['액세스 토큰이 만료되었습니다. 재인증이 필요합니다.'],
    };
  }
  if (status !== 'connected') {
    return {
      readiness: 'OAUTH_REQUIRED',
      reasons: ['Meta 앱/전문계정 OAuth 연결이 필요합니다 (App Review 포함).'],
    };
  }
  // Connected — validate content + media eligibility (fail-closed).
  const reasons: string[] = [];
  if (!(item.status === 'ready' || item.status === 'published')) {
    reasons.push('콘텐츠 상태가 준비완료/발행이 아닙니다.');
  }
  if (!item.heroImageUrl && !item.videoUrl) {
    reasons.push('인스타그램은 이미지 또는 영상이 필요합니다.');
  }
  return reasons.length === 0
    ? { readiness: 'READY', reasons: [] }
    : { readiness: 'CONNECTED_NOT_READY', reasons };
}

// Naver: no official personal-blog write API → always manual publish.
export function naverEligibility(): EligibilityResult {
  return {
    readiness: 'MANUAL_ONLY',
    reasons: ['네이버 공식 자동 발행 API가 없어 수동 발행합니다.'],
  };
}
