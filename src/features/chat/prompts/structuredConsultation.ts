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
  '마십시오. 사용되지 않은 자미두수/기문둔갑을 사용했다고 말하지 말고, 신강·신약·용신·격국·12운성·',
  '12신살을 계산된 사실처럼 단정하지 마십시오.',
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

  // Substance gate (§13): a valid structured consultation must carry the main body. If the model
  // returned an empty/degenerate object, fall back to plain text rather than render an empty card.
  if (!parsed.coreInterpretation && !parsed.coreSummary) return null;
  return parsed;
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
