// STRUCTURED consultation output contract (sprint §11/§13). The LLM returns a JSON object whose
// fields map 1:1 to the existing StructuredConsultationViewModel long-form fields (reused names —
// no new schema invented). This module holds the schema INSTRUCTION appended to the prompt and the
// backend PARSER + VALIDATOR. Malformed / missing-substance output → null (caller falls back to
// plain text; never a crash, never a fabricated structuredResult from prose — §13).
//
// Long-form is the product core (§12): the instruction demands substantial 핵심 해석 + 강점/주의점 +
// 영역별 해석, EXPANDED. Timing (futureFlow) only when 대운/세운/월운 근거가 실제로 제공된 경우(§18).
// No fabricated 신강/용신/격국/신살; no claim of Ziwei/Qimen when 미연결 (§4/§22) — mirrors the
// System Constitution, so a compliant answer already honors it.

/** The schema request appended to the consultation prompt when grounding is available. */
export const STRUCTURED_OUTPUT_INSTRUCTION = [
  '[출력 형식 — 구조화 JSON]',
  '이번 답변은 아래 JSON 객체 하나로만 출력하십시오. JSON 앞뒤에 다른 설명 문장을 붙이지 마십시오.',
  '모든 문자열은 자연스러운 한국어 상담 문장입니다. 근거 없는 점수·등급·별점·확률·시점을 만들지',
  '마십시오. 제공되지 않은 엔진(예: 기문둔갑)을 사용했다고 말하지 마십시오. 명리와 자미두수 근거가',
  '함께 제공되면 각 관점을 어느 엔진에서 나왔는지 구분해 설명하고, 실제로 같은 방향일 때만 조심스럽게',
  "언급하되 '두 학문이 완전히 일치한다'처럼 근거 없는 합의를 단정하지 마십시오. 신강·신약·용신·격국·",
  '12운성·12신살을 계산된 사실처럼 단정하지 마십시오.',
  '{',
  '  "coreSummary": "한 줄 핵심(방향 제시용, 본문을 대체하지 않음)",',
  '  "disposition": "기본 성향 요약(선택)",',
  '  "coreInterpretation": "충분히 상세하고 개인화된 핵심 해석 본문(길게, 여러 문단).",',
  '  "strengths": ["타고난 강점 …"],',
  '  "cautions": ["주의할 패턴 …"],',
  '  "domainInterpretation": [{ "title": "일·직업·사업", "body": "…" }, { "title": "재물", "body": "…" }],',
  '  "futureFlow": "대운/세운 근거가 제공된 경우에만 앞으로의 흐름. 근거 없으면 빈 문자열.",',
  '  "followUps": ["이 상담에서 자연스럽게 이어지는 질문 2~4개"]',
  '}',
  'coreInterpretation은 반드시 충실하게 작성하고, 강점/주의점/영역별 해석을 숨기지 마십시오.',
].join('\n');

export type ParsedStructuredConsultation = {
  coreSummary?: string;
  disposition?: string;
  coreInterpretation?: string;
  strengths?: string[];
  cautions?: string[];
  domainInterpretation?: { title: string; body: string }[];
  futureFlow?: string;
  followUps?: string[];
};

