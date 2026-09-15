#!/usr/bin/env node
/**
 * dead-code-scan.mjs — find definitions that have no call site.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * On 2026-09-02 Premium was picked up as "not implemented" and nearly rebuilt from scratch.
 * It was already ~90% there — pricing, model routing, 덕 차감, wallet labels — and the ONLY
 * thing missing was a call site. That discovery produced docs/PROJECT_STATE.md §9.7
 * "정의만 있고 안 쓰이는 것", whose judgment rule is the same as §9: **실제 호출부의 존재**.
 *
 * §9.7 ends with: "재현: 이 스캔은 일회성 스크립트였고 레포에 남기지 않았다 — 필요하면 다시 만들 것."
 * This is that script, kept this time. Re-run it before declaring anything "미구현" and before
 * refreshing §9.7. It is READ-ONLY: it opens files and prints a report, nothing else.
 *
 * HOW TO RUN
 * ----------
 *   node scripts/dead-code-scan.mjs                      # full report
 *   node scripts/dead-code-scan.mjs --quiet              # summary line only
 *   node scripts/dead-code-scan.mjs --category=exports   # exports | tables | functions | all
 *   node scripts/dead-code-scan.mjs --json               # machine-readable
 *   node scripts/dead-code-scan.mjs --json --category=tables > /tmp/tables.json
 *
 * Exit codes: 0 = report printed, 1 = SELF-TEST FAILED (report is untrustworthy), 2 = bad flag.
 *
 * WHAT COUNTS AS A CALLER
 * -----------------------
 * production: src/**, supabase/functions/**, scripts/** (.ts .tsx .mjs .js .jsx)
 * tests:      any path containing __tests__, or a *.test.ts(x) / *.spec.ts(x) file.
 *             A test reference is NOT production usage — it lands in its own bucket, because
 *             "the tests keep it alive" is exactly how §9.7 items stay invisible.
 * excluded:   node_modules .expo dist build coverage android ios .git, and
 *             supabase/functions/chat/_server/serverBundle.mjs — a GENERATED bundle that inlines
 *             the whole server graph. Counting it would mark literally everything as used.
 *
 * Re-export barrels (`export { X } from './x'`, incl. multi-line) are stripped before reference
 * counting. Otherwise every symbol listed in one of the ~70 index.ts barrels looks "used" by the
 * barrel — which is precisely the blindness that hid Premium. A real consumer still counts,
 * because its own `import { X } from '../barrel'` is not a re-export.
 *
 * KNOWN LIMITS (all lean toward UNDER-reporting, i.e. a listed item is a strong signal)
 *   - Matching is by identifier name, not by resolved module graph. A mention in a JS/TS comment
 *     or an unrelated same-named symbol counts as usage.
 *   - `export default` is skipped: Expo Router screens are referenced by file path, not by name.
 *   - Only `export <kind> <name>` declarations are collected. A name declared plainly and exported
 *     later via a local `export { X }` list (8 places in src/ as of 2026-09-02, one of them an
 *     `as` alias) is not collected, so it can never be reported. Widen the extractor if that grows.
 *   - Table/function names that read like ordinary words (e.g. `profiles`) will look used.
 *   - Dynamic access (`supabase.from(tableVar)`, string concat) is invisible.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CODE_ROOTS = ['src', 'supabase/functions', 'scripts'];
const MIGRATIONS = path.join(ROOT, 'supabase/migrations');

const SKIP_DIRS = new Set(['node_modules', '.expo', 'dist', 'build', 'coverage', 'android', 'ios', '.git']);
const CODE_EXT = new Set(['.ts', '.tsx', '.mjs', '.js', '.jsx']);
const EXCLUDE_BASENAMES = new Set([
  'serverBundle.mjs', // generated bundle — see header
  'dead-code-scan.mjs', // this file: its self-test names real symbols and would resurrect them
]);

// ---------------------------------------------------------------- args

const argv = process.argv.slice(2);
const JSON_OUT = argv.includes('--json');
const QUIET = argv.includes('--quiet');
const CATEGORY = (argv.find((a) => a.startsWith('--category=')) ?? '').split('=')[1] ?? 'all';
const KNOWN_FLAGS = /^--(json|quiet|category=(exports|tables|functions|all))$/;

for (const a of argv) {
  if (!KNOWN_FLAGS.test(a)) {
    console.error(`dead-code-scan: unknown flag ${a}`);
    console.error('usage: node scripts/dead-code-scan.mjs [--json] [--quiet] [--category=exports|tables|functions]');
    process.exit(2);
  }
}
const want = (c) => CATEGORY === 'all' || CATEGORY === c;

// ---------------------------------------------------------------- identifier matching

/** Escape regex metacharacters so an identifier is matched literally. */
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Word-boundary matcher for one identifier.
 * String.raw is LOAD-BEARING: with a normal template literal `\b` becomes U+0008 (backspace),
 * the regex then matches nothing, and every single export silently looks unused. A previous
 * attempt at this scanner shipped exactly that bug — hence selfTest() below.
 */
