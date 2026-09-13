// 제3자 AI 처리 동의 — 순수 계약 + SQL 계약 + Edge 게이트 계약 (애플 5.1.2(i)).
//
// ⚠ 실제 동작은 staging 실측이 했다 (2026-09-11, AI_CONSENT_ENFORCED=true, 10/10):
//   동의 없음 → 403 · 동의 후 → 통과 · 철회 → 다시 403 · 옛 버전 → 재동의 요구 ·
//   동의 위조(표 직접 INSERT) → 42501 · 남의 동의 읽기 → 0건.
//   이 파일은 그 구조가 조용히 되돌아가지 않게 잠근다.
import * as fs from 'fs';
import * as path from 'path';

import {
  AI_CONSENT_DEFAULT_CHECKED,
  AI_CONSENT_PROCESSORS,
  AI_CONSENT_PURPOSE,
  AI_CONSENT_REQUIRED_CODE,
  AI_CONSENT_SENT_ITEMS,
  AI_CONSENT_VERSION,
  AI_CONSENT_WITHDRAW_NOTE,
  parseConsentState,
} from '../aiProcessingConsent';

const ROOT = path.resolve(__dirname, '../../../..');
const SQL = fs.readFileSync(path.join(ROOT, 'supabase/migrations/20260918000000_ai_processing_consent.sql'), 'utf8');
const BODY = SQL.split('\n').filter((l) => !/^\s*--/.test(l)).join('\n');
const EDGE = fs.readFileSync(path.join(ROOT, 'supabase/functions/chat/index.ts'), 'utf8');

describe('동의 문안 — 애플이 요구하는 세 가지를 말한다', () => {
  it('무엇을 보내는지 — 코드가 실제로 보내는 것들이다', () => {
    expect(AI_CONSENT_SENT_ITEMS.length).toBeGreaterThanOrEqual(4);
    const all = AI_CONSENT_SENT_ITEMS.join(' ');
    // 실제로 나가는 것: 출생정보(연월일시·성별·지역) + 상담 내용 + 궁합 상대
    expect(all).toMatch(/생년월일/);
    expect(all).toMatch(/시각|시간/);
    expect(all).toMatch(/성별/);
    expect(all).toMatch(/질문|대화/);
  });

  it('⚠ 누구에게 — 업체명을 명시한다. "제3자" 로만 쓰면 5.1.2(i) 를 만족하지 못한다', () => {
    const names = AI_CONSENT_PROCESSORS.map((p) => p.name);
    expect(names).toContain('OpenAI');
    expect(names).toContain('Supabase');
    // 어느 나라로 가는지도 적는다 (국외 이전 기재의 근거가 된다).
    for (const p of AI_CONSENT_PROCESSORS) expect(p.region.length).toBeGreaterThan(0);
  });

  it('왜 보내는지 — 목적이 한정돼 있다', () => {
    expect(AI_CONSENT_PURPOSE).toMatch(/해석문|해석/);
    // "계산은 앱이 한다" 는 사실을 말한다 — AI 가 명식을 지어내지 않는다는 것이 이 제품의 핵심이다.
    expect(AI_CONSENT_PURPOSE).toMatch(/계산/);
  });

  it('⚠ 기본값은 미체크다 — 미리 체크된 동의는 명시적 동의가 아니다', () => {
    expect(AI_CONSENT_DEFAULT_CHECKED).toBe(false);
  });

  it('철회 경로와 결과를 말한다', () => {
    expect(AI_CONSENT_WITHDRAW_NOTE).toMatch(/철회/);
    expect(AI_CONSENT_WITHDRAW_NOTE).toMatch(/MY|설정/);
    // 동의하지 않아도 앱을 쓸 수 있다는 사실 — 강권하지 않는다.
    expect(AI_CONSENT_WITHDRAW_NOTE).toMatch(/동의하지 않으셔도/);
  });

  it('⚠ 톤 규칙 — 겁주거나 단정하거나 상담을 강권하지 않는다', () => {
    const all = [AI_CONSENT_PURPOSE, AI_CONSENT_WITHDRAW_NOTE, ...AI_CONSENT_SENT_ITEMS].join(' ');
    expect(all).not.toMatch(/반드시|절대|위험합니다|큰일|불행|경고/);
  });

  it('버전 형식이 terms.ts 와 같은 계열이다', () => {
    expect(AI_CONSENT_VERSION).toMatch(/^ai-processing@\d{4}-\d{2}-\d+$/);
  });
});

describe('상태 읽기 — 모르는 것을 동의한 것으로 읽지 않는다', () => {
  it.each([
    ['정상 granted', { granted: true, version: AI_CONSENT_VERSION, grantedAt: '2026-09-11T00:00:00Z' }, true],
    ['granted 지만 version 없음', { granted: true, grantedAt: 'x' }, false],
    ['granted 지만 grantedAt 없음', { granted: true, version: 'v' }, false],
    ['none', { granted: false, reason: 'none' }, false],
    ['revoked', { granted: false, reason: 'revoked', revokedAt: 'x' }, false],
    ['null', null, false],
    ['문자열', 'granted', false],
    ['빈 객체', {}, false],
  ])('%s', (_l, raw, want) => {
    expect(parseConsentState(raw).granted).toBe(want);
  });

  it('알 수 없는 응답은 unknown 이고 동의가 아니다', () => {
    const s = parseConsentState({ weird: 1 });
    expect(s.granted).toBe(false);
    if (!s.granted) expect(s.reason).toBe('unknown');
  });

  it('철회 시각을 보존한다', () => {
    const s = parseConsentState({ granted: false, reason: 'revoked', revokedAt: '2026-09-11T01:00:00Z' });
    expect(s.granted).toBe(false);
    if (!s.granted) expect(s.revokedAt).toBe('2026-09-11T01:00:00Z');
  });
});

