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

// ── S1.5 schema v2 ──────────────────────────────────────────────────────────
const CORPUS_SCHEMA_VERSION = 2;
const SOURCE_FAMILIES = [
  'DITIANSHUI', 'ZIPINGZHENQUAN', 'YUANHAIZIPING', 'SANMINGTONGHUI',
  'QIONGTONGBAOJIAN', 'XULEWU', 'OTHER',
];
// PROVISIONAL — derived from the corpus, not frozen. See S2_AXIS_CANDIDATES.md.
const REASONING_FRAMES = [
  'WANGSHUAI', 'GEJU', 'YONGSHEN_FRAME', 'SEASONAL_CLIMATE',
  'SPECIAL_STRUCTURE', 'TASK_CAPACITY', 'MULTI_FRAME', 'OTHER',
];
const QUESTION_DOMAINS = [
  'GLOBAL_WANGSHUAI', 'ROOTING', 'SEASON', 'WEALTH_CAPACITY',
  'OFFICER_KILLING_CAPACITY', 'OUTPUT_CAPACITY', 'RESOURCE_CAPACITY',
  'FOLLOWING_STRUCTURE', 'SPECIAL_STRUCTURE', 'GEJU',
  'YONGSHIN_SELECTION_REFERENCE_ONLY', 'LUCK_RESPONSE',
  'MULTI_DOMAIN', 'UNSPECIFIED', 'UNKNOWN',
];
const DATA_COMPLETENESS = ['COMPLETE', 'PARTIAL', 'CHART_ABSENT', 'INCOMPLETE'];

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

  // ── S1.5 schema v2 fields ────────────────────────────────────────────────
  if (c.CORPUS_SCHEMA_VERSION !== CORPUS_SCHEMA_VERSION) {
    err(id, `CORPUS_SCHEMA_VERSION must be ${CORPUS_SCHEMA_VERSION}, got ${c.CORPUS_SCHEMA_VERSION}`);
  }
  if (!SOURCE_FAMILIES.includes(c.SOURCE_FAMILY)) err(id, `SOURCE_FAMILY invalid: ${c.SOURCE_FAMILY}`);
  if (!REASONING_FRAMES.includes(c.REASONING_FRAME)) err(id, `REASONING_FRAME invalid: ${c.REASONING_FRAME}`);
  if (!QUESTION_DOMAINS.includes(c.QUESTION_DOMAIN)) err(id, `QUESTION_DOMAIN invalid: ${c.QUESTION_DOMAIN}`);
  if (!c.INTERPRETATION_ID) err(id, 'missing INTERPRETATION_ID');
  if (c.DATA_COMPLETENESS && !DATA_COMPLETENESS.includes(c.DATA_COMPLETENESS)) {
    err(id, `DATA_COMPLETENESS invalid: ${c.DATA_COMPLETENESS}`);
  }
  // a modern systematization layer may never be gold
  if (c.SOURCE_TEXT_LAYER === 'MODERN_SYSTEMATIZATION' && c.GOLD_LABEL_STATUS === 'GOLD_ELIGIBLE') {
    err(id, 'MODERN_SYSTEMATIZATION may not be GOLD_ELIGIBLE — it is documented, not authoritative');
  }

  // duplicate chart detection — a doctrine record carries no chart, so it is
  // not a chart and must not collide with other chartless records
  const chartless = c.CHART_YEAR === null && c.CHART_MONTH === null && c.CHART_DAY === null && c.CHART_HOUR === null;
  if (chartless) {
    if (c.DATA_COMPLETENESS !== 'CHART_ABSENT') {
      err(id, 'all four pillars are null but DATA_COMPLETENESS is not CHART_ABSENT');
    }
    continue;
  }
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

const byFamily = cases.reduce((a, c) => ((a[c.SOURCE_FAMILY] = (a[c.SOURCE_FAMILY] ?? 0) + 1), a), {});
const nonDts = cases.filter((c) => c.SOURCE_FAMILY !== 'DITIANSHUI').length;
const topShare = Math.max(...Object.values(byFamily)) / cases.length;

