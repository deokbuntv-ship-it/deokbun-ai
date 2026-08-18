import { logDbError } from '@/features/analysis';
import {
  parsePersistedStructured,
  serializeStructuredForPersistence,
} from '@/features/chat/presentation/persistStructured';
import type { ChatMessage } from '@/features/chat/types/chat';
import type { StructuredConsultationViewModel } from '@/features/intelligence/types/consultationViewModel';
import { getSupabaseClient } from '@/services/supabase';

// Persistence for conversation sessions and their messages. This lives OUTSIDE
// the ChatService pipeline (Gateway/Auth/Context/Memory/Prompt/Adapter unchanged).
//
// Security: conversation_messages has NO user_id column — ownership is enforced
// entirely by RLS against the parent conversation, so a user can neither read nor
// insert messages in another user's conversation. `subject_id` is validated by a
// composite-ownership RLS WITH CHECK so a conversation can only reference the
// caller's own consultation_subjects.
//
// Never stores: prompt text, grounding/engine payload, API keys, JWTs, or secrets. It DOES store the
// validated user-facing structured answer (prose + follow-ups) in `structured_result` so a reload
// keeps the card + chips (§14/§56 — no grounding, no raw payload).

const CONVERSATIONS = 'conversations';
const MESSAGES = 'conversation_messages';

const CONVERSATION_COLUMNS =
  'id, summary, last_summarized_message_id, subject_snapshot';

export type PersistableMessageRole = 'user' | 'assistant';

// Frozen at conversation-creation time. Preserves who the consultation was about
// even if the saved subject is later edited or deleted. This is a plain
// JSON-serializable snapshot; the service does not interpret its shape.
export type ConversationSubjectSnapshot = unknown;

type ConversationMessageRow = {
  role: PersistableMessageRole;
  content: string;
  client_message_id: string;
  structured_result?: unknown; // JSONB — parsed fail-closed by parsePersistedStructured
};

type ConversationRow = {
  id: string;
  summary: string | null;
  last_summarized_message_id: string | null;
  subject_snapshot: ConversationSubjectSnapshot;
};

export type LoadedConversation = {
  conversationId: string;
  messages: ChatMessage[];
  summary: string | null;
  lastSummarizedMessageId: string | null;
  subjectSnapshot: ConversationSubjectSnapshot;
};

// A single row for the per-subject history list. Metadata comes only from the
// conversation row (no per-conversation message query → no N+1).
export type ConversationSummaryItem = {
  id: string;
  createdAt: string;
  updatedAt: string;
  summary: string | null;
  subjectSnapshot: ConversationSubjectSnapshot;
};

// Creates a new conversation. user_id is decided by the DB default `auth.uid()`.
// `subjectId` is the saved consultation_subjects UUID, or null for temp/legacy
// consultations. `subjectSnapshot` freezes the subject/birthInfo at this moment.
// `opts` (additive) marks a 궁합 conversation (consultation_mode='compatibility') and stores its
// deterministic tier meta — solo callers pass no opts, so their inserts are byte-unchanged (both
// columns default null). compatibility_meta requires migration 20260819000100.
async function createConversation(
  subjectId: string | null,
  subjectSnapshot: ConversationSubjectSnapshot,
  opts?: { consultationMode?: 'solo' | 'compatibility'; compatibilityMeta?: unknown },
): Promise<string> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(CONVERSATIONS)
    .insert({
      subject_id: subjectId,
      subject_snapshot: subjectSnapshot ?? null,
      ...(opts?.consultationMode ? { consultation_mode: opts.consultationMode } : {}),
      ...(opts?.compatibilityMeta !== undefined ? { compatibility_meta: opts.compatibilityMeta } : {}),
    })
    .select('id')
    .single();

  if (error) {
    logDbError(error, 'conversation', 'persist');
  }

  const id = (data as { id?: string } | null)?.id;
  if (!id) {
    throw new Error('Conversation id missing.');
  }

  return id;
}

