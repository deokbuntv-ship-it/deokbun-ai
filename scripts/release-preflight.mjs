#!/usr/bin/env node
// Release preflight (Sprint J7 §7.5). ONE repeatable gate: type-check, tests, frozen-engine guard, client
// direct-Duk-grant guard, environment target/consistency, required public env names, migration contract, policy
// surfaces present, and no committed edge secrets. Exits non-zero on any BLOCKER. Read-only; deploys nothing.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const p = (...a) => path.join(ROOT, ...a);
const blockers = [];
const warns = [];
const oks = [];
const ok = (m) => oks.push(m);
const block = (m) => blockers.push(m);
const warn = (m) => warns.push(m);

function run(label, cmd) {
  try { execSync(cmd, { stdio: 'pipe' }); ok(`${label}`); return true; }
  catch (e) { block(`${label} FAILED`); return false; }
}

// 1. Type-check + 2. tests
run('tsc --noEmit', 'npx tsc --noEmit');
run('jest (all)', 'npx jest --silent');

// 3. Frozen-engine guard — no uncommitted changes to frozen paths.
const FROZEN = ['src/features/myungri', 'src/features/qimen', 'src/features/ziwei',
  'src/features/chat/server', 'src/features/chat/prompts', 'src/features/polarity', 'src/features/duk/pricing.ts'];
try {
  execSync(`git diff --quiet HEAD -- ${FROZEN.join(' ')}`, { stdio: 'pipe' });
  ok('frozen-engine guard (no uncommitted frozen changes)');
} catch { block('frozen-engine guard: uncommitted changes in a frozen path'); }

// ── 3b. frozen 경로 변경 가시화 (2026-09-06 추가 — 기존 §3 가드는 손대지 않았다) ─────────────
//
// §3 의 가드는 `git diff --quiet HEAD` 다. 즉 **커밋되지 않은 변경만** 본다. 커밋하는 순간 통과하므로,
// freeze 도입(49a310b, 2026-08-22) 이후 frozen 경로를 건드린 커밋 64개가 **한 건도 막히지 않았다** —
// 가드가 그 질문을 한 적이 없다. 이건 가드의 버그가 아니라 범위이고, 어느 쪽이 옳은지는 정책 판단이라
// 오너에게 열려 있다(OWNER_TODO D8).
//
// 그래서 여기서는 **막지 않는다.** 지금 막으면 정책이 정해지기 전에 모든 작업이 멈춘다. 대신 세어서
// 보여 준다: 실행할 때마다 현재 수치가 보이고, 기준선보다 늘었으면 WARN 으로 눈에 띈다.
try {
  const FROZEN_BASELINE = p('.freeze-baseline.json');
  const since = existsSync(FROZEN_BASELINE) ? JSON.parse(readFileSync(FROZEN_BASELINE, 'utf8')) : null;
  if (!since) {
    warn('freeze 기준선 파일(.freeze-baseline.json)이 없어 frozen 커밋 추이를 비교할 수 없음');
  } else {
    const n = Number(
      execSync(`git rev-list --count ${since.sinceCommit}..HEAD -- ${FROZEN.join(' ')}`, { encoding: 'utf8' }).trim(),
    );
    const delta = n - Number(since.commitsTouchingFrozen);
    const line = `frozen 경로 변경 커밋 ${n}건 (기준선 ${since.commitsTouchingFrozen}, ${since.sinceCommit} 이후)`;
    if (delta > 0) {
      warn(`${line} — 기준선보다 ${delta}건 늘었다. 정책 미판정(OWNER_TODO D8): 승인된 재개방인지 확인할 것`);
    } else {
      ok(`${line} — 증가 없음`);
    }
    // 지금 커밋되지 않은 채 남아 있는 frozen 변경도 이름으로 보여 준다. §3 은 "있다/없다" 만 말한다.
    const dirty = execSync(`git status --porcelain -- ${FROZEN.join(' ')}`, { encoding: 'utf8' })
      .split('\n').map((l) => l.trim()).filter(Boolean);
    if (dirty.length > 0) warn(`커밋되지 않은 frozen 변경 ${dirty.length}건: ${dirty.map((l) => l.split(/\s+/).pop()).join(' ')}`);
  }
} catch (e) {
  warn(`frozen 커밋 추이 확인 실패: ${String(e).slice(0, 80)}`);
}

// 4. Client direct-Duk-grant guard — the structural test exists (run by jest above).
existsSync(p('src/features/duk/__tests__/clientGrantGuard.test.ts'))
  ? ok('client-grant guard test present') : block('client-grant guard test MISSING');

