// Server trust boundary — the runtime-neutral orchestrator that the Edge runs, verified under Node.
// Only the outbound LLM call is mocked (callLLM); grounding + prompt + validation are the REAL engines.
// These prove the security-critical property: the client is authoritative for nothing deterministic.
import { createHash } from 'crypto';

import { buildServerConsultation } from '@/features/chat/server';
import type {
  ServerConsultationDeps,
  ServerConsultationRequest,
  TrustedBirthResolution,
} from '@/features/chat/server';
import type { BirthInfoDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import type { LLMMessage } from '@/features/chat/types/chatArchitecture';
import { clearQimenCache } from '@/features/qimen';
import { clearZiweiCache } from '@/features/ziwei';

const digestProvider: DigestProvider = {
  async sha256Utf8(s: string) { return createHash('sha256').update(s, 'utf8').digest('hex'); },
};
// KST 2024-01-15 10:00 (小寒 — provider-supported) as the SERVER receipt instant.
const SERVER_NOW = Math.floor(Date.UTC(2024, 0, 15, 1, 0, 0) / 1000);

const birth: BirthInfoDraft = {
  displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1990', birthMonth: '8', birthDay: '15', birthTimeAccuracy: 'exact', birthHour: '14',
  birthMinute: '0', approximateTimePeriod: null, birthPlace: '서울',
};

// A valid structured answer the LLM "returns" — grounded, no violations. Carries a caution so it satisfies
// the mitigation guard when the birth-derived server polarity is CAUTION (Sprint C §7) — a valid answer for
// a cautionary flow always includes a practical direction.
const GOOD_ANSWER = JSON.stringify({
  coreSummary: '차분한 흐름입니다.',
  coreInterpretation:
    '사주로 보면 일간을 중심으로 차분함과 추진력이 균형을 이루는 구조이며 월지의 기운과 십신 배치가 이를 뒷받침합니다. ' +
    '꾸준히 쌓아 올리면 좋고 조급하게 서두르면 흐름이 흐트러지기 쉬우니 속도를 조절하는 편이 좋습니다.',
  strengths: ['끈기'],
  cautions: ['조급하게 서두르기보다 속도를 조절하는 편이 좋습니다.'],
  followUps: ['어떤 방식이 맞을까요?'],
});

// A capturing mock LLM: records the exact server-built messages sent outward.
function capturingDeps(answer: string, over: Partial<ServerConsultationDeps> = {}) {
  const sent: LLMMessage[][] = [];
  const deps: ServerConsultationDeps = {
    digestProvider,
    nowEpochSeconds: SERVER_NOW,
    async callLLM(messages) { sent.push(messages); return answer; },
    ...over,
  };
  return { deps, sent };
}

const baseRequest = (over: Partial<ServerConsultationRequest> = {}): ServerConsultationRequest => ({
  birthInput: birth,
  question: '제 타고난 성격은 어떤가요?',
  ...over,
});

beforeEach(() => { clearZiweiCache(); clearQimenCache(); });

describe('buildServerConsultation — server owns the deterministic grounding', () => {
  it('server recomputes grounding from birth INPUT and sends it to the LLM (client sends no facts)', async () => {
    const { deps, sent } = capturingDeps(GOOD_ANSWER);
    const r = await buildServerConsultation(baseRequest(), deps);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.groundingMeta.grounded).toBe(true);
    expect(r.groundingMeta.engines.myungri).toBe('available');
    expect(r.groundingMeta.questionTimeSource).toBe('SERVER_RECEIPT_TIME');
    // The system grounding block was constructed server-side and reached the outbound request.
    const system = sent[0].filter((m) => m.role === 'system').map((m) => m.content).join('\n');
    expect(system).toContain('계산 근거'); // the deterministic grounding section
    expect(r.structuredResult).toBeDefined();
  });

  it('empty question → INVALID_INPUT; unusable birth → INVALID_INPUT (fail closed)', async () => {
    const { deps } = capturingDeps(GOOD_ANSWER);
    expect((await buildServerConsultation(baseRequest({ question: '   ' }), deps)).ok).toBe(false);
    const bad = baseRequest({ birthInput: { ...birth, birthYear: '' } });
    const r = await buildServerConsultation(bad, deps);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('INVALID_INPUT');
  });

  it('LLM throw / empty → LLM_FAILED (no partial trusted output)', async () => {
    const thrower: Partial<ServerConsultationDeps> = { async callLLM() { throw new Error('network'); } };
    const r1 = await buildServerConsultation(baseRequest(), capturingDeps(GOOD_ANSWER, thrower).deps);
    expect(r1.ok).toBe(false);
    const empty = await buildServerConsultation(baseRequest(), capturingDeps('   ').deps);
    expect(empty.ok).toBe(false);
  });
});

