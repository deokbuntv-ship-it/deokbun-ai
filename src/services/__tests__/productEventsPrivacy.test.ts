// Sprint F.1 §T — analytics privacy: server-validated RPC preferred; client sanitize as defense-in-depth.
const rpc = jest.fn();
const insert = jest.fn();
jest.mock('@/services/supabase', () => ({
  getSupabaseClient: () => ({ rpc, from: () => ({ insert }) }),
}));

// Re-require per test so the module-level `rpcUnavailable` cache never leaks across cases.
let sanitizeEventProperties: typeof import('@/services/productEvents').sanitizeEventProperties;
let trackProductEvent: typeof import('@/services/productEvents').trackProductEvent;

beforeEach(() => {
  (globalThis as { __DEV__?: boolean }).__DEV__ = true; // dev → transition fallback available (§6)
  jest.resetModules();
  rpc.mockReset();
  insert.mockReset();
  insert.mockResolvedValue({ error: null });
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('@/services/productEvents');
  sanitizeEventProperties = mod.sanitizeEventProperties;
  trackProductEvent = mod.trackProductEvent;
});

describe('§T sanitizeEventProperties — PII / unknown keys / oversized values are dropped', () => {
  it('keeps allowlisted scalar props, drops everything else', () => {
    const out = sanitizeEventProperties({
      question_domain: '재물',            // allowed string
      duk_shortfall: 1,                    // allowed number
      accelerated: false,                  // allowed boolean
      name: '홍길동',                       // PII — dropped (not on allowlist)
      email: 'a@b.com',                    // PII — dropped
      question: '올해 재물운은?',            // raw question — dropped
      birthYear: '1990',                   // birth data — dropped
      source: 'x'.repeat(65),              // oversized string — dropped
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      nested: { a: 1 } as any,             // non-scalar — dropped
    });
    expect(out).toEqual({ question_domain: '재물', duk_shortfall: 1, accelerated: false });
    expect(out).not.toHaveProperty('name');
    expect(out).not.toHaveProperty('email');
    expect(out).not.toHaveProperty('question');
  });
});

describe('§T trackProductEvent — prefers the server-validated RPC', () => {
  it('calls record_product_event with sanitized props and does NOT direct-insert', async () => {
    rpc.mockResolvedValue({ error: null });
    await trackProductEvent('today_fortune_card_viewed', { surface: 'home', properties: { overall_tier: '좋음', name: '홍길동' } });
    expect(rpc).toHaveBeenCalledTimes(1);
    const [fn, payload] = rpc.mock.calls[0];
    expect(fn).toBe('record_product_event');
    expect(payload.p_event_name).toBe('today_fortune_card_viewed');
    expect(payload.p_properties).toEqual({ overall_tier: '좋음' }); // PII 'name' dropped before it ever leaves
    expect(insert).not.toHaveBeenCalled();
  });

  it('falls back to a direct insert ONLY when the RPC is not deployed yet (function-missing)', async () => {
    rpc.mockResolvedValue({ error: { code: 'PGRST202', message: 'Could not find the function' } });
    await trackProductEvent('today_fortune_card_viewed', { surface: 'home' });
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledTimes(1); // transition fallback used
  });

  it('does NOT fall back on a non-missing RPC error (drops the event, never bypasses validation)', async () => {
    (globalThis as { __DEV__?: boolean }).__DEV__ = true;
    rpc.mockResolvedValue({ error: { code: '22001', message: 'value too long' } });
    await trackProductEvent('today_fortune_card_viewed', { surface: 'home' });
    expect(insert).not.toHaveBeenCalled();
  });

  it('§6 PRODUCTION (__DEV__ false) never direct-inserts even when the RPC is missing — drops quietly', async () => {
    (globalThis as { __DEV__?: boolean }).__DEV__ = false;
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const prod = require('@/services/productEvents');
    rpc.mockResolvedValue({ error: { code: 'PGRST202', message: 'Could not find the function' } });
    await prod.trackProductEvent('today_fortune_card_viewed', { surface: 'home' });
    expect(insert).not.toHaveBeenCalled(); // no insecure production fallback
  });
});
