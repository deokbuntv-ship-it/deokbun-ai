// 덕 경제 V1 계약 — 인수인계서 확정값과 실제 구현이 같은지 한 곳에서 고정한다.
//
// 원장·reserve·commit·release 는 이미 구현되어 Edge 에 배선되어 있다(2026-09-02 인벤토리). 없던 것은
// 구현이 아니라 **구현이 확정값에서 벗어나면 알려주는 장치**였다. 정책 숫자는 마이그레이션 SQL 에,
// 청구 불변식은 sessionBilling.ts 의 순수 모델에, 실제 호출 순서는 Edge 소스에 흩어져 있어서
// 셋 중 하나만 바뀌어도 조용히 어긋난다. 이 파일이 그 세 곳을 한 번에 대조한다.
//
// 값을 바꾸는 것은 정책 변경이다. 이 테스트가 깨지면 먼저 "바꿔도 되는 값인가"를 물어야 한다.
import fs from 'fs';
import path from 'path';

import {
  DEFAULT_TURN_LIMIT,
  DEFAULT_SESSION_TTL_SECONDS,
  newSession,
  applyTurn,
} from '@/features/duk/sessionBilling';
import { DUK_PRICES, WELCOME_DUK, CANDLE_DUK, CANDLE_COOLDOWN_HOURS } from '@/features/duk/pricing';

