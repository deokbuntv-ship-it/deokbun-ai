// Premium Report orchestrator — runtime-neutral, exactly ONE LLM call, mirroring buildTodayFortune /
// buildMonthlyFortune. It calculates nothing beyond the deterministic premium evidence; the model verbalizes,
// the server owns the evidence lines and every cap. Output is parsed, capped, and scrubbed with the SAME
// guards the monthly path uses (engine labels, raw 간지, event guarantees, unsupported date precision).
import type { BirthInfoDraft } from '@/features/consultation';
import type { DigestProvider, HistoricalTimezoneResolver } from '@/features/interpretation';
import type { LLMMessage } from '@/features/chat/types/chatArchitecture';
import { containsRawGanji, stripEngineLabels } from '@/features/chat/presentation/commercialText';
import { containsEventGuarantee, containsUnsupportedDatePrecision } from '@/features/monthly/server/buildMonthlyFortune';
import { buildPremiumEvidence, premiumEvidenceLines, type PremiumEvidenceDeps } from '@/features/premium/engine/premiumEvidence';
import { buildPremiumReportPrompt } from '@/features/premium/server/premiumReportPrompt';
import { PREMIUM_POLICY_VERSION, type PremiumMonthOutlook, type PremiumReportResult, type PremiumSection } from '@/features/premium/types';

export type PremiumReportRequest = { birthInput: BirthInfoDraft };

export type PremiumReportDeps = PremiumEvidenceDeps & {
  callLLM: (messages: LLMMessage[]) => Promise<string>;
  /** 재시도로 살아난 사실을 호출자가 로그에 남길 수 있게. 성공 경로에서만, 재시도했을 때만 불린다. */
  onRetry?: (firstFailure: PremiumRejectReason) => void;
};

export type PremiumReportServerResult =
  | {
      ok: true;
      result: PremiumReportResult;
      policyVersion: string;
      evidenceVersion: string;
      coveredMonths: { year: number; month: number }[];
    }
  | { ok: false; reason: 'EVIDENCE_UNAVAILABLE' | 'LLM_FAILED' | 'INVALID_OUTPUT'; detail?: string };

const MAX_SECTIONS = 6;
const MAX_ACTIONS = 5;

const clean = (s: unknown): string => (typeof s === 'string' ? stripEngineLabels(s).trim() : '');

