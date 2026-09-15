// Sprint H §7/§53 — first-turn failure matrix + follow-up entitlement, over the runtime-neutral billing
// orchestrator (UNIT test of the control flow; the DB atomicity itself is LIVE_DB_UNVERIFIED).
import { runBilledConsultation, type FirstTurnDeps, type Reservation } from '@/features/duk/billingOrchestrator';

const RES: Reservation = { reservationId: 'r1', sessionId: 's1', chargeId: 'c1', version: 0 };

function deps(over: Partial<FirstTurnDeps> = {}): FirstTurnDeps {
  return {
    checkAuth: async () => true,
    safetyStop: async () => null,
    verifyOwnership: async () => true,
    resolveActiveSession: async () => null, // first turn by default
    reserveSession: async () => ({ kind: 'RESERVED', reservation: RES }),
    admitPaidGlobal: async () => 'OK',
    runConsultationPersistCommit: async () => ({ kind: 'ACCEPTED' }),
    releaseReserve: async () => {},
    releasePaidGlobal: async () => {},
    ...over,
  };
}

describe('§6/§7 first-turn billing order + failure matrix', () => {
  it('happy path: reserve → admit → accepted → committed once, turn consumed', async () => {
    const { result, effects } = await runBilledConsultation(deps());
    expect(result.ok).toBe(true);
    expect(effects).toMatchObject({ reserved: true, committed: true, released: false, turnConsumed: true, sessionCreated: true });
  });

  it('AUTH failure: nothing reserved, no LLM', async () => {
    const { result, effects } = await runBilledConsultation(deps({ checkAuth: async () => false }));
    expect(result).toMatchObject({ ok: false, code: 'AUTH_REQUIRED' });
    expect(effects).toMatchObject({ reserved: false, llmRan: false, committed: false });
  });

  it('SAFETY hard-stop: 0 reserve, 0 LLM, 0 charge', async () => {
    const { result, effects } = await runBilledConsultation(deps({ safetyStop: async () => ({ text: 'hotline' }) }));
    expect(result).toMatchObject({ ok: false, code: 'SAFETY_HANDLED' });
    expect(effects).toMatchObject({ reserved: false, llmRan: false, committed: false, turnConsumed: false });
  });

  it('OWNERSHIP failure before reserve', async () => {
    const { result, effects } = await runBilledConsultation(deps({ verifyOwnership: async () => false }));
    expect(result).toMatchObject({ ok: false, code: 'CONVERSATION_FORBIDDEN' });
    expect(effects.reserved).toBe(false);
  });

  it('INSUFFICIENT_DUK: no admit, no LLM, returns balance/required/shortfall', async () => {
    const { result, effects } = await runBilledConsultation(deps({
      reserveSession: async () => ({ kind: 'INSUFFICIENT', balance: 11, required: 12, shortfall: 1 }),
    }));
    expect(result).toMatchObject({ ok: false, code: 'INSUFFICIENT_DUK', detail: { balance: 11, required: 12, shortfall: 1 } });
    expect(effects).toMatchObject({ reserved: false, paidAdmitted: false, llmRan: false });
  });

  it('reserve RPC failure → SERVICE_UNAVAILABLE, nothing charged', async () => {
    const { result, effects } = await runBilledConsultation(deps({ reserveSession: async () => ({ kind: 'FAILED' }) }));
    expect(result).toMatchObject({ ok: false, code: 'SERVICE_UNAVAILABLE' });
    expect(effects.reserved).toBe(false);
  });

  it('global spend denial AFTER reserve → release reserve, 0 charged', async () => {
    const release = jest.fn(async () => {});
    const { result, effects } = await runBilledConsultation(deps({ admitPaidGlobal: async () => 'GLOBAL_LIMIT', releaseReserve: release }));
    expect(result).toMatchObject({ ok: false, code: 'GLOBAL_LIMIT' });
    expect(effects).toMatchObject({ reserved: true, released: true, committed: false });
    expect(release).toHaveBeenCalledWith(RES);
  });

  it('provider/validator/persist failure → release reserve + release paid, 0 committed', async () => {
    const rel = jest.fn(async () => {});
    const relPaid = jest.fn(async () => {});
    const { result, effects } = await runBilledConsultation(deps({
      runConsultationPersistCommit: async () => ({ kind: 'FAILED' }), releaseReserve: rel, releasePaidGlobal: relPaid,
    }));
    expect(result).toMatchObject({ ok: false, code: 'REQUEST_FAILED' });
    expect(effects).toMatchObject({ reserved: true, released: true, committed: false, turnConsumed: false, paidReleased: true });
    expect(rel).toHaveBeenCalledTimes(1);
    expect(relPaid).toHaveBeenCalledTimes(1);
  });

  it('a safety hard-stop reached inside the run also releases and charges 0', async () => {
    const { result, effects } = await runBilledConsultation(deps({ runConsultationPersistCommit: async () => ({ kind: 'SAFETY' }) }));
    expect(result).toMatchObject({ ok: false, code: 'SAFETY_HANDLED' });
    expect(effects).toMatchObject({ released: true, committed: false });
  });
});

describe('§15 follow-up entitlement — active session, no re-charge', () => {
  it('an active session skips reserve; success consumes a turn with NO new charge', async () => {
    const reserve = jest.fn(async () => ({ kind: 'RESERVED' as const, reservation: RES }));
    const { result, effects } = await runBilledConsultation(deps({
      resolveActiveSession: async () => ({ sessionId: 's-active' }), reserveSession: reserve,
    }));
    expect(result).toMatchObject({ ok: true, firstTurn: false, committed: false, turnConsumed: true });
    expect(reserve).not.toHaveBeenCalled(); // no second charge
    expect(effects).toMatchObject({ reserved: false, committed: false, turnConsumed: true });
  });

  it('a failed follow-up: no reserve, no release-of-charge, no turn consumed', async () => {
    const { result, effects } = await runBilledConsultation(deps({
      resolveActiveSession: async () => ({ sessionId: 's-active' }),
      runConsultationPersistCommit: async () => ({ kind: 'FAILED' }),
    }));
    expect(result).toMatchObject({ ok: false, code: 'REQUEST_FAILED' });
    expect(effects).toMatchObject({ reserved: false, released: false, turnConsumed: false });
  });
});
