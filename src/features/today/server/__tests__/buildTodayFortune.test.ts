import { createHash } from 'crypto';

import type { DigestProvider } from '@/features/interpretation';
import type { BirthInfoDraft } from '@/features/consultation';
import { buildTodayFortune, containsEventGuarantee, parseDailyFortune } from '@/features/today/server/buildTodayFortune';
import { deriveDailyPlan } from '@/features/today/engine/todayPlan';
import { buildTodayFortuneEvidence } from '@/features/today/engine/todayEvidence';

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
const NOW = Math.floor(Date.parse('2026-08-19T03:00:00Z') / 1000);

// A valid V1.1 model response: verdict + short-label/rich-question followUps + distinct highlights.
const VALID_JSON = JSON.stringify({
  headline: '벌이기보다 정리에 힘이 실리는 날',
  verdict: '오늘은 새 일을 벌이기보다 진행 중인 일을 점검하고 조건을 맞추는 편이 더 유리합니다.',
  overallSummary: '큰 결정을 서두르기보다 이미 벌여둔 일을 살피기 좋은 하루입니다. 조건을 다시 비교해 보면 도움이 됩니다.',
  highlights: [
    { domain: '재물', title: '지출 비교', body: '큰 결정보다 씀씀이를 비교하는 데 유리합니다.' },
    { domain: '일·사업', title: '마무리', body: '벌여둔 일을 마무리하면 성과가 드러납니다.' },
  ],
  cautions: [{ title: '성급한 확답 미루기', body: '즉흥적으로 답하기보다 한 번 더 확인하고 움직이세요.' }],
  actionTip: '오늘은 결정을 하루 미루고 조건을 한 번 더 확인해 보세요.',
  followUps: [
    { displayLabel: '오늘 재물 흐름은?', question: '오늘 재물과 관련해 무엇을 우선 챙기면 좋은지 사주 흐름을 기준으로 알려줘.' },
    { displayLabel: '오늘 결정 미뤄도 될까?', question: '지금 고민 중인 결정을 오늘 내려도 괜찮은지 사주 흐름을 기준으로 알려줘.' },
    { displayLabel: '오늘 먼저 할 일은?', question: '오늘 하루 중 가장 먼저 처리하면 좋은 일이 무엇인지 알려줘.' },
  ],
});

// A full V1.1 plan literal for direct parser tests (the real path derives this from evidence).
const PLAN = {
  fortuneDate: '2026-08-19', available: true, overallTone: '무난한 흐름',
  primaryMode: 'MANAGE', primaryModeLabel: '점검·관리',
  strongestDomain: 'wealth', cautionDomain: null,
  domainSignals: [{ domain: 'wealth', status: '무난' }],
  supportedDomains: ['overall', 'work', 'wealth', 'relationship', 'action'],
  harmonyCount: 0, frictionCount: 0, maxHighlights: 3, maxCautions: 2,
  forbidEventCertainty: true, evidenceVersion: 'today-evidence@1.0.0', planVersion: 'today-plan@1.1.0',
} as never;

describe('buildTodayFortune — ONE LLM call, capped, hygienic, server-owned decision', () => {
  it('produces a V1.1 daily result from a valid model response with exactly one callLLM', async () => {
    const callLLM = jest.fn().mockResolvedValue(VALID_JSON);
    const out = await buildTodayFortune({ birthInput: SELF }, { digestProvider, nowEpochSeconds: NOW, callLLM });
    expect(out.ok).toBe(true);
    if (!out.ok) throw new Error('unreachable');
    expect(callLLM).toHaveBeenCalledTimes(1);
    expect(out.fortuneDate).toBe('2026-08-19');
    expect(out.result.headline).toContain('정리');
    // The day is answered: a non-empty verdict is always present.
    expect(out.result.verdict && out.result.verdict.length).toBeGreaterThan(0);
    expect(out.result.highlights.length).toBeLessThanOrEqual(3);
    // The tier + mode are the SERVER's, not the model's.
    const evidence = await buildTodayFortuneEvidence({ birthInfo: SELF, nowEpochSeconds: NOW }, { digestProvider });
    const plan = deriveDailyPlan(evidence);
    expect(out.overallTone).toBe(plan.overallTone);
    expect(out.result.primaryMode).toBe(plan.primaryMode);
    expect(out.result.primaryModeLabel).toBe(plan.primaryModeLabel);
    expect(out.result.domainSignals).toEqual(plan.domainSignals);
    // Follow-ups: 3 short labels + rich questions; the legacy field is gone.
    expect(out.result.followUps).toHaveLength(3);
    for (const f of out.result.followUps ?? []) {
      expect(f.displayLabel.length).toBeLessThanOrEqual(20);
      expect(f.question.length).toBeGreaterThan(f.displayLabel.length);
    }
    expect(out.result.consultationPrompts).toBeUndefined();
  });

  it('caps highlights to 3 and cautions to 2 even if the model returns more', async () => {
    const over = JSON.parse(VALID_JSON);
    over.highlights = Array.from({ length: 6 }, (_, i) => ({ domain: '재물', title: `h${i}`, body: `내용 ${i}` }));
    over.cautions = Array.from({ length: 5 }, (_, i) => ({ title: `c${i}`, body: `주의 ${i}` }));
    const callLLM = jest.fn().mockResolvedValue(JSON.stringify(over));
    const out = await buildTodayFortune({ birthInput: SELF }, { digestProvider, nowEpochSeconds: NOW, callLLM });
    if (!out.ok) throw new Error('unreachable');
    expect(out.result.highlights).toHaveLength(3);
    expect(out.result.cautions).toHaveLength(2);
  });

  it('LLM throw → LLM_FAILED; invalid JSON → INVALID_OUTPUT; unresolvable chart → EVIDENCE_UNAVAILABLE (no call)', async () => {
    const fail = await buildTodayFortune({ birthInput: SELF }, { digestProvider, nowEpochSeconds: NOW, callLLM: jest.fn().mockRejectedValue(new Error('x')) });
    expect(fail).toMatchObject({ ok: false, reason: 'LLM_FAILED', fortuneDate: '2026-08-19' });
    const bad = await buildTodayFortune({ birthInput: SELF }, { digestProvider, nowEpochSeconds: NOW, callLLM: jest.fn().mockResolvedValue('not json') });
    expect(bad).toMatchObject({ ok: false, reason: 'INVALID_OUTPUT' });
    const noCall = jest.fn();
    const unav = await buildTodayFortune({ birthInput: { ...SELF, birthMonth: '13', birthDay: '40' } }, { digestProvider, nowEpochSeconds: NOW, callLLM: noCall });
    expect(unav.ok).toBe(false);
    expect(noCall).not.toHaveBeenCalled();
  });
});

