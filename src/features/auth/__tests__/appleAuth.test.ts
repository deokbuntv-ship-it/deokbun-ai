// 애플 로그인 계약 — 2026-09-02 V1 필수 확정분.
//
// 렌더 하네스가 없으므로 화면은 **소스 계약**으로 검증한다(절기 게이트 때와 같은 방식). 네이티브 모듈은
// jest 에서 불러오지 않으므로 순수 계층(appleIdentity)만 실행하고, 네이티브 계층은 소스로 확인한다.
//
// 기존 3종(카카오·네이버·구글)의 동작이 변하지 않았다는 것도 여기서 함께 잠근다 — 애플을 넣으면서
// 건드리기 가장 쉬운 곳이 provider 해석과 로그인 화면이기 때문이다.
import fs from 'fs';
import path from 'path';

import {
  formatAppleFullName, isApplePrivateRelayEmail, mapAppleErrorToReason,
  readIdentityToken, shouldPersistAppleName,
} from '@/features/auth/apple/appleIdentity';
import { resolveSupabaseProvider } from '@/features/auth/services/authProviders';
import { authReasonToOutcome, authOutcomeMessage, isSilentOutcome } from '@/features/auth/errors/authErrors';
import type { AuthProviderId } from '@/features/auth/types/auth';

const src = (rel: string) => fs.readFileSync(path.join(__dirname, '..', '..', '..', rel), 'utf8');

