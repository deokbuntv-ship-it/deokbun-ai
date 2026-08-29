// Sprint A — deterministic pre-LLM safety router. Proves the classifier is high-precision (conservative
// cues, negative controls) AND the security-critical invariant: a hard-stop question never reaches
// grounding or the LLM (no fortune generation, no paid work consumed on the model).
import { createHash } from 'crypto';

import { buildServerConsultation } from '@/features/chat/server';
import {
  classifyConsultationSafetyRoute,
  isHardStopRoute,
  safeResponseForRoute,
} from '@/features/chat/server/consultationSafety';
import type { ServerConsultationDeps, ServerConsultationRequest } from '@/features/chat/server';
import type { BirthInfoDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import type { LLMMessage } from '@/features/chat/types/chatArchitecture';
import { clearQimenCache } from '@/features/qimen';
import { clearZiweiCache } from '@/features/ziwei';

describe('classifyConsultationSafetyRoute — high-precision routing', () => {
  it('SELF_HARM: direct / indirect / fortune-framed', () => {
    for (const q of [
      '죽고 싶어',
      '자살하고 싶어',
      '내가 죽는 게 나을까',
      '사주가 이렇게 안 좋은데 살아야 할 이유가 있어?', // fortune-framed
      '내 팔자가 망한 것 같은데 그냥 죽는 게 낫나?', // fortune-framed
    ]) {
      expect(classifyConsultationSafetyRoute(q)).toBe('SELF_HARM');
    }
  });

  it('SELF_HARM negative controls (no false positive on philosophy / general distress / shopping)', () => {
    expect(classifyConsultationSafetyRoute('죽음에 대한 철학적인 의미가 궁금해')).toBe('NORMAL');
    expect(classifyConsultationSafetyRoute('요즘 너무 힘들어')).toBe('NORMAL');
    expect(classifyConsultationSafetyRoute('이 물건을 살 이유가 없어')).toBe('NORMAL');
  });

  it('DEATH_LIFESPAN: lifespan / death timing', () => {
    expect(classifyConsultationSafetyRoute('몇 살에 죽어?')).toBe('DEATH_LIFESPAN');
    expect(classifyConsultationSafetyRoute('내 수명 몇 살이야?')).toBe('DEATH_LIFESPAN');
    expect(classifyConsultationSafetyRoute('올해 죽을 운이야?')).toBe('DEATH_LIFESPAN');
    // philosophical death question is NOT a lifespan prediction
    expect(classifyConsultationSafetyRoute('죽음에 대한 철학')).toBe('NORMAL');
  });

  it('MEDICAL: diagnosis / prognosis (but not low-stakes wellness)', () => {
    expect(classifyConsultationSafetyRoute('사주상 암이야?')).toBe('MEDICAL');
    expect(classifyConsultationSafetyRoute('이 병 나을까?')).toBe('MEDICAL');
    expect(classifyConsultationSafetyRoute('내 사주에 큰 병 있어?')).toBe('MEDICAL');
    expect(classifyConsultationSafetyRoute('요즘 건강운은 어때?')).toBe('NORMAL'); // low-stakes → normal
  });

  it('FINANCIAL_GUARANTEE: guaranteed outcome (not a hard stop)', () => {
    expect(classifyConsultationSafetyRoute('이번 투자 무조건 수익 나?')).toBe('FINANCIAL_GUARANTEE');
    expect(classifyConsultationSafetyRoute('원금 보장돼?')).toBe('FINANCIAL_GUARANTEE');
    expect(classifyConsultationSafetyRoute('나 반드시 부자 돼?')).toBe('FINANCIAL_GUARANTEE');
    expect(classifyConsultationSafetyRoute('올해 재물운 어때?')).toBe('NORMAL');
    expect(classifyConsultationSafetyRoute('투자 시기 언제가 좋아?')).toBe('NORMAL');
  });

  // FINAL_PROSE_DELIVERY_REPAIR_V1 §11-13 — the reproduced false positive (bare "자해" matching inside
  // "투자해"/"출자해"/"융자해") plus adversarial controls: real financial-risk language must stay NORMAL,
  // and genuine crisis language (including actual "자해" mentions, never tested before this batch) must
  // still hard-stop.
  it('financial-risk questions are NOT misrouted to SELF_HARM (reproduced defect, now fixed)', () => {
    for (const q of [
      '지금 대출을 받아서 투자해도 될까?', // MONEY-09 — the exact reproduced QA false positive
      '지금 가상자산에 투자해도 괜찮을까?', // MONEY-14 — the exact reproduced QA false positive
      '대출받아서 투자해도 될까?',
      '투자 손실이 걱정돼.',
      '빚을 내서 사업을 확장해도 될까?',
      '요즘 돈을 계속 잃고 있어.',
      '출자해도 괜찮을까?', // same fragmentation via 출자 (capital contribution)
      '융자해서 사업을 시작해도 될까?', // same fragmentation via 융자 (financing)
    ]) {
      expect(classifyConsultationSafetyRoute(q)).toBe('NORMAL');
    }
  });

  it('genuine self-harm mentions (incl. the literal word 자해) still hard-stop', () => {
    for (const q of ['자해하고 싶어', '요즘 자해충동이 있어', '자해할까 생각중이야', '자해를 하고 싶다는 생각이 들어']) {
      expect(classifyConsultationSafetyRoute(q)).toBe('SELF_HARM');
    }
  });

  it('hard-stop set = self-harm / death / medical only', () => {
    expect(isHardStopRoute('SELF_HARM')).toBe(true);
    expect(isHardStopRoute('DEATH_LIFESPAN')).toBe(true);
    expect(isHardStopRoute('MEDICAL')).toBe(true);
    expect(isHardStopRoute('FINANCIAL_GUARANTEE')).toBe(false);
    expect(isHardStopRoute('NORMAL')).toBe(false);
  });

  it('safe responses exist only for hard stops, and self-harm carries a crisis contact', () => {
    expect(safeResponseForRoute('SELF_HARM')).toContain('109');
    expect(safeResponseForRoute('DEATH_LIFESPAN')).toMatch(/수명|떠나는 시기/);
    expect(safeResponseForRoute('MEDICAL')).toMatch(/의료 전문가|진단/);
    expect(safeResponseForRoute('FINANCIAL_GUARANTEE')).toBeNull();
    expect(safeResponseForRoute('NORMAL')).toBeNull();
  });
});

// ── Orchestrator invariant: a hard stop never generates a fortune ────────────────────────────
const digestProvider: DigestProvider = {
  async sha256Utf8(s: string) {
    return createHash('sha256').update(s, 'utf8').digest('hex');
  },
};
const SERVER_NOW = Math.floor(Date.UTC(2024, 0, 15, 1, 0, 0) / 1000);
const birth: BirthInfoDraft = {
  displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1990', birthMonth: '8', birthDay: '15', birthTimeAccuracy: 'exact', birthHour: '14',
  birthMinute: '0', approximateTimePeriod: null, birthPlace: '서울',
};
function capturingDeps() {
  const sent: LLMMessage[][] = [];
  const deps: ServerConsultationDeps = {
    digestProvider,
    nowEpochSeconds: SERVER_NOW,
    async callLLM(messages) {
      sent.push(messages);
      return '{}';
    },
  };
  return { deps, sent };
}
const req = (question: string): ServerConsultationRequest => ({ birthInput: birth, question });

beforeEach(() => {
  clearZiweiCache();
  clearQimenCache();
});

describe('buildServerConsultation — hard-stop safety route bypasses fortune generation', () => {
  it('SELF_HARM: no LLM call, no grounding, controlled crisis response', async () => {
    const { deps, sent } = capturingDeps();
    const r = await buildServerConsultation(req('죽고 싶어'), deps);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(sent).toHaveLength(0); // the fortune pipeline never ran the LLM
    expect(r.groundingMeta.grounded).toBe(false); // no astrology evidence supplied
    expect(r.structuredResult).toBeUndefined();
    expect(r.diagnostics?.outputClassification).toBe('SAFETY_ROUTED');
    expect(r.diagnostics?.safetyRoute).toBe('SELF_HARM');
    expect(r.text).toContain('109');
  });

  it.each([
    ['몇 살에 죽어?', 'DEATH_LIFESPAN'],
    ['사주상 암이야?', 'MEDICAL'],
  ])('%s → hard stop (no LLM)', async (question, route) => {
    const { deps, sent } = capturingDeps();
    const r = await buildServerConsultation(req(question), deps);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(sent).toHaveLength(0);
    expect(r.diagnostics?.safetyRoute).toBe(route);
  });

  it('a hard-stop question with INVALID birth still returns the safe response (safety before birth)', async () => {
    const { deps, sent } = capturingDeps();
    const r = await buildServerConsultation({ birthInput: { birthYear: '' } as never, question: '자살하고 싶어' }, deps);
    expect(r.ok).toBe(true); // NOT INVALID_INPUT — safety wins
    if (!r.ok) return;
    expect(sent).toHaveLength(0);
    expect(r.diagnostics?.safetyRoute).toBe('SELF_HARM');
  });

  it('FINANCIAL_GUARANTEE is NOT a hard stop — normal generation proceeds', async () => {
    const { deps, sent } = capturingDeps();
    const r = await buildServerConsultation(req('원금 보장돼?'), deps);
    expect(r.ok).toBe(true);
    expect(sent.length).toBeGreaterThan(0); // the LLM WAS called (soft route)
  });

  it('a normal question is not routed', async () => {
    const { deps } = capturingDeps();
    const r = await buildServerConsultation(req('제 타고난 성격은 어떤가요?'), deps);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.diagnostics?.safetyRoute).toBeUndefined();
  });
});
