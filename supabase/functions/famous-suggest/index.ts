// DeokbunAI — Famous AI Suggestion Edge Function (P0-6)
//
// Admin-gated PREMIUM_CONTENT generation that PROPOSES Famous profile/SEO fields
// (one-liner, intro, SEO title/description, slug, index policy, content topics).
// It NEVER auto-applies or publishes — the operator reviews and applies fields.
//
// Anti-fabrication: the model must tag each biographical text with a basis of
// fact | interpretation | unknown, and must NOT invent occupation, biography,
// achievements, relationships, birth time, or birthplace. Birth data may inform
// interpretation context but must not become asserted biography. When factual
// background is absent, it must produce a restrained profile.
//
// Security mirrors content-generate: verify_jwt + admin_users membership,
// server-side OpenAI key, no client secret. Runtime: Deno (excluded from app tsc).

import { withSupabase } from 'npm:@supabase/server@1.4.1';
import { createClient } from 'npm:@supabase/supabase-js';
import { globalSpendGuardFailure, reserveGlobalPaidGeneration } from '../_shared/globalSpendGuard.ts';

const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const PROMPT_VERSION = 'famous_suggest_v1';

function readApiKey(): string {
  return Deno.env.get('OPENAI_API_KEY')?.trim() ?? '';
}