const wordRe = (name) => new RegExp(String.raw`\b${escapeRe(name)}\b`);

function selfTest() {
  const fails = [];
  const re = wordRe('resolveModelRoute');

  if (re.source !== String.raw`\bresolveModelRoute\b`) {
    // Render char codes: a backspace prints as an invisible/identical-looking "\b" otherwise.
    const codes = [...re.source].map((c) => (c < ' ' ? `U+${c.charCodeAt(0).toString(16).padStart(4, '0')}` : c)).join('');
    fails.push(`\\b was not preserved — regex source is [${codes}] (expected a literal backslash-b at both ends)`);
  }
  if (!re.test("import { resolveModelRoute } from '@/features/chat/server';")) {
    fails.push('did not match a known-used symbol in an import line');
  }
  if (!re.test('const route = resolveModelRoute("premium_report", opts);')) {
    fails.push('did not match a known-used symbol at a call site');
  }
  if (re.test('xresolveModelRouteY')) fails.push('matched inside a longer identifier');
  if (re.test('resolveModelRouteExtra')) fails.push('matched a longer identifier with the same prefix');
  if (!wordRe('plus_entitlements').test(".from('plus_entitlements')")) {
    fails.push('did not match a snake_case name inside quotes');
  }
  if (wordRe('plus_entitlements').test('plus_entitlements_select_own')) {
    fails.push('underscore treated as a word boundary');
  }
  if (!wordRe('a.b+c').test('q a.b+c q')) fails.push('metacharacter escaping is broken');

  if (fails.length) {
    console.error('\n  !!! SELF-TEST FAILED — every result below would be garbage. Aborting. !!!\n');
    for (const f of fails) console.error(`  - ${f}`);
    console.error('');
    process.exit(1);
  }
}

selfTest(); // before anything else: a broken matcher makes the whole report a lie

// ---------------------------------------------------------------- file collection

function walk(dir, out) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) walk(abs, out);
    } else if (CODE_EXT.has(path.extname(e.name)) && !EXCLUDE_BASENAMES.has(e.name)) {
      out.push(abs);
    }
  }
  return out;
}

const isTestPath = (rel) => /(^|\/)__tests__(\/|$)/.test(rel) || /\.(test|spec)\.[tj]sx?$/.test(rel);
const rel = (abs) => path.relative(ROOT, abs).split(path.sep).join('/');

/** Drop `export { A, B } from '...'` (and `export type { ... } from '...'`), including multi-line. */
const REEXPORT = /export\s+(?:type\s+)?\{[^}]*\}\s*from\s*['"][^'"]+['"]/g;

const files = [];
for (const root of CODE_ROOTS) {
  for (const abs of walk(path.join(ROOT, root), [])) {
    const r = rel(abs);
    const raw = fs.readFileSync(abs, 'utf8');
    files.push({ rel: r, raw, refText: raw.replace(REEXPORT, ''), isTest: isTestPath(r) });
  }
}
const prodFiles = files.filter((f) => !f.isTest);
const testFiles = files.filter((f) => f.isTest);

// An empty corpus prints "0 dead exports", which reads as good news. It is not — it means the
// scanner was run from somewhere it could not see the repo.
if (!prodFiles.length) {
  console.error(`\n  !!! Scanned 0 production files under ${ROOT}. Wrong repo root — the report would be a lie. !!!\n`);
  process.exit(1);
}

/** Who mentions `name`? Skips `selfRel`. Stops early once a production caller is found. */
function referencesTo(name, selfRel) {
  const re = wordRe(name);
  const prod = [];
  const tests = [];
  for (const f of files) {
    if (f.rel === selfRel) continue;
    if (!f.refText.includes(name)) continue; // cheap prefilter; the regex below is the decision
    if (!re.test(f.refText)) continue;
    if (f.isTest) tests.push(f.rel);
    else {
      prod.push(f.rel);
      break;
    }
  }
  return { prod, tests };
}

// ---------------------------------------------------------------- 1. exports under src/

const EXPORT_DECL =
  /^[ \t]*export[ \t]+(?:declare[ \t]+)?(?:abstract[ \t]+)?(?:async[ \t]+)?(function\*?|const|let|var|class|type|interface|enum)[ \t]+([A-Za-z_$][\w$]*)/gm;

