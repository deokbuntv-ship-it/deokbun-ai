// Sprint I §37 — staging economy E2E harness. DRY RUN by default: prints the exact ordered test plan (two test
// users A/B) with the requests each case issues. A live run (--live) requires explicit staging env and is the
// owner's controlled activation step — it is intentionally NOT auto-wired to spend or mutate here. Never prints
// secrets.
const LIVE = process.argv.includes('--live');

const CASES = [
  ['welcome_balance', 'A signs up → wallet shows WELCOME grant (getWalletState)'],
  ['candle_signup_day', 'A lights candle immediately (light_candle) → +1 REWARD; second light within 24h → no grant'],
  ['general_first_charge', 'A: first general turn → 5 Duk reserved+committed once (session created, turn 1)'],
  ['general_followup', 'A: turns 2..5 → NO new charge; turn 6 → new session required'],
  ['compatibility_charge', 'A: first compatibility turn → 12 Duk (separate session; general entitlement NOT reused)'],
  ['insufficient_duk', 'B (low balance): compatibility → 402 INSUFFICIENT_DUK (balance/required/shortfall), no LLM'],
  ['concurrent_first_turn', 'A: two concurrent first-turn sends (distinct request_ids) → ONE session, ONE charge'],
  ['request_retry', 'A: retry same request_id → replay, no second charge/decision'],
  ['response_loss', 'A: simulate response loss after commit → retry returns persisted answer, no re-charge'],
  ['cross_owner_session', "B uses A's conversation id → CONVERSATION_FORBIDDEN before reserve/LLM"],
  ['reserve_expiry', 'A: reserve then abandon → reserve TTL-reconciled (release), 0 charged'],
  ['refund_simulation', "A: record_revocation → PAID reversal or duk_debt; REWARD/CANDLE unaffected"],
  ['debt_offset', 'A with debt: new PAID grant nets debt first, remainder spendable'],
];

console.log('덕분이 staging economy E2E — PLAN (two test users A/B)\n');
for (const [id, desc] of CASES) console.log(`  ${id.padEnd(24)} ${desc}`);
console.log('\nEach case asserts the authoritative server state (ledger/reserve/session), never a client claim.');
console.log('Required for --live: STAGING_EDGE_URL, STAGING_JWT_A, STAGING_JWT_B, STAGING_SERVICE_KEY,');
console.log('STAGING_SUPABASE_URL, and DUK_BILLING_ENABLED=true on the deployed Edge.\n');

if (!LIVE) {
  console.log('DRY_RUN — no requests issued, no spend, no mutation.');
  console.log('STAGING_HARNESS_READY');
  console.log('LIVE_STAGING_NOT_EXECUTED  (owner runs --live during the controlled activation step)');
} else {
  const need = ['STAGING_EDGE_URL', 'STAGING_JWT_A', 'STAGING_JWT_B', 'STAGING_SERVICE_KEY', 'STAGING_SUPABASE_URL'];
  const missing = need.filter((n) => !(process.env[n] && process.env[n].length));
  if (missing.length) {
    console.error('LIVE requested but missing env:', missing.join(', '));
    process.exit(1);
  }
  console.error('Live staging execution is the owner-controlled activation step; this harness prints the plan +');
  console.error('validates env only. Implement the per-case requests against your staging Edge before enabling.');
  process.exit(2);
}
