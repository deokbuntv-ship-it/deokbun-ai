// Deterministic MONTH-target resolution for consultation questions (Evidence-Decision Sprint §15/§16).
// PURE, bundled, tested. Turns a question's month expressions into the exact (Gregorian year, civil month)
// buckets the user referenced, and classifies the month INTENT, so the grounding layer can compute each
// requested month's 월운 from the FROZEN engine (calculateWolwoon, called — never modified — with the
// resolved targets) and legitimise month-level timing claims.
//
// SCOPE: this resolver emits CIVIL months (1..12). The civil-month → 사주 月 ordinal mapping (which depends
// on 節/立春 boundaries) is a downstream, already-frozen step (resolveSajuYearAndMonth); this file never
// does 역학 calendar math. The LLM is NEVER the authority on "내년 2월 = which (year,month)" — this is.
//
// SAFETY: it does not weaken any validator. It only NAMES the months the user asked about; whether each is
// actually groundable is decided later by the engine (fail-closed) and the validator. Out-of-range years
// are dropped; targets are capped to bound cost.

import { SUPPORTED_YEAR_MIN, SUPPORTED_YEAR_MAX } from './questionYears';

export type MonthIntent =
  | 'EXACT_MONTH' // "2027년 2월에 이사해도 돼?"     → ground that one month
  | 'COMPARE_MONTHS' // "2월이 나아 5월이 나아?"        → ground the named months, compare
  | 'MONTH_RANGE' // "2027년 상반기 중 언제?"          → ground the range's months
  | 'BEST_MONTH' // "2027년에 언제 이사가 좋아?"       → ground all 12 months, rank
  | 'NONE'; // no month signal (year-level or non-temporal)

export type MonthTarget = { year: number; month: number }; // Gregorian year, civil month 1..12
export type ResolvedMonths = { intent: MonthIntent; targets: MonthTarget[] };

export const MAX_MONTH_TARGETS = 12; // one year of monthly buckets — bounds cost (§34/§36)

const EMPTY: ResolvedMonths = { intent: 'NONE', targets: [] };

const inRange = (y: number): boolean => y >= SUPPORTED_YEAR_MIN && y <= SUPPORTED_YEAR_MAX;

// Normalize a (year, month) that may overflow (month 13 → next year Jan; 0 → prev year Dec).
function normalize(year: number, month: number): MonthTarget {
  const zero = month - 1 + year * 12;
  return { year: Math.floor(zero / 12), month: (((zero % 12) + 12) % 12) + 1 };
}

