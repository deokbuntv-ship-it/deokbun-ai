// Today final consumer-tone pass (§9). Productivity-coach / checklist constructs are rejected (Today-only);
// finance/admin + micro-task family stays rejected; normal fortune prose is NOT falsely rejected.
import { createHash } from 'crypto';

import type { BirthInfoDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { containsProductivityChecklistTone, containsServiceChecklistTone } from '../contentQuality';
import { buildTodayFortuneEvidence } from '@/features/today/engine/todayEvidence';
import { deriveDailyPlan } from '@/features/today/engine/todayPlan';
import { parseDailyFortune } from '@/features/today/server/buildTodayFortune';

describe('containsProductivityChecklistTone — Today productivity-coach constructs', () => {
  it('rejects the Device-QA productivity/checklist examples', () => {
    for (const bad of [
      '금전·약속 목록을 한 장에 적고',
      '우선순위 세 개만 남겨',
      '두 가지만 정하세요',
      '할 일 목록을 정리하세요',
      '책상이나 일정의 작은 정리',
      '일정표를 정리해보세요',
      '항목을 하나씩 체크하세요',
    ]) {
      expect(containsProductivityChecklistTone(bad)).toBe(true);
    }
  });
  it('does NOT falsely reject normal fortune prose', () => {
    for (const good of [
      '오늘은 흐름을 지켜보며 서두르지 않는 편이 좋습니다',
      '결정 전에 조건을 한 번 더 살피세요',
      '관계에서는 상대의 반응을 보며 한 템포 늦춰 판단해보세요',
      '중요한 하나를 차분하게 마무리해보세요',
      '이미 정한 계획을 정돈하는 쪽이 편합니다',
      '두 가지 흐름을 함께 살펴보면 좋습니다',
    ]) {
      expect(containsProductivityChecklistTone(good)).toBe(false);
    }
  });
  it('finance/admin + micro-task family stays rejected (regression)', () => {
    for (const bad of ['최근 30일간 지출을 정리', '청구서부터 확인', '10분 동안 분류']) {
      expect(containsServiceChecklistTone(bad)).toBe(true);
    }
  });
});

describe('Today parser rejects productivity-coach output (§9)', () => {
  const digestProvider: DigestProvider = { async sha256Utf8(i: string) { return createHash('sha256').update(i, 'utf8').digest('hex'); } };
  const NOW = Math.floor(Date.UTC(2026, 5, 15) / 1000);
  const birthInfo = {
    displayName: 't', gender: 'male', calendarType: 'solar', lunarMonthType: null,
    birthYear: '1990', birthMonth: '5', birthDay: '15',
    birthTimeAccuracy: 'exact', birthHour: '10', birthMinute: '30',
    approximateTimePeriod: null, birthPlace: '서울',
  } as unknown as BirthInfoDraft;
  const base = {
    headline: '오늘은 차분하게', verdict: '오늘은 서두르지 않는 편이 좋습니다',
    overallSummary: '전반적으로 무난하게 흐르는 하루입니다. 흐름을 지켜보며 움직여보세요.',
    highlights: [{ domain: '관계', title: '기회', body: '먼저 마음을 표현해볼 만합니다' }],
    cautions: [{ title: '속도', body: '중요한 결정은 조건을 살핀 뒤 움직이세요' }],
    followUps: [{ displayLabel: '오늘 관계 흐름', question: '오늘 관계에서 어떻게 움직이면 좋을까요' }],
  };
  it('rejects a productivity-coach actionTip; accepts a fortune-direction one', async () => {
    const e = await buildTodayFortuneEvidence({ birthInfo, nowEpochSeconds: NOW }, { digestProvider });
    const plan = deriveDailyPlan(e);
    const bad = JSON.stringify({ ...base, actionTip: '금전·약속 목록을 한 장에 적고 우선순위 세 개만 남기세요' });
    const good = JSON.stringify({ ...base, actionTip: '결정을 서두르기보다 조건을 충분히 살핀 뒤 움직이세요' });
    expect(parseDailyFortune(bad, plan)).toBeNull();
    expect(parseDailyFortune(good, plan)).not.toBeNull();
  });
});
