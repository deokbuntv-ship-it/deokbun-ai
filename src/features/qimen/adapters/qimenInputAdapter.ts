// Eligibility + input resolution (directive §22). 기문둔갑 runs ONLY for a timing/
// decision question that carries an explicit local question time. No current-clock
// fallback, no birth data.
import type { QimenQuery, QimenQueryTime } from '../domain/qimenTypes';

export type QimenEligibility =
  | { ok: true; queryTime: QimenQueryTime }
  | {
      ok: false;
      availability: 'not_applicable' | 'missing_question_time' | 'unsupported_case';
      reason: string;
    };

// Days in a Gregorian month — pure, deterministic (no Date object → no silent rollover). NOT a calendar
// engine; a minimal validity guard so an IMPOSSIBLE civil datetime (2024-02-30, 2023-02-29, 2024-04-31)
// can never reach the provider or become a trusted board (Codex PART A).
function daysInGregorianMonth(year: number, month: number): number {
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  return [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}

function isValidQueryTime(qt: QimenQueryTime): boolean {
  if (![qt.year, qt.month, qt.day, qt.hour].every((n) => Number.isInteger(n))) return false;
  if (qt.year <= 0 || qt.month < 1 || qt.month > 12) return false;
  if (qt.hour < 0 || qt.hour > 23) return false;
  // The DAY must exist in that real Gregorian month/year — 2024-02-30 must fail, never roll to 03-01.
  if (qt.day < 1 || qt.day > daysInGregorianMonth(qt.year, qt.month)) return false;
  return true;
}

export function resolveQimenEligibility(query: QimenQuery): QimenEligibility {
  if (!query.isTimingQuestion) {
    return { ok: false, availability: 'not_applicable', reason: 'NOT_A_TIMING_QUESTION' };
  }
  if (!query.questionTime) {
    return { ok: false, availability: 'missing_question_time', reason: 'QUESTION_TIME_REQUIRED' };
  }
  if (!isValidQueryTime(query.questionTime)) {
    return { ok: false, availability: 'unsupported_case', reason: 'QUESTION_TIME_INVALID' };
  }
  return { ok: true, queryTime: query.questionTime };
}
