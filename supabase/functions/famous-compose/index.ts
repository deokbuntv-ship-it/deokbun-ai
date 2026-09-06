// DeokbunAI — 유명인 명식 계산 + 해설 본문 생성 (S1 + S3/S4).
//
// 두 가지를 한 함수에서 하는 이유: **본문 생성에는 명식이 필요하고, 그 명식은 신뢰할 수 있어야 한다.**
// 클라이언트가 계산해 보낸 명식을 LLM 입력으로 받으면 공개 콘텐츠의 근거가 브라우저에서 온 값이 된다.
// 여기서 계산하면 그 문제가 없고, 프로즌 엔진 번들도 이미 서버에 있다.
//
// ⚠ 자동 적용하지 않는다. 생성된 본문은 **초안으로 반환**될 뿐이고, 운영자가 읽고 적용 버튼을 눌러야
// `bio` 에 들어간다. `famous-suggest` 가 세운 원칙("NEVER auto-applies")을 그대로 따른다.
// 부수 효과로 **재생성이 사람 손질을 덮어쓸 수 없다** — 재생성은 아무것도 저장하지 않기 때문이다.
//
// 명식 스냅샷은 다르다. 그것은 엔진 산출물이라 사람이 고칠 것이 아니고, `calculation_state` 가
// 최신인지 알아야 발행 가능 여부를 판단할 수 있으므로 **여기서 저장한다.**
//
// Security: verify_jwt + admin_users. 서버 키. 전역 spend guard. Runtime: Deno.

import { withSupabase } from 'npm:@supabase/server@1.4.1';
import { createClient } from 'npm:@supabase/supabase-js';
import { globalSpendGuardFailure, reserveGlobalPaidGeneration } from '../_shared/globalSpendGuard.ts';
import {
  buildFamousChart,
  buildFamousBodyUserPrompt,
  checkFamousBody,
  composeFamousBody,
  ungloassedTerms,
  repeatedOpenings,
  unsourcedSections,
  leakySources,
  contradictsChart,
  unverifiedRelationClaims,
  unverifiedFactClaims,
  checkChartFacts,
  selfContradictions,
  checkRevealedClaims,
  checkRootingClaims,
  phaseDirectionErrors,
  sentenceDefects,
  checkRelationClaims,
  citationCount,
  claimCoverage,
  FAMOUS_BODY_PROMPT_VERSION,
  FAMOUS_BODY_SYSTEM_PROMPT,
} from './_server/famousBundle.mjs';

const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';

// Deno-native DigestProvider — 앱의 Node provider 와 바이트 동일한 hex 라야 프로즌 엔진의
// fingerprint 가 환경에 따라 갈리지 않는다.
const denoDigestProvider = {
  async sha256Utf8(input: string): Promise<string> {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  },
};

function serviceClient() {
  const url = Deno.env.get('SUPABASE_URL')?.trim() ?? '';
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim() ?? '';
  return url && key ? createClient(url, key) : null;
}

function userIdFromRequest(req: Request): string | null {
  try {
    const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer /, '');
    const part = token.split('.')[1];
    if (!part) return null;
    const decoded = JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/'))) as { sub?: unknown };
    return typeof decoded.sub === 'string' ? decoded.sub : null;
  } catch {
    return null;
  }
}

async function isAdminUser(userId: string | null): Promise<boolean> {
  if (!userId) return false;
  const admin = serviceClient();
  if (!admin) return false;
  const { data, error } = await admin.from('admin_users').select('user_id').eq('user_id', userId).maybeSingle();
  return !error && data !== null;
}

function extractText(payload: unknown): string {
  const output = (payload as { output?: unknown } | null)?.output;
  if (Array.isArray(output)) {
    const parts: string[] = [];
    for (const item of output) {
      if (item?.type === 'message' && Array.isArray(item.content)) {
        for (const p of item.content) if (p?.type === 'output_text' && typeof p.text === 'string') parts.push(p.text);
      }
    }
    if (parts.join('').trim()) return parts.join('').trim();
  }
  const conv = (payload as { output_text?: unknown } | null)?.output_text;
  return typeof conv === 'string' ? conv.trim() : '';
}

