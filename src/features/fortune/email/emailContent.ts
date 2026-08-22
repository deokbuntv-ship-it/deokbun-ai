// Pure monthly-email renderer (Sprint J4 §4.3). CONSUMES the already-generated authoritative MonthlyFortuneRecord
// digest — NO astrology recompute, NO LLM. Produces a subject + plain-text body (a real provider template can wrap
// it). Carries the AI disclosure. Fully deterministic + unit-tested. Never includes birth data, evidence, or a
// prompt (the record already excludes those).
import type { MonthlyFortuneRecord } from '@/features/monthly/types';
import { AI_DISCLOSURE_TEXT } from '@/features/legal/aiDisclosure';

export type RenderedEmail = { subject: string; content: string };

/** Default subject for a monthly-fortune email (a campaign may override the leading label). */
export function defaultMonthlySubject(record: MonthlyFortuneRecord): string {
  return `[덕분이] ${record.month}월 운세가 도착했어요`;
}

export function renderMonthlyEmail(record: MonthlyFortuneRecord, subjectOverride?: string): RenderedEmail {
  const r = record.result;
  const lines: string[] = [];
  lines.push(`${record.year}년 ${record.month}월 운세`);
  lines.push('');
  if (r.headline) lines.push(r.headline);
  if (r.verdict) lines.push(r.verdict);
  if (r.overallSummary) { lines.push(''); lines.push(r.overallSummary); }

  if (r.opportunities?.length) {
    lines.push(''); lines.push('◎ 기회');
    for (const o of r.opportunities) lines.push(`- ${o.title}${o.body ? `: ${o.body}` : ''}`);
  }
  if (r.cautions?.length) {
    lines.push(''); lines.push('◎ 주의');
    for (const c of r.cautions) lines.push(`- ${c.title}${c.body ? `: ${c.body}` : ''}`);
  }
  if (r.actions?.length) {
    lines.push(''); lines.push('◎ 이렇게 보내세요');
    for (const a of r.actions) lines.push(`- ${a}`);
  }

  lines.push('');
  lines.push('앱에서 더 자세한 해석과 이어지는 질문을 확인할 수 있어요.');
  lines.push('');
  lines.push(`※ ${AI_DISCLOSURE_TEXT}`);
  lines.push('');
  lines.push('알림 수신을 원하지 않으시면 앱의 [MY → 알림 설정]에서 언제든 변경할 수 있어요.');

  return {
    subject: (subjectOverride && subjectOverride.trim()) || defaultMonthlySubject(record),
    content: lines.join('\n'),
  };
}