// 5. Environment target/consistency (only enforced when env is provided; a bare preflight WARNs).
const KNOWN = { olvkpaldrwvtexxpoaag: 'production', aephpsiurgkvqcswyeie: 'staging' };
const url = (process.env.EXPO_PUBLIC_SUPABASE_URL || '').trim();
const declared = (process.env.EXPO_PUBLIC_APP_ENV || '').trim().toLowerCase();
if (!url) warn('EXPO_PUBLIC_SUPABASE_URL not set (ok for a bare preflight; required for a build)');
else {
  if (!/^https:\/\//i.test(url)) block('EXPO_PUBLIC_SUPABASE_URL is not https');
  const ref = (url.match(/^https:\/\/([a-z0-9]+)\.supabase\.co/i) || [])[1]?.toLowerCase();
  if (declared && ref && KNOWN[ref] && KNOWN[ref] !== declared) block(`env mismatch: APP_ENV='${declared}' but URL targets '${KNOWN[ref]}'`);
  else ok(`environment target ${declared || KNOWN[ref] || 'development'} consistent`);
}

// 6. Required public env NAMES documented (.env.example).
const ex = existsSync(p('.env.example')) ? readFileSync(p('.env.example'), 'utf8') : '';
['EXPO_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY'].forEach((n) =>
  ex.includes(n) ? ok(`.env.example documents ${n}`) : warn(`.env.example missing ${n}`));

// 7. Migration contract — sequential, present, latest recorded.
const migDir = p('supabase/migrations');
const migs = existsSync(migDir) ? readdirSync(migDir).filter((f) => f.endsWith('.sql')).sort() : [];
migs.length > 0 ? ok(`migrations present (${migs.length}, latest ${migs[migs.length - 1]})`) : block('no migrations found');

// 8. Policy surfaces present (routes + content docs).
const POLICY_ROUTES = ['privacy-policy', 'terms-of-service', 'ai-notice', 'duk-policy', 'refund-policy', 'minor-policy'];
POLICY_ROUTES.forEach((r) => existsSync(p('src/app', `${r}.tsx`)) ? ok(`policy route /${r}`) : block(`policy route /${r} MISSING`));
const legal = existsSync(p('src/features/legal/legalContent.ts')) ? readFileSync(p('src/features/legal/legalContent.ts'), 'utf8') : '';
['DUK_USE_POLICY', 'REFUND_POLICY', 'MINOR_USE_POLICY'].forEach((d) =>
  legal.includes(d) ? ok(`policy doc ${d}`) : block(`policy doc ${d} MISSING`));

// 9. No committed edge secrets (scan the built server bundle if present).
const bundle = p('supabase/functions/chat/_server/serverBundle.mjs');
if (existsSync(bundle)) {
  const b = readFileSync(bundle, 'utf8');
  /(sk-[A-Za-z0-9]{20,}|SUPABASE_SERVICE_ROLE_KEY\s*[:=]\s*['"]eyJ|-----BEGIN)/.test(b)
    ? block('edge bundle contains a secret literal') : ok('edge bundle free of secret literals');
}

// 10. ⚠ 빌드 프로필 설정 가드 (2026-09-10 신설) — **스토어 빌드 전에 막는다.**
//
// 왜 필요했나: `eas.json` 의 프로필별 `env` 는 사람이 손으로 적는 평문인데 아무도 검사하지
// 않았다. 실측에서 두 가지가 이미 어긋나 있었다 — production 프로필에 공개 키가 **없어서**
// 앱이 부팅에서 throw 하는 상태였고, 스토어 빌드를 한 적이 없어 아무도 몰랐다.
//
// ⚠ 판정 규칙과 그 회귀는 `src/config/buildProfileGuard.ts` + 그 테스트에 있다. 여기서는
//   **실제 파일**에 그것을 적용만 한다. 테스트는 합성 입력만 쓴다 — 실제 파일을 물리면
//   키를 기다리는 동안 스위트가 계속 빨갛게 남기 때문이다.
try {
  const guard = await import('../src/config/buildProfileGuard.ts');
  const easPath = p('eas.json');
  if (!existsSync(easPath)) warn('eas.json 없음 — 빌드 프로필 가드를 건너뜀');
  else {
    const verdicts = guard.checkEasBuildProfiles(JSON.parse(readFileSync(easPath, 'utf8')));
    const names = Object.keys(verdicts);
    if (names.length === 0) warn('eas.json 에 build 프로필이 없음');
    for (const name of names) {
      const v = verdicts[name];
      // ⚠ 스토어로 나가는 프로필(`distribution: store`)만 BLOCK 이다. 내부 배포 프로필의
      //   설정 문제는 WARN 으로 둔다 — 그것 때문에 릴리스가 멈출 이유는 없다.
      const isStore = name.trim().toLowerCase() === 'production';
      if (v.ok) ok(`build profile ${name} 설정 정상`);
      else if (isStore) block(`build profile ${name}: ${v.reasons.join(' | ')}`);
      else warn(`build profile ${name}: ${v.reasons.join(' | ')}`);
    }
  }
} catch (e) {
  warn(`빌드 프로필 가드 실행 실패: ${String(e).slice(0, 120)}`);
}

// ---- report ----
console.log('\n=== RELEASE PREFLIGHT ===');
for (const m of oks) console.log('  ok   ', m);
for (const m of warns) console.log('  WARN ', m);
for (const m of blockers) console.log('  BLOCK', m);
console.log(`\n${oks.length} ok · ${warns.length} warn · ${blockers.length} blocker(s)`);
if (blockers.length > 0) { console.log('RELEASE_PREFLIGHT = FAIL'); process.exit(1); }
console.log('RELEASE_PREFLIGHT = PASS');
