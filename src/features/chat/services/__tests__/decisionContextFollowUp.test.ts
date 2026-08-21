// Sprint D §D1-§D4 — decision-context persistence round-trip + structured follow-up foundation.
import { serializeStructuredForPersistence, parsePersistedStructured } from '@/features/chat/presentation/persistStructured';
import { ANSWER_PLAN_VERSION, DECISION_POLICY_VERSION } from '@/features/chat/server/answerPlan';
import { isDecisionVersionMismatch } from '@/features/chat/server/decisionMeta';
import {
  classifyFollowUpIntent,
  previousDecisionFrom,
  resolveFollowUpAction,
} from '@/features/chat/services/followUpContext';
import type { ConsultationDecisionMeta } from '@/features/chat/server/serverConsultationTypes';
import type { StructuredConsultationViewModel } from '@/features/intelligence/types/consultationViewModel';

const META = (over: Partial<ConsultationDecisionMeta> = {}): ConsultationDecisionMeta => ({
  answerPlanVersion: ANSWER_PLAN_VERSION,
  decisionPolicyVersion: DECISION_POLICY_VERSION,
  promptVersion: 'consultation@1.4.3',
  engineVersion: 'saju@1',
  resolvedGranularity: 'YEAR',
  resolvedTargets: [2027],
  polarity: 'CAUTION',
  resolvedTemporalContext: { anchorEpochSeconds: 1_700_000_000, timezone: 'Asia/Seoul', referenceYear: 2026, referenceMonth: 8, resolvedTargets: [2027], qimenActive: false },
  ...over,
});
const vm = (over: Partial<StructuredConsultationViewModel> = {}): StructuredConsultationViewModel => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coreSummary: '요약', coreInterpretation: '핵심 해석 본문입니다.', assessment: {} as any,
  grounding: { status: 'unavailable', reason: 'engine_not_connected' },
  ...over,
});

describe('§D1 decisionMeta persistence round-trip', () => {
  it('serialize → parse preserves the full decision meta', () => {
    const restored = parsePersistedStructured(serializeStructuredForPersistence(vm({ conclusionPolarity: 'CAUTION', decisionMeta: META() })));
    expect(restored?.decisionMeta).toEqual(META());
  });
  it('legacy record without decisionMeta stays valid → undefined (no silent default)', () => {
    const restored = parsePersistedStructured({ coreSummary: '요약', coreInterpretation: '핵심 해석 본문입니다.' });
    expect(restored).toBeDefined();
    expect(restored?.decisionMeta).toBeUndefined();
  });
  it('malformed decisionMeta → fail-closed undefined (round-trips through a JSON string too)', () => {
    const bad = JSON.stringify({ coreSummary: '요약', coreInterpretation: '핵심 해석 본문입니다.', decisionMeta: { answerPlanVersion: 5, resolvedGranularity: 'DECADE' } });
    const restored = parsePersistedStructured(bad);
    expect(restored?.decisionMeta).toBeUndefined();
  });
  it('the temporal context survives persistence (targets + reference month)', () => {
    const restored = parsePersistedStructured(serializeStructuredForPersistence(vm({ decisionMeta: META() })));
    expect(restored?.decisionMeta?.resolvedTemporalContext.referenceMonth).toBe(8);
    expect(restored?.decisionMeta?.resolvedTargets).toEqual([2027]);
  });
});

describe('§D4 decision-version mismatch', () => {
  it('same decision versions → no mismatch', () => {
    expect(isDecisionVersionMismatch(META())).toBe(false);
  });
  it('a stale answer-plan version → mismatch', () => {
    expect(isDecisionVersionMismatch(META({ answerPlanVersion: 'answer-plan@1.0.0' }))).toBe(true);
  });
  it('a prompt-only difference is NOT a decision mismatch', () => {
    expect(isDecisionVersionMismatch(META({ promptVersion: 'consultation@9.9.9' }))).toBe(false);
  });
  it('no persisted meta → not treated as silently equal (false, caller decides)', () => {
    expect(isDecisionVersionMismatch(undefined)).toBe(false);
  });

  it('§7 engineVersion is decision-affecting: a differing current engine version → mismatch', () => {
    const persisted = META({ engineVersion: 'saju@1' });
    expect(isDecisionVersionMismatch(persisted, { engineVersion: 'saju@2' })).toBe(true);
    expect(isDecisionVersionMismatch(persisted, { engineVersion: 'saju@1' })).toBe(false);
    expect(isDecisionVersionMismatch(persisted)).toBe(false); // no current → engine not compared
  });
});

describe('§D2/§D3 follow-up foundation', () => {
  it('previousDecisionFrom extracts structured state; null when absent', () => {
    // §16-17 — a REAL comparison carries the explicit flag; resolvedTargets.length alone no longer implies it.
    const prev = previousDecisionFrom(vm({ conclusionPolarity: 'CAUTION', decisionMeta: META({ resolvedTargets: [2027, 2028], comparisonContext: { isComparison: true, candidates: [2027, 2028] } }) }));
    expect(prev?.polarity).toBe('CAUTION');
    expect(prev?.resolvedTargets).toEqual([2027, 2028]);
    expect(prev?.hasComparisonSet).toBe(true);
    expect(previousDecisionFrom(vm())).toBeNull();
  });

  it('§16-17 a single year+month resolution is NOT a comparison (no explicit flag)', () => {
    const prev = previousDecisionFrom(vm({ decisionMeta: META({ resolvedGranularity: 'MONTH', resolvedTargets: [2027, 202705] }) }));
    expect(prev?.hasComparisonSet).toBe(false);
    expect(resolveFollowUpAction('BETWEEN_CANDIDATES', prev)).toEqual({ kind: 'DESCRIBE_CANDIDATES_NO_WINNER', candidates: [] });
  });

  it('classifyFollowUpIntent recognizes the minimum V1 set', () => {
    expect(classifyFollowUpIntent('왜?')).toBe('WHY');
    expect(classifyFollowUpIntent('왜 그래?')).toBe('WHY');
    expect(classifyFollowUpIntent('그럼 내년은?')).toBe('NEXT_YEAR');
    expect(classifyFollowUpIntent('둘 중에는?')).toBe('BETWEEN_CANDIDATES');
    expect(classifyFollowUpIntent('그럼 언제?')).toBe('WHEN');
    expect(classifyFollowUpIntent('내 사업운 어때?')).toBe('NONE');
  });

  it('resolveFollowUpAction honors the version-mismatch + Option B contracts', () => {
    const prev = previousDecisionFrom(vm({ decisionMeta: META({ resolvedTargets: [2027, 2028], comparisonContext: { isComparison: true, candidates: [2027, 2028] } }) }));
    expect(resolveFollowUpAction('WHY', prev)).toEqual({ kind: 'EXPLAIN_PREVIOUS', versionMismatch: false });
    const stale = previousDecisionFrom(vm({ decisionMeta: META({ answerPlanVersion: 'answer-plan@1.0.0' }) }));
    expect(resolveFollowUpAction('WHY', stale)).toEqual({ kind: 'EXPLAIN_PREVIOUS', versionMismatch: true });
    expect(resolveFollowUpAction('NEXT_YEAR', prev)).toEqual({ kind: 'RECALC_NEXT_YEAR' });
    expect(resolveFollowUpAction('BETWEEN_CANDIDATES', prev)).toEqual({ kind: 'DESCRIBE_CANDIDATES_NO_WINNER', candidates: [2027, 2028] });
    expect(resolveFollowUpAction('WHEN', prev)).toEqual({ kind: 'DEFER_V1_1' }); // never a best-period ranking
  });
});
