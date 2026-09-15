// AI 답변 신고 — 순수 계약 + SQL 계약.
//
// ⚠ 실제 동작은 staging 실측이 했다(2026-09-11, 사용자 토큰 A·B·관리자 C, 22/22).
//   이 파일은 그 구조가 조용히 되돌아가지 않게 잠근다.
import * as fs from 'fs';
import * as path from 'path';

import {
  REPORT_ACK_TEXT,
  REPORT_DETAIL_MAX,
  REPORT_REASONS,
  REPORT_REASON_LABEL,
  REPORT_SURFACES,
  validateReport,
} from '../aiContentReport';

const SQL = fs.readFileSync(
  path.resolve(__dirname, '../../../../supabase/migrations/20260917000000_ai_content_reports.sql'),
  'utf8',
);
const BODY = SQL.split('\n').filter((l) => !/^\s*--/.test(l)).join('\n');

describe('보내기 전 검사', () => {
  const base = { messageId: 'msg-1', reason: 'inappropriate' as const };

  it.each([
    ['정상', base, true],
    ['설명 있음', { ...base, detail: '이런 점이 문제였습니다' }, true],
    ['설명 없음 (선택 입력)', { ...base, detail: null }, true],
    ['공백만 적은 설명', { ...base, detail: '   ' }, true],
    ['1000자 정확히', { ...base, detail: 'x'.repeat(REPORT_DETAIL_MAX) }, true],
  ])('통과 — %s', (_l, input, want) => {
    expect(validateReport(input).ok).toBe(want);
  });

  it.each([
    ['빈 messageId', { messageId: '', reason: 'other' as const }, 'MESSAGE_REQUIRED'],
    ['공백만인 messageId', { messageId: '   ', reason: 'other' as const }, 'MESSAGE_REQUIRED'],
    ['목록에 없는 사유', { messageId: 'm', reason: 'made_up' as never }, 'REASON_REQUIRED'],
    ['빈 사유', { messageId: 'm', reason: '' as never }, 'REASON_REQUIRED'],
    ['1001자 설명', { messageId: 'm', reason: 'other' as const, detail: 'x'.repeat(REPORT_DETAIL_MAX + 1) }, 'DETAIL_TOO_LONG'],
  ])('⚠ 걸림 — %s', (_l, input, want) => {
    const v = validateReport(input);
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.reason).toBe(want);
  });

  it('⚠ 공백만인 설명은 null 로 눕는다 — "적었다" 로 세지 않는다', () => {
    const v = validateReport({ ...base, detail: '  \n \t ' });
    expect(v.ok).toBe(true);
    if (v.ok) expect(v.value.detail).toBeNull();
  });

  it('앞뒤 공백을 다듬는다', () => {
    const v = validateReport({ messageId: '  m1  ', reason: 'other', detail: '  내용  ' });
    expect(v.ok).toBe(true);
    if (v.ok) {
      expect(v.value.messageId).toBe('m1');
      expect(v.value.detail).toBe('내용');
    }
  });

  it('surface 기본값은 consultation', () => {
    const v = validateReport(base);
    if (v.ok) expect(v.value.surface).toBe('consultation');
  });
});

describe('문구', () => {
  it('사유 네 가지에 전부 한국어 문구가 있다', () => {
    expect(REPORT_REASONS).toHaveLength(4);
    for (const r of REPORT_REASONS) expect(REPORT_REASON_LABEL[r].length).toBeGreaterThan(0);
  });

  it('⚠ 톤 규칙 — 겁주거나 단정하거나 상담을 강권하지 않는다', () => {
    const all = [...Object.values(REPORT_REASON_LABEL), REPORT_ACK_TEXT].join(' ');
    expect(all).not.toMatch(/반드시|절대|위험합니다|큰일|불행|경고합니다|상담을 받으세요/);
  });

  it('⚠ 지키지 못할 약속을 하지 않는다', () => {
    // "24시간 안에" · "반드시 답변" 같은 약속은 운영이 감당하지 못한다.
    expect(REPORT_ACK_TEXT).not.toMatch(/\d+\s*(시간|일)\s*(안|내)|반드시 답변|모두 답변/);
    expect(REPORT_ACK_TEXT).toMatch(/받았습니다/);
  });
});