function dedupeClampCap(targets: MonthTarget[]): MonthTarget[] {
  const seen = new Set<string>();
  const out: MonthTarget[] = [];
  for (const t of targets) {
    if (!Number.isInteger(t.month) || t.month < 1 || t.month > 12 || !inRange(t.year)) continue;
    const key = `${t.year}-${t.month}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
    if (out.length >= MAX_MONTH_TARGETS) break;
  }
  return out.sort((a, b) => a.year - b.year || a.month - b.month);
}

// Resolve the year context a bare "N월" belongs to: an explicit year wins; else relative-definite
// (올해/내년/내후년); else the reference (server 세운) year.
function resolveYearContext(q: string, referenceYear: number | null): number | null {
  // Any explicit 4-digit "YYYY년" wins (even out of range — the target is then clamped away downstream,
  // so an out-of-range year is dropped rather than silently re-attributed to the reference year).
  const explicit = q.match(/(\d{4})\s*년/);
  if (explicit) return Number(explicit[1]);
  if (referenceYear === null) return null;
  if (/내후년/.test(q)) return referenceYear + 2;
  if (/내년|명년/.test(q)) return referenceYear + 1;
  if (/올해|금년|이번\s*해/.test(q)) return referenceYear;
  return referenceYear;
}

/**
 * Resolve the month targets + intent a question references. `referenceYear`/`referenceMonth` are the
 * server-derived current 세운 year + civil month (never the client clock, never the LLM). Returns NONE
 * when the question carries no resolvable month.
 */
export function resolveQuestionMonths(
  question: string,
  referenceYear: number | null,
  referenceMonth: number | null,
): ResolvedMonths {
  const q = (question ?? '').trim();
  if (q.length === 0) return EMPTY;

  const yearCtx = resolveYearContext(q, referenceYear);

  // (1) relative single month — 다음 달 / 다다음 달 / 이번 달, resolved from the reference (year, month).
  if (referenceYear !== null && referenceMonth !== null) {
    if (/(다다음\s*달|다다음달)/.test(q)) return { intent: 'EXACT_MONTH', targets: dedupeClampCap([normalize(referenceYear, referenceMonth + 2)]) };
    if (/(다음\s*달|담\s*달|다음달)/.test(q)) return { intent: 'EXACT_MONTH', targets: dedupeClampCap([normalize(referenceYear, referenceMonth + 1)]) };
    if (/(이번\s*달|이달|금월|이번달)/.test(q)) return { intent: 'EXACT_MONTH', targets: dedupeClampCap([{ year: referenceYear, month: referenceMonth }]) };
  }

  // Explicit "N월" occurrences (with an optional immediately-preceding year already folded into yearCtx).
  const monthNums = [...q.matchAll(/(\d{1,2})\s*월/g)].map((m) => Number(m[1])).filter((n) => n >= 1 && n <= 12);

  // (2) numeric month RANGE — "2~6월", "1월부터 6월까지".
  const rangeM = q.match(/(\d{1,2})\s*월?\s*(?:~|∼|-|–|—|부터)\s*(\d{1,2})\s*월(?:\s*까지)?/);
  if (yearCtx !== null && rangeM) {
    let a = Number(rangeM[1]);
    let b = Number(rangeM[2]);
    if (a >= 1 && a <= 12 && b >= 1 && b <= 12) {
      if (a > b) [a, b] = [b, a];
      const targets: MonthTarget[] = [];
      for (let m = a; m <= b; m++) targets.push({ year: yearCtx, month: m });
      return { intent: 'MONTH_RANGE', targets: dedupeClampCap(targets) };
    }
  }

  // (3) 상반기 / 하반기 ranges.
  if (yearCtx !== null && /상반기/.test(q)) {
    return { intent: 'MONTH_RANGE', targets: dedupeClampCap([1, 2, 3, 4, 5, 6].map((m) => ({ year: yearCtx, month: m }))) };
  }
  if (yearCtx !== null && /하반기/.test(q)) {
    return { intent: 'MONTH_RANGE', targets: dedupeClampCap([7, 8, 9, 10, 11, 12].map((m) => ({ year: yearCtx, month: m }))) };
  }

  // (4) COMPARE — two+ named months with a comparison cue ("2월이 나아 5월이 나아", "2월 vs 5월", "2월보다 5월").
  const compareCue = /나아|낫|더\s*좋|vs|대비|보다|중\s*(?:에서|엔)?\s*(?:뭐|어느|언제)/;
  if (yearCtx !== null && monthNums.length >= 2 && compareCue.test(q)) {
    return { intent: 'COMPARE_MONTHS', targets: dedupeClampCap(monthNums.map((m) => ({ year: yearCtx, month: m }))) };
  }

  // (5) BEST_MONTH — a "which month is best" ask with a year context but no single specific month.
  const bestCue = /(언제|몇\s*월|어느\s*달|가장\s*좋은\s*달|제일\s*좋은\s*달|좋은\s*달|좋은\s*시기)/;
  if (yearCtx !== null && bestCue.test(q) && monthNums.length === 0) {
    return { intent: 'BEST_MONTH', targets: dedupeClampCap(Array.from({ length: 12 }, (_, i) => ({ year: yearCtx, month: i + 1 }))) };
  }

  // (6) EXACT — one or more explicitly named months in a year context.
  if (yearCtx !== null && monthNums.length >= 1) {
    return {
      intent: monthNums.length >= 2 ? 'COMPARE_MONTHS' : 'EXACT_MONTH',
      targets: dedupeClampCap(monthNums.map((m) => ({ year: yearCtx, month: m }))),
    };
  }

  return EMPTY;
}
