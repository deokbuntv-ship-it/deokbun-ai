// Public (unauthenticated) content + famous surface. Reads ONLY published data
// via curated SECURITY DEFINER RPCs (see docs/PUBLIC_SETUP.sql). No draft, no
// admin metadata, no provenance, no raw birth info ever reaches this layer.

export type PublicContentRelated = {
  slug: string;
  title: string;
  summary: string | null;
  category: string | null;
};

export type PublicContentListItem = {
  slug: string;
  title: string;
  summary: string | null;
  channel: string;
  category: string | null;
  tags: string[];
  heroImageUrl: string | null;
  heroAlt: string | null;
  publishedAt: string | null;
  famousSlug: string | null;
  famousName: string | null;
};

export type PublicContentDetail = {
  slug: string;
  title: string;
  summary: string | null;
  body: string | null;
  channel: string;
  category: string | null;
  tags: string[];
  heroImageUrl: string | null;
  heroAlt: string | null;
  videoUrl: string | null;
  publishedAt: string | null;
  updatedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  famous: { slug: string; name: string; occupation: string | null } | null;
  related: PublicContentRelated[];
};

export type PublicFamousListItem = {
  slug: string;
  name: string;
  category: string | null;
  occupation: string | null;
  shortDescription: string | null;
  publishedAt: string | null;
};

export type PublicFamousDetail = {
  slug: string;
  name: string;
  category: string | null;
  occupation: string | null;
  shortDescription: string | null;
  bio: string | null;
  birthSource: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  indexPolicy: string | null;
  publishedAt: string | null;
  related: PublicContentRelated[];
};

export type PublicListParams = {
  category?: string | null;
  search?: string | null;
  limit: number;
  offset: number;
};