/** A line the product must never ship: fabricated 간지, an event guarantee, or day/week precision. */
// ── 비허용 문자 (2026-09-02). 실제 출력에 `नियमित적으로` 가 나갔다 — Terra 가 데바나가리를 섞은 것이고
// 기존 스크러버(간지·이벤트 보장·날짜 정밀도)는 이런 종류를 보지 않는다. 50덕 상품에 깨진 글자가 나가면
// 환불 사유이므로 허용목록 방식으로 막는다: 한글·한자·라틴문자·숫자·공백·일반 문장부호만.
//
// 동작은 (a) 문자 제거도 (c) 전체 실패도 아니라 **그 문장만 버린다**. 제거는 `नियमित적으로`를
// `적으로`로 만들어 뜻이 깨진 채 나가고, 전체 실패는 나머지가 멀쩡한데 50덕짜리 리포트를 통째로
// 날린다. 섹션 하나가 빠지면 나머지는 그대로 전달되고, 12개월처럼 개수가 계약인 곳은 서버가 그 달의
// 구조로 쓴 대체 문장을 넣는다(monthFallback) — 빈 줄은 유료 리포트에 그대로 보이기 때문이다.
const ALLOWED_TEXT = /^[\sㄱ-ㆎ가-힣一-鿿 A-Za-z0-9.,!?~·…'"“”‘’()[\]:;/%+\-—–]*$/u;
export function containsForeignScript(text: string): boolean {
  return !ALLOWED_TEXT.test(text);
}

// 본문(결론·섹션·12개월·actions)에 전문용어가 새어 나왔는지. 근거줄은 대상이 아니다 — 근거줄은 서버가
// 쓰고, "쉬운 결론 (근거: 전문용어)" 가 원래 설계다(premiumEvidence.ts, groundedNarrative.anchored()).
//
// V2 에서 상담의 TECHNICAL_LEXICON 을 그대로 베껴 왔다가 정상 문장을 물었다. 실측(V1 상품 문장 116줄):
// `세운`이 2줄을 죽였고 그중 하나가 12개월 줄이었다 — "목적을 앞세운 대화", "큰 목표를 세운 뒤".
// 일상 한국어 10문장 중 9개가 오검출이었다(세운·관성·비겁·월간·일지·일간·상관).
//
// 그래서 규칙을 **모델이 실제로 받은 것**으로 좁혔다. 프롬프트는 십신 이름만 원어로 넘기고 자리·관계는
// 글로스로 넘긴다(plainify). 받지 않은 말은 새어 나올 수 없으므로, 일상어와 겹치는 토큰은 전부 뺐다:
//   세운(세우다) · 관성(慣性) · 비겁(비겁하다) · 식상(식상하다) · 월간/일간(月刊·日刊) · 일지(日誌) · 재성
// 남긴 것 중 일상어와 겹칠 수 있는 셋은 좁은 예외를 단다: 일주(일주일) · 정재(정재계) · 통근(通勤).
const LEAKED_IDENTIFIER =
  /비견|겁재|식신|편재|정재(?!계)|편관|정관|편인|정인|칠살|상관(?!없|있|한다|하지|하고|관계|성|도)|년주|월주|일주(?!일)|시주|원국|지장간|통근(?!\s*(?:하|길|시간|버스|열차|족))|투간|득령|실령|왕상휴수사|대운|월운|일운|\b(?:WOOD|FIRE|EARTH|METAL|WATER|PARALLEL|RESOURCE|OUTPUT|WEALTH|OFFICER)\b|\b[A-Z]{3,}_[A-Z_]+\b/;
export function containsLeakedIdentifier(text: string): boolean {
  return LEAKED_IDENTIFIER.test(text);
}

// 각 달 문장이 스스로 "2026년 9월" 을 다시 쓰는 중복. 화면에서 라벨이 앞에 붙으므로 두 번 나온다.
// 프롬프트에서 금지했지만(1-1 (a)) 모델 출력은 변동하므로 서버에서도 걷어낸다 — (c) 둘 다.
const LEADING_DATE = /^\s*(?:\d{4}\s*년\s*)?\d{1,2}\s*월(?:에는|은|는|의|:|,|\s*—|\s*-)?\s*/;
export function stripLeadingMonthLabel(text: string): string {
  return text.replace(LEADING_DATE, '').replace(/^\s*이\s*달(?:에는|은|는)?\s*/, '').trim();
}

function unsafe(text: string): boolean {
  return containsRawGanji(text) || containsEventGuarantee(text) || containsUnsupportedDatePrecision(text)
    || containsForeignScript(text) || containsLeakedIdentifier(text);
}

/**
 * A month whose model sentence was rejected gets this instead of a blank. Blanking kept the 12-line contract
 * but handed a paying reader an empty March (it happened: 1 line of 48 in the 2026-09-02 sample). The
 * fallback is written from that month's OWN structure — the same facts the prompt carried — so it is
 * truthful, deterministic, and free of the technical lexicon. It says less than the model would have, which
 * is the correct trade when the model's line could not be shipped.
 */
function monthFallback(m: PremiumMonthOutlook | undefined): string {
  if (!m) return '';
  if (m.harmony.length > 0 && m.friction.length > 0) return '맞물려 풀리는 쪽과 조정이 필요한 쪽이 같이 들어오는 달입니다.';
  if (m.harmony.length > 0) return '여러 자리가 함께 맞물려 일이 연결되고 정리되기 좋은 달입니다.';
  if (m.friction.length > 0) return '타고난 자리 쪽과 부딪히는 곳이 있어, 조정할 일이 생기기 쉬운 달입니다.';
  return '걸리는 곳이 따로 없어, 압력 없이 준비하기 좋은 조용한 달입니다.';
}

/**
 * Parse + cap + scrub the model JSON. `months` is the SERVER's window — a monthlyOutlook that does not
 * match it is truncated (too long) or the report is rejected (too short), because a month the reader is
 * charged for must not silently go missing.
 */
export type PremiumParseOutcome =
  | { ok: true; result: PremiumReportResult }
  /** 왜 버렸는지. 고정 문자열이며 그대로 error_code 로 올라간다 — 자유 텍스트는 절대 싣지 않는다. */
  | { ok: false; why: PremiumRejectReason };

export type PremiumRejectReason =
  | 'NOT_JSON' | 'HEADLINE_EMPTY' | 'NATAL_EMPTY' | 'HEADLINE_UNSAFE' | 'NATAL_UNSAFE'
  | 'NO_SECTIONS' | 'MONTHS_SHORT';

export function parsePremiumReport(raw: string, months: readonly PremiumMonthOutlook[], evidence: string[]): PremiumParseOutcome {
  const monthCount = months.length;
  let obj: unknown;
  try {
    obj = JSON.parse(raw);
  } catch {
    return { ok: false, why: 'NOT_JSON' };
  }
  if (!obj || typeof obj !== 'object') return { ok: false, why: 'NOT_JSON' };
  const o = obj as Record<string, unknown>;

  const headline = clean(o.headline);
  const natalSummary = clean(o.natalSummary);
  if (headline.length === 0) return { ok: false, why: 'HEADLINE_EMPTY' };
  if (natalSummary.length === 0) return { ok: false, why: 'NATAL_EMPTY' };
  if (unsafe(headline)) return { ok: false, why: 'HEADLINE_UNSAFE' };
  if (unsafe(natalSummary)) return { ok: false, why: 'NATAL_UNSAFE' };

  const flowRaw = clean(o.flowSummary);
  const flowSummary = flowRaw.length > 0 && !unsafe(flowRaw) ? flowRaw : null;

  const sections: PremiumSection[] = [];
  for (const s of Array.isArray(o.sections) ? o.sections : []) {
    const ss = (s ?? {}) as Record<string, unknown>;
    const title = clean(ss.title);
    const body = clean(ss.body);
    if (title.length === 0 || body.length === 0) continue;
    if (unsafe(title) || unsafe(body)) continue;
    sections.push({ title, body });
    if (sections.length >= MAX_SECTIONS) break;
  }
  if (sections.length === 0) return { ok: false, why: 'NO_SECTIONS' };

  const monthlyOutlook: string[] = [];
  for (const m of Array.isArray(o.monthlyOutlook) ? o.monthlyOutlook : []) {
    const line = stripLeadingMonthLabel(clean(m));
    // A dropped month would silently shorten a paid window, so an unsafe line falls back, never disappears.
    monthlyOutlook.push(line.length === 0 || unsafe(line) ? monthFallback(months[monthlyOutlook.length]) : line);
    if (monthlyOutlook.length >= monthCount) break;
  }
  if (monthlyOutlook.length < monthCount) return { ok: false, why: 'MONTHS_SHORT' };

  const actions: string[] = [];
  for (const a of Array.isArray(o.actions) ? o.actions : []) {
    const line = clean(a);
    if (line.length === 0 || unsafe(line)) continue;
    actions.push(line);
    if (actions.length >= MAX_ACTIONS) break;
  }

  return { ok: true, result: { headline, natalSummary, flowSummary, sections, monthlyOutlook, actions, evidence } };
}

/**
 * 재시도할 때 붙이는 교정 한 줄. 같은 프롬프트로 다시 뽑아도 대개 통과하지만, 무엇을 어겼는지 알려
 * 주면 두 번째 표본의 성공률이 올라간다. 새 사실을 주지 않고 **어긴 규칙만** 다시 말한다.
 */
const RETRY_HINT: Record<PremiumRejectReason, string> = {
  NOT_JSON: '직전 시도의 출력이 JSON 으로 읽히지 않았다. 지정된 스키마의 JSON 객체 하나만 출력하라.',
  HEADLINE_EMPTY: '직전 시도에 headline 이 비어 있었다. 반드시 한 문장으로 채워라.',
  NATAL_EMPTY: '직전 시도에 natalSummary 가 비어 있었다. 반드시 3~5문장으로 채워라.',
  HEADLINE_UNSAFE: '직전 시도의 headline 이 금지된 말을 담아 버려졌다. 제목에 십신 이름·자리 이름·간지 한자를 쓰지 말고, 날짜 단정도 하지 마라.',
  NATAL_UNSAFE: '직전 시도의 natalSummary 가 금지된 말을 담아 버려졌다. 십신 이름·자리 이름·간지 한자를 쓰지 말고, 사건을 보장하지 마라.',
  NO_SECTIONS: '직전 시도의 sections 가 전부 버려졌다. 각 제목과 본문에 십신 이름·자리 이름·간지 한자를 쓰지 마라.',
  MONTHS_SHORT: '직전 시도의 monthlyOutlook 개수가 모자랐다. 주어진 달 수와 정확히 같은 개수를 순서대로 출력하라.',
};

/** 재시도 프롬프트 = 원본 + 교정 한 줄. 근거는 그대로 두고 지시만 덧붙인다. */
function withHint(messages: LLMMessage[], why: PremiumRejectReason): LLMMessage[] {
  const out = messages.map((m) => ({ ...m }));
  const last = out[out.length - 1];
  if (last) last.content = `${last.content}\n\n■ 재시도 안내\n${RETRY_HINT[why]}`;
  return out;
}

export async function buildPremiumReport(
  request: PremiumReportRequest,
  deps: PremiumReportDeps,
): Promise<PremiumReportServerResult> {
  const ev = await buildPremiumEvidence({ birthInfo: request.birthInput }, deps);
  if (!ev.available) return { ok: false, reason: 'EVIDENCE_UNAVAILABLE', detail: ev.reason };

  const messages = buildPremiumReportPrompt(ev);
  const evidence = premiumEvidenceLines(ev);

  const attempt = async (msgs: LLMMessage[]): Promise<PremiumParseOutcome | 'LLM_FAILED'> => {
    let raw = '';
    try {
      raw = await deps.callLLM(msgs);
    } catch {
      return 'LLM_FAILED';
    }
    if (typeof raw !== 'string' || raw.trim().length === 0) return 'LLM_FAILED';
    return parsePremiumReport(raw, ev.months, evidence);
  };

  let parsed = await attempt(messages);
  if (parsed === 'LLM_FAILED') return { ok: false, reason: 'LLM_FAILED' };

  // ── 한 번만 다시 뽑는다 (2026-09-02).
  //
  // 관측 실패율 1/9: 프롬프트도 사람도 같은데 모델 출력이 한 번 규칙을 어겨 50덕 리포트가 통째로 502 가
  // 됐다. 덕은 이미 예약 단계에서 한 번만 잡히므로 재시도가 이중 청구를 만들지 않고, 두 번째 호출도
  // 같은 `premiumDeadlineAt` 을 쓰므로 남은 시간이 없으면 스스로 실패한다 — 데드라인 초과는 정상 실패다.
  //
  // **파싱/스크럽 거절(INVALID_OUTPUT)에만 다시 뽑는다.** 타임아웃·상류 장애(LLM_FAILED)는 다시 불러도
  // 같은 이유로 실패하고 남은 데드라인만 태운다. 그래서 첫 시도가 LLM_FAILED 면 위에서 바로 끝낸다.
  let retriedFrom: PremiumRejectReason | null = null;
  if (!parsed.ok) {
    retriedFrom = parsed.why;
    const second = await attempt(withHint(messages, parsed.why));
    // 재시도가 인프라로 죽으면 **첫 실패 사유**를 남긴다 — 원인은 그쪽이고, 그게 다음 조사의 단서다.
    if (second === 'LLM_FAILED') return { ok: false, reason: 'INVALID_OUTPUT', detail: `${parsed.why}_RETRY_LLM_FAILED` };
    parsed = second;
  }

  if (!parsed.ok) {
    return { ok: false, reason: 'INVALID_OUTPUT', detail: retriedFrom ? `${retriedFrom}_RETRY_${parsed.why}` : parsed.why };
  }
  if (retriedFrom) deps.onRetry?.(retriedFrom);

  return {
    ok: true,
    result: parsed.result,
    policyVersion: PREMIUM_POLICY_VERSION,
    evidenceVersion: ev.evidenceVersion,
    coveredMonths: ev.months.map((m) => ({ year: m.year, month: m.month })),
  };
}
