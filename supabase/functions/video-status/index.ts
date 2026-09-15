// DeokbunAI — Video Generation STATUS/FINALIZE Edge Function (VIDEO_STANDARD)
//
// Polls a Google Veo long-running operation (started by video-generate) for a
// given content_assets video job, and — when the operation is DONE — downloads the
// result and PERSISTS it to Supabase Storage before marking the asset completed.
// A provider success with a storage failure is NOT reported as success (§19).
// No fake progress: while running, returns status='processing' only.
//
// Security: verify_jwt + admin_users gate; Google key server-side only. Deno.

import { withSupabase } from 'npm:@supabase/server@1.4.1';
import { createClient } from 'npm:@supabase/supabase-js';

const STORAGE_BUCKET = 'content-media';
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

function apiBase(): string {
  return (
    Deno.env.get('GEMINI_API_BASE')?.trim() ||
    'https://generativelanguage.googleapis.com/v1beta'
  );
}
function readGeminiKey(): string {
  return (
    Deno.env.get('GEMINI_API_KEY')?.trim() ||
    Deno.env.get('GOOGLE_API_KEY')?.trim() ||
    ''
  );
}
function userIdFromRequest(req: Request): string | null {
  try {
    const h = req.headers.get('Authorization') ?? '';
    const t = h.startsWith('Bearer ') ? h.slice(7) : '';
    const p = t.split('.')[1];
    if (!p) return null;
    const d = JSON.parse(atob(p.replace(/-/g, '+').replace(/_/g, '/'))) as {
      sub?: unknown;
    };
    return typeof d.sub === 'string' ? d.sub : null;
  } catch {
    return null;
  }
}
function serviceClient() {
  const url = Deno.env.get('SUPABASE_URL')?.trim() ?? '';
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim() ?? '';
  if (!url || !key) return null;
  return createClient(url, key);
}
async function isAdminUser(userId: string | null): Promise<boolean> {
  if (!userId) return false;
  const admin = serviceClient();
  if (!admin) return false;
  try {
    const { data, error } = await admin
      .from('admin_users')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();
    return !error && data !== null;
  } catch {
    return false;
  }
}

// Defensive extraction of the result video URI across known Veo response shapes.
// The exact path is confirmed on first real generation; the adapter is the single
// place to adjust if Google changes field names.
function extractVideoUri(response: unknown): string | null {
  const r = response as Record<string, unknown> | null;
  if (!r) return null;
  const candidates: unknown[] = [
    // response.generateVideoResponse.generatedSamples[0].video.uri
    (r.generateVideoResponse as { generatedSamples?: unknown[] } | undefined)
      ?.generatedSamples,
    // response.generatedSamples[0].video.uri
    r.generatedSamples,
    // response.videos[0].uri
    r.videos,
    // response.predictions[0]...
    r.predictions,
  ];
  for (const c of candidates) {
    if (Array.isArray(c) && c.length > 0) {
      const s0 = c[0] as Record<string, unknown>;
      const vid = (s0.video as { uri?: unknown } | undefined)?.uri ?? s0.uri;
      if (typeof vid === 'string' && vid.length > 0) return vid;
    }
  }
  return null;
}

