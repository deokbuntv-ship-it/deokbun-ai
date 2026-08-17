// DeokbunAI — Video Generation START Edge Function (VIDEO_STANDARD)
//
// Owner-approved: VIDEO_STANDARD = Google Veo (short-form, 720p, native audio OFF),
// resolved server-side (videoPolicy.ts; never in client/domain). Reuses the async
// Gemini API Veo `:predictLongRunning` contract (verified against Google docs):
// this function STARTS the long-running operation and records a content_assets row
// with status='processing' + provider_job_id=<operation name>. A separate
// video-status function polls + persists to Storage. No fake progress/success.
//
// Security: verify_jwt + admin_users gate. Google key (GEMINI_API_KEY) is a
// server secret only (USER ACTION to set). Runtime: Deno.

import { withSupabase } from 'npm:@supabase/server@1.4.1';
import { createClient } from 'npm:@supabase/supabase-js';

import {
  resolveVideoPolicy,
  normalizeAspect,
  type VideoAspectRatio,
} from './videoPolicy.ts';
import { buildVideoPrompt, promptHash, VIDEO_PROMPT_VERSION } from './prompts.ts';

// Gemini API Veo endpoint (server-side; API key auth via x-goog-api-key).
function veoStartUrl(model: string): string {
  const base =
    Deno.env.get('GEMINI_API_BASE')?.trim() ||
    'https://generativelanguage.googleapis.com/v1beta';
  return `${base}/models/${model}:predictLongRunning`;
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

export default {
  fetch: withSupabase(
    { auth: 'user' },
    async (req: Request, _ctx: unknown): Promise<Response> => {
      const startedAt = Date.now();
      const userId = userIdFromRequest(req);

      const logUsage = async (
        model: string | null,
        status: 'success' | 'error',
        errorCode: string | null,
      ) => {
        try {
          const admin = serviceClient();
          if (!admin) return;
          await admin.from('ai_usage_logs').insert({
            user_id: userId,
            model,
            request_type: 'video_generate',
            latency_ms: Date.now() - startedAt,
            status,
            error_code: errorCode,
          });
        } catch {
          /* never blocks */
        }
      };

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
        const b = (body ?? {}) as Record<string, unknown>;
        const contentId = typeof b.contentId === 'string' ? b.contentId : null;
        const famousId = typeof b.famousId === 'string' ? b.famousId : null;
        const aspectRatio: VideoAspectRatio = normalizeAspect(b.aspectRatio);
        const subject = typeof b.subject === 'string' ? b.subject : undefined;
        const category = typeof b.category === 'string' ? b.category : undefined;
        const targetUse = typeof b.targetUse === 'string' ? b.targetUse : undefined;

        const policy = resolveVideoPolicy(b.workload);
        if (!policy.configured || policy.provider !== 'google-veo') {
          return Response.json({ error: 'PROVIDER_NOT_CONFIGURED' }, { status: 400 });
        }

        const apiKey = readGeminiKey();
        if (!apiKey) {
          console.error('[video-generate] server_not_configured');
          return Response.json({ error: 'SERVER_NOT_CONFIGURED' }, { status: 500 });
        }

        const admin = serviceClient();
        if (!admin) {
          return Response.json({ error: 'SERVER_NOT_CONFIGURED' }, { status: 500 });
        }

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

        const prompt = buildVideoPrompt({ subject, category, targetUse });

        // Start the long-running operation (Veo predictLongRunning contract).
        let providerResponse: Response;
        try {
          providerResponse = await fetch(veoStartUrl(policy.model), {
            method: 'POST',
            headers: {
              'x-goog-api-key': apiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              instances: [{ prompt }],
              parameters: {
                aspectRatio,
                resolution: policy.resolution,
                durationSeconds: policy.durationSeconds,
                generateAudio: policy.generateAudio,
                sampleCount: 1,
              },
            }),
          });
        } catch {
          await logUsage(policy.model, 'error', 'PROVIDER_FETCH_FAILED');
          return Response.json({ error: 'PROVIDER_FETCH_FAILED' }, { status: 502 });
        }

        if (!providerResponse.ok) {
          const code =
            providerResponse.status === 429
              ? 'RATE_LIMITED'
              : `PROVIDER_${providerResponse.status}`;
          console.error(
            '[video-generate] provider_error',
            JSON.stringify({ status: providerResponse.status }),
          );
          await logUsage(policy.model, 'error', code);
          return Response.json({ error: code }, { status: 502 });
        }

        let started: unknown;
        try {
          started = await providerResponse.json();
        } catch {
          await logUsage(policy.model, 'error', 'PARSE_FAILED');
          return Response.json({ error: 'PROVIDER_ERROR' }, { status: 502 });
        }
        const operationName = (started as { name?: unknown } | null)?.name;
        if (typeof operationName !== 'string' || operationName.length === 0) {
          await logUsage(policy.model, 'error', 'NO_OPERATION');
          return Response.json({ error: 'PROVIDER_ERROR' }, { status: 502 });
        }

        // Record the processing job (no fake progress; status='processing').
        const { data: assetRow, error: assetErr } = await admin
          .from('content_assets')
          .insert({
            content_id: contentId,
            kind: 'video',
            status: 'processing',
            provider: policy.provider,
            model: policy.model,
            prompt,
            aspect_ratio: aspectRatio,
            duration_seconds: policy.durationSeconds,
            provider_job_id: operationName,
            metadata: {
              workload: policy.workload,
              resolution: policy.resolution,
              generate_audio: policy.generateAudio,
              prompt_version: VIDEO_PROMPT_VERSION,
              prompt_hash: promptHash(prompt),
              target_use: targetUse ?? null,
              source_famous_id: famousId,
            },
            created_by: userId,
          })
          .select('id, status, provider_job_id')
          .single();

        if (assetErr || assetRow === null) {
          await logUsage(policy.model, 'error', 'PERSIST_FAILED');
          return Response.json({ error: 'PERSIST_FAILED' }, { status: 500 });
        }

        await logUsage(policy.model, 'success', null);

        return Response.json({
          asset: { id: assetRow.id, status: 'processing' },
          provenance: {
            provider: policy.provider,
            model: policy.model,
            workload: policy.workload,
            resolution: policy.resolution,
            durationSeconds: policy.durationSeconds,
            generateAudio: policy.generateAudio,
            aspectRatio,
            promptVersion: VIDEO_PROMPT_VERSION,
          },
        });
      } catch (error) {
        console.error(
          '[video-generate] unhandled_exception',
          JSON.stringify({ name: (error as Error)?.name ?? 'UnknownError' }),
        );
        throw error;
      }
    },
  ),
};
