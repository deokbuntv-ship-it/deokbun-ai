// Activation 04F — parseInsufficientDuk: extracts the authoritative 402 payload from a functions.invoke error.
import { parseInsufficientDuk } from '@/features/chat/adapters/llmError';

const err = (status: number, body: unknown) => ({ context: { status, json: async () => body } });

describe('parseInsufficientDuk', () => {
  it('returns server balance/required/shortfall for a 402 INSUFFICIENT_DUK', async () => {
    const r = await parseInsufficientDuk(err(402, { error: 'INSUFFICIENT_DUK', balance: 11, required: 12, shortfall: 1 }));
    expect(r).toEqual({ balance: 11, required: 12, shortfall: 1 });
  });
  it('returns null for a non-402 error (generic failure stays generic)', async () => {
    expect(await parseInsufficientDuk(err(500, { error: 'X' }))).toBeNull();
    expect(await parseInsufficientDuk(err(401, {}))).toBeNull();
  });
  it('returns null for a 402 that is not INSUFFICIENT_DUK', async () => {
    expect(await parseInsufficientDuk(err(402, { error: 'SOMETHING_ELSE' }))).toBeNull();
  });
  it('returns null when the error carries no context/body', async () => {
    expect(await parseInsufficientDuk(null)).toBeNull();
    expect(await parseInsufficientDuk({})).toBeNull();
  });
});
