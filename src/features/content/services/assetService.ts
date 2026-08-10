import { getSupabaseClient } from '@/services/supabase';

import type { AssetKind, ContentAsset, ManualAssetInput } from '../types';

// Media assets via admin-gated RLS on public.content_assets (see
// docs/admin/CONTENT_ASSETS_SETUP.sql). Normal client, no service_role.
//
// Manual attach (operator-hosted URL) works today. AI-generated assets require a
// provider (OWNER DECISION) + a generation edge — not implemented (no fake media).

const TABLE = 'content_assets';
const COLUMNS =
  'id, content_id, kind, status, provider, prompt, model, aspect_ratio, duration_seconds, width, height, storage_path, external_url, error_code, created_at, updated_at';

type Row = Record<string, unknown>;

function str(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null;
}
function num(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

function toAsset(row: Row): ContentAsset {
  return {
    id: String(row.id ?? ''),
    contentId: str(row.content_id),
    kind: (str(row.kind) as AssetKind) ?? 'image',
    status: (str(row.status) as ContentAsset['status']) ?? 'pending',
    provider: str(row.provider),
    prompt: str(row.prompt),
    model: str(row.model),
    aspectRatio: str(row.aspect_ratio),
    durationSeconds: num(row.duration_seconds),
    width: num(row.width),
    height: num(row.height),
    storagePath: str(row.storage_path),
    externalUrl: str(row.external_url),
    errorCode: str(row.error_code),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}

async function listByContent(contentId: string): Promise<ContentAsset[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select(COLUMNS)
    .eq('content_id', contentId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return ((data as Row[] | null) ?? []).map(toAsset);
}

// Attach an already-hosted external asset (no provider/generation). status=completed.
async function attachManual(input: ManualAssetInput): Promise<ContentAsset> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      content_id: input.contentId,
      kind: input.kind,
      status: 'completed',
      provider: 'manual',
      external_url: input.externalUrl,
    })
    .select(COLUMNS)
    .single();
  if (error) throw error;
  return toAsset(data as Row);
}

async function cancelAsset(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from(TABLE)
    .update({ status: 'cancelled' })
    .eq('id', id);
  if (error) throw error;
}

// Set (or clear) a content item's representative image.
async function setContentHero(
  contentId: string,
  url: string | null,
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('content_items')
    .update({ hero_image_url: url })
    .eq('id', contentId);
  if (error) throw error;
}

// Set (or clear) a content item's applied video.
async function setContentVideo(
  contentId: string,
  url: string | null,
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('content_items')
    .update({ video_url: url })
    .eq('id', contentId);
  if (error) throw error;
}

export const assetService = {
  listByContent,
  attachManual,
  cancelAsset,
  setContentHero,
  setContentVideo,
};
