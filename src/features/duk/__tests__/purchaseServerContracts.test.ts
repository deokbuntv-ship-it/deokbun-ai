// 결제 경로의 **나머지 다섯 곳** — 실구매 전에 함께 고쳐야 헛돌지 않는다 (PART 1-2 · 2026-09-21).
//
// 2026-09-18 전수 조사에서 나온 것들이다. 요청 키(①)와 이벤트(②)는 `expoIapAdapter.test.ts` 가 본다.
// 여기서는 서버 · 설정 쪽 네 가지를 본다.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const read = (...parts: string[]) => readFileSync(join(process.cwd(), ...parts), 'utf8');

describe('③ 승인 재시도 크론이 서버 입구에서 막히지 않는다', () => {
  it('`iap-reconcile` 에 JWT 검사를 끈 블록이 있다 (크론은 x-cron-secret 하나로 인증한다)', () => {
    const config = read('supabase', 'config.toml');
    const block = config.slice(config.indexOf('[functions.iap-reconcile]'));
    expect(block).toContain('[functions.iap-reconcile]');
    expect(block.slice(0, 120)).toContain('verify_jwt = false');
  });

  it('다른 크론 워커와 같은 모양이다', () => {
    const config = read('supabase', 'config.toml');
    for (const fn of ['run-scheduled-notifications', 'retry-notification-deliveries']) {
      const block = config.slice(config.indexOf(`[functions.${fn}]`), config.indexOf(`[functions.${fn}]`) + 120);
      expect(block).toContain('verify_jwt = false');
    }
  });
});

describe('④ 앱이 켜질 때도 미처리 구매를 주워 온다', () => {
  it('앱 시작 지점에서 복구를 부른다 (예전에는 충전 화면에 들어갈 때만 돌았다)', () => {
    const layout = read('src', 'app', '_layout.tsx');
    expect(layout).toContain('purchaseService.recoverPendingPurchases()');
  });

  it('안내 문구가 말하는 것과 실제가 같아졌다', () => {
    const copy = read('src', 'features', 'duk', 'iap', 'purchaseUiText.ts');
    expect(copy).toContain('앱을 다시 열면 이어서 처리됩니다');
  });
});

describe('⑤ RTDN 거절 기록이 실제로 남는다', () => {
  const rtdn = read('supabase', 'functions', 'google-rtdn', 'index.ts');
  const audit = read('supabase', 'migrations', '20260842000000_admin_economy_ops.sql');

  it('없는 칸에 넣지 않는다 (예전에는 한 줄도 남지 않았다)', () => {
    const logFn = rtdn.slice(rtdn.indexOf('async function logRejected'), rtdn.indexOf('Deno.serve'));
    // 주석에는 왜 고쳤는지 남아 있으므로 **insert 호출**만 본다.
    const insert = logFn.slice(logFn.indexOf('.insert('), logFn.indexOf('.then('));
    expect(insert).not.toContain('target_type');
    expect(insert).not.toContain('detail:');
  });

  it('넣는 칸이 표에 실제로 있다', () => {
    const table = audit.slice(audit.indexOf('create table if not exists public.admin_audit_log'), audit.indexOf(');', audit.indexOf('create table if not exists public.admin_audit_log')));
    const logFn = rtdn.slice(rtdn.indexOf('async function logRejected'), rtdn.indexOf('Deno.serve'));
    for (const column of ['action', 'reason_note', 'metadata']) {
      expect(logFn).toContain(`${column}`);
      expect(table).toContain(column);
    }
  });
});

describe('⑥ 승인 400 을 전부 "이미 승인됨" 으로 보지 않는다', () => {
  const play = read('supabase', 'functions', '_shared', 'googlePlay.ts');

  it('구글이 말한 까닭을 읽고 판단한다', () => {
    const fn = play.slice(play.indexOf('export async function acknowledgeProduct'));
    expect(fn).toContain('already');
    expect(fn).toMatch(/already\\s\*been\\s\*acknowledged|alreadyAcknowledged/);
  });

  it('까닭을 모르면 실패로 둔다 — 재시도 크론이 다시 시도할 수 있어야 한다', () => {
    const fn = play.slice(play.indexOf('export async function acknowledgeProduct'));
    const branch = fn.slice(fn.indexOf('if (res.status === 400)'), fn.indexOf('return \'failed\';', fn.indexOf('if (res.status === 400)')) + 20);
    expect(branch).toContain("'failed'");
  });
});
