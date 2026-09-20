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

// The user's canonical SELF subject (is_self = true), or null when onboarding has not created one yet.
// One row max is guaranteed by the partial unique index; maybeSingle tolerates zero. Used by the onboarding
// completeness check — throws (logDbError) on a real DB error so facts loading can fail closed.
async function getSelfSubject(): Promise<ConsultationSubjectRecord | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select(COLUMNS)
    .eq('is_self', true)
    .maybeSingle();

  if (error) {
    logDbError(error, 'subject', 'getSelfSubject');
  }

  return data === null ? null : toRecord(data as ConsultationSubjectRow);
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

/**
 * `targetId` 를 이 사용자의 **유일한 대표(is_self)** 로 만든다.
 *
 * ⚠ 2026-09-21 (F-04): 예전에는 요청 **세 번**(찾기 → 해제 → 지정)으로 했다. 해제 다음에 끊기면
 *   **대표가 아무도 없는 상태**로 남아 상담 · 궁합이 403 으로 막히고, 다음 앱 실행 때 온보딩이 같은
 *   사람을 하나 더 만들었다. 이제 서버 함수 하나(`set_primary_subject`)가 한 트랜잭션에서 끝낸다 —
 *   중간에 실패하면 통째로 되돌아가 **원래 대표가 그대로** 남는다.
 *
 * 실패하면 던진다. 호출한 화면은 성공으로 그리면 안 된다.
 */
async function setPrimarySubject(targetId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc('set_primary_subject', { p_subject_id: targetId });
  if (error) {
    logDbError(error, 'subject', 'setPrimarySubject');
    throw error;
  }
}

export const consultationSubjectService = {
  listSubjects,
  createSubject,
  getSubject,
  getSelfSubject,
  updateSubject,
  deleteSubject,
  setPrimarySubject,
};
