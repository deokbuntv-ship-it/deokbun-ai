// 409 "아직 만드는 중" 을 실패와 구분한다 (2026-09-17).
//
// 2026-09-15 production 실측: 30초에 끊긴 뒤 누른 "다시 시도" 가 409 REQUEST_IN_PROGRESS 를 받았는데
// REQUEST_FAILED 로 뭉개져, 화면에는 같은 실패 문구만 반복됐다. 반례는 양방향이다 — 409 를 받아들이는가,
// 그리고 **다른 상태를 409 로 착각하지 않는가**.
import { parseRequestInProgress } from '@/features/chat/adapters/llmError';
import { mapConsultationError } from '@/features/chat/consultationErrors';

const err = (status: number, body?: unknown) => ({ context: { status, json: async () => body } });

describe('parseRequestInProgress', () => {
  it('409 REQUEST_IN_PROGRESS — 상담 경로', async () => {
    expect(await parseRequestInProgress(err(409, { error: 'REQUEST_IN_PROGRESS' }))).toBe(true);
  });

  it('409 GENERATION_IN_PROGRESS — 오늘·이달 운세 생성도 같은 뜻', async () => {
    expect(await parseRequestInProgress(err(409, { error: 'GENERATION_IN_PROGRESS' }))).toBe(true);
  });

  it('본문을 읽을 수 없어도 409 면 참으로 본다', async () => {
    expect(await parseRequestInProgress({ context: { status: 409 } })).toBe(true);
    expect(await parseRequestInProgress({ context: { status: 409, json: async () => { throw new Error('x'); } } })).toBe(true);
  });

  it('⚠ 반례 — 다른 상태는 전부 거짓 (실패를 "아직" 으로 착각하지 않는다)', async () => {
    for (const s of [400, 401, 402, 403, 422, 429, 500, 503]) {
      expect(await parseRequestInProgress(err(s, { error: 'REQUEST_IN_PROGRESS' }))).toBe(false);
    }
    expect(await parseRequestInProgress(null)).toBe(false);
    expect(await parseRequestInProgress(new Error('network'))).toBe(false);
  });

  it('⚠ 반례 — 409 라도 다른 오류면 거짓', async () => {
    expect(await parseRequestInProgress(err(409, { error: 'RATE_LIMITED' }))).toBe(false);
  });
});

describe('화면 문구 — 실패 카드가 아니라 기다림', () => {
  it('kind pending · 다시 시도 버튼 없음', () => {
    const view = mapConsultationError('REQUEST_IN_PROGRESS');
    expect(view.kind).toBe('pending');
    expect(view.canRetry).toBe(false);
    expect(view.message).toMatch(/만들고 있어요/);
    expect(view.message).not.toMatch(/가져오지 못했어요|실패/);
  });

  it('⚠ 반례 — 진짜 실패는 그대로 재시도 가능한 실패다', () => {
    const failed = mapConsultationError('REQUEST_FAILED');
    expect(failed.kind).toBe('recoverable');
    expect(failed.canRetry).toBe(true);
  });
});
