// SHARED CORE grounding + prompt safety (§35/§36). Full deterministic path evidence → plan → prompt with NO
// LLM. Verifies the background 대운/세운 context reaches the prompt as GUARDED context, and that neither prompt
// enables 신강/신약 self-calculation (the remediation guard-rails stay in force in the consumer features too).
import { createHash } from 'crypto';

import type { BirthInfoDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { buildTodayFortuneEvidence } from '@/features/today/engine/todayEvidence';
import { deriveDailyPlan } from '@/features/today/engine/todayPlan';
import { buildTodayFortunePrompt } from '@/features/today/server/todayFortunePrompt';
import { buildMonthlyFortuneEvidence } from '@/features/monthly/engine/monthlyEvidence';
import { deriveMonthlyPlan } from '@/features/monthly/engine/monthlyPlan';
import { buildMonthlyFortunePrompt } from '@/features/monthly/server/monthlyFortunePrompt';

const digestProvider: DigestProvider = {
  async sha256Utf8(input: string): Promise<string> {
    return createHash('sha256').update(input, 'utf8').digest('hex');
  },
};
const NOW = Math.floor(Date.UTC(2026, 5, 15) / 1000);
const birthInfo = {
  displayName: '테스트', gender: 'female', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1988', birthMonth: '9', birthDay: '20',
  birthTimeAccuracy: 'exact', birthHour: '14', birthMinute: '0',
  approximateTimePeriod: null, birthPlace: '서울',
} as unknown as BirthInfoDraft;

const NO_STRENGTH = /신강|신약|용신|격국|엔진 판정 강약/;

describe('today: shared-core background reaches the prompt as guarded context', () => {
  it('plan carries background flow + element composition (SEPARATE from the day tier)', async () => {
    const e = await buildTodayFortuneEvidence({ birthInfo, nowEpochSeconds: NOW }, { digestProvider });
    const plan = deriveDailyPlan(e);
    expect(plan.backgroundFlow).toBeTruthy();
    expect(plan.elementComposition).toBeTruthy();
    // background is not the day tier
    expect(plan.overallTone).not.toEqual(plan.backgroundFlow);
  });

  it('prompt includes the guarded 큰 배경 흐름 block and forbids inventing 대운/세운', async () => {
    const e = await buildTodayFortuneEvidence({ birthInfo, nowEpochSeconds: NOW }, { digestProvider });
    const [system] = buildTodayFortunePrompt(deriveDailyPlan(e));
    expect(system.content).toContain('SECONDARY(배경)'); // PRIMARY=오늘 / SECONDARY=큰 흐름 framing
    expect(system.content).toMatch(/대운·세운을 새로 계산하거나/);
    // still bans strength self-judgment (never enables 신강/신약)
    expect(system.content).not.toMatch(/신강.*판단|신약.*판단|신강\/신약을 계산/);
    expect(system.content).toContain('간지·천간·지지·일간·십신');
  });
});

describe('monthly: shared-core background reaches the prompt as guarded context', () => {
  it('plan carries background flow; prompt frames the month within the larger flow (guarded)', async () => {
    const e = await buildMonthlyFortuneEvidence({ birthInfo }, { digestProvider, nowEpochSeconds: NOW });
    const plan = deriveMonthlyPlan(e);
    expect(plan.backgroundFlow).toBeTruthy();
    const [system] = buildMonthlyFortunePrompt(plan);
    expect(system.content).toContain('SECONDARY(배경)'); // PRIMARY=이번 달 / SECONDARY=큰 흐름 framing
    expect(system.content).toMatch(/대운·세운을 새로 계산하거나/);
  });
});

describe('neither prompt enables strength; both keep term bans', () => {
  it('today + monthly system prompts never instruct the model to assert 신강/신약/용신/격국', async () => {
    const te = await buildTodayFortuneEvidence({ birthInfo, nowEpochSeconds: NOW }, { digestProvider });
    const me = await buildMonthlyFortuneEvidence({ birthInfo }, { digestProvider, nowEpochSeconds: NOW });
    const tSys = buildTodayFortunePrompt(deriveDailyPlan(te))[0].content;
    const mSys = buildMonthlyFortunePrompt(deriveMonthlyPlan(me))[0].content;
    // the ONLY mentions of 신강/신약 etc. would be in a ban; here we assert they don't appear as an instruction
    // to produce them. (Both prompts describe strength nowhere — the background is 흐름 polarity only.)
    expect(tSys).not.toMatch(NO_STRENGTH);
    expect(mSys).not.toMatch(NO_STRENGTH);
  });
});
