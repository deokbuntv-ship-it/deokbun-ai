// 게이트 발화 요약 — 관측 코드 자체의 계약.
//
// 이 변환이 조용히 틀리면 우리는 "발생 0건" 을 다시 보게 되고, 그게 정확히 이번에 고친 문제다.
// 그러니 관측 코드에도 테스트가 붙어야 한다.
import { gateFiringSummary, redactDiag, SAFE_DIAG_KEYS } from '@/features/chat/server/edgeDiagnostics';

describe('gateFiringSummary — 무엇을 기록하고 무엇을 기록하지 않는가', () => {
  it('정상 응답은 null — 아무 일도 없었으면 행을 만들지 않는다', () => {
    expect(gateFiringSummary({ outputClassification: 'ACCEPTED' })).toBeNull();
    expect(gateFiringSummary(null)).toBeNull();
    expect(gateFiringSummary(undefined)).toBeNull();
  });

  it('⚠ ACCEPTED 인데 문장이 폐기된 경우를 잡는다 — 이것이 원래 안 보이던 케이스다', () => {
    const s = gateFiringSummary({
      outputClassification: 'ACCEPTED',
      groundedFallback: true,
      groundedViolations: ['UNSUPPORTED_TECHNICAL_ENTITY'],
      groundedViolationCount: 3,
      groundedGateUnit: 'section',
    });
    expect(s).toEqual({
      v: 1,
      classification: 'ACCEPTED',
      substituted: 'GROUNDED_COMPOSITION',
      unit: 'section',
      count: 3,
      rules: ['UNSUPPORTED_TECHNICAL_ENTITY'],
    });
  });

  it('답변 전체가 폐기되면 단위가 answer 다', () => {
    const s = gateFiringSummary({
      outputClassification: 'STRUCTURAL_FALLBACK',
      groundedFallback: true,
      groundedViolations: ['UNSUPPORTED_TEMPORAL_CLAIM'],
      groundedViolationCount: 1,
      groundedGateUnit: 'answer',
    });
    expect(s?.unit).toBe('answer');
    expect(s?.substituted).toBe('GROUNDED_COMPOSITION');
  });

  it('SEMANTIC_REJECTED 는 게이트 카테고리가 없어도 기록된다', () => {
    const s = gateFiringSummary({ outputClassification: 'SEMANTIC_REJECTED' });
    expect(s).toEqual({
      v: 1,
      classification: 'SEMANTIC_REJECTED',
      substituted: 'SEMANTIC_REJECTION_MESSAGE',
      unit: 'answer',
      count: 0,
      rules: [],
    });
  });

  it('안전 라우트도 기록된다 — 세는 것이 목적인 대표적 사건이다', () => {
    const s = gateFiringSummary({ outputClassification: 'SAFETY_ROUTED', safetyRoute: 'SELF_HARM' });
    expect(s?.safetyRoute).toBe('SELF_HARM');
    expect(s?.classification).toBe('SAFETY_ROUTED');
  });

  it('개수를 못 받으면 최소한 카테고리 수만큼은 났다고 본다', () => {
    const s = gateFiringSummary({
      outputClassification: 'ACCEPTED',
      groundedFallback: true,
      groundedViolations: ['A', 'B'],
    });
    expect(s?.count).toBe(2);
  });

  it('LLM 부재만으로는 게이트 행을 만들지 않는다 — 그것은 상류 장애이고 error_code 가 센다', () => {
    expect(gateFiringSummary({ outputClassification: 'ACCEPTED', llmUnavailable: true })).toBeNull();
  });

  it('⚠ 폐기된 본문이나 매칭 토큰이 들어갈 자리가 없다', () => {
    const s = gateFiringSummary({
      outputClassification: 'ACCEPTED',
      groundedFallback: true,
      groundedViolations: ['UNSUPPORTED_TECHNICAL_ENTITY'],
      groundedViolationCount: 1,
      groundedGateUnit: 'section',
      // 호출자가 실수로 본문을 넣어도 타입 밖이라 결과에 실리지 않는다.
      ...({ text: '올해 관록궁이 열립니다', token: '관록궁' } as Record<string, unknown>),
    });
    const json = JSON.stringify(s);
    expect(json).not.toContain('관록궁');
    expect(json).not.toContain('올해');
    expect(Object.keys(s ?? {}).sort()).toEqual(['classification', 'count', 'rules', 'substituted', 'unit', 'v']);
  });
});

describe('redactDiag — 게이트 키가 이제 통과한다', () => {
  it('⚠ 전에는 이 네 키가 allowlist 에 없어 통째로 지워졌다', () => {
    for (const k of ['groundedFallback', 'groundedViolations', 'groundedViolationCount', 'groundedGateUnit', 'safetyRoute']) {
      expect(SAFE_DIAG_KEYS).toContain(k);
    }
  });

  it('허용 목록 밖은 여전히 지워진다 — allowlist 는 allowlist 로 남는다', () => {
    const out = redactDiag({
      requestId: 'r1',
      groundedFallback: true,
      prompt: '비밀 프롬프트',
      question: '사용자 질문',
      birthInput: { y: 1990 },
    });
    expect(out).toEqual({ requestId: 'r1', groundedFallback: true });
  });
});
