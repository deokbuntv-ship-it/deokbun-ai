// DeokbunAI — Content Generation Edge Function (CONTENT-02)
//
// Server trust boundary for AI TEXT generation in the Content Studio. Mirrors the
// chat function's security model and adds an ADMIN gate:
// - OpenAI key lives only in server secrets (reused OPENAI_API_KEY).
// - verify_jwt = true (platform) → only authenticated users reach this handler.
// - ADDITIONALLY admin-only: the caller's JWT `sub` must be in public.admin_users
//   (checked server-side with the service_role key — the canonical allowlist that
//   public.is_admin() uses). Non-admins get 403 and nothing is generated.
// - The MODEL and OUTPUT TOKEN LIMIT are server-decided (env), never client.
// - On a real provider success, an immutable public.content_versions row is
//   written (source='ai', provider, model, prompt_version, input_ref, token_usage)
//   and raw usage is logged to public.ai_usage_logs (request_type='content_generate').
// - NEVER auto-publishes. The generated draft is returned for operator review; the
//   content_items row is untouched here.
//
// Runtime: Supabase Edge Functions (Deno). Excluded from the app tsconfig; never
// bundled by Metro.

import { withSupabase } from 'npm:@supabase/server';
import { createClient } from 'npm:@supabase/supabase-js';

import { getTemplate, type TemplateVariables } from './templates.ts';
import { resolveWorkload } from './workloads.ts';

const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';

function readApiKey(): string {
  return Deno.env.get('OPENAI_API_KEY')?.trim() ?? '';
}

function toNullableInt(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.trunc(value)
    : null;
}

function userIdFromRequest(req: Request): string | null {
  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;
    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(normalized)) as { sub?: unknown };
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

// Canonical admin allowlist check (same membership public.is_admin() evaluates).
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

function extractText(payload: unknown): string {
  const output = (payload as { output?: unknown } | null)?.output;
  if (Array.isArray(output)) {
    const parts: string[] = [];
    for (const item of output) {
      if (item?.type === 'message' && Array.isArray(item.content)) {
        for (const part of item.content) {
          if (part?.type === 'output_text' && typeof part.text === 'string') {
            parts.push(part.text);
          }
        }
      }
    }
    const joined = parts.join('').trim();
    if (joined.length > 0) return joined;
  }
  const convenience = (payload as { output_text?: unknown } | null)?.output_text;
  if (typeof convenience === 'string' && convenience.trim().length > 0) {
    return convenience.trim();
  }
  return '';
}

type Draft = {
  title: string | null;
  summary: string | null;
  body: string;
  tags: string[];
};

// Defensive parse: the model is instructed to return a strict JSON object, but we
// never fail a real provider response over formatting — if JSON parsing fails we
// keep the raw text as the body (still a genuine generation, not fake).
function parseDraft(text: string): Draft {
  const tryParse = (s: string): Draft | null => {
    try {
      const obj = JSON.parse(s) as Record<string, unknown>;
      const body =
        typeof obj.body === 'string' && obj.body.trim().length > 0
          ? obj.body.trim()
          : '';
      if (body.length === 0) return null;
      return {
        title: typeof obj.title === 'string' ? obj.title.trim() : null,
        summary: typeof obj.summary === 'string' ? obj.summary.trim() : null,
        body,
        tags: Array.isArray(obj.tags)
          ? obj.tags.filter((t): t is string => typeof t === 'string')
          : [],
      };
    } catch {
      return null;
    }
  };

  const direct = tryParse(text);
  if (direct) return direct;

  // Extract the first balanced {...} block if the model added stray prose.
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end > start) {
    const block = tryParse(text.slice(start, end + 1));
    if (block) return block;
  }

  return { title: null, summary: null, body: text.trim(), tags: [] };
}

