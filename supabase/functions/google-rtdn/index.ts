// Google Real-Time Developer Notifications endpoint (Sprint I §18) — FOUNDATION seam. Google Cloud Pub/Sub
// POSTs a push message { message: { data: base64 } }. The notification is only a CHANGE SIGNAL: after decoding
// it the server MUST query the Play Developer API for the AUTHORITATIVE purchase state and reconcile
// idempotently — it never grants/revokes from the RTDN contents. Request authentication (OIDC token / Pub/Sub
// audience) + Developer-API access are NOT_CONFIGURED until the owner supplies GOOGLE_PLAY_* config →
// BLOCKED_EXTERNAL for live. Never mutates entitlements from unverified JSON.
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'content-type': 'application/json' } });

function googleConfigured(): boolean {
  return Boolean(Deno.env.get('GOOGLE_PLAY_PACKAGE_NAME') && Deno.env.get('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON'));
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'METHOD_NOT_ALLOWED' }, 405);
  let body: { message?: { data?: unknown } };
  try { body = await req.json(); } catch { return json({ error: 'INVALID_INPUT' }, 400); }
  if (!body.message || typeof body.message.data !== 'string') return json({ error: 'INVALID_INPUT' }, 400);

  // Without Developer-API + request-auth config we cannot fetch authoritative state → do not act.
  if (!googleConfigured()) return json({ error: 'NOT_CONFIGURED' }, 503);

  // TODO(owner): authenticate the Pub/Sub push (OIDC token audience) → decode the envelope (decodeRtdn) →
  //   for a real notification (requiresAuthoritativeFetch) call the Play Developer API (products/subscriptions
  //   v2) for the authoritative state → shouldGrant/shouldAcknowledge → record_verified_purchase /
  //   record_revocation (service role, idempotent). Pub/Sub retries on non-2xx, so idempotency is essential.
  // Until wired, ACK the message with 200 only after authoritative reconcile; here fail closed with 503.
  return json({ error: 'VERIFIER_NOT_IMPLEMENTED' }, 503);
});
