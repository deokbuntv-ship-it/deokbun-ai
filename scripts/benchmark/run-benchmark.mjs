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
  console.log('\nMeasured fields/row: workload, model, session_index, turn_number, input/cached/output/reasoning/');
  console.log('total_tokens, latency_ms, estimated_usd, estimated_krw, currency, fx_rate_used, pricing_as_of,');
  console.log('timestamp, prompt_version, routing_policy_version, engine_version.\n');
  console.log('Analysis: cache_hit_ratio + session cost (1/3/5) + incremental cost/turn + economy recommendation.');
  console.log('Token source: the Edge\'s own ai_usage_logs rows (real usage), joined by request_id.');
  const prices = loadPrices();
  const fx = fxRate();
  console.log(`Pricing: ${prices ? `${prices.pricing_source} (as_of ${prices.pricing_as_of})` : 'NONE'} · FX (KRW/USD): ${fx ?? 'unset (BENCHMARK_FX_KRW_PER_USD)'}.`);
  console.log('Premium Report: PREMIUM_LLM_PATH_NOT_YET_AVAILABLE (deterministic composer; no LLM path yet).\n');
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
  // Default to the official Sprint G pricing metadata (benchmark-only, never business logic).
  const p = path ? resolve(path) : resolve(HERE, 'pricing.official.json');
  try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; }
}

// FX is a runtime-configurable input (§D): BENCHMARK_FX_KRW_PER_USD (KRW per 1 USD). Null when unset.
function fxRate() {
  const v = Number(process.env.BENCHMARK_FX_KRW_PER_USD);
  return Number.isFinite(v) && v > 0 ? v : null;
}

function estimateCost(prices, row, fx) {
  if (!prices) return { estimated_usd: null, estimated_krw: null, currency: null, fx_rate_used: fx, pricing_as_of: null };
  const p = prices[row.model];
  const pricing_as_of = prices.pricing_as_of ?? null;
  if (!p) return { estimated_usd: null, estimated_krw: null, currency: prices._currency ?? null, fx_rate_used: fx, pricing_as_of };
  const input = Number(row.input_tokens ?? 0);
  const cached = Number(row.cached_input_tokens ?? 0);
  const output = Number(row.output_tokens ?? 0);
  // per-1M-token prices; cached input is billed at the cached rate, uncached at the full rate.
  const usd = ((input - cached) * (p.input ?? 0) + cached * (p.cached_input ?? p.input ?? 0) + output * (p.output ?? 0)) / 1_000_000;
  const estimated_usd = Number(usd.toFixed(6));
  return {
    estimated_usd,
    estimated_krw: fx ? Math.round(usd * fx * 100) / 100 : null,
    currency: prices._currency ?? 'USD',
    fx_rate_used: fx,
    pricing_as_of,
  };
}

async function runLive() {
  const edgeUrl = requireEnv('BENCHMARK_EDGE_URL');
  const jwt = requireEnv('BENCHMARK_JWT');
  const serviceKey = requireEnv('BENCHMARK_SERVICE_KEY');
  const supabaseUrl = requireEnv('BENCHMARK_SUPABASE_URL');
  const prices = loadPrices();
  const fx = fxRate();

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
        const cost = estimateCost(prices, usage ?? { model: null }, fx);
        rows.push({
          workload: p.workload,
          model: usage?.model ?? null,
          session_index: `${p.workload}-${turns}`,
          turn_number: turn,
          input_tokens: usage?.input_tokens ?? null,
          cached_input_tokens: usage?.cached_input_tokens ?? null,
          output_tokens: usage?.output_tokens ?? null,
          reasoning_tokens: usage?.reasoning_tokens ?? null,
          total_tokens: usage?.total_tokens ?? null,
          latency_ms,
          estimated_usd: cost.estimated_usd,
          estimated_krw: cost.estimated_krw,
          currency: cost.currency,
          fx_rate_used: cost.fx_rate_used,
          pricing_as_of: cost.pricing_as_of,
          timestamp: new Date().toISOString(),
          prompt_version: usage?.prompt_version ?? null,
          routing_policy_version: usage?.routing_policy_version ?? null,
          engine_version: usage?.engine_version ?? null,
          http_status: status,
        });
        context.push({ role: 'user', content: question });
      }
    }
  }
  const analysis = analyze(rows);
  writeFileSync(resolve(HERE, 'benchmark-results.json'), JSON.stringify({ rows, analysis }, null, 2));
  const header = Object.keys(rows[0] ?? { workload: 1 }).join(',');
  const csv = [header, ...rows.map((r) => Object.values(r).map((v) => (v === null ? '' : v)).join(','))].join('\n');
  writeFileSync(resolve(HERE, 'benchmark-results.csv'), csv);
  console.log(`LIVE benchmark complete — ${rows.length} rows → scripts/benchmark/benchmark-results.{json,csv}`);
  console.log(JSON.stringify(analysis, null, 2));
}

