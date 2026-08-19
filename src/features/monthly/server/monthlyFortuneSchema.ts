// OpenAI Structured-Outputs schema for the MONTHLY fortune (§34). Same strict-mode discipline as the
// consultation/today schemas (every property in `required`, `additionalProperties:false`, no length keywords —
// the server parser enforces the caps). The model returns ONLY prose in this exact shape; the server owns the
// tier / mode / domain statuses and attaches them after parsing.
export const MONTHLY_FORTUNE_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    // headline: a concrete one-liner answering "이번 달은 어떤 달인가" (§19).
    headline: { type: 'string' },
    // verdict: 1-3 sentences — overall judgment + strongest opportunity + primary caution (§20).
    verdict: { type: 'string' },
    overallSummary: { type: 'string' },
    opportunities: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: { domain: { type: 'string' }, title: { type: 'string' }, body: { type: 'string' } },
        required: ['domain', 'title', 'body'],
      },
    },
    cautions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: { title: { type: 'string' }, body: { type: 'string' } },
        required: ['title', 'body'],
      },
    },
    // actions: the month's plan — concrete "이렇게 보내세요" steps (§23).
    actions: { type: 'array', items: { type: 'string' } },
    // followUps: SHORT chip label + the RICH question actually carried into 상담 (§65-§67).
    followUps: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: { displayLabel: { type: 'string' }, question: { type: 'string' } },
        required: ['displayLabel', 'question'],
      },
    },
  },
  required: ['headline', 'verdict', 'overallSummary', 'opportunities', 'cautions', 'actions', 'followUps'],
} as const;

export function monthlyFortuneResponseFormat(): {
  type: 'json_schema';
  name: string;
  strict: true;
  schema: typeof MONTHLY_FORTUNE_JSON_SCHEMA;
} {
  return { type: 'json_schema', name: 'deokbun_monthly_fortune', strict: true, schema: MONTHLY_FORTUNE_JSON_SCHEMA };
}
