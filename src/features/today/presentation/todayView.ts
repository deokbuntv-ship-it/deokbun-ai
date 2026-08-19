// Pure presentation adapters for 오늘의 운세 — the SAME stored record renders identically on Home preview,
// the /today detail, and the 운세우편함 card (§83: presentation may differ, facts must not). No engine or
// network here.
import { formatFortuneDateLabel } from '@/features/today/engine/fortuneDate';
import type { DailyFortuneRecord, DailyOverallTone } from '@/features/today/types';

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

export type TodayPreview = {
  fortuneDate: string;
  dot: string;
  weekday: string;
  overallTone: DailyOverallTone;
  toneVariant: ToneVariant;
  headline: string;
};

// The compact Home/mailbox card view — headline only, no LLM, no full body.
export function toTodayPreview(record: DailyFortuneRecord): TodayPreview {
  const { dot, weekday } = formatFortuneDateLabel(record.fortuneDate);
  return {
    fortuneDate: record.fortuneDate,
    dot,
    weekday,
    overallTone: record.overallTone,
    toneVariant: toneVariant(record.overallTone),
    headline: record.result.headline,
  };
}

export type TodayDetailView = TodayPreview & {
  overallSummary: string;
  highlights: { domain: string; title: string; body: string }[];
  cautions: { title: string; body: string }[];
  actionTip: string;
  consultationPrompts: string[];
};

export function toTodayDetailView(record: DailyFortuneRecord): TodayDetailView {
  return {
    ...toTodayPreview(record),
    overallSummary: record.result.overallSummary,
    highlights: record.result.highlights,
    cautions: record.result.cautions,
    actionTip: record.result.actionTip,
    consultationPrompts: record.result.consultationPrompts,
  };
}

// Whether a record is for "today" in Korea (the client guess is a read hint only — see fortuneDate).
export function isForFortuneDate(record: DailyFortuneRecord | null, fortuneDate: string): boolean {
  return !!record && record.fortuneDate === fortuneDate;
}
