// 관리자 덕 화면 — 이메일로 찾기 · 진짜 오류 이유 (2026-09-17).
//
// 2026-09-15 실측이 이 테스트의 이유다. 오너가 사용자 ID 칸에 이메일을 넣었고 서버는 `22P02 invalid input
// syntax for type uuid` 를 돌려줬는데, 서비스가 오류를 버려서(`if (error) return null`) 화면에는 "사용자
// ID와 권한을 확인해 주세요" 한 줄만 떴다. 원인을 밝히는 데 production 조회 여덟 번이 들었다.
//
// 반례는 양방향이다: 이메일이 통해야 하고, **틀린 입력은 서버를 부르기 전에 멈춰야** 하며, 서버가 거절하면
// 그 이유가 그대로 올라와야 한다.
const rpc = jest.fn();
jest.mock('@/services/supabase', () => ({
  __esModule: true,
  getSupabaseClient: () => ({ rpc: (...args: unknown[]) => rpc(...args) }),
}));

import { adminEconomyService, classifyUserLookup } from '@/features/admin/services/adminEconomyService';

const UUID = 'aaf9189a-06a7-4205-91fe-fae2a257de89';

beforeEach(() => rpc.mockReset());

describe('입력 판정 — 서버를 부르기 전에 무엇이 들어왔는지 안다', () => {
  it.each([
    [UUID, 'uuid'],
    [UUID.toUpperCase(), 'uuid'],
    ['  ' + UUID + '  ', 'uuid'],
    ['name@example.com', 'email'],
    ['whtpdud47@gmail.com', 'email'],
    ['', 'unknown'],
    ['aaf9189a', 'unknown'],
    ['aaf9189a-06a7-4205-91fe', 'unknown'],
    ['name@example', 'unknown'],
    ['홍길동', 'unknown'],
  ])('%s → %s', (raw, kind) => {
    expect(classifyUserLookup(raw)).toBe(kind);
  });
});

describe('지갑 조회', () => {
  it('⚠ 이메일을 ID 칸에 넣으면 서버를 부르지 않고 바로 안내한다', async () => {
    const r = await adminEconomyService.getUserWallet('whtpdud47@gmail.com');
    expect(r.ok).toBe(false);
    expect(r.ok === false && r.message).toMatch(/이메일로 찾기|UUID/);
    expect(rpc).not.toHaveBeenCalled();
  });

  it('⚠ 서버가 거절하면 그 이유와 코드가 그대로 올라온다', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'not authorized', code: 'P0001' } });
    const r = await adminEconomyService.getUserWallet(UUID);
    expect(r.ok).toBe(false);
    expect(r.ok === false && r.message).toContain('not authorized');
    expect(r.ok === false && r.code).toBe('P0001');
  });

  it('정상 응답은 그대로 돌려준다', async () => {
    rpc.mockResolvedValue({ data: { user_id: UUID, spendable: 20 }, error: null });
    const r = await adminEconomyService.getUserWallet(UUID);
    expect(r.ok).toBe(true);
    expect(r.ok === true && r.data.spendable).toBe(20);
  });
});

describe('이메일로 사용자 찾기 — 관리자 전용 RPC 재사용', () => {
  it('정확히 한 명이면 그 사용자 ID 를 돌려준다', async () => {
    rpc.mockResolvedValue({ data: [{ user_id: UUID, display_name: '김덕분', created_at: '2026-08-07T13:24:15Z' }], error: null });
    const r = await adminEconomyService.findUserByEmail('whtpdud47@gmail.com');
    expect(r.ok).toBe(true);
    expect(r.ok === true && r.data.userId).toBe(UUID);
    expect(rpc).toHaveBeenCalledWith('admin_list_users', { p_search: 'whtpdud47@gmail.com', p_limit: 5, p_offset: 0 });
  });

  it('⚠ 반례 — 아무도 없으면 고르지 않고 안내한다', async () => {
    rpc.mockResolvedValue({ data: [], error: null });
    const r = await adminEconomyService.findUserByEmail('nobody@example.com');
    expect(r.ok).toBe(false);
    expect(r.ok === false && r.message).toMatch(/없어요/);
  });

  it('⚠ 반례 — 둘 이상이면 아무도 고르지 않는다 (덕 조정은 되돌릴 수 없다)', async () => {
    rpc.mockResolvedValue({ data: [{ user_id: UUID }, { user_id: '11111111-1111-4111-8111-111111111111' }], error: null });
    const r = await adminEconomyService.findUserByEmail('name@example.com');
    expect(r.ok).toBe(false);
    expect(r.ok === false && r.message).toMatch(/2명/);
  });

  it('⚠ 반례 — 이메일 모양이 아니면 서버를 부르지 않는다', async () => {
    const r = await adminEconomyService.findUserByEmail('홍길동');
    expect(r.ok).toBe(false);
    expect(rpc).not.toHaveBeenCalled();
  });

  it('⚠ 반례 — 관리자가 아니면 RPC 가 거절하고, 그 이유가 그대로 올라온다', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'not authorized', code: 'P0001' } });
    const r = await adminEconomyService.findUserByEmail('name@example.com');
    expect(r.ok).toBe(false);
    expect(r.ok === false && r.message).toContain('not authorized');
  });
});

describe('덕 조정', () => {
  it('⚠ 이메일이면 서버를 부르지 않는다 — 조정은 UUID 로만', async () => {
    const r = await adminEconomyService.adjustDuk({ userId: 'name@example.com', amount: 20, bucket: 'PLUS', note: '테스트' });
    expect(r.ok).toBe(false);
    expect(rpc).not.toHaveBeenCalled();
  });

  it('⚠ 서버 거절 이유가 그대로 올라온다 (잔액 부족 · 권한 · 입력 모양은 할 일이 다르다)', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'insufficient PLUS balance for debit (have 0, adjust -5)', code: 'P0001' } });
    const r = await adminEconomyService.adjustDuk({ userId: UUID, amount: -5, bucket: 'PLUS', note: '테스트' });
    expect(r.ok).toBe(false);
    expect(r.ok === false && r.message).toContain('insufficient PLUS balance');
  });

  it('성공하면 원장 id 를 돌려준다', async () => {
    rpc.mockResolvedValue({ data: 'ledger-1', error: null });
    const r = await adminEconomyService.adjustDuk({ userId: UUID, amount: 20, bucket: 'PLUS', note: '테스트' });
    expect(r.ok).toBe(true);
    expect(r.ok === true && r.data).toBe('ledger-1');
  });
});
