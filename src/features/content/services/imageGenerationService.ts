import { getSupabaseClient } from '@/services/supabase';

import type {
  ContentItem,
  ImageGenerationRequest,
  ImageGenerationResult,
} from '../types';

// IMAGE_STANDARD client boundary. The client NEVER calls a provider directly — it
// invokes the admin-gated media-generate Edge Function (server holds OPENAI_API_KEY,
// resolves provider/model/quality, persists to Storage, records provenance).

// Auto-suggest a short image SUBJECT from content context. The server wraps this in
// the versioned DeokbunAI brand style + IP guardrails; this is only the topic seed.
export function suggestImageSubject(item: ContentItem): string {
  const parts = [item.title?.trim(), item.summary?.trim()].filter(
    (p): p is string => Boolean(p && p.length > 0),
  );
  const base = parts.join(' — ');
  return base.length > 0
    ? `${base} (한국 운세/명리 콘텐츠용 개념 이미지)`
    : '한국 운세/명리 콘텐츠용 세련된 개념 이미지';
}

async function generate(
  request: ImageGenerationRequest,
): Promise<ImageGenerationResult> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke('media-generate', {
    body: {
      contentId: request.contentId ?? null,
      famousId: request.famousId ?? null,
      workload: request.workload,
      aspectRatio: request.aspectRatio,
      subject: request.subject ?? null,
      category: request.category ?? null,
      targetUse: request.targetUse ?? null,
    },
  });

  if (error) {
    throw new Error('IMAGE_GENERATION_FAILED');
  }
  const result = data as ImageGenerationResult | null;
  const url = result?.asset?.externalUrl;
  if (!url || result?.asset?.status !== 'completed') {
    throw new Error('IMAGE_GENERATION_INCOMPLETE');
  }
  return result;
}

export const imageGenerationService = { generate };
