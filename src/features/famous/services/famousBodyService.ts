import { getSupabaseClient } from '@/services/supabase';

import type { FamousChartView } from '@/features/publicSite';

// 명식 계산 + 본문 초안 생성의 클라이언트 경계.
//
// ⚠ 여기서 계산하지도, 본문을 저장하지도 않는다.
//   계산 — 프로즌 엔진은 서버에서만 돈다(`famous-compose`). 클라이언트가 만든 명식은 신뢰할 수
//          없으므로 LLM 입력으로 쓸 수 없다.
//   저장 — 본문은 **초안으로만** 돌아온다. 운영자가 [본문에 적용] 을 눌러야 편집기의 소개란에
//          들어가고, 저장은 평소의 저장 버튼이 한다. 재생성이 운영자의 손질을 지울 수 없다.
export type FamousComposeOutcome =
  | 'ok'
  | 'chart_only'
  | 'chart_unavailable'
  | 'body_failed'
  | 'body_rejected';

export type FamousComposeResult = {
  outcome: FamousComposeOutcome;
  message: string | null;
  snapshotId: string | null;
  chart: FamousChartView | null;
  /** 생성된 마크다운 초안. `outcome === 'ok'` 일 때만 있다. */
  body: string | null;
  /** 풀이 없이 쓰인 용어. 있으면 운영자가 손봐야 한다는 신호일 뿐, 차단은 아니다. */
  unglossedTerms: string[];
  /** 서버가 걸러 낸 위반. 이때 `body` 는 없다 — 위반한 글은 초안으로도 내보내지 않는다. */
  violations: { id: string; why: string; excerpt: string }[];
  usage: { input: number | null; output: number | null; total: number | null } | null;
};

const str = (v: unknown): string | null =>
  typeof v === 'string' && v.trim().length > 0 ? v.trim() : null;

function normalize(raw: unknown): FamousComposeResult {
  const o = (raw ?? {}) as Record<string, unknown>;
  const outcome = o.outcome;
  return {
    outcome:
      outcome === 'ok' || outcome === 'chart_only' || outcome === 'chart_unavailable'
        || outcome === 'body_failed' || outcome === 'body_rejected'
        ? outcome
        : 'body_failed',
    message: str(o.message),
    snapshotId: str(o.snapshotId),
    chart: (o.chart ?? null) as FamousChartView | null,
    body: str(o.body),
    unglossedTerms: Array.isArray(o.unglossedTerms)
      ? o.unglossedTerms.filter((t): t is string => typeof t === 'string')
      : [],
    violations: Array.isArray(o.violations)
      ? (o.violations as Record<string, unknown>[]).map((v) => ({
          id: String(v.id ?? ''), why: String(v.why ?? ''), excerpt: String(v.excerpt ?? ''),
        }))
      : [],
    usage: (o.usage ?? null) as FamousComposeResult['usage'],
  };
}

async function compose(params: {
  famousId: string;
  /** false 면 명식만 세운다 — 생년월일을 고친 뒤 LLM 을 태우지 않고 다시 계산할 때. */
  withBody?: boolean;
}): Promise<FamousComposeResult> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke('famous-compose', {
    body: { famousId: params.famousId, withBody: params.withBody !== false },
  });

  // ⚠ 422·502 도 본문을 담아 돌아온다(왜 버렸는지가 운영자에게 필요한 정보다). functions.invoke 는
  // non-2xx 를 error 로 주면서 body 를 버리므로, 여기서 다시 읽는다.
  if (error) {
    const res = (error as { context?: { json?: () => Promise<unknown> } }).context;
    if (res?.json) {
      try {
        return normalize(await res.json());
      } catch {
        /* 아래의 일반 실패로 떨어진다 */
      }
    }
    throw new Error('FAMOUS_COMPOSE_FAILED');
  }
  return normalize(data);
}

export const famousBodyService = { compose };
