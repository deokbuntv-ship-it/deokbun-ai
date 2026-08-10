// DeokbunAI — video workload → provider/model resolution (server-side ONLY).
//
// Logical WORKLOAD (VIDEO_STANDARD / VIDEO_PREMIUM) decouples "what kind of video"
// from provider/model. Owner decision (approved): VIDEO_STANDARD = Google Veo,
// short-form, 720p, native audio OFF. Verified against current Google docs
// (Gemini API Veo, predictLongRunning): models veo-3.1-fast-generate-001 (cost-
// efficient) / veo-3.1-generate-001; 720p default; 8s duration (Veo 3.1); aspect
// 16:9 or 9:16. Provider/model are env-overridable — never hardcoded in UI/domain.
//
// NOTE: owner mentioned "Veo 3.1 Lite"; the official API exposes no "Lite" id — the
// cost-efficient production variant is veo-3.1-fast-generate-001, used as default.
//
// Env (optional): VIDEO_STANDARD_PROVIDER, VIDEO_STANDARD_MODEL,
//   VIDEO_STANDARD_RESOLUTION, VIDEO_STANDARD_DURATION, VIDEO_STANDARD_AUDIO.

export type VideoWorkload = 'VIDEO_STANDARD' | 'VIDEO_PREMIUM';
export type VideoAspectRatio = '9:16' | '16:9';

export type ResolvedVideoPolicy = {
  workload: VideoWorkload;
  provider: string;
  model: string;
  resolution: string;
  durationSeconds: number;
  generateAudio: boolean;
  configured: boolean;
};

function intEnv(name: string, fallback: number): number {
  const n = Number(Deno.env.get(name)?.trim());
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export function resolveVideoPolicy(input: unknown): ResolvedVideoPolicy {
  const workload: VideoWorkload =
    input === 'VIDEO_PREMIUM' ? 'VIDEO_PREMIUM' : 'VIDEO_STANDARD';

  if (workload === 'VIDEO_PREMIUM') {
    const provider = Deno.env.get('VIDEO_PREMIUM_PROVIDER')?.trim() ?? '';
    return {
      workload,
      provider,
      model: Deno.env.get('VIDEO_PREMIUM_MODEL')?.trim() ?? '',
      resolution: '720p',
      durationSeconds: 8,
      generateAudio: false,
      configured: provider.length > 0,
    };
  }

  const provider = Deno.env.get('VIDEO_STANDARD_PROVIDER')?.trim() || 'google-veo';
  const model =
    Deno.env.get('VIDEO_STANDARD_MODEL')?.trim() || 'veo-3.1-fast-generate-001';
  const resolution = Deno.env.get('VIDEO_STANDARD_RESOLUTION')?.trim() || '720p';
  const durationSeconds = intEnv('VIDEO_STANDARD_DURATION', 8);
  const generateAudio =
    (Deno.env.get('VIDEO_STANDARD_AUDIO')?.trim() || 'off') === 'on';
  return {
    workload,
    provider,
    model,
    resolution,
    durationSeconds,
    generateAudio,
    configured: provider === 'google-veo',
  };
}

export function normalizeAspect(input: unknown): VideoAspectRatio {
  return input === '16:9' ? '16:9' : '9:16';
}
