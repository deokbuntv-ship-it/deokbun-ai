import { getSupabaseClient } from '@/services/supabase';

// Atomic "claim → generate → persist" for canonical one-per-period fortunes (오늘의 운세 / 이번 달 운세), so
// exactly ONE of N concurrent first-loads calls the paid LLM (§A5). Two concurrent client requests derive the
// SAME claim_key (their date guess), collide on the fortune_generation_claims PK, and one wins; the losers
// wait for the winner's persisted result instead of generating.
//
// FAIL-OPEN by construction: claimFortuneGeneration returns 'won' on ANY error, so a claim-table outage
// degrades to the prior behavior (generate) — this mechanism can only PREVENT duplicate spend, never block a
// legitimate first generation. The orchestration is pure (all IO injected) so the LLM-call-count invariant is
// unit-tested without real timers or a live DB. Live Postgres atomicity is OWNER E2E (jest cannot prove it).

const CLAIM_TABLE = 'fortune_generation_claims';
export type FortuneClaimKind = 'today' | 'monthly';
export type ClaimResult = 'won' | 'lost';

/** Atomically claim generation for (caller, kind, claimKey). 'won' = this caller inserted the claim row;
 *  'lost' = a claim already existed. Any error → 'won' (fail-open). */
export async function claimFortuneGeneration(kind: FortuneClaimKind, claimKey: string): Promise<ClaimResult> {
  try {
    const { data, error } = await getSupabaseClient()
      .from(CLAIM_TABLE)
      .upsert({ kind, claim_key: claimKey }, { onConflict: 'user_id,kind,claim_key', ignoreDuplicates: true })
      .select('claim_key')
      .maybeSingle();
    if (error) return 'won'; // fail-open — never block generation on a claim outage
    return data ? 'won' : 'lost';
  } catch {
    return 'won';
  }
}

/** Release a claim (RLS scopes the delete to the caller). Non-blocking. */
export async function releaseFortuneGeneration(kind: FortuneClaimKind, claimKey: string): Promise<void> {
  try {
    await getSupabaseClient().from(CLAIM_TABLE).delete().eq('kind', kind).eq('claim_key', claimKey);
  } catch {
    /* non-blocking */
  }
}

/** Bounded poll of a canonical read (a loser waiting for the winner's result). sleep is injectable for tests. */
export async function waitForCanonical<T>(
  read: () => Promise<T | null>,
  opts: { attempts: number; delayMs: number; sleep?: (ms: number) => Promise<void> },
): Promise<T | null> {
  const sleep = opts.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  for (let i = 0; i < opts.attempts; i += 1) {
    await sleep(opts.delayMs);
    const r = await read();
    if (r) return r;
  }
  return null;
}

export type ClaimedOutcome<T> =
  | { status: 'ok'; record: T; cacheHit: boolean }
  | { status: 'auth' }
  | { status: 'unavailable' }
  | { status: 'error' };

export type ClaimedGenerationDeps<T> = {
  readCanonical: () => Promise<T | null>; // cache-read the persisted fortune (0 LLM)
  claim: () => Promise<ClaimResult>; // atomic claim
  release: () => Promise<void>; // delete the claim
  waitForWinner: () => Promise<T | null>; // bounded poll of readCanonical (loser waits for winner)
  generateAndPersist: () => Promise<ClaimedOutcome<T>>; // the existing edge-generate + persist path (1 LLM)
};

/** The economic invariant, in one place: cache hit / winner-produced → 0 LLM; exactly one winner generates. */
export async function ensureClaimedGeneration<T>(deps: ClaimedGenerationDeps<T>): Promise<ClaimedOutcome<T>> {
  const cached = await deps.readCanonical();
  if (cached) return { status: 'ok', record: cached, cacheHit: true };

  const claim = await deps.claim();
  if (claim === 'lost') {
    // Another request owns generation — wait for its persisted result rather than paying for our own.
    const winner = await deps.waitForWinner();
    if (winner) return { status: 'ok', record: winner, cacheHit: true }; // 0 LLM
    // Winner was slow or died — reclaim the stale slot, then generate ourselves (rare).
    await deps.release();
  }

  const out = await deps.generateAndPersist();
  // On a failed generation, release our claim so a later retry can win (a successful claim naturally becomes
  // irrelevant once the fortune exists and future loads cache-hit).
  if (claim === 'won' && out.status !== 'ok') await deps.release();
  return out;
}
