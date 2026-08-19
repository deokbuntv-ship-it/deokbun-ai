import {
  clientCurrentMonthGuess,
  currentTargetMonth,
  formatMonthLabel,
  monthKey,
  monthMidpointEpochSeconds,
  parseMonthKey,
} from '@/features/monthly/engine/monthDate';

const epoch = (iso: string) => Math.floor(Date.parse(iso) / 1000);

describe('monthDate — server-owned civil month, deterministic (§6/§7)', () => {
  it('currentTargetMonth reads the Korea civil (year, month) from a server epoch', () => {
    // 2026-08-19 12:00 KST = 2026-08-19 03:00 UTC.
    expect(currentTargetMonth(epoch('2026-08-19T03:00:00Z'))).toEqual({ year: 2026, month: 8 });
    // KST rolls the month before UTC: 2026-07-31 23:30 KST = 2026-07-31 14:30 UTC is still July...
    expect(currentTargetMonth(epoch('2026-07-31T14:30:00Z'))).toEqual({ year: 2026, month: 7 });
    // ...but 2026-08-01 00:30 KST = 2026-07-31 15:30 UTC is already August in Korea.
    expect(currentTargetMonth(epoch('2026-07-31T15:30:00Z'))).toEqual({ year: 2026, month: 8 });
  });

  it('monthMidpointEpochSeconds is the 15th at 12:00 KST (03:00 UTC) — inside the same civil month', () => {
    const mid = monthMidpointEpochSeconds({ year: 2026, month: 8 });
    expect(mid).toBe(epoch('2026-08-15T03:00:00Z'));
    // Round-trips to the same civil month (so the 節-resolver reads the dominant saju month of civil August).
    expect(currentTargetMonth(mid)).toEqual({ year: 2026, month: 8 });
  });

  it('label + key + parse', () => {
    expect(formatMonthLabel({ year: 2026, month: 8 })).toBe('2026년 8월');
    expect(monthKey({ year: 2026, month: 8 })).toBe('2026-08');
    expect(parseMonthKey('2026-08')).toEqual({ year: 2026, month: 8 });
    expect(parseMonthKey('2026-13')).toBeNull();
    expect(parseMonthKey('nope')).toBeNull();
  });

  it('clientCurrentMonthGuess mirrors currentTargetMonth for the same instant (cache-read hint only)', () => {
    const nowMs = Date.parse('2026-08-19T03:00:00Z');
    expect(clientCurrentMonthGuess(nowMs)).toEqual(currentTargetMonth(Math.floor(nowMs / 1000)));
  });
});
