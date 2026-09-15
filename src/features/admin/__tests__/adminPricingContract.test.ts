// 단가는 **데이터다. 코드가 아니다.** — 이 트랙의 전제를 잠그는 계약.
//
// WHY. 원가 계산기와 단가 상수는 2026-08 부터 있었다(`llmCostModel.ts`). 그런데 단가가 코드 안에
// 있어서 OpenAI 요금제가 바뀌면 배포를 해야 숫자가 맞았고, 배포 전까지 화면은 조용히 틀린 금액을
// 보여 줬다. `adminOpsService` 가 "no cost/price hardcoding" 을 규칙으로 둔 이유가 그것이다.
//
// 2026-09-06 부터 **관리자가 보는 금액은 DB(`model_pricing`·`fx_rate`)에서만** 온다.
// 이 파일은 그 경계가 다시 무너지지 않게 지킨다.
//
// ⚠ `llmCostModel.ts` 의 검증 상수는 **지우지 않았다.** 오프라인 원가 분석 문서와 두 테스트
// (`analysis.spec.ts` · `operational.test.ts`)가 그것을 쓴다. 지우면 통과 조건이 깨진다.
// 대신 **표시 경로가 그것을 쓰지 못하게** 막는다 — 값이 어디 있느냐가 아니라 화면이 무엇을
// 읽느냐가 문제였기 때문이다.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { classifyCostWindowError, summarizeWindow } from '../services/adminPricingService';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');
const strip = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').filter((l) => !/^\s*(\/\/|\*)/.test(l)).join('\n');

