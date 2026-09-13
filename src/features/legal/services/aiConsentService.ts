import { logDbError } from '@/features/analysis';
import {
  AI_CONSENT_VERSION,
  parseConsentState,
  type AiConsentState,
} from '@/features/legal/aiProcessingConsent';
import { getSupabaseClient } from '@/services/supabase';

// 제3자 AI 처리 동의 — 저장·조회·철회 (마이그레이션 20260918000000).
//
// ⚠ 시각은 **서버가 찍는다.** RPC 로만 쓰고 표에 직접 INSERT 하지 않는다 — 클라이언트가
//   `granted_at` 을 정하면 그 기록은 증거로서의 값이 0이 된다.
//
// ⚠ 실패를 "동의함" 으로 읽지 않는다. 조회가 실패하면 `unknown` 이고, 화면은 그것을
//   동의하지 않은 것과 같이 다룬다 — 확인하지 못한 채 AI 로 보내는 것이 더 나쁘다.

const isWeb = (): boolean => typeof document !== 'undefined';

async function state(version: string = AI_CONSENT_VERSION): Promise<AiConsentState> {
  try {
    const { data, error } = await getSupabaseClient().rpc('ai_consent_state', { p_version: version });
    if (error) {
      // RPC 자체가 없는 환경(마이그레이션 미적용)도 여기로 온다. 그래도 통과시키지 않는다.
      logDbError(error, 'ai_consent_state', 'rpc');
      return { granted: false, reason: 'unknown' };
    }
    return parseConsentState(data);
  } catch {
    return { granted: false, reason: 'unknown' };
  }
}

async function grant(version: string = AI_CONSENT_VERSION): Promise<boolean> {
  try {
    const { error } = await getSupabaseClient().rpc('grant_ai_consent', {
      p_version: version,
      p_surface: isWeb() ? 'web' : 'app',
    });
    if (error) {
      logDbError(error, 'grant_ai_consent', 'rpc');
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/** 버전을 주지 않으면 이 사용자의 **모든** 동의를 철회한다. */
async function revoke(version?: string): Promise<boolean> {
  try {
    const { error } = await getSupabaseClient().rpc('revoke_ai_consent', { p_version: version ?? null });
    if (error) {
      logDbError(error, 'revoke_ai_consent', 'rpc');
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export const aiConsentService = { state, grant, revoke };
