import { logDbError } from '@/features/analysis';
import type {
    BirthInfoDraft,
    ConsultationDraft,
    ConsultationSubject,
} from '@/features/consultation/types/consultation';
import { getSupabaseClient } from '@/services/supabase';

// Persistence for the CURRENT consultation draft only (subject + birth info).
// One row per user (PK = user_id), upserted on conflict. Never stores messages,
// AI responses, prompts, memory summaries, or any secret. `updated_at` is managed
// entirely by the database (default + trigger) and is only read back here.

const TABLE = 'consultation_drafts';

// Minimal DB row shape used only inside this service (Sprint 2-20 requirement).
type ConsultationDraftRow = {
  subject: ConsultationSubject | null;
  birth_info: BirthInfoDraft | null;
  updated_at: string | null;
};

export type LoadedConsultationDraft = {
  draft: ConsultationDraft;
  updatedAt: string | null;
};

export type SavedConsultationDraft = {
  updatedAt: string | null;
};

function readUpdatedAt(data: unknown): string | null {
  return (data as { updated_at?: string | null } | null)?.updated_at ?? null;
}

async function saveDraft(
  userId: string,
  draft: ConsultationDraft,
): Promise<SavedConsultationDraft> {
  const supabase = getSupabaseClient();

  // Note: `updated_at` is intentionally NOT sent — the DB manages it.
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      { user_id: userId, subject: draft.subject, birth_info: draft.birthInfo },
      { onConflict: 'user_id' },
    )
    .select('updated_at')
    .single();

  if (error) {
    logDbError(error, 'consultation', 'saveDraft');
  }

  return { updatedAt: readUpdatedAt(data) };
}

async function loadDraft(userId: string): Promise<LoadedConsultationDraft | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select('subject, birth_info, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    logDbError(error, 'consultation', 'loadDraft');
  }

  if (data === null) {
    return null;
  }

  const row = data as ConsultationDraftRow;

  return {
    draft: { subject: row.subject, birthInfo: row.birth_info },
    updatedAt: row.updated_at,
  };
}

// Reset keeps the single row (user-per-row invariant) and nulls the content,
// rather than deleting the row.
async function clearDraft(userId: string): Promise<SavedConsultationDraft> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      { user_id: userId, subject: null, birth_info: null },
      { onConflict: 'user_id' },
    )
    .select('updated_at')
    .single();

  if (error) {
    logDbError(error, 'consultation', 'clearDraft');
  }

  return { updatedAt: readUpdatedAt(data) };
}

export const consultationDraftService = {
  saveDraft,
  loadDraft,
  clearDraft,
};