export default {
  fetch: withSupabase(
    { auth: 'user' },
    async (req: Request, _ctx: unknown): Promise<Response> => {
      const userId = userIdFromRequest(req);
      try {
        if (req.method !== 'POST') {
          return Response.json({ error: 'METHOD_NOT_ALLOWED' }, { status: 405 });
        }
        if (!(await isAdminUser(userId))) {
          return Response.json({ error: 'FORBIDDEN' }, { status: 403 });
        }

        let body: unknown;
        try {
          body = await req.json();
        } catch {
          return Response.json({ error: 'INVALID_INPUT' }, { status: 400 });
        }
        const assetId = (body as { assetId?: unknown } | null)?.assetId;
        if (typeof assetId !== 'string' || assetId.length === 0) {
          return Response.json({ error: 'INVALID_INPUT' }, { status: 400 });
        }

        const admin = serviceClient();
        if (!admin) {
          return Response.json({ error: 'SERVER_NOT_CONFIGURED' }, { status: 500 });
        }

        const { data: asset, error: assetErr } = await admin
          .from('content_assets')
          .select('id, content_id, kind, status, provider_job_id, external_url')
          .eq('id', assetId)
          .maybeSingle();
        if (assetErr || asset === null || asset.kind !== 'video') {
          return Response.json({ error: 'ASSET_NOT_FOUND' }, { status: 404 });
        }

        // Idempotent: terminal states short-circuit.
        if (asset.status !== 'processing') {
          return Response.json({
            status: asset.status,
            externalUrl: asset.external_url ?? null,
          });
        }

        const apiKey = readGeminiKey();
        if (!apiKey) {
          return Response.json({ error: 'SERVER_NOT_CONFIGURED' }, { status: 500 });
        }
        const opName = String(asset.provider_job_id ?? '');
        if (!opName) {
          return Response.json({ error: 'NO_OPERATION' }, { status: 400 });
        }

        // Poll the operation.
        let opRes: Response;
        try {
          opRes = await fetch(`${apiBase()}/${opName}`, {
            headers: { 'x-goog-api-key': apiKey },
          });
        } catch {
          return Response.json({ status: 'processing' });
        }
        if (!opRes.ok) {
          // Transient poll failure — keep processing (bounded by client retries).
          return Response.json({ status: 'processing' });
        }
        const op = (await opRes.json()) as {
          done?: boolean;
          error?: unknown;
          response?: unknown;
        };

        if (!op.done) {
          return Response.json({ status: 'processing' });
        }

        if (op.error) {
          await admin
            .from('content_assets')
            .update({ status: 'failed', error_code: 'PROVIDER_ERROR' })
            .eq('id', assetId);
          return Response.json({ status: 'failed' });
        }

        const uri = extractVideoUri(op.response);
        if (!uri) {
          await admin
            .from('content_assets')
            .update({ status: 'failed', error_code: 'NO_VIDEO_URI' })
            .eq('id', assetId);
          return Response.json({ status: 'failed' });
        }

        // Download the video (requires the API key), validate, persist to Storage.
        let bytes: Uint8Array;
        try {
          const dl = await fetch(uri, { headers: { 'x-goog-api-key': apiKey } });
          if (!dl.ok) throw new Error('download_failed');
          bytes = new Uint8Array(await dl.arrayBuffer());
        } catch {
          await admin
            .from('content_assets')
            .update({ status: 'failed', error_code: 'DOWNLOAD_FAILED' })
            .eq('id', assetId);
          return Response.json({ status: 'failed' });
        }
        if (bytes.length === 0 || bytes.length > MAX_VIDEO_BYTES) {
          await admin
            .from('content_assets')
            .update({ status: 'failed', error_code: 'INVALID_VIDEO' })
            .eq('id', assetId);
          return Response.json({ status: 'failed' });
        }

        const path = `content/${asset.content_id ?? 'misc'}/video/${crypto.randomUUID()}.mp4`;
        const { error: upErr } = await admin.storage
          .from(STORAGE_BUCKET)
          .upload(path, bytes, { contentType: 'video/mp4', upsert: false });
        if (upErr) {
          await admin
            .from('content_assets')
            .update({ status: 'failed', error_code: 'STORAGE_FAILED' })
            .eq('id', assetId);
          return Response.json({ status: 'failed' });
        }

        const { data: pub } = admin.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        const publicUrl = pub?.publicUrl ?? null;

        await admin
          .from('content_assets')
          .update({
            status: 'completed',
            storage_path: path,
            external_url: publicUrl,
          })
          .eq('id', assetId);

        return Response.json({ status: 'completed', externalUrl: publicUrl });
      } catch (error) {
        console.error(
          '[video-status] unhandled_exception',
          JSON.stringify({ name: (error as Error)?.name ?? 'UnknownError' }),
        );
        throw error;
      }
    },
  ),
};
