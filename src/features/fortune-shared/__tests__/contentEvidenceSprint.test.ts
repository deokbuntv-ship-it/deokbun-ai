// Consumer-interpretation + evidence-specificity sprint (§34/§35/§36/§39). Real engine for source-separated
// evidence; parse-level reject for service-checklist tone; source-scan for prompt guards. Base tier unchanged.
import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

import type { BirthInfoDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { buildTodayFortuneEvidence } from '@/features/today/engine/todayEvidence';
import { deriveDailyPlan } from '@/features/today/engine/todayPlan';
import { parseDailyFortune } from '@/features/today/server/buildTodayFortune';
import { buildMonthlyFortuneEvidence } from '@/features/monthly/engine/monthlyEvidence';
import { deriveMonthlyPlan } from '@/features/monthly/engine/monthlyPlan';

const digestProvider: DigestProvider = { async sha256Utf8(i: string) { return createHash('sha256').update(i, 'utf8').digest('hex'); } };
const NOW = Math.floor(Date.UTC(2026, 5, 15) / 1000);
const birthInfo = {
  displayName: 't', gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1990', birthMonth: '5', birthDay: '15',
  birthTimeAccuracy: 'exact', birthHour: '10', birthMinute: '30',
  approximateTimePeriod: null, birthPlace: '서울',
} as unknown as BirthInfoDraft;

const read = (rel: string) => fs.readFileSync(path.resolve(__dirname, '../../../../', rel), 'utf8');

describe('evidence specificity — source-separated (§18-20)', () => {
  it('today evidence separates 오늘 일진 / 현재 대운 / 올해 세운 / 종합', async () => {
    const e = await buildTodayFortuneEvidence({ birthInfo, nowEpochSeconds: NOW }, { digestProvider });
    const ev = deriveDailyPlan(e).evidence ?? [];
    expect(ev.some((l) => l.startsWith('오늘 일진에서는'))).toBe(true);
    expect(ev.some((l) => l.startsWith('현재 대운에서는'))).toBe(true);
    expect(ev.some((l) => l.startsWith('올해 세운은'))).toBe(true);
    expect(ev.some((l) => l.startsWith('종합하면'))).toBe(true);
    expect(ev.join(' ')).not.toMatch(/신강|신약|용신|격국|甲|寅/); // plain, no raw 간지/강약
  });
  it('monthly evidence separates 이번 달 월운 / 현재 대운 / 올해 세운 / 종합', async () => {
    const e = await buildMonthlyFortuneEvidence({ birthInfo }, { digestProvider, nowEpochSeconds: NOW });
    const ev = deriveMonthlyPlan(e).evidence ?? [];
    expect(ev.some((l) => l.startsWith('이번 달 월운에서는'))).toBe(true);
    expect(ev.some((l) => l.startsWith('현재 대운에서는'))).toBe(true);
    expect(ev.some((l) => l.startsWith('종합하면'))).toBe(true);
  });
});

describe('service-checklist tone is rejected at parse (§35)', () => {
  const base = {
    headline: '오늘은 차분하게', verdict: '오늘은 서두르지 않는 편이 좋습니다',
    overallSummary: '전반적으로 무난하게 흐르는 하루입니다. 중요한 하나에 집중해보세요.',
    highlights: [{ domain: '재물', title: '기회', body: '이미 정한 계획을 정돈하기 좋습니다' }],
    cautions: [{ title: '속도', body: '새로운 지출은 조금 신중하게 보세요' }],
    followUps: [{ displayLabel: '오늘 재물 흐름', question: '오늘 재물에서 중요한 건 무엇인가요' }],
  };
  it('rejects a service-checklist actionTip; accepts a life-direction one', async () => {
    const e = await buildTodayFortuneEvidence({ birthInfo, nowEpochSeconds: NOW }, { digestProvider });
    const plan = deriveDailyPlan(e);
    const bad = JSON.stringify({ ...base, actionTip: '최근 30일간 카드 내역과 영수증을 정리하세요' });
    const good = JSON.stringify({ ...base, actionTip: '오늘은 중요한 결정 하나만 차분히 마무리해보세요' });
    expect(parseDailyFortune(bad, plan)).toBeNull(); // service-checklist tone → reject
    expect(parseDailyFortune(good, plan)).not.toBeNull();
  });
});

describe('prompt guards present (§8/§9/§10)', () => {
  it('today + monthly prompts ban service-checklist tone + separate section roles', () => {
    for (const f of ['src/features/today/server/todayFortunePrompt.ts', 'src/features/monthly/server/monthlyFortunePrompt.ts']) {
      const src = read(f);
      expect(src).toMatch(/재무·행정·업무 체크리스트처럼 쓰지/);
      expect(src).toMatch(/영수증\/계좌·카드 내역/);
      expect(src).toMatch(/섹션 역할 분리/);
    }
  });
});