describe('SQL 계약', () => {
  it('사유 목록이 코드와 DB 에서 같다', () => {
    const m = BODY.match(/reason\s+text not null check \(reason in \(([^)]*)\)\)/);
    expect(m).not.toBeNull();
    const dbReasons = (m?.[1] ?? '').split(',').map((s) => s.trim().replace(/'/g, ''));
    expect(dbReasons.sort()).toEqual([...REPORT_REASONS].sort());
  });

  it('화면 목록이 코드와 DB 에서 같다', () => {
    const m = BODY.match(/check \(surface in \(([^)]*)\)\)/);
    const dbSurfaces = (m?.[1] ?? '').split(',').map((s) => s.trim().replace(/'/g, ''));
    expect(dbSurfaces.sort()).toEqual([...REPORT_SURFACES].sort());
  });

  it('설명 길이 상한이 코드와 DB 에서 같다', () => {
    expect(BODY).toMatch(new RegExp(`length\\(detail\\) <= ${REPORT_DETAIL_MAX}`));
  });

  it('⚠ 사용자가 못 정하는 칸을 트리거가 강제한다', () => {
    for (const col of ['status', 'admin_note', 'reviewed_at', 'reviewed_by', 'user_id']) {
      expect(BODY).toMatch(new RegExp(`new\\.${col}\\s*:=`));
    }
  });

  it('⚠ 남의 대화로 위장하는 것을 막는다', () => {
    expect(BODY).toMatch(/c\.user_id = auth\.uid\(\)/);
    expect(BODY).toMatch(/raise exception 'conversation not owned'/);
  });

  it('⚠ 사용자에게 UPDATE·DELETE 정책이 없다 — 신고는 지워지지 않는다', () => {
    const userPolicies = [...BODY.matchAll(/create policy (\w+) on public\.ai_content_reports\s+for (\w+)/g)]
      .map((m) => [m[1], m[2].toLowerCase()] as const);
    const nonAdmin = userPolicies.filter(([name]) => !name.includes('admin'));
    expect(nonAdmin.map(([, cmd]) => cmd).sort()).toEqual(['insert', 'select']);
  });

  it('같은 답변을 두 번 신고해도 한 건만 남는다', () => {
    expect(BODY).toMatch(/create unique index if not exists ai_content_reports_user_message_uniq/);
    expect(BODY).toMatch(/on public\.ai_content_reports \(user_id, message_id\)/);
  });

  it('⚠ 관리자 목록이 신고자 user_id 를 내보내지 않는다', () => {
    const fn = BODY.slice(BODY.indexOf('create or replace function public.admin_ai_content_reports'));
    expect(fn).toMatch(/reporter_key text/);
    expect(fn).toMatch(/digest\(r\.user_id::text, 'sha256'\)/);
    // returns table 목록에 user_id 자체가 없다.
    const returns = fn.slice(fn.indexOf('returns table'), fn.indexOf('language plpgsql'));
    expect(returns).not.toMatch(/\buser_id\b/);
  });

  it('관리자 목록은 is_admin 이 아니면 거절한다', () => {
    expect(BODY).toMatch(/if not public\.is_admin\(\) then raise exception 'not authorized'/);
  });

  it('⚠ search_path 에 extensions 가 있다 (digest 를 쓴다)', () => {
    const fn = BODY.slice(BODY.indexOf('create or replace function public.admin_ai_content_reports'));
    expect(fn).toMatch(/set search_path = public, extensions, pg_temp/);
  });

  it('멱등성 3원칙', () => {
    expect(BODY).toMatch(/create table if not exists public\.ai_content_reports/);
    expect(BODY).not.toMatch(/insert into public\./);
    for (const p of [...BODY.matchAll(/create policy (\w+)/g)].map((m) => m[1])) {
      expect(BODY).toMatch(new RegExp(`drop policy if exists ${p}`));
    }
    for (const t of [...BODY.matchAll(/create trigger (\w+)/g)].map((m) => m[1])) {
      expect(BODY).toMatch(new RegExp(`drop trigger if exists ${t}`));
    }
  });
});
