import type { BirthInfoDraft } from '@/features/consultation';

// Famous domain = SEO/content SOURCE (not a user-owned subject). Admin-managed.
// ENGINE FIREWALL: this module NEVER calculates Four Pillars / lunar / solar terms
// / Daewoon / five elements. Calculated data is only ever stored/referenced as an
// immutable snapshot produced by the ENGINE through an explicit seam.

export type FamousStatus = 'draft' | 'published' | 'archived';

// Provenance of the birth data (how reliable / where it came from).
export type FamousBirthSource =
  | 'confirmed'
  | 'reported'
  | 'estimated'
  | 'unknown';

export type FamousIndexPolicy = 'index' | 'noindex';

// Calculation connection state — explicit, never fabricated.
export type FamousCalculationState =
  | 'not_calculated'
  | 'current'
  | 'stale'
  | 'failed'
  | 'unavailable';

// birth_info reuses the canonical app BirthInfoDraft shape (exact/approximate/
// unknown time, calendar type, lunar month type, place). No separate astrology
// input rules for famous people.
export type FamousBirthInfo = BirthInfoDraft;

export type FamousProfile = {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  occupation: string | null;
  shortDescription: string | null;
  bio: string | null;
  birthInfo: FamousBirthInfo | null;
  birthSource: FamousBirthSource;
  birthSourceNote: string | null;
  status: FamousStatus;
  isPublic: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  indexPolicy: FamousIndexPolicy;
  calculationState: FamousCalculationState;
  currentSnapshotId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  publishedAt: string | null;
};

export type FamousListItem = {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  status: FamousStatus;
  isPublic: boolean;
  calculationState: FamousCalculationState;
  updatedAt: string | null;
};

// Fields the admin editor writes. birthInfo/SEO are optional (draft-friendly).
export type FamousInput = {
  name: string;
  slug: string;
  category: string | null;
  occupation: string | null;
  shortDescription: string | null;
  bio: string | null;
  birthInfo: FamousBirthInfo | null;
  birthSource: FamousBirthSource;
  birthSourceNote: string | null;
  status: FamousStatus;
  isPublic: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  indexPolicy: FamousIndexPolicy;
};

export type FamousListParams = {
  search?: string;
  status?: FamousStatus | null;
  isPublic?: boolean | null;
  calculationState?: FamousCalculationState | null;
  limit: number;
  offset: number;
};

// ---- P0-6: AI profile/SEO suggestions ---------------------------------------

// Whether a suggested text is grounded in operator-provided facts, is
// interpretation/general, or unknown (no info). Prevents fabricated biography.
export type FamousSuggestionBasis = 'fact' | 'interpretation' | 'unknown';

export type FamousSuggestionField = {
  text: string;
  basis: FamousSuggestionBasis;
};

export type FamousSuggestion = {
  oneLiner: FamousSuggestionField | null;
  introduction: FamousSuggestionField | null;
  seoTitle: string | null;
  seoDescription: string | null;
  recommendedSlug: string | null;
  indexPolicy: FamousIndexPolicy | null;
  topics: string[];
  disclaimer: string | null;
};

export type FamousSuggestionInput = {
  famousId?: string | null;
  name: string;
  occupation?: string | null;
  category?: string | null;
  knownFacts?: string | null;
  birthSummary?: string | null;
};

export type FamousSuggestionResult = {
  suggestion: FamousSuggestion;
  provenance: {
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
};

// Immutable calculation snapshot (ENGINE output stored opaquely; APP never
// computes it). Surfaced read-only for provenance.
export type FamousSnapshot = {
  id: string;
  famousId: string;
  birthFingerprint: string | null;
  engineVersion: string | null;
  ruleSetVersion: string | null;
  createdAt: string | null;
};
