// DeokbunAI — ad-track Edge Function (Sprint 3B, ARTIFACT — owner-deploy)
//
// WHY THIS EXISTS: acquisition tracking must be SERVER-TRUSTED (§50). Anonymous ad
// clicks and first-touch attribution are written here via the SERVICE ROLE, never by a
// client RLS insert (which anyone could forge/spam). The client (src/features/ads/
// acquisition/acquisitionService.ts) only fire-and-forgets a {kind, code, visitorId}
// payload; this function VALIDATES, resolves the code to a real ad, rate-limits, filters
// obvious crawlers, and inserts. Signup / first_consultation / birth_info conversions are
// NOT written here — they are DB triggers on profiles / ai_usage_logs / consultation_subjects
// (docs/ADVERTISEMENTS_SETUP.sql), so a client can never assert them.
//
// SECURITY:
// - SUPABASE_SERVICE_ROLE_KEY is read ONLY here (Deno env), never in the client bundle.
// - verify_jwt = false (anonymous clicks must be recordable). For kind='attribution' the
//   function VERIFIES the caller's JWT and uses the token's user id — a client-sent userId
//   is NEVER trusted (prevents cross-user attribution, §51).
// - Invalid/unknown/inactive tracking codes are silently ignored (no enumeration oracle).
// - PII-minimal (§52): stores visitor_id (anon random) + code only; NO raw IP, NO full
//   user-agent persisted (UA is used transiently for crawler filtering, then dropped).
// - Best-effort rate limit per visitor to blunt click spam (§53); never a hard guarantee.
//
// Owner must deploy this function and add [functions.ad-track] verify_jwt=false to
// supabase/config.toml. Requires docs/ADVERTISEMENTS_SETUP.sql applied first.

import { createClient } from 'npm:@supabase/supabase-js';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Mirror of src/features/ads/trackingCode.ts (isValidTrackingCode).
const CODE_RE = /^ad_[23456789abcdefghjkmnpqrstuvwxyz]{8}$/;

// Obvious crawler / link-preview user agents to exclude from click counts (§53).
const BOT_RE = /(bot|crawler|spider|preview|facebookexternalhit|slackbot|kakaotalk|line-poker|whatsapp|telegrambot|embedly|discordbot|googlebot|bingbot|yeti|naver)/i;

function serviceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } },
  );
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json(405, { ok: false });

  let payload: { kind?: string; code?: string; visitorId?: string | null };
  try {
    payload = await req.json();
  } catch {
    return json(400, { ok: false });
  }

  const code = typeof payload.code === 'string' ? payload.code : '';
  if (!CODE_RE.test(code)) return json(200, { ok: true, ignored: 'code' }); // silent ignore

  const ua = req.headers.get('user-agent') ?? '';
  if (BOT_RE.test(ua)) return json(200, { ok: true, ignored: 'bot' }); // exclude crawlers (§53)

  const supabase = serviceClient();

  // Resolve code → active advertisement. Unknown/inactive → silently ignored.
  const { data: ad } = await supabase
    .from('advertisements')
    .select('id, status')
    .eq('public_tracking_code', code)
    .maybeSingle();
  if (!ad || (ad.status !== 'active' && ad.status !== 'ended')) {
    return json(200, { ok: true, ignored: 'ad' });
  }

  const visitorId =
    typeof payload.visitorId === 'string' && payload.visitorId.length <= 64 ? payload.visitorId : null;

  if (payload.kind === 'click') {
    // Best-effort rate limit: cap clicks per visitor in a short window (§53).
    if (visitorId) {
      const since = new Date(Date.now() - 60_000).toISOString();
      const { count } = await supabase
        .from('ad_tracking_events')
        .select('id', { count: 'exact', head: true })
        .eq('event_type', 'ad_click')
        .eq('visitor_id', visitorId)
        .gte('created_at', since);
      if ((count ?? 0) >= 10) return json(200, { ok: true, ignored: 'rate' });
    }
    await supabase.from('ad_tracking_events').insert({
      event_type: 'ad_click',
      tracking_code: code,
      ad_id: ad.id,
      visitor_id: visitorId,
    });
    return json(200, { ok: true });
  }

  if (payload.kind === 'attribution') {
    // Server-trusted user id from the JWT — never the client-sent one (§51).
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (!token) return json(200, { ok: true, ignored: 'no_auth' });
    const { data: userData } = await supabase.auth.getUser(token);
    const userId = userData?.user?.id;
    if (!userId) return json(200, { ok: true, ignored: 'auth' });

    // First-touch upsert (never overwrite first_ad_id, §20); latest_* always updated.
    await supabase
      .from('user_acquisition_attribution')
      .upsert(
        {
          user_id: userId,
          first_ad_id: ad.id,
          first_tracking_code: code,
          first_visitor_id: visitorId,
          first_touch_at: new Date().toISOString(),
          latest_ad_id: ad.id,
          latest_touch_at: new Date().toISOString(),
        },
        { onConflict: 'user_id', ignoreDuplicates: true }, // first-touch preserved (§20)
      );
    // Update only the latest_* fields on an existing row (does not touch first_*).
    await supabase
      .from('user_acquisition_attribution')
      .update({ latest_ad_id: ad.id, latest_touch_at: new Date().toISOString() })
      .eq('user_id', userId);
    return json(200, { ok: true });
  }

  return json(400, { ok: false });
});
