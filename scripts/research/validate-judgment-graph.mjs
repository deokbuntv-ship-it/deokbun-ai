#!/usr/bin/env node
// S2/S3 judgment-graph validator — RESEARCH TOOLING, NOT PRODUCTION.
// Nothing in data/myungri-strength-v2/ or docs/myungri-strength-v2/ is imported by the application.
//
//   node scripts/research/validate-judgment-graph.mjs
//
// Exits non-zero on any violation.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const GRAPH_PATH = join(HERE, '..', '..', 'data', 'myungri-strength-v2', 'judgment-graph-v2.json');
const graph = JSON.parse(readFileSync(GRAPH_PATH, 'utf8'));

const ALLOWED_NODE_TYPES = new Set([
  'FACT_CHECK', 'INFERENCE', 'BRANCH', 'SPECIAL_SCREEN',
  'TASK_CAPACITY', 'STRUCTURAL_SYNTHESIS', 'STRENGTH_VIEW', 'UNCERTAINTY_EXIT',
]);

const REQUIRED_FIELDS = [
  'NODE_ID', 'NODE_TYPE', 'QUESTION', 'INPUT_FACTS', 'REQUIRED_INFERENCES',
  'POSITIVE_CONDITIONS', 'COUNTEREVIDENCE', 'SCHOOL_SCOPE', 'SUPPORTING_SOURCE_PROPOSITIONS',
  'SUPPORTING_CASE_IDS', 'COUNTEREXAMPLE_CASE_IDS', 'OUTPUT', 'UNCERTAINTY_EXIT',
  'NEXT_NODES', 'DOES_NOT_IMPLY',
];

const ALLOWED_SCHOOL_SCOPES = new Set(['CANONICAL', 'CANONICAL_WITH_SCOPE', 'SCHOOL_SENSITIVE', 'DEFERRED', 'RESEARCH_ONLY']);

const PROHIBITED_FIELD_NAMES = new Set(
  (graph.PROHIBITED_FIELDS ?? []).map((f) => f.toLowerCase())
);

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

// ── every SUPPORTING_CASE_IDS / COUNTEREXAMPLE_CASE_IDS entry is non-empty string ─
for (const node of graph.NODES) {
  for (const field of ['SUPPORTING_CASE_IDS', 'COUNTEREXAMPLE_CASE_IDS']) {
    const arr = node[field];
    if (arr && !Array.isArray(arr)) warn(`${node.NODE_ID}: ${field} must be an array`);
  }
}

function report() {
  if (errors.length > 0) {
    console.error(`JUDGMENT GRAPH VALIDATION FAILED — ${errors.length} issue(s):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log(`JUDGMENT GRAPH VALIDATION PASSED — ${graph.NODES.length} nodes, ${reachable.size} reachable, ${exitNodes.length} UNCERTAINTY_EXIT node(s).`);
  process.exit(0);
}

report();
