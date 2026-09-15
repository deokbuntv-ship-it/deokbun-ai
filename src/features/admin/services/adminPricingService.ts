// 관리자 단가·환율 클라이언트 — **값은 표에서, 계산은 코드에서.**
//
// WHY. 원가 계산기(`operationalContracts.computeCost`)는 이미 있고 단위 테스트도 있다. 문제는 그
// 계산이 쓰는 **단가가 코드 안에** 있었다는 것이다. OpenAI 요금제가 바뀌면 배포를 해야 숫자가
// 맞고, 배포 전까지는 화면이 조용히 틀린 금액을 보여 준다. `adminOpsService` 가
// "no cost/price hardcoding" 을 규칙으로 둔 이유가 그것이다.
//
// 이 파일이 그 규칙을 지키면서 금액을 보이게 한다: 단가와 환율을 **오너가 화면에서 넣는 값**으로
// 만들고, 계산은 기존 코드가 그대로 한다.
//
// ⚠ **이 파일에는 단가가 없다.** 기본값도 없다. 표가 비어 있으면 원가는 "가격 미확인" 이다 —
//   0원이 아니다. "돈을 안 썼다" 와 "얼마인지 모른다" 는 다르다.
//   그 전제는 `adminPricingContract.test.ts` 가 소스 스캔으로 잠근다.
//
// ⚠ 환율을 자동으로 조회하지 않는다. 외부 API 의존이 하나 더 생기고, 틀린 환율이 조용히 들어오는
//   쪽이 비어 있는 것보다 나쁘다. 오너가 넣고, 넣은 날짜가 화면에 보인다.
import { logDbError } from '@/features/analysis';
import { getSupabaseClient } from '@/services/supabase';

import {
  computeCost,
  type ModelPricingConfig,
  type PricingRepository,
} from '../operational/operationalContracts';

export type ModelPriceRow = {
  model: string;
  inputPer1m: number;
  cachedInputPer1m: number | null;
  outputPer1m: number;
  currency: string;
  effectiveFrom: string;
  updatedAt: string | null;
};

export type FxRateRow = {
  rate: number;
  effectiveFrom: string;
  updatedAt: string | null;
};

const num = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? v
    : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v)
      : null;
const str = (v: unknown): string | null => (typeof v === 'string' && v.length > 0 ? v : null);

function mapPrice(row: Record<string, unknown>): ModelPriceRow | null {
  const model = str(row.model);
  const input = num(row.input_per_1m);
  const output = num(row.output_per_1m);
  // ⚠ 셋 중 하나라도 없으면 **그 행을 버린다.** 반쪽 단가로 계산하면 틀린 금액이 나오고,
  //   틀린 금액은 없는 금액보다 나쁘다.
  if (model === null || input === null || output === null) return null;
  return {
    model,
    inputPer1m: input,
    cachedInputPer1m: num(row.cached_input_per_1m),
    outputPer1m: output,
    currency: str(row.currency) ?? 'USD',
    effectiveFrom: str(row.effective_from) ?? '',
    updatedAt: str(row.updated_at),
  };
}

async function listPrices(): Promise<ModelPriceRow[]> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('model_pricing')
      .select('model,input_per_1m,cached_input_per_1m,output_per_1m,currency,effective_from,updated_at')
      .order('model');
    if (error) {
      logDbError(error, 'model_pricing', 'list');
      return [];
    }
    return (data ?? []).map((r) => mapPrice(r as Record<string, unknown>)).filter((r): r is ModelPriceRow => r !== null);
  } catch {
    return [];
  }
}

