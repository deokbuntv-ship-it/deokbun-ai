import { createHash } from 'crypto';

import type { DigestProvider } from '@/features/interpretation';
import type { BirthInfoDraft } from '@/features/consultation';
import {
  buildMonthlyFortune,
  containsEventGuarantee,
  containsUnsupportedDatePrecision,
  parseMonthlyFortune,
} from '@/features/monthly/server/buildMonthlyFortune';
import { deriveMonthlyPlan } from '@/features/monthly/engine/monthlyPlan';
import { buildMonthlyFortuneEvidence } from '@/features/monthly/engine/monthlyEvidence';

const digestProvider: DigestProvider = {
  async sha256Utf8(s: string) {
    return createHash('sha256').update(s, 'utf8').digest('hex');
  },
};

const SELF: BirthInfoDraft = {
  displayName: '나', gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1990', birthMonth: '6', birthDay: '15', birthTimeAccuracy: 'exact',
  birthHour: '9', birthMinute: '30', approximateTimePeriod: null, birthPlace: '서울',
};
const NOW = Math.floor(Date.parse('2026-08-19T03:00:00Z') / 1000); // 2026-08 (KST)

const VALID_JSON = JSON.stringify({
  headline: '벌이기보다 조건을 정리하고 실행 준비를 마치는 달',
  verdict: '이번 달은 새 일을 크게 벌이기보다 조건을 정리하고 실행 준비를 마치는 편이 유리합니다. 일에서 기회가 있지만 관계에서는 말을 아끼세요.',
  overallSummary: '전반적으로 움직임이 많지만 방향은 분명합니다. 벌여둔 일을 살피면 도움이 됩니다.',
  opportunities: [
    { domain: '일·사업', title: '실행 준비', body: '진행 중인 일의 조건을 맞추면 성과로 이어집니다.' },
    { domain: '재물', title: '지출 점검', body: '큰 지출보다 씀씀이를 비교하는 데 유리합니다.' },
  ],
  cautions: [{ title: '관계에서 말 아끼기', body: '민감한 대화는 한 발 물러서서 듣는 편이 좋습니다.' }],
  actions: ['진행 중인 일의 조건을 다시 확인하기', '큰 지출은 비교 후 결정하기', '중요한 대화는 자료를 준비해 진행하기'],
  followUps: [
    { displayLabel: '이번 달 일 흐름은?', question: '이번 달 일·사업에서 무엇을 우선하면 좋은지 사주 흐름 기준으로 알려줘.' },
    { displayLabel: '이번 달 관계 주의점은?', question: '이번 달 사람 관계에서 조심할 점을 알려줘.' },
    { displayLabel: '중요한 결정 시기는?', question: '이번 달 중요한 결정을 언제 내리면 좋은지 흐름을 비교해서 알려줘.' },
  ],
});

const PLAN = {
  year: 2026, month: 8, available: true, overallTier: '변화가 많은 달',
  primaryMode: 'ADJUST', primaryModeLabel: '조정·조율', strongestDomain: 'work', cautionDomain: 'relationship',
  domainSignals: [{ domain: 'work', status: '무난' }, { domain: 'relationship', status: '주의' }],
  supportedDomains: ['overall', 'work', 'wealth', 'relationship', 'action'],
  harmonyCount: 2, frictionCount: 1, segmentCount: 1, hasMeaningfulTransition: false, transition: null,
  maxOpportunities: 3, maxCautions: 2, maxActions: 3,
  forbidEventCertainty: true, forbidExactDates: true, evidenceVersion: 'monthly-evidence@1.1.0', planVersion: 'monthly-plan@1.1.0',
} as never;

describe('buildMonthlyFortune — ONE LLM call, server-owned decision, month-level', () => {
  it('produces a monthly result from a valid model response with exactly one callLLM', async () => {
    const callLLM = jest.fn().mockResolvedValue(VALID_JSON);
    const out = await buildMonthlyFortune({ birthInput: SELF }, { digestProvider, nowEpochSeconds: NOW, callLLM });
    expect(out.ok).toBe(true);
    if (!out.ok) throw new Error('unreachable');
    expect(callLLM).toHaveBeenCalledTimes(1);
    expect(out.year).toBe(2026);
    expect(out.month).toBe(8);
    expect((out.result.verdict ?? '').length).toBeGreaterThan(0);
    expect(out.result.actions.length).toBeGreaterThan(0);
    expect(out.result.opportunities.length).toBeLessThanOrEqual(3);
    // Tier + mode are the SERVER's, not the model's.
    const evidence = await buildMonthlyFortuneEvidence({ birthInfo: SELF }, { digestProvider, nowEpochSeconds: NOW });
    const plan = deriveMonthlyPlan(evidence);
    expect(out.overallTier).toBe(plan.overallTier);
    expect(out.result.primaryMode).toBe(plan.primaryMode);
    expect(out.result.domainSignals).toEqual(plan.domainSignals);
    expect(out.result.followUps).toHaveLength(3);
    for (const f of out.result.followUps ?? []) expect(f.displayLabel.length).toBeLessThanOrEqual(20);
    // The within-month transition is server-owned (from the plan) — null or a well-formed 節 date, never
    // fabricated by the model.
    expect(out.result.transition === null || typeof out.result.transition?.transitionDate === 'string').toBe(true);
    expect(out.result.transition).toEqual(plan.transition
      ? { transitionDate: plan.transition.transitionCivilDate, early: { tierLabel: plan.transition.early.tier, modeLabel: plan.transition.early.modeLabel }, later: { tierLabel: plan.transition.later.tier, modeLabel: plan.transition.later.modeLabel } }
      : null);
  });

  it('LLM throw → LLM_FAILED; invalid JSON → INVALID_OUTPUT; unresolvable chart → EVIDENCE_UNAVAILABLE (no call)', async () => {
    const fail = await buildMonthlyFortune({ birthInput: SELF }, { digestProvider, nowEpochSeconds: NOW, callLLM: jest.fn().mockRejectedValue(new Error('x')) });
    expect(fail).toMatchObject({ ok: false, reason: 'LLM_FAILED' });
    const bad = await buildMonthlyFortune({ birthInput: SELF }, { digestProvider, nowEpochSeconds: NOW, callLLM: jest.fn().mockResolvedValue('not json') });
    expect(bad).toMatchObject({ ok: false, reason: 'INVALID_OUTPUT' });
    const noCall = jest.fn();
    const unav = await buildMonthlyFortune({ birthInput: { ...SELF, birthMonth: '13', birthDay: '40' } }, { digestProvider, nowEpochSeconds: NOW, callLLM: noCall });
    expect(unav.ok).toBe(false);
    expect(noCall).not.toHaveBeenCalled();
  });
});

