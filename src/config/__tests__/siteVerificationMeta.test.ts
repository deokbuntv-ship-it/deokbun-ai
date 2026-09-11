// 소유확인 메타 — ⚠ **합성 입력만.** 실제 dist 를 읽지 않는다(빌드 전에도 돌아야 한다).
import { VERIFICATION_ENV, verificationMetaTags, withVerificationMeta } from '../siteVerificationMeta';

const HTML = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>덕분이</title></head><body>x</body></html>';

describe('값이 없으면 태그도 없다', () => {
  it.each([
    ['빈 env', {}],
    ['빈 문자열', { EXPO_PUBLIC_GOOGLE_SITE_VERIFICATION: '', EXPO_PUBLIC_NAVER_SITE_VERIFICATION: '' }],
    ['공백만', { EXPO_PUBLIC_GOOGLE_SITE_VERIFICATION: '   ' }],
  ])('%s', (_l, env) => {
    expect(verificationMetaTags(env)).toBe('');
    expect(withVerificationMeta(HTML, env)).toBe(HTML);
  });
});

describe('값이 있으면 head 안에 들어간다', () => {
  it('구글만', () => {
    const out = withVerificationMeta(HTML, { EXPO_PUBLIC_GOOGLE_SITE_VERIFICATION: 'gtok' });
    expect(out).toContain('<meta name="google-site-verification" content="gtok">');
    expect(out).not.toContain('naver-site-verification');
    // <head> 바로 뒤 — </head> 밖으로 새지 않는다.
    expect(out.indexOf('google-site-verification')).toBeLessThan(out.indexOf('</head>'));
  });

  it('네이버만', () => {
    const out = withVerificationMeta(HTML, { EXPO_PUBLIC_NAVER_SITE_VERIFICATION: 'ntok' });
    expect(out).toContain('<meta name="naver-site-verification" content="ntok">');
    expect(out).not.toContain('google-site-verification');
  });

  it('둘 다', () => {
    const out = withVerificationMeta(HTML, {
      EXPO_PUBLIC_GOOGLE_SITE_VERIFICATION: 'gtok',
      EXPO_PUBLIC_NAVER_SITE_VERIFICATION: 'ntok',
    });
    expect(out).toContain('content="gtok"');
    expect(out).toContain('content="ntok"');
  });

  it('⚠ 두 번 넣어도 하나만 남는다', () => {
    const env = { EXPO_PUBLIC_GOOGLE_SITE_VERIFICATION: 'gtok' };
    const once = withVerificationMeta(HTML, env);
    const twice = withVerificationMeta(once, env);
    expect(twice).toBe(once);
    expect(twice.match(/google-site-verification/g)).toHaveLength(1);
  });

  it('⚠ 값이 바뀌면 옛 값이 남지 않는다', () => {
    const first = withVerificationMeta(HTML, { EXPO_PUBLIC_GOOGLE_SITE_VERIFICATION: 'old' });
    const second = withVerificationMeta(first, { EXPO_PUBLIC_GOOGLE_SITE_VERIFICATION: 'new' });
    expect(second).toContain('content="new"');
    expect(second).not.toContain('content="old"');
  });

  it('⚠ 따옴표가 섞여도 head 가 깨지지 않는다', () => {
    const out = withVerificationMeta(HTML, { EXPO_PUBLIC_GOOGLE_SITE_VERIFICATION: 'a"b<c' });
    expect(out).toContain('content="a&quot;b&lt;c"');
    expect(out).toContain('</head>');
  });

  it('head 가 없는 문서는 손대지 않는다', () => {
    const frag = '<div>없음</div>';
    expect(withVerificationMeta(frag, { EXPO_PUBLIC_GOOGLE_SITE_VERIFICATION: 'g' })).toBe(frag);
  });

  it('환경변수 이름은 EXPO_PUBLIC_ 로 시작한다 (빌드가 읽을 수 있어야 한다)', () => {
    for (const k of Object.keys(VERIFICATION_ENV)) expect(k.startsWith('EXPO_PUBLIC_')).toBe(true);
  });
});