// PREMIUM_CONTENT model (mirrors content-generate/workloads.ts; falls back to the
// standard content model, never an invented name).
function premiumModel(): string {
  return (
    Deno.env.get('PREMIUM_CONTENT_LLM_MODEL')?.trim() ||
    Deno.env.get('CONTENT_LLM_MODEL')?.trim() ||
    Deno.env.get('LLM_MODEL')?.trim() ||
    'gpt-5-mini'
  );
}
function premiumMaxTokens(): number {
  const raw = Deno.env.get('PREMIUM_CONTENT_MAX_OUTPUT_TOKENS')?.trim();
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 4000;
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

function parseJsonObject(text: string): Record<string, unknown> | null {
  const tryParse = (s: string): Record<string, unknown> | null => {
    try {
      const obj = JSON.parse(s);
      return obj && typeof obj === 'object' ? (obj as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  };
  const direct = tryParse(text);
  if (direct) return direct;
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end > start) return tryParse(text.slice(start, end + 1));
  return null;
}

const SYSTEM_PROMPT = `당신은 덕분AI의 인물 프로필/SEO 어시스턴트입니다. 운영자가 SEO 전문가가 아니어도 되도록 제안을 생성합니다.
규칙:
- 직업/전기/업적/관계/출생시각/출생지 등 사실을 지어내지 마세요.
- 제공된 정보에 근거가 없으면 절제된 프로필을 쓰고, 각 텍스트에 근거(basis)를 표시하세요: "fact"(제공된 사실 기반) | "interpretation"(해석/일반론) | "unknown"(정보 없음).
- 출생 정보는 해석 컨텍스트로만 활용하고, 확정 전기 사실처럼 단정하지 마세요.
- 사주/자미두수 등 구체적 계산은 하지 마세요.
반드시 아래 JSON 하나만 출력(코드블록/설명 금지):
{
  "oneLiner": {"text": "한 줄 소개", "basis": "fact|interpretation|unknown"},
  "introduction": {"text": "3~5문장 소개", "basis": "fact|interpretation|unknown"},
  "seoTitle": "60자 내외 SEO 제목",
  "seoDescription": "120~150자 SEO 설명",
  "recommendedSlug": "english-lowercase-hyphen",
  "indexPolicy": "index" 또는 "noindex",
  "topics": ["콘텐츠 주제 아이디어", "..."],
  "disclaimer": "무엇이 사실/해석/미상인지 한국어 요약"
}`;

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
            request_type: 'famous_suggest',
            input_tokens: toNullableInt(usage.input_tokens),
            output_tokens: toNullableInt(usage.output_tokens),
            total_tokens: toNullableInt(usage.total_tokens),
            latency_ms: Date.now() - startedAt,
            status,
            error_code: errorCode,
          });
        } catch {
          /* usage logging never affects response */
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

        const apiKey = readApiKey();
        if (apiKey.length === 0) {
          console.error('[famous-suggest] server_not_configured');
          return Response.json({ error: 'SERVER_NOT_CONFIGURED' }, { status: 500 });
        }

        let body: unknown;
        try {
          body = await req.json();
        } catch {
          return Response.json({ error: 'INVALID_INPUT' }, { status: 400 });
        }

        const name = (body as { name?: unknown } | null)?.name;
        if (typeof name !== 'string' || name.trim().length === 0) {
          return Response.json({ error: 'INVALID_INPUT' }, { status: 400 });
        }
        const famousId = (body as { famousId?: unknown } | null)?.famousId;
        const occupation = (body as { occupation?: unknown } | null)?.occupation;
        const category = (body as { category?: unknown } | null)?.category;
        const knownFacts = (body as { knownFacts?: unknown } | null)?.knownFacts;
        const birthSummary = (body as { birthSummary?: unknown } | null)?.birthSummary;

        const userPrompt = [
          `인물명: ${name}`,
          typeof occupation === 'string' && occupation ? `직업(운영자 제공): ${occupation}` : '직업: (미제공)',
          typeof category === 'string' && category ? `분류: ${category}` : '',
          typeof knownFacts === 'string' && knownFacts
            ? `운영자가 제공한 확인된 사실:\n${knownFacts}`
            : '확인된 사실: (제공되지 않음 — 절제된 프로필로 작성)',
          typeof birthSummary === 'string' && birthSummary
            ? `출생 정보(해석 컨텍스트용, 전기 사실 아님): ${birthSummary}`
            : '',
        ]
          .filter((l) => l.length > 0)
          .join('\n');

        const model = premiumModel();
        const maxOutputTokens = premiumMaxTokens();

        const spend = await reserveGlobalPaidGeneration(serviceClient(), userId, 'famous_suggestion');
        if (spend.status !== 'allowed') {
          const failure = globalSpendGuardFailure(spend);
          return Response.json(failure.body, { status: failure.status, headers: failure.headers });
        }

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
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userPrompt },
              ],
              max_output_tokens: maxOutputTokens,
            }),
          });
        } catch {
          await logUsage(model, 'error', 'OPENAI_FETCH_FAILED', {});
          return Response.json({ error: 'REQUEST_FAILED' }, { status: 502 });
        }

        if (!providerResponse.ok) {
          console.error(
            '[famous-suggest] openai_error_status',
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
        const suggestion = text.length > 0 ? parseJsonObject(text) : null;
        if (suggestion === null) {
          await logUsage(model, 'error', 'EMPTY_RESPONSE', {});
          return Response.json({ error: 'EMPTY_RESPONSE' }, { status: 502 });
        }

        const usage =
          (payload as { usage?: Record<string, unknown> } | null)?.usage ?? {};

        // Best-effort provenance (table optional; feature works without it).
        stage = 'persist_suggestion';
        try {
          const admin = serviceClient();
          if (admin) {
            await admin.from('famous_ai_suggestions').insert({
              famous_id: typeof famousId === 'string' ? famousId : null,
              suggestion,
              provider: 'openai',
              model,
              workload: 'PREMIUM_CONTENT',
              prompt_version: PROMPT_VERSION,
              created_by: userId,
            });
          }
        } catch {
          // provenance table may not exist yet; do not fail the suggestion.
          console.error('[famous-suggest] suggestion_persist_skipped');
        }

        await logUsage(model, 'success', null, usage);

        return Response.json({
          suggestion,
          provenance: {
            provider: 'openai',
            model,
            workload: 'PREMIUM_CONTENT',
            promptVersion: PROMPT_VERSION,
            tokenUsage: {
              input_tokens: toNullableInt(usage.input_tokens),
              output_tokens: toNullableInt(usage.output_tokens),
              total_tokens: toNullableInt(usage.total_tokens),
            },
          },
        });
      } catch (error) {
        console.error(
          '[famous-suggest] unhandled_exception',
          JSON.stringify({ stage, name: (error as Error)?.name ?? 'UnknownError' }),
        );
        throw error;
      }
    },
  ),
};
