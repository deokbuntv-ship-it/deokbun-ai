// 궁합 server orchestrator E2E (Compatibility V1 §26-§30/§83). Runs the REAL frozen engine for BOTH
// people, the REAL pairwise engine + Decision Engine, and mocks ONLY the single LLM boundary. Proves:
// one LLM call, deterministic tier meta, the pairwise (relationship) prompt, and fail-closed inputs.
import { createHash } from 'crypto';

import type { LLMMessage } from '@/features/chat/types/chatArchitecture';
import type { DigestProvider } from '@/features/interpretation';
import { buildCompatibilityConsultation } from '../buildCompatibilityConsultation';
import type { ServerConsultationDeps, ServerConsultationRequest } from '../serverConsultationTypes';

const digestProvider: DigestProvider = {
  async sha256Utf8(s: string) {
    return createHash('sha256').update(s, 'utf8').digest('hex');
  },
};
const NOW = Math.floor(Date.UTC(2026, 5, 1) / 1000);

const LONG_CORE =
  '두 사람은 일간과 일지의 결이 대체로 잘 맞아 서로 편안함을 느끼기 쉬운 관계입니다. ' +
  '한쪽이 밀어붙일 때 다른 쪽이 받아주는 흐름이 있어 대화가 부드럽게 이어지는 편이고, ' +
  '다만 돈을 쓰는 방식에서는 기준이 달라 미리 맞춰두면 오래 가는 데 도움이 됩니다.';
const STRUCTURED = JSON.stringify({
  coreSummary: '전체적으로 잘 맞는 편이에요.',
  disposition: null,
  coreInterpretation: LONG_CORE,
  strengths: ['대화의 결이 잘 맞음', '서로의 속도를 존중함'],
  cautions: ['돈 쓰는 기준을 미리 맞추기'],
  domainInterpretation: [{ title: '정서 궁합', body: '감정 교류가 자연스러운 편입니다.' }],
  futureFlow: null,
  followUps: ['결혼까지 생각해도 괜찮을까요?', '돈 문제는 어떻게 맞추면 좋을까요?', '오래 만나려면 무엇을 조심해야 하나요?'],
});

const birth = (over: Record<string, unknown> = {}) => ({
  displayName: '사람', gender: 'female', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1992', birthMonth: '5', birthDay: '20',
  birthTimeAccuracy: 'exact', birthHour: '9', birthMinute: '30',
  approximateTimePeriod: null, birthPlace: '서울', ...over,
});

const baseRequest = (over: Partial<ServerConsultationRequest> = {}): ServerConsultationRequest => ({
  birthInput: birth({ displayName: '조세영', gender: 'female' }) as never,
  subjectLabel: '조세영',
  partnerBirthInput: birth({ displayName: '김민준', gender: 'male', birthYear: '1990', birthMonth: '11', birthDay: '3' }) as never,
  partnerLabel: '김민준',
  consultationMode: 'compatibility',
  question: '우리 궁합 좋아?',
  ...over,
});

const makeDeps = (): { deps: ServerConsultationDeps; calls: () => number; captured: () => LLMMessage[] } => {
  let count = 0;
  let cap: LLMMessage[] = [];
  const deps: ServerConsultationDeps = {
    digestProvider,
    nowEpochSeconds: NOW,
    callLLM: async (messages: LLMMessage[]) => {
      count += 1;
      cap = messages;
      return STRUCTURED;
    },
  };
  return { deps, calls: () => count, captured: () => cap };
};

describe('buildCompatibilityConsultation — one LLM call, deterministic tier, pairwise prompt', () => {
  it('returns a structured pair answer + deterministic compatibility tier, with exactly ONE LLM call', async () => {
    const { deps, calls } = makeDeps();
    const r = await buildCompatibilityConsultation(baseRequest(), deps);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(calls()).toBe(1); // exactly one LLM call (§28)
    expect(r.structuredResult).toBeDefined();
    expect(r.groundingMeta.mode).toBe('compatibility');
    expect(r.compatibility).toBeDefined();
    expect(['VERY_GOOD', 'GOOD', 'NEEDS_CARE', 'CHALLENGING']).toContain(r.compatibility!.overall);
    expect(r.compatibility!.dimensions.map((d) => d.key)).toEqual(['BOND', 'FRICTION', 'ELEMENT']);
    expect(r.compatibility!.selfLabel).toBe('조세영');
    expect(r.compatibility!.targetLabel).toBe('김민준');
  });

  it('the prompt is a PAIRWISE relationship prompt (두 사람 + 궁합 grounding + compatibility directive)', async () => {
    const { deps, captured } = makeDeps();
    await buildCompatibilityConsultation(baseRequest(), deps);
    const system = captured().filter((m) => m.role === 'system').map((m) => m.content).join('\n');
    expect(system).toContain('궁합(두 사람)');
    expect(system).toContain('본인');
    expect(system).toContain('상대방');
    expect(system).toContain('일주 궁합'); // pairwise grounding reached the prompt
    expect(system).toContain('두 사람의 "궁합"'); // compatibility answer-plan directive
    // the last message is the user's question
    const last = captured()[captured().length - 1];
    expect(last.role).toBe('user');
    expect(last.content).toBe('우리 궁합 좋아?');
  });

  it('the deterministic tier is stable across identical requests (no LLM contribution to the score)', async () => {
    const a = await buildCompatibilityConsultation(baseRequest(), makeDeps().deps);
    const b = await buildCompatibilityConsultation(baseRequest(), makeDeps().deps);
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) return;
    expect(a.compatibility!.overall).toBe(b.compatibility!.overall);
    expect(a.compatibility!.dimensions).toEqual(b.compatibility!.dimensions);
  });

  it('fail-closed: missing partner birth → INVALID_INPUT (never a one-sided pair answer)', async () => {
    const { deps } = makeDeps();
    const r = await buildCompatibilityConsultation(baseRequest({ partnerBirthInput: null }), deps);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.reason).toBe('INVALID_INPUT');
  });

  it('empty question → INVALID_INPUT', async () => {
    const { deps } = makeDeps();
    const r = await buildCompatibilityConsultation(baseRequest({ question: '   ' }), deps);
    expect(r.ok).toBe(false);
  });
});
