#!/usr/bin/env node
// MYUNGRI V2 — chart fingerprint + query-variant generator.
// RESEARCH TOOLING. Not imported by the application; nothing under src/ references it.
//
//   node scripts/research/chart-fingerprint.mjs            # priority list for bridge hunting
//   node scripts/research/chart-fingerprint.mjs --all      # every chart
//   node scripts/research/chart-fingerprint.mjs --test     # self-check
//
// Purpose: turn a corpus chart into the exact-string variants a search needs,
// so the same chart can be looked for across differently-typeset sources.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORPUS = join(HERE, '..', '..', 'data', 'myungri-strength-v2', 'discovery-cases.json');

// Traditional/simplified pairs that actually occur in stem/branch context or in
// the surrounding chart furniture. Deliberately NOT a general converter — we
// never fuzzy-match the stems and branches themselves.
const T2S = { 時: '时', 乾: '乾', 坤: '坤', 造: '造', 年: '年', 月: '月', 日: '日' };

/** Strip everything that varies by typesetting, keep the 8 chart characters. */
export function normalize(raw) {
  return String(raw)
    .replace(/[\s　]/g, '')
    .replace(/[，,、。．.；;：:｜|／/\-—–_()（）\[\]【】《》〈〉"'"'`]/g, '')
    .replace(/[年月日時时柱造乾坤]/g, '');
}

/** Canonical 8-character fingerprint, or null if the chart is incomplete. */
export function fingerprint(c) {
  const p = [c.CHART_YEAR, c.CHART_MONTH, c.CHART_DAY, c.CHART_HOUR];
  if (p.some((x) => !x)) return null;
  const fp = normalize(p.join(''));
  return [...fp].length === 8 ? fp : null;
}

/** Exact-string search variants for one chart. Order = search priority. */
export function queryVariants(c) {
  const [y, m, d, h] = [c.CHART_YEAR, c.CHART_MONTH, c.CHART_DAY, c.CHART_HOUR];
  if (!y || !m || !d || !h) return [];
  const v = [
    `${y}${m}${d}${h}`,
    `${y} ${m} ${d} ${h}`,
    `${y}、${m}、${d}、${h}`,
    `${y}，${m}，${d}，${h}`,
    `${y}年${m}月${d}日${h}時`,
    `${y}年${m}月${d}日${h}时`,
    `乾造 ${y} ${m} ${d} ${h}`,
    `${h}${d}${m}${y}`, // right-to-left presentation (窮通寶鑑 時日月年 tables)
  ];
  // sex-marked variant only where the corpus actually states sex
  if (c.SEX_IF_GIVEN === '坤造') v.push(`坤造 ${y} ${m} ${d} ${h}`);
  return [...new Set(v)];
}

/**
 * Bridge-hunting priority. Charts likelier to have been reused by later authors
 * score higher. This ranks SEARCH ORDER only — it asserts nothing about the chart.
 */
export function bridgePriority(c) {
  let s = 0;
  const t = c.ORIGINAL_JUDGMENT_TEXT || '';
  const pat = c.V2_SPECIAL_PATTERN_STATUS || '';
  // named historical subject → far likelier to be re-discussed
  if (/命$|造$|公|相|尚書|侍郎|狀元|參政|總兵|提督|丞相|閣老|都督|太保|真人/.test(t + (c.SOURCE_LOCATION || ''))) s += 5;
  if ((c.TAGS || []).includes('AUTHOR_SELF_CHART')) s += 6;
  // special / following patterns are the highest-value bridge target (§18)
  if (/從|从|獨象|從革|潤下|炎上|稼穡|曲直/.test(pat)) s += 4;
  if ((c.TAGS || []).includes('ROOTED_CONGER_CANDIDATE')) s += 3; // R11 test material
  // structurally striking charts get quoted more
  const fp = fingerprint(c);
  if (fp) {
    const branches = [...fp].filter((_, i) => i % 2 === 1);
    const stems = [...fp].filter((_, i) => i % 2 === 0);
    if (new Set(branches).size === 1) s += 4; // all four branches identical
    if (new Set(stems).size === 1) s += 4; // all four stems identical
    if (new Set([...fp]).size <= 4) s += 2;
  }
  if ((c.TAGS || []).includes('CROSS_LINEAGE_SAME_CHART')) s += 5;
  if ((c.TAGS || []).includes('ANTI_CALCULATOR')) s += 1;
  return s;
}

// ── self-check (§45) ────────────────────────────────────────────────────────
function test() {
  const eq = (a, b, m) => {
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      console.error(`FAIL ${m}\n  got      ${JSON.stringify(a)}\n  expected ${JSON.stringify(b)}`);
      process.exitCode = 1;
    } else console.log(`ok   ${m}`);
  };
  eq(normalize('庚申 乙酉 庚戌 庚辰'), '庚申乙酉庚戌庚辰', 'spaces stripped');
  eq(normalize('庚申、乙酉、庚戌、庚辰'), '庚申乙酉庚戌庚辰', 'ideographic commas stripped');
  eq(normalize('庚申年乙酉月庚戌日庚辰時'), '庚申乙酉庚戌庚辰', 'pillar labels stripped (trad)');
  eq(normalize('庚申年乙酉月庚戌日庚辰时'), '庚申乙酉庚戌庚辰', 'pillar labels stripped (simp)');
  eq(normalize('乾造 庚申 乙酉 庚戌 庚辰'), '庚申乙酉庚戌庚辰', 'sex prefix stripped');
  eq(normalize('　　庚申　乙酉　庚戌　庚辰'), '庚申乙酉庚戌庚辰', 'ideographic space stripped');
  const c = { CHART_YEAR: '庚申', CHART_MONTH: '乙酉', CHART_DAY: '庚戌', CHART_HOUR: '庚辰' };
  eq(fingerprint(c), '庚申乙酉庚戌庚辰', 'fingerprint');
  eq(fingerprint({ ...c, CHART_HOUR: null }), null, 'incomplete chart → null');
  // false-positive guard: stems/branches must never be normalised into each other
  eq(normalize('戊戌') === normalize('戊戍'), false, 'visually-similar branches stay DISTINCT');
  eq(normalize('己巳') === normalize('已巳'), false, '己/已 stay DISTINCT (the 四庫 conflation)');
  eq(queryVariants(c).includes('庚辰庚戌乙酉庚申'), true, 'right-to-left variant present');
  eq(queryVariants({ ...c, CHART_HOUR: null }), [], 'no variants for incomplete chart');
  console.log(process.exitCode ? '\nSELF-CHECK FAILED' : '\nSELF-CHECK PASSED');
}

if (process.argv.includes('--test')) {
  test();
} else {
  const cases = JSON.parse(readFileSync(CORPUS, 'utf8'));
  const seen = new Map();
  for (const c of cases) {
    const fp = fingerprint(c);
    if (!fp) continue;
    if (!seen.has(fp)) seen.set(fp, { fp, ids: [], best: c, score: -1 });
    const e = seen.get(fp);
    e.ids.push(c.CASE_ID);
    const s = bridgePriority(c);
    if (s > e.score) { e.score = s; e.best = c; }
  }
  const all = [...seen.values()].sort((a, b) => b.score - a.score);
  const list = process.argv.includes('--all') ? all : all.slice(0, 45);
  console.log(`# ${list.length} charts (of ${all.length} unique), bridge-priority order\n`);
  for (const e of list) {
    console.log(`${e.fp}  [score ${e.score}]  ${e.ids.join(', ')}`);
    console.log(`    ${e.best.SOURCE_LOCATION}`);
    console.log(`    variants: ${queryVariants(e.best).slice(0, 5).join('  |  ')}`);
  }
}