describe('buildServerConsultation — question time is SERVER-owned (§10)', () => {
  it('a forged client questionTime cannot change the Qimen question instant', async () => {
    // Timing question so Qimen activates. Client tries to force a different instant via requestMetadata.
    const q = '지금 이 계약을 진행해도 될까요?';
    const forged = baseRequest({ question: q, requestMetadata: { clientQuestionTimeEpoch: 9999999999 } });
    const honest = baseRequest({ question: q });
    const a = await buildServerConsultation(forged, capturingDeps(GOOD_ANSWER).deps);
    const b = await buildServerConsultation(honest, capturingDeps(GOOD_ANSWER).deps);
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) return;
    // Same SERVER_NOW → identical Qimen availability regardless of the forged client time.
    expect(a.groundingMeta.engines.qimen).toBe(b.groundingMeta.engines.qimen);
    expect(a.groundingMeta.engines.qimen).toBe('available'); // timing question → server-activated
    expect(a.groundingMeta.questionTimeSource).toBe('SERVER_RECEIPT_TIME');
  });

  it('natal question → Qimen not_applicable (server activation, not client-declared)', async () => {
    const r = await buildServerConsultation(baseRequest({ question: '제 타고난 강점은?' }), capturingDeps(GOOD_ANSWER).deps);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.groundingMeta.engines.qimen).toBe('not_applicable');
  });
});

describe('buildServerConsultation — §24 server E2E degraded modes', () => {
  it('C: a timing question inside the old 小满 outage now reaches the server with a real board (V3 §25)', async () => {
    // KST 2026-06-01 10:00 → 小满. On qimen-dunjia@2.1.0 the provider threw here and the server fell back to
    // a degraded consultation for ~32 days a year; this case used to assert that degradation. After the 3.1.0
    // name-normalisation fix the server must serve a full three-engine answer for the same instant.
    const now = Math.floor(Date.UTC(2026, 5, 1, 1, 0, 0) / 1000);
    const { deps } = capturingDeps(GOOD_ANSWER, { nowEpochSeconds: now });
    const r = await buildServerConsultation(baseRequest({ question: '지금 이 계약을 진행해도 될까요?' }), deps);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.groundingMeta.grounded).toBe(true);
    expect(r.groundingMeta.engines.myungri).toBe('available');
    expect(r.groundingMeta.engines.qimen).toBe('available');
  });

  it('E: invalid birth input → INVALID_INPUT (no grounding, no LLM call)', async () => {
    const { deps, sent } = capturingDeps(GOOD_ANSWER);
    const r = await buildServerConsultation(baseRequest({ birthInput: { birthYear: '' } as never }), deps);
    expect(r.ok).toBe(false);
    expect(sent).toHaveLength(0); // never reached the LLM
  });

  it('L: natal → timing → natal, each a fresh server request → fresh grounding + question time', async () => {
    // Three independent HTTP-style calls, each with its OWN server receipt instant (all 小寒-supported).
    const t1 = Math.floor(Date.UTC(2024, 0, 15, 1, 0, 0) / 1000);
    const t2 = Math.floor(Date.UTC(2024, 0, 15, 5, 0, 0) / 1000);
    const t3 = Math.floor(Date.UTC(2024, 0, 16, 2, 0, 0) / 1000);
    const q1 = await buildServerConsultation(baseRequest({ question: '제 타고난 성격은?' }), capturingDeps(GOOD_ANSWER, { nowEpochSeconds: t1 }).deps);
    const q2 = await buildServerConsultation(baseRequest({ question: '지금 이 계약을 진행해도 될까요?' }), capturingDeps(GOOD_ANSWER, { nowEpochSeconds: t2 }).deps);
    const q3 = await buildServerConsultation(baseRequest({ question: '그럼 제 타고난 강점은?' }), capturingDeps(GOOD_ANSWER, { nowEpochSeconds: t3 }).deps);
    expect(q1.ok && q2.ok && q3.ok).toBe(true);
    if (!q1.ok || !q2.ok || !q3.ok) return;
    expect(q1.groundingMeta.engines.qimen).toBe('not_applicable'); // natal
    expect(q2.groundingMeta.engines.qimen).toBe('available'); // timing → server-activated at its own instant
    expect(q3.groundingMeta.engines.qimen).toBe('not_applicable'); // back to natal, no stale activation leak
  });
});

