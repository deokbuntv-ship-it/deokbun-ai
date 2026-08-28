#!/usr/bin/env node
// V2 research corpus validator — RESEARCH TOOLING, NOT PRODUCTION.
// Nothing in data/myungri-strength-v2/ is imported by the application.
//
//   node data/myungri-strength-v2/validate-corpus.mjs
//
// Exits non-zero on any violation.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const cases = JSON.parse(readFileSync(join(HERE, 'discovery-cases.json'), 'utf8'));
const sources = JSON.parse(readFileSync(join(HERE, 'sources.json'), 'utf8'));

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const SOURCE_TIERS = ['A', 'B', 'C', 'D', 'E'];
const TEXT_LAYERS = ['ORIGINAL_TEXT', 'YUANZHU', 'NAMED_COMMENTARY', 'NAMED_SCHOOL', 'MODERN_SYSTEMATIZATION'];
const GRADES = ['A', 'B', 'C', 'D'];
const GOLD = ['GOLD_ELIGIBLE', 'RESEARCH_ONLY', 'CONFLICT_CASE', 'INSUFFICIENT', 'NEGATIVE_REFERENCE'];
const REVIEW = ['EXTRACTED', 'SOURCE_VERIFIED', 'CHART_VERIFIED', 'NORMALIZATION_REVIEWED', 'DOUBLE_REVIEWED', 'HOLDOUT_RESERVED'];
const LABELS = [
  'SOURCE_WEAK', 'SOURCE_STRONG', 'SOURCE_BALANCED',
  'SOURCE_EXTREME_WEAK', 'SOURCE_EXTREME_STRONG',
  'SOURCE_FOLLOWING_PATTERN', 'SOURCE_SPECIAL_STRUCTURE',
  'SOURCE_UNCERTAIN', 'SOURCE_NOT_EXPLICIT',
];
const RECORD_ROLES = ['PRIMARY_CASE', 'DERIVED_REPRINT', 'COMMENTARY_VARIANT'];
const PROVENANCE = ['HIGH', 'MEDIUM', 'LOW'];
const NORMALIZATION_PROVENANCE = ['LLM_ASSISTED_UNREVIEWED', 'MAIN_SESSION_REVIEWED', 'FOUNDER_REVIEWED'];

const errors = [];
const warnings = [];
const err = (id, m) => errors.push(`[${id}] ${m}`);
const warn = (id, m) => warnings.push(`[${id}] ${m}`);

const sourceIds = new Set(sources.map((s) => s.SOURCE_ID));
const seenCaseIds = new Set();
const chartIndex = new Map();

/** A pillar is exactly one stem + one branch, or null when the source omits it. */
function checkPillar(id, field, value) {
  if (value === null) return; // legitimately absent — never reconstructed
  if (typeof value !== 'string' || [...value].length !== 2) {
    err(id, `${field}: expected 2 characters, got ${JSON.stringify(value)}`);
    return;
  }
  const [stem, branch] = [...value];
  if (!STEMS.includes(stem)) err(id, `${field}: '${stem}' is not one of the 10 Heavenly Stems`);
  if (!BRANCHES.includes(branch)) err(id, `${field}: '${branch}' is not one of the 12 Earthly Branches`);
}

