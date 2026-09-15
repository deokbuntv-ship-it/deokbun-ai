// Consultation Presentation ViewModel (Commercial UX V4 §4/§5/§7/§10/§47). Pure + deterministic.
import { toConsultationPresentation } from '../consultationPresentationVM';
import { toConsumerAssessmentView } from '@/features/intelligence/presentation/assessmentView';
import type { StructuredConsultationViewModel } from '@/features/intelligence/types/consultationViewModel';
import { GROUNDING_UNAVAILABLE } from '@/features/chat/prompts/grounding';

const base = (over: Partial<StructuredConsultationViewModel> = {}): StructuredConsultationViewModel => ({
  coreSummary: '올해는 기반을 다질 때예요.',
  disposition: '추진력이 강한 편이에요.',
  assessment: toConsumerAssessmentView([]),
  coreInterpretation: '사주에서 보면 확장보다 정비가 어울리는 흐름입니다.',
  strengths: ['끈기 있게 쌓아 올리는 힘', '균형을 읽는 넓은 시야'],
  cautions: ['조급하게 서두르면 흐름이 흐트러질 수 있어요'],
  domainInterpretation: [{ title: '일·직업', body: '점진적 성장이 잘 맞습니다.' }],
  futureFlow: '하반기로 갈수록 기회가 커집니다.',
  grounding: GROUNDING_UNAVAILABLE,
  followUps: ['재물운은?', '2027년은?', '조심할 점은?'],
  ...over,
});

describe('toConsultationPresentation — commercial hierarchy', () => {
  it('maps the schema into headline → summary → key points → cautions → collapsed detail → follow-ups', () => {
    const p = toConsultationPresentation(base());
    expect(p.headline).toBe('올해는 기반을 다질 때예요.');
    expect(p.disposition).toBe('추진력이 강한 편이에요.');
    expect(p.summary).toBe('사주에서 보면 확장보다 정비가 어울리는 흐름입니다.');
    expect(p.keyPoints).toEqual(['끈기 있게 쌓아 올리는 힘', '균형을 읽는 넓은 시야']);
    expect(p.cautions).toEqual(['조급하게 서두르면 흐름이 흐트러질 수 있어요']);
    // domain + futureFlow both land in the (collapsed) detail
    expect(p.detailSections).toEqual([
      { title: '일·직업', body: '점진적 성장이 잘 맞습니다.' },
      { title: '앞으로의 흐름', body: '하반기로 갈수록 기회가 커집니다.' },
    ]);
    expect(p.followUps).toEqual(['재물운은?', '2027년은?', '조심할 점은?']);
  });

  it('caps key points / cautions / follow-ups at 3 (density control §6)', () => {
    const p = toConsultationPresentation(
      base({
        strengths: ['a', 'b', 'c', 'd', 'e'],
        cautions: ['c1', 'c2', 'c3', 'c4'],
        followUps: ['f1', 'f2', 'f3', 'f4'],
      }),
    );
    expect(p.keyPoints).toEqual(['a', 'b', 'c']);
    expect(p.cautions).toEqual(['c1', 'c2', 'c3']);
    expect(p.followUps).toEqual(['f1', 'f2', 'f3']);
  });

  it('de-duplicates within lists and against the headline/summary (conservative, exact-normalized §7/§10)', () => {
    const p = toConsultationPresentation(
      base({
        coreInterpretation: '핵심은 정비입니다.',
        strengths: ['핵심은 정비입니다.', '끈기', '끈기', '넓은 시야'], // dup vs summary + internal dup
      }),
    );
    expect(p.keyPoints).toEqual(['끈기', '넓은 시야']);
  });

  it('drops empty sections and never fabricates content (§47/§18) — no actions invented', () => {
    const p = toConsultationPresentation(
      base({ cautions: [], domainInterpretation: [], futureFlow: '' }),
    );
    expect(p.cautions).toEqual([]);
    expect(p.detailSections).toEqual([]);
    // the VM has no `actions` field — nothing is fabricated from a missing source
    expect(p).not.toHaveProperty('actions');
  });

  it('dedup V2: drops a key point fully CONTAINED in the summary, keeps distinct advice (§19)', () => {
    const p = toConsultationPresentation(
      base({
        coreInterpretation: '당신은 끈기가 강점입니다 그리고 시야가 넓습니다.',
        strengths: ['끈기가 강점입니다', '위기에 침착하게 대응하는 힘'], // first ⊂ summary → dropped; second distinct → kept
      }),
    );
    expect(p.keyPoints).toEqual(['위기에 침착하게 대응하는 힘']);
  });

  it('dedup V2: drops a near-duplicate (high token overlap) but keeps a genuinely different point', () => {
    const p = toConsultationPresentation(
      base({
        coreInterpretation: '핵심은 안정적으로 수익을 쌓는 방식입니다.',
        strengths: [
          '한 번에 큰 승부보다 안정적으로 수익을 쌓는 방식이 잘 맞습니다',
          '안정적으로 수익을 쌓는 방식이 한 번에 큰 승부보다 잘 맞습니다', // reordered near-duplicate → dropped
          '사람들과의 신뢰를 오래 유지하는 힘', // distinct → kept
        ],
      }),
    );
    expect(p.keyPoints).toEqual([
      '한 번에 큰 승부보다 안정적으로 수익을 쌓는 방식이 잘 맞습니다',
      '사람들과의 신뢰를 오래 유지하는 힘',
    ]);
  });

  it('does NOT over-dedup topically-related but distinct advice (conservative)', () => {
    const p = toConsultationPresentation(
      base({
        strengths: ['재물을 모으는 힘이 강합니다', '재물을 지키는 신중함도 있습니다'], // same topic, different idea
      }),
    );
    expect(p.keyPoints).toEqual(['재물을 모으는 힘이 강합니다', '재물을 지키는 신중함도 있습니다']);
  });

  it('caps detail sections so a long-range answer is not a wall (§13/§25), keeping the timing flow last', () => {
    const p = toConsultationPresentation(
      base({
        domainInterpretation: Array.from({ length: 8 }, (_, i) => ({
          title: `구간 ${i + 1}`,
          body: `${i + 1}번째 구간의 고유한 해석 내용입니다.`,
        })),
        futureFlow: '전체적으로 완만한 상승 흐름입니다.',
      }),
    );
    // ≤5 domain sections + the timing flow appended
    expect(p.detailSections.length).toBe(6);
    expect(p.detailSections[p.detailSections.length - 1].title).toBe('앞으로의 흐름');
  });

  it('handles a minimal answer (only headline) without crashing', () => {
    const p = toConsultationPresentation(
      base({
        coreInterpretation: undefined,
        disposition: undefined,
        strengths: undefined,
        cautions: undefined,
        domainInterpretation: undefined,
        futureFlow: undefined,
        followUps: undefined,
      }),
    );
    expect(p.headline).toBe('올해는 기반을 다질 때예요.');
    expect(p.summary).toBeNull();
    expect(p.keyPoints).toEqual([]);
    expect(p.detailSections).toEqual([]);
    expect(p.followUps).toEqual([]);
  });
});