// V5 ROOT CAUSE 2 — the grounded ACTION source must actually reach the reader through the real path, not
// only exist as a module. Before this, procedure appeared only when the model volunteered it in prose.
//
// The section can be composed by either path: the grounded FALLBACK renders its own into domainInterpretation,
// and an ACCEPTED answer gets the server-materialized GroundedActionPlan. What the product guarantees is that
// the delivered answer carries EXACTLY ONE of them — never none, never two.
describe('V5 — the delivered answer carries exactly one action section', () => {
  const ACTION_TITLES = [
    '이렇게 움직이시면 됩니다', '어느 쪽을 먼저 보시면 됩니다', '시점을 이렇게 보시면 됩니다',
    '이렇게 이해하시면 됩니다', '이 결을 이렇게 쓰시면 됩니다',
  ];

  // No technical vocabulary, so the grounded gate accepts it and the ACCEPTED path composes the answer.
  const PLAIN_ANSWER = JSON.stringify({
    coreSummary: '차분한 흐름입니다.',
    coreInterpretation: '차분함과 추진력이 함께 있는 결이라, 한번 잡은 일을 오래 끌고 가는 쪽에서 결과가 붙습니다. '
      + '다만 조급하게 서두르면 흐름이 흐트러지기 쉬우니, 속도를 조절하면서 되돌릴 수 있는 범위부터 차근히 넓혀 가시는 편이 좋습니다. '
      + '지금은 크게 방향을 틀기보다 지금 하고 계신 일을 유지하시는 쪽이 안정적입니다.',
    strengths: ['한번 잡은 일을 오래 끌고 갑니다.'],
    cautions: ['조급하게 서두르기보다 속도를 조절하는 편이 좋습니다.'],
    followUps: ['어떤 방식이 맞을까요?'],
  });

  const deliveredSections = async (answer: string) => {
    const { deps } = capturingDeps(answer);
    const r = await buildServerConsultation(baseRequest(), deps);
    expect(r.ok).toBe(true);
    if (!r.ok || !r.structuredResult) throw new Error('no result');
    const { buildUserVisibleAnswer } = await import('@/features/chat/presentation/userVisibleAnswer');
    return { visible: buildUserVisibleAnswer(r.structuredResult), fallback: r.diagnostics.groundedFallback === true };
  };

  it('an ACCEPTED answer receives the server-materialized grounded action section', async () => {
    const { visible, fallback } = await deliveredSections(PLAIN_ANSWER);
    expect(fallback).toBe(false);
    const action = visible.sections.filter((s) => ACTION_TITLES.includes(s.title));
    expect(action).toHaveLength(1);
    // Reason-bound, never a bare boundary line.
    expect(action[0].body.length).toBeGreaterThan(30);
  });

  it('a grounded-FALLBACK answer still carries one action section, not two', async () => {
    const { visible, fallback } = await deliveredSections(GOOD_ANSWER);
    expect(fallback).toBe(true);
    expect(visible.sections.filter((s) => ACTION_TITLES.includes(s.title))).toHaveLength(1);
  });

  it('delivers the complete product in order: 결론 first, 전문근거 after the action section', async () => {
    const { visible } = await deliveredSections(PLAIN_ANSWER);
    expect(visible.sections[0].title).toBe('결론');
    expect(visible.text).toContain('[결론]');
    const evidenceAt = visible.sections.findIndex((s) => s.title.startsWith('전문근거'));
    const actionAt = visible.sections.findIndex((s) => ACTION_TITLES.includes(s.title));
    expect(evidenceAt).toBeGreaterThan(-1);
    expect(actionAt).toBeGreaterThan(-1);
    expect(actionAt).toBeLessThan(evidenceAt);
  });
});

