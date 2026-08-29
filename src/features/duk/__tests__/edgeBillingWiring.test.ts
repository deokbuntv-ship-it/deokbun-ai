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

  it('§4 global reservation is request-scoped (idempotent) when enabled, passing the request id', () => {
    expect(edge).toContain("Deno.env.get('GLOBAL_REQ_IDEMPOTENCY_ENABLED')");
    expect(edge).toMatch(/reserveGlobalPaidGeneration\(admin, userId, workload, \{[\s\S]*requestId,[\s\S]*idempotent:/);
    const shared = readFileSync(resolve(__dirname, '../../../../supabase/functions/_shared/globalSpendGuard.ts'), 'utf8');
    expect(shared).toContain("reserve_global_paid_generation_idem");
    expect(shared).toContain("reserve_global_paid_generation'"); // legacy path preserved
  });

  // Product-integration-readiness audit (2026-08-29) — BUG-1: a SEMANTIC_REJECTED output (no real answer,
  // just the canned retry message) is a real HTTP 200 and was falling through to the SAME commit path as an
  // ACCEPTED answer, because `p_decision_meta is null` is ALSO the legitimate shape of a normal compatibility
  // completion. Locks the fix: a rejected non-answer must release its reservation, never commit it.
  it('a SEMANTIC_REJECTED first-turn output releases the reservation instead of committing it', () => {
    expect(edge).toContain("result.diagnostics?.outputClassification === 'SEMANTIC_REJECTED'");
    const gateAt = edge.indexOf('if (dukBillingEnabled && isRejectedNonAnswer && dukReservation)');
    expect(gateAt).toBeGreaterThan(-1);
    const releaseAt = edge.indexOf('await releaseDukIfHeld();', gateAt);
    const commitAt = edge.indexOf('completeConsultationWithBilling(', gateAt);
    // release happens BEFORE the completion call in this branch, and with a null reservation/decision.
    expect(releaseAt).toBeGreaterThan(gateAt);
    expect(commitAt).toBeGreaterThan(releaseAt);
    expect(edge.slice(commitAt, commitAt + 200)).toMatch(/verifiedConversationId,\s*null,\s*null,\s*dukFollowupSessionId/);
  });

  it('an ACCEPTED (or any non-rejected) first-turn output still commits normally (no regression)', () => {
    const elseAt = edge.indexOf('} else if (dukBillingEnabled && (dukReservation || dukFollowupSessionId)) {');
    expect(elseAt).toBeGreaterThan(-1);
    expect(edge.slice(elseAt, elseAt + 300)).toContain(
      'completeConsultationWithBilling(\n            paid.context, response, verifiedConversationId, acceptedDecision, dukReservation, dukFollowupSessionId,',
    );
  });
});

// Product-integration-readiness audit — BUG (not billing-specific, but the same "verified by source
// assertion" pattern this file establishes): the solo-consultation branch was missing `conversationSummary`
// even though it's parsed from the body and the compatibility branch right above it already includes it —
// every solo consultation silently lost the client's compressed long-conversation memory.
describe('solo consultation forwards conversationSummary (was silently dropped)', () => {
  it('both the compatibility and solo buildServerConsultation calls pass conversationSummary', () => {
    const compatAt = edge.indexOf('await buildCompatibilityConsultation(');
    const soloAt = edge.indexOf('await buildServerConsultation(');
    expect(compatAt).toBeGreaterThan(-1);
    expect(soloAt).toBeGreaterThan(compatAt);
    const compatBlock = edge.slice(compatAt, soloAt);
    const soloBlock = edge.slice(soloAt, soloAt + 900);
    expect(compatBlock).toMatch(/\bconversationSummary,/);
    expect(soloBlock).toMatch(/\bconversationSummary,/);
  });
});
