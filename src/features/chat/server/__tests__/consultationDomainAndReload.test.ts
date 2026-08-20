// Sprint E §8/§18 — domain classifier + persist→reload→follow-up resolver E2E-style unit path.
import { serializeStructuredForPersistence, parsePersistedStructured } from '@/features/chat/presentation/persistStructured';
import { classifyConsultationDomain } from '@/features/chat/server/consultationDomain';
import { ANSWER_PLAN_VERSION, DECISION_POLICY_VERSION } from '@/features/chat/server/answerPlan';
import { previousDecisionFromMeta, resolveFollowUpAction } from '@/features/chat/services/followUpContext';
import type { ConsultationDecisionMeta } from '@/features/chat/server/serverConsultationTypes';
import type { StructuredConsultationViewModel } from '@/features/intelligence/types/consultationViewModel';

describe('§8 classifyConsultationDomain', () => {
  it('maps common questions to a stable topic', () => {
    expect(classifyConsultationDomain('올해 사업운 어때?')).toBe('사업');
    expect(classifyConsultationDomain('재물운이 궁금해')).toBe('재물');
    expect(classifyConsultationDomain('이직해도 될까?')).toBe('이직');
    expect(classifyConsultationDomain('결혼 언제 할까?')).toBe('결혼');
    expect(classifyConsultationDomain('내 성격은?')).toBe('전반'); // no specific domain
  });
});

const META = (over: Partial<ConsultationDecisionMeta> = {}): ConsultationDecisionMeta => ({
  answerPlanVersion: ANSWER_PLAN_VERSION, decisionPolicyVersion: DECISION_POLICY_VERSION, promptVersion: 'consultation@1.4.3',
  resolvedGranularity: 'YEAR', resolvedTargets: [2026], polarity: 'CAUTION', domain: '사업', modelId: 'gpt-5-mini',
  resolvedTemporalContext: { anchorEpochSeconds: 1_700_000_000, timezone: 'Asia/Seoul', referenceYear: 2026, referenceMonth: 8, resolvedTargets: [2026], qimenActive: false },
  ...over,
});
const vm = (meta: ConsultationDecisionMeta): StructuredConsultationViewModel => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coreSummary: '요약', coreInterpretation: '핵심 해석 본문입니다.', assessment: {} as any,
  grounding: { status: 'unavailable', reason: 'engine_not_connected' },
  conclusionPolarity: meta.polarity, decisionMeta: meta,
});

describe('§18 persist → reload → follow-up resolver', () => {
  it('WHY: reloaded decision drives EXPLAIN_PREVIOUS (no version mismatch on current versions)', () => {
    const reloaded = parsePersistedStructured(serializeStructuredForPersistence(vm(META())));
    const prev = previousDecisionFromMeta(reloaded?.decisionMeta);
    expect(prev?.polarity).toBe('CAUTION');
    expect(prev?.decisionMeta?.domain).toBe('사업');
    expect(resolveFollowUpAction('WHY', prev)).toEqual({ kind: 'EXPLAIN_PREVIOUS', versionMismatch: false });
  });

  it('WHY: a stale persisted decision reloads as a version mismatch', () => {
    const reloaded = parsePersistedStructured(serializeStructuredForPersistence(vm(META({ answerPlanVersion: 'answer-plan@1.0.0' }))));
    const prev = previousDecisionFromMeta(reloaded?.decisionMeta);
    expect(resolveFollowUpAction('WHY', prev)).toEqual({ kind: 'EXPLAIN_PREVIOUS', versionMismatch: true });
  });

  it('NEXT_YEAR + COMPARE_PREVIOUS survive persistence (domain + candidate identities)', () => {
    const reloaded = parsePersistedStructured(serializeStructuredForPersistence(vm(META({ resolvedGranularity: 'MONTH', resolvedTargets: [202702, 202705], domain: '이사' }))));
    const prev = previousDecisionFromMeta(reloaded?.decisionMeta);
    expect(prev?.decisionMeta?.domain).toBe('이사');
    expect(resolveFollowUpAction('NEXT_YEAR', prev)).toEqual({ kind: 'RECALC_NEXT_YEAR' });
    expect(resolveFollowUpAction('BETWEEN_CANDIDATES', prev)).toEqual({ kind: 'DESCRIBE_CANDIDATES_NO_WINNER', candidates: [202702, 202705] });
  });

  it('model id survives persistence', () => {
    const reloaded = parsePersistedStructured(serializeStructuredForPersistence(vm(META())));
    expect(reloaded?.decisionMeta?.modelId).toBe('gpt-5-mini');
  });
});