// V5.1 test I — the ACCEPTED path and the grounded FALLBACK deliver action through the SAME renderer.
// Before this, groundedNarrative kept a second, differently shaped action source of its own, so which
// delivery path an answer took decided whether the reader got labelled buckets.
describe('V5.1 — one action rendering contract across both delivery paths', () => {
  const ACTION_TITLES = [
    '이렇게 움직이시면 됩니다', '어느 쪽을 먼저 보시면 됩니다', '시점을 이렇게 보시면 됩니다',
    '이렇게 이해하시면 됩니다', '이 결을 이렇게 쓰시면 됩니다',
  ];
  const BUCKETS = ['확인할 것', '진행해도 되는 조건', '보류해야 하는 조건', '시기 체크', '힘을 받는 지점', '조심할 지점'];

  const PLAIN_ANSWER = JSON.stringify({
    coreSummary: '차분한 흐름입니다.',
    coreInterpretation: '차분함과 추진력이 함께 있는 결이라, 한번 잡은 일을 오래 끌고 가는 쪽에서 결과가 붙습니다. '
      + '다만 조급하게 서두르면 흐름이 흐트러지기 쉬우니, 속도를 조절하면서 되돌릴 수 있는 범위부터 차근히 넓혀 가시는 편이 좋습니다. '
      + '지금은 크게 방향을 틀기보다 지금 하고 계신 일을 유지하시는 쪽이 안정적입니다.',
    strengths: ['한번 잡은 일을 오래 끌고 갑니다.'],
    cautions: ['조급하게 서두르기보다 속도를 조절하는 편이 좋습니다.'],
    followUps: ['어떤 방식이 맞을까요?'],
  });

  const actionOf = async (answer: string) => {
    const { deps } = capturingDeps(answer);
    const r = await buildServerConsultation(baseRequest(), deps);
    expect(r.ok).toBe(true);
    if (!r.ok || !r.structuredResult) throw new Error('no result');
    const { buildUserVisibleAnswer } = await import('@/features/chat/presentation/userVisibleAnswer');
    const sections = buildUserVisibleAnswer(r.structuredResult).sections;
    const action = sections.filter((s) => ACTION_TITLES.includes(s.title));
    return { action, fallback: r.diagnostics.groundedFallback === true };
  };

  it('both paths deliver exactly one action section, in labelled buckets', async () => {
    for (const answer of [PLAIN_ANSWER, GOOD_ANSWER]) {
      const { action } = await actionOf(answer);
      expect(action).toHaveLength(1);
      const lines = action[0].body.split('\n');
      expect(lines.length).toBeGreaterThan(0);
      for (const line of lines) {
        const label = line.split(' — ')[0];
        expect(BUCKETS).toContain(label);
      }
    }
  });

  it('the two paths exercise genuinely different composition routes', async () => {
    expect((await actionOf(PLAIN_ANSWER)).fallback).toBe(false);
    expect((await actionOf(GOOD_ANSWER)).fallback).toBe(true);
  });
});
