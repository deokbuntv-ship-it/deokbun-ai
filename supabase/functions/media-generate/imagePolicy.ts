// DeokbunAI — image workload → provider/model/quality resolution (server-side).
//
// Logical WORKLOAD (IMAGE_STANDARD / IMAGE_PREMIUM) decouples "what kind of image"
// from "which provider/model/quality". The domain/UI only pass a workload; the
// server resolves the concrete provider from config. Owner decision (approved):
//   IMAGE_STANDARD → provider=openai, quality=low.
//   IMAGE_PREMIUM  → NOT_CONFIGURED (future seam; no provider chosen).
//
// Env (all optional; minimal, no proliferation):
//   IMAGE_STANDARD_PROVIDER (default 'openai')
//   IMAGE_STANDARD_MODEL    (default 'gpt-image-1')
//   IMAGE_STANDARD_QUALITY  (default 'low')

export type ImageWorkload = 'IMAGE_STANDARD' | 'IMAGE_PREMIUM';
export type ImageAspectRatio = '1:1' | '16:9' | '4:5';

export type ResolvedImagePolicy = {
  workload: ImageWorkload;
  provider: string;
  model: string;
  quality: string;
  configured: boolean;
};

export function resolveImagePolicy(input: unknown): ResolvedImagePolicy {
  const workload: ImageWorkload =
    input === 'IMAGE_PREMIUM' ? 'IMAGE_PREMIUM' : 'IMAGE_STANDARD';

  if (workload === 'IMAGE_PREMIUM') {
    // No premium provider chosen yet — honest NOT_CONFIGURED.
    const provider = Deno.env.get('IMAGE_PREMIUM_PROVIDER')?.trim() ?? '';
    return {
      workload,
      provider,
      model: Deno.env.get('IMAGE_PREMIUM_MODEL')?.trim() ?? '',
      quality: Deno.env.get('IMAGE_PREMIUM_QUALITY')?.trim() ?? '',
      configured: provider.length > 0,
    };
  }

  const provider = Deno.env.get('IMAGE_STANDARD_PROVIDER')?.trim() || 'openai';
  const model = Deno.env.get('IMAGE_STANDARD_MODEL')?.trim() || 'gpt-image-1';
  const quality = Deno.env.get('IMAGE_STANDARD_QUALITY')?.trim() || 'low';
  return { workload, provider, model, quality, configured: provider === 'openai' };
}

// Map a logical aspect ratio to OpenAI gpt-image-1 sizes. UI/domain never see
// provider-specific size syntax.
export function sizeForAspect(aspect: ImageAspectRatio): string {
  switch (aspect) {
    case '16:9':
      return '1536x1024';
    case '4:5':
      return '1024x1536';
    default:
      return '1024x1024';
  }
}

export function dimsForAspect(aspect: ImageAspectRatio): {
  width: number;
  height: number;
} {
  switch (aspect) {
    case '16:9':
      return { width: 1536, height: 1024 };
    case '4:5':
      return { width: 1024, height: 1536 };
    default:
      return { width: 1024, height: 1024 };
  }
}
