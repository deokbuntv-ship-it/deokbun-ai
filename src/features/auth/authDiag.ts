import { newRequestId } from '@/features/analysis';

// Safe auth diagnostics (Overnight Sprint §1B). Production login failures were
// UN-diagnosable: the client logged nothing and every failure collapsed to one
// generic message. This emits a SINGLE compact `[auth.diag]` breadcrumb so a
// failure is attributable to an exact STAGE + reason code.
//
// Constitution §20 (Secret/Token 로그 금지): this NEVER logs an access/refresh
// token, an OAuth authorization code, a client secret, a full callback URL, an
// email, or any birth/PII. The `AuthDiagFields` type structurally permits ONLY the
// four safe fields below — a sensitive value cannot be passed without a type error.
export type AuthDiagStage =
  | 'authorize' // building/opening the provider authorize URL
  | 'callback_parse' // parsing code/state from the return URL
  | 'state_validate' // CSRF state round-trip check
  | 'edge_invoke' // trusted edge exchange (naver-auth)
  | 'session_set' // supabase.auth.setSession
  | 'outcome'; // final surfaced outcome (screen)

export type AuthDiagProvider = 'naver' | 'kakao' | 'google' | 'apple';

export type AuthDiagFields = {
  provider: AuthDiagProvider;
  stage: AuthDiagStage;
  // A SAFE reason/outcome code (e.g. 'REQUEST_FAILED', 'AUTH_CONFIG_REQUIRED') —
  // never a token, message, URL, or provider payload.
  code: string;
  // Optional correlation id; one is minted when absent. Non-PII (req_<base36>_<rand>).
  requestId?: string;
};

// Emits the breadcrumb and returns the correlation id so a caller can reuse ONE id
// across the stages of a single login attempt.
export function authDiag(fields: AuthDiagFields): string {
  const requestId = fields.requestId ?? newRequestId();
  // eslint-disable-next-line no-console
  console.warn(
    `[auth.diag] provider=${fields.provider} stage=${fields.stage} code=${fields.code} req=${requestId}`,
  );
  return requestId;
}
