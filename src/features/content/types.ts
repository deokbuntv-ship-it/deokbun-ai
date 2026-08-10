// Content Studio = ONE canonical content model repurposed across channels
// (Naver Blog / Instagram / YouTube / Video / generic). Channel-specific
// generation and publishing build on this in later sprints. Admin-managed.

export type ContentStatus =
  | 'draft'
  | 'generating'
  | 'ready'
  | 'publish_pending'
  | 'published'
  | 'failed'
  | 'cancelled';

export type ContentChannel =
  | 'generic'
  | 'naver_blog'
  | 'instagram'
  | 'youtube'
  | 'video';

export type ContentSourceType = 'operator' | 'famous' | 'topic';

export type ContentListItem = {
  id: string;
  title: string;
  channel: ContentChannel;
  status: ContentStatus;
  sourceType: ContentSourceType;
  famousId: string | null;
  updatedAt: string | null;
};

export type ContentItem = {
  id: string;
  title: string;
  channel: ContentChannel;
  sourceType: ContentSourceType;
  famousId: string | null;
  status: ContentStatus;
  slug: string | null;
  category: string | null;
  heroImageUrl: string | null;
  body: string | null;
  summary: string | null;
  tags: string[];
  publishedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

// Editor-writable fields. Status transitions available to the operator are a
// subset (draft/ready/cancelled); generating/publish_pending/published/failed
// are set by system flows (CONTENT-02 generation, CONTENT-07 publishing).
export type ContentInput = {
  title: string;
  channel: ContentChannel;
  sourceType: ContentSourceType;
  famousId: string | null;
  status: ContentStatus;
  slug: string | null;
  category: string | null;
  heroImageUrl: string | null;
  body: string | null;
  summary: string | null;
  tags: string[];
};

export type ContentListParams = {
  search?: string;
  channel?: ContentChannel | null;
  limit: number;
  offset: number;
};

// ---- CONTENT-02: AI text generation -----------------------------------------

// Client-facing template metadata (labels only — the actual prompt bodies live
// server-side in supabase/functions/content-generate/templates.ts and are never
// shipped to the client). `id` must match a server template id exactly.
export type ContentTemplateMeta = {
  id: string;
  label: string;
  description: string;
};

// Operator-supplied generation inputs. These are descriptive context only — the
// model never computes myeongri results (see the server NO_CALC_RULE guardrail).
export type ContentGenerationVariables = {
  topic?: string;
  audience?: string;
  tone?: string;
  keyPoints?: string;
  subjectName?: string;
  subjectContext?: string;
  channel?: ContentChannel;
};

// Logical AI workloads. The concrete provider/model is resolved SERVER-SIDE
// (supabase/functions/content-generate/workloads.ts) — no model strings here.
// CHAT is handled by the separate chat function.
export type AiWorkload = 'CONTENT_STANDARD' | 'PREMIUM_CONTENT';

export type ContentGenerationRequest = {
  contentId: string;
  templateId: string;
  variables: ContentGenerationVariables;
  workload?: AiWorkload;
};

export type ContentGenerationDraft = {
  title: string | null;
  summary: string | null;
  body: string;
  tags: string[];
};

export type ContentGenerationProvenance = {
  provider: string;
  model: string;
  workload?: string;
  promptVersion: string;
  tokenUsage: {
    input_tokens: number | null;
    output_tokens: number | null;
    total_tokens: number | null;
  };
};

export type ContentGenerationResult = {
  version: { id: string; version: number; createdAt: string | null };
  draft: ContentGenerationDraft;
  provenance: ContentGenerationProvenance;
};

// Immutable generation/edit history row (public.content_versions).
export type ContentVersion = {
  id: string;
  version: number;
  title: string | null;
  body: string | null;
  summary: string | null;
  source: 'manual' | 'ai';
  provider: string | null;
  model: string | null;
  promptVersion: string | null;
  totalTokens: number | null;
  createdAt: string | null;
};

// ---- CONTENT-04/07: publication tracking (public.content_publications) --------

export type PublicationChannel =
  | 'web'
  | 'naver_blog'
  | 'instagram'
  | 'youtube'
  | 'video';

export type PublicationStatus =
  | 'draft'
  | 'scheduled'
  | 'queued'
  | 'processing'
  | 'published'
  | 'failed'
  | 'cancelled';

export type ContentPublication = {
  id: string;
  contentId: string;
  channel: PublicationChannel;
  status: PublicationStatus;
  scheduledAt: string | null;
  publishedAt: string | null;
  externalId: string | null;
  externalUrl: string | null;
  attemptCount: number;
  lastError: string | null;
  provider: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

// Operator-recorded manual publication (e.g. Naver Blog, published by hand).
export type ManualPublicationInput = {
  contentId: string;
  channel: PublicationChannel;
  externalUrl: string | null;
  provider: string;
};

// ---- CONTENT-05: channel connection status ----------------------------------
// STATUS ONLY — never a token (tokens are server-side only).
export type ProviderConnectionStatus =
  | 'not_connected'
  | 'connected'
  | 'expired'
  | 'error';

export type ProviderConnection = {
  channel: PublicationChannel;
  status: ProviderConnectionStatus;
  externalAccountName: string | null;
  connectedAt: string | null;
};

// ---- CONTENT-07: scheduled publication --------------------------------------
export type SchedulePublicationInput = {
  contentId: string;
  channel: PublicationChannel;
  scheduledAt: string; // ISO timestamp
  provider: string;
};

// ---- CONTENT-03/06: media assets (provider-neutral) --------------------------

export type AssetKind = 'image' | 'video';

export type AssetStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

// Whether AI generation for a given kind is usable. No provider selected yet →
// PROVIDER_NOT_CONFIGURED (owner decision). Manual attach is always available.
export type AssetGenerationStatus = 'AVAILABLE' | 'PROVIDER_NOT_CONFIGURED';

export type ContentAsset = {
  id: string;
  contentId: string | null;
  kind: AssetKind;
  status: AssetStatus;
  provider: string | null;
  prompt: string | null;
  model: string | null;
  aspectRatio: string | null;
  durationSeconds: number | null;
  width: number | null;
  height: number | null;
  storagePath: string | null;
  externalUrl: string | null;
  errorCode: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ManualAssetInput = {
  contentId: string;
  kind: AssetKind;
  externalUrl: string;
};
