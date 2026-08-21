// Sprint F §K/§M — LLM cost benchmark harness (READY; does NOT execute live by default).
//
// SAFETY:
//   • Default is a DRY RUN: it prints the benchmark plan and exits. No network, no spend.
//   • Live mode requires an explicit `--live` flag AND all env below. It NEVER prints a secret.
//   • It NEVER hardcodes model prices. `estimated_cost` is filled ONLY if you pass a price table file
//     (BENCHMARK_PRICES=path.json mapping model→{input,cached_input,output} in a currency you choose).
//   • Token counts come from the Edge's OWN ai_usage_logs rows (the Edge already records input/cached/output/
//     reasoning tokens + latency + model per request). So this measures REAL production usage, not a guess.
//
// LIVE ENV (all required for --live):
//   BENCHMARK_EDGE_URL     e.g. https://<ref>.functions.supabase.co/chat
//   BENCHMARK_JWT          a test user's access token (authenticated, non-admin). Spends real LLM money.
//   BENCHMARK_SERVICE_KEY  service-role key to read ai_usage_logs (usage is not returned to the client)
//   BENCHMARK_SUPABASE_URL supabase project URL (for the ai_usage_logs REST read)
//   BENCHMARK_PRICES       (optional) path to a JSON price table; omit to collect tokens with null cost
//
// USAGE:
//   node scripts/benchmark/run-benchmark.mjs            # dry run (plan only)
//   node scripts/benchmark/run-benchmark.mjs --live     # live run (needs the env above)

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const fixtures = JSON.parse(readFileSync(resolve(HERE, 'fixtures.json'), 'utf8'));
const LIVE = process.argv.includes('--live');

// The workload matrix. `model` is left as the deployment default (Edge resolves it) unless the owner has wired
// per-workload routing; the measured row records whatever model the Edge actually used.
const PLAN = [
  { workload: 'general', label: '일반 상담 (Mini target)', items: fixtures.general },
  { workload: 'specificTiming', label: '특정 시기/심층 (Terra target)', items: fixtures.specificTiming },
  { workload: 'compatibility', label: '궁합 (Terra target)', items: fixtures.compatibility },
  { workload: 'whyFollowUp', label: 'WHY 후속', items: fixtures.whyFollowUp },
];
const TURN_COUNTS = fixtures.turnCounts ?? [1, 3, 5];

function printPlan() {
  console.log('덕분이 LLM cost benchmark — PLAN\n');
  for (const p of PLAN) {
    console.log(`  ${p.workload.padEnd(16)} ${p.label}  (${p.items.length} fixtures × turns ${TURN_COUNTS.join('/')})`);
  }
  console.log('\nMeasured fields per row: workload, model, turn_number, input_tokens, cached_tokens,');
  console.log('output_tokens, total_tokens, latency_ms, estimated_cost, currency, timestamp,');
  console.log('prompt_version, engine_version.\n');
  console.log('Token source: the Edge\'s own ai_usage_logs rows (real usage), joined by request_id.');
  console.log('Cost: computed ONLY if BENCHMARK_PRICES is supplied; never hardcoded.\n');
}

function requireEnv(name) {
  const v = process.env[name];
  if (!v || v.trim().length === 0) throw new Error(`missing env ${name}`);
  return v.trim();
}

