// Structured-answer persistence (Commercial UX V4 §16/§17/§21). Pure round-trip + fail-closed.
import {
  serializeStructuredForPersistence,
  parsePersistedStructured,
} from '../persistStructured';
import { toConsumerAssessmentView } from '@/features/intelligence/presentation/assessmentView';
import { GROUNDING_UNAVAILABLE } from '@/features/chat/prompts/grounding';
import type { StructuredConsultationViewModel } from '@/features/intelligence/types/consultationViewModel';

const richVm = (): StructuredConsultationViewModel => ({
  coreSummary: '올해는 기반을 다질 때예요.',
  disposition: '추진력이 강한 편이에요.',
  assessment: toConsumerAssessmentView([]),
  coreInterpretation: '확장보다 정비가 어울리는 흐름입니다.',
  strengths: ['끈기', '넓은 시야'],
  cautions: ['조급함 주의'],
  domainInterpretation: [{ title: '일·직업', body: '점진적 성장' }],
  futureFlow: '하반기로 갈수록 좋아집니다.',
  grounding: GROUNDING_UNAVAILABLE,
  followUps: ['재물운은?', '2027년은?', '조심할 점은?'],
});

describe('serialize/parse round-trip', () => {
  it('persists the user-facing fields + follow-ups and restores a renderable VM', () => {
    const persisted = serializeStructuredForPersistence(richVm());
    // grounding + assessment are NOT persisted (data minimization §56)
    expect(persisted).not.toHaveProperty('grounding');
    expect(persisted).not.toHaveProperty('assessment');
    expect(persisted.followUps).toEqual(['재물운은?', '2027년은?', '조심할 점은?']);

    const restored = parsePersistedStructured(persisted);
    expect(restored).toBeDefined();
    expect(restored?.coreSummary).toBe('올해는 기반을 다질 때예요.');
    expect(restored?.strengths).toEqual(['끈기', '넓은 시야']);
    expect(restored?.domainInterpretation).toEqual([{ title: '일·직업', body: '점진적 성장' }]);
    expect(restored?.followUps).toEqual(['재물운은?', '2027년은?', '조심할 점은?']);
    // fail-closed grounding + assessment reattached on restore
    expect(restored?.grounding).toBe(GROUNDING_UNAVAILABLE);
    expect(restored?.assessment).toBeDefined();
  });

  it('accepts a JSON string (DB JSONB round-trips as an object, but strings are tolerated)', () => {
    const restored = parsePersistedStructured(JSON.stringify(serializeStructuredForPersistence(richVm())));
    expect(restored?.coreInterpretation).toBe('확장보다 정비가 어울리는 흐름입니다.');
  });
});

describe('fail-closed restore (§17/§20)', () => {
  it('legacy/absent (null/undefined) → undefined (caller renders plain text)', () => {
    expect(parsePersistedStructured(null)).toBeUndefined();
    expect(parsePersistedStructured(undefined)).toBeUndefined();
  });
  it('malformed JSON string → undefined, never throws', () => {
    expect(parsePersistedStructured('{ not json')).toBeUndefined();
    expect(parsePersistedStructured('42')).toBeUndefined();
    expect(parsePersistedStructured('"just a string"')).toBeUndefined();
  });
  it('an object with no substantive content → undefined', () => {
    expect(parsePersistedStructured({})).toBeUndefined();
    expect(parsePersistedStructured({ followUps: ['x'] })).toBeUndefined(); // follow-ups alone are not an answer
  });
  it('drops non-string array members defensively', () => {
    const restored = parsePersistedStructured({ coreSummary: '핵심', strengths: ['a', 2, null, 'b'] });
    expect(restored?.strengths).toEqual(['a', 'b']);
  });
});
