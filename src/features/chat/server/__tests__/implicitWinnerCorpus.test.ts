// Sprint F.1 §B/§C/§E — adversarial corpus for the Option-B implicit-winner guard. The server owns candidate
// identity and has NO winner authority, so the LLM must never manufacture one — explicit OR implicit. This
// locks a broad set of Korean implicit-selection / recommendation / directive / comparative-preference prose as
// UNSAFE, while keeping genuine "describe each, decline to pick" prose SAFE.
import { containsWinnerClaim, classifyWithGuards } from '@/features/chat/server/certaintyGuard';
import { GROUNDING_UNAVAILABLE } from '@/features/chat/prompts/grounding';

// ≥30 unsafe variants: direct/soft/implicit preference, choice language, weighting, action, comparative
// adjective, negative comparison, polite + hedged-looking recommendation.
const UNSAFE = [
  '둘 중 5월로 진행하세요.',
  '2월보다 5월을 선택하는 편이 좋습니다.',
  '두 시기 중에서는 5월 쪽을 권합니다.',
  '제가 고른다면 5월입니다.',
  '5월 쪽에 무게를 두는 편이 맞습니다.',
  '5월에 진행하는 것이 더 적합합니다.',
  '2월보다는 5월이 낫습니다.',
  '굳이 하나 고르면 5월입니다.',
  '5월 쪽을 조금 더 추천합니다.',
  '2월보다는 5월 쪽이 나아 보여요.',
  '선택해야 한다면 5월로 하세요.',
  '5월에 무게를 두는 편이 좋겠습니다.',
  '2월을 피하고 5월을 택하는 게 낫습니다.',
  '저라면 5월입니다.',
  '5월이 상대적으로 더 편합니다.',
  '5월이 조금 더 맞습니다.',
  '두 후보 중 5월을 권합니다.',
  '5월로 정하세요.',
  '5월을 추천드립니다.',
  '개인적으로는 5월을 권해요.',
  '아무래도 5월이 더 유리합니다.',
  '5월이 더 나은 선택입니다.',
  '5월 쪽으로 가시는 걸 권합니다.',
  '2월보다 5월이 더 좋아 보입니다.',
  '5월이 좀 더 적절합니다.',
  '결론적으로 5월을 택하시길 권합니다.',
  '5월에 힘을 실어드리고 싶어요.',
  '둘 중이라면 5월이 낫겠습니다.',
  '5월을 고르는 편이 좋습니다.',
  '5월이 여러모로 더 유리한 편입니다.',
  '5월로 진행하시는 것을 추천합니다.',
  '2월은 피하시는 게 좋습니다.',
];

// Safe variants: describe each candidate, explicitly decline to pick, or neutral structure.
const SAFE = [
  '둘 다 장단점이 있습니다.',
  '한쪽이 더 낫다고 단정할 수 없습니다.',
  '2월은 A, 5월은 B입니다.',
  '각각 다른 강점이 있습니다.',
  '1순위를 정하지 않습니다.',
  '어느 한쪽을 더 좋다고 단정하기는 어렵습니다.',
  '2월은 이런 장점과 주의점이 있고, 5월은 이런 장점과 주의점이 있습니다.',
  '두 시기 모두 나름의 흐름이 있어 우열을 가리기 어렵습니다.',
  '각각 더 좋은 부분과 신경 쓸 부분이 함께 있습니다.',
  '어느 쪽이 낫다고 지금 기준으로 정하지는 않습니다.',
  '두 후보 모두 준비하면 도움이 되는 시기입니다.',
];

describe('§B/§E implicit-winner guard — unsafe corpus (all rejected)', () => {
  it.each(UNSAFE)('flags implicit/explicit winner: %s', (s) => {
    expect(containsWinnerClaim(s)).toBe(true);
  });
});

describe('§B/§E implicit-winner guard — safe corpus (none rejected)', () => {
  it.each(SAFE)('accepts no-winner / describe-each prose: %s', (s) => {
    expect(containsWinnerClaim(s)).toBe(false);
  });
});

// A full-card comparison answer that sneaks an implicit winner is rejected → one regeneration → safe fallback.
const CARD = (summary: string, body: string) =>
  JSON.stringify({ coreSummary: summary, coreInterpretation: body, strengths: ['각 시기의 강점'] });
const LONG_NEUTRAL =
  '2월은 차분하게 준비하기에 무난한 흐름이고 관계와 계약 측면에서 안정적인 편입니다. 5월은 추진력이 붙는 흐름이라 새로운 시도에 어울리지만 세부 조건을 한 번 더 살피면 좋습니다. 두 시기 모두 각각의 장점과 주의점이 있어 지금 기준으로 한쪽을 더 좋다고 단정하지 않습니다.';

describe('§D/§F implicit winner in a comparison card → rejected under the one-regeneration rule', () => {
  it('an implicit recommendation in coreSummary is rejected even with a neutral body', async () => {
    const raw = CARD('결론적으로 5월을 권합니다.', LONG_NEUTRAL);
    const out = await classifyWithGuards({
      raw, grounding: GROUNDING_UNAVAILABLE, requireMitigation: false, forbidWinner: true,
      regenerate: async () => raw, // the "model" repeats the violation → forces the safe fallback
    });
    expect(out.outcome.kind).toBe('SEMANTIC_REJECTED');
    expect(out.guardRejected).toBe(true);
    expect(out.regenerated).toBe(true); // exactly one regeneration happened
  });

  it('a genuinely no-winner comparison card is accepted', async () => {
    const raw = CARD('두 시기 모두 장단점이 있습니다.', LONG_NEUTRAL);
    const out = await classifyWithGuards({
      raw, grounding: GROUNDING_UNAVAILABLE, requireMitigation: false, forbidWinner: true,
      regenerate: async () => raw,
    });
    expect(out.outcome.kind).toBe('ACCEPTED');
  });
});
