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

function isValidQueryTime(qt: QimenQueryTime): boolean {
  return (
    Number.isInteger(qt.year) &&
    qt.year > 0 &&
    Number.isInteger(qt.month) &&
    qt.month >= 1 &&
    qt.month <= 12 &&
    Number.isInteger(qt.day) &&
    qt.day >= 1 &&
    qt.day <= 31 &&
    Number.isInteger(qt.hour) &&
    qt.hour >= 0 &&
    qt.hour <= 23
  );
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
