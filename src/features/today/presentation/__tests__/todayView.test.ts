import { isForFortuneDate, toneVariant, toTodayDetailView, toTodayPreview } from '@/features/today/presentation/todayView';
import type { DailyFortuneRecord } from '@/features/today/types';

const rec: DailyFortuneRecord = {
  id: 'r1',
  fortuneDate: '2026-08-19',
  timezone: 'Asia/Seoul',
  overallTone: '좋은 흐름',
  result: {
    headline: '정리에 힘이 실리는 날',
    overallSummary: '오늘은 점검하기 좋은 흐름이에요.',
    overallTone: '좋은 흐름',
    highlights: [{ domain: '재물', title: '지출 점검', body: '조건 비교에 유리합니다.' }],
    cautions: [{ title: '서두르지 않기', body: '즉흥적 확답은 미루세요.' }],
    actionTip: '결정을 하루 미뤄 보세요.',
    consultationPrompts: ['오늘 재물운을 더 자세히 알려줘'],
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

  it('preview carries the date label + tone + headline (facts identical to detail)', () => {
    const p = toTodayPreview(rec);
    expect(p).toMatchObject({ fortuneDate: '2026-08-19', dot: '2026.08.19', weekday: '수', overallTone: '좋은 흐름', toneVariant: 'positive', headline: '정리에 힘이 실리는 날' });
    const d = toTodayDetailView(rec);
    // The detail is the preview PLUS the body — same headline/tone/date.
    expect(d.headline).toBe(p.headline);
    expect(d.overallTone).toBe(p.overallTone);
    expect(d.highlights).toHaveLength(1);
    expect(d.actionTip).toBe('결정을 하루 미뤄 보세요.');
  });

  it('isForFortuneDate matches only the exact date', () => {
    expect(isForFortuneDate(rec, '2026-08-19')).toBe(true);
    expect(isForFortuneDate(rec, '2026-08-20')).toBe(false);
    expect(isForFortuneDate(null, '2026-08-19')).toBe(false);
  });
});
