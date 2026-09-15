// PRODUCT-LEVEL temporal synthesis for 오늘의 운세 · 이번 달 운세 (NOT a myungri theory result, §9).
//
// Combines the ALREADY-derived categorical polarity tiers (day/month base + 대운/세운 background) into a
// consumer-explanation state. It NEVER changes the base tier (§6/§7/§10) — 대운/세운 only modulate how the
// base conclusion is framed. No numbers, no scoring, no new 명리 rule — a pure categorical combination of
// existing `derivePolarity` outputs. Shared by both features (non-frozen; the polarity kernel stays untouched).
import type { PolarityTier } from '@/features/polarity/polarityKernel';

/** How the larger 대운/세운 flow relates to the base day/month conclusion (§9). */
export type BackgroundSynthesisState = 'REINFORCED' | 'BUFFERED' | 'MIXED' | 'NEUTRAL';

type Direction = 'SUPPORTIVE' | 'STRAINED';
const directionOf = (t: PolarityTier): Direction => (t === 'FAVORABLE' || t === 'STEADY' ? 'SUPPORTIVE' : 'STRAINED');

/** Aggregate 대운+세운 into one background direction; conflicting or absent → null (no clear modulation). */
function backgroundDirection(tiers: readonly (PolarityTier | null)[]): Direction | null {
  const dirs = tiers.filter((t): t is PolarityTier => !!t).map(directionOf);
  if (dirs.length === 0) return null;
  const supportive = dirs.filter((d) => d === 'SUPPORTIVE').length;
  const strained = dirs.filter((d) => d === 'STRAINED').length;
  if (supportive > 0 && strained > 0) return null; // 대운/세운 point opposite ways → no clear background
  return supportive > 0 ? 'SUPPORTIVE' : 'STRAINED';
}

export type TemporalSynthesis = {
  state: BackgroundSynthesisState;
  /** Plain-language, consumer-facing background note (empty for NEUTRAL). No 간지/십신/강약 terms. */
  summary: string;
};

/**
 * Synthesize the base tier with the 대운/세운 background — categorical only. The base tier is the PRIMARY
 * conclusion and is never overridden here; this describes how the larger flow frames it.
 */
export function synthesizeBackground(
  baseTier: PolarityTier,
  backgroundTiers: readonly (PolarityTier | null)[],
): TemporalSynthesis {
  const baseDir = directionOf(baseTier);
  const bgDir = backgroundDirection(backgroundTiers);

  if (bgDir === null) {
    return { state: 'NEUTRAL', summary: '' };
  }
  if (baseDir === bgDir) {
    return baseDir === 'SUPPORTIVE'
      ? { state: 'REINFORCED', summary: '지금의 좋은 흐름이 큰 흐름과도 자연스럽게 맞물리는 시기예요.' }
      : { state: 'REINFORCED', summary: '지금은 큰 흐름에서도 한 번 더 확인하고 속도를 조절하는 편이 좋은 시기예요.' };
  }
  if (baseDir === 'STRAINED' && bgDir === 'SUPPORTIVE') {
    return { state: 'BUFFERED', summary: '잠깐 조심할 부분은 있지만, 큰 흐름까지 불안한 것은 아니에요.' };
  }
  // baseDir SUPPORTIVE, bgDir STRAINED
  return { state: 'MIXED', summary: '기회는 살릴 수 있지만, 큰 흐름을 보면 무리하게 밀어붙이지 않는 편이 좋아요.' };
}
