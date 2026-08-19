// OpenAI Structured-Outputs schema for the DAILY fortune (compact — §17). Same strict-mode discipline as the
// consultation schema (every property in `required`, `additionalProperties:false`, no length keywords — the
// server parser enforces the ≤3 highlights / ≤2 cautions caps). The model can only return parseable JSON in
// this exact shape; hygiene + caps run after parsing.
export const DAILY_FORTUNE_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    headline: { type: 'string' },
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
    consultationPrompts: { type: 'array', items: { type: 'string' } },
  },
  required: ['headline', 'overallSummary', 'highlights', 'cautions', 'actionTip', 'consultationPrompts'],
} as const;

export function dailyFortuneResponseFormat(): {
  type: 'json_schema';
  name: string;
  strict: true;
  schema: typeof DAILY_FORTUNE_JSON_SCHEMA;
} {
  return { type: 'json_schema', name: 'deokbun_today_fortune', strict: true, schema: DAILY_FORTUNE_JSON_SCHEMA };
}
