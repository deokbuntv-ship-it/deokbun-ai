// Sprint D §D5/§D6 — deterministic compatibility relationship-safety + negative-tier constructive-direction
// enforcement. Reuses the shared guard architecture (generate → validate → one regeneration → fallback).
import {
  classifyWithGuards,
  containsCompatibilityHarm,
  hasConstructiveDirection,
} from '@/features/chat/server/certaintyGuard';
import { GROUNDING_UNAVAILABLE } from '@/features/chat/prompts/grounding';

describe('containsCompatibilityHarm — the 6 relationship harms (hedge-aware)', () => {
  it('flags breakup/divorce command or certainty, mind-reading, condemnation, fate, other-behavior', () => {
    for (const bad of [
      '헤어지세요.',
      '무조건 이혼하는 게 답입니다.',
      '결국 반드시 헤어집니다.',
      '상대는 당신을 사랑하지 않습니다.',
      '상대는 속으로 다른 사람을 생각합니다.',
      '이 사람은 나쁜 사람입니다.',
      '천생연분이 확실합니다.',
      '두 사람은 절대 안 맞습니다.',
      '상대는 반드시 바람을 피웁니다.',
    ]) {
      expect(containsCompatibilityHarm(bad)).toBe(true);
    }
  });

  it('does NOT flag hedged / descriptive / constructive relationship language', () => {
    for (const ok of [
      '헤어지라고 단정할 수는 없습니다.',
      '상대의 속마음은 알 수 없습니다.',
      '두 사람은 대화 방식이 달라 조율이 필요한 관계입니다.',
      '갈등이 생길 수 있으니 서로의 방식을 미리 맞추는 게 좋습니다.',
      '관계의 결이 잘 맞는 편입니다.',
    ]) {
      expect(containsCompatibilityHarm(ok)).toBe(false);
    }
  });
});

describe('hasConstructiveDirection', () => {
  it('true for management/coping direction, false for fear-only', () => {
    expect(hasConstructiveDirection('서로의 방식을 맞추고 대화를 늘리면 좋습니다.')).toBe(true);
    expect(hasConstructiveDirection('두 사람 사이 긴장이 큽니다.')).toBe(false);
  });
});

const LONG_OK = '두 사람은 서로를 이해하려는 노력이 필요한 관계이며, 표현 방식이 달라 대화로 조율하는 것이 중요합니다. 급하게 판단하기보다 시간을 두고 맞춰가면 관계가 한결 안정될 수 있습니다. 각자의 강점을 인정하고 작은 갈등은 대화로 풀어가면 신뢰가 쌓입니다.';
const LONG_FEAR = '두 사람 사이에는 마찰이 자주 나타나는 흐름이 보이며, 서로의 기질 차이가 큰 편이라 부딪히는 지점이 여럿 관찰됩니다. 이런 차이는 관계에서 긴장으로 이어지기 쉬운 구조이고, 특히 중요한 결정을 앞두고 의견 차이가 두드러질 수 있습니다.';
const card = (summary: string, body: string) => JSON.stringify({ coreSummary: summary, coreInterpretation: body, strengths: ['서로에 대한 관심'] });

describe('classifyWithGuards — compatibility safety (§D5)', () => {
  it('a breakup command is rejected → one regeneration → persists → safe fallback', async () => {
    const raw = card('관계를 정리하는 게 좋겠습니다.', `헤어지세요. ${LONG_OK}`);
    const out = await classifyWithGuards({ raw, grounding: GROUNDING_UNAVAILABLE, requireMitigation: false, forbidCompatibilityHarm: true, regenerate: async () => raw });
    expect(out.outcome.kind).toBe('SEMANTIC_REJECTED');
    expect(out.guardRejected).toBe(true);
  });

  it('mind-reading the other person is rejected', async () => {
    const raw = card('상대의 마음이 떠났습니다.', `상대는 당신을 사랑하지 않습니다. ${LONG_OK}`);
    const out = await classifyWithGuards({ raw, grounding: GROUNDING_UNAVAILABLE, requireMitigation: false, forbidCompatibilityHarm: true, regenerate: async () => raw });
    expect(out.outcome.kind).toBe('SEMANTIC_REJECTED');
  });

  it('a safe descriptive relationship answer is accepted', async () => {
    const raw = card('조율이 필요한 관계입니다.', LONG_OK);
    const out = await classifyWithGuards({ raw, grounding: GROUNDING_UNAVAILABLE, requireMitigation: false, forbidCompatibilityHarm: true, regenerate: async () => raw });
    expect(out.outcome.kind).toBe('ACCEPTED');
  });
});

describe('classifyWithGuards — negative-tier constructive direction (§D6)', () => {
  it('a poor-tier fear-only answer (no management direction) is rejected', async () => {
    const raw = card('마찰이 많은 관계입니다.', LONG_FEAR);
    const out = await classifyWithGuards({ raw, grounding: GROUNDING_UNAVAILABLE, requireMitigation: false, forbidCompatibilityHarm: true, requireConstructive: true, regenerate: async () => raw });
    expect(out.outcome.kind).toBe('SEMANTIC_REJECTED');
  });

  it('a poor-tier answer WITH a constructive direction is accepted', async () => {
    const raw = card('마찰은 있지만 관리할 수 있습니다.', LONG_OK); // LONG_OK carries 대화/조율/맞춰
    const out = await classifyWithGuards({ raw, grounding: GROUNDING_UNAVAILABLE, requireMitigation: false, forbidCompatibilityHarm: true, requireConstructive: true, regenerate: async () => raw });
    expect(out.outcome.kind).toBe('ACCEPTED');
  });
});
