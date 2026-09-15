import { isForFortuneDate, toneVariant, toTodayDetailView, toTodayPreview } from '@/features/today/presentation/todayView';
import type { DailyFortuneRecord } from '@/features/today/types';

// A V1.1 record — verdict + mode + domain signals + short/rich follow-ups.
const rec: DailyFortuneRecord = {
  id: 'r1',
  fortuneDate: '2026-08-19',
  timezone: 'Asia/Seoul',
  overallTone: '좋은 흐름',
  result: {
    headline: '정리에 힘이 실리는 날',
    verdict: '오늘은 새 일을 벌이기보다 진행 중인 일을 점검하는 편이 더 좋습니다.',
    overallSummary: '오늘은 점검하기 좋은 흐름이에요.',
    overallTone: '좋은 흐름',
    primaryMode: 'MANAGE',
    primaryModeLabel: '점검·관리',
    domainSignals: [{ domain: 'wealth', status: '좋음' }, { domain: 'work', status: '주의' }],
    highlights: [{ domain: '재물', title: '지출 점검', body: '조건 비교에 유리합니다.' }],
    cautions: [{ title: '서두르지 않기', body: '즉흥적 확답은 미루세요.' }],
    actionTip: '결정을 하루 미뤄 보세요.',
    followUps: [{ displayLabel: '오늘 재물 흐름은?', question: '오늘 재물운을 사주 흐름 기준으로 알려줘' }],
  },
  evidenceVersion: 'today-evidence@1.0.0',
  policyVersion: 'today@1.1.0',
  model: 'gpt-5-mini',
  createdAt: 't',
  updatedAt: 't',
};

// A legacy V1.0 record — no verdict/mode/domainSignals/followUps, only consultationPrompts.
const legacyRec: DailyFortuneRecord = {
  id: 'r0',
  fortuneDate: '2026-08-18',
  timezone: 'Asia/Seoul',
  overallTone: '무난한 흐름',
  result: {
    headline: '무난한 하루',
    overallSummary: '오늘은 큰 변화 없이 흐릅니다. 리듬을 지키세요.',
    overallTone: '무난한 흐름',
    highlights: [],
    cautions: [],
    actionTip: '리듬을 지키세요.',
    consultationPrompts: ['오늘 하루의 흐름을 더 알려줘'],
  },
  evidenceVersion: 'today-evidence@1.0.0',
  policyVersion: 'today@1.0.0',
  model: 'gpt-5-mini',
  createdAt: 't',
  updatedAt: 't',
};

describe('todayView — one record renders consistently on Home / detail / mailbox (§83)', () => {
  it('maps each tone to a variant', () => {
    expect(toneVariant('좋은 흐름')).toBe('positive');
    expect(toneVariant('무난한 흐름')).toBe('neutral');
    expect(toneVariant('변화가 많은 날')).toBe('change');
    expect(toneVariant('조심해서 움직일 날')).toBe('caution');
  });

  it('preview carries date + tone + mode label + headline', () => {
    const p = toTodayPreview(rec);
    expect(p).toMatchObject({
      fortuneDate: '2026-08-19', dot: '2026.08.19', weekday: '수',
      overallTone: '좋은 흐름', toneVariant: 'positive', primaryModeLabel: '점검·관리',
      headline: '정리에 힘이 실리는 날',
    });
  });

  it('detail carries the verdict, mapped domain signals, and short/rich follow-ups', () => {
    const d = toTodayDetailView(rec);
    expect(d.verdict).toBe('오늘은 새 일을 벌이기보다 진행 중인 일을 점검하는 편이 더 좋습니다.');
    expect(d.domainSignals).toEqual([
      { label: '재물', status: '좋음', variant: 'positive' },
      { label: '일·사업', status: '주의', variant: 'caution' },
    ]);
    expect(d.followUps).toEqual([{ displayLabel: '오늘 재물 흐름은?', question: '오늘 재물운을 사주 흐름 기준으로 알려줘' }]);
    expect(d.headline).toBe('정리에 힘이 실리는 날');
    expect(d.actionTip).toBe('결정을 하루 미뤄 보세요.');
  });

  it('normalizes a legacy V1.0 record (§77-§79): verdict falls back, prompts become follow-ups, no mode/signals', () => {
    const p = toTodayPreview(legacyRec);
    expect(p.primaryModeLabel).toBeUndefined();
    const d = toTodayDetailView(legacyRec);
    // verdict is the first sentence of the summary (the record has none of its own).
    expect(d.verdict).toBe('오늘은 큰 변화 없이 흐릅니다.');
    expect(d.domainSignals).toEqual([]);
    expect(d.followUps).toEqual([{ displayLabel: '오늘 하루의 흐름을 더 알려줘', question: '오늘 하루의 흐름을 더 알려줘' }]);
  });

  it('isForFortuneDate matches only the exact date', () => {
    expect(isForFortuneDate(rec, '2026-08-19')).toBe(true);
    expect(isForFortuneDate(rec, '2026-08-20')).toBe(false);
    expect(isForFortuneDate(null, '2026-08-19')).toBe(false);
  });
});
