import { createHash } from 'crypto';

import type { DigestProvider } from '@/features/interpretation';
import type { BirthInfoDraft } from '@/features/consultation';
import { buildTodayFortune, parseDailyFortune } from '@/features/today/server/buildTodayFortune';
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

const VALID_JSON = JSON.stringify({
  headline: '벌이기보다 정리에 힘이 실리는 날',
  overallSummary: '오늘은 새 일을 시작하기보다 이미 진행 중인 일을 점검하기 좋은 흐름이에요. 조건을 다시 살펴보면 도움이 됩니다.',
  highlights: [
    { domain: '재물', title: '지출 점검', body: '큰 결정보다 조건을 비교하는 데 유리합니다.' },
    { domain: '일·사업', title: '마무리', body: '벌여둔 일을 정리하면 성과가 보입니다.' },
  ],
  cautions: [{ title: '서두르지 않기', body: '즉흥적인 확답은 미루는 편이 낫습니다.' }],
  actionTip: '오늘은 결정을 하루 미루고 조건을 한 번 더 확인해 보세요.',
  consultationPrompts: ['오늘 재물운을 더 자세히 알려줘', '이번 주에 이직 얘기를 꺼내도 될까?'],
});

describe('buildTodayFortune — ONE LLM call, capped, hygienic', () => {
  it('produces a daily result from a valid model response with exactly one callLLM', async () => {
    const callLLM = jest.fn().mockResolvedValue(VALID_JSON);
    const out = await buildTodayFortune({ birthInput: SELF }, { digestProvider, nowEpochSeconds: NOW, callLLM });
    expect(out.ok).toBe(true);
    if (!out.ok) throw new Error('unreachable');
    expect(callLLM).toHaveBeenCalledTimes(1);
    expect(out.fortuneDate).toBe('2026-08-19');
    expect(out.result.headline).toContain('정리');
    expect(out.result.highlights.length).toBeLessThanOrEqual(3);
    // The tier is the SERVER's, not the model's.
    const evidence = await buildTodayFortuneEvidence({ birthInfo: SELF, nowEpochSeconds: NOW }, { digestProvider });
    expect(out.overallTone).toBe(deriveDailyPlan(evidence).overallTone);
  });

  it('caps highlights to 3 and cautions to 2 even if the model returns more', async () => {
    const over = JSON.parse(VALID_JSON);
    over.highlights = Array.from({ length: 6 }, (_, i) => ({ domain: '재물', title: `h${i}`, body: `body ${i}` }));
    over.cautions = Array.from({ length: 5 }, (_, i) => ({ title: `c${i}`, body: `caution ${i}` }));
    const callLLM = jest.fn().mockResolvedValue(JSON.stringify(over));
    const out = await buildTodayFortune({ birthInput: SELF }, { digestProvider, nowEpochSeconds: NOW, callLLM });
    if (!out.ok) throw new Error('unreachable');
    expect(out.result.highlights).toHaveLength(3);
    expect(out.result.cautions).toHaveLength(2);
  });

  it('LLM throw → LLM_FAILED (no partial/corrupt result); invalid JSON → INVALID_OUTPUT', async () => {
    const fail = await buildTodayFortune({ birthInput: SELF }, { digestProvider, nowEpochSeconds: NOW, callLLM: jest.fn().mockRejectedValue(new Error('x')) });
    expect(fail).toMatchObject({ ok: false, reason: 'LLM_FAILED', fortuneDate: '2026-08-19' });
    const bad = await buildTodayFortune({ birthInput: SELF }, { digestProvider, nowEpochSeconds: NOW, callLLM: jest.fn().mockResolvedValue('not json') });
    expect(bad).toMatchObject({ ok: false, reason: 'INVALID_OUTPUT' });
  });

  it('an unresolvable chart → EVIDENCE_UNAVAILABLE, and callLLM is never invoked', async () => {
    const callLLM = jest.fn();
    const out = await buildTodayFortune({ birthInput: { ...SELF, birthMonth: '13', birthDay: '40' }, }, { digestProvider, nowEpochSeconds: NOW, callLLM });
    expect(out.ok).toBe(false);
    expect(callLLM).not.toHaveBeenCalled();
  });
});

describe('parseDailyFortune — hygiene + fail-closed', () => {
  const plan = { fortuneDate: '2026-08-19', overallTone: '무난한 흐름', maxHighlights: 3, maxCautions: 2 } as never;
  it('rejects an empty/filler result (missing headline/summary/action)', () => {
    expect(parseDailyFortune(JSON.stringify({ headline: '', overallSummary: '', highlights: [], cautions: [], actionTip: '', consultationPrompts: [] }), plan)).toBeNull();
  });
  it('strips bracketed engine labels like "(엔진: SAJU)" from surfaced fields', () => {
    const withLabel = JSON.stringify({
      headline: '정리에 힘이 실리는 날 (엔진: SAJU)', overallSummary: '오늘은 무난한 흐름입니다 점검하기 좋아요.', actionTip: '천천히 하세요 오늘은.',
      highlights: [], cautions: [], consultationPrompts: [],
    });
    const r = parseDailyFortune(withLabel, plan);
    expect(r).not.toBeNull();
    expect(r!.headline).not.toMatch(/엔진|SAJU/);
  });

  it('REJECTS a result that leaks raw 천간지지 (甲子…) — never shows 간지 to the user (§19/§77)', () => {
    const withGanji = JSON.stringify({
      headline: '甲子 일진의 날', overallSummary: '오늘은 무난한 흐름입니다 점검하기 좋아요.', actionTip: '천천히 하세요 오늘은.',
      highlights: [], cautions: [], consultationPrompts: [],
    });
    expect(parseDailyFortune(withGanji, plan)).toBeNull();
  });
});
