import type { ChatMessage } from '@/features/chat/types/chat';
import { getSupabaseClient } from '@/services/supabase';

// Persistence for conversation sessions and their messages. This lives OUTSIDE
// the ChatService pipeline (Gateway/Auth/Context/Memory/Prompt/Adapter unchanged).
//
// Security: conversation_messages has NO user_id column — ownership is enforced
// entirely by RLS against the parent conversation, so a user can neither read nor
// insert messages in another user's conversation.
//
// Never stores: prompt text, memory summary, API keys, JWTs, or secrets.

const CONVERSATIONS = 'conversations';
const MESSAGES = 'conversation_messages';

export type PersistableMessageRole = 'user' | 'assistant';

type ConversationMessageRow = {
  role: PersistableMessageRole;
  content: string;
  client_message_id: string;
};

export type LoadedConversation = {
  conversationId: string;
  messages: ChatMessage[];
};

// Creates a new conversation. user_id is decided by the DB default `auth.uid()`,
// so the client does not send it.
async function createConversation(): Promise<string> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(CONVERSATIONS)
    .insert({})
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

// Loads the caller's most recently active conversation (RLS restricts to own
// rows) and its messages in insertion order.
async function loadLatestConversation(): Promise<LoadedConversation | null> {
  const supabase = getSupabaseClient();

  const { data: conversation, error: conversationError } = await supabase
    .from(CONVERSATIONS)
    .select('id')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (conversationError) {
    throw conversationError;
  }

  if (conversation === null) {
    return null;
  }

  const conversationId = (conversation as { id: string }).id;

  const { data: rows, error: messagesError } = await supabase
    .from(MESSAGES)
    .select('role, content, client_message_id')
    .eq('conversation_id', conversationId)
    .order('seq', { ascending: true });

  if (messagesError) {
    throw messagesError;
  }

  const messages: ChatMessage[] = (
    (rows as ConversationMessageRow[] | null) ?? []
  ).map((row) => ({
    id: row.client_message_id,
    role: row.role,
    text: row.content,
  }));

  return { conversationId, messages };
}

export const conversationService = {
  createConversation,
  saveMessage,
  loadLatestConversation,
};