// §K/§M — caching analysis + session cost + economy recommendation from MEASURED rows.
function analyze(rows) {
  const bySession = {};
  for (const r of rows) {
    (bySession[r.session_index] ??= []).push(r);
  }
  const sessions = Object.entries(bySession).map(([key, turns]) => {
    const input = turns.reduce((n, t) => n + (t.input_tokens ?? 0), 0);
    const cached = turns.reduce((n, t) => n + (t.cached_input_tokens ?? 0), 0);
    const usd = turns.reduce((n, t) => n + (t.estimated_usd ?? 0), 0);
    const krw = turns.reduce((n, t) => n + (t.estimated_krw ?? 0), 0);
    const incremental_usd = turns.map((t) => t.estimated_usd);
    return {
      session_index: key,
      workload: turns[0]?.workload,
      model: turns[0]?.model,
      turns: turns.length,
      cache_hit_ratio: input > 0 ? Number((cached / input).toFixed(4)) : null,
      session_usd: Number(usd.toFixed(6)),
      session_krw: krw ? Number(krw.toFixed(2)) : null,
      incremental_usd_per_turn: incremental_usd,
    };
  });
  // Economy recommendation: needs both a general (5 Duk) and a compatibility (12 Duk) measured session.
  const gen = sessions.find((s) => s.workload === 'general' && s.turns >= 5) || sessions.find((s) => s.workload === 'general');
  const compat = sessions.find((s) => s.workload === 'compatibility' && s.turns >= 5) || sessions.find((s) => s.workload === 'compatibility');
  const recommendation = (gen && gen.session_usd > 0 && compat && compat.session_usd > 0)
    ? { general_5duk: recForCost(gen.session_usd), compatibility_12duk: recForCost(compat.session_usd) }
    : 'INSUFFICIENT_DATA';
  return { sessions, economy_recommendation: recommendation, note: 'DUK prices are policy values; this is advisory only (owner decides).' };
}
// Advisory only: compares measured provider cost against the Duk price hypothesis (Duk≈KRW is NOT assumed;
// the owner sets the KRW/Duk from packs). Emits a coarse KEEP/REVIEW flag on the raw USD cost magnitude.
function recForCost(usd) {
  // Coarse thresholds on provider cost per session (USD): guardrails only, not a pricing decision.
  if (usd < 0.02) return 'KEEP';
  if (usd < 0.10) return 'REVIEW';
  return 'REVIEW_UP';
}

if (!LIVE) {
  printPlan();
  console.log('BENCHMARK_HARNESS_READY');
  // §L — no live run here (no local key; a live run spends money + hits an external provider = owner-gated).
  console.log('LIVE_BENCHMARK_BLOCKED_EXTERNAL  (pass --live with BENCHMARK_EDGE_URL/JWT/SERVICE_KEY/SUPABASE_URL to run)');
  console.log('ECONOMY_RECOMMENDATION: INSUFFICIENT_DATA  (needs a live run to measure real tokens)');
} else {
  runLive().catch((e) => { console.error('benchmark failed:', e.message); process.exit(1); });
}
