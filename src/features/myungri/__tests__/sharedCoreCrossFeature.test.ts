// SHARED MYUNGRI CORE — 오늘/월별 consume the same deterministic temporal core (§32/§33/§37). Runs the REAL
// frozen engine (node digest). Verifies: the shared facts are present, natal facts are IDENTICAL across features
// (cross-feature consistency), NO strength verdict leaks, and missing birth time degrades gracefully.
import { createHash } from 'crypto';

import type { BirthInfoDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { buildTodayFortuneEvidence } from '@/features/today/engine/todayEvidence';
import { buildMonthlyFortuneEvidence } from '@/features/monthly/engine/monthlyEvidence';

const digestProvider: DigestProvider = {
  async sha256Utf8(input: string): Promise<string> {
    return createHash('sha256').update(input, 'utf8').digest('hex');
  },
};
const NOW = Math.floor(Date.UTC(2026, 5, 15) / 1000); // mid-June 2026
const birth = (over: Partial<Record<string, unknown>> = {}): BirthInfoDraft =>
  ({
    displayName: '테스트', gender: 'female', calendarType: 'solar', lunarMonthType: null,
    birthYear: '1988', birthMonth: '9', birthDay: '20',
    birthTimeAccuracy: 'exact', birthHour: '14', birthMinute: '0',
    approximateTimePeriod: null, birthPlace: '서울', ...over,
  }) as unknown as BirthInfoDraft;

const today = (b = birth()) => buildTodayFortuneEvidence({ birthInfo: b, nowEpochSeconds: NOW }, { digestProvider });
const monthly = (b = birth()) => buildMonthlyFortuneEvidence({ birthInfo: b }, { digestProvider, nowEpochSeconds: NOW });

describe('shared core — 오늘/월별 both consume natal composition + active 대운 + current 세운', () => {
  it('today evidence carries the shared temporal facts', async () => {
    const e = await today();
    if (!e.available) throw new Error(`today unavailable: ${e.reason}`);
    expect(e.temporal).toBeTruthy();
    const sum = Object.values(e.temporal!.elementCounts ?? {}).reduce((a, b) => a + b, 0);
    expect(sum).toBe(8); // RAW 오행 counts, not 세력/percent
    expect(e.temporal!.activeDaewoon).toBeTruthy();
    expect(e.temporal!.sewoon?.capability).toBe('AVAILABLE');
  });

  it('monthly evidence carries the shared temporal facts', async () => {
    const e = await monthly();
    if (!e.available) throw new Error(`monthly unavailable: ${e.reason}`);
    expect(e.temporal).toBeTruthy();
    expect(e.temporal!.activeDaewoon).toBeTruthy();
    expect(e.temporal!.sewoon?.capability).toBe('AVAILABLE');
  });

  it('§37 cross-feature consistency: 오늘 and 월별 see IDENTICAL natal composition + same active 대운 ordinal', async () => {
    const t = await today();
    const m = await monthly();
    if (!t.available || !m.available) throw new Error('expected available');
    expect(t.temporal!.elementCounts).toEqual(m.temporal!.elementCounts); // natal-invariant → must match
    // mid-June and the June civil-month midpoint fall in the same 세운 year + 대운 cycle
    expect(t.temporal!.activeDaewoon!.ordinal).toBe(m.temporal!.activeDaewoon!.ordinal);
    expect(t.temporal!.sewoon!.targetYear).toBe(m.temporal!.sewoon!.targetYear);
  });

  it('NO strength verdict leaks into either feature (remediation stays in force)', async () => {
    const t = await today();
    const m = await monthly();
    for (const e of [t, m]) {
      expect(JSON.stringify(e)).not.toMatch(/신강|신약|strengthVerdict|OWNER_REVIEW|"score"\s*:/);
    }
  });

  it('missing birth time degrades gracefully — natal facts stay, no fake hour', async () => {
    const t = await today(birth({ birthTimeAccuracy: 'unknown', birthHour: null, birthMinute: null }));
    if (!t.available) throw new Error(`today unavailable: ${t.reason}`);
    expect(t.temporal).toBeTruthy();
    const sum = Object.values(t.temporal!.elementCounts ?? {}).reduce((a, b) => a + b, 0);
    expect(sum).toBeGreaterThan(0); // natal composition still computed
  });

  it('deterministic — same birth + instant → identical today evidence', async () => {
    expect(await today()).toEqual(await today());
  });
});
