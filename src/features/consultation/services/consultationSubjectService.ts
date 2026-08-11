import { logDbError } from '@/features/analysis';
import type { BirthInfoDraft } from '@/features/consultation/types/consultation';
import type { ConsultationSubjectRecord } from '@/features/consultation/types/subject';
import { getSupabaseClient } from '@/services/supabase';

// Permanent saved consultation subjects (multi-person address book).
// One row per person, owned by a user; RLS restricts every row to its owner.
// birth_info is stored as a JSONB snapshot of the APP BirthInfoDraft model
// (NOT the ENGINE calculation model).

const TABLE = 'consultation_subjects';

const COLUMNS =
  'id, user_id, display_name, relationship, is_self, birth_info, created_at, updated_at';

type ConsultationSubjectRow = {
  id: string;
  user_id: string;
  display_name: string;
  relationship: string | null;
  is_self: boolean;
  birth_info: BirthInfoDraft;
  created_at: string;
  updated_at: string;
};

export type CreateSubjectInput = {
  displayName: string;
  relationship: string | null;
  isSelf: boolean;
  birthInfo: BirthInfoDraft;
};

export type UpdateSubjectInput = {
  displayName?: string;
  relationship?: string | null;
  isSelf?: boolean;
  birthInfo?: BirthInfoDraft;
};

function toRecord(row: ConsultationSubjectRow): ConsultationSubjectRecord {
  return {
    id: row.id,
    userId: row.user_id,
    displayName: row.display_name,
    relationship: row.relationship,
    isSelf: row.is_self,
    birthInfo: row.birth_info,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function listSubjects(): Promise<ConsultationSubjectRecord[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select(COLUMNS)
    .order('is_self', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) {
    logDbError(error, 'subject', 'listSubjects');
  }

  return ((data as ConsultationSubjectRow[] | null) ?? []).map(toRecord);
}

// user_id is set by the DB default auth.uid(); the client does not send it.
async function createSubject(
  input: CreateSubjectInput,
): Promise<ConsultationSubjectRecord> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      display_name: input.displayName,
      relationship: input.relationship,
      is_self: input.isSelf,
      birth_info: input.birthInfo,
    })
    .select(COLUMNS)
    .single();

  if (error) {
    logDbError(error, 'subject', 'createSubject');
  }

  return toRecord(data as ConsultationSubjectRow);
}

async function getSubject(
  id: string,
): Promise<ConsultationSubjectRecord | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select(COLUMNS)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    logDbError(error, 'subject', 'getSubject');
  }

  return data === null ? null : toRecord(data as ConsultationSubjectRow);
}

async function updateSubject(
  id: string,
  patch: UpdateSubjectInput,
): Promise<void> {
  const supabase = getSupabaseClient();

  const row: Record<string, unknown> = {};
  if (patch.displayName !== undefined) row.display_name = patch.displayName;
  if (patch.relationship !== undefined) row.relationship = patch.relationship;
  if (patch.isSelf !== undefined) row.is_self = patch.isSelf;
  if (patch.birthInfo !== undefined) row.birth_info = patch.birthInfo;

  const { error } = await supabase.from(TABLE).update(row).eq('id', id);

  if (error) {
    logDbError(error, 'subject', 'updateSubject');
  }
}

// V1: hard delete. Draft/Conversation snapshots are independent and are not
// affected by removing a subject.
async function deleteSubject(id: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from(TABLE).delete().eq('id', id);

  if (error) {
    logDbError(error, 'subject', 'deleteSubject');
  }
}

// Makes `targetId` the user's single is_self subject.
// V1: sequential client updates (no RPC/transaction). To avoid violating the
// partial unique index (one is_self=true per user), the existing self is cleared
// FIRST, then the target is set. If the final update fails the caller must treat
// it as a failure (do NOT report success); at most one self is ever guaranteed.
async function setPrimarySubject(targetId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select('id')
    .eq('is_self', true)
    .maybeSingle();

  if (error) {
    logDbError(error, 'subject', 'setPrimarySubject:findSelf');
  }

  const currentSelfId = (data as { id: string } | null)?.id ?? null;

  if (currentSelfId === targetId) {
    return; // already the primary subject
  }

  if (currentSelfId !== null) {
    const { error: clearError } = await supabase
      .from(TABLE)
      .update({ is_self: false })
      .eq('id', currentSelfId);
    if (clearError) {
      logDbError(clearError, 'subject', 'setPrimarySubject:clear');
    }
  }

  const { error: setError } = await supabase
    .from(TABLE)
    .update({ is_self: true })
    .eq('id', targetId);
  if (setError) {
    logDbError(setError, 'subject', 'setPrimarySubject:set');
  }
}

export const consultationSubjectService = {
  listSubjects,
  createSubject,
  getSubject,
  updateSubject,
  deleteSubject,
  setPrimarySubject,
};
