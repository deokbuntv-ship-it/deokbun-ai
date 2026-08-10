import { getSupabaseClient } from '@/services/supabase';

import type {
  FamousIndexPolicy,
  FamousSuggestion,
  FamousSuggestionBasis,
  FamousSuggestionField,
  FamousSuggestionInput,
  FamousSuggestionResult,
} from '../types';

// P0-6 client boundary. Never calls a provider directly — invokes the admin-gated
// famous-suggest Edge Function (PREMIUM_CONTENT workload, server holds the key).
// Suggestions are proposals only; the operator applies/edits/saves manually.

function basis(v: unknown): FamousSuggestionBasis {
  return v === 'fact' || v === 'interpretation' || v === 'unknown'
    ? v
    : 'interpretation';
}

function field(v: unknown): FamousSuggestionField | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  const text = typeof o.text === 'string' ? o.text.trim() : '';
  if (text.length === 0) return null;
  return { text, basis: basis(o.basis) };
}

function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim().length > 0 ? v.trim() : null;
}

function normalize(raw: unknown): FamousSuggestion {
  const o = (raw ?? {}) as Record<string, unknown>;
  const idx = o.indexPolicy;
  return {
    oneLiner: field(o.oneLiner),
    introduction: field(o.introduction),
    seoTitle: str(o.seoTitle),
    seoDescription: str(o.seoDescription),
    recommendedSlug: str(o.recommendedSlug),
    indexPolicy:
      idx === 'index' || idx === 'noindex' ? (idx as FamousIndexPolicy) : null,
    topics: Array.isArray(o.topics)
      ? o.topics.filter((t): t is string => typeof t === 'string')
      : [],
    disclaimer: str(o.disclaimer),
  };
}

async function generate(
  input: FamousSuggestionInput,
): Promise<FamousSuggestionResult> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke('famous-suggest', {
    body: {
      famousId: input.famousId ?? null,
      name: input.name,
      occupation: input.occupation ?? null,
      category: input.category ?? null,
      knownFacts: input.knownFacts ?? null,
      birthSummary: input.birthSummary ?? null,
    },
  });

  if (error) {
    throw new Error('FAMOUS_SUGGEST_FAILED');
  }
  const result = data as { suggestion?: unknown; provenance?: unknown } | null;
  if (!result || result.suggestion === undefined) {
    throw new Error('FAMOUS_SUGGEST_EMPTY');
  }
  return {
    suggestion: normalize(result.suggestion),
    provenance: (result.provenance ?? {}) as FamousSuggestionResult['provenance'],
  };
}

export const famousSuggestionService = { generate };
