// F-05 — 기본 정보가 깨졌을 때 **무엇이 보이고 덕이 어떻게 되는가** (2026-09-21 합성 반례).
//
// 2026-09-18 전수 조사 실측:
//   ① 출생지 칸이 없는 명식이 들어오면 계산 단계에서 터져 **500** 이 났다. 화면에는 "다시 시도" 가 떴고
//      다시 해도 같았다.
//   ② 그 예외 경로는 **덕 예약을 풀지 않았고**, 만료돼도 풀어 주는 장치가 없어 덕이 영구히 잠겼다
//      (staging 에 잠긴 예약 1건 · 5덕).
// 이제 ① 서버가 **모양을 먼저 보고** 403 PROFILE_REQUIRED 로 돌려보내고 ② 예외가 나도 예약을 푼다.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { parseAiConsentRequired, parseProfileRequired } from '@/features/chat/adapters/llmError';
import { mapConsultationError } from '@/features/chat/consultationErrors';

function edgeError(status: number, body: unknown) {
  return { name: 'FunctionsHttpError', context: { status, json: async () => body } };
}

describe('403 을 구분해서 읽는다', () => {
  it('기본 정보 문제(403 PROFILE_REQUIRED)를 알아본다', async () => {
    expect(await parseProfileRequired(edgeError(403, { error: 'PROFILE_REQUIRED' }))).toBe(true);
  });

  it('AI 동의 문제(같은 403)와 섞이지 않는다', async () => {
    const consent = edgeError(403, { error: 'AI_CONSENT_REQUIRED' });
    expect(await parseProfileRequired(consent)).toBe(false);
    expect(await parseAiConsentRequired(consent)).toBe(true);
  });

  it('401(로그인)과도 섞이지 않는다', async () => {
    expect(await parseProfileRequired(edgeError(401, { error: 'AUTH_REQUIRED' }))).toBe(false);
  });

  it('본문을 못 읽으면 기본 정보 문제로 단정하지 않는다', async () => {
    expect(await parseProfileRequired({ name: 'FunctionsFetchError' })).toBe(false);
  });
});

describe('화면 문구 — 재시도를 권하지 않는다', () => {
  it('기본 정보가 필요하다고 말하고, 재시도 버튼을 주지 않는다', () => {
    const view = mapConsultationError('PROFILE_REQUIRED');
    expect(view.kind).toBe('input');
    expect(view.canRetry).toBe(false);
    expect(view.message).toContain('기본 정보가 필요해요');
  });

  it('예전처럼 "연결 상태를 확인" 으로 뭉개지 않는다', () => {
    expect(mapConsultationError('PROFILE_REQUIRED').message).not.toContain('연결 상태');
  });
});

describe('서버 쪽 — 모양 검사와 예약 해제', () => {
  const edge = readFileSync(join(process.cwd(), 'supabase', 'functions', 'chat', 'index.ts'), 'utf8');

  it('저장된 출생정보의 **모양**을 먼저 본다 (출생지 · 시각 칸 포함)', () => {
    const fn = edge.slice(edge.indexOf('function storedSubjectBirth'), edge.indexOf('async function resolveConsumerAuthority'));
    expect(fn).toContain("typeof birth.birthPlace !== 'string'");
    expect(fn).toContain("typeof birth.birthHour !== 'string'");
    expect(fn).toContain("typeof birth.birthMinute !== 'string'");
  });

  it('처리되지 않은 예외에서도 **덕 예약을 푼다**', () => {
    const catchBlock = edge.slice(edge.lastIndexOf('} catch (error) {'));
    expect(catchBlock).toContain('releasePaidRequest(heldPaidRequest)');
    expect(catchBlock).toContain('releaseSessionReservation(admin, heldDukReservation)');
  });

  it('예약 직전에 만료된 예약을 정리한다 (크론 없이 스스로)', () => {
    expect(edge).toContain("release_expired_reservations");
  });
});

describe('만료된 예약은 잔액을 잡지 않는다 (마이그레이션)', () => {
  const sql = readFileSync(
    join(process.cwd(), 'supabase', 'migrations', '20260927000000_expired_reservations.sql'), 'utf8',
  );

  it('쓸 수 있는 덕 계산에서 만료된 예약을 뺀다', () => {
    expect(sql).toContain("where status = 'RESERVED'");
    expect(sql).toContain('and expires_at > now()');
  });

  it('뷰를 다시 만든 뒤 보안 설정을 다시 건다 (2026-09-20 의 잔액 공개 문제 재발 방지)', () => {
    expect(sql).toContain('security_invoker = true');
    expect(sql).toContain('revoke select on table public.duk_spendable from anon');
  });
});
