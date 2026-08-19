// Pure presentation adapters for 오늘의 운세 — the SAME stored record renders identically on Home preview,
// the /today detail, and the 운세우편함 card (§83: presentation may differ, facts must not). No engine or
// network here. It ALSO normalizes V1.0 records (no verdict/mode/followUps, legacy consultationPrompts) into
// the V1.1 view shape (§77-§79) so historical daily fortunes keep rendering after the upgrade.
import { formatFortuneDateLabel } from '@/features/today/engine/fortuneDate';
import { TODAY_DOMAIN_SHORT_LABEL, type DailyFollowUp, type DailyFortuneRecord, type DailyOverallTone, type TodayDomain } from '@/features/today/types';

export type ToneVariant = 'positive' | 'neutral' | 'change' | 'caution';

export function toneVariant(tone: DailyOverallTone): ToneVariant {
  switch (tone) {
    case '좋은 흐름':
      return 'positive';
    case '무난한 흐름':
      return 'neutral';
    case '변화가 많은 날':
      return 'change';
    case '조심해서 움직일 날':
      return 'caution';
  }
}

export type StatusVariant = 'positive' | 'neutral' | 'caution';
export function statusVariant(status: string): StatusVariant {
  return status === '좋음' ? 'positive' : status === '주의' ? 'caution' : 'neutral';
}

export type DomainSignalView = { label: string; status: string; variant: StatusVariant };

function firstSentence(s: string): string {
  const m = /^[^.!?。\n]*[.!?。]?/.exec(s.trim());
  return (m ? m[0] : s).trim();
}

// Normalize follow-ups across schema versions: V1.1 {displayLabel, question}, or legacy string[] mapped to a
// short label + the same string as the question (§77).
function normalizeFollowUps(record: DailyFortuneRecord): DailyFollowUp[] {
  const r = record.result;
  if (r.followUps && r.followUps.length > 0) {
    return r.followUps
      .filter((f) => f.question.trim().length > 0)
      .map((f) => ({ displayLabel: (f.displayLabel || f.question).trim(), question: f.question.trim() }));
  }
  if (r.consultationPrompts && r.consultationPrompts.length > 0) {
    return r.consultationPrompts
      .filter((q) => q.trim().length > 0)
      .map((q) => {
        const base = q.trim().replace(/[?？.!。·\s]+$/u, '');
        return { displayLabel: base.length <= 20 ? base : `${base.slice(0, 18).trim()}…`, question: q.trim() };
      });
  }
  return [];
}

function toDomainSignalViews(record: DailyFortuneRecord): DomainSignalView[] {
  return (record.result.domainSignals ?? []).map((s) => ({
    label: TODAY_DOMAIN_SHORT_LABEL[s.domain as TodayDomain] ?? String(s.domain),
    status: s.status,
    variant: statusVariant(s.status),
  }));
}

export type TodayPreview = {
  fortuneDate: string;
  dot: string;
  weekday: string;
  overallTone: DailyOverallTone;
  toneVariant: ToneVariant;
  /** V1.1 action-mode label (e.g. "정리·조정"); undefined for V1.0 records. */
  primaryModeLabel?: string;
  headline: string;
};

// The compact Home/mailbox card view — headline + tone + mode, no LLM, no full body.
export function toTodayPreview(record: DailyFortuneRecord): TodayPreview {
  const { dot, weekday } = formatFortuneDateLabel(record.fortuneDate);
  return {
    fortuneDate: record.fortuneDate,
    dot,
    weekday,
    overallTone: record.overallTone,
    toneVariant: toneVariant(record.overallTone),
    primaryModeLabel: record.result.primaryModeLabel,
    headline: record.result.headline,
  };
}

export type TodayDetailView = TodayPreview & {
  /** The one-line day judgment (V1.0 records fall back to the first sentence of the summary). */
  verdict: string;
  overallSummary: string;
  domainSignals: DomainSignalView[];
  highlights: { domain: string; title: string; body: string }[];
  cautions: { title: string; body: string }[];
  actionTip: string;
  followUps: DailyFollowUp[];
};

export function toTodayDetailView(record: DailyFortuneRecord): TodayDetailView {
  const r = record.result;
  return {
    ...toTodayPreview(record),
    verdict: (r.verdict && r.verdict.trim()) || firstSentence(r.overallSummary),
    overallSummary: r.overallSummary,
    domainSignals: toDomainSignalViews(record),
    highlights: r.highlights,
    cautions: r.cautions,
    actionTip: r.actionTip,
    followUps: normalizeFollowUps(record),
  };
}

// Whether a record is for "today" in Korea (the client guess is a read hint only — see fortuneDate).
export function isForFortuneDate(record: DailyFortuneRecord | null, fortuneDate: string): boolean {
  return !!record && record.fortuneDate === fortuneDate;
}
