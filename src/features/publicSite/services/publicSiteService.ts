import { getSupabaseClient } from '@/services/supabase';

import type {
  PublicContentDetail,
  PublicContentListItem,
  PublicContentRelated,
  PublicFamousDetail,
  PublicFamousListItem,
  PublicListParams,
} from '../types';

// Public read boundary. Calls curated SECURITY DEFINER RPCs (published-only). The
// client uses the publishable/anon key — no login required to read. Until
// docs/PUBLIC_SETUP.sql is applied the RPCs do not exist and calls reject
// (fail-closed → the pages show an error/empty state, never fake content).

type Row = Record<string, unknown>;

function str(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null;
}

function toStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

function toRelated(v: unknown): PublicContentRelated[] {
  if (!Array.isArray(v)) return [];
  return v.map((r) => {
    const row = (r ?? {}) as Row;
    return {
      slug: String(row.slug ?? ''),
      title: String(row.title ?? ''),
      summary: str(row.summary),
      category: str(row.category),
    };
  });
}

async function listContent(
  params: PublicListParams,
): Promise<PublicContentListItem[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('public_list_content', {
    p_category: params.category ?? null,
    p_limit: params.limit,
    p_offset: params.offset,
  });
  if (error) throw error;
  return ((data as Row[] | null) ?? []).map((row) => ({
    slug: String(row.slug ?? ''),
    title: String(row.title ?? ''),
    summary: str(row.summary),
    channel: str(row.channel) ?? 'generic',
    category: str(row.category),
    tags: toStringArray(row.tags),
    heroImageUrl: str(row.hero_image_url),
    publishedAt: str(row.published_at),
    famousSlug: str(row.famous_slug),
    famousName: str(row.famous_name),
  }));
}

async function getContent(slug: string): Promise<PublicContentDetail | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('public_get_content', {
    p_slug: slug,
  });
  if (error) throw error;
  if (data === null || typeof data !== 'object') return null;
  const row = data as Row;
  const famousRaw = row.famous as Row | null;
  return {
    slug: String(row.slug ?? ''),
    title: String(row.title ?? ''),
    summary: str(row.summary),
    body: str(row.body),
    channel: str(row.channel) ?? 'generic',
    category: str(row.category),
    tags: toStringArray(row.tags),
    heroImageUrl: str(row.hero_image_url),
    publishedAt: str(row.published_at),
    updatedAt: str(row.updated_at),
    seoTitle: str(row.seo_title),
    seoDescription: str(row.seo_description),
    famous: famousRaw
      ? {
          slug: String(famousRaw.slug ?? ''),
          name: String(famousRaw.name ?? ''),
          occupation: str(famousRaw.occupation),
        }
      : null,
    related: toRelated(row.related),
  };
}

async function listFamous(
  params: PublicListParams,
): Promise<PublicFamousListItem[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('public_list_famous', {
    p_limit: params.limit,
    p_offset: params.offset,
  });
  if (error) throw error;
  return ((data as Row[] | null) ?? []).map((row) => ({
    slug: String(row.slug ?? ''),
    name: String(row.name ?? ''),
    category: str(row.category),
    occupation: str(row.occupation),
    shortDescription: str(row.short_description),
    publishedAt: str(row.published_at),
  }));
}

async function getFamous(slug: string): Promise<PublicFamousDetail | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('public_get_famous', {
    p_slug: slug,
  });
  if (error) throw error;
  if (data === null || typeof data !== 'object') return null;
  const row = data as Row;
  return {
    slug: String(row.slug ?? ''),
    name: String(row.name ?? ''),
    category: str(row.category),
    occupation: str(row.occupation),
    shortDescription: str(row.short_description),
    bio: str(row.bio),
    birthSource: str(row.birth_source),
    seoTitle: str(row.seo_title),
    seoDescription: str(row.seo_description),
    canonicalUrl: str(row.canonical_url),
    indexPolicy: str(row.index_policy),
    publishedAt: str(row.published_at),
    related: toRelated(row.related),
  };
}

export const publicSiteService = {
  listContent,
  getContent,
  listFamous,
  getFamous,
};
