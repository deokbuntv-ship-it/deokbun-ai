#!/usr/bin/env node
// S2/S3 judgment-graph validator — RESEARCH TOOLING, NOT PRODUCTION.
// Nothing in data/myungri-strength-v2/ or docs/myungri-strength-v2/ is imported by the application.
//
// Strengthened for the P0 remediation batch (Codex audit 2026-08-28, §44): checks unknown
// states/predicates, broken edges, unreachable outputs, dead output enums (best-effort — every
// value listed in a node's OUTPUT.values must be asserted by at least one REQUIRED_INFERENCES
// string somewhere in the graph), numeric verdict predicates, threshold/vote/majority language
// via a deny-list, case IDs appearing inside conditions instead of reference lists, LLM authority,
// and cross-references SOURCE_IDS/SUPPORTING_CASE_IDS/COUNTEREXAMPLE_CASE_IDS against the real
// corpus so a stale or invented reference fails loudly (P1-04 — these are now separate namespaces,
// not composite strings).
//
//   node scripts/research/validate-judgment-graph.mjs
//
// Exits non-zero on any violation.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(HERE, '..', '..', 'data', 'myungri-strength-v2');
const graph = JSON.parse(readFileSync(join(DATA_DIR, 'judgment-graph-v2.json'), 'utf8'));

let discoveryCases = [];
let bridgeCases = [];
let sources = [];
try { discoveryCases = JSON.parse(readFileSync(join(DATA_DIR, 'discovery-cases.json'), 'utf8')); } catch { /* optional cross-check */ }
try { bridgeCases = JSON.parse(readFileSync(join(DATA_DIR, 'bridge-cases.json'), 'utf8')); } catch { /* optional cross-check */ }
try { sources = JSON.parse(readFileSync(join(DATA_DIR, 'sources.json'), 'utf8')); } catch { /* optional cross-check */ }

const KNOWN_CASE_IDS = new Set([
  ...discoveryCases.map((c) => c.CASE_ID),
  ...bridgeCases.map((b) => b.BRIDGE_ID),
]);
const KNOWN_SOURCE_IDS = new Set(sources.map((s) => s.SOURCE_ID ?? s.sourceId).filter(Boolean));

const ALLOWED_NODE_TYPES = new Set([
  'FACT_CHECK', 'INFERENCE', 'BRANCH', 'SPECIAL_SCREEN',
  'TASK_CAPACITY', 'STRUCTURAL_SYNTHESIS', 'STRENGTH_VIEW', 'UNCERTAINTY_EXIT',
]);

const REQUIRED_FIELDS = [
  'NODE_ID', 'NODE_TYPE', 'QUESTION', 'INPUT_FACTS', 'REQUIRED_INFERENCES',
  'POSITIVE_CONDITIONS', 'COUNTEREVIDENCE', 'SCHOOL_SCOPE',
  'SOURCE_IDS', 'PROPOSITION_IDS', 'SUPPORTING_CASE_IDS', 'COUNTEREXAMPLE_CASE_IDS',
  'OUTPUT', 'UNCERTAINTY_EXIT', 'NEXT_NODES', 'DOES_NOT_IMPLY',
];

const ALLOWED_SCHOOL_SCOPES = new Set(['CANONICAL', 'CANONICAL_WITH_SCOPE', 'SCHOOL_SENSITIVE', 'DEFERRED', 'RESEARCH_ONLY']);

const PROHIBITED_FIELD_NAMES = new Set((graph.PROHIBITED_FIELDS ?? []).map((f) => f.toLowerCase()));

