// Cache seam (directive §24). A qimen board is DETERMINISTIC for a given question
// time (to the hour), so identical timing questions need not recompute. Light,
// in-memory, bounded — NOT DB/cache infra. The pure computeQimenBoard is untouched.
import { computeQimenBoard } from './qimenService';
import type { QimenQuery, QimenResult } from '../domain/qimenTypes';

const MAX_ENTRIES = 200;
const cache = new Map<string, QimenResult>();

function cacheKey(q: QimenQuery): string {
  if (!q.isTimingQuestion) return 'not_timing';
  const t = q.questionTime;
  if (!t) return 'no_time';
  return `${t.year}-${t.month}-${t.day}-${t.hour}`;
}

export function computeQimenBoardMemoized(query: QimenQuery): QimenResult {
  const key = cacheKey(query);
  const hit = cache.get(key);
  if (hit) return hit;

  const result = computeQimenBoard(query);
  if (cache.size >= MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, result);
  return result;
}

export function clearQimenCache(): void {
  cache.clear();
}
