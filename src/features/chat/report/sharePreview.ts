// 익명 미리보기 — pure shaping for the anonymous half of a shared report.
//
// Owner decision 2026-09-06: someone who taps a friend's link did not come looking for a
// compatibility report — they came because a friend sent something. A login wall before they
// know what it is loses them. Show the conclusion, then ask.
//
// This module is PURE (no React, no supabase) so the disclosure boundary is testable on its own.
// The boundary itself lives in the SERVER (`get_shared_report_preview`): everything below shapes
// what the server already decided to send. Nothing here hides anything — a field that must not
// reach an anonymous reader never arrives in the first place.

export type SharePreview = {
  conclusion: string;
  reportKind: 'compatibility' | 'consultation';
  lockedCounts: { findings: number; cautions: number; topics: number };
};

export type SharePreviewOutcome =
  | { status: 'ok'; preview: SharePreview }
  | { status: 'unavailable' };

const count = (v: unknown): number =>
  typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.floor(v) : 0;

/** Parse the RPC row. Anything unexpected is `unavailable` — never a half-rendered preview. */
export function parseSharePreview(data: unknown): SharePreviewOutcome {
  if (!data || typeof data !== 'object') return { status: 'unavailable' };
  const row = data as Record<string, unknown>;
  const conclusion = typeof row.conclusion === 'string' ? row.conclusion.trim() : '';
  if (conclusion.length === 0) return { status: 'unavailable' };
  const locked = (row.lockedCounts ?? {}) as Record<string, unknown>;
  return {
    status: 'ok',
    preview: {
      conclusion,
      reportKind: row.reportKind === 'compatibility' ? 'compatibility' : 'consultation',
      lockedCounts: {
        findings: count(locked.findings),
        cautions: count(locked.cautions),
        topics: count(locked.topics),
      },
    },
  };
}

/**
 * What is behind the wall, as a sentence — counts only, never content.
 *
 * The pull has to be specific to work ("더 있어요" persuades nobody) and must not be the product
 * ("금전 감각이 서로 보완됩니다" IS the product). A count is the honest middle: it proves there is
 * substance without handing any of it over. Returns null when there is nothing more, because
 * promising more than exists is the one thing a teaser must never do.
 */
export function lockedSummaryLine(p: SharePreview): string | null {
  const parts: string[] = [];
  if (p.lockedCounts.findings > 0) parts.push(`분야별 해석 ${p.lockedCounts.findings}가지`);
  if (p.lockedCounts.cautions > 0) parts.push(`주의할 점 ${p.lockedCounts.cautions}가지`);
  if (parts.length === 0) return null;
  return `${parts.join(' · ')}가 더 있어요.`;
}

/** Headline for the preview screen. Never a name — see the migration's redaction note. */
export function previewHeadline(kind: SharePreview['reportKind']): string {
  return kind === 'compatibility' ? '궁합 결과가 도착했어요' : '해석 결과가 도착했어요';
}
