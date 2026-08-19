// OpenAI Structured-Outputs schema for the DAILY fortune (compact — §15/§17). Same strict-mode discipline as
// the consultation schema (every property in `required`, `additionalProperties:false`, no length keywords —
// the server parser enforces the ≤3 highlights / ≤2 cautions / 3 follow-ups caps). The model returns ONLY
// prose in this exact shape; the server owns the tier/mode/domain statuses and attaches them after parsing.
export const DAILY_FORTUNE_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    // headline: a concrete one-liner about the day (never a poetic slogan, §9/§10).
    headline: { type: 'string' },
    // verdict: 1-2 sentences that directly answer "오늘은 어떤 날이고 뭘 우선하면 되나" (§16).
    verdict: { type: 'string' },
    overallSummary: { type: 'string' },
    highlights: {
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
    actionTip: { type: 'string' },
    // followUps: SHORT chip label + the RICH question actually carried into 상담 (§37).
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
  required: ['headline', 'verdict', 'overallSummary', 'highlights', 'cautions', 'actionTip', 'followUps'],
} as const;

export function dailyFortuneResponseFormat(): {
  type: 'json_schema';
  name: string;
  strict: true;
  schema: typeof DAILY_FORTUNE_JSON_SCHEMA;
} {
  return { type: 'json_schema', name: 'deokbun_today_fortune', strict: true, schema: DAILY_FORTUNE_JSON_SCHEMA };
}
