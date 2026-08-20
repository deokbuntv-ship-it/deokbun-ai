#!/usr/bin/env node
// 덕분이 V1 — LOCAL deploy PREFLIGHT (Sprint E §22). READ-ONLY checks the owner/developer can run before
// deployment. It NEVER deploys, needs NO credentials, and mutates nothing. Exit 0 = all pass.
//
//   npm run preflight
//
// Checks: git HEAD · serverBundle present + syntax + deterministic externals + no secrets + version
// constants · spend-guard migration present · tsc 0 errors · full jest green.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

let failed = 0;
const ok = (m) => console.log(`  ✅ ${m}`);
const bad = (m) => {
  console.log(`  ❌ ${m}`);
  failed += 1;
};
const run = (cmd) => execSync(cmd, { stdio: 'pipe', encoding: 'utf8' });

console.log('덕분이 V1 — deploy preflight (read-only)\n');

try {
  console.log(`HEAD ${run('git rev-parse --short HEAD').trim()}\n`);
} catch {
  bad('git not available');
}

const bundle = 'supabase/functions/chat/_server/serverBundle.mjs';
if (existsSync(bundle)) {
  ok('serverBundle.mjs present');
  try {
    run(`node --check "${bundle}"`);
    ok('serverBundle.mjs syntax OK');
  } catch {
    bad('serverBundle.mjs syntax error');
  }
  const src = readFileSync(bundle, 'utf8');
  if (/sk-[A-Za-z0-9]{20}|SUPABASE_SERVICE_ROLE|eyJ[A-Za-z0-9_-]{20}\./.test(src)) bad('possible secret in bundle');
  else ok('no obvious secret in bundle');
  if (/answer-plan@\d/.test(src) && /consultation@\d/.test(src)) ok('decision + prompt version constants present');
  else bad('version constants missing from bundle');
  if (/from "iztro"/.test(src) && /from "lunar-javascript"/.test(src)) ok('engine deps externalized');
  else bad('engine deps not externalized');
} else {
  bad('serverBundle.mjs missing — run node supabase/functions/chat/_server/build.mjs');
}

if (existsSync('supabase/migrations/20260828000000_global_paid_generation_guard.sql')) ok('spend-guard migration present');
else bad('spend-guard migration missing (admin generation control needs it)');

try {
  run('npx tsc --noEmit');
  ok('tsc: 0 errors');
} catch {
  bad('tsc errors — run npx tsc --noEmit');
}

try {
  run('npx jest --silent');
  ok('jest: all suites pass');
} catch {
  bad('jest failures — run npx jest');
}

console.log(`\n${failed === 0 ? '✅ PREFLIGHT PASS' : `❌ PREFLIGHT: ${failed} check(s) failed`} — this does NOT deploy.`);
process.exit(failed === 0 ? 0 : 1);
