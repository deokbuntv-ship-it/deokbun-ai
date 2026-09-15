// Month-target resolver (Evidence-Decision Sprint §15/§16/§30). Pure. Locks the intent classification +
// (year, month) resolution the grounding layer will feed to the FROZEN calculateWolwoon. No engine math.
import { resolveQuestionMonths } from '@/features/chat/services/questionMonths';

const REF_YEAR = 2026;
const REF_MONTH = 8; // server "now" ≈ 2026-08

describe('resolveQuestionMonths — intent + (year, month) targets', () => {
  it('EXACT explicit — "2027년 2월에 이사 갈 수 있어?"', () => {
    const r = resolveQuestionMonths('2027년 2월에 이사 갈 수 있어?', REF_YEAR, REF_MONTH);
    expect(r.intent).toBe('EXACT_MONTH');
    expect(r.targets).toEqual([{ year: 2027, month: 2 }]);
  });

  it('EXACT relative year — "내년 2월" resolves against the reference year', () => {
    const r = resolveQuestionMonths('내년 2월에 사업 시작하면 어때?', REF_YEAR, REF_MONTH);
    expect(r.intent).toBe('EXACT_MONTH');
    expect(r.targets).toEqual([{ year: 2027, month: 2 }]);
  });

  it('EXACT relative month — "다음 달" rolls over from the reference month', () => {
    expect(resolveQuestionMonths('다음 달 이직하면 어때?', REF_YEAR, REF_MONTH).targets).toEqual([{ year: 2026, month: 9 }]);
    expect(resolveQuestionMonths('다다음 달은 어때?', REF_YEAR, REF_MONTH).targets).toEqual([{ year: 2026, month: 10 }]);
    // year rollover: reference 2026-12 + 1 → 2027-01
    expect(resolveQuestionMonths('다음 달 계약해도 돼?', 2026, 12).targets).toEqual([{ year: 2027, month: 1 }]);
  });

  it('EXACT this-year month — "올해 11월에 계약해도 돼?"', () => {
    const r = resolveQuestionMonths('올해 11월에 계약해도 돼?', REF_YEAR, REF_MONTH);
    expect(r.targets).toEqual([{ year: 2026, month: 11 }]);
  });

  it('BEST_MONTH — "2027년에 이사하기 가장 좋은 달은?" grounds all 12 months', () => {
    const r = resolveQuestionMonths('2027년에 이사하기 가장 좋은 달은 언제야?', REF_YEAR, REF_MONTH);
    expect(r.intent).toBe('BEST_MONTH');
    expect(r.targets).toHaveLength(12);
    expect(r.targets[0]).toEqual({ year: 2027, month: 1 });
    expect(r.targets[11]).toEqual({ year: 2027, month: 12 });
  });

  it('COMPARE_MONTHS — "2027년 2월이 좋아 5월이 좋아?"', () => {
    const r = resolveQuestionMonths('2027년 2월이 좋아 5월이 좋아?', REF_YEAR, REF_MONTH);
    expect(r.intent).toBe('COMPARE_MONTHS');
    expect(r.targets).toEqual([
      { year: 2027, month: 2 },
      { year: 2027, month: 5 },
    ]);
  });

  it('MONTH_RANGE — 상반기 / numeric range', () => {
    expect(resolveQuestionMonths('2027년 상반기 중 언제가 좋아?', REF_YEAR, REF_MONTH)).toMatchObject({
      intent: 'MONTH_RANGE',
    });
    expect(resolveQuestionMonths('2027년 상반기 중 언제가 좋아?', REF_YEAR, REF_MONTH).targets).toHaveLength(6);
    expect(resolveQuestionMonths('2027년 2~6월 중 언제?', REF_YEAR, REF_MONTH).targets).toEqual([
      { year: 2027, month: 2 },
      { year: 2027, month: 3 },
      { year: 2027, month: 4 },
      { year: 2027, month: 5 },
      { year: 2027, month: 6 },
    ]);
    expect(resolveQuestionMonths('2027년 하반기는 어때?', REF_YEAR, REF_MONTH).targets).toHaveLength(6);
  });

  it('NONE — year-level or non-temporal questions carry no month target', () => {
    expect(resolveQuestionMonths('2027년 사업운은 어때?', REF_YEAR, REF_MONTH)).toEqual({ intent: 'NONE', targets: [] });
    expect(resolveQuestionMonths('내 성격은 어때?', REF_YEAR, REF_MONTH)).toEqual({ intent: 'NONE', targets: [] });
    expect(resolveQuestionMonths('', REF_YEAR, REF_MONTH)).toEqual({ intent: 'NONE', targets: [] });
  });

  it('fail-closed — out-of-range years dropped; no reference → relative months unresolved', () => {
    expect(resolveQuestionMonths('2400년 2월은?', REF_YEAR, REF_MONTH).targets).toEqual([]); // > SUPPORTED_YEAR_MAX
    // "다음 달" with no reference month cannot resolve → NONE (never guesses)
    expect(resolveQuestionMonths('다음 달 어때?', null, null)).toEqual({ intent: 'NONE', targets: [] });
  });

  it('caps targets at 12 (cost bound)', () => {
    const r = resolveQuestionMonths('2027년에 매달 흐름 알려줘 언제가 좋아?', REF_YEAR, REF_MONTH);
    expect(r.targets.length).toBeLessThanOrEqual(12);
  });
});
