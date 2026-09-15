import { isForMonth, monthlyToneVariant, toMonthlyDetailView, toMonthlyPreview } from '@/features/monthly/presentation/monthlyView';
import type { MonthlyFortuneRecord } from '@/features/monthly/types';

const rec: MonthlyFortuneRecord = {
  id: 'm1',
  year: 2026,
  month: 8,
  timezone: 'Asia/Seoul',
  overallTier: '기회를 살리기 좋은 달',
  result: {
    headline: '조건을 정리하고 실행 준비를 마치는 달',
    verdict: '이번 달은 벌이기보다 조건을 정리하고 준비를 마치는 편이 좋습니다.',
    overallSummary: '움직임이 많지만 방향은 분명합니다.',
    overallTier: '기회를 살리기 좋은 달',
    primaryMode: 'EXPAND',
    primaryModeLabel: '확장·추진',
    domainSignals: [{ domain: 'work', status: '좋음' }, { domain: 'relationship', status: '주의' }],
    opportunities: [{ domain: '일·사업', title: '실행 준비', body: '조건을 맞추면 성과로 이어집니다.' }],
    cautions: [{ title: '말 아끼기', body: '민감한 대화는 미루세요.' }],
    actions: ['조건을 다시 확인하기', '대화는 준비해서 진행하기'],
    followUps: [{ displayLabel: '이번 달 일 흐름은?', question: '이번 달 일 흐름을 알려줘' }],
    transition: {
      transitionDate: '2026-08-07',
      early: { tierLabel: '속도를 조절할 달', modeLabel: '정비·속도조절' },
      later: { tierLabel: '기회를 살리기 좋은 달', modeLabel: '확장·추진' },
    },
  },
  evidenceVersion: 'monthly-evidence@1.0.0',
  planVersion: 'monthly-plan@1.0.0',
  policyVersion: 'monthly@1.0.0',
  model: 'gpt-5-mini',
  createdAt: 't',
  updatedAt: 't',
};

// Forward-compatibility (§43): a record missing every optional field still renders.
const minimalRec: MonthlyFortuneRecord = {
  id: 'm0',
  year: 2026,
  month: 7,
  timezone: 'Asia/Seoul',
  overallTier: '안정적으로 운영할 달',
  result: {
    headline: '무난한 달',
    verdict: '',
    overallSummary: '큰 변화 없이 흐릅니다. 리듬을 지키세요.',
    overallTier: '안정적으로 운영할 달',
    opportunities: [],
    cautions: [],
    actions: ['리듬을 지키기'],
  },
  evidenceVersion: null,
  planVersion: null,
  policyVersion: null,
  model: null,
  createdAt: 't',
  updatedAt: 't',
};

describe('monthlyView — one record renders consistently on Home / detail / mailbox', () => {
  it('maps each tier to a variant', () => {
    expect(monthlyToneVariant('기회를 살리기 좋은 달')).toBe('positive');
    expect(monthlyToneVariant('안정적으로 운영할 달')).toBe('neutral');
    expect(monthlyToneVariant('변화가 많은 달')).toBe('change');
    expect(monthlyToneVariant('속도를 조절할 달')).toBe('caution');
  });

  it('preview carries the month label + tier + mode + headline', () => {
    const p = toMonthlyPreview(rec);
    expect(p).toMatchObject({
      year: 2026, month: 8, monthLabel: '2026년 8월',
      overallTier: '기회를 살리기 좋은 달', toneVariant: 'positive', primaryModeLabel: '확장·추진',
      headline: '조건을 정리하고 실행 준비를 마치는 달',
    });
  });

  it('detail carries verdict, mapped domain signals, opportunities, actions, follow-ups', () => {
    const d = toMonthlyDetailView(rec);
    expect(d.verdict).toBe('이번 달은 벌이기보다 조건을 정리하고 준비를 마치는 편이 좋습니다.');
    expect(d.domainSignals).toEqual([
      { label: '일·사업', status: '좋음', variant: 'positive' },
      { label: '관계', status: '주의', variant: 'caution' },
    ]);
    expect(d.opportunities).toHaveLength(1);
    expect(d.actions).toEqual(['조건을 다시 확인하기', '대화는 준비해서 진행하기']);
    expect(d.followUps).toEqual([{ displayLabel: '이번 달 일 흐름은?', question: '이번 달 일 흐름을 알려줘' }]);
    // The 節 transition date is formatted for display; the tier/mode labels pass through.
    expect(d.transition).toEqual({
      dateLabel: '8월 7일',
      early: { tierLabel: '속도를 조절할 달', modeLabel: '정비·속도조절' },
      later: { tierLabel: '기회를 살리기 좋은 달', modeLabel: '확장·추진' },
    });
  });

  it('renders a minimal (forward-compat) record: verdict falls back, no mode/signals/followUps', () => {
    const p = toMonthlyPreview(minimalRec);
    expect(p.primaryModeLabel).toBeUndefined();
    const d = toMonthlyDetailView(minimalRec);
    expect(d.verdict).toBe('큰 변화 없이 흐릅니다.');
    expect(d.domainSignals).toEqual([]);
    expect(d.transition).toBeNull();
    expect(d.followUps).toEqual([]);
    expect(d.actions).toEqual(['리듬을 지키기']);
  });

  it('isForMonth matches only the exact (year, month)', () => {
    expect(isForMonth(rec, 2026, 8)).toBe(true);
    expect(isForMonth(rec, 2026, 7)).toBe(false);
    expect(isForMonth(null, 2026, 8)).toBe(false);
  });
});
