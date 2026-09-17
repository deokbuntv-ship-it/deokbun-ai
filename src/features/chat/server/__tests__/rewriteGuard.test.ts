// 재작성 검사기 — 합성 반례 (2026-09-19). PART 1-5 가 요구한 여섯 가지 + PART 6 레드팀 전에 찾은 구멍을
// **양방향**으로 못 박는다.
//
// 왜 이 테스트가 설계의 근거인가. 과거 레드팀이 뚫은 것은 "모델이 쓴 문장에 새 사실이 있는가" 를 어휘로
// 판정하려던 게이트였다("사업이 곧 크게 성장합니다" 를 못 잡았다). 이 검사기는 질문이 다르다 —
// 모델은 **주어진 문장을 다듬을 뿐**이므로 "원문에서 활용으로 나올 수 없는 낱말" 이라는 기계 판정이 성립한다.
// 아래 반례는 그 판정이 실제로 서는지, 그리고 **통과해야 할 것을 막지 않는지**를 함께 확인한다.
import { derivable, isRewritable, splitSentences, verifyRewrite } from '@/features/chat/server/rewriteGuard';

// 조립기가 실제로 내는 모양의 문장. 손으로 지어낸 것이 아니라 2026-09-18 실측 답변에서 가져왔다.
const S = '지금의 큰 흐름이 원국 월주 천간충을 정면으로 흔듭니다. 올해 흐름에 같은 몫을 두고 겨루는 기운이 들어옵니다.';
const kinds = (src: string, rew: string) => verifyRewrite(src, rew).failures.map((f) => f.kind);

describe('① 낱말 대응 — 새 사실이 들어오면 잡는다', () => {
  it('말투만 바꾼 재작성은 통과한다', () => {
    const r = '지금의 큰 흐름이 원국 월주 천간충을 정면으로 흔들어요. 올해 흐름에 같은 몫을 두고 겨루는 기운이 들어와요.';
    expect(verifyRewrite(S, r)).toEqual({ ok: true, failures: [] });
  });

  it('⚠ 레드팀이 뚫었던 그 공격 — 기술 용어 없는 평범한 사실 주장을 잡는다', () => {
    const r = '지금의 큰 흐름이 원국 월주 천간충을 정면으로 흔들어요. 올해 흐름에 같은 몫을 두고 겨루는 기운이 들어오고 사업이 곧 크게 성장합니다.';
    const v = verifyRewrite(S, r);
    expect(v.ok).toBe(false);
    expect(v.failures.find((f) => f.kind === 'NEW_CONTENT_WORD')?.detail).toMatch(/사업이.*곧.*크게.*성장합니다/);
  });

  it('⚠ 반례 — 조사·어미만 달라진 것은 새 낱말로 세지 않는다', () => {
    const src = '기운이 들어옵니다.';
    expect(verifyRewrite(src, '기운이 들어와요.').ok).toBe(true);
    expect(verifyRewrite(src, '기운은 들어오는 편이에요.').ok).toBe(true);
  });

  it('⚠ 반례 — 합쇼체 → 해요체의 불규칙 활용은 통과한다', () => {
    const pairs: [string, string][] = [
      ['풀립니다.', '풀려요.'], ['어렵습니다.', '어려워요.'], ['나옵니다.', '나와요.'], ['보탭니다.', '보태요.'],
      ['됩니다.', '돼요.'], ['합니다.', '해요.'], ['큽니다.', '커요.'], ['봅니다.', '봐요.'], ['아닙니다.', '아니에요.'],
      ['달라집니다.', '달라져요.'], ['보입니다.', '보여요.'], ['쪽입니다.', '쪽이에요.'], ['것입니다.', '거예요.'],
      ['미루십시오.', '미루세요.'], ['흔듭니다.', '흔들어요.'], ['같습니다.', '같아요.'], ['나옵니다.', '나오거든요.'],
    ];
    for (const [a, b] of pairs) expect({ a, b, ok: verifyRewrite(a, b).ok }).toEqual({ a, b, ok: true });
  });

  it('⚠ 첫 글자가 같은 **다른 낱말**은 잡는다 (첫 판은 첫 음절 받침만 떼어 봐서 전부 통과시켰다)', () => {
    expect(kinds('좋은 흐름입니다.', '조심할 흐름이에요.')).toContain('NEW_CONTENT_WORD'); // 좋 ≠ 조 (받침 ㅎ)
    expect(kinds('돈을 법니다.', '돈을 버려요.')).toContain('NEW_CONTENT_WORD'); // 벌다 → 버리다
    expect(kinds('돈이 늡니다.', '돈이 느려요.')).toContain('NEW_CONTENT_WORD'); // 늘다 → 느리다
    expect(kinds('사업이 흔들립니다.', '사람이 흔들려요.')).toContain('NEW_CONTENT_WORD'); // 사업 → 사람
    expect(kinds('성장이 보입니다.', '성과가 보여요.')).toContain('NEW_CONTENT_WORD'); // 성장 → 성과
    expect(kinds('기회가 나옵니다.', '기회가 나아요.')).toContain('CONTENT_DROPPED'); // 나오다 → 낫다
    expect(kinds('크게 벌이지 않습니다.', '커피를 벌이지 않아요.')).toContain('NEW_CONTENT_WORD');
  });

  it('⚠ 기능어로 빠져나가지 않는다 — 수입·거래 같은 낱말은 의존명사가 아니다', () => {
    expect(kinds('흐름이 보입니다.', '수입 흐름이 보여요.')).toContain('NEW_CONTENT_WORD');
    expect(kinds('흐름이 보입니다.', '거래 흐름이 보여요.')).toContain('NEW_CONTENT_WORD');
  });

  it('⚠ 세기를 더하면 잡는다 — 아주·반드시는 기능어가 아니다', () => {
    expect(kinds('여지는 있습니다.', '여지는 반드시 있어요.')).toContain('NEW_CONTENT_WORD');
    expect(kinds('흐름이 좋습니다.', '흐름이 아주 좋아요.')).toContain('NEW_CONTENT_WORD');
  });
});