async function upsertPrice(input: {
  model: string;
  inputPer1m: number;
  cachedInputPer1m: number | null;
  outputPer1m: number;
}): Promise<boolean> {
  try {
    const { error } = await getSupabaseClient().from('model_pricing').upsert(
      {
        model: input.model,
        input_per_1m: input.inputPer1m,
        cached_input_per_1m: input.cachedInputPer1m,
        output_per_1m: input.outputPer1m,
      },
      { onConflict: 'model' },
    );
    if (error) {
      logDbError(error, 'model_pricing', 'upsert');
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * `fx_rate` 는 "단위 하나가 얼마인가" 를 담는다. 그 모양이 둘 다 같아서 표를 하나만 쓴다.
 *   · `USD_KRW` — 달러 원가를 원으로.
 *   · `DUK_KRW` — 덕 하나의 원화 가치. **마진을 보려면 이것이 있어야 한다.**
 *     ⚠ 코드에 박을 수 없다: `TOPUP_PACKS.priceKrwHint` 는 코드가 스스로 "display hypothesis,
 *       not a charge" 라고 적어 둔 가설이고 팩마다 ₩145/₩198/₩166 로 다르다. 오너가 넣는다.
 */
export type RatePair = 'USD_KRW' | 'DUK_KRW';

async function getRate(pair: RatePair): Promise<FxRateRow | null> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('fx_rate')
      .select('rate,effective_from,updated_at')
      .eq('pair', pair)
      .maybeSingle();
    if (error || !data) {
      if (error) logDbError(error, 'fx_rate', 'get');
      return null;
    }
    const rate = num((data as Record<string, unknown>).rate);
    if (rate === null || rate <= 0) return null;
    return {
      rate,
      effectiveFrom: str((data as Record<string, unknown>).effective_from) ?? '',
      updatedAt: str((data as Record<string, unknown>).updated_at),
    };
  } catch {
    return null;
  }
}

async function setRate(pair: RatePair, rate: number): Promise<boolean> {
  if (!Number.isFinite(rate) || rate <= 0) return false;
  try {
    const { error } = await getSupabaseClient()
      .from('fx_rate')
      .upsert({ pair, rate }, { onConflict: 'pair' });
    if (error) {
      logDbError(error, 'fx_rate', 'set');
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * DB 행으로 만든 `PricingRepository`.
 *
 * ⚠ 비어 있으면 **비어 있는 채로** 돌려준다. 코드 상수로 슬쩍 채우지 않는다 — 그러면 오너가
 * 넣은 적 없는 숫자가 금액으로 보이고, 그것이 이 트랙이 없애려는 바로 그 상태다.
 */
export function repositoryFromRows(rows: readonly ModelPriceRow[]): PricingRepository {
  const map: Record<string, ModelPricingConfig> = {};
  for (const r of rows) {
    // ⚠ 캐스트를 쓰지 않는다. `as` 로 덮으면 계약이 바뀔 때 컴파일러가 알려 주지 않는다.
    map[r.model] = {
      provider: 'openai',
      model: r.model,
      effectiveFrom: r.effectiveFrom,
      currency: r.currency,
      unit: 'per_1m_tokens',
      inputUnitPrice: r.inputPer1m,
      cachedInputUnitPrice: r.cachedInputPer1m,
      outputUnitPrice: r.outputPer1m,
    };
  }
  return {
    getPricing: (model) => map[model] ?? null,
    list: () => Object.values(map),
    asMap: () => ({ ...map }),
  };
}

/** 창 단위 토큰 집계 한 줄. **금액은 없다** — 단가는 표에, 곱셈은 코드에 있다. */
export type CostWindowRow = {
  model: string;
  requests: number;
  inputTokens: number;
  /** ⚠ 캐시된 입력. `admin_list_ai_usage` 는 이걸 안 줘서 목록 기준 원가가 +6.2% 과대였다. */
  cachedInputTokens: number;
  outputTokens: number;
  /** ⚠ **출력에 이미 포함돼 있다.** 따로 곱하면 두 번 센다. 보여 주기 위한 값이지 계산에 안 쓴다. */
  reasoningTokens: number;
};

/**
 * 최근 N시간의 모델별 토큰 합.
 *
 * ⚠ 왜 목록(`admin_list_ai_usage`)으로 안 하나: 그건 한 페이지 50건이라 "오늘 얼마" 를 못 낸다.
 *   그리고 캐시 컬럼이 반환에 없어서 원가가 실제보다 크게 나온다.
 */
/**
 * 집계 조회의 세 갈래 (v9 신설).
 *
 * ⚠ 왜 `null` 하나로는 부족한가: production 에 마이그레이션이 아직 안 올라간 동안 관리자가
 *   이 화면을 열면 "불러오지 못했습니다" 만 보인다. 그건 **고장난 것처럼** 읽히는데 사실은
 *   **아직 설치되지 않은 것**이다. 오너가 할 일이 "재시도" 와 "마이그레이션 적용" 으로 완전히
 *   다르므로 화면이 둘을 구분해야 한다.
 */
/** ⚠ "고장" 이 아니라 "아직 없음". 화면 두 곳과 테스트가 이 한 문장을 공유한다. */
export const NOT_INSTALLED_LABEL = '이 환경에는 아직 원가 기능이 설치되지 않았습니다.';

export type CostWindowOutcome =
  | { kind: 'ok'; rows: CostWindowRow[] }
  | { kind: 'not_installed' }   // RPC 자체가 없다 — 마이그레이션 미적용
  | { kind: 'forbidden' }       // 있는데 관리자가 아니다
  | { kind: 'failed' };         // 그 밖 (네트워크·일시 오류)

/**
 * PostgREST 오류를 세 갈래로 가른다.
 *
 * ⚠ 코드로 판단한다. 메시지 문자열로 가르면 Supabase 가 문구를 바꾸는 순간 조용히 틀린다.
 *   · `PGRST202` — 스키마 캐시에 함수가 없다 (= 마이그레이션 미적용)
 *   · `42883`    — Postgres 의 "function does not exist"
 *   · `P0001`    — 함수 안의 `raise exception 'not authorized'` (= 권한)
 *   · `42501`    — Postgres 권한 거부
 */
export function classifyCostWindowError(
  error: { code?: string | null } | null | undefined,
): 'not_installed' | 'forbidden' | 'failed' {
  const code = (error?.code ?? '').trim().toUpperCase();
  if (code === 'PGRST202' || code === '42883') return 'not_installed';
  if (code === 'P0001' || code === '42501' || code === 'PGRST301') return 'forbidden';
  return 'failed';
}

async function costWindowOutcome(hours: number): Promise<CostWindowOutcome> {
  try {
    const { data, error } = await getSupabaseClient().rpc('admin_ai_cost_window', { p_hours: hours });
    if (error) {
      logDbError(error, 'admin_ai_cost_window', 'rpc');
      return { kind: classifyCostWindowError(error) };
    }
    return {
      kind: 'ok',
      rows: ((data ?? []) as Record<string, unknown>[]).map((r) => ({
        model: str(r.model) ?? 'unknown',
        requests: num(r.requests) ?? 0,
        inputTokens: num(r.input_tokens) ?? 0,
        cachedInputTokens: num(r.cached_input_tokens) ?? 0,
        outputTokens: num(r.output_tokens) ?? 0,
        reasoningTokens: num(r.reasoning_tokens) ?? 0,
      })),
    };
  } catch {
    return { kind: 'failed' };
  }
}

/**
 * 창 합계 → 금액. **단가가 없는 모델은 금액에 더하지 않고 이름을 따로 돌려준다** —
 * 0으로 더하면 "싸다" 로 읽히고, 그게 이 트랙이 없애려는 바로 그 거짓말이다.
 */
export function summarizeWindow(
  rows: readonly CostWindowRow[],
  prices: readonly ModelPriceRow[],
  fxRate: number | null,
): { usd: number; krw: number | null; requests: number; unpriced: string[]; priced: number } {
  const repo = repositoryFromRows(prices);
  let usd = 0;
  let requests = 0;
  let priced = 0;
  const unpriced: string[] = [];
  for (const r of rows) {
    requests += r.requests;
    const c = computeCost(
      {
        model: r.model,
        inputTokens: r.inputTokens,
        cachedInputTokens: r.cachedInputTokens,
        outputTokens: r.outputTokens,
      },
      repo.getPricing(r.model),
    );
    if (c === null) unpriced.push(r.model);
    else { usd += c.total; priced += 1; }
  }
  // ⚠ `priced === 0` 이면 합이 0이지만 그것은 **0원이 아니라 "모른다"** 다. 화면이 이 값을 보고
  //   금액 대신 "가격 미확인" 을 그린다 — 렌더 테스트가 잡아낸 결함이다(단가 0종일 때 ₩0 이 떴다).
  return { usd, krw: fxRate === null ? null : usd * fxRate, requests, unpriced, priced };
}

export const adminPricingService = {
  listPrices,
  upsertPrice,
  getFx: () => getRate('USD_KRW'),
  setFx: (rate: number) => setRate('USD_KRW', rate),
  getDukKrw: () => getRate('DUK_KRW'),
  setDukKrw: (rate: number) => setRate('DUK_KRW', rate),
  costWindow: costWindowOutcome,
};
