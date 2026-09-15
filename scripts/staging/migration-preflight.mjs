// Sprint I §52 — READ-ONLY migration preflight. Statically inspects the local migration files for ordering +
// collisions before the owner applies them. NO database connection, NO remote mutation. Reports: object
// creation order, function/table name reuse across migrations, and the required dependency chain for the
// monetization set. Exit 0 always (advisory); anomalies are printed.
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const DIR = resolve(HERE, '../../supabase/migrations');
const files = readdirSync(DIR).filter((f) => f.endsWith('.sql')).sort();

const tableCreates = new Map(); // table -> [files]
const fnCreates = new Map();    // function -> [files]
const fnDrops = new Set();

for (const f of files) {
  const sql = readFileSync(resolve(DIR, f), 'utf8');
  for (const m of sql.matchAll(/create table if not exists public\.(\w+)/g)) {
    (tableCreates.get(m[1]) ?? tableCreates.set(m[1], []).get(m[1])).push(f);
  }
  for (const m of sql.matchAll(/create or replace function public\.(\w+)/g)) {
    (fnCreates.get(m[1]) ?? fnCreates.set(m[1], []).get(m[1])).push(f);
  }
}

console.log('덕분이 migration preflight (read-only) —', files.length, 'migrations\n');

// Dependency chain for the monetization set (each depends on the prior).
const CHAIN = [
  '20260829000000_consultation_decisions.sql',
  '20260830000000_product_events_server_validation.sql',
  '20260831000000_duk_economy_foundation.sql',
  '20260832000000_duk_economy_runtime.sql',
  '20260833000000_duk_session_runtime.sql',
  '20260834000000_iap.sql',
  '20260835000000_product_events_revoke_direct_insert.sql',
  '20260836000000_global_reservation_request_id.sql',
];
let chainOk = true;
for (const c of CHAIN) {
  const present = files.includes(c);
  console.log(`  ${present ? '✅' : '❌ MISSING'}  ${c}`);
  if (!present) chainOk = false;
}
console.log(chainOk ? '\n  ✅ monetization migration chain complete + ordered' : '\n  ❌ chain incomplete');

// A table create-if-not-exists in multiple files is fine (idempotent); flag only true redefinitions of columns.
const reusedTables = [...tableCreates.entries()].filter(([, fs]) => fs.length > 1);
if (reusedTables.length) {
  console.log('\n  ℹ️ tables referenced by create-if-not-exists in multiple migrations (verify no column drift):');
  for (const [t, fs] of reusedTables) console.log(`     ${t}: ${fs.join(', ')}`);
}

// A function defined in multiple files is a real replacement — flag for review (last wins).
const reusedFns = [...fnCreates.entries()].filter(([, fs]) => fs.length > 1);
if (reusedFns.length) {
  console.log('\n  ⚠️ functions (re)defined in multiple migrations — confirm the LAST definition is intended:');
  for (const [fn, fs] of reusedFns) console.log(`     ${fn}: ${fs.join(', ')}`);
} else {
  console.log('\n  ✅ no conflicting function redefinitions across migrations');
}

console.log('\nRead-only. No database was contacted. Apply order = filename (timestamp) order.');