console.log('=== V2 DISCOVERY CORPUS VALIDATION (schema v2) ===');
console.log(`records            : ${cases.length}`);
console.log(`PRIMARY_CASE       : ${primary.length}`);
console.log(`unique charts      : ${uniqueCharts.size}`);
console.log(`sources registered : ${sources.length}`);
console.log(`source families    : ${JSON.stringify(byFamily)}`);
console.log(`non-DITIANSHUI     : ${nonDts}`);
console.log(`top family share   : ${(topShare * 100).toFixed(1)}%  → DIVERSITY_RISK = ${topShare > 0.8 ? 'HIGH' : topShare > 0.6 ? 'MODERATE' : 'LOW'}`);
console.log(`reasoning frame    : ${JSON.stringify(cases.reduce((a, c) => ((a[c.REASONING_FRAME] = (a[c.REASONING_FRAME] ?? 0) + 1), a), {}))}`);
console.log(`grade              : ${JSON.stringify(by('GRADE'))}`);
console.log(`gold status        : ${JSON.stringify(by('GOLD_LABEL_STATUS'))}`);
console.log(`source tier        : ${JSON.stringify(by('SOURCE_TIER'))}`);
console.log(`normalized label   : ${JSON.stringify(by('V2_NORMALIZED_STRUCTURAL_LABEL'))}`);
console.log(`duplicate charts   : ${dupes.length}`);

// ── S1.6 bridge-cases.json validation ───────────────────────────────────────
const BRIDGE_GRADES = ['A', 'B', 'C', 'D', 'REFUTED', 'UNGRADED'];
let bridges = [];
try {
  bridges = JSON.parse(readFileSync(join(HERE, 'bridge-cases.json'), 'utf8'));
} catch {
  warn('bridge-cases.json', 'not found or unparsable — S1.6 bridge validation skipped');
}
if (bridges.length) {
  const seenBridgeIds = new Set();
  for (const b of bridges) {
    const id = b.BRIDGE_ID ?? '<missing BRIDGE_ID>';
    if (!b.BRIDGE_ID) err(id, 'missing BRIDGE_ID');
    if (seenBridgeIds.has(b.BRIDGE_ID)) err(id, 'duplicate BRIDGE_ID');
    seenBridgeIds.add(b.BRIDGE_ID);
    if (!BRIDGE_GRADES.includes(b.BRIDGE_GRADE)) err(id, `BRIDGE_GRADE invalid: ${b.BRIDGE_GRADE}`);
    if (b.CHART_FINGERPRINT !== null) {
      const fp = b.CHART_FINGERPRINT;
      if (typeof fp !== 'string' || [...fp].length !== 8) {
        err(id, `CHART_FINGERPRINT malformed: ${JSON.stringify(fp)}`);
      } else {
        for (let i = 0; i < 8; i += 2) {
          if (!STEMS.includes(fp[i])) err(id, `CHART_FINGERPRINT stem invalid at position ${i}: '${fp[i]}'`);
          if (!BRANCHES.includes(fp[i + 1])) err(id, `CHART_FINGERPRINT branch invalid at position ${i + 1}: '${fp[i + 1]}'`);
        }
      }
    }
    if (b.IS_SYNTHETIC === true) err(id, 'synthetic bridge present — bridges must be real cross-lineage attestations only');
    if (b.RESEARCH_ONLY !== true) err(id, 'RESEARCH_ONLY must be true — no bridge record may claim production authority');
    if ((b.BRIDGE_GRADE === 'A' || b.BRIDGE_GRADE === 'B') && !b.AUTHORITY_A) {
      err(id, 'GRADE A/B bridge missing AUTHORITY_A — a graded bridge may never be anonymous on either side');
    }
    if ((b.BRIDGE_GRADE === 'A' || b.BRIDGE_GRADE === 'B') && !b.AUTHORITY_B) {
      err(id, 'GRADE A/B bridge missing AUTHORITY_B — a graded bridge may never be anonymous on either side');
    }
  }
  const byBridgeGrade = bridges.reduce((a, b) => ((a[b.BRIDGE_GRADE] = (a[b.BRIDGE_GRADE] ?? 0) + 1), a), {});
  console.log(`\n=== S1.6 BRIDGE-CASES VALIDATION ===`);
  console.log(`bridges            : ${bridges.length}`);
  console.log(`by grade           : ${JSON.stringify(byBridgeGrade)}`);
  console.log(`main-session spot-verified : ${bridges.filter((b) => b.MAIN_SESSION_SPOT_VERIFIED).length}`);
}

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