const deadExports = [];
const testOnlyExports = [];

if (want('exports')) {
  for (const f of prodFiles) {
    if (!f.rel.startsWith('src/')) continue; // definitions we care about live under src/
    const seen = new Set();
    for (const m of f.raw.matchAll(EXPORT_DECL)) {
      const kind = m[1].startsWith('function') ? 'function' : m[1];
      const name = m[2];
      if (seen.has(name)) continue; // overloads / declaration merging
      seen.add(name);
      const { prod, tests } = referencesTo(name, f.rel);
      if (prod.length) continue;
      const line = f.raw.slice(0, m.index).split('\n').length;
      const entry = { file: f.rel, name, kind, line };
      if (tests.length) testOnlyExports.push({ ...entry, tests });
      else deadExports.push(entry);
    }
  }
}

// ---------------------------------------------------------------- SQL

const migrations = fs.existsSync(MIGRATIONS)
  ? fs.readdirSync(MIGRATIONS).filter((f) => f.endsWith('.sql')).sort()
  : [];

/** Every migration line, `--` comments stripped, with origin. */
const sqlLines = [];
for (const f of migrations) {
  const src = fs.readFileSync(path.join(MIGRATIONS, f), 'utf8');
  src.split('\n').forEach((text, i) => {
    sqlLines.push({ file: `supabase/migrations/${f}`, line: i + 1, text: text.replace(/--.*$/, '') });
  });
}

/** Boilerplate that mentions a name without depending on it. §9.7 counts these as "RLS만 걸려 있음". */
const SQL_BOILERPLATE =
  /^\s*(grant|revoke|comment\s+on|drop|create\s+(unique\s+)?index|create\s+policy|alter\s+table[^;]*row\s+level\s+security)/i;

function sqlDefsOf(pattern) {
  const found = new Map();
  for (const f of migrations) {
    const src = fs.readFileSync(path.join(MIGRATIONS, f), 'utf8');
    for (const m of src.matchAll(pattern)) {
      const name = m[1];
      if (found.has(name)) continue;
      found.set(name, {
        name,
        file: `supabase/migrations/${f}`,
        line: src.slice(0, m.index).split('\n').length,
      });
    }
  }
  return [...found.values()];
}

/** Real SQL dependencies on `name`: not its own declaration, not boilerplate, not a comment. */
function sqlRefsTo(name, declRe) {
  const re = wordRe(name);
  const hits = [];
  for (const l of sqlLines) {
    if (!l.text.includes(name)) continue;
    if (declRe.test(l.text)) continue;
    if (SQL_BOILERPLATE.test(l.text)) continue;
    if (!re.test(l.text)) continue;
    hits.push(`${l.file}:${l.line}`);
  }
  return hits;
}

// ---------------------------------------------------------------- 2. tables

const deadTables = [];
if (want('tables')) {
  for (const t of sqlDefsOf(/create\s+table\s+(?:if\s+not\s+exists\s+)?public\.(\w+)/gi)) {
    const { prod, tests } = referencesTo(t.name, null);
    if (prod.length) continue;
    const sqlRefs = sqlRefsTo(t.name, new RegExp(String.raw`create\s+table\s+(if\s+not\s+exists\s+)?public\.${t.name}\b`, 'i'));
    deadTables.push({ ...t, sqlRefs, testRefs: tests });
  }
}

// ---------------------------------------------------------------- 3. functions

const deadFunctions = [];
if (want('functions')) {
  for (const fn of sqlDefsOf(/create\s+(?:or\s+replace\s+)?function\s+public\.(\w+)/gi)) {
    const { prod, tests } = referencesTo(fn.name, null);
    if (prod.length) continue;
    const sqlRefs = sqlRefsTo(fn.name, new RegExp(String.raw`create\s+(or\s+replace\s+)?function\s+public\.${fn.name}\b`, 'i'));
    deadFunctions.push({ ...fn, sqlRefs, testRefs: tests, sqlOnly: sqlRefs.length > 0 });
  }
}

// ---------------------------------------------------------------- corpus self-test

if (CATEGORY === 'all' || CATEGORY === 'exports') {
  // A symbol we know is wired all the way into the edge function must never land in a dead bucket.
  const canaries = ['buildPremiumReport', 'resolveModelRoute'];
  const bad = canaries.filter(
    (n) => deadExports.some((e) => e.name === n) || testOnlyExports.some((e) => e.name === n),
  );
  if (bad.length) {
    console.error('\n  !!! SELF-TEST FAILED — known-used symbols reported as unused: ' + bad.join(', '));
    console.error('  The scanner is broken (check wordRe / re-export stripping). Aborting. !!!\n');
    process.exit(1);
  }
}