function parseJsonObject(text: string): Record<string, unknown> | null {
  const tryParse = (s: string) => {
    try {
      const o = JSON.parse(s);
      return o && typeof o === 'object' ? (o as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  };
  const direct = tryParse(text);
  if (direct) return direct;
  const a = text.indexOf('{');
  const b = text.lastIndexOf('}');
  return a !== -1 && b > a ? tryParse(text.slice(a, b + 1)) : null;
}

// v2 — 섹션을 자리(일간/월지/일지/오행)에서 **개념**(통근/월령/십성/투간/읽는 법)으로 재편했다.
// 이유는 `famousBodyPrompt.ts` 의 FAMOUS_BODY_SECTION_TITLES 주석에.
const SECTION_KEYS = ['dayMaster', 'monthCommand', 'tenGods', 'hiddenStems', 'relations', 'howToRead'] as const;

export default {
  fetch: withSupabase({ auth: 'user' }, async (req: Request): Promise<Response> => {
    const startedAt = Date.now();
    const userId = userIdFromRequest(req);

    if (req.method !== 'POST') return Response.json({ error: 'METHOD_NOT_ALLOWED' }, { status: 405 });
    if (!(await isAdminUser(userId))) return Response.json({ error: 'FORBIDDEN' }, { status: 403 });

    const admin = serviceClient();
    if (!admin) return Response.json({ error: 'TEMPORARILY_UNAVAILABLE' }, { status: 503 });

    let body: { famousId?: unknown; withBody?: unknown };
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'INVALID_INPUT' }, { status: 400 });
    }
    const famousId = typeof body.famousId === 'string' ? body.famousId : '';
    if (!famousId) return Response.json({ error: 'INVALID_INPUT' }, { status: 400 });
    const withBody = body.withBody !== false;

    const { data: row, error: rowErr } = await admin
      .from('famous_profiles')
      .select('id, birth_info, birth_source')
      .eq('id', famousId)
      .maybeSingle();
    if (rowErr || !row) return Response.json({ error: 'NOT_FOUND' }, { status: 404 });

    // ── 1. 명식 ────────────────────────────────────────────────────────────────────────────────
    const chartResult = await buildFamousChart(row.birth_info, { digestProvider: denoDigestProvider });

    if (!chartResult.ok) {
      // ⚠ 실패도 상태다. `not_calculated`(아직 안 함)와 `failed`(해 봤는데 안 섬)는 다른 뜻이고,
      // 발행 가능 여부가 그 구분에 달려 있다.
      await admin.from('famous_profiles')
        .update({ calculation_state: 'failed', current_snapshot_id: null })
        .eq('id', famousId);
      return Response.json({
        outcome: 'chart_unavailable',
        detail: chartResult.detail,
        message: '명식을 세우지 못했습니다. 절기 경계일에 태어난 시각이 없으면 월주가 두 가지로 갈립니다.',
      });
    }

    const { data: snap, error: snapErr } = await admin
      .from('famous_snapshots')
      .insert({
        famous_id: famousId,
        birth_fingerprint: chartResult.fingerprint,
        engine_version: chartResult.snapshot.engineVersion,
        rule_set_version: chartResult.snapshot.ruleSetVersion,
        result: chartResult.snapshot,
        created_by: userId,
      })
      .select('id')
      .single();
    if (snapErr || !snap) return Response.json({ error: 'TEMPORARILY_UNAVAILABLE' }, { status: 503 });

    await admin.from('famous_profiles')
      .update({ calculation_state: 'current', current_snapshot_id: snap.id })
      .eq('id', famousId);

    if (!withBody) {
      return Response.json({ outcome: 'chart_only', snapshotId: snap.id, chart: chartResult.snapshot });
    }

    // ── 2. 본문 ────────────────────────────────────────────────────────────────────────────────
    const apiKey = Deno.env.get('OPENAI_API_KEY')?.trim() ?? '';
    if (!apiKey) {
      return Response.json({
        outcome: 'chart_only', snapshotId: snap.id, chart: chartResult.snapshot,
        message: '명식은 계산했지만 본문 생성이 설정되지 않았습니다 (LLM 키 미설정).',
      });
    }

    const model = Deno.env.get('PREMIUM_CONTENT_LLM_MODEL')?.trim()
      || Deno.env.get('CONTENT_LLM_MODEL')?.trim()
      || Deno.env.get('LLM_MODEL')?.trim()
      || 'gpt-5-mini';

    // ⚠ 전역 가드의 workload 는 'famous_suggestion' 을 재사용한다. 가드는 **전역 총량 상한**이고
    // workload 는 귀속 라벨인데, 두 호출 모두 '유명인 콘텐츠 생성' 이다. 라벨 하나 때문에 안전장치의
    // check 제약을 바꾸는 것은 값이 없다 — 정밀 귀속은 아래 ai_usage_logs(request_type='famous_body')가
    // 토큰·지연까지 함께 갖는다. 상한을 따로 두고 싶어지면 그때 한 줄 마이그레이션으로 값을 추가한다.
    const spend = await reserveGlobalPaidGeneration(admin, userId, 'famous_suggestion');
    if (spend.status !== 'allowed') {
      const f = globalSpendGuardFailure(spend);
      return Response.json(f.body, { status: f.status, headers: f.headers });
    }

    let usage: Record<string, unknown> = {};
    let text = '';
    try {
      const res = await fetch(OPENAI_RESPONSES_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          input: [
            { role: 'system', content: FAMOUS_BODY_SYSTEM_PROMPT },
            { role: 'user', content: buildFamousBodyUserPrompt(chartResult.snapshot) },
          ],
          // v2 실측 조정. v1 은 6000 이었는데 근거를 2.4배로 늘리면서 본문도 길어졌다(섹션당
          // 4~6문장 + 문장마다 근거 괄호). 추론 토큰과 본문이 같은 예산을 나눠 쓰므로 여유를 준다.
          max_output_tokens: 9000,
          // ⚠ gpt-5-mini 계열은 reasoning 토큰을 OUTPUT 으로 청구한다. effort 를 명시하지 않으면
          // 공급자 기본(medium)으로 돌아 **추론이 출력 예산을 다 먹고 본문이 비는** 일이 생긴다 —
          // 요약 502 사건(§7 비용 트랙)이 정확히 그것이었다. 'low' 로 고정한다.
          reasoning: { effort: 'low' },
        }),
      });
      const payload = await res.json();
      usage = (payload as { usage?: Record<string, unknown> }).usage ?? {};
      if (!res.ok) throw new Error(`openai ${res.status}`);
      // ⚠ v3: **잘렸는지 먼저 본다.** 근거를 또 늘려(관계 12종) 출력이 상한에 닿을 수 있다.
      // status='incomplete' 를 무시하면 반쯤 잘린 JSON 이 파싱 실패로만 보이고 원인을 못 찾는다 —
      // 요약 502 사건이 정확히 그랬다.
      const status = (payload as { status?: unknown }).status;
      const incompleteReason =
        ((payload as { incomplete_details?: { reason?: unknown } }).incomplete_details?.reason) ?? null;
      if (status === 'incomplete') {
        throw new Error(`incomplete: ${String(incompleteReason)} (max_output_tokens 상향 필요)`);
      }
      text = extractText(payload);
    } catch (err) {
      await logUsage(admin, userId, model, 'error', 'OPENAI_FAILED', usage, startedAt);
      return Response.json({
        outcome: 'body_failed', snapshotId: snap.id, chart: chartResult.snapshot,
        message: `명식은 저장했지만 본문 생성에 실패했습니다. 다시 시도해 주세요. (${String(err).slice(0, 60)})`,
      }, { status: 502 });
    }

    const parsed = parseJsonObject(text);
    const missing = SECTION_KEYS.filter((k) => typeof parsed?.[k] !== 'string' || !(parsed[k] as string).trim());
    if (!parsed || missing.length > 0) {
      await logUsage(admin, userId, model, 'error', 'INVALID_OUTPUT', usage, startedAt);
      return Response.json({
        outcome: 'body_failed', snapshotId: snap.id, chart: chartResult.snapshot,
        message: `본문 형식이 올바르지 않아 버렸습니다 (누락: ${missing.join(', ') || 'JSON'}). 다시 시도해 주세요.`,
      }, { status: 502 });
    }

    const sections = Object.fromEntries(SECTION_KEYS.map((k) => [k, String(parsed[k]).trim()]));
    const markdown = composeFamousBody(sections as never);

    // ⚠ 금지 사항 검사는 **서버에서** 한다. 통과하지 못한 글은 초안으로도 내보내지 않는다 —
    // 운영자가 실수로 적용 버튼을 누를 수 있기 때문이다.
    // ⚠ 사실 모순 검사가 먼저다. 근거도 붙고 금지어도 없는데 **명식과 반대되는 말**을 하는 글이
    // 실제로 나왔다(득령인데 "실령"). 배우러 온 독자에게 반대를 가르치는 것이라 형식 문제보다 위다.
    // ⚠ v3 사실 검사 셋 — 전부 "형식" 이 아니라 "사실" 이라 같은 급으로 앞에 둔다.
    //   ① 명식과 모순 (득령/실령·계절 단계 이름)
    //   ② 생극 **방향** 뒤집힘 — 실측 1건. 배우는 사람이 반대로 익힌다
    //   ③ 엔진이 판정하지 않은 관계 주장 — 화이트리스트 대조
    const contradictions = [
      ...contradictsChart(markdown, chartResult.snapshot),
      ...phaseDirectionErrors(markdown, chartResult.snapshot),
      ...unverifiedRelationClaims(markdown, chartResult.snapshot).map(
        (c) => `엔진이 판정하지 않은 ${c.anchor} 주장: "${c.sentence}"`,
      ),
      // ④ 투간·통근 주장 — v3 에서 이 대조가 없어 없는 투간을 지어낸 글이 통과했다.
      ...unverifiedFactClaims(markdown, chartResult.snapshot).map(
        (c) => `스냅샷과 맞지 않는 ${c.kind} 주장: "${c.sentence}"`,
      ),
      // ⑤ 기둥 간지·지장간 구성·십성 개수·오행 개수 — 숫자와 글자는 틀리면 그대로 오답이다.
      ...checkChartFacts(markdown, chartResult.snapshot).map(
        (e) => `${e.kind} 이 틀림: 본문 "${e.claim}" / 실제 "${e.actual}"`,
      ),
      // ⑥ 한 문장 안의 자기모순 — 실측 1건(부정해 놓고 같은 글자를 긍정).
      ...selfContradictions(markdown),
    ];
    if (contradictions.length > 0) {
      await logUsage(admin, userId, model, 'error', 'CONTRADICTS_CHART', usage, startedAt);
      return Response.json({
        outcome: 'body_rejected', snapshotId: snap.id, chart: chartResult.snapshot,
        violations: contradictions.map((c) => ({ id: 'CONTRADICTS_CHART', why: c, excerpt: c })),
        message: '생성된 글이 명식과 어긋나는 말을 해서 버렸습니다. 다시 시도해 주세요.',
      }, { status: 422 });
    }

    const violations = checkFamousBody(markdown);
    const unglossed = ungloassedTerms(markdown);
    const repeats = repeatedOpenings(markdown);
    // v2 — 근거 없는 섹션은 거절한다. 오너 진단 ① ("근거 없는 말이 섞인다") 에 대한 기계 게이트다.
    // ⚠ 세미콜론은 **거절하지 않는다.** `clampSemicolons` 가 조립 단계에서 마침표로 바꾼다.
    // 프롬프트로 세 번 금지했는데 세 번 다 다시 나왔고(13→1→4개), 거절로 두면 LLM 콜만 태운다.
    // Premium 이 같은 실증 뒤 결정론적 clamp 로 전환한 것과 같은 판단이다.

    const unsourced = unsourcedSections(markdown);
    // 근거 괄호가 관측값이 아니라 자료의 항목 이름을 가리키는 경우도 같은 급이다 — 독자는 그 자료를
    // 볼 수 없으므로 확인할 수 없는 근거이고, 내부 프롬프트 구조가 공개 페이지로 샌다.
    const leaky = leakySources(markdown);
    // ⚠ 비율로 판정한다. 근거 20개 중 2개가 모호한 것은 교정 사항이지 글을 버릴 사유가 아니다 —
    // 버리면 LLM 1콜을 날리고 파이프라인이 막히는데, 운영자는 어차피 초안을 검토한다. 다만 조용히
    // 넘어가면 그대로 발행되므로 **전부 경고로 돌려준다.** 1/3 을 넘으면 그때는 글의 성격이
    // 바뀐 것이라 거절한다.
    const cites = citationCount(markdown);
    const leakyTooMany = leaky.length * 3 > cites;
    if (violations.length === 0 && repeats.length === 0 && (unsourced.length > 0 || leakyTooMany)) {
      await logUsage(admin, userId, model, 'error', 'UNSOURCED_OUTPUT', usage, startedAt);
      return Response.json({
        outcome: 'body_rejected', snapshotId: snap.id, chart: chartResult.snapshot,
        violations: [
          ...unsourced.map((t) => ({ id: 'UNSOURCED', why: `"${t}" 섹션에 (근거: …) 가 하나도 없음`, excerpt: t })),
          ...(leakyTooMany ? leaky : []).map((t) => ({ id: 'LEAKY_SOURCE', why: '근거가 관측값이 아니라 자료의 항목 이름을 가리킴', excerpt: t })),
        ],
        message: '생성된 글의 근거 표기가 비었거나 확인할 수 없는 것을 가리켜 버렸습니다. 다시 시도해 주세요.',
      }, { status: 422 });
    }
    if (violations.length === 0 && repeats.length > 0) {
      // 규칙은 다 지켰는데 읽을 수 없는 글. 사람이 매번 걸러야 하면 자동 생성의 값이 없다.
      await logUsage(admin, userId, model, 'error', 'REPETITIVE_OUTPUT', usage, startedAt);
      return Response.json({
        outcome: 'body_rejected', snapshotId: snap.id, chart: chartResult.snapshot,
        violations: repeats.map((r) => ({ id: 'REPETITIVE', why: `같은 문두 "${r.opening}" 가 ${r.total}문장 중 ${r.count}번`, excerpt: r.opening })),
        message: '생성된 글이 같은 문장 틀을 반복해서 버렸습니다. 다시 시도해 주세요.',
      }, { status: 422 });
    }
    if (violations.length > 0) {
      await logUsage(admin, userId, model, 'error', `FORBIDDEN_${violations[0].id}`, usage, startedAt);
      return Response.json({
        outcome: 'body_rejected', snapshotId: snap.id, chart: chartResult.snapshot,
        violations,
        message: `생성된 글이 금지 규칙을 위반해 버렸습니다: ${violations.map((v) => v.why).join(', ')}. 다시 시도해 주세요.`,
      }, { status: 422 });
    }

    await logUsage(admin, userId, model, 'success', null, usage, startedAt);
    return Response.json({
      outcome: 'ok',
      snapshotId: snap.id,
      chart: chartResult.snapshot,
      body: markdown,
      sections,
      unglossedTerms: unglossed,
      claimCoverage: claimCoverage(markdown),
      citations: cites,
      leakySources: leaky,
      // v3 — 운영자 화면에 뜨는 경고. 거절하지 않는 이유: 오타·조사는 기계가 못 잡고,
      // 잡히는 것만으로 글을 버리면 LLM 1콜을 날리면서 파이프라인이 막힌다.
      sentenceDefects: sentenceDefects(markdown),
      relationClaims: checkRelationClaims(markdown, chartResult.snapshot),
      revealedClaims: checkRevealedClaims(markdown, chartResult.snapshot),
      rootingClaims: checkRootingClaims(markdown, chartResult.snapshot),
      promptVersion: FAMOUS_BODY_PROMPT_VERSION,
      usage: {
        input: usage.input_tokens ?? null, output: usage.output_tokens ?? null, total: usage.total_tokens ?? null,
      },
      message: '명식과 해설 초안을 만들었습니다. 검토하고 [본문에 적용] 을 눌러 주세요.',
    });
  }),
};

async function logUsage(
  admin: ReturnType<typeof serviceClient>,
  userId: string | null,
  model: string,
  status: 'success' | 'error',
  errorCode: string | null,
  usage: Record<string, unknown>,
  startedAt: number,
): Promise<void> {
  try {
    await admin?.from('ai_usage_logs').insert({
      user_id: userId, model, request_type: 'famous_body',
      input_tokens: typeof usage.input_tokens === 'number' ? usage.input_tokens : null,
      output_tokens: typeof usage.output_tokens === 'number' ? usage.output_tokens : null,
      total_tokens: typeof usage.total_tokens === 'number' ? usage.total_tokens : null,
      latency_ms: Date.now() - startedAt, status, error_code: errorCode,
    });
  } catch {
    /* logging never affects the response */
  }
}
