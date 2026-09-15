// OpenAI Structured-Outputs schema for the Premium Report. Same strict-mode discipline as the
// consultation / today / monthly schemas: every property in `required`, `additionalProperties: false`, and no
// length keywords — the server parser owns the caps. The model returns ONLY prose in this shape; `evidence` is
// NOT here because the server writes those lines itself.
export const PREMIUM_REPORT_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    headline: { type: 'string' },
    natalSummary: { type: 'string' },
    flowSummary: { type: 'string' },
    sections: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: { title: { type: 'string' }, body: { type: 'string' } },
        required: ['title', 'body'],
      },
    },
    // One line per covered month, in the order given. The server checks the count against its own window.
    monthlyOutlook: { type: 'array', items: { type: 'string' } },
    actions: { type: 'array', items: { type: 'string' } },
  },
  required: ['headline', 'natalSummary', 'flowSummary', 'sections', 'monthlyOutlook', 'actions'],
} as const;

export function premiumReportResponseFormat(): {
  type: 'json_schema';
  name: string;
  strict: true;
  schema: typeof PREMIUM_REPORT_JSON_SCHEMA;
} {
  return { type: 'json_schema', name: 'deokbun_premium_report', strict: true, schema: PREMIUM_REPORT_JSON_SCHEMA };
}