// One consultation turn against the deployed Edge. Returns the requestId (used to join ai_usage_logs).
async function sendTurn(edgeUrl, jwt, body) {
  const requestId = `bench-${body._benchId}`;
  const res = await fetch(edgeUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${jwt}` },
    body: JSON.stringify({ ...body.payload, requestMetadata: { requestId } }),
  });
  return { requestId, status: res.status };
}

async function readUsage(supabaseUrl, serviceKey, requestId) {
  // ai_usage_logs is keyed by the request id the Edge stamped. Read the single row back.
  const url = `${supabaseUrl}/rest/v1/ai_usage_logs?request_id=eq.${encodeURIComponent(requestId)}&select=*`;
  const res = await fetch(url, { headers: { apikey: serviceKey, authorization: `Bearer ${serviceKey}` } });
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

function loadPrices() {
  const path = process.env.BENCHMARK_PRICES;
  if (!path) return null;
  try { return JSON.parse(readFileSync(resolve(path), 'utf8')); } catch { return null; }
}

function estimateCost(prices, row) {
  if (!prices) return { estimated_cost: null, currency: null };
  const p = prices[row.model];
  if (!p) return { estimated_cost: null, currency: prices._currency ?? null };
  const input = Number(row.input_tokens ?? 0);
  const cached = Number(row.cached_input_tokens ?? 0);
  const output = Number(row.output_tokens ?? 0);
  // price table units are per-1M tokens by convention; owner supplies the numbers + currency.
  const cost = ((input - cached) * (p.input ?? 0) + cached * (p.cached_input ?? p.input ?? 0) + output * (p.output ?? 0)) / 1_000_000;
  return { estimated_cost: Number(cost.toFixed(6)), currency: prices._currency ?? null };
}

async function runLive() {
  const edgeUrl = requireEnv('BENCHMARK_EDGE_URL');
  const jwt = requireEnv('BENCHMARK_JWT');
  const serviceKey = requireEnv('BENCHMARK_SERVICE_KEY');
  const supabaseUrl = requireEnv('BENCHMARK_SUPABASE_URL');
  const prices = loadPrices();

  const rows = [];
  let seq = 0;
  for (const p of PLAN) {
    for (const turns of TURN_COUNTS) {
      const item = p.items[0]; // representative fixture per (workload, turns)
      let conversationId;
      const context = [];
      for (let turn = 1; turn <= turns; turn++) {
        seq += 1;
        const isCompat = p.workload === 'compatibility';
        const isWhy = p.workload === 'whyFollowUp' && turn === turns;
        const question = isWhy ? item.question : (item.primer ?? item.question);
        const payload = {
          question,
          birthInput: fixtures.syntheticSelf,
          ...(isCompat ? { consultationMode: 'compatibility', targetSource: 'RAW_UNSAVED', partnerBirthInput: fixtures.syntheticPartner } : {}),
          ...(conversationId ? { conversationId } : {}),
          conversationContext: context.slice(-6),
        };
        const started = Date.now();
        const { requestId, status } = await sendTurn(edgeUrl, jwt, { _benchId: `${p.workload}-${turns}-${turn}-${seq}`, payload });
        const latency_ms = Date.now() - started;
        const usage = status === 200 ? await readUsage(supabaseUrl, serviceKey, requestId) : null;
        const cost = usage ? estimateCost(prices, usage) : { estimated_cost: null, currency: null };
        rows.push({
          workload: p.workload,
          model: usage?.model ?? null,
          turn_number: turn,
          input_tokens: usage?.input_tokens ?? null,
          cached_tokens: usage?.cached_input_tokens ?? null,
          output_tokens: usage?.output_tokens ?? null,
          total_tokens: usage?.total_tokens ?? null,
          latency_ms,
          estimated_cost: cost.estimated_cost,
          currency: cost.currency,
          timestamp: new Date().toISOString(),
          prompt_version: usage?.prompt_version ?? null,
          engine_version: usage?.engine_version ?? null,
          http_status: status,
        });
        context.push({ role: 'user', content: question });
      }
    }
  }
  const out = resolve(HERE, 'benchmark-results.json');
  writeFileSync(out, JSON.stringify(rows, null, 2));
  const header = Object.keys(rows[0] ?? { workload: 1 }).join(',');
  const csv = [header, ...rows.map((r) => Object.values(r).map((v) => (v === null ? '' : v)).join(','))].join('\n');
  writeFileSync(resolve(HERE, 'benchmark-results.csv'), csv);
  console.log(`LIVE benchmark complete — ${rows.length} rows → scripts/benchmark/benchmark-results.{json,csv}`);
}

if (!LIVE) {
  printPlan();
  console.log('BENCHMARK_HARNESS_READY');
  console.log('LIVE_BENCHMARK_NOT_EXECUTED  (pass --live with the documented env to run; it spends real LLM money)');
} else {
  runLive().catch((e) => { console.error('benchmark failed:', e.message); process.exit(1); });
}