describe('① 낱말 대응 — 빠지거나 옮겨지거나 순서가 바뀌면 잡는다 (레드팀 전 강화)', () => {
  it('⚠ 문장 일부 삭제 — 첫 판은 겹침 50% 로 통과시켰다', () => {
    const v = kinds('돈이 들어오지만 나가는 곳도 많습니다.', '돈이 들어와요.');
    expect(v).toContain('CONTENT_DROPPED');
  });

  it('⚠ 시기 낱말 삭제 — "지금은" 을 빼면 늘 그렇다는 말이 된다', () => {
    expect(kinds('지금은 크게 벌일 자리는 아닙니다.', '크게 벌일 자리는 아니에요.')).toContain('CONTENT_DROPPED');
  });

  it('⚠ 문장 사이에서 낱말을 옮기면 잡는다 (첫 판은 전체 집합으로 봐서 못 봤다)', () => {
    const src = '관계는 열려 있습니다. 돈은 막혀 있습니다.';
    const v = kinds(src, '관계는 막혀 있어요. 돈은 열려 있어요.');
    expect(v).toContain('NEW_CONTENT_WORD');
    expect(v).toContain('CONTENT_DROPPED');
  });

  it('⚠ 같은 낱말로 관계를 뒤집으면 순서로 잡는다 (인과 뒤집기)', () => {
    const v = kinds('마찰이 있어서 범위가 좁습니다.', '범위가 좁아서 마찰이 있어요.');
    expect(v).toContain('ORDER_CHANGED');
  });

  it('⚠ 어미 하나로 관계를 바꾸면 잡는다 (조건 → 이유 · 양보 → 나열)', () => {
    // "좁히면 여지가 있다"(조건)가 "좁히니 여지가 있다"(이유 — 이미 좁혔다는 말)가 된다. 낱말·순서는 전부 같다.
    expect(kinds('범위를 좁히면 여지는 있습니다.', '범위를 좁히니 여지는 있어요.')).toContain('RELATION_CHANGED');
    expect(kinds('흐름은 열리지만 조심할 부분이 있습니다.', '흐름은 열리고 조심할 부분이 있어요.')).toContain('RELATION_CHANGED');
  });

  it('⚠ 반례 — 관계가 같은 어미 변화(~며 → ~고 · 조건 유지)는 통과한다', () => {
    expect(verifyRewrite('범위를 좁히면 여지는 있습니다.', '범위를 좁히면 여지는 있어요.').ok).toBe(true);
    expect(verifyRewrite('힘을 받으며 풀립니다.', '힘을 받고 풀려요.').ok).toBe(true);
  });

  it('⚠ 반례 — 순서를 지킨 말투 변경은 통과한다', () => {
    expect(verifyRewrite('마찰이 있어서 범위가 좁습니다.', '마찰이 있어서 범위가 좁아요.').ok).toBe(true);
  });
});

