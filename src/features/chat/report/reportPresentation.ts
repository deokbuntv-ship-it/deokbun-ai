// Consultation report PRESENTATION (Commercial UX V4 §14/§17/§18/§19/§28). Pure + deterministic:
// maps a stored ConsultationReport into the consumer list-item and detail view models. It NEVER
// fabricates a section — a field with no content is omitted (§18: no "없음"/"미사용"/"not applicable").
// Internal terminology was already stripped by the composer (stripEngineLabels); this layer adds no
// engine/debug language. No Date.now(): the display date comes from the report's own generatedAt so the
// output is testable and stable.

import type { ConsultationReport } from '@/features/chat/report/reportService';

export type ReportDetailSection =
  | { kind: 'paragraph'; title: string; body: string }
  | { kind: 'list'; title: string; items: string[] };

export type ReportDetailView = {
  title: string;
  dateLabel: string; // "2026.08.18" — the last generation date
  sections: ReportDetailSection[]; // only non-empty sections, in reading order
};

export type ReportListItemView = {
  id: string;
  title: string;
  dateLabel: string;
  preview: string; // one short line; empty string when there is nothing to preview
};

// ISO → "YYYY.MM.DD" without Date()/locale/timezone drift (deterministic). Falls back to '' on a
// malformed value so the UI can hide the date rather than render "Invalid Date".
export function formatReportDate(iso: string | null | undefined): string {
  if (typeof iso !== 'string') return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso.trim());
  return m ? `${m[1]}.${m[2]}.${m[3]}` : '';
}

const PREVIEW_MAX = 60;

function firstLine(...candidates: (string | undefined)[]): string {
  for (const c of candidates) {
    const t = (c ?? '').replace(/\s+/g, ' ').trim();
    if (t) return t.length > PREVIEW_MAX ? `${t.slice(0, PREVIEW_MAX).trim()}…` : t;
  }
  return '';
}

// The display date: the report payload's generation timestamp (refreshed on every regenerate, §28),
// falling back to the row's updatedAt/createdAt if a legacy payload lacks it.
function reportDate(report: ConsultationReport): string {
  return (
    formatReportDate(report.payload?.generatedAt) ||
    formatReportDate(report.updatedAt) ||
    formatReportDate(report.createdAt)
  );
}

export function toReportListItem(report: ConsultationReport): ReportListItemView {
  const p = report.payload ?? ({} as ConsultationReport['payload']);
  return {
    id: report.id,
    title: (report.title ?? '').trim() || '상담 보고서',
    dateLabel: reportDate(report),
    preview: firstLine(p.summary, p.keyFindings?.[0]),
  };
}

export function toReportDetailView(report: ConsultationReport): ReportDetailView {
  const p = report.payload ?? ({} as ConsultationReport['payload']);
  const sections: ReportDetailSection[] = [];

  const summary = (p.summary ?? '').trim();
  if (summary) sections.push({ kind: 'paragraph', title: '한눈에 보는 요약', body: summary });

  const push = (title: string, items: string[] | undefined) => {
    const clean = (items ?? []).map((s) => (s ?? '').trim()).filter(Boolean);
    if (clean.length > 0) sections.push({ kind: 'list', title, items: clean });
  };
  push('핵심 포인트', p.keyFindings);
  push('주의할 점', p.cautions);
  push('상담에서 다룬 주요 질문', p.coveredTopics);

  return {
    title: (report.title ?? '').trim() || '상담 보고서',
    dateLabel: reportDate(report),
    sections,
  };
}
