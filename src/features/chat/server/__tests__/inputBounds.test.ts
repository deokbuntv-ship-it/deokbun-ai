import {
  LLM_RATE_LIMITED_REQUEST_TYPES,
  MAX_CONTEXT_ITEMS,
  MAX_CONTEXT_ITEM_CHARS,
  MAX_QUESTION_CHARS,
  validateConsultationInputBounds,
} from '../inputBounds';

describe('LLM_RATE_LIMITED_REQUEST_TYPES', () => {
  it('counts consultation AND fortune generations against the burst window', () => {
    expect(LLM_RATE_LIMITED_REQUEST_TYPES).toEqual(['chat', 'today_fortune', 'monthly_fortune']);
    // The former bug counted only 'chat', leaving fortunes unbounded.
    expect(LLM_RATE_LIMITED_REQUEST_TYPES).toContain('today_fortune');
    expect(LLM_RATE_LIMITED_REQUEST_TYPES).toContain('monthly_fortune');
  });
});

describe('validateConsultationInputBounds', () => {
  it('accepts empty and normal-sized requests', () => {
    expect(validateConsultationInputBounds(undefined)).toEqual({ ok: true });
    expect(validateConsultationInputBounds({})).toEqual({ ok: true });
    expect(validateConsultationInputBounds({ question: '올해 재물운은 어떤가요?' })).toEqual({ ok: true });
    expect(
      validateConsultationInputBounds({ question: 'x'.repeat(MAX_QUESTION_CHARS), conversationContext: [{ text: 'hi' }] }),
    ).toEqual({ ok: true }); // exactly at the limit is allowed
  });

  it('rejects an over-length question', () => {
    expect(validateConsultationInputBounds({ question: 'x'.repeat(MAX_QUESTION_CHARS + 1) })).toEqual({
      ok: false,
      code: 'REQUEST_TOO_LARGE',
    });
  });

  it('rejects too many context / turn items', () => {
    const many = Array.from({ length: MAX_CONTEXT_ITEMS + 1 }, () => ({ text: 'a' }));
    expect(validateConsultationInputBounds({ conversationContext: many })).toEqual({ ok: false, code: 'REQUEST_TOO_LARGE' });
    expect(validateConsultationInputBounds({ turns: many })).toEqual({ ok: false, code: 'REQUEST_TOO_LARGE' });
  });

  it('rejects an over-length item body (text or content)', () => {
    expect(
      validateConsultationInputBounds({ conversationContext: [{ text: 'x'.repeat(MAX_CONTEXT_ITEM_CHARS + 1) }] }),
    ).toEqual({ ok: false, code: 'REQUEST_TOO_LARGE' });
    expect(
      validateConsultationInputBounds({ turns: [{ content: 'x'.repeat(MAX_CONTEXT_ITEM_CHARS + 1) }] }),
    ).toEqual({ ok: false, code: 'REQUEST_TOO_LARGE' });
  });

  it('ignores non-string/non-array fields safely', () => {
    expect(validateConsultationInputBounds({ question: 42, turns: 'not-an-array' })).toEqual({ ok: true });
  });
});
