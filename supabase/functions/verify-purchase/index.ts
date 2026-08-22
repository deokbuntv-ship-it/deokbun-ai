// verify-purchase Edge (Sprint H §34) — FOUNDATION seam. Server-authoritative IAP verification entry point.
// The client sends ONLY an opaque provider submission { provider, storeProductId, transactionToken }; it NEVER
// sends price/Duk/entitlement/success. The server authenticates the user, verifies the token WITH THE STORE,
// resolves the SERVER product_catalog, and grants Duk via the idempotent record_verified_purchase RPC.
//
// Until provider credentials are configured, verification returns PURCHASE_VERIFICATION_FAILED /
// NOT_CONFIGURED — it NEVER fakes a successful verification in production (§34). EDGE_RUNTIME_NOT_EXECUTED (no
// local Deno / no store credentials): BLOCKED_EXTERNAL for a live call; the flow + config contract are fixed.
//
// Required owner config (secrets, names only): APPLE_IAP_ISSUER_ID / APPLE_IAP_KEY_ID / APPLE_IAP_PRIVATE_KEY /
// APPLE_IAP_BUNDLE_ID ; GOOGLE_PLAY_PACKAGE_NAME / GOOGLE_PLAY_SERVICE_ACCOUNT_JSON.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...CORS } });

function appleConfigured(): boolean {
  return Boolean(Deno.env.get('APPLE_IAP_ISSUER_ID') && Deno.env.get('APPLE_IAP_KEY_ID') && Deno.env.get('APPLE_IAP_PRIVATE_KEY') && Deno.env.get('APPLE_IAP_BUNDLE_ID'));
}
function googleConfigured(): boolean {
  return Boolean(Deno.env.get('GOOGLE_PLAY_PACKAGE_NAME') && Deno.env.get('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON'));
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'METHOD_NOT_ALLOWED' }, 405);

  // Authenticate the caller (JWT). No auth → AUTH_REQUIRED, never a grant.
  const authHeader = req.headers.get('Authorization') ?? '';
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!authHeader || !supabaseUrl || !anonKey) return json({ error: 'AUTH_REQUIRED' }, 401);
  const authed = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
  const { data: userData } = await authed.auth.getUser();
  const userId = userData?.user?.id ?? null;
  if (!userId) return json({ error: 'AUTH_REQUIRED' }, 401);

  // Validate the opaque submission shape (no price/Duk/entitlement accepted).
  let body: { provider?: unknown; storeProductId?: unknown; transactionToken?: unknown };
  try { body = await req.json(); } catch { return json({ error: 'INVALID_INPUT' }, 400); }
  const provider = body.provider === 'APPLE' || body.provider === 'GOOGLE' ? body.provider : null;
  const storeProductId = typeof body.storeProductId === 'string' ? body.storeProductId : null;
  const transactionToken = typeof body.transactionToken === 'string' ? body.transactionToken : null;
  if (!provider || !storeProductId || !transactionToken) return json({ error: 'INVALID_INPUT' }, 400);

  // Provider verification. NOT_CONFIGURED until the owner supplies credentials — never fake a success.
  const configured = provider === 'APPLE' ? appleConfigured() : googleConfigured();
  if (!configured) {
    return json({ error: 'PURCHASE_VERIFICATION_FAILED', reason: 'NOT_CONFIGURED' }, 503);
  }

  // TODO(owner): once configured, verify `transactionToken` with the store server API → derive the
  // AUTHORITATIVE externalTransactionId + storeProductId; resolve product_catalog(provider, storeProductId) →
  // internal key + grant_amount; then (service role):
  //   admin.rpc('record_verified_purchase', { p_user_id, p_provider, p_external_transaction_id, p_internal_key, p_grant_duk })
  // and return the authoritative balance. Until the verifier is implemented, fail closed rather than grant.
  if (!serviceKey) return json({ error: 'SERVICE_UNAVAILABLE' }, 503);
  return json({ error: 'PURCHASE_VERIFICATION_FAILED', reason: 'VERIFIER_NOT_IMPLEMENTED' }, 503);
});
