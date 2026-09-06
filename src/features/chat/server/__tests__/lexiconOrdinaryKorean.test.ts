// KNOWN_RISKS H1 — the technical-lexicon gate must not fire on ordinary Korean.
//
// A hit does not strip a word: it discards the ENTIRE LLM answer and substitutes the server's
// deterministic composition. So a false positive costs a whole answer, and this file locks BOTH
// directions — ordinary Korean passes, real jargon still gets caught.
//
// Measured basis (2026-09-05, 314 delivered B84 answers): `세운` was the only token that actually
// caused a fallback, in exactly two answers. Those two sentences are reproduced verbatim below —
// if either ever starts failing again, the guard has been broken.
import { technicalTokensIn, untraceableFacts } from '../groundedNarrative';
import type { GroundedNarrativePlan } from '../groundedNarrative';

// An empty corpus is the harshest case: every hit becomes a violation, so nothing is masked by
// the corpus-membership escape hatch.
const emptyPlan = { groundedCorpus: '' } as unknown as GroundedNarrativePlan;
const flags = (s: string) => untraceableFacts(s, emptyPlan);

describe('ordinary Korean must not discard an answer', () => {
  // The two real cases from the audit, verbatim.
  it('the two sentences that actually caused a fallback now pass', () => {
    expect(flags("이 정체를 '시스템 점검'(업무·관계·생활)으로 접근할 경우 우선순위를 세운다면 무엇을 먼저 점검하고 싶으신가요?")).toEqual([]);
    expect(flags('기대를 낮추고 상대 반응에 대한 준비(경계선·대화의 목표)를 세운 뒤 접근하는 편이 좋습니다.')).toEqual([]);
  });

  it('세우다 in its other everyday shapes', () => {
    for (const s of ['미리 세운 계획을 지켜보세요', '앞세운 대화보다 듣는 편이 낫습니다', '먼저 세운 기준이 있나요']) {
      expect(flags(s)).toEqual([]);
    }
  });

  it('관성 = 慣性, 비겁하다, 식상하다, 상관관계, 정재계', () => {
    for (const s of [
      '관성적으로 하던 일을 멈춰보세요', '기존의 관성대로 가지 마세요',
      '비겁한 선택은 피하세요', '식상한 방식이 반복됩니다',
      '상관없는 이야기입니다', '상관관계가 약합니다', '상관성이 낮습니다',
      '정재계 인사를 만납니다',
    ]) expect(flags(s)).toEqual([]);
  });

  it('통근 = 通勤, 일주일', () => {
    for (const s of ['통근 시간이 깁니다', '통근길이 멀어요', '통근버스를 탑니다', '일주일 정도 지켜보세요', '전국을 일주하고 싶어요']) {
      expect(flags(s)).toEqual([]);
    }
  });
});

describe('real jargon must still be caught', () => {
  it('catches the terms the gate exists for', () => {
    for (const s of [
      '일간이 약합니다', '대운이 바뀝니다', '세운이 충을 만듭니다',
      '올해 세운은 관성을 강하게 씁니다', '이 세운은 재성을 건드립니다', '그 세운에서 편관이 강합니다',
      '월지에 편관이 있습니다', '원국에 통근이 없습니다', '일주가 강합니다',
      '식상이 발달했습니다', '비겁이 많습니다', '상관이 관을 칩니다',
      '득령했습니다', '투간되었습니다', '정재가 뚜렷합니다',
      '명궁에 화기가 붙었습니다', '휴문이 열립니다',
    ]) expect(flags(s).length).toBeGreaterThan(0);
  });

  // The guard keys on the preceding particle, so a technical 세운 introduced by a demonstrative or
  // a genitive must survive it. This is the false-negative direction of the same rule.
  it('세운 preceded by 이/그/의/과 is still technical', () => {
    for (const s of ['이 세운은 관을 칩니다', '그 세운의 흐름입니다', '올해의 세운이 강합니다', '대운과 세운이 겹칩니다']) {
      expect(flags(s)).toContain('세운');
    }
  });

  it('the corpus escape hatch still works — a grounded token is not a violation', () => {
    const plan = { groundedCorpus: '세운 대운 일간' } as unknown as GroundedNarrativePlan;
    expect(untraceableFacts('이 세운은 일간을 돕습니다', plan)).toEqual([]);
  });
});

describe('technicalTokensIn shares the same lexicon', () => {
  it('reports jargon and stays quiet on ordinary Korean', () => {
    expect(technicalTokensIn('이 세운은 편관을 만납니다')).toEqual(expect.arrayContaining(['세운', '편관']));
    expect(technicalTokensIn('미리 세운 계획')).toEqual([]);
  });
});
