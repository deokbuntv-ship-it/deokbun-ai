import { birthMonthDay, isBirthdayOn, isBirthdayTodayKst, kstCivilDate } from '@/features/retention/birthday';

describe('birthday logic — deterministic, KST, Feb 29 defined (§7)', () => {
  it('matches on the same month/day', () => {
    expect(isBirthdayOn({ month: 6, day: 15 }, { year: 2026, month: 6, day: 15 })).toBe(true);
    expect(isBirthdayOn({ month: 6, day: 15 }, { year: 2026, month: 6, day: 16 })).toBe(false);
  });

  it('Feb 29 birthday is observed on Feb 28 in NON-leap years, on Feb 29 in leap years (§7.4)', () => {
    // 2027 is not a leap year → observe Feb 28.
    expect(isBirthdayOn({ month: 2, day: 29 }, { year: 2027, month: 2, day: 28 })).toBe(true);
    expect(isBirthdayOn({ month: 2, day: 29 }, { year: 2027, month: 2, day: 29 })).toBe(false); // no such date anyway
    // 2028 is a leap year → observe Feb 29, NOT Feb 28.
    expect(isBirthdayOn({ month: 2, day: 29 }, { year: 2028, month: 2, day: 29 })).toBe(true);
    expect(isBirthdayOn({ month: 2, day: 29 }, { year: 2028, month: 2, day: 28 })).toBe(false);
  });

  it('kstCivilDate uses the +9h Korea offset (server product timezone, §7.5)', () => {
    // 2026-06-14 23:30 UTC = 2026-06-15 08:30 KST → June 15 in Korea.
    expect(kstCivilDate(Date.parse('2026-06-14T23:30:00Z'))).toEqual({ year: 2026, month: 6, day: 15 });
    // 2026-06-15 14:00 UTC = 2026-06-15 23:00 KST → still June 15.
    expect(kstCivilDate(Date.parse('2026-06-15T14:00:00Z'))).toEqual({ year: 2026, month: 6, day: 15 });
    // isBirthdayTodayKst wires the two together.
    expect(isBirthdayTodayKst({ month: 6, day: 15 }, Date.parse('2026-06-14T23:30:00Z'))).toBe(true);
    expect(isBirthdayTodayKst({ month: 6, day: 15 }, Date.parse('2026-06-16T05:00:00Z'))).toBe(false);
  });

  it('birthMonthDay parses valid birth info and rejects malformed', () => {
    expect(birthMonthDay({ birthMonth: '6', birthDay: '15' })).toEqual({ month: 6, day: 15 });
    expect(birthMonthDay({ birthMonth: '13', birthDay: '15' })).toBeNull();
    expect(birthMonthDay({ birthMonth: 'x', birthDay: '1' })).toBeNull();
    expect(birthMonthDay(null)).toBeNull();
  });
});