// §44/§9/§4: deny-list for prose predicates that smuggle in hidden numeric/vote authority or an
// undefined universal gate. Matched case-insensitively against every string value in the graph
// EXCEPT inside DOES_NOT_IMPLY / COUNTEREVIDENCE / QUESTION, where naming the forbidden pattern to
// explain why it was rejected is the whole point of those fields (and is how this file itself
// documents the fix) — flagging those would just penalize honesty about what was removed.
const DENY_LIST_FIELDS = new Set(['REQUIRED_INFERENCES', 'POSITIVE_CONDITIONS']);
const DENY_LIST_TERMS = (graph.PROHIBITED_PREDICATE_TERMS ?? []).map((t) => t.toLowerCase());
const LLM_AUTHORITY_PATTERN = /\bllm\b.*(decide|judge|verdict|classif)/i;
const CASE_ID_IN_CONDITION_PATTERN = /\bif\s+(chart|case)\s*(===|==)\s*['"]?[A-Z]{2,}-/i;
const ROOT_UNIVERSAL_GATE_PATTERN = /root[_\s]present\s*(=>|⇒|implies)\s*not[_\s]following/i;

const errors = [];
const warn = (msg) => errors.push(msg);

if (!Array.isArray(graph.NODES) || graph.NODES.length === 0) {
  warn('NODES must be a non-empty array');
  report();
}

// ── unique node IDs ─────────────────────────────────────────────────────────
const seenIds = new Set();
const nodesById = new Map();
for (const node of graph.NODES) {
  if (!node.NODE_ID) { warn(`node missing NODE_ID: ${JSON.stringify(node).slice(0, 80)}`); continue; }
  if (seenIds.has(node.NODE_ID)) warn(`duplicate NODE_ID: ${node.NODE_ID}`);
  seenIds.add(node.NODE_ID);
  nodesById.set(node.NODE_ID, node);
}

// ── required fields + types ─────────────────────────────────────────────────
for (const node of graph.NODES) {
  const id = node.NODE_ID ?? '<unknown>';
  for (const field of REQUIRED_FIELDS) {
    if (!(field in node)) warn(`${id}: missing required field ${field}`);
  }
  if (node.NODE_TYPE && !ALLOWED_NODE_TYPES.has(node.NODE_TYPE)) {
    warn(`${id}: invalid NODE_TYPE '${node.NODE_TYPE}'`);
  }
  if (node.SCHOOL_SCOPE && !ALLOWED_SCHOOL_SCOPES.has(node.SCHOOL_SCOPE)) {
    warn(`${id}: invalid SCHOOL_SCOPE '${node.SCHOOL_SCOPE}'`);
  }
}

// ── entry node exists ───────────────────────────────────────────────────────
if (!graph.ENTRY_NODE || !nodesById.has(graph.ENTRY_NODE)) {
  warn(`ENTRY_NODE '${graph.ENTRY_NODE}' does not resolve to a real node`);
}

// ── edges resolve; orphan detection via reachability from ENTRY_NODE ───────
// NEXT_NODES entries may carry parenthetical routing notes (e.g. "ORD-01 (if NONE_DETECTED...)")
// — only the leading token before whitespace/paren is the actual node-id reference.
function extractNodeIds(nextNodesField) {
  return (nextNodesField ?? [])
    .map((entry) => String(entry).split(/[\s(]/)[0].trim())
    .filter(Boolean);
}

for (const node of graph.NODES) {
  const id = node.NODE_ID ?? '<unknown>';
  for (const rawNext of extractNodeIds(node.NEXT_NODES)) {
    if (!nodesById.has(rawNext)) warn(`${id}: NEXT_NODES references unknown node '${rawNext}'`);
  }
  const routeTo = node.UNCERTAINTY_EXIT?.routeTo;
  if (routeTo) {
    const target = nodesById.get(routeTo);
    if (!target) warn(`${id}: UNCERTAINTY_EXIT.routeTo references unknown node '${routeTo}'`);
    else if (target.NODE_TYPE !== 'UNCERTAINTY_EXIT') {
      warn(`${id}: UNCERTAINTY_EXIT.routeTo '${routeTo}' is not an UNCERTAINTY_EXIT-type node (found ${target.NODE_TYPE})`);
    }
  }
}

const reachable = new Set();
(function walk(id) {
  if (!id || reachable.has(id) || !nodesById.has(id)) return;
  reachable.add(id);
  const node = nodesById.get(id);
  for (const next of extractNodeIds(node.NEXT_NODES)) walk(next);
  if (node.UNCERTAINTY_EXIT?.routeTo) walk(node.UNCERTAINTY_EXIT.routeTo);
})(graph.ENTRY_NODE);

for (const node of graph.NODES) {
  if (!reachable.has(node.NODE_ID)) warn(`orphan node (unreachable from ENTRY_NODE): ${node.NODE_ID}`);
}

// ── at least one UNCERTAINTY_EXIT node exists and is reachable ─────────────
const exitNodes = graph.NODES.filter((n) => n.NODE_TYPE === 'UNCERTAINTY_EXIT');
if (exitNodes.length === 0) warn('graph has no UNCERTAINTY_EXIT node');
if (!exitNodes.some((n) => reachable.has(n.NODE_ID))) warn('no UNCERTAINTY_EXIT node is reachable from ENTRY_NODE');

// ── dead output enums (best-effort): every OUTPUT.values entry must be asserted somewhere ─
const allInferenceText = graph.NODES.flatMap((n) => n.REQUIRED_INFERENCES ?? []).join(' \n ');
for (const node of graph.NODES) {
  const values = node.OUTPUT?.values;
  if (!Array.isArray(values)) continue;
  for (const v of values) {
    if (!allInferenceText.includes(v)) {
      warn(`${node.NODE_ID}: OUTPUT value '${v}' is never referenced by any node's REQUIRED_INFERENCES — possible dead output enum`);
    }
  }
}

// ── prohibited numeric-score fields absent anywhere in the tree ────────────
function scanForProhibited(value, path) {
  if (value == null) return;
  if (typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      if (PROHIBITED_FIELD_NAMES.has(k.toLowerCase())) warn(`prohibited field '${k}' found at ${path}.${k}`);
      scanForProhibited(v, `${path}.${k}`);
    }
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => scanForProhibited(v, `${path}[${i}]`));
  }
}
scanForProhibited(graph.NODES, 'NODES');