describe('parseMonthlyFortune — hygiene + dedup + fail-closed (§35/§37/§24)', () => {
  it('rejects empty/filler and a result with no actions', () => {
    expect(parseMonthlyFortune(JSON.stringify({ headline: '', verdict: '', overallSummary: '', opportunities: [], cautions: [], actions: [], followUps: [] }), PLAN)).toBeNull();
    expect(parseMonthlyFortune(JSON.stringify({ headline: 'x', verdict: 'y', overallSummary: '이번 달은 무난합니다.', opportunities: [], cautions: [], actions: [], followUps: [] }), PLAN)).toBeNull();
  });

  it('falls back to the first summary sentence when the model omits a verdict', () => {
    const r = parseMonthlyFortune(JSON.stringify({
      headline: '조정의 달', overallSummary: '이번 달은 점검하기 좋은 흐름입니다. 조건을 살펴보세요.',
      opportunities: [], cautions: [], actions: ['조건을 다시 확인하기'], followUps: [],
    }), PLAN);
    expect(r).not.toBeNull();
    expect(r!.verdict).toBe('이번 달은 점검하기 좋은 흐름입니다.');
  });

  it('de-dups actions that restate one underlying signal (§35)', () => {
    const r = parseMonthlyFortune(JSON.stringify({
      headline: '정리의 달', verdict: '이번 달은 정리에 유리합니다.', overallSummary: '차분히 살피기 좋아요.',
      opportunities: [], cautions: [],
      actions: ['진행 중인 일을 정리하기', '벌인 일을 마무리하기', '중요한 대화는 준비해서 진행하기'],
      followUps: [],
    }), PLAN);
    // 정리 + 마무리 → both ORGANIZE (first wins); 대화 → RELATION → kept. 2 actions.
    expect(r!.actions).toEqual(['진행 중인 일을 정리하기', '중요한 대화는 준비해서 진행하기']);
  });

  it('REJECTS raw 간지, event guarantees, and unsupported exact-date claims (§24/§37)', () => {
    const ganji = parseMonthlyFortune(JSON.stringify({ headline: '甲子 달', verdict: '무난합니다.', overallSummary: '점검하기 좋아요.', opportunities: [], cautions: [], actions: ['확인하기'], followUps: [] }), PLAN);
    expect(ganji).toBeNull();
    const guarantee = parseMonthlyFortune(JSON.stringify({ headline: '좋은 달', verdict: '좋습니다.', overallSummary: '점검하기 좋아요.', opportunities: [{ domain: '재물', title: '수입', body: '이번 달 목돈이 들어옵니다.' }], cautions: [], actions: ['확인하기'], followUps: [] }), PLAN);
    expect(guarantee).toBeNull();
    const date = parseMonthlyFortune(JSON.stringify({ headline: '좋은 달', verdict: '좋습니다.', overallSummary: '점검하기 좋아요.', opportunities: [], cautions: [], actions: ['17~21일에 계약하기 가장 좋습니다'], followUps: [] }), PLAN);
    expect(date).toBeNull();
  });
});

describe('detectors — high precision (§24/§37)', () => {
  it('event-guarantee flags explicit guarantees only', () => {
    expect(containsEventGuarantee('이번 달 목돈이 들어옵니다.')).toBe(true);
    expect(containsEventGuarantee('그 일은 성사됩니다.')).toBe(true);
    expect(containsEventGuarantee('재물 흐름을 점검하기 좋은 달입니다.')).toBe(false);
  });
  it('date-precision flags specific days/weeks, not month-granular hints', () => {
    expect(containsUnsupportedDatePrecision('17~21일이 가장 좋습니다.')).toBe(true);
    expect(containsUnsupportedDatePrecision('셋째 주가 제일 유리합니다.')).toBe(true);
    expect(containsUnsupportedDatePrecision('8월 15일에 계약하기 좋습니다.')).toBe(true);
    expect(containsUnsupportedDatePrecision('이번 달 중순에는 정리에 유리합니다.')).toBe(false);
    expect(containsUnsupportedDatePrecision('8월은 조정이 필요한 달입니다.')).toBe(false);
  });
});
