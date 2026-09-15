#!/usr/bin/env node
// FEATURE_MASTER_CHECKLIST tally — counts the 9 axes without anyone counting by hand.
//
// WHY THIS EXISTS: on 2026-09-04 a naive scan of the checklist reported axis 3 as 23 items
// (it counted the 퍼널/지표 analysis tables) and axis 6 as 7 (it missed field-level rows).
// The published totals were wrong and nobody noticed because recounting 92 rows by hand is
// something you do once.
//
// THE STRUCTURAL RULE IT RELIES ON — this is the contract, keep it:
//   An ITEM row's FIRST CELL starts with the axis number, then `.` or `-`, then the item
//   number:  `3.1`  `3.8b`  `2-1 사용자/상담 관리`
//   Anything else in a table (단계, 지표, 대상, 위험 …) is an ANALYSIS row and is not counted.
// The axis number inside the id must match the section it appears in, so a row moved between
// axes without renumbering is caught rather than silently recounted.
//
// Usage:
//   node scripts/checklist-tally.mjs            사람이 읽는 표
//   node scripts/checklist-tally.mjs --json     기계 출력
//   node scripts/checklist-tally.mjs --check    문서에 적힌 합계와 대조. 다르면 exit 1
import fs from 'node:fs';
import path from 'node:path';

const DOC = path.resolve(process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'docs/FEATURE_MASTER_CHECKLIST.md');
const VERDICTS = ['DONE', 'FUNCTIONAL', 'PARTIAL', 'NOT_STARTED'];

// A verdict is the FIRST bolded verdict token in a row. `**DONE** (staging 2026-09-04)` counts
// as DONE; a later mention of another verdict inside the prose column does not override it.
const VERDICT_RE = new RegExp(`\\*\\*(${VERDICTS.join('|')})`);

