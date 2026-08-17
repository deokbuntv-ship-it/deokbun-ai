// DeokbunAI — Media (image) Generation Edge Function (IMAGE_STANDARD)
//
// Server trust boundary for AI IMAGE generation. Owner-approved policy:
// IMAGE_STANDARD → OpenAI, quality LOW (resolved server-side in imagePolicy.ts —
// NEVER hardcoded in the client/domain). Reuses the existing OPENAI_API_KEY.
//
// Security: verify_jwt + admin_users membership (same as content-generate). The
// image is generated, downloaded, and PERSISTED to Supabase Storage before a
// content_assets row is marked completed — a provider success with a storage
// failure is NOT reported as success (§17). No fake media. Runtime: Deno.

import { withSupabase } from 'npm:@supabase/server@1.4.1';
import { createClient } from 'npm:@supabase/supabase-js';

import {
  resolveImagePolicy,
  sizeForAspect,
  dimsForAspect,
  type ImageAspectRatio,
} from './imagePolicy.ts';
import { buildImagePrompt, promptHash, IMAGE_PROMPT_VERSION } from './prompts.ts';

const OPENAI_IMAGES_URL = 'https://api.openai.com/v1/images/generations';
const STORAGE_BUCKET = 'content-media';
const GENERATION_TIMEOUT_MS = 60_000;
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

function readApiKey(): string {
  return Deno.env.get('OPENAI_API_KEY')?.trim() ?? '';
}

function toNullableInt(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? Math.trunc(v) : null;
}

function userIdFromRequest(req: Request): string | null {
  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const part = token.split('.')[1];
    if (!part) return null;
    const decoded = JSON.parse(
      atob(part.replace(/-/g, '+').replace(/_/g, '/')),
    ) as { sub?: unknown };
    return typeof decoded.sub === 'string' ? decoded.sub : null;
  } catch {
    return null;
  }
}

