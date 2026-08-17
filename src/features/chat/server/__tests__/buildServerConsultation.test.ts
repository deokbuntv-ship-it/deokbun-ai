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

// A valid structured answer the LLM "returns" — grounded, no violations.
const GOOD_ANSWER = JSON.stringify({
  coreSummary: '차분한 흐름입니다.',
  coreInterpretation:
    '사주로 보면 일간을 중심으로 차분함과 추진력이 균형을 이루는 구조이며 월지의 기운과 십신 배치가 이를 뒷받침합니다. ' +
    '꾸준히 쌓아 올리면 좋고 조급하게 서두르면 흐름이 흐트러지기 쉬우니 속도를 조절하는 편이 좋습니다.',
  strengths: ['끈기'],
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
  it('C: a timing question at an unsupported 節氣 → Qimen calculation_failed, SAJU+Ziwei survive', async () => {
    // KST 2026-06-01 10:00 → 小满 (the provider throws → fail-closed calculation_failed).
    const now = Math.floor(Date.UTC(2026, 5, 1, 1, 0, 0) / 1000);
    const { deps } = capturingDeps(GOOD_ANSWER, { nowEpochSeconds: now });
    const r = await buildServerConsultation(baseRequest({ question: '지금 이 계약을 진행해도 될까요?' }), deps);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.groundingMeta.grounded).toBe(true); // still grounded on the natal spine
    expect(r.groundingMeta.engines.myungri).toBe('available');
    expect(r.groundingMeta.engines.qimen).not.toBe('available'); // Qimen degraded, consultation survives
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
