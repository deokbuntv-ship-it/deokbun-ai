import { trackProductEvent } from '@/services/productEvents';

import type { PopularQuestionCategory } from './types';

// The popular-question conversion funnel, emitted through the generic product-events allowlist. The ONLY
// dimensions that ever leave the device are the stable analytics key, the category, the placement, and the
// list position — the raw question text, subject, birth, and answer are NEVER passed (and would be dropped by
// the allowlist even if they were). Every call is non-blocking (trackProductEvent swallows failure).

export type PopularQuestionPlacement = 'home';

type FunnelArgs = {
  questionKey: string;
  category?: PopularQuestionCategory | null;
  placement: PopularQuestionPlacement;
  position?: number; // 1-based rank in the shown list
};

function props(args: FunnelArgs): Record<string, string | number> {
  const out: Record<string, string | number> = {
    question_key: args.questionKey,
    placement: args.placement,
  };
  if (args.category) out.question_category = args.category;
  if (typeof args.position === 'number' && Number.isFinite(args.position)) out.position = args.position;
  return out;
}

/** One impression per question per Home view (the caller dedupes — this is NOT per render). */
export function trackPopularQuestionImpression(args: FunnelArgs): void {
  void trackProductEvent('popular_question_impression', { surface: args.placement, properties: props(args) });
}

/** One tap = one click. */
export function trackPopularQuestionClick(args: FunnelArgs): void {
  void trackProductEvent('popular_question_click', { surface: args.placement, properties: props(args) });
}

/** The consultation entered the send lifecycle (first submit) — strictly after, and distinct from, a click. */
export function trackPopularQuestionConsultationStart(args: Omit<FunnelArgs, 'position'>): void {
  void trackProductEvent('popular_question_consultation_start', {
    surface: args.placement,
    properties: props(args),
  });
}

/** The FIRST successful answer of a consultation that started from a popular question. */
export function trackPopularQuestionFirstAnswerSuccess(args: Omit<FunnelArgs, 'position'>): void {
  void trackProductEvent('popular_question_first_answer_success', {
    surface: args.placement,
    properties: props(args),
  });
}
