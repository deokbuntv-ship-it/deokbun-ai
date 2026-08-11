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

export type EngineEvidence = {
  availability: EngineEvidenceAvailability;
  summary?: string; // present only when availability === 'available'
  detail?: string;
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
