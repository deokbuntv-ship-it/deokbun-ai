#!/usr/bin/env node
// 새 마이그레이션 파일명을 찍어 준다 (읽기 전용 — 파일을 만들지 않는다).
//
//   node scripts/next-migration-name.mjs <이름>
//   node scripts/next-migration-name.mjs add_foo_table --create
//
// ⚠ `supabase migration new` 를 쓰면 **현재 시각**이 붙는데, 이 레포는 파일명이 미래 날짜라
//   새 파일이 기존 파일보다 앞에 끼어든다. 규칙과 그 회귀는 `src/config/nextMigrationVersion.ts`.
import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const DIR = path.join(process.cwd(), 'supabase/migrations');
if (!existsSync(DIR)) { console.error(`없음: ${DIR} (레포 루트에서 실행하십시오)`); process.exit(1); }

const { nextMigrationVersion } = await import('../src/config/nextMigrationVersion.ts');

const args = process.argv.slice(2);
const create = args.includes('--create');
const name = args.filter((a) => !a.startsWith('--'))[0] ?? '';
if (!/^[a-z0-9_]+$/.test(name)) {
  console.error('이름을 소문자·숫자·밑줄로 주십시오. 예: node scripts/next-migration-name.mjs add_foo_table');
  process.exit(1);
}

const files = readdirSync(DIR).filter((f) => f.endsWith('.sql'));
const version = nextMigrationVersion(files, new Date());
const file = `${version}_${name}.sql`;
const max = files.map((f) => f.slice(0, 14)).sort().pop() ?? '(없음)';

console.log(`레포 최대: ${max}\n현재 시각: ${new Date().toISOString()}\n다음 파일:  supabase/migrations/${file}`);

if (create) {
  const full = path.join(DIR, file);
  if (existsSync(full)) { console.error(`이미 있음: ${file}`); process.exit(1); }
  // ⚠ 멱등 3원칙을 머리말로 박아 둔다 — 이 레포에서 두 번 깨뜨린 규칙이다.
  writeFileSync(full, `-- ${name}\n--\n`
    + `-- 멱등 3원칙: (1) create table if not exists  (2) create policy 앞에 drop policy if exists\n`
    + `--            (3) 시드 insert 금지\n`
    + `-- ⚠ (1) 은 **이미 있는 표를 고치지 않는다.** 컬럼을 더하려면 alter table ... if not exists 를 따로 쓴다.\n\n`, 'utf8');
  console.log(`만들었습니다: ${file}`);
}
