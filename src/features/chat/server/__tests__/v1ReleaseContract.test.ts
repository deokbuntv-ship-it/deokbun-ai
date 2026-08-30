// Sprint D §D13 — V1 release-contract smoke. Ties the cross-cutting guarantees together at the integrated
// buildServerConsultation boundary (structured invariants only, no golden prose). Unit-level detail lives in
// the focused suites (safety / polarity / optionB / compatibility / follow-up / ablation).
import { createHash } from 'crypto';

import { buildServerConsultation } from '@/features/chat/server';
import type { ServerConsultationDeps, ServerConsultationRequest } from '@/features/chat/server';
import type { BirthInfoDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import type { LLMMessage } from '@/features/chat/types/chatArchitecture';
import { clearQimenCache } from '@/features/qimen';
import { clearZiweiCache } from '@/features/ziwei';

const digestProvider: DigestProvider = { async sha256Utf8(s: string) { return createHash('sha256').update(s, 'utf8').digest('hex'); } };
const NOW = Math.floor(Date.UTC(2026, 6, 15, 1, 0, 0) / 1000);
const birth: BirthInfoDraft = { displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null, birthYear: '1990', birthMonth: '8', birthDay: '15', birthTimeAccuracy: 'exact', birthHour: '14', birthMinute: '0', approximateTimePeriod: null, birthPlace: '서울' };
const GOOD = JSON.stringify({
  coreSummary: '차분한 흐름입니다.',
  coreInterpretation: '사주로 보면 일간을 중심으로 차분함과 추진력이 균형을 이루는 구조이며 월지의 기운과 십신 배치가 이를 뒷받침합니다. 꾸준히 쌓아 올리면 좋고 조급하게 서두르면 흐름이 흐트러지기 쉬우니 속도를 조절하는 편이 좋습니다.',
  strengths: ['끈기'], cautions: ['조급하게 서두르기보다 속도를 조절하는 편이 좋습니다.'],
});
function harness(answer = GOOD) {
  const sent: LLMMessage[][] = [];
  const deps: ServerConsultationDeps = { digestProvider, nowEpochSeconds: NOW, async callLLM(m) { sent.push(m); return answer; } };
  return { deps, sent };
}
const req = (question: string): ServerConsultationRequest => ({ birthInput: birth, question });

beforeEach(() => { clearZiweiCache(); clearQimenCache(); });

describe('§D13 V1 release contract (integrated)', () => {
  it('SAFETY: a self-harm question hard-stops before any LLM/grounding', async () => {
    const { deps, sent } = harness();
    const r = await buildServerConsultation(req('죽고 싶어'), deps);
    expect(r.ok && sent.length === 0).toBe(true);
    if (r.ok) {
      expect(r.diagnostics?.safetyRoute).toBe('SELF_HARM');
      expect(r.groundingMeta.grounded).toBe(false);
    }
  });

  it('DECISION META: a grounded year question persists version + target context + polarity', async () => {
    const r = await buildServerConsultation(req('올해 재물운 어때?'), harness().deps);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const meta = r.structuredResult?.decisionMeta;
    expect(meta?.answerPlanVersion).toBeTruthy();
    expect(meta?.decisionPolicyVersion).toBeTruthy();
    expect(meta?.resolvedGranularity).toBe('YEAR');
    expect(meta?.resolvedTemporalContext.anchorEpochSeconds).toBe(NOW); // server-owned instant
    // conclusionPolarity (target-scoped) is server-injected when the year is grounded.
    expect(r.structuredResult?.conclusionPolarity).toBeDefined();
    expect(r.structuredResult?.conclusionPolarity).toBe(meta?.polarity);
  });

  it('NATAL: a non-temporal question has no temporal polarity but still answers', async () => {
    const r = await buildServerConsultation(req('내 사주의 특징은?'), harness().deps);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.structuredResult?.decisionMeta?.resolvedGranularity).toBe('NONE');
    expect(r.structuredResult?.conclusionPolarity).toBeUndefined();
  });

  it('FINANCIAL GUARANTEE: a soft route still runs normal generation', async () => {
    const { deps, sent } = harness();
    const r = await buildServerConsultation(req('원금 보장돼?'), deps);
    expect(r.ok).toBe(true);
    expect(sent.length).toBeGreaterThan(0);
  });

  // V3 §11 — "rejected" still means the model's answer is discarded in full; the delivered card is the
  // server's own grounded composition, which cannot name a winner because no LLM text reaches it.
  it('OPTION B: a comparison answer that invents a winner is rejected → grounded composition, no winner', async () => {
    // A grounded month-comparison; the model returns a winner claim on both attempts → guard rejects.
    const winner = JSON.stringify({ coreSummary: '5월이 더 좋습니다.', coreInterpretation: '5월이 2월보다 더 좋습니다. 사주로 보면 일간을 중심으로 흐름이 이어지고 월지의 기운이 이를 뒷받침하여 꾸준히 준비하면 도움이 됩니다.', strengths: ['추진력'] });
    const r = await buildServerConsultation(req('2026년 2월이 좋아 5월이 좋아?'), harness(winner).deps);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.diagnostics?.groundedFallback).toBe(true);
    expect(r.text).not.toContain('5월이 2월보다');
    expect(r.text).not.toMatch(/5월이 더 좋습니다/);
    // The server's own declined headline quotes the question (so "5월" appears) but never picks a side.
    expect(r.structuredResult?.coreSummary).toMatch(/한쪽을 지금 고르기보다|확정하기 어렵습니다/);
  });
});
