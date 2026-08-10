import { getSupabaseClient } from '@/services/supabase';

import type {
  ContentItem,
  VideoGenerationRequest,
  VideoGenerationStart,
  VideoStatusResult,
} from '../types';

// VIDEO_STANDARD client boundary. The client NEVER calls a provider directly — it
// invokes the admin-gated video-generate (starts the async job) + video-status
// (polls + finalizes) Edge Functions. The server holds the Google key and resolves
// provider/model/resolution/duration/audio. No fake progress: while the job runs,
// status is 'processing' only.

export function suggestVideoSubject(item: ContentItem): string {
  const parts = [item.title?.trim(), item.summary?.trim()].filter(
    (p): p is string => Boolean(p && p.length > 0),
  );
  const base = parts.join(' — ');
  return base.length > 0
    ? `${base} (한국 운세/명리 콘텐츠용 짧은 개념 영상)`
    : '한국 운세/명리 콘텐츠용 세련된 짧은 개념 영상';
}

async function start(
  request: VideoGenerationRequest,
): Promise<VideoGenerationStart> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke('video-generate', {
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
    throw new Error('VIDEO_GENERATION_FAILED');
  }
  const result = data as VideoGenerationStart | null;
  if (!result?.asset?.id) {
    throw new Error('VIDEO_GENERATION_FAILED');
  }
  return result;
}

async function pollStatus(assetId: string): Promise<VideoStatusResult> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke('video-status', {
    body: { assetId },
  });
  if (error) {
    // Treat a transient status-call failure as still-processing (caller bounds it).
    return { status: 'processing', externalUrl: null };
  }
  const result = data as VideoStatusResult | null;
  return {
    status: result?.status ?? 'processing',
    externalUrl: result?.externalUrl ?? null,
  };
}

export const videoGenerationService = { start, pollStatus, suggestVideoSubject };