function extractJson(text: string): unknown {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence ? fence[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
}

const str = (v: unknown): string | undefined => {
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
};
const strArray = (v: unknown): string[] | undefined => {
  if (!Array.isArray(v)) return undefined;
  const out = v.map(str).filter((x): x is string => x !== undefined);
  return out.length > 0 ? out : undefined;
};
const domainArray = (v: unknown): { title: string; body: string }[] | undefined => {
  if (!Array.isArray(v)) return undefined;
  const out = v
    .map((d) => {
      const o = d as { title?: unknown; body?: unknown } | null;
      const title = o ? str(o.title) : undefined;
      const body = o ? str(o.body) : undefined;
      return title && body ? { title, body } : null;
    })
    .filter((x): x is { title: string; body: string } => x !== null);
  return out.length > 0 ? out : undefined;
};

/**
 * Parse + validate the LLM structured response. Returns null when the text is not the expected JSON
 * or carries no consultation substance (→ caller uses plain-text fallback). Fail-closed, no throw.
 */
export function parseStructuredConsultation(text: string): ParsedStructuredConsultation | null {
  const raw = extractJson(text);
  if (raw === null || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;

  const parsed: ParsedStructuredConsultation = {
    coreSummary: str(o.coreSummary),
    disposition: str(o.disposition),
    coreInterpretation: str(o.coreInterpretation),
    strengths: strArray(o.strengths),
    cautions: strArray(o.cautions),
    domainInterpretation: domainArray(o.domainInterpretation),
    futureFlow: str(o.futureFlow),
    followUps: strArray(o.followUps),
  };

  // Substance gate (Codex FIX #6 / §8): a valid structured consultation must be LONG-FORM, not a
  // one-liner. Require BOTH the orientation (coreSummary) AND a substantive core interpretation,
  // with enough additional body to justify structured rendering. Summary-only / too-shallow → null
  // → safe plain-text fallback (no empty card).
  if (!isSubstantiveLongForm(parsed)) return null;
  return parsed;
}

const MIN_CORE_INTERPRETATION_CHARS = 120;

/** Long-form product gate: coreSummary + a substantive coreInterpretation (+ some supporting body). */
export function isSubstantiveLongForm(p: ParsedStructuredConsultation): boolean {
  if (!p.coreSummary || !p.coreInterpretation) return false;
  if (p.coreInterpretation.length < MIN_CORE_INTERPRETATION_CHARS) return false;
  // At least one supporting section beyond the core body (강점/주의점/영역별/앞으로의 흐름/기본 성향).
  const hasSupporting =
    (p.strengths?.length ?? 0) > 0 ||
    (p.cautions?.length ?? 0) > 0 ||
    (p.domainInterpretation?.length ?? 0) > 0 ||
    !!p.futureFlow ||
    !!p.disposition;
  return hasSupporting;
}

// ── Grounding-aware validation (Codex FIX #8/#9/#10) ─────────────────────────────────
// Second defensive layer AFTER the prompt instruction. NARROW, high-precision patterns — NOT a
// general NL classifier (§10/§11). Residual risk (subtle phrasings) is mitigated by the prompt and
// documented for Codex. A violation → null → plain-text fallback (never blessed as a structured card).
import type { ConsultationGrounding } from './grounding';

const ZIWEI_USE = /자미두수\s*(로\s*보|로\s*분석|를\s*보면|에\s*따르면|\s*분석|\s*결과|\s*명반|\s*차트|\s*상)/;
const QIMEN_USE = /(기문둔갑\s*(으로\s*보|으로\s*분석|을\s*보면|에\s*따르면|\s*분석|\s*결과|까지|도\s*(함께|같이|보|분석))|기문(둔갑)?\s*국)/;
const MULTI_ENGINE_CONSENSUS =
  /(세\s*(가지\s*)?학문|세\s*가지\s*역학|3\s*(개|가지)\s*(학문|엔진)|세\s*엔진)[^\n]{0,12}(일치|합치|같은\s*결론|동의|공통|모두)/;
// Saju↔Ziwei STRONG full-consensus claim. V1 produces NO deterministic cross-engine domain mapping
// (§22 — insufficient_evidence is the honest default), so an ABSOLUTE "두 학문이 완전히 일치/모두 …"
// claim is never grounded and is rejected (§23/§40). SOFT per-engine or "비슷한 방향" language is
// intentionally NOT matched (§21 permits it): the strong adverb / bare-"일치합니다" / "모두 …" gates below.
const CROSS_ENGINE_CONSENSUS =
  /(두\s*학문|두\s*관점)[^\n]{0,12}(완전히|모두|정확히|똑같이|전부)\s*(일치|합치|동일|같)|두\s*학문[^\n]{0,6}일치(합니다|한다|하고|하며)|(사주(와|랑|과|·)\s*자미두수|자미두수(와|랑|과|·)\s*사주)[^\n]{0,16}모두[^\n]{0,14}(일치|동일|강하|좋|많|뛰어|같)/;
const FORBIDDEN_THEORY =
  /((당신[은는]?\s*)?신강[한\s]*(사주|입니다|합니다|이에요)|(당신[은는]?\s*)?신약[한\s]*(사주|입니다|합니다|이에요)|용신(은|이)\s*(?!아직|없|미|계산|불명|모름|따로|판정)\S|격국(은|이)\s*(?!아직|없|미|계산|불명|모름|따로|판정)\S|(12|십이)\s*운성|(12|십이)\s*신살)/;

function coreProseFields(p: ParsedStructuredConsultation): string[] {
  return [
    p.coreSummary,
    p.disposition,
    p.coreInterpretation,
    ...(p.strengths ?? []),
    ...(p.cautions ?? []),
    ...(p.domainInterpretation ?? []).map((d) => `${d.title} ${d.body}`),
  ].filter((x): x is string => typeof x === 'string');
}

// The MAIN answer body (core prose + futureFlow). An engine/consensus/theory violation HERE makes
// the whole answer unusable. followUps are validated SEPARATELY (a single bad suggestion is dropped,
// not the whole answer) — Codex pipeline FIX #2/§7.
function mainBodyText(p: ParsedStructuredConsultation): string {
  return [...coreProseFields(p), p.futureFlow]
    .filter((x): x is string => typeof x === 'string')
    .join('\n');
}

// ── evidence-derived timing anchors (Codex pipeline FIX #2 + FIX A) ───────────────────
type TimingAnchors = {
  years: Set<number>;
  referenceYear: number | null;
  ageMin: number | null;
  ageMax: number | null;
  hasMonthly: boolean;
};

function timingAnchorsOf(grounding: ConsultationGrounding): TimingAnchors {
  const anchors: TimingAnchors = { years: new Set(), referenceYear: null, ageMin: null, ageMax: null, hasMonthly: false };
  if (grounding.status !== 'available') return anchors;
  for (const ev of [grounding.evidence.myungri, grounding.evidence.ziwei, grounding.evidence.qimen]) {
    const ta = ev.timingAnchors;
    if (!ta) continue;
    for (const y of ta.years ?? []) if (Number.isFinite(y)) anchors.years.add(y);
    if (typeof ta.referenceYear === 'number' && anchors.referenceYear === null) anchors.referenceYear = ta.referenceYear;
    if (ta.hasMonthlyEvidence === true) anchors.hasMonthly = true;
    if (ta.daewoonAgeSpan) {
      anchors.ageMin = anchors.ageMin === null ? ta.daewoonAgeSpan.min : Math.min(anchors.ageMin, ta.daewoonAgeSpan.min);
      anchors.ageMax = anchors.ageMax === null ? ta.daewoonAgeSpan.max : Math.max(anchors.ageMax, ta.daewoonAgeSpan.max);
    }
  }
  return anchors;
}

// FIX A — relative-definite year terms resolved against the reference (current 세운) year.
const RELATIVE_YEAR: readonly [RegExp, number][] = [
  [/내후년/, 2],
  [/내년|명년/, 1],
  [/올해|금년/, 0],
];

// A SPECIFIC period NOT covered by the evidence anchors is an unsupported/fabricated timing claim.
// Covers: explicit "YYYY년"; relative-definite years (올해/내년/내후년) via referenceYear; numeric relative
// offsets ("3년 뒤/후"); relative months (이번 달/다음 달) via monthly-evidence presence; and ages/decades/
// life-stages via the Daewoon age span. VAGUE, non-specific language (향후 몇 년, 앞으로, 조만간, 언젠가)
// carries no resolvable period and is intentionally NOT flagged (§2).
function hasUnsupportedTiming(text: string, anchors: TimingAnchors): boolean {
  const yearOK = (y: number): boolean => anchors.years.has(y);

  // explicit Gregorian year
  for (const m of text.matchAll(/((?:19|20|21)\d{2})\s*년/g)) {
    if (!yearOK(Number(m[1]))) return true;
  }
  // relative-definite year (올해/내년/내후년)
  for (const [re, off] of RELATIVE_YEAR) {
    if (re.test(text) && (anchors.referenceYear === null || !yearOK(anchors.referenceYear + off))) return true;
  }
  // numeric relative offset "N년 뒤/후" (specific). Vague "몇 년/여러 해" has no digit → not matched.
  for (const m of text.matchAll(/(\d{1,2})\s*년\s*(?:뒤|후|후에|뒤에)/g)) {
    const off = Number(m[1]);
    if (anchors.referenceYear === null || !yearOK(anchors.referenceYear + off)) return true;
  }
  // relative months — no NEXT-month evidence is ever computed; the current month needs 월운 evidence.
  if (/(다음\s*달|담\s*달|이듬\s*달|다음달)/.test(text)) return true;
  if (/(이번\s*달|이달|금월|이번달)/.test(text) && !anchors.hasMonthly) return true;

  // ages / decades / life-stages: with NO Daewoon age span, ANY age claim is unsupported (fail-closed).
  const hasSpan = anchors.ageMin !== null && anchors.ageMax !== null;
  const AGE_REF = /\d{1,3}\s*(?:세|살)|[1-9]0\s*대|중년|장년|노년|말년|청년|초년/;
  if (AGE_REF.test(text) && !hasSpan) return true;
  if (hasSpan) {
    for (const m of text.matchAll(/(\d{1,3})\s*(?:세|살)/g)) {
      const a = Number(m[1]);
      if (a < (anchors.ageMin as number) || a > (anchors.ageMax as number)) return true;
    }
    for (const m of text.matchAll(/([1-9])0\s*대/g)) {
      const lo = Number(m[1]) * 10; // a decade fully outside the Daewoon span is unsupported
      if (lo + 9 < (anchors.ageMin as number) || lo > (anchors.ageMax as number)) return true;
    }
  }
  return false;
}

// Engine-use / consensus / unsupported-theory violation on a piece of text, given the CURRENT engine
// availability. Shared by the structured validator AND the raw-text safety scan (FIX #1).
function hasEngineOrConsensusViolation(text: string, grounding: ConsultationGrounding): boolean {
  const ziweiAvailable = grounding.status === 'available' && grounding.evidence.ziwei.availability === 'available';
  const qimenAvailable = grounding.status === 'available' && grounding.evidence.qimen.availability === 'available';
  if (!ziweiAvailable && ZIWEI_USE.test(text)) return true; // false Ziwei use when unconnected
  if (!qimenAvailable && QIMEN_USE.test(text)) return true; // false Qimen use when unconnected
  if (!(ziweiAvailable && qimenAvailable) && MULTI_ENGINE_CONSENSUS.test(text)) return true; // fake 3-학문 일치
  if (CROSS_ENGINE_CONSENSUS.test(text)) return true; // fake Saju↔Ziwei full consensus (no V1 cross-map)
  if (FORBIDDEN_THEORY.test(text)) return true; // 신강/신약/용신/격국/12운성/12신살 as computed fact
  return false;
}

/** A single semantic safety scan (engine + consensus + theory + unsupported timing) over any text. */
export function hasSemanticViolation(text: string, grounding: ConsultationGrounding): boolean {
  return hasEngineOrConsensusViolation(text, grounding) || hasUnsupportedTiming(text, timingAnchorsOf(grounding));
}

/**
 * Reconcile the parsed structured output with the deterministic grounding. Returns the cleaned result,
 * or null when a SEMANTIC safety violation makes it unusable:
 *  - false Ziwei/Qimen use, multi-engine or Saju↔Ziwei "consensus", unsupported theory (any field
 *    incl. followUps) → reject (null).
 *  - unsupported specific timing (연도/나이 not in evidence anchors) in a CORE prose field → reject.
 *  - `futureFlow` with no timing evidence OR an unsupported period → dropped (never fabricated timing).
 *  - followUps asserting unsupported timing or an unconnected-engine/theory claim → individually dropped.
 */
export function validateStructuredAgainstGrounding(
  parsed: ParsedStructuredConsultation,
  grounding: ConsultationGrounding,
): ParsedStructuredConsultation | null {
  const hasTiming = grounding.status === 'available' && grounding.evidence.myungri.hasTimingEvidence === true;
  const anchors = timingAnchorsOf(grounding);

  // (1) Engine/consensus/theory violation in the MAIN body (core prose + futureFlow) → reject whole.
  if (hasEngineOrConsensusViolation(mainBodyText(parsed), grounding)) return null;

  // (2) Unsupported specific period inside CORE prose (a year cannot be safely excised from prose) → reject.
  if (hasUnsupportedTiming(coreProseFields(parsed).join('\n'), anchors)) return null;

  // (3) futureFlow: needs timing evidence AND every period it names must be evidence-supported.
  let futureFlow = parsed.futureFlow;
  if (futureFlow && (!hasTiming || hasUnsupportedTiming(futureFlow, anchors))) futureFlow = undefined;

  // (4) followUps: drop any that carry an unsupported period or an unconnected-engine/theory claim.
  const cleanedFollowUps = (parsed.followUps ?? []).filter(
    (f) => !hasUnsupportedTiming(f, anchors) && !hasEngineOrConsensusViolation(f, grounding),
  );

  return {
    ...parsed,
    futureFlow,
    followUps: cleanedFollowUps.length > 0 ? cleanedFollowUps : undefined,
  };
}

// ── FIX #1: typed outcome so SEMANTIC rejection never leaks the raw model text ────────────────
// A safe generic message shown when the model output is semantically unsafe. NEVER a fabricated
// interpretation — it simply asks the user to retry. The raw (unsafe) text is discarded.
export const SEMANTIC_REJECTION_MESSAGE =
  '죄송합니다. 이번 답변을 근거에 맞게 안전하게 정리하지 못했습니다. 질문을 조금 바꾸어 다시 여쭤봐 주시겠어요?';

export type ConsultationOutcome =
  | { kind: 'ACCEPTED'; result: ParsedStructuredConsultation }
  | { kind: 'STRUCTURAL_FALLBACK'; text: string }
  | { kind: 'SEMANTIC_REJECTED'; reason: string };

/**
 * Classify a raw LLM response for safe rendering (Codex pipeline FIX #1). Distinguishes:
 *  - ACCEPTED           → valid structured long-form that passed grounding validation.
 *  - STRUCTURAL_FALLBACK → not the structured schema, but the raw prose is semantically SAFE to show.
 *  - SEMANTIC_REJECTED   → a safety/evidence violation (false engine, fake consensus, unsupported theory
 *                          or timing). The raw text is NEVER shown; the caller uses a safe message.
 * The critical property: a semantic violation in EITHER the structured JSON OR the raw prose blocks
 * the raw text from ever reaching the user as a fallback.
 */
export function classifyConsultationOutput(
  rawText: string,
  grounding: ConsultationGrounding,
): ConsultationOutcome {
  const parsed = parseStructuredConsultation(rawText);
  if (parsed) {
    const validated = validateStructuredAgainstGrounding(parsed, grounding);
    return validated
      ? { kind: 'ACCEPTED', result: validated }
      : { kind: 'SEMANTIC_REJECTED', reason: 'structured_semantic_violation' };
  }
  // Not the structured schema → candidate for a plain-text fallback, but ONLY if the raw prose itself
  // is semantically safe. A false-engine/consensus/theory claim or an unsupported period → reject.
  if (hasSemanticViolation(rawText, grounding)) {
    return { kind: 'SEMANTIC_REJECTED', reason: 'raw_semantic_violation' };
  }
  return { kind: 'STRUCTURAL_FALLBACK', text: rawText };
}

/** A readable plain-text rendering (for message persistence + the non-structured fallback). */
export function composeConsultationText(p: ParsedStructuredConsultation): string {
  const blocks: string[] = [];
  if (p.coreSummary) blocks.push(p.coreSummary);
  if (p.disposition) blocks.push(`[기본 성향]\n${p.disposition}`);
  if (p.coreInterpretation) blocks.push(p.coreInterpretation);
  if (p.strengths?.length) blocks.push(`[강점]\n${p.strengths.map((s) => `· ${s}`).join('\n')}`);
  if (p.cautions?.length) blocks.push(`[주의할 점]\n${p.cautions.map((s) => `· ${s}`).join('\n')}`);
  for (const d of p.domainInterpretation ?? []) blocks.push(`[${d.title}]\n${d.body}`);
  if (p.futureFlow) blocks.push(`[앞으로의 흐름]\n${p.futureFlow}`);
  return blocks.join('\n\n');
}
