// Deterministic extraction of the SPECIFIC target years a consultation question asks about
// (Commercial Quality Sprint §2 — TIMING_CLAIM_MISMATCH root-cause fix). PURE, bundled, tested.
//
// ROOT CAUSE it addresses: 세운 (yearly-luck) grounding was computed ONLY for the CURRENT year,
// so "2027년 사업운" / "내년" produced an answer whose year the timing validator then rejected as
// unsupported (TIMING_CLAIM_MISMATCH → SEMANTIC_REJECTED). This resolves the year(s) the user
// actually referenced so buildMyungriEvidence can compute their 세운 from the FROZEN engine —
// which BOTH grounds the answer (real 세운 facts for that year) AND legitimises the timing anchor.
//
// It does NOT weaken the validator: a year we cannot actually ground (out of the engine's
// supported range) is simply never added, so a fabricated/unsupported future year is still rejected.

export const SUPPORTED_YEAR_MIN = 1970;
export const SUPPORTED_YEAR_MAX = 2050;
// Bound cost + prompt size: at most a few extra frozen 세운 computations per question.
export const MAX_TARGET_YEARS = 3;

// Relative-definite year words → offset from the current 사주 year.
const RELATIVE: readonly [RegExp, number][] = [
  [/내후년/, 2],
  [/내년|명년/, 1],
  [/올해|금년|이번\s*해/, 0],
];

// Resolve the explicit + relative-definite years a question references, as absolute Gregorian
// years, bounded to the supported range and excluding the current year (already grounded).
export function resolveQuestionYears(question: string, currentSajuYear: number | null): number[] {
  const q = question ?? '';
  const out = new Set<number>();

  // explicit "YYYY년"
  for (const m of q.matchAll(/((?:19|20|21)\d{2})\s*년/g)) out.add(Number(m[1]));

  // relative terms need a reference year to resolve
  if (currentSajuYear !== null) {
    for (const [re, off] of RELATIVE) if (re.test(q)) out.add(currentSajuYear + off);
    // numeric relative offset "N년 뒤/후"
    for (const m of q.matchAll(/(\d{1,2})\s*년\s*(?:뒤|후|후에|뒤에)/g)) out.add(currentSajuYear + Number(m[1]));
  }

  return [...out]
    .filter(
      (y) =>
        Number.isFinite(y) &&
        y >= SUPPORTED_YEAR_MIN &&
        y <= SUPPORTED_YEAR_MAX &&
        y !== currentSajuYear,
    )
    .sort((a, b) => a - b)
    .slice(0, MAX_TARGET_YEARS);
}

// A deterministic epoch (seconds) safely INSIDE the saju year `year`: July 1, 03:00 UTC (≈ noon
// KST) — well past 立春 (~Feb 4) and well before the next year's — so calculateSewoonForInstant
// resolves the saju year to exactly `year`. Date.UTC is pure (no Date.now()/new Date()).
export function epochForSajuYear(year: number): number {
  return Math.floor(Date.UTC(year, 6, 1, 3, 0, 0) / 1000);
}
