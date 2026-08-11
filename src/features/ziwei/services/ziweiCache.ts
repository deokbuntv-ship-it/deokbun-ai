// Cache seam (directive §24). A natal 자미두수 chart is DETERMINISTIC for a given
// (birth date, time, gender), so recomputing it on every question is wasteful.
// This is an intentionally LIGHT, in-memory, bounded memoize — NOT DB/cache infra.
// The pure `computeZiweiChart` is left untouched; callers opt into memoization.
import { computeZiweiChart } from './ziweiService';
import type { ZiweiBirthInput } from '../adapters/ziweiInputAdapter';
import type { ZiweiResult } from '../domain/ziweiTypes';

const MAX_ENTRIES = 200; // bounded — natal charts per session are few
const cache = new Map<string, ZiweiResult>();

// Key from the fields that determine the chart. Non-`exact` times collapse to a
// single key (they all resolve to missing_birth_time anyway).
function cacheKey(b: ZiweiBirthInput): string {
  const time = b.birthTimeAccuracy === 'exact' ? `h${b.birthHour}` : `acc:${b.birthTimeAccuracy}`;
  return `${b.gender}|${b.birthYear}-${b.birthMonth}-${b.birthDay}|${time}`;
}

export function computeZiweiChartMemoized(birth: ZiweiBirthInput): ZiweiResult {
  const key = cacheKey(birth);
  const hit = cache.get(key);
  if (hit) return hit;

  const result = computeZiweiChart(birth);
  // FIFO eviction to keep the map bounded (no unbounded growth).
  if (cache.size >= MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, result);
  return result;
}

// For tests / long-lived processes that want to reset the memo.
export function clearZiweiCache(): void {
  cache.clear();
}
