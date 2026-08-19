import { createHash } from 'crypto';

import type { DigestProvider } from '@/features/interpretation';
import type { BirthInfoDraft } from '@/features/consultation';
import { buildTodayFortuneEvidence } from '@/features/today/engine/todayEvidence';

// Real digest provider (node crypto) — same pattern the consultation tests use. Runs the FROZEN engine.
const digestProvider: DigestProvider = {
  async sha256Utf8(s: string) {
    return createHash('sha256').update(s, 'utf8').digest('hex');
  },
};

const SELF: BirthInfoDraft = {
  displayName: '나',
  gender: 'male',
  calendarType: 'solar',
  lunarMonthType: null,
  birthYear: '1990',
  birthMonth: '6',
  birthDay: '15',
  birthTimeAccuracy: 'exact',
  birthHour: '9',
  birthMinute: '30',
  approximateTimePeriod: null,
  birthPlace: '서울',
};

const epoch = (utc: string) => Math.floor(Date.parse(utc) / 1000);
const NOON_KST_AUG19 = epoch('2026-08-19T03:00:00Z'); // 2026-08-19 12:00 KST
const NOON_KST_AUG20 = epoch('2026-08-20T03:00:00Z');

describe('buildTodayFortuneEvidence — real frozen chart + composed 일운', () => {
  it('produces a grounded, deterministic daily evidence for the SELF chart', async () => {
    const e = await buildTodayFortuneEvidence({ birthInfo: SELF, nowEpochSeconds: NOON_KST_AUG19 }, { digestProvider });
    expect(e.available).toBe(true);
    if (!e.available) throw new Error('unreachable');
    expect(e.fortuneDate).toBe('2026-08-19');
    expect(e.timezone).toBe('Asia/Seoul');
    // A real 일진 pillar (stem + branch present).
    expect(typeof e.dayLuck.pillar.stem).toBe('string');
    expect(typeof e.dayLuck.pillar.branch).toBe('string');
    // Ten-god relative to the natal day master resolved.
    expect(e.dayStemTenGod).toBeTruthy();
    expect(e.supportedDomains).toContain('overall');

    // Deterministic: same inputs → identical 일진.
    const again = await buildTodayFortuneEvidence({ birthInfo: SELF, nowEpochSeconds: NOON_KST_AUG19 }, { digestProvider });
    if (!again.available) throw new Error('unreachable');
    expect(again.dayLuck.pillar).toEqual(e.dayLuck.pillar);
  });

  it('the 일진 advances with the civil day (today ≠ tomorrow)', async () => {
    const a = await buildTodayFortuneEvidence({ birthInfo: SELF, nowEpochSeconds: NOON_KST_AUG19 }, { digestProvider });
    const b = await buildTodayFortuneEvidence({ birthInfo: SELF, nowEpochSeconds: NOON_KST_AUG20 }, { digestProvider });
    if (!a.available || !b.available) throw new Error('unreachable');
    expect(b.fortuneDate).toBe('2026-08-20');
    // Consecutive days are different sexagenary pillars.
    expect(b.dayLuck.pillar.index).not.toBe(a.dayLuck.pillar.index);
  });

  it('an invalid birth profile fails closed (no fabricated fortune)', async () => {
    const bad = await buildTodayFortuneEvidence(
      { birthInfo: { ...SELF, birthYear: '0000', birthMonth: '13', birthDay: '40' }, nowEpochSeconds: NOON_KST_AUG19 },
      { digestProvider },
    );
    expect(bad.available).toBe(false);
  });
});