describe('단가는 데이터다 — 코드에 박히지 않는다', () => {
  it('단가 서비스에 숫자 단가도 기본 환율도 없다', () => {
    const src = strip(read('src/features/admin/services/adminPricingService.ts'));
    // 단가 상수를 import 하지 않는다.
    expect(src).not.toMatch(/GPT_5_MINI_PRICING|GPT_5_NANO_PRICING|GPT_5_6_TERRA_PRICING|DEFAULT_USD_KRW/);
    // 환율로 보일 만한 리터럴이 없다(1350 같은 값이 슬쩍 들어오는 것을 막는다).
    expect(src).not.toMatch(/\b1[0-9]{3}(\.[0-9]+)?\b/);
  });

  it('⚠ 원가를 보여 주는 화면이 코드 단가를 읽지 않는다', () => {
    const src = strip(read('src/app/admin/ai-usage/index.tsx'));
    // 정적 저장소(코드 상수)를 쓰면 오너가 화면에서 고쳐도 숫자가 안 바뀐다.
    expect(src).not.toMatch(/adminPricingRepository/);
    expect(src).not.toMatch(/GPT_5_[A-Z0-9_]*_PRICING|DEFAULT_USD_KRW|staticPricingRepository/);
    // 대신 DB 에서 온 행으로 저장소를 만든다.
    expect(src).toContain('repositoryFromRows');
    expect(src).toContain('adminPricingService');
  });

  it('마이그레이션이 단가를 시드하지 않는다 — 초기값도 오너가 넣는다', () => {
    const sql = read('supabase/migrations/20260915000000_model_pricing.sql');
    const body = sql.split('\n').filter((l) => !/^\s*--/.test(l)).join('\n');
    expect(body).not.toMatch(/insert\s+into/i);
    // 두 표는 만든다.
    expect(body).toMatch(/create table if not exists public\.model_pricing/);
    expect(body).toMatch(/create table if not exists public\.fx_rate/);
    // 멱등: 정책은 drop-if-exists 가 선행한다.
    for (const p of ['model_pricing_admin_all', 'fx_rate_admin_all']) {
      expect(body.indexOf(`drop policy if exists ${p}`)).toBeGreaterThanOrEqual(0);
      expect(body.indexOf(`drop policy if exists ${p}`)).toBeLessThan(body.indexOf(`create policy ${p}`));
    }
    // 잠금 3종.
    expect(body).toMatch(/alter table public\.model_pricing enable row level security/);
    expect(body).toMatch(/revoke all on table public\.fx_rate from public, anon, authenticated/);
  });

  it('단가가 없으면 0원이 아니라 "가격 미확인" 이다', () => {
    const src = strip(read('src/app/admin/ai-usage/index.tsx'));
    expect(src).toContain('UNPRICED_LABEL');
    // 원가 자리에 0 을 채워 넣는 폴백이 없어야 한다.
    expect(src).not.toMatch(/cost\s*\?\?\s*0|total\s*\?\?\s*0/);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 2026-09-07 — 실측이 바꾼 세 가지를 잠근다.
// ══════════════════════════════════════════════════════════════════════════════

describe('⚠ 추론 토큰은 단가가 따로 없다 — 출력에 포함된다', () => {
  // staging 803건 실측: reasoning > output 인 행 0건, total ≠ input+output 인 행 0건(783건).
  // 추론은 출력의 29.3% 를 차지한다. 칸을 만들어 곱하면 그 29.3% 를 **두 번 센다.**
  it('단가 표에 추론 열이 없다', () => {
    const sql = read('supabase/migrations/20260915000000_model_pricing.sql');
    const body = sql.split('\n').filter((l) => !/^\s*--/.test(l)).join('\n');
    expect(body).not.toMatch(/reasoning_per_1m|reasoning_price|reasoning_unit/i);
  });

  it('화면에 추론 단가 입력칸이 없고, 없는 이유가 적혀 있다', () => {
    const src = read('src/app/admin/ai-usage/index.tsx');
    expect(src).not.toMatch(/label="[^"]*추론[^"]*\/\s*1M/);
    // 왜 없는지를 화면이 말해야 한다. 없는 칸은 설명이 없으면 빠뜨린 것처럼 보인다.
    expect(src).toContain('출력 토큰으로 청구');
  });

  it('원가 계산이 reasoning_tokens 를 곱하지 않는다', () => {
    const svc = strip(read('src/features/admin/services/adminPricingService.ts'));
    // 값을 **읽어 보여 주는** 것은 되지만, 단가와 곱하는 자리에 오면 안 된다.
    expect(svc).not.toMatch(/reasoningTokens\s*\*|\*\s*reasoningTokens/);
    const contracts = strip(read('src/features/admin/operational/operationalContracts.ts'));
    expect(contracts).not.toMatch(/reasoning/i);
  });
});

describe('⚠ 집계 RPC 는 토큰만 돌려준다 — 금액은 코드가 만든다', () => {
  const sql = read('supabase/migrations/20260915000000_model_pricing.sql');
  const body = sql.split('\n').filter((l) => !/^\s*--/.test(l)).join('\n');

  it('창 집계 함수가 있고 관리자만 부른다', () => {
    expect(body).toContain('create or replace function public.admin_ai_cost_window');
    expect(body).toMatch(/if not public\.is_admin\(\) then\s*\n\s*raise exception/);
    expect(body).toContain('revoke all on function public.admin_ai_cost_window(int) from public, anon');
  });

  it('⚠ 함수 안에 단가도 환율도 없다 — 있으면 표를 고쳐도 숫자가 안 바뀐다', () => {
    const fn = body.slice(body.indexOf('create or replace function public.admin_ai_cost_window'));
    expect(fn).not.toMatch(/1000000|1e6|\b1[0-9]{3}\b/);
    expect(fn).not.toMatch(/model_pricing|fx_rate/);
  });

  it('캐시된 입력을 돌려준다 — 이것이 없어서 원가가 +6.2% 과대였다', () => {
    expect(body).toContain('cached_input_tokens bigint');
  });

  it('여전히 시드가 없다', () => {
    expect(body).not.toMatch(/insert\s+into/i);
  });
});

describe('⚠ 합이 0인 것과 모르는 것을 구분한다', () => {
  const ROW = {
    model: 'gpt-5-mini', requests: 10,
    inputTokens: 1_000_000, cachedInputTokens: 400_000, outputTokens: 200_000, reasoningTokens: 60_000,
  };
  const PRICE = {
    model: 'gpt-5-mini', inputPer1m: 0.25, cachedInputPer1m: 0.025, outputPer1m: 2,
    currency: 'USD', effectiveFrom: '', updatedAt: null,
  };

  it('단가가 하나도 없으면 priced 가 0이다 — 화면이 이걸 보고 "가격 미확인" 을 낸다', () => {
    const s = summarizeWindow([ROW], [], 1400);
    expect(s.priced).toBe(0);
    expect(s.unpriced).toEqual(['gpt-5-mini']);
    // 합은 0이지만 그것을 금액으로 그리면 안 된다는 뜻이다.
    expect(s.usd).toBe(0);
  });

  it('캐시된 입력이 단가에 반영된다', () => {
    // (600,000×0.25 + 400,000×0.025 + 200,000×2.0)/1e6 = 0.56
    const s = summarizeWindow([ROW], [PRICE], 1400);
    expect(s.priced).toBe(1);
    expect(s.usd).toBeCloseTo(0.56, 10);
    expect(s.krw).toBeCloseTo(784, 8);
    // 캐시를 무시하면 0.65 가 된다. 그 값이 나오면 계약이 깨진 것이다.
    expect(s.usd).not.toBeCloseTo(0.65, 4);
  });

  it('단가 없는 모델을 0으로 더하지 않는다 — 섞여 있어도 이름을 남긴다', () => {
    const s = summarizeWindow([ROW, { ...ROW, model: 'gpt-9-unknown' }], [PRICE], 1400);
    expect(s.usd).toBeCloseTo(0.56, 10);       // 아는 것만 더한다
    expect(s.unpriced).toEqual(['gpt-9-unknown']);
    expect(s.requests).toBe(20);               // 건수는 전부 센다
  });

  it('환율이 없으면 원화가 null 이다 — 0이 아니다', () => {
    expect(summarizeWindow([ROW], [PRICE], null).krw).toBeNull();
  });
});

describe('⚠ 마진은 오너가 넣은 덕 값으로만 낸다', () => {
  it('덕 1개의 값이 코드에 없다', () => {
    const svc = strip(read('src/features/admin/services/adminPricingService.ts'));
    const scr = strip(read('src/app/admin/ai-usage/index.tsx'));
    // 충전 팩 가설값(2900/9900/19900)이나 그 몫(145/198/166)이 코드에 들어오면 마진도 가설이 된다.
    for (const src of [svc, scr]) {
      expect(src).not.toMatch(/\b(2900|9900|19900|priceKrwHint|TOPUP_PACKS)\b/);
    }
  });

  it('덕 값이 없으면 마진을 계산하지 않는다', () => {
    const scr = read('src/app/admin/ai-usage/index.tsx');
    expect(scr).toMatch(/!dukKrw/);
    expect(scr).toContain('마진은 아직 볼 수 없습니다');
  });

  it('⚠ 선불 문제를 화면이 설명한다 — 매출 시점과 원가 시점이 다르다', () => {
    const scr = read('src/app/admin/ai-usage/index.tsx');
    expect(scr).toContain('이번 달 매출 − 이번 달 원가');
    expect(scr).toMatch(/쓰일 때 매출로 봅니다/);
  });

  it('상담 가격(5·12·50덕)은 표시 전용 출처에서 읽는다 — 여기서 정하지 않는다', () => {
    const scr = strip(read('src/app/admin/ai-usage/index.tsx'));
    expect(scr).toContain('DUK_PRICES');
    expect(scr).not.toMatch(/general:\s*5|premium_report:\s*50/);
  });
});

describe('대시보드 "오늘 AI 비용" 이 더 이상 자리표시자가 아니다', () => {
  // ⚠ 주석을 뺀 소스로 본다. 무엇이 **있었는지** 적어 둔 주석까지 잡으면, 기록을 남길수록
  //   테스트가 깨지는 이상한 규칙이 된다. 화면에 그려지는 것만 본다.
  const src = strip(read('src/app/admin/index.tsx'));

  it('"준비 중 · 정산 API 연동 필요" 가 사라졌다', () => {
    expect(src).not.toContain('정산 API 연동 필요');
    expect(src).not.toMatch(/label="오늘 AI 비용"\s+value="준비 중"/);
  });

  it('실패해도 0원으로 그리지 않는다', () => {
    expect(src).toContain('확인 불가');
    expect(src).toContain('가격 미확인');
    expect(src).toMatch(/sum\.priced === 0/);
  });

  it('여기서도 단가를 코드로 읽지 않는다', () => {
    expect(src).not.toMatch(/adminPricingRepository|staticPricingRepository|GPT_5_[A-Z0-9_]*_PRICING|DEFAULT_USD_KRW/);
    expect(src).toContain('adminPricingService');
  });
});


// ══════════════════════════════════════════════════════════════════════════════
// ⚠ RPC 가 없는 환경에서 깨지지 않는다 — production 은 이 마이그레이션 **적용 전**이다.
//
// WHY. 이 화면이 production 에 먼저 나가고 마이그레이션이 나중에 올라간다. 그 사이에 관리자가
// 화면을 열면 RPC 가 없다. 그때 "불러오지 못했습니다" 만 보이면 **고장으로 읽힌다** — 오너가
// 재시도를 반복하지만 할 일은 마이그레이션 적용이다. 세 갈래를 코드로 가른다.
//
// ⚠ 메시지 문자열이 아니라 **코드**로 가른다. Supabase 가 문구를 바꾸면 문자열 판정은 조용히
//   틀리고, 조용히 틀린 판정은 "설치 안 됨" 을 "일시 오류" 로 그린다.
// ══════════════════════════════════════════════════════════════════════════════
describe('집계 조회 실패의 세 갈래', () => {
  it.each([
    ['PGRST202 — 스키마 캐시에 함수 없음 (마이그레이션 미적용)', 'PGRST202', 'not_installed'],
    ['42883 — Postgres function does not exist', '42883', 'not_installed'],
    ['소문자로 와도 같다', 'pgrst202', 'not_installed'],
    ['P0001 — 함수 안의 not authorized', 'P0001', 'forbidden'],
    ['42501 — Postgres 권한 거부', '42501', 'forbidden'],
    ['PGRST301 — JWT 문제', 'PGRST301', 'forbidden'],
    ['그 밖은 일시 오류로 둔다', '08006', 'failed'],
    ['코드가 없으면 일시 오류', '', 'failed'],
  ])('%s', (_l, code, want) => {
    expect(classifyCostWindowError({ code })).toBe(want);
  });

  it('error 가 null/undefined 여도 던지지 않는다', () => {
    expect(classifyCostWindowError(null)).toBe('failed');
    expect(classifyCostWindowError(undefined)).toBe('failed');
  });

  it('⚠ 화면 두 곳이 "미설치" 를 "고장" 과 다르게 그린다', () => {
    const usage = strip(read('src/app/admin/ai-usage/index.tsx'));
    const dash = strip(read('src/app/admin/index.tsx'));
    for (const src of [usage, dash]) {
      expect(src).toContain('not_installed');
      expect(src).toContain('forbidden');
      expect(src).toContain('NOT_INSTALLED_LABEL');
    }
  });
});
