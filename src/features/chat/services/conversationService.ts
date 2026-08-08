import type { ChatMessage } from '@/features/chat/types/chat';
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
// Never stores: prompt text, memory summary, API keys, JWTs, or secrets.

const CONVERSATIONS = 'conversations';
const MESSAGES = 'conversation_messages';

const CONVERSATION_COLUMNS = 'id, summary, last_summarized_message_id';

export type PersistableMessageRole = 'user' | 'assistant';

// Frozen at conversation-creation time. Preserves who the consultation was about
// even if the saved subject is later edited or deleted. This is a plain
// JSON-serializable snapshot; the service does not interpret its shape.
export type ConversationSubjectSnapshot = unknown;

type ConversationMessageRow = {
  role: PersistableMessageRole;
  content: string;
  client_message_id: string;
};

type ConversationRow = {
  id: string;
  summary: string | null;
  last_summarized_message_id: string | null;
};

export type LoadedConversation = {
  conversationId: string;
  messages: ChatMessage[];
  summary: string | null;
  lastSummarizedMessageId: string | null;
};

// Creates a new conversation. user_id is decided by the DB default `auth.uid()`.
// `subjectId` is the saved consultation_subjects UUID, or null for temp/legacy
// consultations. `subjectSnapshot` freezes the subject/birthInfo at this moment.
async function createConversation(
  subjectId: string | null,
  subjectSnapshot: ConversationSubjectSnapshot,
): Promise<string> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(CONVERSATIONS)
    .insert({
      subject_id: subjectId,
      subject_snapshot: subjectSnapshot ?? null,
    })
    .select('id')
    .single();

  if (error) {
    throw error;
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
  },
): Promise<void> {
  const supabase = getSupabaseClient();

  // Idempotent: the (conversation_id, client_message_id) unique constraint plus
  // ignoreDuplicates makes a repeated save a no-op. The parent-ownership INSERT
  // RLS policy rejects writes to conversations the caller does not own.
  const { error } = await supabase.from(MESSAGES).upsert(
    {
      conversation_id: conversationId,
      role: message.role,
      content: message.content,
      client_message_id: message.clientMessageId,
    },
    { onConflict: 'conversation_id,client_message_id', ignoreDuplicates: true },
  );

  if (error) {
    throw error;
  }
}

async function loadMessages(conversationId: string): Promise<ChatMessage[]> {
  const supabase = getSupabaseClient();

  const { data: rows, error } = await supabase
    .from(MESSAGES)
    .select('role, content, client_message_id')
    .eq('conversation_id', conversationId)
    .order('seq', { ascending: true });

  if (error) {
    throw error;
  }

  return ((rows as ConversationMessageRow[] | null) ?? []).map((row) => ({
    id: row.client_message_id,
    role: row.role,
    text: row.content,
  }));
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
    throw error;
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
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (data === null) {
    return null;
  }

  return hydrateConversation(data as ConversationRow);
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
    throw error;
  }
}

export const conversationService = {
  createConversation,
  saveMessage,
  loadLatestConversation,
  loadLatestConversationForSubject,
  saveSummary,
};
