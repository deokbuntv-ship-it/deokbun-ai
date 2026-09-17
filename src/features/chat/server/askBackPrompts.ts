// 되묻기 생성기 — **서버가 만든다** (2026-09-19, PART 2-4).
//
// 왜 모델에게 맡기지 않는가. 2026-09-18 실측: E안 2차에서 검사 실패 17건 중 **12건(71%)이 되묻기**였다.
// 길이·말투·축·금지표현은 지시만으로 거의 지켜졌는데, "사람을 구체적으로 묻는 짧은 되묻기" 는
// **아홉 번에 한 번꼴**로만 나왔다. 모델은 자꾸 "역할 정리가 필요한 상황인가요?" 같은 사무적 항목
// 확인으로 만든다. 아홉 번 중 한 번만 되는 일을 모델에게 맡길 이유가 없다.
//
// 그래서 문구를 **고정 표**에 두고 서버가 고른다. 고정 표는 검사기를 언제나 통과하고(사람·때를 묻고,
// 32자 이하, "~인가요?" 를 쓰지 않는다), 같은 입력이면 같은 것이 나온다.

/** 되묻기를 고를 때 보는 것 — 질문이 어느 영역이었나. 조립기가 이미 아는 값이다. */
export type AskBackDomain = 'WORK' | 'RELATION' | 'MONEY' | 'HEALTH' | 'MOVE' | 'GENERAL';

export type AskBackInput = {
  domain: AskBackDomain;
  /**
   * 직전 상담에서 쓴 되묻기. 같은 것이 연속으로 나오지 않게 피한다.
   * 없으면(첫 상담) null.
   */
  previous?: string | null;
  /**
   * 고르기의 씨앗. **대화 id 처럼 서버가 이미 가진 값**을 넣는다 — 난수를 쓰지 않으므로
   * 같은 대화·같은 영역이면 언제나 같은 되묻기가 나온다.
   */
  seed?: string | null;
};

/**
 * 영역별 되묻기 후보. 전부 **사람·때·일을 구체적으로** 묻는다.
 * ⚠ 새 문구를 넣을 때는 반드시 `askBackPrompts.test.ts` 의 "모든 후보가 검사기를 통과한다" 를 돌릴 것.
 */
const POOL: Record<AskBackDomain, readonly string[]> = {
  WORK: [
    '혹시 요즘 누가 자꾸 걸리세요?',
    '요즘 어떤 일이 제일 손에 안 잡히세요?',
    '지금 맡은 일 중에 무엇이 제일 무거우세요?',
    '최근에 자리나 맡은 몫이 바뀌셨어요?',
  ],
  RELATION: [
    '혹시 요즘 누가 제일 신경 쓰이세요?',
    '그 사람과는 주로 어디서 부딪히세요?',
    '요즘 누구와 이야기가 제일 안 통하세요?',
    '언제부터 그렇게 느끼셨어요?',
  ],
  MONEY: [
    '요즘 어디에 돈이 제일 많이 나가세요?',
    '지금 걸려 있는 돈 이야기가 있으세요?',
    '무엇을 정하려다 멈춰 계세요?',
  ],
  HEALTH: [
    '요즘 어디가 제일 힘드세요?',
    '언제부터 그러셨어요?',
    '요즘 쉬는 시간은 좀 내세요?',
  ],
  MOVE: [
    '어디로 옮기는 걸 보고 계세요?',
    '언제쯤으로 생각하고 계세요?',
    '누구랑 같이 정하는 일이세요?',
  ],
  GENERAL: [
    '요즘 무슨 일이 제일 신경 쓰이세요?',
    '지금 제일 마음에 걸리는 게 뭐예요?',
    '어떤 쪽부터 같이 볼까요?',
  ],
};

/** 씨앗 문자열 → 숫자. 난수가 아니라 **같은 입력이면 같은 값**을 주는 해시다. */
function seedIndex(seed: string | null | undefined, size: number): number {
  if (size <= 0) return 0;
  const s = seed ?? '';
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) % 1_000_003;
  return h % size;
}

/**
 * 되묻기 하나를 고른다. 언제나 값을 돌려준다 — 되묻기가 없는 답변은 이 설계에서 실패이기 때문.
 *
 * · 같은 대화(같은 씨앗)·같은 영역이면 같은 문구
 * · 직전에 쓴 문구는 피한다. 후보가 하나뿐이면 어쩔 수 없이 같은 것이 나온다(그 경우 문구를 늘려야 한다)
 */
export function pickAskBack(input: AskBackInput): string {
  const pool = POOL[input.domain] ?? POOL.GENERAL;
  const start = seedIndex(input.seed, pool.length);
  for (let i = 0; i < pool.length; i += 1) {
    const candidate = pool[(start + i) % pool.length];
    if (candidate !== input.previous) return candidate;
  }
  return pool[start];
}

/** 표 전체 — 테스트가 "모든 후보가 검사기를 통과하는지" 볼 때 쓴다. */
export function allAskBacks(): readonly string[] {
  return Object.values(POOL).flat();
}
