// Server-owned OpenAI Structured Outputs schema for the CONSULTATION response (fixes
// UNRENDERABLE_STRUCTURED_JSON: prompt-only JSON was malformed/truncated in production). Runtime-neutral +
// bundled + Jest-tested. The OpenAI Responses API constrains gpt-5-mini's output to this exact schema, so
// the server always receives PARSEABLE JSON. This does NOT replace semantic validation — the grounding
// validator (Qimen/consensus/theory/timing) still runs after structural parsing.
//
// Strict-mode rules (OpenAI): every property must be in `required`; optionals are nullable; objects set
// `additionalProperties: false`. Kept minimal (types only — no length/count keywords) so the request can
// never be rejected for an unsupported schema keyword; the server substance gate + bounds size it later.
//
// The schema mirrors ParsedStructuredConsultation exactly (coreSummary, disposition, coreInterpretation,
// strengths, cautions, domainInterpretation[{title,body}], futureFlow, followUps). The server-added VM
// fields (assessment, grounding, state) are NOT model output and are intentionally absent.

export const CONSULTATION_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    coreSummary: { type: 'string' },
    disposition: { type: ['string', 'null'] },
    coreInterpretation: { type: 'string' },
    strengths: { type: 'array', items: { type: 'string' } },
    cautions: { type: 'array', items: { type: 'string' } },
    domainInterpretation: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: { title: { type: 'string' }, body: { type: 'string' } },
        required: ['title', 'body'],
      },
    },
    futureFlow: { type: ['string', 'null'] },
    followUps: { type: 'array', items: { type: 'string' } },
  },
  required: [
    'coreSummary',
    'disposition',
    'coreInterpretation',
    'strengths',
    'cautions',
    'domainInterpretation',
    'futureFlow',
    'followUps',
  ],
} as const;

// The `text.format` value for the OpenAI Responses API request (consultation only; NOT summary).
export function consultationResponseFormat(): {
  type: 'json_schema';
  name: string;
  strict: true;
  schema: typeof CONSULTATION_JSON_SCHEMA;
} {
  return { type: 'json_schema', name: 'deokbun_consultation', strict: true, schema: CONSULTATION_JSON_SCHEMA };
}