async function saveMessage(
  conversationId: string,
  message: {
    role: PersistableMessageRole;
    content: string;
    clientMessageId: string;
    structuredResult?: StructuredConsultationViewModel;
  },
): Promise<void> {
  const supabase = getSupabaseClient();

  // Persist the VALIDATED structured answer (user-facing prose + follow-ups only — never grounding
  // or raw payload; §14/§56) so a reload keeps the card + chips instead of a plain bubble.
  const persisted = message.structuredResult
    ? serializeStructuredForPersistence(message.structuredResult)
    : null;

  // Idempotent: the (conversation_id, client_message_id) unique constraint plus
  // ignoreDuplicates makes a repeated save a no-op. The parent-ownership INSERT
  // RLS policy rejects writes to conversations the caller does not own.
  const { error } = await supabase.from(MESSAGES).upsert(
    {
      conversation_id: conversationId,
      role: message.role,
      content: message.content,
      client_message_id: message.clientMessageId,
      structured_result: persisted,
      follow_ups: persisted?.followUps ?? null,
    },
    { onConflict: 'conversation_id,client_message_id', ignoreDuplicates: true },
  );

  if (error) {
    logDbError(error, 'conversation', 'persist');
  }
}

async function loadMessages(conversationId: string): Promise<ChatMessage[]> {
  const supabase = getSupabaseClient();

  const { data: rows, error } = await supabase
    .from(MESSAGES)
    .select('role, content, client_message_id, structured_result')
    .eq('conversation_id', conversationId)
    .order('seq', { ascending: true });

  if (error) {
    logDbError(error, 'conversation', 'persist');
  }

  return ((rows as ConversationMessageRow[] | null) ?? []).map((row) => {
    // Restore the structured card fail-closed: malformed/legacy/absent → plain text bubble.
    const structuredResult = parsePersistedStructured(row.structured_result);
    return {
      id: row.client_message_id,
      role: row.role,
      text: row.content,
      ...(structuredResult ? { structuredResult } : {}),
    };
  });
}

async function hydrateConversation(
  conversationRow: ConversationRow,
): Promise<LoadedConversation> {
  const messages = await loadMessages(conversationRow.id);
  return {
    conversationId: conversationRow.id,
    messages,
    summary: conversationRow.summary,
    lastSummarizedMessageId: conversationRow.last_summarized_message_id,
    subjectSnapshot: conversationRow.subject_snapshot,
  };
}

// Loads the caller's most recently active conversation (RLS restricts to own
// rows). Retained for backward compatibility; subject-aware hydration uses
// loadLatestConversationForSubject instead.
async function loadLatestConversation(): Promise<LoadedConversation | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(CONVERSATIONS)
    .select(CONVERSATION_COLUMNS)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    logDbError(error, 'conversation', 'persist');
  }
  if (data === null) {
    return null;
  }

  return hydrateConversation(data as ConversationRow);
}

// Loads the caller's most recently active conversation FOR A SPECIFIC saved
// subject. RLS restricts to own rows; the subject_id filter guarantees the
// restored conversation belongs to the requested subject (no cross-subject mix).
async function loadLatestConversationForSubject(
  subjectId: string,
): Promise<LoadedConversation | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(CONVERSATIONS)
    .select(CONVERSATION_COLUMNS)
    .eq('subject_id', subjectId)
    // Exclude 궁합 conversations so the SOLO chat never restores a compatibility conversation for a
    // subject that is also used as a 궁합 target (solo = null/legacy or explicit 'solo').
    .or('consultation_mode.is.null,consultation_mode.eq.solo')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    logDbError(error, 'conversation', 'persist');
  }
  if (data === null) {
    return null;
  }

  return hydrateConversation(data as ConversationRow);
}

// ── 궁합(compatibility) conversation persistence ─────────────────────────────
// Reuses the SAME conversations + conversation_messages tables (no compatibility_conversations
// table). A 궁합 conversation is subject_id = target subject + consultation_mode = 'compatibility';
// the pair is DERIVED (owner is_self + target). compatibility_meta carries the deterministic tier so a
// reload restores the tier chip without any LLM call. Requires migrations 20260819000000/000100.
const COMPAT_CONVERSATION_COLUMNS =
  'id, summary, last_summarized_message_id, subject_snapshot, compatibility_meta';