function isVariables(value: unknown): value is TemplateVariables {
  return value === undefined || (typeof value === 'object' && value !== null);
}

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
            request_type: 'content_generate',
            input_tokens: toNullableInt(usage.input_tokens),
            output_tokens: toNullableInt(usage.output_tokens),
            total_tokens: toNullableInt(usage.total_tokens),
            latency_ms: Date.now() - startedAt,
            status,
            error_code: errorCode,
          });
        } catch {
          // usage logging must never affect the response
        }
      };

      try {
        if (req.method !== 'POST') {
          return Response.json({ error: 'METHOD_NOT_ALLOWED' }, { status: 405 });
        }

        // ---- Admin gate ----------------------------------------------------
        stage = 'admin_check';
        if (!(await isAdminUser(userId))) {
          return Response.json({ error: 'FORBIDDEN' }, { status: 403 });
        }

        const apiKey = readApiKey();
        if (apiKey.length === 0) {
          console.error('[content-generate] server_not_configured');
          return Response.json(
            { error: 'SERVER_NOT_CONFIGURED' },
            { status: 500 },
          );
        }

        let body: unknown;
        try {
          body = await req.json();
        } catch {
          return Response.json({ error: 'INVALID_INPUT' }, { status: 400 });
        }

        const contentId = (body as { contentId?: unknown } | null)?.contentId;
        const templateId = (body as { templateId?: unknown } | null)?.templateId;
        const variables = (body as { variables?: unknown } | null)?.variables;
        const workloadInput = (body as { workload?: unknown } | null)?.workload;
        // Server decides the concrete model from the logical workload.
        const { workload, model, maxOutputTokens } =
          resolveWorkload(workloadInput);

        if (
          typeof contentId !== 'string' ||
          contentId.length === 0 ||
          typeof templateId !== 'string' ||
          templateId.length === 0 ||
          !isVariables(variables)
        ) {
          return Response.json({ error: 'INVALID_INPUT' }, { status: 400 });
        }

        const template = getTemplate(templateId);
        if (!template) {
          return Response.json({ error: 'UNKNOWN_TEMPLATE' }, { status: 400 });
        }

        const admin = serviceClient();
        if (!admin) {
          return Response.json(
            { error: 'SERVER_NOT_CONFIGURED' },
            { status: 500 },
          );
        }

        // The content item must exist (attach the version to a real row).
        const { data: itemRow, error: itemErr } = await admin
          .from('content_items')
          .select('id')
          .eq('id', contentId)
          .maybeSingle();
        if (itemErr || itemRow === null) {
          return Response.json({ error: 'CONTENT_NOT_FOUND' }, { status: 404 });
        }

        const vars = (variables ?? {}) as TemplateVariables;
        const prompt = template.build(vars);

        // ---- Provider call -------------------------------------------------
        stage = 'openai_request';
        let providerResponse: Response;
        try {
          providerResponse = await fetch(OPENAI_RESPONSES_URL, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model,
              input: [
                { role: 'system', content: prompt.system },
                { role: 'user', content: prompt.user },
              ],
              max_output_tokens: maxOutputTokens,
            }),
          });
        } catch (fetchError) {
          console.error(
            '[content-generate] openai_fetch_threw',
            JSON.stringify({
              stage,
              name: (fetchError as Error)?.name ?? 'UnknownError',
            }),
          );
          await logUsage(model, 'error', 'OPENAI_FETCH_FAILED', {});
          return Response.json({ error: 'REQUEST_FAILED' }, { status: 502 });
        }

        if (!providerResponse.ok) {
          console.error(
            '[content-generate] openai_error_status',
            JSON.stringify({ status: providerResponse.status }),
          );
          await logUsage(model, 'error', `OPENAI_${providerResponse.status}`, {});
          return Response.json({ error: 'REQUEST_FAILED' }, { status: 502 });
        }

        stage = 'response_parse';
        let payload: unknown;
        try {
          payload = await providerResponse.json();
        } catch {
          await logUsage(model, 'error', 'PARSE_FAILED', {});
          return Response.json({ error: 'REQUEST_FAILED' }, { status: 502 });
        }

        const text = extractText(payload);
        if (text.length === 0) {
          console.error('[content-generate] empty_response');
          await logUsage(model, 'error', 'EMPTY_RESPONSE', {});
          return Response.json({ error: 'EMPTY_RESPONSE' }, { status: 502 });
        }

        const draft = parseDraft(text);
        const usage =
          (payload as { usage?: Record<string, unknown> } | null)?.usage ?? {};

        // ---- Persist immutable version (provenance) ------------------------
        stage = 'persist_version';
        const { data: maxRow } = await admin
          .from('content_versions')
          .select('version')
          .eq('content_id', contentId)
          .order('version', { ascending: false })
          .limit(1)
          .maybeSingle();
        const nextVersion =
          (maxRow && typeof maxRow.version === 'number' ? maxRow.version : 0) + 1;

        const inputRef = {
          template_id: templateId,
          prompt_version: template.promptVersion,
          workload,
          variables: vars,
        };
        const tokenUsage = {
          input_tokens: toNullableInt(usage.input_tokens),
          output_tokens: toNullableInt(usage.output_tokens),
          total_tokens: toNullableInt(usage.total_tokens),
        };

        const { data: versionRow, error: versionErr } = await admin
          .from('content_versions')
          .insert({
            content_id: contentId,
            version: nextVersion,
            title: draft.title,
            body: draft.body,
            summary: draft.summary,
            source: 'ai',
            provider: 'openai',
            model,
            prompt_version: template.promptVersion,
            input_ref: inputRef,
            token_usage: tokenUsage,
            created_by: userId,
          })
          .select('id, version, created_at')
          .single();

        if (versionErr || versionRow === null) {
          console.error('[content-generate] version_insert_failed');
          await logUsage(model, 'error', 'VERSION_PERSIST_FAILED', usage);
          return Response.json({ error: 'PERSIST_FAILED' }, { status: 500 });
        }

        await logUsage(model, 'success', null, usage);

        return Response.json({
          version: {
            id: versionRow.id,
            version: versionRow.version,
            createdAt: versionRow.created_at,
          },
          draft: {
            title: draft.title,
            summary: draft.summary,
            body: draft.body,
            tags: draft.tags,
          },
          provenance: {
            provider: 'openai',
            model,
            workload,
            promptVersion: template.promptVersion,
            tokenUsage,
          },
        });
      } catch (error) {
        console.error(
          '[content-generate] unhandled_exception',
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
