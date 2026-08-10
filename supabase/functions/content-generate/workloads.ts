// DeokbunAI — AI workload → model resolution (server-side ONLY, Deno runtime).
//
// Logical WORKLOADS decouple "what kind of generation" from "which provider/model".
// The client/domain only sends a workload name; the server decides the concrete
// model + output cap from env. This keeps model strings out of the UI/domain and
// lets Famous (PREMIUM_CONTENT) use a stronger model than ordinary content, and
// lets a future provider swap be a server config change only.
//
// Env (all optional; safe fallbacks, no invented model names):
//   CONTENT_LLM_MODEL / LLM_MODEL            → standard content model (default gpt-5-mini)
//   CONTENT_LLM_MAX_OUTPUT_TOKENS            → standard cap (default 2000)
//   PREMIUM_CONTENT_LLM_MODEL                → premium model (falls back to standard)
//   PREMIUM_CONTENT_MAX_OUTPUT_TOKENS        → premium cap (default 4000)
//
// NOTE: chat has its own function (workload CHAT) and is intentionally not changed
// here, so existing chat behavior is preserved.

export type AiWorkload = 'CONTENT_STANDARD' | 'PREMIUM_CONTENT';

export type ResolvedWorkload = {
  workload: AiWorkload;
  model: string;
  maxOutputTokens: number;
};

const DEFAULT_STANDARD_MODEL = 'gpt-5-mini';
const DEFAULT_STANDARD_MAX = 2000;
const DEFAULT_PREMIUM_MAX = 4000;

function intEnv(name: string, fallback: number): number {
  const raw = Deno.env.get(name)?.trim();
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function standardModel(): string {
  return (
    Deno.env.get('CONTENT_LLM_MODEL')?.trim() ||
    Deno.env.get('LLM_MODEL')?.trim() ||
    DEFAULT_STANDARD_MODEL
  );
}

export function resolveWorkload(input: unknown): ResolvedWorkload {
  const workload: AiWorkload =
    input === 'PREMIUM_CONTENT' ? 'PREMIUM_CONTENT' : 'CONTENT_STANDARD';

  if (workload === 'PREMIUM_CONTENT') {
    // Falls back to the standard model when no premium model is configured, so a
    // premium request never fails on a missing/invented model name.
    const model =
      Deno.env.get('PREMIUM_CONTENT_LLM_MODEL')?.trim() || standardModel();
    return {
      workload,
      model,
      maxOutputTokens: intEnv('PREMIUM_CONTENT_MAX_OUTPUT_TOKENS', DEFAULT_PREMIUM_MAX),
    };
  }

  return {
    workload,
    model: standardModel(),
    maxOutputTokens: intEnv('CONTENT_LLM_MAX_OUTPUT_TOKENS', DEFAULT_STANDARD_MAX),
  };
}
