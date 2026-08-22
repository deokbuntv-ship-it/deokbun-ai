// App Store Server Notifications V2 endpoint (Sprint I §11) — FOUNDATION seam. Apple POSTs a signedPayload
// (JWS). It is UNTRUSTED until the JWS signature verifies (x5c → Apple root). This endpoint decodes the outer
// envelope, requires signature verification (NOT_CONFIGURED until the owner supplies APPLE_* config), dedupes by
// notificationUUID, and applies the entitlement/revocation idempotently via service-role RPCs. NO Notification
// V1. EDGE_RUNTIME_NOT_EXECUTED / BLOCKED_EXTERNAL for live verification. Never mutates entitlements from
// unverified JSON. Never logs the raw signedPayload or secrets.
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'content-type': 'application/json' } });

function appleConfigured(): boolean {
  return Boolean(
    Deno.env.get('APPLE_IAP_ISSUER_ID') && Deno.env.get('APPLE_IAP_KEY_ID') &&
    Deno.env.get('APPLE_IAP_PRIVATE_KEY') && Deno.env.get('APPLE_BUNDLE_ID'),
  );
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'METHOD_NOT_ALLOWED' }, 405);
  let body: { signedPayload?: unknown };
  try { body = await req.json(); } catch { return json({ error: 'INVALID_INPUT' }, 400); }
  if (typeof body.signedPayload !== 'string' || body.signedPayload.length === 0) {
    return json({ error: 'INVALID_INPUT' }, 400);
  }

  // Signature verification is mandatory before ANY accounting effect. Without config we cannot verify → 503.
  if (!appleConfigured()) {
    // Apple retries on non-2xx; 503 is appropriate until the verifier is configured (no fake accept).
    return json({ error: 'NOT_CONFIGURED' }, 503);
  }

  // TODO(owner): verify the outer JWS (x5c chain → Apple root) + the inner signedTransactionInfo, then:
  //   dedupe on notificationUUID (a repeated notification = ONE effect) → resolve product_catalog →
  //   REFUND/REVOKE → record_revocation ; renewal/purchase → record_verified_purchase (service role).
  // Until the verifier is implemented, fail closed rather than mutate entitlements.
  return json({ error: 'VERIFIER_NOT_IMPLEMENTED' }, 503);
});
