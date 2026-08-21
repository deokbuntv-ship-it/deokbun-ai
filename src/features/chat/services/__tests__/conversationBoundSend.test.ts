// Sprint F §B/§C — auth precedes conversation creation, and the first paid turn is bound to an OWNED
// conversation id passed directly (never a stale React-state closure).
import {
  assertAuthenticatedForConversation,
  ConversationAuthRequiredError,
  executeConversationBoundSend,
  isConversationAuthRequiredError,
} from '@/features/chat/services/conversationBoundSend';

describe('§B assertAuthenticatedForConversation — auth precedes conversation creation', () => {
  it('throws the typed AUTH_REQUIRED signal for an unauthenticated / loading / empty caller', () => {
    for (const auth of [
      { status: 'unauthenticated', userId: null },
      { status: 'loading', userId: null },
      { status: 'authenticated', userId: null }, // status says yes but no user id → still closed
      { status: 'authenticated', userId: '' },
    ]) {
      expect(() => assertAuthenticatedForConversation(auth)).toThrow(ConversationAuthRequiredError);
    }
  });

  it('passes for a genuine authenticated user', () => {
    expect(() => assertAuthenticatedForConversation({ status: 'authenticated', userId: 'user-a' })).not.toThrow();
  });

  it('isConversationAuthRequiredError recognizes the error (instanceof + structural)', () => {
    expect(isConversationAuthRequiredError(new ConversationAuthRequiredError())).toBe(true);
    expect(isConversationAuthRequiredError({ code: 'AUTH_REQUIRED' })).toBe(true);
    expect(isConversationAuthRequiredError(new Error('boom'))).toBe(false);
    expect(isConversationAuthRequiredError(null)).toBe(false);
  });
});

describe('§B executeConversationBoundSend — unauthenticated first turn does NO side effects', () => {
  it('when ensureConversation fails closed (auth), NEITHER persist NOR send runs', async () => {
    const persistUserMessage = jest.fn();
    const sendConsultation = jest.fn(async () => 'should-not-run');
    const ensureConversation = jest.fn(async () => {
      // The hook rejects here (via assertAuthenticatedForConversation) BEFORE any INSERT.
      throw new ConversationAuthRequiredError();
    });

    await expect(
      executeConversationBoundSend({ ensureConversation, persistUserMessage, sendConsultation }),
    ).rejects.toBeInstanceOf(ConversationAuthRequiredError);

    expect(ensureConversation).toHaveBeenCalledTimes(1);
    expect(persistUserMessage).not.toHaveBeenCalled(); // no user-message write
    expect(sendConsultation).not.toHaveBeenCalled();   // no reserve / LLM / decision persist
  });
});

describe('§C executeConversationBoundSend — first turn carries the OWNED conversation id directly', () => {
  it('awaits creation, persists the user message, then sends with the exact returned id', async () => {
    const order: string[] = [];
    const ensureConversation = jest.fn(async () => {
      order.push('ensure');
      return 'conv-123';
    });
    const persistUserMessage = jest.fn(() => order.push('persist'));
    const sendConsultation = jest.fn(async (id: string) => {
      order.push(`send:${id}`);
      return { ok: true, id };
    });

    const result = await executeConversationBoundSend({ ensureConversation, persistUserMessage, sendConsultation });

    expect(result).toEqual({ ok: true, id: 'conv-123' });
    expect(sendConsultation).toHaveBeenCalledWith('conv-123'); // the id is passed directly, not read from state
    expect(order).toEqual(['ensure', 'persist', 'send:conv-123']); // strict authority ordering
  });
});