// ── deny-list terms in decision-bearing fields only (§44) ──────────────────
for (const node of graph.NODES) {
  for (const field of DENY_LIST_FIELDS) {
    const value = node[field];
    if (!Array.isArray(value)) continue;
    const text = value.join(' \n ').toLowerCase();
    for (const term of DENY_LIST_TERMS) {
      // word-boundary match so 'sufficient' does not false-positive inside 'insufficient',
      // and 'vote'/'weight' etc. do not match inside an unrelated longer word.
      const pattern = new RegExp(`(?<![a-z])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![a-z])`, 'i');
      if (pattern.test(text)) warn(`${node.NODE_ID}.${field}: contains deny-listed predicate term '${term}'`);
    }
    if (LLM_AUTHORITY_PATTERN.test(text)) warn(`${node.NODE_ID}.${field}: possible LLM verdict authority language`);
    if (CASE_ID_IN_CONDITION_PATTERN.test(text)) warn(`${node.NODE_ID}.${field}: possible case-ID memorization (a case ID used as a decision condition instead of a reference)`);
    if (ROOT_UNIVERSAL_GATE_PATTERN.test(text)) warn(`${node.NODE_ID}.${field}: possible universal ROOT_PRESENT=>NOT_FOLLOWING gate (P0-09 required-zero item)`);
  }
}

// ── namespace validation: SOURCE_IDS / SUPPORTING_CASE_IDS / COUNTEREXAMPLE_CASE_IDS (P1-04) ─
for (const node of graph.NODES) {
  for (const field of ['SUPPORTING_CASE_IDS', 'COUNTEREXAMPLE_CASE_IDS']) {
    const arr = node[field];
    if (arr === undefined) continue;
    if (!Array.isArray(arr)) { warn(`${node.NODE_ID}: ${field} must be an array`); continue; }
    if (KNOWN_CASE_IDS.size === 0) continue; // corpus files not found — skip cross-check, don't fail
    for (const caseId of arr) {
      if (!KNOWN_CASE_IDS.has(caseId)) warn(`${node.NODE_ID}.${field}: unknown case ID '${caseId}' (not in discovery-cases.json or bridge-cases.json)`);
    }
  }
  const sourceIds = node.SOURCE_IDS;
  if (Array.isArray(sourceIds) && KNOWN_SOURCE_IDS.size > 0) {
    for (const sid of sourceIds) {
      if (!KNOWN_SOURCE_IDS.has(sid)) warn(`${node.NODE_ID}.SOURCE_IDS: unknown source ID '${sid}' (not in sources.json)`);
    }
  }
  if (node.PROPOSITION_IDS !== undefined && !Array.isArray(node.PROPOSITION_IDS)) {
    warn(`${node.NODE_ID}: PROPOSITION_IDS must be an array`);
  }
  // legacy composite field must not reappear (P1-04 — SRC-001:DTS-... strings are no longer valid)
  if (node.SUPPORTING_SOURCE_PROPOSITIONS !== undefined) {
    warn(`${node.NODE_ID}: legacy composite field SUPPORTING_SOURCE_PROPOSITIONS must not be present — use SOURCE_IDS/PROPOSITION_IDS separately`);
  }
}

function report() {
  if (errors.length > 0) {
    console.error(`JUDGMENT GRAPH VALIDATION FAILED — ${errors.length} issue(s):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log(`JUDGMENT GRAPH VALIDATION PASSED — ${graph.NODES.length} nodes, ${reachable.size} reachable, ${exitNodes.length} UNCERTAINTY_EXIT node(s), ${KNOWN_CASE_IDS.size} known case IDs cross-checked, ${KNOWN_SOURCE_IDS.size} known source IDs cross-checked.`);
  process.exit(0);
}

report();