describe('SQL 계약', () => {
  it('⚠ 사용자는 읽기만 한다 — granted_at 을 클라이언트가 정하면 증거가 아니게 된다', () => {
    const policies = [...BODY.matchAll(/create policy (\w+) on public\.ai_processing_consents\s+for (\w+)/g)]
      .map((m) => m[2].toLowerCase());
    expect(policies.sort()).toEqual(['select', 'select']); // 본인 + 관리자, 둘 다 select
    expect(BODY).not.toMatch(/create policy \w+ on public\.ai_processing_consents\s+for (insert|update|all|delete)/);
  });

  it('동의·철회·조회 RPC 셋이 있고 authenticated 에게만 열려 있다', () => {
    for (const fn of ['grant_ai_consent', 'revoke_ai_consent', 'ai_consent_state']) {
      expect(BODY).toMatch(new RegExp(`create or replace function public\\.${fn}`));
      expect(BODY).toMatch(new RegExp(`revoke all on function public\\.${fn}\\([^)]*\\) from anon`));
      expect(BODY).toMatch(new RegExp(`grant execute on function public\\.${fn}\\([^)]*\\) to authenticated`));
    }
  });

  it('⚠ 같은 버전을 다시 동의하면 철회가 풀린다 (행을 쌓지 않는다)', () => {
    expect(BODY).toMatch(/on conflict \(user_id, consent_version\)/);
    expect(BODY).toMatch(/do update set revoked_at = null/);
  });

  it('버전을 주지 않으면 전부 철회한다', () => {
    expect(BODY).toMatch(/p_version is null or consent_version = btrim\(p_version\)/);
  });

  it('로그인하지 않으면 동의를 만들 수 없다', () => {
    expect(BODY).toMatch(/if auth\.uid\(\) is null then raise exception 'auth required'/);
  });

  it('멱등성 3원칙', () => {
    expect(BODY).toMatch(/create table if not exists public\.ai_processing_consents/);
    expect(BODY).not.toMatch(/insert into public\.\w+ \([^)]*\) values/);
    for (const p of [...BODY.matchAll(/create policy (\w+)/g)].map((m) => m[1])) {
      expect(BODY).toMatch(new RegExp(`drop policy if exists ${p}`));
    }
  });
});

describe('Edge 게이트 계약', () => {
  it('⚠ 설정값(데이터)으로 켜고 끈다 — 코드가 아니다', () => {
    expect(EDGE).toMatch(/Deno\.env\.get\('AI_CONSENT_ENFORCED'\)/);
    // 기본은 꺼짐. 'true' 일 때만 켜진다.
    expect(EDGE).toMatch(/AI_CONSENT_ENFORCED[^\n]*=== 'true'/);
  });

  it('⚠ 모든 사용자 대상 AI 경로가 지나는 한 곳에서 본다', () => {
    const fn = EDGE.slice(EDGE.indexOf('async function resolveConsumerAuthority'));
    const body = fn.slice(0, fn.indexOf('\n}\n'));
    expect(body).toMatch(/ai_processing_consents/);
    expect(body).toMatch(/return \{ status: 'ai_consent_required' \}/);
  });

  it('⚠ 조회가 실패하면 통과시키지 않는다 (fail-closed)', () => {
    const fn = EDGE.slice(EDGE.indexOf('if (AI_CONSENT_ENFORCED)'));
    expect(fn.slice(0, 700)).toMatch(/if \(consent\.error\) return \{ status: 'unavailable' \}/);
  });

  it('철회된 동의는 동의가 아니다', () => {
    const fn = EDGE.slice(EDGE.indexOf('if (AI_CONSENT_ENFORCED)'));
    expect(fn.slice(0, 700)).toMatch(/revoked_at.*!== null/s);
  });

  it('코드와 상태가 클라이언트로 나간다', () => {
    expect(EDGE).toMatch(/AI_CONSENT_REQUIRED: 403/);
    expect(EDGE).toMatch(/\? 'AI_CONSENT_REQUIRED'/);
  });

  it('클라이언트가 쓰는 코드 문자열과 같다', () => {
    expect(AI_CONSENT_REQUIRED_CODE).toBe('AI_CONSENT_REQUIRED');
    expect(EDGE).toContain(`'${AI_CONSENT_REQUIRED_CODE}'`);
  });

  it('⚠ 서버 기본 버전이 클라이언트 버전과 같다', () => {
    expect(EDGE).toContain(`|| '${AI_CONSENT_VERSION}'`);
  });
});

describe('개인정보 처리방침 대응 문구', () => {
  const legal = fs.readFileSync(path.join(ROOT, 'src/features/legal/legalContent.ts'), 'utf8');

  it('AI 전송 항목·업체·목적이 처방침에 적혀 있다', () => {
    expect(legal).toMatch(/\[법률 검토\][^']*OpenAI\(미국\)/);
    expect(legal).toMatch(/생년월일과 태어난 시각/);
  });

  it('철회 경로가 처방침에 적혀 있다', () => {
    expect(legal).toMatch(/\[법률 검토\][^']*철회/);
    expect(legal).toMatch(/AI 처리 동의/);
  });

  it('⚠ 국외 이전 확정 기재는 [법률 검토] 로 표시돼 있다', () => {
    expect(legal).toMatch(/\[법률 검토\][^']*국외 이전/);
  });
});