describe('② 극성·양태 보존 — 삭제 공격을 잡는다', () => {
  // 부분집합만으로는 절대 못 잡는 공격이다: 낱말이 줄기만 했는데 뜻이 정반대가 된다.
  it('⚠ 부정어를 지우면 잡는다 (크게 벌이지 마십시오 → 크게 벌이십시오)', () => {
    expect(kinds('지금은 크게 벌이지 마십시오.', '지금은 크게 벌이십시오.')).toContain('NEGATION_CHANGED');
  });

  it('⚠ 추측을 지워 단정으로 만들면 잡는다', () => {
    expect(kinds('마찰이 생길 수 있습니다.', '마찰이 생깁니다.')).toContain('HEDGE_DROPPED');
  });

  it('⚠ 인과 접속을 새로 넣으면 잡는다 — 실측 재작성이 실제로 "그래서" 를 붙였다', () => {
    // output/tone4way/speed-rewrite.json 1회차: "이 두 조건은 함께 걸려 있습니다" → "그래서 이 두 조건은 …"
    expect(kinds('이 두 조건은 함께 걸려 있습니다.', '그래서 이 두 조건은 함께 걸려 있어요.')).toContain('CAUSAL_ADDED');
  });

  it('⚠ 반례 — 추측이 늘어나는 것은 막지 않는다 (더 조심스러워지는 방향)', () => {
    expect(verifyRewrite('마찰이 생길 수 있습니다.', '마찰이 생길 수 있는 편이에요.').ok).toBe(true);
  });

  it('⚠ 반례 — 부정을 그대로 둔 말투 변경은 통과한다', () => {
    expect(verifyRewrite('지금은 크게 벌이지 마십시오.', '지금은 크게 벌이지 마세요.').ok).toBe(true);
  });

  it('⚠ 반례 — "다만" 같은 잇는 말은 더해도 된다', () => {
    expect(verifyRewrite('범위를 좁히면 여지는 있습니다.', '다만 범위를 좁히면 여지는 있어요.').ok).toBe(true);
  });
});

describe('③ 숫자·시기 일치', () => {
  it('⚠ 숫자를 바꾸면 잡는다', () => {
    expect(kinds('2026년 9월에 흐름이 바뀝니다.', '2026년 10월에 흐름이 바뀌어요.')).toContain('NUMBER_CHANGED');
  });

  it('⚠ 없던 시기를 만들어 넣으면 잡는다', () => {
    const v = kinds('흐름이 바뀝니다.', '이번 달 흐름이 바뀌어요.');
    expect(v).toContain('NUMBER_CHANGED');
    expect(v).toContain('NEW_CONTENT_WORD');
  });

  it('⚠ 반례 — 숫자가 그대로면 통과한다', () => {
    expect(verifyRewrite('2026년에 바뀝니다.', '2026년에 바뀌어요.').ok).toBe(true);
  });
});

describe('④ 문장 수 — 사라지거나 합쳐지면 잡는다', () => {
  it('⚠ 문장을 통째로 지우면 잡는다', () => {
    expect(kinds(S, '지금의 큰 흐름이 원국 월주 천간충을 정면으로 흔들어요.')).toContain('SENTENCE_COUNT');
  });

  it('⚠ 두 문장을 하나로 합치면 잡는다', () => {
    expect(kinds(S, '지금의 큰 흐름이 원국 월주 천간충을 흔들고 올해 흐름에 겨루는 기운이 들어와요.')).toContain('SENTENCE_COUNT');
  });
});

describe('재작성 제외 구간 — 두 겹으로 막는다', () => {
  it('⚠ 인과 문장은 제외한다 (순서 검사가 뒤집기를 잡지만, 지시서 §1-2 대로 애초에 들여보내지 않는다)', () => {
    expect(isRewritable('마찰이 있기 때문에 범위를 좁혀야 합니다.')).toBe(false);
    expect(isRewritable('흐름이 겹치므로 확인이 필요합니다.')).toBe(false);
  });

  it('⚠ 행동 지시 문장은 제외한다 (골든 Actionability 축이 액션 줄 수를 센다)', () => {
    expect(isRewritable('이 부분이 실제로 어떤지 먼저 확인하십시오.')).toBe(false);
    expect(isRewritable('범위를 좁혀 보세요.')).toBe(false);
  });

  it('⚠ 사용자 질문을 인용한 문장은 제외한다 — 사용자 글이 "원문 낱말" 이 되면 ① 이 무력해진다', () => {
    expect(isRewritable('"사업이 곧 크게 성장할까요?"에 대해서는 현재 근거만으로 한쪽 방향을 확정하기 어렵습니다.')).toBe(false);
  });

  it('⚠ 반례 — 평범한 서술 문장은 재작성 대상이다', () => {
    expect(isRewritable('지금의 큰 흐름이 원국 월주 천간충을 정면으로 흔듭니다.')).toBe(true);
  });
});

describe('죽지 않는다 — 검사기 때문에 답이 안 나가는 일은 없어야 한다', () => {
  it('빈 입력에도 예외를 던지지 않는다', () => {
    expect(() => verifyRewrite('', '')).not.toThrow();
    expect(verifyRewrite('', '무언가').ok).toBe(false);
    expect(verifyRewrite('무언가', '').ok).toBe(false);
  });

  it('보조 함수가 예상대로 동작한다', () => {
    expect(splitSentences('가. 나. 다.')).toEqual(['가.', '나.', '다.']);
    expect(derivable('들어옵니다', '들어와요')).toBe(true);
    expect(derivable('좋습니다', '조심해요')).toBe(false);
  });
});
