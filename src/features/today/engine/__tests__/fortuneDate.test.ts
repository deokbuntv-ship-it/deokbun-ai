import {
  clientTodayFortuneDateGuess,
  epochToKstCivilDate,
  formatFortuneDateLabel,
  fortuneDateStringFromEpoch,
} from '@/features/today/engine/fortuneDate';

// A fixed UTC instant → its KST civil date. 2026-08-19 03:00 UTC = 12:00 KST on 2026-08-19.
const epoch = (utc: string) => Math.floor(Date.parse(utc) / 1000);

describe('fortuneDate — server-owned, KST civil date (§6/§7)', () => {
  it('noon KST maps to that civil date', () => {
    expect(fortuneDateStringFromEpoch(epoch('2026-08-19T03:00:00Z'))).toBe('2026-08-19');
    expect(epochToKstCivilDate(epoch('2026-08-19T03:00:00Z'))).toEqual({ year: 2026, month: 8, day: 19 });
  });

  it('the KST civil-midnight boundary rolls the date (23:59 vs 00:01 KST)', () => {
    // 2026-08-19 14:59 UTC = 23:59 KST 2026-08-19 (still the 19th)
    expect(fortuneDateStringFromEpoch(epoch('2026-08-19T14:59:00Z'))).toBe('2026-08-19');
    // 2026-08-19 15:01 UTC = 00:01 KST 2026-08-20 (now the 20th)
    expect(fortuneDateStringFromEpoch(epoch('2026-08-19T15:01:00Z'))).toBe('2026-08-20');
  });

  it('a late-UTC-evening instant is already "tomorrow" in Korea', () => {
    // 2026-12-31 20:00 UTC = 2027-01-01 05:00 KST
    expect(fortuneDateStringFromEpoch(epoch('2026-12-31T20:00:00Z'))).toBe('2027-01-01');
  });

  it('the client guess uses the same KST rule (read hint only)', () => {
    expect(clientTodayFortuneDateGuess(Date.parse('2026-08-19T03:00:00Z'))).toBe('2026-08-19');
  });

  it('label renders dot date + Korean weekday', () => {
    expect(formatFortuneDateLabel('2026-08-19')).toEqual({ dot: '2026.08.19', weekday: '수' });
    expect(formatFortuneDateLabel('nonsense')).toEqual({ dot: 'nonsense', weekday: '' });
  });
});
