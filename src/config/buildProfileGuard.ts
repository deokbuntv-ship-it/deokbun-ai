// 스토어 빌드 설정 가드 — **잘못 겨눈 빌드가 스토어에 올라가는 것을 막는다.**
//
// WHY THIS EXISTS. `eas.json` 의 프로필별 `env` 는 사람이 손으로 적는 평문이고, 지금까지 그것을
// 검사하는 것이 하나도 없었다. 실제로 두 가지가 이미 어긋나 있었다(2026-09-10 실측):
//   · production 프로필에 `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 가 **없다** → 앱이 부팅에서 throw
//   · 그 사실을 아무도 몰랐다 — 스토어 빌드를 한 적이 없어서
//
// ⚠ 런타임 가드(`assertEnvironmentConsistency`)와 겹치지 않는다. 그쪽은 **빌드된 앱이 실행될 때**
//   보고, 이쪽은 **빌드를 만들기 전에** 본다. 실행 시점에 발견하면 이미 스토어에 올라간 뒤다.
//
// ⚠ 비밀 키를 어떤 프로필에서도 거부한다. `sb_secret_` 과 role=service_role JWT 둘 다 —
//   그것이 클라이언트 번들에 들어가면 RLS 가 통째로 무의미해진다.
export type ProfileVerdict = { ok: true } | { ok: false; reasons: string[] };

const KNOWN_REFS: Readonly<Record<string, 'production' | 'staging'>> = {
  olvkpaldrwvtexxpoaag: 'production',
  aephpsiurgkvqcswyeie: 'staging',
};

function refOf(url: string): string | null {
  const m = url.trim().match(/^https:\/\/([a-z0-9]+)\.supabase\.co/i);
  return m ? m[1].toLowerCase() : null;
}

/** JWT payload 의 role. JWT 가 아니거나 못 읽으면 `null`. */
function jwtRole(key: string): string | null {
  const parts = key.split('.');
  if (parts.length !== 3) return null;
  try {
    // ⚠ `atob` 만 쓴다. RN·브라우저·Node 18+ 모두 전역으로 갖고 있고, `Buffer` 를 쓰면 앱의
    //   tsconfig 에 node 타입이 없어 tsc 가 막는다(실측: TS2591).
    if (typeof atob !== 'function') return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))) as { role?: unknown };
    return typeof payload.role === 'string' ? payload.role : null;
  } catch {
    return null;
  }
}

/** ⚠ 비밀 키인가. 두 형식 다 본다 — 새 형식(`sb_secret_`)과 옛 형식(role=service_role JWT). */
export function isSecretKey(key: string): boolean {
  const k = key.trim();
  if (k === '') return false;
  if (k.toLowerCase().startsWith('sb_secret_')) return true;
  return jwtRole(k) === 'service_role';
}

/** 공개 키로 인정되는 형식인가. `sb_publishable_` 또는 role=anon JWT. */
export function isPublishableKey(key: string): boolean {
  const k = key.trim();
  if (k === '') return false;
  if (isSecretKey(k)) return false;
  if (k.toLowerCase().startsWith('sb_publishable_')) return true;
  return jwtRole(k) === 'anon';
}

/**
 * 한 빌드 프로필의 env 가 규칙에 맞는가.
 *
 * 규칙 (지시서 1-3):
 *   · `production`             → production ref + 공개 키 존재
 *   · `development`·`staging`  → staging ref
 *   · `internal`               → 두 ref 모두 허용 (배너가 host 를 보인다)
 *   · 모든 프로필              → 비밀 키 거부
 */
export function checkBuildProfile(
  profile: string,
  env: Readonly<Record<string, string | undefined>>,
): ProfileVerdict {
  const reasons: string[] = [];
  const url = (env.EXPO_PUBLIC_SUPABASE_URL ?? '').trim();
  const key = (env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '').trim();
  const ref = refOf(url);
  const name = profile.trim().toLowerCase();

  if (url === '') reasons.push('EXPO_PUBLIC_SUPABASE_URL 없음');
  else if (ref === null) reasons.push(`EXPO_PUBLIC_SUPABASE_URL 형식이 아님: ${url}`);

  // ⚠ 비밀 키 검사는 **모든 프로필**에서, 키가 있든 없든 먼저 한다.
  if (key !== '' && isSecretKey(key)) {
    reasons.push('⚠ 비밀 키가 들어 있음 (sb_secret_ 또는 role=service_role) — 클라이언트 번들에 절대 들어가면 안 됨');
  }

  if (name === 'production') {
    if (ref !== null && KNOWN_REFS[ref] !== 'production') {
      reasons.push(`production 프로필인데 URL 이 ${KNOWN_REFS[ref] ?? ref} 를 가리킴`);
    }
    if (key === '') reasons.push('production 프로필에 EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY 없음 — 앱이 부팅에서 throw 한다');
    else if (!isSecretKey(key) && !isPublishableKey(key)) reasons.push('공개 키 형식이 아님 (sb_publishable_ 또는 role=anon JWT 여야 함)');
  } else if (name === 'development' || name === 'staging') {
    if (ref !== null && KNOWN_REFS[ref] !== 'staging') {
      reasons.push(`${name} 프로필인데 URL 이 ${KNOWN_REFS[ref] ?? ref} 를 가리킴`);
    }
  }
  // internal 은 ref 를 가리지 않는다 — 어느 쪽을 보든 배너가 host 를 화면에 보인다.

  return reasons.length === 0 ? { ok: true } : { ok: false, reasons };
}

/** eas.json 전체를 훑는다. `{프로필: 판정}`. */
export function checkEasBuildProfiles(
  eas: { build?: Record<string, { env?: Record<string, string> }> },
): Record<string, ProfileVerdict> {
  const out: Record<string, ProfileVerdict> = {};
  for (const [name, cfg] of Object.entries(eas.build ?? {})) {
    out[name] = checkBuildProfile(name, cfg.env ?? {});
  }
  return out;
}