function serviceClient() {
  const url = Deno.env.get('SUPABASE_URL')?.trim() ?? '';
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim() ?? '';
  if (url.length === 0 || key.length === 0) return null;
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

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

const ASPECTS = new Set(['1:1', '16:9', '4:5']);

export default {
  fetch: withSupabase(
    { auth: 'user' },
    async (req: Request, _ctx: unknown): Promise<Response> => {
      let stage = 'auth_completed';
      const startedAt = Date.now();
      const userId = userIdFromRequest(req);

      const logUsage = async (
        model: string | null,
        status: 'success' | 'error',
        errorCode: string | null,
        usage: Record<string, unknown>,
      ) => {
        try {
          const admin = serviceClient();
          if (!admin) return;
          await admin.from('ai_usage_logs').insert({
            user_id: userId,
            model,
            request_type: 'image_generate',
            input_tokens: toNullableInt(usage.input_tokens),
            output_tokens: toNullableInt(usage.output_tokens),
            total_tokens: toNullableInt(usage.total_tokens),
            latency_ms: Date.now() - startedAt,
            status,
            error_code: errorCode,
          });
        } catch {
          /* never blocks response */
        }
      };

      try {
        if (req.method !== 'POST') {
          return Response.json({ error: 'METHOD_NOT_ALLOWED' }, { status: 405 });
        }

        stage = 'admin_check';
        if (!(await isAdminUser(userId))) {
          return Response.json({ error: 'FORBIDDEN' }, { status: 403 });
        }

        let body: unknown;
        try {
          body = await req.json();
        } catch {
          return Response.json({ error: 'INVALID_INPUT' }, { status: 400 });
        }

        const b = (body ?? {}) as Record<string, unknown>;
        const contentId = typeof b.contentId === 'string' ? b.contentId : null;
        const famousId = typeof b.famousId === 'string' ? b.famousId : null;
        const aspectRatio: ImageAspectRatio = ASPECTS.has(b.aspectRatio as string)
          ? (b.aspectRatio as ImageAspectRatio)
          : '16:9';
        const subject = typeof b.subject === 'string' ? b.subject : undefined;
        const category = typeof b.category === 'string' ? b.category : undefined;
        const targetUse = typeof b.targetUse === 'string' ? b.targetUse : undefined;

        // Resolve workload policy (server decides provider/model/quality).
        const policy = resolveImagePolicy(b.workload);
        if (!policy.configured || policy.provider !== 'openai') {
          return Response.json(
            { error: 'PROVIDER_NOT_CONFIGURED' },
            { status: 400 },
          );
        }

        const apiKey = readApiKey();
        if (apiKey.length === 0) {
          console.error('[media-generate] server_not_configured');
          return Response.json({ error: 'SERVER_NOT_CONFIGURED' }, { status: 500 });
        }

        const admin = serviceClient();
        if (!admin) {
          return Response.json({ error: 'SERVER_NOT_CONFIGURED' }, { status: 500 });
        }

        // Validate the content item exists when contentId is provided.
        if (contentId) {
          const { data: itemRow, error: itemErr } = await admin
            .from('content_items')
            .select('id')
            .eq('id', contentId)
            .maybeSingle();
          if (itemErr || itemRow === null) {
            return Response.json({ error: 'CONTENT_NOT_FOUND' }, { status: 404 });
          }
        }

        const prompt = buildImagePrompt({ subject, category, targetUse });
        const size = sizeForAspect(aspectRatio);
        const { width, height } = dimsForAspect(aspectRatio);

        // ---- Provider call (timeout-guarded) ------------------------------
        stage = 'provider_request';
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), GENERATION_TIMEOUT_MS);
        let providerResponse: Response;
        try {
          providerResponse = await fetch(OPENAI_IMAGES_URL, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: policy.model,
              prompt,
              size,
              quality: policy.quality,
              n: 1,
            }),
            signal: controller.signal,
          });
        } catch (fetchError) {
          clearTimeout(timer);
          const aborted = (fetchError as Error)?.name === 'AbortError';
          const code = aborted ? 'TIMEOUT' : 'PROVIDER_FETCH_FAILED';
          console.error('[media-generate]', code);
          await logUsage(policy.model, 'error', code, {});
          return Response.json({ error: code }, { status: 502 });
        }
        clearTimeout(timer);

        if (!providerResponse.ok) {
          const code =
            providerResponse.status === 429
              ? 'RATE_LIMITED'
              : `PROVIDER_${providerResponse.status}`;
          console.error(
            '[media-generate] provider_error',
            JSON.stringify({ status: providerResponse.status }),
          );
          await logUsage(policy.model, 'error', code, {});
          return Response.json({ error: code }, { status: 502 });
        }

        stage = 'response_parse';
        let payload: unknown;
        try {
          payload = await providerResponse.json();
        } catch {
          await logUsage(policy.model, 'error', 'PARSE_FAILED', {});
          return Response.json({ error: 'PROVIDER_ERROR' }, { status: 502 });
        }

        const first = (payload as { data?: unknown[] } | null)?.data?.[0] as
          | { b64_json?: unknown; url?: unknown }
          | undefined;
        const b64 = typeof first?.b64_json === 'string' ? first.b64_json : '';
        if (b64.length === 0) {
          await logUsage(policy.model, 'error', 'EMPTY_RESPONSE', {});
          return Response.json({ error: 'EMPTY_RESPONSE' }, { status: 502 });
        }

        const bytes = b64ToBytes(b64);
        if (bytes.length === 0 || bytes.length > MAX_IMAGE_BYTES) {
          await logUsage(policy.model, 'error', 'INVALID_IMAGE', {});
          return Response.json({ error: 'INVALID_IMAGE' }, { status: 502 });
        }

        const usage =
          (payload as { usage?: Record<string, unknown> } | null)?.usage ?? {};

        // ---- Persist to Storage (must succeed before SUCCEEDED) -----------
        stage = 'storage_upload';
        const path = `content/${contentId ?? 'misc'}/${crypto.randomUUID()}.png`;
        const { error: upErr } = await admin.storage
          .from(STORAGE_BUCKET)
          .upload(path, bytes, { contentType: 'image/png', upsert: false });
        if (upErr) {
          console.error('[media-generate] storage_failed');
          // Record the failure honestly; do NOT return a public asset.
          try {
            await admin.from('content_assets').insert({
              content_id: contentId,
              kind: 'image',
              status: 'failed',
              provider: policy.provider,
              model: policy.model,
              prompt,
              aspect_ratio: aspectRatio,
              width,
              height,
              error_code: 'STORAGE_FAILED',
              metadata: {
                workload: policy.workload,
                quality: policy.quality,
                prompt_version: IMAGE_PROMPT_VERSION,
              },
              created_by: userId,
            });
          } catch {
            /* ignore */
          }
          await logUsage(policy.model, 'error', 'STORAGE_FAILED', usage);
          return Response.json({ error: 'STORAGE_FAILED' }, { status: 500 });
        }

        const { data: pub } = admin.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(path);
        const publicUrl = pub?.publicUrl ?? null;

        // ---- content_assets record (provenance) ---------------------------
        stage = 'persist_asset';
        const { data: assetRow, error: assetErr } = await admin
          .from('content_assets')
          .insert({
            content_id: contentId,
            kind: 'image',
            status: 'completed',
            provider: policy.provider,
            model: policy.model,
            prompt,
            aspect_ratio: aspectRatio,
            width,
            height,
            storage_path: path,
            external_url: publicUrl,
            metadata: {
              workload: policy.workload,
              quality: policy.quality,
              prompt_version: IMAGE_PROMPT_VERSION,
              prompt_hash: promptHash(prompt),
              target_use: targetUse ?? null,
              source_famous_id: famousId,
              mime_type: 'image/png',
            },
            created_by: userId,
          })
          .select(
            'id, kind, status, provider, model, aspect_ratio, width, height, storage_path, external_url, created_at',
          )
          .single();

        if (assetErr || assetRow === null) {
          console.error('[media-generate] asset_insert_failed');
          await logUsage(policy.model, 'error', 'PERSIST_FAILED', usage);
          return Response.json({ error: 'PERSIST_FAILED' }, { status: 500 });
        }

        await logUsage(policy.model, 'success', null, usage);

        return Response.json({
          asset: {
            id: assetRow.id,
            status: assetRow.status,
            externalUrl: assetRow.external_url,
            width: assetRow.width,
            height: assetRow.height,
            aspectRatio: assetRow.aspect_ratio,
          },
          provenance: {
            provider: policy.provider,
            model: policy.model,
            workload: policy.workload,
            quality: policy.quality,
            promptVersion: IMAGE_PROMPT_VERSION,
          },
        });
      } catch (error) {
        console.error(
          '[media-generate] unhandled_exception',
          JSON.stringify({
            stage,
            name: (error as Error)?.name ?? 'UnknownError',
          }),
        );
        throw error;
      }
    },
  ),
};
