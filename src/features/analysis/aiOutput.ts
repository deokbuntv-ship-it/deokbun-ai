// Structured AI Output Contract (directive §8/§24/§25).
//
// The target shape of a STRUCTURED consultation answer that the 03_AI_CONSULTATION
// UI can render as 결론 → 종합 판단 → 근거(명리/자미두수/기문둔갑) accordions → 후속
// 질문. Each engine's evidence carries an AVAILABILITY status, so the UI honestly
// shows "미연결 / 시간 정보 없음 / 해당 없음" instead of fabricating a result.
//
// IMPORTANT (제3조): this file NEVER invents 자미두수/기문둔갑 content. The parser
// only reads what the LLM actually returned; when the response is not structured
// (the current reality — the prompt does not yet request this schema) it returns
// null and the UI falls back to the existing plain-Markdown rendering.

export type EngineEvidenceAvailability =
  | 'available'
  | 'not_applicable'
  | 'missing_birth_time'
  | 'engine_not_connected'
  | 'calculation_failed';

// A labeled deterministic fact section (natal / relations / timing / provenance / limitations).
// Machine-readable structure so grounding delivers facts to the prompt without a single opaque blob.
export type EngineEvidenceSection = {
  label: string;
  lines: string[];
};

// Structured timing anchors DERIVED from the deterministic evidence (Codex FIX #2). The validator
// uses these as the ALLOWLIST for any specific period the LLM asserts — a Gregorian year not in
// `years` (and outside the Daewoon age span) is an unsupported/fabricated timing claim. Facts only;
// never widened by the LLM.
export type EngineEvidenceTimingAnchors = {
  /** Gregorian years the evidence actually covers (current 세운/월운 target years). */
  years: number[];
  /** Inclusive age span covered by the Daewoon cycles, when available. */
  daewoonAgeSpan?: { min: number; max: number } | null;
};

export type EngineEvidence = {
  availability: EngineEvidenceAvailability;
  summary?: string; // present only when availability === 'available'
  detail?: string;
  // Additive (Codex FIX #1/#3/#4): structured fact sections carried to the prompt. When present,
  // the grounding renderer emits these instead of only the one-line summary.
  sections?: EngineEvidenceSection[];
  // Additive (Codex FIX #8): true when real timing facts (Daewoon/Sewoon/Wolwoon) are present —
  // gates whether the LLM's `futureFlow` may be accepted as factual timing content.
  hasTimingEvidence?: boolean;
  // Additive (Codex pipeline FIX #2): structured allowlist of the specific periods the evidence
  // covers, so timing validation gates ALL user-facing fields (not just futureFlow) against real data.
  timingAnchors?: EngineEvidenceTimingAnchors;
};

export type StructuredAiResponse = {
  conclusion: string; // 먼저 결론부터
  overallAssessment: string; // 종합 판단
  evidence: {
    myungri: EngineEvidence; // 명리
    ziwei: EngineEvidence; // 자미두수
    qimen: EngineEvidence; // 기문둔갑
  };
  timing?: string | null;
  limitations?: string | null;
  followUpQuestions: string[];
};

const AVAILABILITY: readonly EngineEvidenceAvailability[] = [
  'available',
  'not_applicable',
  'missing_birth_time',
  'engine_not_connected',
  'calculation_failed',
];

function isEvidence(v: unknown): v is EngineEvidence {
  const o = v as { availability?: unknown } | null;
  return (
    o !== null &&
    typeof o === 'object' &&
    typeof o.availability === 'string' &&
    (AVAILABILITY as readonly string[]).includes(o.availability)
  );
}

// Extract a JSON object from an LLM text response: a ```json fenced block, or the
// first balanced {...} span. Returns null if none parses.
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

// Returns a validated StructuredAiResponse, or null when the response is not
// structured (→ caller renders the raw Markdown answer instead). No fabrication.
export function parseStructuredAiResponse(text: string): StructuredAiResponse | null {
  const raw = extractJson(text);
  if (raw === null || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const ev = o.evidence as Record<string, unknown> | undefined;

  if (
    typeof o.conclusion !== 'string' ||
    typeof o.overallAssessment !== 'string' ||
    !ev ||
    !isEvidence(ev.myungri) ||
    !isEvidence(ev.ziwei) ||
    !isEvidence(ev.qimen)
  ) {
    return null;
  }

  const followUps = Array.isArray(o.followUpQuestions)
    ? o.followUpQuestions.filter((x): x is string => typeof x === 'string')
    : [];

  return {
    conclusion: o.conclusion,
    overallAssessment: o.overallAssessment,
    evidence: {
      myungri: ev.myungri,
      ziwei: ev.ziwei,
      qimen: ev.qimen,
    },
    timing: typeof o.timing === 'string' ? o.timing : null,
    limitations: typeof o.limitations === 'string' ? o.limitations : null,
    followUpQuestions: followUps,
  };
}
