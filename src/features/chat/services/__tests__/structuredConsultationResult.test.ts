// The consultation view-model adapter (V4 §8/§9/§69). Verifies presentation-boundary hygiene:
// internal engine LABELS the model might slip in are stripped from every user-facing field, while
// a clean answer passes through unchanged. The adapter stays a thin, fail-closed pass-through.
import { GROUNDING_UNAVAILABLE } from '@/features/chat/prompts/grounding';
import { containsInternalTerminology } from '@/features/chat/presentation/commercialText';
import { buildStructuredConsultationResult } from '../structuredConsultationResult';

describe('buildStructuredConsultationResult — presentation hygiene', () => {
  it('strips engine LABELS from every user-facing field', () => {
    const vm = buildStructuredConsultationResult(
      {
        coreSummary: '올해는 기반을 다질 때예요 (엔진: SAJU)',
        disposition: '추진력이 강한 편 (제공됨)',
        coreInterpretation: '사주(engine: iztro)에서 보면 안정적인 흐름입니다.',
        strengths: ['끈기 (엔진: SAJU)'],
        cautions: ['조급함 (제공됨)'],
        domainInterpretation: [{ title: '일·직업 (엔진: SAJU)', body: '점진적 성장 (제공됨)' }],
        futureFlow: '하반기로 갈수록 좋아집니다 (엔진: iztro)',
        followUps: ['재물운은? (제공됨)', '2027년은?', '월별로 볼래?'],
      },
      GROUNDING_UNAVAILABLE,
    );

    // no user-facing field carries an internal label anymore
    const allText = [
      vm.coreSummary, vm.disposition, vm.coreInterpretation, vm.futureFlow,
      ...(vm.strengths ?? []), ...(vm.cautions ?? []), ...(vm.followUps ?? []),
      ...(vm.domainInterpretation ?? []).flatMap((d) => [d.title, d.body]),
    ].join(' | ');
    expect(containsInternalTerminology(allText)).toBe(false);
    expect(vm.coreSummary).toBe('올해는 기반을 다질 때예요');
    expect(vm.domainInterpretation?.[0]).toEqual({ title: '일·직업', body: '점진적 성장' });
    expect(vm.followUps).toEqual(['재물운은?', '2027년은?', '월별로 볼래?']);
  });

  it('leaves a clean answer untouched and stays fail-closed (assessment not fabricated)', () => {
    const parsed = {
      coreSummary: '올해는 기반을 다질 때예요.',
      coreInterpretation: '사주에서 보면 확장보다 정비가 어울리는 흐름입니다.',
      strengths: ['끈기 있게 쌓아 올리는 힘'],
      followUps: ['재물운은?', '2027년은?', '조심할 점은?'],
    };
    const vm = buildStructuredConsultationResult(parsed, GROUNDING_UNAVAILABLE);
    expect(vm.coreSummary).toBe(parsed.coreSummary);
    expect(vm.coreInterpretation).toBe(parsed.coreInterpretation);
    expect(vm.strengths).toEqual(parsed.strengths);
    // assessment stays the honest not-connected state (never fabricated)
    expect(vm.assessment).toBeDefined();
    expect(vm.grounding).toBe(GROUNDING_UNAVAILABLE);
  });
});
