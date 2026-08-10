import { getSupabaseClient } from '@/services/supabase';

import { CONTENT_TEMPLATES } from '../templates';
import type {
  ContentGenerationRequest,
  ContentGenerationResult,
  ContentTemplateMeta,
} from '../types';

// CONTENT-02 client boundary. The client NEVER calls an LLM provider directly —
// it invokes the admin-gated `content-generate` Edge Function (server holds the
// OpenAI key, decides the model, enforces admin membership, and writes the
// immutable content_versions provenance row). functions.invoke attaches the
// caller's access token automatically.

function listTemplates(): ContentTemplateMeta[] {
  return CONTENT_TEMPLATES;
}

async function generate(
  request: ContentGenerationRequest,
): Promise<ContentGenerationResult> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.functions.invoke('content-generate', {
    body: {
      contentId: request.contentId,
      templateId: request.templateId,
      variables: request.variables,
    },
  });

  if (error) {
    // Do not surface raw provider/server internals to the caller.
    throw new Error('CONTENT_GENERATION_FAILED');
  }

  const result = data as ContentGenerationResult | null;
  const body = result?.draft?.body;
  if (typeof body !== 'string' || body.trim().length === 0) {
    throw new Error('CONTENT_GENERATION_EMPTY');
  }

  return result as ContentGenerationResult;
}

export const contentGenerationService = {
  listTemplates,
  generate,
};