export function tally(markdown) {
  const lines = markdown.split('\n');
  const axes = [];
  let cur = null;
  const problems = [];

  for (let i = 0; i < lines.length; i += 1) {
    const ln = lines[i];
    const head = ln.match(/^## 축 (\d) — (.+?)(?:\s*\((\d+)\s*항목\))?\s*$/);
    if (head) {
      cur = {
        n: head[1],
        name: head[2].trim(),
        declared: head[3] ? Number(head[3]) : null,
        items: [],
        analysisRows: 0,
      };
      axes.push(cur);
      continue;
    }
    if (/^## /.test(ln)) { cur = null; continue; } // left the axis sections
    if (!cur || !ln.startsWith('|') || /^\|[\s|:-]+\|?$/.test(ln)) continue;
    // A header row is the line immediately followed by the `|---|` separator. Skipping it by
    // position rather than by content keeps `analysisRows` meaning "real analysis data rows"
    // — the self-test caught this counting headers.
    if (/^\|[\s|:-]+\|?$/.test(lines[i + 1] ?? '')) continue;

    const cells = ln.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length === 0) continue;
    const id = cells[0].replace(/[*~`]/g, '').trim();
    const idMatch = id.match(/^(\d+)[.-](\d+[a-z]?)\b/);

    if (!idMatch) { cur.analysisRows += 1; continue; }
    if (idMatch[1] !== cur.n) {
      problems.push(`축 ${cur.n} 안에 "${id}" — 축 번호가 맞지 않습니다 (line ${i + 1})`);
      continue;
    }

    const verdictCell = cells.find((c) => VERDICT_RE.test(c));
    if (!verdictCell) {
      problems.push(`축 ${cur.n} 항목 "${id}" — 굵은 판정이 없습니다 (line ${i + 1})`);
      cur.items.push({ id, verdict: null });
      continue;
    }
    cur.items.push({ id, verdict: verdictCell.match(VERDICT_RE)[1] });
  }

  const counts = (items) => {
    const c = Object.fromEntries(VERDICTS.map((v) => [v, 0]));
    for (const it of items) if (it.verdict) c[it.verdict] += 1;
    return c;
  };
  const rows = axes.map((a) => ({
    n: a.n, name: a.name, declared: a.declared,
    total: a.items.length, analysisRows: a.analysisRows, ...counts(a.items),
  }));
  const total = { total: 0, ...Object.fromEntries(VERDICTS.map((v) => [v, 0])) };
  for (const r of rows) { total.total += r.total; for (const v of VERDICTS) total[v] += r[v]; }

  // Declared-vs-counted mismatch is a real finding, not a script bug: it means the heading
  // says "(17항목)" while the table holds a different number of item rows.
  for (const r of rows) {
    if (r.declared !== null && r.declared !== r.total) {
      problems.push(`축 ${r.n} 제목은 ${r.declared}항목인데 실제 항목 행은 ${r.total}개`);
    }
  }
  return { rows, total, problems };
}

// ── self-test: the script must not count analysis rows, and must catch a mis-numbered row ───
function selfTest() {
  const fixture = [
    '## 축 1 — 테스트 (2항목)', '',
    '| # | 항목 | 판정 | 근거 |', '|---|---|---|---|',
    '| 1.1 | 가 | **DONE** | x |',
    '| 1.2 | 나 | **PARTIAL** | y |', '',
    '### 1-Z 분석표 (항목이 아님)', '',
    '| 단계 | 기록 위치 | 판정 |', '|---|---|---|',
    '| 클릭 | 어딘가 | **DONE** |',
    '| 가입 | 어딘가 | **NOT_STARTED** |', '',
    '## 축 2 — 다른축 (1항목)', '',
    '| # | 항목 | 판정 |', '|---|---|---|',
    '| 2-1 다 | — | **FUNCTIONAL** |',
  ].join('\n');
  const r = tally(fixture);
  const a1 = r.rows.find((x) => x.n === '1');
  if (a1.total !== 2) throw new Error(`self-test: 분석 행을 셌습니다 (총 ${a1.total}, 기대 2)`);
  if (a1.analysisRows !== 2) throw new Error(`self-test: 분석 행 감지 실패 (${a1.analysisRows}, 기대 2)`);
  if (a1.DONE !== 1 || a1.PARTIAL !== 1) throw new Error('self-test: 판정 집계 오류');
  if (r.total.total !== 3) throw new Error(`self-test: 합계 오류 (${r.total.total}, 기대 3)`);
  if (r.problems.length !== 0) throw new Error(`self-test: 정상 fixture 에서 문제 보고 (${r.problems.join('; ')})`);

  // A row numbered for another axis must be reported, not silently absorbed.
  const bad = fixture.replace('| 1.2 | 나 |', '| 5.2 | 나 |');
  const rb = tally(bad);
  if (!rb.problems.some((p) => p.includes('축 번호가 맞지 않습니다'))) {
    throw new Error('self-test: 축 번호 불일치를 잡지 못했습니다');
  }
}

const args = process.argv.slice(2);
try {
  selfTest();
} catch (e) {
  console.error(`SELF-TEST FAILED — 집계를 신뢰할 수 없습니다.\n  ${e.message}`);
  process.exit(2);
}

const md = fs.readFileSync(DOC, 'utf8');
const { rows, total, problems } = tally(md);

if (args.includes('--json')) {
  console.log(JSON.stringify({ rows, total, problems }, null, 1));
} else {
  console.log('| 축 | 항목 | DONE | FUNCTIONAL | PARTIAL | NOT_STARTED | (분석행) |');
  console.log('|---|---:|---:|---:|---:|---:|---:|');
  for (const r of rows) {
    console.log(`| ${r.n} ${r.name} | ${r.total} | ${r.DONE} | ${r.FUNCTIONAL} | ${r.PARTIAL} | ${r.NOT_STARTED} | ${r.analysisRows} |`);
  }
  console.log(`| **합계** | **${total.total}** | **${total.DONE}** | **${total.FUNCTIONAL}** | **${total.PARTIAL}** | **${total.NOT_STARTED}** | |`);
  const sum = total.DONE + total.FUNCTIONAL + total.PARTIAL + total.NOT_STARTED;
  if (sum !== total.total) console.log(`\n⚠ 판정 없는 항목 ${total.total - sum}개`);
  if (problems.length) {
    console.log('\n⚠ 구조 문제:');
    for (const p of problems) console.log(`  - ${p}`);
  }
}

if (args.includes('--check')) {
  const declared = md.match(/\|\s*\*\*합계\*\*\s*\|\s*\*\*(\d+)\*\*\s*\|\s*\*\*(\d+)\*\*\s*\|\s*\*\*(\d+)\*\*\s*\|\s*\*\*(\d+)\*\*\s*\|\s*\*\*(\d+)\*\*\s*\|/);
  if (!declared) { console.error('\n--check: 문서에서 합계 행을 찾지 못했습니다.'); process.exit(1); }
  const [, t, d, f, p, n] = declared.map(Number);
  const ok = t === total.total && d === total.DONE && f === total.FUNCTIONAL && p === total.PARTIAL && n === total.NOT_STARTED;
  console.log(ok
    ? '\n--check: 문서 합계와 일치합니다.'
    : `\n--check: 불일치 — 문서 ${t}/${d}/${f}/${p}/${n} vs 실제 ${total.total}/${total.DONE}/${total.FUNCTIONAL}/${total.PARTIAL}/${total.NOT_STARTED}`);
  if (!ok || problems.length) process.exit(1);
}