const root = path.resolve(__dirname, '../../../..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

const ECONOMY_SQL = read('supabase/migrations/20260832000000_duk_economy_runtime.sql');
const SESSION_SQL = read('supabase/migrations/20260833000000_duk_session_runtime.sql');
const LEDGER_SQL = read('supabase/migrations/20260831000000_duk_economy_foundation.sql');
const EDGE = read('supabase/functions/chat/index.ts');

// economy_policy 의 `column integer not null default N` 에서 N 을 뽑는다.
const policyDefault = (column: string): number => {
  const m = ECONOMY_SQL.match(new RegExp(`${column}\\s+integer\\s+not null default (\\d+)`));
  if (!m) throw new Error(`economy_policy.${column} 기본값을 찾지 못했습니다`);
  return Number(m[1]);
};

describe('덕 경제 V1 — 인수인계서 확정값', () => {
  it('적립: 가입 10 · 촛불 1/24h · 생일 5', () => {
    expect(policyDefault('welcome_reward')).toBe(10);
    expect(policyDefault('candle_reward')).toBe(1);
    expect(policyDefault('candle_cooldown_seconds')).toBe(24 * 60 * 60);
    expect(policyDefault('birthday_reward')).toBe(5);
    // 클라이언트 표시 상수는 서버 정책의 거울이다 — 어긋나면 화면이 거짓말을 한다.
    expect(WELCOME_DUK).toBe(policyDefault('welcome_reward'));
    expect(CANDLE_DUK).toBe(policyDefault('candle_reward'));
    expect(CANDLE_COOLDOWN_HOURS * 3600).toBe(policyDefault('candle_cooldown_seconds'));
  });

  it('가격: 일반 5 · 궁합 12 · 프리미엄 50', () => {
    expect(policyDefault('general_session_cost')).toBe(5);
    expect(policyDefault('compatibility_session_cost')).toBe(12);
    expect(policyDefault('premium_report_cost')).toBe(50);
    expect(DUK_PRICES.general).toBe(policyDefault('general_session_cost'));
    expect(DUK_PRICES.compatibility).toBe(policyDefault('compatibility_session_cost'));
    expect(DUK_PRICES.premium_report).toBe(policyDefault('premium_report_cost'));
  });

  it('세션: 최대 5턴 · TTL 24h — 순수 모델과 DB 기본값이 같다', () => {
    expect(policyDefault('session_turn_limit')).toBe(5);
    expect(policyDefault('session_ttl_seconds')).toBe(24 * 60 * 60);
    expect(DEFAULT_TURN_LIMIT).toBe(policyDefault('session_turn_limit'));
    expect(DEFAULT_SESSION_TTL_SECONDS).toBe(policyDefault('session_ttl_seconds'));
  });

  it('차감 우선순위는 PLUS → REWARD → PAID 로 고정', () => {
    // 순서가 뒤집히면 유상 덕이 먼저 소진되어 사용자에게 불리해진다. SQL 상의 등장 순서로 고정한다.
    const plus = LEDGER_SQL.indexOf("values (p_user_id, 'PLUS'");
    const reward = LEDGER_SQL.indexOf("values (p_user_id, 'REWARD'");
    const paid = LEDGER_SQL.indexOf("values (p_user_id, 'PAID'");
    expect(plus).toBeGreaterThan(-1);
    expect(reward).toBeGreaterThan(plus);
    expect(paid).toBeGreaterThan(reward);
    // reserve 시점의 배분도 같은 순서여야 한다(§11).
    const rPlus = SESSION_SQL.indexOf('v_ap := v_take');
    const rReward = SESSION_SQL.indexOf('v_ar := v_take');
    const rPaid = SESSION_SQL.indexOf('v_apd := v_take');
    expect(rPlus).toBeGreaterThan(-1);
    expect(rReward).toBeGreaterThan(rPlus);
    expect(rPaid).toBeGreaterThan(rReward);
  });

  it('원장은 append-only: 버킷 3종, delta 0 금지, 세션당 1회 차변', () => {
    expect(LEDGER_SQL).toMatch(/bucket\s+text not null check \(bucket in \('PLUS','REWARD','PAID'\)\)/);
    expect(LEDGER_SQL).toMatch(/delta\s+integer not null check \(delta <> 0\)/);
    // 재시도가 두 번 청구하지 못하게 막는 유일한 장치.
    expect(LEDGER_SQL).toMatch(/create unique index[\s\S]{0,120}duk_ledger_session_reason_uniq/);
    expect(LEDGER_SQL).toMatch(/create unique index[\s\S]{0,120}duk_ledger_purchase_uniq/);
  });
});

describe('덕 경제 V1 — 청구 불변식 (순수 모델)', () => {
  const price = DUK_PRICES.general;
  const T0 = 1_800_000_000;

  it('첫 성공에서 정확히 한 번 청구하고, 2~5턴은 무료', () => {
    let s = newSession(price, T0);
    const first = applyTurn(s, 'SUCCESS', T0);
    expect(first.commitCharge).toBe(true);
    s = first.session;
    for (let turn = 2; turn <= 5; turn++) {
      const r = applyTurn(s, 'SUCCESS', T0);
      expect(r.commitCharge).toBe(false);
      s = r.session;
    }
    expect(s.successfulTurnCount).toBe(5);
  });

  it('첫 턴 실패는 예약을 풀고 0 청구 — 실패는 턴을 소모하지 않는다', () => {
    const r = applyTurn(newSession(price, T0), 'FAILURE', T0);
    expect(r.commitCharge).toBe(false);
    expect(r.releaseReserve).toBe(true);
    expect(r.turnConsumed).toBe(false);
  });

  it('SAFETY_HARDSTOP 도 청구하지 않고 턴을 소모하지 않는다', () => {
    const r = applyTurn(newSession(price, T0), 'SAFETY_HARDSTOP', T0);
    expect(r.commitCharge).toBe(false);
    expect(r.turnConsumed).toBe(false);
  });

  it('청구 후의 실패는 환불하지 않는다 — 이미 답을 받았기 때문', () => {
    const after = applyTurn(newSession(price, T0), 'SUCCESS', T0).session;
    const r = applyTurn(after, 'FAILURE', T0);
    expect(r.releaseReserve).toBe(false);
    expect(r.commitCharge).toBe(false);
  });

  it('TTL 만료와 턴 상한은 청구 없이 거절된다', () => {
    const expired = applyTurn(newSession(price, T0), 'SUCCESS', T0 + DEFAULT_SESSION_TTL_SECONDS + 1);
    expect(expired.rejected).toBe('EXPIRED');
    expect(expired.commitCharge).toBe(false);
    let s = newSession(price, T0);
    for (let i = 0; i < 5; i++) s = applyTurn(s, 'SUCCESS', T0).session;
    const over = applyTurn(s, 'SUCCESS', T0);
    expect(over.rejected).toBe('TURN_LIMIT');
    expect(over.commitCharge).toBe(false);
  });
});

describe('덕 경제 V1 — Edge 배선 (모델이 실제로 그렇게 불리는가)', () => {
  it('reserve → commit → release 세 경로가 모두 Edge 에 배선되어 있다', () => {
    expect(EDGE).toContain("rpc('reserve_session_duk'");
    expect(EDGE).toContain("rpc('release_session_reservation'");
    // commit 은 complete_consultation_with_billing 안에서 원자적으로 일어난다(별도 호출이 아니다).
    expect(EDGE).toContain("rpc('complete_consultation_with_billing'");
    expect(SESSION_SQL).toContain('v_ok := public.commit_session_reservation(p_reservation_id, p_reservation_version);');
  });

  it('commit 은 답이 실제로 저장된 뒤에만 일어난다 — 미완료 요청에는 청구 부작용이 없다', () => {
    // 두 분기 모두 완료 실패 시 null 로 조기 반환하며, commit 은 그 아래에 있다.
    expect(SESSION_SQL).toMatch(/if v_decision_id is null then return null; end if;\s*--[^\n]*no billing side effect/);
    expect(SESSION_SQL).toMatch(/return null;\s*--[^\n]*replay \/ not completed → no billing side effect/);
    // 순서 검사는 complete_consultation_with_billing 의 본문 안에서만 의미가 있다 — 파일 전체로 재면
    // commit_session_reservation 의 정의(앞쪽)가 잡혀서 항상 실패한다.
    const fnStart = SESSION_SQL.indexOf('create or replace function public.complete_consultation_with_billing');
    expect(fnStart).toBeGreaterThan(-1);
    const body = SESSION_SQL.slice(fnStart);
    const guardAt = body.indexOf('no billing side effect');
    const commitAt = body.indexOf('v_ok := public.commit_session_reservation(');
    expect(guardAt).toBeGreaterThan(-1);
    expect(commitAt).toBeGreaterThan(guardAt);
  });

  it('근거 없음(GROUNDING_UNAVAILABLE / 절기 경계일)에는 청구하지 않고 예약을 푼다', () => {
    const branch = EDGE.slice(
      EDGE.indexOf("if (result.reason === 'GROUNDING_UNAVAILABLE' || result.reason === 'AMBIGUOUS_BOUNDARY_DATE_TIME_REQUIRED')"),
      EDGE.indexOf('// SUBJECT_FORBIDDEN(403)'),
    );
    expect(branch.length).toBeGreaterThan(0);
    expect(branch).toContain('releaseDukIfHeld()');
    expect(branch).not.toContain('completeConsultationWithBilling');
  });

  it('Premium(50덕)은 기존 reserve → commit → release 경로를 그대로 탄다', () => {
    const start = EDGE.indexOf("if (body.kind === 'premium_report')");
    expect(start).toBeGreaterThan(-1);
    const branch = EDGE.slice(start, EDGE.indexOf("if (body.mode === 'summary')", start));
    expect(branch.length).toBeGreaterThan(0);
    expect(branch).toContain("reserveSessionDuk(admin, userId, 'premium_report', requestId)");
    // 가격은 economy_policy 가 소유한다 — 코드에 값으로 박히면 안 된다. 주석의 "50덕" 서술은 값이 아니므로
    // 주석을 걷어낸 실행 코드에서만 검사한다.
    const code = branch.replace(/\/\/[^\n]*/g, '');
    expect(code).not.toMatch(/[=:]\s*50\b/);
    expect(code).not.toMatch(/\bprice\s*[=:]\s*\d/i);
    // commit 은 별도 호출이 아니라 저장과 같은 트랜잭션 안에서 일어난다.
    expect(branch).toContain('completeConsultationWithBilling(paid.context, response, null, null, reservation, null)');
    expect(policyDefault('premium_report_cost')).toBe(50);
  });

  it('Premium 실패 시 청구 0 — 모든 실패 분기가 예약을 푼다', () => {
    const start = EDGE.indexOf("if (body.kind === 'premium_report')");
    const branch = EDGE.slice(start, EDGE.indexOf("if (body.mode === 'summary')", start));
    // 실패 응답을 내는 모든 곳(402/429/503/502/422)이 releaseIfHeld 또는 예약 생성 이전이어야 한다.
    const failReturns = branch.match(/return Response\.json\(\s*\{ error:/g) ?? [];
    expect(failReturns.length).toBeGreaterThanOrEqual(6);
    // 생성 실패(LLM_FAILED / INVALID_OUTPUT / EVIDENCE_UNAVAILABLE) 공통 경로 — `if (!result.ok)` 블록 전체.
    const failStart = branch.indexOf('if (!result.ok)');
    const failBlock = branch.slice(failStart, branch.indexOf("{ status: 502 }", failStart));
    expect(failBlock).toContain('await releasePaidRequest(paid.context);');
    expect(failBlock).toContain('await releaseIfHeld();');
    expect(failBlock).not.toContain('completeConsultationWithBilling');
  });

  it('Premium 은 근거 없음(절기 경계일 포함)에 422 + 청구 0 으로 끝난다', () => {
    const start = EDGE.indexOf("if (body.kind === 'premium_report')");
    const branch = EDGE.slice(start, EDGE.indexOf("if (body.mode === 'summary')", start));
    expect(branch).toContain("if (result.reason === 'EVIDENCE_UNAVAILABLE')");
    expect(branch).toContain("error: 'GROUNDING_UNAVAILABLE', message: PREMIUM_GROUNDING_MESSAGE");
    // 절기 경계일 계정은 엔진 단계에서 CHART_UNAVAILABLE 로 떨어져 위 분기로 들어온다.
    const evidence = read('src/features/premium/engine/premiumEvidence.ts');
    expect(evidence).toContain("if (engineResult.status === 'UNAVAILABLE') return unavailable('CHART_UNAVAILABLE');");
  });

  it('Premium 가격은 코드에 박히지 않고 economy_policy 가 소유한다', () => {
    const reserveFn = SESSION_SQL.slice(SESSION_SQL.indexOf('create or replace function public.reserve_session_duk'));
    expect(reserveFn).toContain('else v_cfg.premium_report_cost end');
    expect(reserveFn).toContain("p_product_type not in ('general','compatibility','premium_report')");
  });

  it('reserve TTL 은 한 턴만 덮으면 된다 — 2턴 이후는 예약 없이 ACTIVE_SESSION 으로 무료 통과', () => {
    // 이것이 reserve_ttl_seconds=300 이 충분한 이유다. 세션 전체(최대 24h)를 덮을 필요가 없다.
    expect(SESSION_SQL).toMatch(/'kind','ACTIVE_SESSION'[\s\S]{0,40}'price',0/);
    expect(policyDefault('reserve_ttl_seconds')).toBe(300);
    // 측정된 1턴 p95 는 33.4초(2026-09-02 cost benchmark) — 300초는 약 9배 여유.
    expect(policyDefault('reserve_ttl_seconds')).toBeGreaterThan(33 * 5);
  });
});

// ── ⚠⚠ H6 (2026-09-06) — 궁합도 "세우지 못한 풀이" 에 청구하지 않는다 ────────────────────────────
//
// 기존 18건은 한 글자도 건드리지 않았다. 이 블록은 **추가**다.
//
// 무엇이 없었나: 솔로 빌더에는 근거가 0일 때의 조기 종료가 있고 위 `근거 없음(...)` 계약이 그것을
// 잠근다. **궁합 빌더에는 그 종료가 아예 없었다** — LLM 을 부르고 "구조 판정 없음" 답변을 만들어
// 성공 경로로 나갔고, 12덕이 청구됐다(2026-09-06 실측). 이 블록이 그 구멍을 계약으로 막는다.
describe('덕 경제 V1 — 궁합 무근거 과금 금지 (H6)', () => {
  const COMPAT_BUILDER = read('src/features/chat/server/buildCompatibilityConsultation.ts');

  it('궁합 빌더는 pairwise 근거가 없으면 typed non-success 로 종료한다', () => {
    expect(COMPAT_BUILDER).toContain("if (safeGrounding.status !== 'available')");
    const exit = COMPAT_BUILDER.slice(
      COMPAT_BUILDER.indexOf("if (safeGrounding.status !== 'available')"),
    ).split('\n').slice(0, 6).join('\n');
    expect(exit).toContain('ok: false');
    expect(exit).toContain('AMBIGUOUS_BOUNDARY_DATE_TIME_REQUIRED');
    expect(exit).toContain('GROUNDING_UNAVAILABLE');
  });

  it('⚠ 종료가 LLM 호출보다 앞이다 — 뒤에 있으면 비용이 새고 풀이가 생성된다', () => {
    const guardAt = COMPAT_BUILDER.indexOf("if (safeGrounding.status !== 'available')");
    const llmAt = COMPAT_BUILDER.indexOf('deps.callLLM(');
    expect(guardAt).toBeGreaterThan(-1);
    expect(llmAt).toBeGreaterThan(-1);
    expect(guardAt).toBeLessThan(llmAt);
  });

  it('⚠ 0덕 해제는 솔로와 **같은** Edge 분기다 — 병렬 경로를 만들지 않았다', () => {
    // 궁합이 새 사유를 만들었다면 Edge 에 두 번째 해제 분기가 생기고, 나중에 한쪽만 고치는 사고가 난다.
    // 궁합은 솔로가 쓰던 두 사유를 그대로 쓰므로 해제 코드가 하나다.
    const handler = "if (result.reason === 'GROUNDING_UNAVAILABLE' || result.reason === 'AMBIGUOUS_BOUNDARY_DATE_TIME_REQUIRED')";
    expect(EDGE.split(handler).length - 1).toBe(1);
    // 그리고 그 분기는 궁합 요청도 지난다 — 상담 분기는 solo/compatibility 를 한 경로에서 처리한다.
    const consultBranch = EDGE.slice(EDGE.indexOf('const requestWorkload: PaidRequestWorkload'));
    expect(consultBranch).toContain(handler);
    expect(consultBranch).toContain("body.consultationMode === 'compatibility' ? 'compatibility'");
  });

  it('궁합 빌더가 새 사유·새 반환 구조를 만들지 않았다', () => {
    // 허용된 reason 은 타입이 소유한다. 빌더가 그 밖의 문자열을 반환하면 여기서 걸린다.
    const reasons = [...COMPAT_BUILDER.matchAll(/reason: '([A-Z_]+)'/g)].map((m) => m[1]);
    expect(new Set(reasons)).toEqual(new Set([
      'INVALID_INPUT', 'LLM_FAILED', 'GROUNDING_UNAVAILABLE', 'AMBIGUOUS_BOUNDARY_DATE_TIME_REQUIRED',
    ]));
  });

  it('정상 궁합은 여전히 12덕 1회 — 가격도 청구 횟수도 그대로다', () => {
    expect(DUK_PRICES.compatibility).toBe(12);
    expect(policyDefault('compatibility_session_cost')).toBe(12);
    // 첫 성공에서 한 번만 청구한다는 불변식은 순수 모델이 소유한다(위 블록과 같은 모델·같은 API).
    const T0 = 1_800_000_000;
    const first = applyTurn(newSession(DUK_PRICES.compatibility, T0), 'SUCCESS', T0);
    expect(first.commitCharge).toBe(true);
    const second = applyTurn(first.session, 'SUCCESS', T0);
    expect(second.commitCharge).toBe(false);
  });

  it('⚠ 무근거 종료는 첫 턴 실패와 같은 취급이다 — 예약 해제 · 청구 0 · 턴 미소모', () => {
    // 궁합 무근거는 FAILURE 로 모델에 들어온다(성공 경로로 나가지 않으므로). 그 결과가 위 계약과
    // 같아야 한다 — 궁합만의 특례가 생기면 그 순간 두 개의 진실이 된다.
    const T0 = 1_800_000_000;
    const r = applyTurn(newSession(DUK_PRICES.compatibility, T0), 'FAILURE', T0);
    expect(r.commitCharge).toBe(false);
    expect(r.releaseReserve).toBe(true);
    expect(r.turnConsumed).toBe(false);
  });
});

// ── ⚠⚠ H7 (2026-09-06 발견 / 2026-09-06 수정) — 두 버킷에 걸친 가격이 커밋된다 ──────────────────
//
// 기존 항목은 한 글자도 건드리지 않았다. 이 블록은 **추가**다.
//
// 무엇이 틀렸나: `commit_session_reservation` 은 **할당된 버킷마다 차변 한 행**을 넣는데(원장 설계상
// 지출은 나온 버킷에 귀속돼야 한다 — `duk_balance`·`duk_spendable` 이 버킷으로 group by 한다), 유니크
// 인덱스는 `(session_id, reason)` 뿐이었다. 두 버킷이면 같은 키로 두 행 → 23505 → 트랜잭션 전체 롤백.
// **세 상품 전부** 실측(6/6). 가입 WELCOME 이 REWARD 라 "REWARD 만 있는 계정" 은 통과했고 QA·미니팩·
// 개발이 전부 그 조건이라 안 보였다. 실패 조건은 **덕을 구매한 사용자의 기본 상태**다.
//
// ⚠ 이 블록이 지키는 것은 두 가지이고 **둘 다 있어야 한다**: 다중 버킷 커밋이 되는 것, 그리고
// 재시도 중복 청구가 여전히 막히는 것. 하나만 지키면 다른 하나가 조용히 사라진다.
describe('덕 경제 V1 — 다중 버킷 커밋 (H7)', () => {
  const BUCKET_UNIQ_SQL = read('supabase/migrations/20260908000000_duk_ledger_bucket_unique.sql');
  const SESSION_RUNTIME_SQL = read('supabase/migrations/20260846000000_fix_reservation_release_reuse.sql');

  it('원장 유니크 키에 bucket 이 포함된다 — 두 버킷 차변이 공존할 수 있다', () => {
    expect(BUCKET_UNIQ_SQL).toMatch(
      /create unique index if not exists duk_ledger_session_reason_bucket_uniq\s+on public\.duk_ledger \(session_id, reason, bucket\)/,
    );
    expect(BUCKET_UNIQ_SQL).toMatch(/where session_id is not null/);
  });

  it('⚠ 중복 청구 방지는 그대로다 — 키에 session_id 와 reason 이 여전히 있다', () => {
    // bucket 만 남기고 session_id/reason 을 빼면 다중 버킷은 되지만 **재시도가 두 번 청구한다.**
    // 원래 인덱스가 존재한 이유가 그것이므로 함께 잠근다.
    const m = BUCKET_UNIQ_SQL.match(/on public\.duk_ledger \(([^)]+)\)/);
    expect(m).not.toBeNull();
    const cols = m![1].split(',').map((c) => c.trim());
    expect(cols).toEqual(['session_id', 'reason', 'bucket']);
  });

  it('⚠ drop 이 create 보다 먼저다 — 순서가 뒤집히면 옛 정의가 조용히 남는다', () => {
    // `create ... if not exists` 는 **이름**으로 판단한다. 이름을 바꿨으므로 이 순서 요구는 지금은
    // 여유가 있지만, 누가 이름을 되돌리면 곧바로 조용한 no-op 이 된다. 순서를 계약으로 박아 둔다.
    const dropAt = BUCKET_UNIQ_SQL.indexOf('drop index if exists public.duk_ledger_session_reason_uniq');
    const createAt = BUCKET_UNIQ_SQL.indexOf('create unique index if not exists duk_ledger_session_reason_bucket_uniq');
    expect(dropAt).toBeGreaterThan(-1);
    expect(createAt).toBeGreaterThan(-1);
    expect(dropAt).toBeLessThan(createAt);
  });

  it('커밋이 버킷마다 차변을 넣는다 — 인덱스가 bucket 을 포함해야 하는 이유', () => {
    for (const b of ['PLUS', 'REWARD', 'PAID']) {
      expect(SESSION_SQL).toMatch(
        new RegExp(`if v_res\.alloc_${b.toLowerCase()} > 0 then insert into public\.duk_ledger`),
      );
    }
  });

  it('배분 합 = 가격은 예약 시점에 강제된다 (allocation_mismatch)', () => {
    // ⚠ 커밋 시점에는 재검증하지 않는다. duk_reserve 행은 reserve_session_duk 에서만 만들어지고
    // 거기서 합이 강제되므로 구조상 성립하지만, **그 강제가 사라지면 커밋이 잘못된 총액을 쓴다.**
    // 그래서 강제가 있다는 사실 자체를 여기서 잠근다.
    expect(SESSION_RUNTIME_SQL).toMatch(/if v_need <> 0 then raise exception 'allocation_mismatch'/);
  });

  it('⚠ 가격·정책은 이 수정에서 하나도 바뀌지 않았다', () => {
    expect(BUCKET_UNIQ_SQL).not.toMatch(/economy_policy/);
    expect(BUCKET_UNIQ_SQL).not.toMatch(/create or replace function/);
    expect(BUCKET_UNIQ_SQL).not.toMatch(/insert into/);
    expect(DUK_PRICES).toEqual({ general: 5, compatibility: 12, premium_report: 50 });
  });

  it('마이그레이션이 재실행 가능하다 — 가드 없는 DDL 이 없다', () => {
    const ddl = BUCKET_UNIQ_SQL.split('\n').filter((l) => /^\s*(create|drop)\s/i.test(l));
    expect(ddl.length).toBeGreaterThan(0);
    for (const line of ddl) expect(line).toMatch(/if (not )?exists/i);
  });
});
