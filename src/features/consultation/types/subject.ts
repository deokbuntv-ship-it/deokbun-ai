import type { BirthInfoDraft } from '@/features/consultation/types/consultation';

// A permanently saved consultation subject (address-book entry). This is
// distinct from the transient ConsultationDraft.
export type ConsultationSubjectRecord = {
  id: string;
  userId: string;
  displayName: string;
  relationship: string | null;
  isSelf: boolean;
  birthInfo: BirthInfoDraft;
  createdAt: string;
  updatedAt: string;
};

const TEMP_PREFIX = 'temp:';

// Matches an RFC-4122 style UUID (any version). Legacy ids such as 'self' do NOT
// match, so they are never treated as saved subjects.
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function createTempSubjectId(): string {
  return `${TEMP_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function isTempSubjectId(id: string): boolean {
  return id.startsWith(TEMP_PREFIX);
}

// A subject is "saved" ONLY when its id is a real UUID (a consultation_subjects
// row). Temp ids ('temp:...') and legacy ids ('self') return false — we never
// infer saved-ness from a DB lookup.
export function isSavedSubjectId(id: string): boolean {
  return UUID_PATTERN.test(id);
}
