// 내부 테스트 빌드에서만 보이는 한 줄 — **이 앱이 지금 어느 DB 에 붙어 있는가.**
//
// WHY THIS EXISTS. 오너가 폰에 APK 를 깔고 레이아웃을 본다. 그 빌드가 staging 을 보는지
// production 을 보는지 화면에 없으면, 실기기에서 남긴 데이터가 어디에 쌓였는지 나중에 알 수 없다.
// `KNOWN_RISKS` H5 가 정확히 그 사고였다 — "조용히 production 을 봤다".
// 부팅 로그(`describeEnvironment`)는 이미 있지만 **폰에서는 로그를 볼 수 없다.**
//
// ⚠ 스토어 빌드에는 절대 보이면 안 된다. 그래서 판정을 **빌드 프로필 이름**으로 한다 —
//   URL 로 판정하면 "내부 빌드가 production 을 보는" 위험한 조합에서 오히려 숨겨진다.
//   프로필 이름이 그 빌드의 의도이고, 의도가 internal 이면 무엇을 보든 보여 주는 것이 맞다.
import { resolveEnvironment } from './environment';

export type BuildBanner = { profile: string; host: string };

/**
 * 표시할 것이 있으면 `{profile, host}`, 없으면 `null`.
 *
 * 규칙 (합성 반례로 잠금 — `buildBanner.test.ts`):
 *   · 내부 프로필 이름   → 표시
 *   · `production`       → 숨김 (스토어 빌드)
 *   · 값 없음/공백       → 숨김 (프로필을 안 넘긴 빌드 = 옛 빌드)
 *   · Supabase URL 없음  → 숨김 (보여 줄 host 가 없다)
 */
export function buildBannerInfo(input?: {
  profile?: string | null;
  url?: string | null;
  declared?: string | null;
}): BuildBanner | null {
  const profile = (input?.profile ?? process.env.EXPO_PUBLIC_BUILD_PROFILE ?? '').trim();
  if (profile === '') return null;
  if (profile.toLowerCase() === 'production') return null;

  const resolved = resolveEnvironment({ url: input?.url, declared: input?.declared });
  const url = resolved.supabaseUrl;
  if (url === '') return null;

  // `https://<ref>.supabase.co` → `<ref>.supabase.co`. 파싱에 실패하면 원문 그대로 — 여기서
  // 던지면 배너 하나 때문에 화면이 죽는다.
  const host = url.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
  return { profile, host: host === '' ? url : host };
}

/** 화면에 그대로 쓰는 한 줄. `null` 이면 아무것도 그리지 않는다. */
export function buildBannerLine(info: BuildBanner | null): string | null {
  return info === null ? null : `내부 테스트 빌드 · ${info.profile} · ${info.host}`;
}