for (const c of cases) {
  const id = c.CASE_ID ?? '<missing CASE_ID>';

  // identity
  if (!c.CASE_ID) err(id, 'missing CASE_ID');
  if (seenCaseIds.has(c.CASE_ID)) err(id, 'duplicate CASE_ID');
  seenCaseIds.add(c.CASE_ID);
  if (!c.CHART_CASE_ID) err(id, 'missing CHART_CASE_ID');
  if (!RECORD_ROLES.includes(c.RECORD_ROLE)) err(id, `RECORD_ROLE invalid: ${c.RECORD_ROLE}`);

  // source
  if (!sourceIds.has(c.SOURCE_ID)) err(id, `SOURCE_ID '${c.SOURCE_ID}' not found in sources.json`);
  if (!SOURCE_TIERS.includes(c.SOURCE_TIER)) err(id, `SOURCE_TIER invalid: ${c.SOURCE_TIER}`);
  if (!TEXT_LAYERS.includes(c.SOURCE_TEXT_LAYER)) err(id, `SOURCE_TEXT_LAYER invalid: ${c.SOURCE_TEXT_LAYER}`);
  if (!c.AUTHOR_OR_COMMENTATOR) err(id, 'missing AUTHOR_OR_COMMENTATOR — a counted case may never be anonymous');
  if (!c.SOURCE_LOCATION) err(id, 'missing SOURCE_LOCATION');
  if (!c.SOURCE_URL_OR_BIBLIOGRAPHIC_LOCATION) err(id, 'missing source location/URL');

  // chart
  checkPillar(id, 'CHART_YEAR', c.CHART_YEAR);
  checkPillar(id, 'CHART_MONTH', c.CHART_MONTH);
  checkPillar(id, 'CHART_DAY', c.CHART_DAY);
  checkPillar(id, 'CHART_HOUR', c.CHART_HOUR);
  if (c.SEX_IF_GIVEN && !['乾造', '坤造', 'NOT_STATED'].includes(c.SEX_IF_GIVEN)) {
    err(id, `SEX_IF_GIVEN invalid: ${c.SEX_IF_GIVEN} (never inferred)`);
  }

  // THE SEPARATION RULE — both sides must exist independently
  if (!c.ORIGINAL_JUDGMENT_TEXT) err(id, 'missing ORIGINAL_JUDGMENT_TEXT (verbatim source text is mandatory)');
  if (!c.V2_NORMALIZED_STRUCTURAL_LABEL) err(id, 'missing V2_NORMALIZED_STRUCTURAL_LABEL');
  if (c.V2_NORMALIZED_STRUCTURAL_LABEL && !LABELS.includes(c.V2_NORMALIZED_STRUCTURAL_LABEL)) {
    err(id, `V2_NORMALIZED_STRUCTURAL_LABEL not in the conservative S1 vocabulary: ${c.V2_NORMALIZED_STRUCTURAL_LABEL}`);
  }
  // seven-band leakage guard
  const banned = ['극신약', '신약', '중화신약', '중화', '중화신강', '신강', '극신강', 'CAN_BEAR', 'CANNOT_BEAR', 'WEAK', 'BALANCED', 'STRONG'];
  for (const b of banned) {
    if (c.V2_NORMALIZED_STRUCTURAL_LABEL === b) err(id, `label '${b}' is a withdrawn V1 verdict, not an S1 normalization`);
  }

  // quality
  if (!GRADES.includes(c.GRADE)) err(id, `GRADE invalid: ${c.GRADE}`);
  if (!GOLD.includes(c.GOLD_LABEL_STATUS)) err(id, `GOLD_LABEL_STATUS invalid: ${c.GOLD_LABEL_STATUS}`);
  if (!REVIEW.includes(c.REVIEW_STATUS)) err(id, `REVIEW_STATUS invalid: ${c.REVIEW_STATUS}`);
  if (!PROVENANCE.includes(c.PROVENANCE_CONFIDENCE)) err(id, `PROVENANCE_CONFIDENCE invalid: ${c.PROVENANCE_CONFIDENCE}`);
  if (!NORMALIZATION_PROVENANCE.includes(c.NORMALIZATION_PROVENANCE)) {
    err(id, `NORMALIZATION_PROVENANCE invalid: ${c.NORMALIZATION_PROVENANCE}`);
  }

  // gold-label discipline
  if (c.GOLD_LABEL_STATUS === 'GOLD_ELIGIBLE' && !['A', 'B'].includes(c.GRADE)) {
    err(id, `GOLD_ELIGIBLE requires GRADE A or B, got ${c.GRADE}`);
  }
  if (c.GOLD_LABEL_STATUS === 'GOLD_ELIGIBLE' && c.NORMALIZATION_PROVENANCE === 'LLM_ASSISTED_UNREVIEWED') {
    err(id, 'GOLD_ELIGIBLE may not rest on an unreviewed LLM normalization');
  }

  // synthetic must never be counted as real
  if (c.IS_SYNTHETIC === true) err(id, 'synthetic case present in the real-case corpus');

  // review floor for S1
  if (c.RECORD_ROLE === 'PRIMARY_CASE' && c.REVIEW_STATUS === 'EXTRACTED') {
    warn(id, 'still EXTRACTED — S1 target is at least SOURCE_VERIFIED + CHART_VERIFIED');
  }

  // duplicate chart detection
  const fp = [c.CHART_YEAR, c.CHART_MONTH, c.CHART_DAY, c.CHART_HOUR].join('');
  if (!chartIndex.has(fp)) chartIndex.set(fp, []);
  chartIndex.get(fp).push(c.CASE_ID);
}

// cross-record duplicate reporting
const dupes = [...chartIndex.entries()].filter(([, ids]) => ids.length > 1);
for (const [fp, ids] of dupes) {
  const roles = ids.map((i) => cases.find((c) => c.CASE_ID === i).RECORD_ROLE);
  if (roles.filter((r) => r === 'PRIMARY_CASE').length > 1) {
    err(ids.join('+'), `same chart ${fp} recorded as PRIMARY_CASE more than once — one must be DERIVED_REPRINT or COMMENTARY_VARIANT`);
  }
}

// ── report ──────────────────────────────────────────────────────────────────
const primary = cases.filter((c) => c.RECORD_ROLE === 'PRIMARY_CASE');
const uniqueCharts = new Set(cases.map((c) => [c.CHART_YEAR, c.CHART_MONTH, c.CHART_DAY, c.CHART_HOUR].join('')));
const by = (f) => cases.reduce((a, c) => ((a[c[f]] = (a[c[f]] ?? 0) + 1), a), {});

console.log('=== V2 DISCOVERY CORPUS VALIDATION ===');
console.log(`records            : ${cases.length}`);
console.log(`PRIMARY_CASE       : ${primary.length}`);
console.log(`unique charts      : ${uniqueCharts.size}`);
console.log(`sources registered : ${sources.length}`);
console.log(`grade              : ${JSON.stringify(by('GRADE'))}`);
console.log(`gold status        : ${JSON.stringify(by('GOLD_LABEL_STATUS'))}`);
console.log(`source tier        : ${JSON.stringify(by('SOURCE_TIER'))}`);
console.log(`normalized label   : ${JSON.stringify(by('V2_NORMALIZED_STRUCTURAL_LABEL'))}`);
console.log(`duplicate charts   : ${dupes.length}`);

if (warnings.length) {
  console.log(`\n--- ${warnings.length} warning(s) ---`);
  warnings.forEach((w) => console.log('  ' + w));
}
if (errors.length) {
  console.log(`\n--- ${errors.length} ERROR(S) ---`);
  errors.forEach((e) => console.log('  ' + e));
  console.log('\nVALIDATION = FAIL');
  process.exit(1);
}
console.log('\nVALIDATION = PASS');
