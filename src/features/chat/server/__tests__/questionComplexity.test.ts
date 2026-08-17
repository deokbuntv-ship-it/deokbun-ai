// Question complexity router + per-complexity LLM profile (Overnight Sprint §4/§8).
// Pure + deterministic. Locks the directive's example questions to their intended
// class and the profile's reasoning-effort/ceiling contract.
import {
  classifyQuestionComplexity,
  resolveConsultationProfile,
  HARD_MAX_OUTPUT_TOKENS,
  MIN_MAX_OUTPUT_TOKENS,
} from '@/features/chat/server';

describe('classifyQuestionComplexity — directive example questions (§4/§17)', () => {
  it('SIMPLE — single natal-trait facet, no timing/event', () => {
    expect(classifyQuestionComplexity('내 성격은?')).toBe('SIMPLE');
    expect(classifyQuestionComplexity('내 장점은?')).toBe('SIMPLE');
    expect(classifyQuestionComplexity('내 단점은?')).toBe('SIMPLE');
    expect(classifyQuestionComplexity('배우자 성향은?')).toBe('SIMPLE'); // subject noun ≠ event domain
    expect(classifyQuestionComplexity('내 성격의 장단점을 알려줘')).toBe('SIMPLE');
    expect(classifyQuestionComplexity('나는 어떤 사람인가요?')).toBe('SIMPLE');
  });

  it('STANDARD — a concrete timing window or an event/fortune domain', () => {
    expect(classifyQuestionComplexity('2027년 사업운은?')).toBe('STANDARD');
    expect(classifyQuestionComplexity('2027년 사업운은 어때?')).toBe('STANDARD');
    expect(classifyQuestionComplexity('올해 재물운은?')).toBe('STANDARD');
    expect(classifyQuestionComplexity('이번 달 직업운은?')).toBe('STANDARD');
    expect(classifyQuestionComplexity('이번 달 재물운은?')).toBe('STANDARD');
    expect(classifyQuestionComplexity('오늘 계약해도 될까?')).toBe('STANDARD'); // event domain (계약)
  });

  it('DEEP — multi-period / comprehensive / life-spanning synthesis', () => {
    expect(classifyQuestionComplexity('앞으로 10년 사업 흐름을 분석해줘')).toBe('DEEP');
    expect(classifyQuestionComplexity('앞으로 10년 사업 흐름은?')).toBe('DEEP');
    expect(classifyQuestionComplexity('대운별 재물운을 종합해줘')).toBe('DEEP');
    expect(classifyQuestionComplexity('내 인생 전체 직업/재물 흐름')).toBe('DEEP');
    expect(classifyQuestionComplexity('평생 재물운이 궁금해요')).toBe('DEEP');
  });

  it('defaults safely — empty → STANDARD (never accidental SIMPLE); short no-signal → SIMPLE', () => {
    expect(classifyQuestionComplexity('')).toBe('STANDARD');
    expect(classifyQuestionComplexity('   ')).toBe('STANDARD');
    expect(classifyQuestionComplexity('나는?')).toBe('SIMPLE'); // ≤12 chars, no signal
    // a longer no-keyword question stays STANDARD (never under-budgets a nuanced ask)
    expect(classifyQuestionComplexity('요즘 마음이 복잡한데 조언을 좀 구하고 싶어요')).toBe('STANDARD');
  });

  it('DEEP dominates even when timing/event signals co-occur', () => {
    // "대운" present → DEEP regardless of also matching an event domain
    expect(classifyQuestionComplexity('대운별 사업운 흐름 종합해줘')).toBe('DEEP');
    expect(classifyQuestionComplexity('앞으로 20년 재물 흐름 총정리')).toBe('DEEP');
  });
});

describe('resolveConsultationProfile — reasoning effort + truncation-safe ceiling (§8)', () => {
  it('per-complexity defaults: effort rises with complexity; ceiling stays within hard bounds', () => {
    expect(resolveConsultationProfile('SIMPLE')).toEqual({ maxOutputTokens: 3500, reasoningEffort: 'low' });
    expect(resolveConsultationProfile('STANDARD')).toEqual({ maxOutputTokens: 4500, reasoningEffort: 'low' });
    expect(resolveConsultationProfile('DEEP')).toEqual({ maxOutputTokens: 6000, reasoningEffort: 'medium' });
    // every ceiling is a safe value in [MIN, HARD_MAX]
    for (const c of ['SIMPLE', 'STANDARD', 'DEEP'] as const) {
      const p = resolveConsultationProfile(c);
      expect(p.maxOutputTokens).toBeGreaterThanOrEqual(MIN_MAX_OUTPUT_TOKENS);
      expect(p.maxOutputTokens).toBeLessThanOrEqual(HARD_MAX_OUTPUT_TOKENS);
    }
  });

  it('DEEP never runs cheaper reasoning than STANDARD/SIMPLE (quality floor preserved)', () => {
    const order = { minimal: 0, low: 1, medium: 2, high: 3 } as const;
    const s = resolveConsultationProfile('SIMPLE').reasoningEffort;
    const d = resolveConsultationProfile('DEEP').reasoningEffort;
    expect(order[d]).toBeGreaterThanOrEqual(order[s]);
  });

  it('global env override — budget applies to every complexity and is clamped to HARD_MAX', () => {
    const p = resolveConsultationProfile('SIMPLE', { maxOutputTokens: '99999' });
    expect(p.maxOutputTokens).toBe(HARD_MAX_OUTPUT_TOKENS); // clamped
  });

  it('global env override — reasoning effort applies; an invalid value falls back to the default', () => {
    expect(resolveConsultationProfile('SIMPLE', { reasoningEffort: 'high' }).reasoningEffort).toBe('high');
    expect(resolveConsultationProfile('SIMPLE', { reasoningEffort: 'MEDIUM' }).reasoningEffort).toBe('medium'); // case-insensitive
    expect(resolveConsultationProfile('DEEP', { reasoningEffort: 'bogus' }).reasoningEffort).toBe('medium'); // fallback
    expect(resolveConsultationProfile('SIMPLE', { reasoningEffort: '' }).reasoningEffort).toBe('low'); // empty → default
  });

  it('missing/invalid budget override → per-complexity default (never unbounded)', () => {
    expect(resolveConsultationProfile('DEEP', { maxOutputTokens: null }).maxOutputTokens).toBe(6000);
    expect(resolveConsultationProfile('DEEP', { maxOutputTokens: 'abc' }).maxOutputTokens).toBe(6000);
    expect(resolveConsultationProfile('DEEP', { maxOutputTokens: '-5' }).maxOutputTokens).toBe(6000);
  });
});
