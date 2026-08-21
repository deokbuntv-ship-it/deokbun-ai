export type ConversationBoundSendDeps<T> = {
  ensureConversation: () => Promise<string>;
  persistUserMessage: () => void;
  sendConsultation: (conversationId: string) => Promise<T>;
};

/** Actual first-chat authority coordinator used by ChatScreen. */
export async function executeConversationBoundSend<T>(deps: ConversationBoundSendDeps<T>): Promise<T> {
  const conversationId = await deps.ensureConversation();
  deps.persistUserMessage();
  return deps.sendConsultation(conversationId);
}
