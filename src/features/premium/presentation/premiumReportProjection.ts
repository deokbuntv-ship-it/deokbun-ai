// Premium payload → the SAME view-model the existing `PremiumReportView` renderer already consumes.
//
// NO NEW RENDERER, NO NEW COMPONENT, NO NEW TOKEN. The editorial renderer in
// `src/features/chat/report/PremiumReportView.tsx` is payload-agnostic by construction (its own migration
// notes say the report pipeline "is already report-type-AGNOSTIC by payload"), so the only thing Premium
// needed was a projection into `{ eyebrow, title, dateLabel, summary, sections }`.
//
// READING ORDER — the consultation contract, applied to a report that answers no question:
//   결론        → hero summary (headline + 원국 요약)
//   쉬운 설명    → 타고난 결 sections
//   흐름        → 지금 지나는 흐름 (대운/세운)
//   앞으로      → 12개월, quarter by quarter
//   행동        → 이렇게 지내보세요
//   왜          → 왜 이렇게 보나요 (server-owned evidence)
//
// 12 MONTHS: rendered as FOUR list sections of three months, not twelve paragraphs and not one flat list of
// twelve. `ReportDetailSection` only has `paragraph` and `list`, and extending it would mean editing a
// renderer the shared-report path also uses. Quarter grouping needs neither: it gives four scannable
// headings so a reader can jump to "내년 봄" instead of scrolling a wall. It does NOT shorten the page —
// twelve lines are still twelve lines — the win is navigation, not length.
import type { ReportDetailSection } from '@/features/chat/report/reportPresentation';
import type { PremiumReportView } from '@/features/chat/report/reportPresentation';
import { formatReportDate } from '@/features/chat/report/reportPresentation';
import type { PremiumReportPayload } from '@/features/premium/types';

const MONTHS_PER_GROUP = 3;

const clean = (s: unknown): string => (typeof s === 'string' ? s.trim() : '');

/** "2026년 9월" — from the covered-month tuple, never from a Date object (deterministic + testable). */
const monthLabel = (m: { year: number; month: number }): string => `${m.year}년 ${m.month}월`;

/** "2026년 9~11월" / "2026년 12월~2027년 2월" — a heading a reader can aim at. */
function groupLabel(months: { year: number; month: number }[]): string {
  const first = months[0];
  const last = months[months.length - 1];
  if (!first || !last) return '앞으로';
  if (first.year === last.year) return `${first.year}년 ${first.month}~${last.month}월`;
  return `${first.year}년 ${first.month}월~${last.year}년 ${last.month}월`;
}

export function toPremiumProductView(payload: PremiumReportPayload): PremiumReportView {
  const r = payload.result;
  const sections: ReportDetailSection[] = [];

  // 쉬운 설명 — the themed reads over the natal picture.
  for (const s of r.sections ?? []) {
    const title = clean(s.title);
    const body = clean(s.body);
    if (title && body) sections.push({ kind: 'paragraph', title, body });
  }

  // 흐름 — present 대운/세운. Omitted entirely when the engine could not resolve it (§18: never "없음").
  const flow = clean(r.flowSummary);
  if (flow) sections.push({ kind: 'paragraph', title: '지금 지나는 흐름', body: flow });

  // 앞으로 — twelve months, three at a time, each line prefixed with its own month so a group heading is
  // navigation rather than the only place the date lives.
  const lines = (r.monthlyOutlook ?? []).map(clean);
  const covered = payload.coveredMonths ?? [];
  for (let i = 0; i < lines.length; i += MONTHS_PER_GROUP) {
    const slice = lines.slice(i, i + MONTHS_PER_GROUP);
    const months = covered.slice(i, i + MONTHS_PER_GROUP);
    const items = slice
      .map((line, j) => {
        if (!line) return '';
        const m = months[j];
        return m ? `${monthLabel(m)} — ${line}` : line;
      })
      .filter((v) => v.length > 0);
    if (items.length > 0) sections.push({ kind: 'list', title: groupLabel(months), items });
  }

  const actions = (r.actions ?? []).map(clean).filter((v) => v.length > 0);
  if (actions.length > 0) sections.push({ kind: 'list', title: '이렇게 지내보세요', items: actions });

  const evidence = (r.evidence ?? []).map(clean).filter((v) => v.length > 0);
  if (evidence.length > 0) sections.push({ kind: 'list', title: '왜 이렇게 보나요', items: evidence });

  const headline = clean(r.headline);
  const natal = clean(r.natalSummary);
  return {
    eyebrow: '프리미엄 리포트',
    // The masthead title is the headline; the 22-char report title lives on the list row instead.
    title: headline || '프리미엄 리포트',
    dateLabel: formatReportDate(payload.generatedAt),
    summary: natal,
    sections,
  };
}

/** The 22-char-ish list title. Same trimming rule the consultation composer uses. */
export function premiumReportTitle(payload: PremiumReportPayload): string {
  const h = clean(payload.result.headline);
  if (!h) return '프리미엄 리포트';
  const base = h.replace(/[?？.!。·\s]+$/u, '');
  return base.length <= 22 ? base : `${base.slice(0, 20).trim()}…`;
}