describe('parseDailyFortune — hygiene + dedup + fail-closed (§26/§54)', () => {
  it('rejects an empty/filler result (missing headline/summary/action)', () => {
    expect(parseDailyFortune(JSON.stringify({ headline: '', verdict: '', overallSummary: '', highlights: [], cautions: [], actionTip: '', followUps: [] }), PLAN)).toBeNull();
  });

  it('falls back to the first summary sentence when the model omits a verdict', () => {
    const r = parseDailyFortune(JSON.stringify({
      headline: '정리에 힘이 실리는 날', overallSummary: '오늘은 점검하기 좋은 흐름입니다. 조건을 살펴보세요.', actionTip: '천천히 움직이세요.',
      highlights: [], cautions: [], followUps: [],
    }), PLAN);
    expect(r).not.toBeNull();
    expect(r!.verdict).toBe('오늘은 점검하기 좋은 흐름입니다.');
  });

  it('de-dups highlights that restate one underlying signal (§25/§26)', () => {
    const r = parseDailyFortune(JSON.stringify({
      headline: '정리의 날', verdict: '오늘은 정리에 유리합니다.', overallSummary: '차분히 살피기 좋은 하루예요.', actionTip: '하나씩 처리하세요.',
      highlights: [
        { domain: '일', title: '정리', body: '오늘은 정리하기 좋습니다.' },
        { domain: '일', title: '점검', body: '진행 중인 일을 점검하세요.' },
        { domain: '재물', title: '마무리', body: '벌인 일을 마무리하세요.' },
      ],
      cautions: [], followUps: [],
    }), PLAN);
    expect(r).not.toBeNull();
    // all three map to the ORGANIZE category → only the first survives.
    expect(r!.highlights).toHaveLength(1);
    expect(r!.highlights[0].title).toBe('정리');
  });

  it('normalizes legacy consultationPrompts into short-label follow-ups (§77 back-compat)', () => {
    const r = parseDailyFortune(JSON.stringify({
      headline: 'x', verdict: 'y', overallSummary: '오늘은 좋아요.', actionTip: 'a',
      highlights: [], cautions: [], consultationPrompts: ['오늘 재물운을 더 자세히 알려줘'],
    }), PLAN);
    expect(r!.followUps).toEqual([{ displayLabel: '오늘 재물운을 더 자세히 알려줘', question: '오늘 재물운을 더 자세히 알려줘' }]);
  });

  it('shortens an overlong follow-up label so chips never truncate (§38)', () => {
    const r = parseDailyFortune(JSON.stringify({
      headline: 'x', verdict: 'y', overallSummary: '오늘은 좋아요.', actionTip: 'a', highlights: [], cautions: [],
      followUps: [{ displayLabel: '', question: '오늘 하고 있는 여러 가지 일 중에서 어떤 것을 가장 먼저 처리하면 좋은지 알려줘' }],
    }), PLAN);
    expect(r!.followUps![0].displayLabel.length).toBeLessThanOrEqual(20);
    expect(r!.followUps![0].displayLabel.endsWith('…')).toBe(true);
  });

  it('REJECTS raw 천간지지 (甲子…) — never shows 간지 to the user (§19)', () => {
    const r = parseDailyFortune(JSON.stringify({
      headline: '甲子 일진의 날', verdict: '오늘은 무난합니다.', overallSummary: '점검하기 좋아요.', actionTip: '천천히.',
      highlights: [], cautions: [], followUps: [],
    }), PLAN);
    expect(r).toBeNull();
  });

  it('REJECTS a fabricated event guarantee (§54)', () => {
    const r = parseDailyFortune(JSON.stringify({
      headline: '좋은 날', verdict: '오늘은 좋은 흐름입니다.', overallSummary: '점검하기 좋아요 오늘은.', actionTip: '천천히.',
      highlights: [{ domain: '재물', title: '수입', body: '오늘 돈이 들어옵니다.' }], cautions: [], followUps: [],
    }), PLAN);
    expect(r).toBeNull();
  });
});

describe('containsEventGuarantee — high precision (no false positives on suitability phrasing)', () => {
  it('flags explicit guarantees', () => {
    expect(containsEventGuarantee('오늘 돈이 들어옵니다.')).toBe(true);
    expect(containsEventGuarantee('그 일은 합격합니다.')).toBe(true);
    expect(containsEventGuarantee('기다리던 연락이 옵니다.')).toBe(true);
  });
  it('does NOT flag grounded suitability language', () => {
    expect(containsEventGuarantee('오늘은 재물 흐름을 점검하기 좋은 날입니다.')).toBe(false);
    expect(containsEventGuarantee('연락하기에 괜찮은 흐름입니다.')).toBe(false);
    expect(containsEventGuarantee('성과를 정리하면 도움이 됩니다.')).toBe(false);
  });
});
