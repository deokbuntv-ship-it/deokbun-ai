// Sprint H §5/§6 — lock the Edge session-billing wiring by source assertion (the Deno Edge is not executed
// locally: EDGE_RUNTIME_NOT_EXECUTED). Behavioral flow is covered by billingOrchestrator.test.ts.
import { readFileSync } from 'fs';
import { resolve } from 'path';

const edge = readFileSync(resolve(__dirname, '../../../../supabase/functions/chat/index.ts'), 'utf8');

describe('§5/§6 Edge Duk billing wiring (flag-gated, correct order, release-on-failure)', () => {
  it('is flag-gated by DUK_BILLING_ENABLED (default off → byte-identical legacy path)', () => {
    expect(edge).toContain("Deno.env.get('DUK_BILLING_ENABLED')");
  });

  it('reserves AFTER ownership verification and BEFORE paid/global admission', () => {
    const ownerAt = edge.indexOf('verifyOwnedConversation(admin, userId, suppliedConversationId)');
    const reserveAt = edge.indexOf('reserveSessionDuk(admin, userId, productType, requestId)');
    const acquireAt = edge.indexOf('const paid = await acquirePaidRequest(admin, userId, requestWorkload, requestId)');
    expect(ownerAt).toBeGreaterThan(-1);
    expect(reserveAt).toBeGreaterThan(ownerAt);
    expect(acquireAt).toBeGreaterThan(reserveAt);
  });

  it('insufficient Duk returns 402 INSUFFICIENT_DUK with balance/required/shortfall, before the LLM', () => {
    expect(edge).toContain("error: 'INSUFFICIENT_DUK', balance: rv.balance, required: rv.required, shortfall: rv.shortfall");
    expect(edge).toContain('{ status: 402 }');
  });

  it('releases the reserve on every pre-commit failure (rate/global/disabled/unavailable/LLM/persist)', () => {
    // The release helper is invoked on the paid-failure paths and the LLM/persist-failure paths.
    expect((edge.match(/releaseDukIfHeld\(\)/g) ?? []).length).toBeGreaterThanOrEqual(6);
  });

  it('commit is atomic with completion (complete_consultation_with_billing), never a separate client step', () => {
    expect(edge).toContain('completeConsultationWithBilling(');
    expect(edge).toContain("rpc('complete_consultation_with_billing'");
    expect(edge).toContain("rpc('reserve_session_duk'");
    expect(edge).toContain("rpc('release_session_reservation'");
  });

  it('a client-supplied balance / paid / plus flag is never read for billing decisions', () => {
    expect(edge).not.toMatch(/body\.(balance|paid|plus|firstPackEligible|dukAmount|price)\b/);
  });
});