// ─────────────────────────────────────────────────────────────────────────────────────────────
describe('provider 해석 — 애플 추가, 기존 3종 불변', () => {
  it('카카오·구글은 그대로 Supabase 내장 provider 로 간다', () => {
    expect(resolveSupabaseProvider('kakao')).toEqual({ supported: true, supabaseProvider: 'kakao' });
    expect(resolveSupabaseProvider('google')).toEqual({ supported: true, supabaseProvider: 'google' });
  });

  it('네이버는 여전히 Supabase provider 가 아니다 — Edge 브리지로 가야 한다', () => {
    expect(resolveSupabaseProvider('naver')).toEqual({ supported: false });
  });

  it('애플이 Supabase provider 로 해석된다 (브라우저 경로)', () => {
    expect(resolveSupabaseProvider('apple')).toEqual({ supported: true, supabaseProvider: 'apple' });
  });

  it('네 종류 전부가 해석 가능하다 — NOT_SUPPORTED 로 떨어지는 provider 는 네이버뿐이다', () => {
    const ids: AuthProviderId[] = ['kakao', 'naver', 'google', 'apple'];
    const unsupported = ids.filter((id) => !resolveSupabaseProvider(id).supported);
    expect(unsupported).toEqual(['naver']); // 네이버는 '미지원'이 아니라 '다른 경로'다
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
describe('애플 이름 — 첫 인증에만 오는 값', () => {
  it('한글 이름은 성+이름 붙여서', () => {
    expect(formatAppleFullName({ givenName: '민수', familyName: '김' })).toBe('김민수');
  });

  it('라틴 문자는 이름 성 순서로 띄어서', () => {
    expect(formatAppleFullName({ givenName: 'John', familyName: 'Smith' })).toBe('John Smith');
  });

  it('한쪽만 있으면 그것만', () => {
    expect(formatAppleFullName({ givenName: '민수', familyName: null })).toBe('민수');
    expect(formatAppleFullName({ givenName: null, familyName: '김' })).toBe('김');
  });

  it('이름이 전혀 없으면 nickname, 그것도 없으면 null', () => {
    expect(formatAppleFullName({ givenName: null, familyName: null, nickname: '덕분이' })).toBe('덕분이');
    expect(formatAppleFullName({ givenName: '  ', familyName: '' })).toBeNull();
    expect(formatAppleFullName(null)).toBeNull();
  });

  it('이미 이름이 있으면 덮어쓰지 않는다 — 애플 값이 사용자가 정한 이름을 밀어내면 안 된다', () => {
    expect(shouldPersistAppleName(null, '김민수')).toBe(true);
    expect(shouldPersistAppleName('   ', '김민수')).toBe(true);
    expect(shouldPersistAppleName('기존이름', '김민수')).toBe(false);
    expect(shouldPersistAppleName(null, null)).toBe(false); // 재로그인: 애플이 이름을 안 준다
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
describe('이메일 미제공·릴레이 처리', () => {
  it('릴레이 주소를 인식한다 — 없는 이메일이 아니라 진짜 주소다', () => {
    expect(isApplePrivateRelayEmail('abc123@privaterelay.appleid.com')).toBe(true);
    expect(isApplePrivateRelayEmail('ABC@PrivateRelay.AppleID.com')).toBe(true);
    expect(isApplePrivateRelayEmail('me@gmail.com')).toBe(false);
    expect(isApplePrivateRelayEmail(null)).toBe(false);
  });

  // 네이버 브리지의 EMAIL_REQUIRED 는 그 Edge 안에만 있다. 애플은 Supabase provider 를 타므로
  // GoTrue 가 ID 토큰의 email 클레임으로 사용자를 만든다 — 이 경로에는 이메일 게이트가 없다.
  it('애플 경로에는 이메일 필수 게이트가 없다 — naver-auth 안에만 있다', () => {
    const naverEdge = fs.readFileSync(
      path.join(__dirname, '..', '..', '..', '..', 'supabase', 'functions', 'naver-auth', 'index.ts'), 'utf8',
    );
    expect(naverEdge).toContain('EMAIL_REQUIRED');
    expect(src('features/auth/apple/appleAuthService.ts')).not.toContain('EMAIL_REQUIRED');
    expect(src('features/auth/services/authService.ts')).not.toContain('EMAIL_REQUIRED');
  });

  it('이메일을 지어내지 않는다', () => {
    const s = src('features/auth/apple/appleAuthService.ts') + src('features/auth/apple/appleIdentity.ts');
    expect(s).not.toMatch(/@example\.|@deokbun|fallbackEmail|makeEmail|`\$\{[^}]*\}@/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
describe('에러 코드 매핑', () => {
  it('취소는 CANCELLED 이고 화면에서 조용히 무시된다 — 배너를 띄우면 안 된다', () => {
    expect(mapAppleErrorToReason('ERR_REQUEST_CANCELED')).toBe('CANCELLED');
    const outcome = authReasonToOutcome('CANCELLED');
    expect(outcome).toBe('AUTH_CANCELLED');
    expect(isSilentOutcome(outcome)).toBe(true);
  });

  it('나머지는 전부 기존 어휘로 떨어지고 사람이 읽을 메시지가 있다', () => {
    const codes = ['ERR_REQUEST_NOT_HANDLED', 'ERR_REQUEST_UNKNOWN', 'ERR_INVALID_RESPONSE', 'ERR_REQUEST_FAILED', '', null, undefined, 42];
    for (const c of codes) {
      const reason = mapAppleErrorToReason(c);
      expect(['CANCELLED', 'NOT_SUPPORTED', 'REQUEST_FAILED']).toContain(reason);
      const msg = authOutcomeMessage(authReasonToOutcome(reason));
      expect(typeof msg).toBe('string');
      expect(msg.length).toBeGreaterThan(0);
    }
  });

  it('알 수 없는 코드는 성공으로 새지 않는다 — 기본값이 REQUEST_FAILED 다', () => {
    expect(mapAppleErrorToReason('ERR_SOMETHING_NEW_IN_A_FUTURE_SDK')).toBe('REQUEST_FAILED');
  });

  it('토큰이 없으면 세션을 만들지 않는다', () => {
    expect(readIdentityToken({ identityToken: null })).toBeNull();
    expect(readIdentityToken({ identityToken: '  ' })).toBeNull();
    expect(readIdentityToken(null)).toBeNull();
    expect(readIdentityToken({ identityToken: 'eyJ...' })).toBe('eyJ...');
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
describe('소스 계약 — 렌더 하네스가 없어 소스로 잠근다', () => {
  const login = src('app/login.tsx');
  const service = src('features/auth/services/authService.ts');
  const nativeSvc = src('features/auth/apple/appleAuthService.ts');
  const button = src('components/SocialButton/SocialButton.tsx');

  it('로그인 화면이 4종을 모두 렌더한다', () => {
    for (const p of ['apple', 'kakao', 'naver', 'google']) {
      expect(login).toContain(`provider="${p}"`);
      expect(login).toContain(`handleLogin('${p}')`);
    }
  });

  it('iOS 에서는 애플이 첫 번째, 그 외에서는 마지막', () => {
    expect(login).toContain("const APPLE_FIRST_ON_IOS = Platform.OS === 'ios'");
    // 애플 버튼이 두 번 쓰이되 하나는 kakao 앞, 하나는 google 뒤 — 조건이 서로 배타적이다.
    const first = login.indexOf('APPLE_FIRST_ON_IOS ? (');
    const kakao = login.indexOf('provider="kakao"');
    const google = login.indexOf('provider="google"');
    const last = login.indexOf('APPLE_FIRST_ON_IOS ? null : (');
    expect(first).toBeGreaterThan(-1);
    expect(first).toBeLessThan(kakao);
    expect(last).toBeGreaterThan(google);
  });

  it('SocialButton 에 애플 스타일이 있고, 로고를 임의로 만들지 않았다', () => {
    expect(button).toMatch(/apple:\s*\{[^}]*bg:\s*'#000000'/);
    expect(button).toMatch(/apple:\s*\{[^}]*mark:\s*null/); // 공식 마크 에셋 대기 — 4종 모두 동일
    expect(button).not.toMatch(/, mark: '.*'/); // 이모지·문자로 로고를 흉내내지 않는다
  });

  it('네이티브 모듈은 지연 로드다 — 정적 import 면 web/Android 번들과 jest 가 깨진다', () => {
    expect(nativeSvc).toContain("require('expo-apple-authentication')");
    expect(nativeSvc).not.toMatch(/^import .*expo-apple-authentication/m);
  });

  it('네이티브가 없으면 브라우저 경로로 떨어진다 — not_available 은 실패가 아니다', () => {
    expect(service).toContain("if (providerId === 'apple')");
    expect(service).toContain('not_available');
    expect(service).toContain("native.kind === 'success'");
    expect(service).toContain("native.kind === 'failed'");
  });

  it('취소를 브라우저로 재시도하지 않는다 — failed 면 그대로 반환한다', () => {
    const branch = service.slice(service.indexOf("if (providerId === 'apple')"));
    const upToOauth = branch.slice(0, branch.indexOf('resolveSupabaseProvider'));
    expect(upToOauth).toContain("return { success: false, reason: native.reason }");
  });

  it('기존 3종 경로는 그대로다 — 네이버 브리지와 공용 OAuth 흐름이 살아 있다', () => {
    expect(service).toContain("if (providerId === 'naver')");
    expect(service).toContain('signInWithNaverBridge()');
    expect(service).toContain('signInWithSupabaseOAuth(resolution.supabaseProvider)');
  });
});