export type LoadedCompatibilityConversation = LoadedConversation & { compatibilityMeta: unknown };

// Latest 궁합 conversation for a target subject (or null). Restores messages (structured cards +
// follow-ups) + the deterministic tier meta — the load-first path that prevents a duplicate LLM
// call on refresh (§9/§54).
async function loadLatestCompatibilityConversation(
  subjectId: string,
): Promise<LoadedCompatibilityConversation | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(CONVERSATIONS)
    .select(COMPAT_CONVERSATION_COLUMNS)
    .eq('subject_id', subjectId)
    .eq('consultation_mode', 'compatibility')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    logDbError(error, 'conversation', 'persist');
  }
  if (data === null) {
    return null;
  }
  const row = data as ConversationRow & { compatibility_meta?: unknown };
  const messages = await loadMessages(row.id);
  return {
    conversationId: row.id,
    messages,
    summary: row.summary,
    lastSummarizedMessageId: row.last_summarized_message_id,
    subjectSnapshot: row.subject_snapshot,
    compatibilityMeta: row.compatibility_meta ?? null,
  };
}

// All 궁합 conversations for a target (pair history), newest first.
async function listCompatibilityConversationsForSubject(
  subjectId: string,
): Promise<ConversationSummaryItem[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(CONVERSATIONS)
    .select('id, created_at, updated_at, summary, subject_snapshot')
    .eq('subject_id', subjectId)
    .eq('consultation_mode', 'compatibility')
    .order('updated_at', { ascending: false });
  if (error) {
    logDbError(error, 'conversation', 'persist');
  }
  return (
    (data as
      | Array<{ id: string; created_at: string; updated_at: string; summary: string | null; subject_snapshot: ConversationSubjectSnapshot }>
      | null) ?? []
  ).map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    summary: row.summary,
    subjectSnapshot: row.subject_snapshot,
  }));
}

// Loads a specific conversation by id (for opening a past conversation from
// history). RLS restricts to own rows → another user's id returns null.
async function loadConversationById(
  conversationId: string,
): Promise<LoadedConversation | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(CONVERSATIONS)
    .select(CONVERSATION_COLUMNS)
    .eq('id', conversationId)
    .maybeSingle();

  if (error) {
    logDbError(error, 'conversation', 'persist');
  }
  if (data === null) {
    return null;
  }

  return hydrateConversation(data as ConversationRow);
}

// Lists all conversations for a saved subject (history), newest activity first.
// RLS restricts to own rows. One query, no per-conversation message lookups.
async function listConversationsForSubject(
  subjectId: string,
): Promise<ConversationSummaryItem[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(CONVERSATIONS)
    .select('id, created_at, updated_at, summary, subject_snapshot')
    .eq('subject_id', subjectId)
    // Solo history excludes 궁합 conversations (they surface under 운세우편함 > 궁합, not solo history).
    .or('consultation_mode.is.null,consultation_mode.eq.solo')
    .order('updated_at', { ascending: false });

  if (error) {
    logDbError(error, 'conversation', 'persist');
  }

  return (
    (data as
      | Array<{
          id: string;
          created_at: string;
          updated_at: string;
          summary: string | null;
          subject_snapshot: ConversationSubjectSnapshot;
        }>
      | null) ?? []
  ).map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    summary: row.summary,
    subjectSnapshot: row.subject_snapshot,
  }));
}

// Persists the compressed conversation summary and its checkpoint. Idempotent:
// a plain update, safe to retry. `lastSummarizedMessageId` must be a
// client_message_id that already exists in this conversation's messages.
async function saveSummary(
  conversationId: string,
  summary: string,
  lastSummarizedMessageId: string,
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from(CONVERSATIONS)
    .update({
      summary,
      last_summarized_message_id: lastSummarizedMessageId,
    })
    .eq('id', conversationId);

  if (error) {
    logDbError(error, 'conversation', 'persist');
  }
}

export const conversationService = {
  createConversation,
  saveMessage,
  loadLatestConversation,
  loadLatestConversationForSubject,
  loadConversationById,
  listConversationsForSubject,
  loadLatestCompatibilityConversation,
  listCompatibilityConversationsForSubject,
  saveSummary,
};