// ---------------------------------------------------------------- report

const sqlOnlyFns = deadFunctions.filter((f) => f.sqlOnly);
const orphanFns = deadFunctions.filter((f) => !f.sqlOnly);

// Only report on categories that actually ran — a "0" for a skipped category reads as "none found".
const summary =
  [
    want('exports') && `${deadExports.length} dead exports`,
    want('exports') && `${testOnlyExports.length} test-only exports`,
    want('tables') && `${deadTables.length} dead tables`,
    want('functions') && `${sqlOnlyFns.length} SQL-only functions`,
    want('functions') && `${orphanFns.length} orphan functions`,
  ]
    .filter(Boolean)
    .join(', ') +
  ` (scanned ${prodFiles.length} production + ${testFiles.length} test files, ${migrations.length} migrations` +
  (CATEGORY === 'all' ? '' : `; --category=${CATEGORY}, other categories not scanned`) +
  ')';

if (JSON_OUT) {
  console.log(
    JSON.stringify(
      {
        root: ROOT,
        scanned: { production: prodFiles.length, tests: testFiles.length, migrations: migrations.length },
        category: CATEGORY,
        exports: { dead: deadExports, testOnly: testOnlyExports },
        tables: deadTables,
        functions: deadFunctions,
        summary,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

const groupByFile = (rows) => {
  const m = new Map();
  for (const r of rows) (m.get(r.file) ?? m.set(r.file, []).get(r.file)).push(r);
  return [...m.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
};

const out = [];
if (!QUIET) {
  out.push(`dead-code-scan — ${ROOT}`);
  out.push(`scanned ${prodFiles.length} production files, ${testFiles.length} test files, ${migrations.length} migrations`);
  out.push('판정 기준: 실제 호출부의 존재 (docs/PROJECT_STATE.md §9.7)');

  if (want('exports')) {
    out.push('', `EXPORTS — no production reference  (${deadExports.length} in ${new Set(deadExports.map((e) => e.file)).size} files)`);
    for (const [file, rows] of groupByFile(deadExports)) {
      out.push(`  ${file}  (${rows.length})`);
      for (const r of rows.sort((a, b) => a.line - b.line)) {
        out.push(`      ${String(r.line).padStart(5)}  ${r.kind.padEnd(9)} ${r.name}`);
      }
    }

    out.push('', `EXPORTS — test-only reference  (${testOnlyExports.length} in ${new Set(testOnlyExports.map((e) => e.file)).size} files)`);
    for (const [file, rows] of groupByFile(testOnlyExports)) {
      out.push(`  ${file}  (${rows.length})`);
      for (const r of rows.sort((a, b) => a.line - b.line)) {
        out.push(`      ${String(r.line).padStart(5)}  ${r.kind.padEnd(9)} ${r.name}   [${r.tests.length} test file(s)]`);
      }
    }
  }

  if (want('tables')) {
    out.push('', `TABLES — no reference from src/ or supabase/functions/  (${deadTables.length})`);
    for (const t of deadTables) {
      const note = t.sqlRefs.length
        ? `referenced from other SQL x${t.sqlRefs.length} (trigger/FK/RPC — NOT truly dead): ${t.sqlRefs.slice(0, 3).join(', ')}`
        : 'no SQL reference either';
      out.push(`  ${t.name}`);
      out.push(`      defined  ${t.file}:${t.line}`);
      out.push(`      ${note}`);
      if (t.testRefs.length) out.push(`      test-only code refs: ${t.testRefs.length}`);
    }
  }

  if (want('functions')) {
    out.push('', `FUNCTIONS — called from other SQL only  (${sqlOnlyFns.length})`);
    for (const f of sqlOnlyFns) {
      out.push(`  ${f.name}`);
      out.push(`      defined  ${f.file}:${f.line}`);
      out.push(`      SQL callers x${f.sqlRefs.length}: ${f.sqlRefs.slice(0, 3).join(', ')}`);
    }
    out.push('', `FUNCTIONS — no caller anywhere  (${orphanFns.length})`);
    for (const f of orphanFns) {
      out.push(`  ${f.name}`);
      out.push(`      defined  ${f.file}:${f.line}`);
      if (f.testRefs.length) out.push(`      test-only code refs: ${f.testRefs.length}`);
    }
  }
  out.push('');
}

out.push(`SUMMARY: ${summary}`);
console.log(out.join('\n'));
