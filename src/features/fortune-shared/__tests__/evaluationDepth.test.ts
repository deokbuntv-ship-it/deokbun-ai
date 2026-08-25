// Evaluation-depth sprint invariants (§31/§32/§34). Real engine for the plan-level guarantees + source-scan
// for the evidence render path (no RN render harness in this repo). Base day/month tier is IMMUTABLE — the
// 대운/세운 background only adds a synthesis state + evidence, never changes the tier.
import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

import type { BirthInfoDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { buildTodayFortuneEvidence, type TodayFortuneEvidence } from '@/features/today/engine/todayEvidence';
import { deriveDailyPlan } from '@/features/today/engine/todayPlan';
import { buildMonthlyFortuneEvidence, type MonthlyFortuneEvidence } from '@/features/monthly/engine/monthlyEvidence';
import { deriveMonthlyPlan } from '@/features/monthly/engine/monthlyPlan';

const digestProvider: DigestProvider = {
  async sha256Utf8(i: string) { return createHash('sha256').update(i, 'utf8').digest('hex'); },
};
const NOW = Math.floor(Date.UTC(2026, 5, 15) / 1000);
const birthInfo = {
  displayName: 't', gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1990', birthMonth: '5', birthDay: '15',
  birthTimeAccuracy: 'exact', birthHour: '10', birthMinute: '30',
  approximateTimePeriod: null, birthPlace: '서울',
} as unknown as BirthInfoDraft;

describe('today evaluation depth', () => {
  it('carries synthesis state + deterministic evidence; base tier is IMMUTABLE w.r.t. 대운/세운', async () => {
    const e = await buildTodayFortuneEvidence({ birthInfo, nowEpochSeconds: NOW }, { digestProvider });
    const withBg = deriveDailyPlan(e);
    // strip the temporal background → recompute; the base tier must NOT move (§6/§10/§45)
    const stripped = { ...(e as Extract<TodayFortuneEvidence, { available: true }>), temporal: undefined };
    const withoutBg = deriveDailyPlan(stripped);
    expect(withBg.overallTone).toBe(withoutBg.overallTone); // day tier immutable
    expect(withBg.backgroundState).toBeTruthy();
    expect(withBg.evidence && withBg.evidence.length).toBeGreaterThan(0);
    expect(JSON.stringify(withBg)).not.toMatch(/신강|신약|strengthVerdict|용신|격국/);
  });
});

describe('monthly evaluation depth', () => {
  it('carries synthesis state + deterministic evidence; base tier is IMMUTABLE w.r.t. 대운/세운', async () => {
    const e = await buildMonthlyFortuneEvidence({ birthInfo }, { digestProvider, nowEpochSeconds: NOW });
    const withBg = deriveMonthlyPlan(e);
    const stripped = { ...(e as Extract<MonthlyFortuneEvidence, { available: true }>), temporal: undefined };
    const withoutBg = deriveMonthlyPlan(stripped);
    expect(withBg.overallTier).toBe(withoutBg.overallTier); // month tier immutable
    expect(withBg.backgroundState).toBeTruthy();
    expect(withBg.evidence && withBg.evidence.length).toBeGreaterThan(0);
    expect(JSON.stringify(withBg)).not.toMatch(/신강|신약|strengthVerdict|용신|격국/);
  });
});

describe('evidence render path — "왜 이렇게 보나요?" is wired (§19/§34)', () => {
  const read = (rel: string) => fs.readFileSync(path.resolve(__dirname, '../../../../', rel), 'utf8');
  it('FortuneReading renders ReadingEvidence from the evidence prop', () => {
    const src = read('src/components/Reading/FortuneReading.tsx');
    expect(src).toMatch(/ReadingEvidence/);
    expect(src).toMatch(/p\.evidence && p\.evidence\.length > 0/);
  });
  it('today + monthly screens pass evidence into FortuneReading', () => {
    expect(read('src/app/today.tsx')).toMatch(/evidence=\{view\.evidence\}/);
    expect(read('src/app/monthly.tsx')).toMatch(/evidence=\{view\.evidence\}/);
  });
  it('today + monthly VMs map the result evidence lines', () => {
    expect(read('src/features/today/presentation/todayView.ts')).toMatch(/evidence:.*r\.evidence/);
    expect(read('src/features/monthly/presentation/monthlyView.ts')).toMatch(/evidence:.*r\.evidence/);
  });
});
