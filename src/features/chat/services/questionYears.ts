// Deterministic temporal resolution for consultation questions (Temporal Grounding Sprint §4-§7).
// PURE, bundled, tested. Turns a question's time expressions into the EXACT Gregorian years the user
// referenced, so buildMyungriEvidence can compute each year's 세운 from the FROZEN engine (grounding the
// answer AND legitimising the timing anchors). The LLM is NEVER the authority on "앞으로 10년 = which
// years" — this resolver is (constitution §13/§18).
//
// Covers: explicit "YYYY년"; explicit RANGE ("2027~2030년", "2027년부터 2030년까지"); forward DURATION
// ("앞으로 N년", "향후 N년", "N년간"); relative-definite (올해/내년/내후년); numeric offset ("N년 뒤/후").
// The reference year (server 세운 year) IS included when the question references it (e.g. "올해" → [ref]).
//
// SAFETY: it does NOT weaken the validator. Every returned year is clamped to the frozen product domain
// [1970, 2050]; an out-of-range year is dropped (supported-portion-only, fail-closed) so a claim about an
// ungroundable year is still rejected downstream. Bounded to MAX_TARGET_YEARS to cap cost.

export const SUPPORTED_YEAR_MIN = 1970;
export const SUPPORTED_YEAR_MAX = 2050;
// Bound cost + prompt size. Covers "앞으로 10년" (10) and typical ranges; a longer request keeps only the
// first MAX supported years (grounded) — the rest stay ungrounded → any claim about them is rejected.
export const MAX_TARGET_YEARS = 12;

// Relative-definite year words → offset from the reference (current 세운) year.
const RELATIVE: readonly [RegExp, number][] = [
  [/내후년/, 2],
  [/내년|명년/, 1],
  [/올해|금년|이번\s*해/, 0],
];

function finalize(years: number[]): number[] {
  return [...new Set(years)]
    .filter((y) => Number.isFinite(y) && y >= SUPPORTED_YEAR_MIN && y <= SUPPORTED_YEAR_MAX)
    .sort((a, b) => a - b)
    .slice(0, MAX_TARGET_YEARS);
}

// Resolve every Gregorian year a question references (explicit + relative + range + duration), as a sorted,
// deduped, range-clamped, cost-bounded list. `referenceYear` is the server-derived current 세운 year;
// relative/duration terms are unresolved (skipped) when it is null.
export function resolveQuestionYears(question: string, referenceYear: number | null): number[] {
  const q = question ?? '';
  const years: number[] = [];

  // (1) explicit RANGE — "2027(년)?(부터|~|-|–)2030년(까지)?" → inclusive expansion.
  for (const m of q.matchAll(
    /((?:19|20|21)\d{2})\s*년?\s*(?:~|∼|-|–|—|부터)\s*((?:19|20|21)\d{2})\s*년?(?:\s*까지)?/g,
  )) {
    let a = Number(m[1]);
    let b = Number(m[2]);
    if (a > b) [a, b] = [b, a];
    if (b - a <= 200) for (let y = a; y <= b; y++) years.push(y); // guard against a pathological span
  }

  if (referenceYear !== null) {
    // (2) forward DURATION — "앞으로/향후/다가오는 N년", "N년간/N년 동안" → ref .. ref+N-1 (N buckets incl. ref).
    for (const m of q.matchAll(/(?:앞으로|향후|다가오는)\s*(\d{1,2})\s*년|(\d{1,2})\s*년\s*(?:간|동안)/g)) {
      const n = Number(m[1] ?? m[2]);
      if (n >= 1) for (let i = 0; i < n; i++) years.push(referenceYear + i);
    }
    // (3) numeric relative OFFSET — "N년 뒤/후" → a single point ref+N.
    for (const m of q.matchAll(/(\d{1,2})\s*년\s*(?:뒤|후|후에|뒤에)/g)) years.push(referenceYear + Number(m[1]));
    // (4) relative-definite — 올해/내년/내후년.
    for (const [re, off] of RELATIVE) if (re.test(q)) years.push(referenceYear + off);
  }

  // (5) explicit SINGLE years — "YYYY년".
  for (const m of q.matchAll(/((?:19|20|21)\d{2})\s*년/g)) years.push(Number(m[1]));

  return finalize(years);
}

// A deterministic epoch (seconds) safely INSIDE the saju year `year`: July 1, 03:00 UTC (≈ noon KST) —
// well past 立春 (~Feb 4) and well before the next year's — so calculateSewoonForInstant resolves the saju
// year to exactly `year`. Date.UTC is pure (no Date.now()/new Date()).
export function epochForSajuYear(year: number): number {
  return Math.floor(Date.UTC(year, 6, 1, 3, 0, 0) / 1000);
}

// A deterministic epoch (seconds) safely INSIDE the requested CIVIL month (day 15, 03:00 UTC ≈ noon KST):
// past that month's 節입 (~5th) and before the next, so resolveSajuYearAndMonth maps it to the 사주 month
// that civil (year, month) mostly belongs to (e.g. civil 2027-02 → 寅월 2027; civil 2027-01 → 丑월 2026).
// The caller labels the evidence with the CIVIL month the user asked; the 사주 ordinal stays internal. Pure.
export function epochForSajuMonth(year: number, month: number): number {
  return Math.floor(Date.UTC(year, month - 1, 15, 3, 0, 0) / 1000);
}
