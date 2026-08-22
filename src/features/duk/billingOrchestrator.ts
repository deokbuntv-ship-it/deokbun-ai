// Duk session-billing ORCHESTRATOR (Sprint H §5–§8, §15, §21). Runtime-neutral: it enforces the exact billing
// ORDER around the FROZEN consultation core via injected deps, so the Edge and Node tests run the identical
// control flow. The monetary COMMIT happens ATOMICALLY inside the persist step (the completion RPC also commits
// the Duk reservation, §21) — so this orchestrator only RESERVES (first turn) and RELEASES on failure; it never
// commits separately, which is what prevents "decision persisted but Duk uncommitted" (or vice-versa).
//
// Order (§6): AUTH → SAFETY → OWNERSHIP → RESOLVE PRODUCT → ACTIVE SESSION → POLICY → BALANCE → RESERVE →
//             PAID/GLOBAL ADMISSION → (LLM → VALIDATOR → PERSIST+COMMIT atomic) → RESPONSE.
// A safety hard-stop yields 0 Duk / 0 reserve / 0 LLM.

export type BillingErrorCode =
  | 'AUTH_REQUIRED'
  | 'SAFETY_HANDLED'
  | 'CONVERSATION_FORBIDDEN'
  | 'INSUFFICIENT_DUK'
  | 'RATE_LIMITED'
  | 'GLOBAL_LIMIT'
  | 'SERVICE_UNAVAILABLE'
  | 'REQUEST_FAILED';

export type Reservation = { reservationId: string; sessionId: string; chargeId: string; version: number };

// Injected runtime. Each returns a discriminated outcome; NONE trusts client state.
export type FirstTurnDeps = {
  checkAuth: () => Promise<boolean>;
  // Returns the safe result for a hard-stop route (self-harm/death/medical), or null to proceed. Runs BEFORE
  // any spend/LLM.
  safetyStop: () => Promise<{ text: string } | null>;
  verifyOwnership: () => Promise<boolean>; // conversation belongs to the auth user (or no conversation yet)
  // Resolve a server-verified ACTIVE session for this (user, product); null → first turn (needs a reserve).
  resolveActiveSession: () => Promise<{ sessionId: string } | null>;
  // Atomic: create/resume the session + reserve the price in the fixed bucket order. One logical start → one
  // reservation (concurrency-safe in the DB). Discriminated result.
  reserveSession: () => Promise<
    | { kind: 'RESERVED'; reservation: Reservation }
    | { kind: 'INSUFFICIENT'; balance: number; required: number; shortfall: number }
    | { kind: 'FAILED' }
  >;
  admitPaidGlobal: () => Promise<'OK' | 'RATE_LIMITED' | 'GLOBAL_LIMIT' | 'UNAVAILABLE'>;
  // LLM → validator → PERSIST (which ATOMICALLY commits the Duk reservation via the completion RPC). Returns
  // whether an accepted authoritative result was persisted+committed. A safety hard-stop inside here is possible
  // too (defense in depth) and never charges.
  runConsultationPersistCommit: (reservation: Reservation | null) => Promise<
    { kind: 'ACCEPTED' } | { kind: 'SAFETY' } | { kind: 'FAILED' }
  >;
  releaseReserve: (reservation: Reservation) => Promise<void>;
  releasePaidGlobal: () => Promise<void>;
};

export type BillingResult =
  | { ok: true; sessionId: string; committed: boolean; turnConsumed: boolean; firstTurn: boolean }
  | { ok: false; code: BillingErrorCode; detail?: { balance: number; required: number; shortfall: number } };

// Effects trace for tests (the §7 failure matrix). Every field defaults false.
export type BillingEffects = {
  reserved: boolean;
  committed: boolean;
  released: boolean;
  paidAdmitted: boolean;
  paidReleased: boolean;
  llmRan: boolean;
  sessionCreated: boolean;
  turnConsumed: boolean;
};

/**
 * The full first-or-follow-up billing flow. Pure control flow over injected deps. `runConsultationPersistCommit`
 * performs the LLM + validate + persist + Duk COMMIT atomically, so on ACCEPTED the charge is committed and on
 * FAILED nothing is charged (the orchestrator releases the reserve). Follow-up turns (an active session exists)
 * skip the reserve and never re-charge.
 */
export async function runBilledConsultation(deps: FirstTurnDeps): Promise<{ result: BillingResult; effects: BillingEffects }> {
  const fx: BillingEffects = {
    reserved: false, committed: false, released: false, paidAdmitted: false,
    paidReleased: false, llmRan: false, sessionCreated: false, turnConsumed: false,
  };

  if (!(await deps.checkAuth())) return { result: { ok: false, code: 'AUTH_REQUIRED' }, effects: fx };

  // SAFETY precedes everything (0 Duk / 0 reserve / 0 LLM).
  const safe = await deps.safetyStop();
  if (safe) return { result: { ok: false, code: 'SAFETY_HANDLED' }, effects: fx };

  if (!(await deps.verifyOwnership())) return { result: { ok: false, code: 'CONVERSATION_FORBIDDEN' }, effects: fx };

  const active = await deps.resolveActiveSession();
  const firstTurn = active === null;

  let reservation: Reservation | null = null;
  if (firstTurn) {
    const r = await deps.reserveSession();
    if (r.kind === 'INSUFFICIENT') {
      return { result: { ok: false, code: 'INSUFFICIENT_DUK', detail: { balance: r.balance, required: r.required, shortfall: r.shortfall } }, effects: fx };
    }
    if (r.kind === 'FAILED') return { result: { ok: false, code: 'SERVICE_UNAVAILABLE' }, effects: fx };
    reservation = r.reservation;
    fx.reserved = true;
    fx.sessionCreated = true;
  }

  // PAID/GLOBAL admission AFTER the Duk reserve (so a user with no Duk never consumes a global slot).
  const admit = await deps.admitPaidGlobal();
  if (admit !== 'OK') {
    if (reservation) { await deps.releaseReserve(reservation); fx.released = true; }
    const code: BillingErrorCode = admit === 'RATE_LIMITED' ? 'RATE_LIMITED' : admit === 'GLOBAL_LIMIT' ? 'GLOBAL_LIMIT' : 'SERVICE_UNAVAILABLE';
    return { result: { ok: false, code }, effects: fx };
  }
  fx.paidAdmitted = true;
  fx.llmRan = true;

  const run = await deps.runConsultationPersistCommit(reservation);
  if (run.kind === 'ACCEPTED') {
    if (reservation) fx.committed = true; // committed atomically inside the persist step
    fx.turnConsumed = true;
    return {
      result: { ok: true, sessionId: reservation?.sessionId ?? active!.sessionId, committed: fx.committed, turnConsumed: true, firstTurn },
      effects: fx,
    };
  }

  // Not accepted (provider/validator/persist failure) OR a safety hard-stop reached inside: 0 charged.
  if (reservation) { await deps.releaseReserve(reservation); fx.released = true; }
  await deps.releasePaidGlobal();
  fx.paidReleased = true;
  const code: BillingErrorCode = run.kind === 'SAFETY' ? 'SAFETY_HANDLED' : 'REQUEST_FAILED';
  return { result: { ok: false, code }, effects: fx };
}
