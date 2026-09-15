// Client contract (Sprint H §49/§50). Safe, READ-only client surface + the two client-triggerable requests
// (light candle — in dukWalletService; verify purchase — here, an opaque server call). The client NEVER
// exposes spendDuk/grantDuk/commitDuk/reserveDuk/setDebt — those verbs do not exist on the client at all.
import { getSupabaseClient } from '@/services/supabase';

// §50 — stable user-facing application error codes. Internal DB/provider errors are never surfaced.
export type DukErrorCode =
  | 'AUTH_REQUIRED'
  | 'SAFETY_HANDLED'
  | 'INSUFFICIENT_DUK'
  | 'SESSION_EXPIRED'
  | 'PURCHASE_PENDING'
  | 'PURCHASE_VERIFICATION_FAILED'
  | 'SERVICE_UNAVAILABLE';

export type SessionStatus = {
  active: boolean;
  sessionId: string | null;
  productType: 'general' | 'compatibility' | 'premium_report' | null;
  successfulTurnCount: number;
  turnLimit: number;
  expiresAt: string | null;
};

const NO_SESSION: SessionStatus = { active: false, sessionId: null, productType: null, successfulTurnCount: 0, turnLimit: 0, expiresAt: null };

/**
 * SESSION exhaustion for the UI, honoring the frozen 24h TTL. True ONLY when a live session has reached its
 * successful-turn limit AND is still within its TTL. An EXPIRED session is NOT exhausted: getSessionStatus
 * returns OPEN/ACTIVE rows regardless of expiry and nothing flips an expired session to a terminal status, so
 * without this expiry gate a past-TTL exhausted session pins the "이번 상담의 남은 질문을 모두 썼어요" paywall
 * forever. When the session is expired the UI shows the composer and the server's reserve_session_duk starts a
 * fresh session on the next send (the expired one is never resumed). Does NOT change price/turn-limit/TTL.
 */
export function isSessionExhausted(session: SessionStatus | null, nowMs: number): boolean {
  if (session === null || session.sessionId === null || session.turnLimit <= 0) return false;
  const expired = session.expiresAt !== null && new Date(session.expiresAt).getTime() <= nowMs;
  return !expired && session.successfulTurnCount >= session.turnLimit;
}

/** READ the server-verified active session for a product (READ only; the server owns all session mutation). */
export async function getSessionStatus(productType: 'general' | 'compatibility'): Promise<SessionStatus> {
  try {
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from('consultation_sessions')
      .select('session_id,product_type,successful_turn_count,turn_limit,expires_at,status')
      .eq('product_type', productType)
      .in('status', ['OPEN', 'ACTIVE'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    const row = data as {
      session_id?: string; product_type?: SessionStatus['productType']; successful_turn_count?: number;
      turn_limit?: number; expires_at?: string;
    } | null;
    if (!row?.session_id) return { ...NO_SESSION };
    const expired = row.expires_at ? new Date(row.expires_at).getTime() <= Date.now() : false;
    const usable = !expired && (row.successful_turn_count ?? 0) < (row.turn_limit ?? 0);
    return {
      active: usable,
      sessionId: row.session_id,
      productType: row.product_type ?? productType,
      successfulTurnCount: row.successful_turn_count ?? 0,
      turnLimit: row.turn_limit ?? 0,
      expiresAt: row.expires_at ?? null,
    };
  } catch {
    return { ...NO_SESSION };
  }
}

export type PurchaseVerificationRequest = {
  provider: 'APPLE' | 'GOOGLE';
  storeProductId: string;
  transactionToken: string; // opaque store token — the server verifies it
};
export type PurchaseVerificationResult = { ok: boolean; code?: DukErrorCode };

/**
 * Ask the SERVER to verify a store purchase. The client sends only the opaque submission — no price, no Duk, no
 * entitlement, no success flag. The server (verify-purchase Edge) verifies with the store and grants Duk.
 */
export async function requestPurchaseVerification(req: PurchaseVerificationRequest): Promise<PurchaseVerificationResult> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.functions.invoke('verify-purchase', { body: req });
    if (error) return { ok: false, code: 'PURCHASE_VERIFICATION_FAILED' };
    const d = data as { error?: string } | null;
    if (d?.error) return { ok: false, code: (d.error as DukErrorCode) ?? 'PURCHASE_VERIFICATION_FAILED' };
    return { ok: true };
  } catch {
    return { ok: false, code: 'SERVICE_UNAVAILABLE' };
  }
}
