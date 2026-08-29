// Natal personality consultation — validator contract + safe rejection diagnostics. Reproduces the owner
// case: "내 성격의 장단점을 알려줘" with Myungri + Ziwei available and Qimen NOT_APPLICABLE. Proves a valid
// two-engine answer is ACCEPTED, the forbidden classes are rejected, and the exact reason is reported.
import { createHash } from 'crypto';

import { GROUNDING_UNAVAILABLE } from '@/features/chat/prompts/grounding';
import {
  classifyConsultationOutput,
  firstStructuredRejectionReason,
} from '@/features/chat/prompts/structuredConsultation';
import { buildServerConsultation } from '@/features/chat/server';
import type { ServerConsultationDeps } from '@/features/chat/server';
import { buildConsultationGrounding } from '@/features/chat/services/consultationGrounding';
import type { BirthInfoDraft, ConsultationDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { clearQimenCache } from '@/features/qimen';
import { clearZiweiCache } from '@/features/ziwei';

const digestProvider: DigestProvider = { async sha256Utf8(s: string) { return createHash('sha256').update(s, 'utf8').digest('hex'); } };
const NOW = Math.floor(Date.UTC(2024, 0, 15, 1, 0, 0) / 1000);
const birth: BirthInfoDraft = {
  displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1990', birthMonth: '8', birthDay: '15', birthTimeAccuracy: 'exact', birthHour: '14',
  birthMinute: '0', approximateTimePeriod: null, birthPlace: '서울',
};
const draft: ConsultationDraft = { subject: { id: 's', displayName: '테스트', relationship: null }, birthInfo: birth };
const support = {
  strengths: ['끈기 있게 목표를 향해 꾸준히 쌓아 올리는 지속력', '상황의 균형을 읽고 침착하게 판단하는 넓은 시야'],
  cautions: ['조급하게 서두르면 오히려 흐름이 흐트러질 수 있으니 속도를 조절하는 편이 좋습니다'],
  domainInterpretation: [{ title: '일·직업', body: '안정적인 기반 위에서 점진적으로 성장하는 방식이 잘 맞으며 축적이 유리합니다.' }],
  followUps: ['어떤 분야가 잘 맞을까요?'],
};
const answer = (core: string) => JSON.stringify({ coreSummary: '차분하지만 추진력을 갖춘 흐름입니다.', coreInterpretation: core, ...support });

const CLEAN = '일간을 중심으로 보면 차분함과 추진력이 균형을 이루는 구조이며, 월지의 기운이 이를 뒷받침하는 안정적인 흐름입니다.';
const PER_PERSPECTIVE = '명리에서는 안정적인 기운이, 자미두수에서는 유연한 대인관계가 각각 다른 각도에서 드러나는 흐름입니다.';
const SIN_GANG = '신강한 사주라 주관이 뚜렷하고 자기 확신이 강한 편이며 스스로 밀고 나가는 힘이 있습니다.';
const CROSS = '사주와 자미두수에서 모두 대인관계가 원만하고 좋게 나타나는 편입니다.';
const QIMEN = '기문에서 보면 현재 흐름이 유리하게 열려 있습니다.';
const THREE = CLEAN + ' 세 학문이 완전히 일치합니다.';

describe('natal Myungri+Ziwei, Qimen not_applicable — validator contract', () => {
  let G: Awaited<ReturnType<typeof buildConsultationGrounding>>;
  beforeAll(async () => {
    clearZiweiCache(); clearQimenCache();
    G = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: NOW }, '내 성격의 장단점을 알려줘');
  });

  it('grounding is Myungri + Ziwei available, Qimen not_applicable', () => {
    expect(G.status).toBe('available');
    if (G.status === 'available') {
      expect(G.evidence.myungri.availability).toBe('available');
      expect(G.evidence.ziwei.availability).toBe('available');
      expect(G.evidence.qimen.availability).toBe('not_applicable');
    }
  });

  it('a valid two-engine answer (plain language) → ACCEPTED', () => {
    expect(classifyConsultationOutput(answer(CLEAN), G).kind).toBe('ACCEPTED');
  });
  it('a valid per-perspective two-engine synthesis is NOT falsely rejected', () => {
    expect(classifyConsultationOutput(answer(PER_PERSPECTIVE), G).kind).toBe('ACCEPTED');
  });

  it('신강/신약/격국/용신 (uncomputed theory) → SEMANTIC_REJECTED, reason FORBIDDEN_THEORY', () => {
    expect(classifyConsultationOutput(answer(SIN_GANG), G).kind).toBe('SEMANTIC_REJECTED');
    expect(firstStructuredRejectionReason(answer(SIN_GANG), G)).toBe('FORBIDDEN_THEORY');
  });
  it('Qimen participation claim (Qimen not_applicable) → SEMANTIC_REJECTED, reason UNGROUNDED_QIMEN_CLAIM', () => {
    expect(classifyConsultationOutput(answer(QIMEN), G).kind).toBe('SEMANTIC_REJECTED');
    expect(firstStructuredRejectionReason(answer(QIMEN), G)).toBe('UNGROUNDED_QIMEN_CLAIM');
  });
  it('Saju↔Ziwei "모두 …" full-consensus → SEMANTIC_REJECTED, reason CROSS_ENGINE_CONSENSUS', () => {
    expect(classifyConsultationOutput(answer(CROSS), G).kind).toBe('SEMANTIC_REJECTED');
    expect(firstStructuredRejectionReason(answer(CROSS), G)).toBe('CROSS_ENGINE_CONSENSUS');
  });
  it('fake 3-engine consensus → SEMANTIC_REJECTED, reason CONSENSUS_CLAIM_MISMATCH', () => {
    expect(classifyConsultationOutput(answer(THREE), G).kind).toBe('SEMANTIC_REJECTED');
    expect(firstStructuredRejectionReason(answer(THREE), G)).toBe('CONSENSUS_CLAIM_MISMATCH');
  });
  it('an ACCEPTED answer reports reason NONE (diagnostic is content-free — only a code)', () => {
    expect(firstStructuredRejectionReason(answer(CLEAN), G)).toBe('NONE');
  });
});

describe('buildServerConsultation surfaces safe diagnostics (log-only)', () => {
  const deps = (a: string): ServerConsultationDeps => ({ digestProvider, nowEpochSeconds: NOW, async callLLM() { return a; } });
  beforeEach(() => { clearZiweiCache(); clearQimenCache(); });

  it('clean answer → ACCEPTED classification, structuredResult present', async () => {
    const r = await buildServerConsultation({ birthInput: birth, question: '내 성격의 장단점을 알려줘' }, deps(answer(CLEAN)));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.diagnostics?.outputClassification).toBe('ACCEPTED');
      expect(r.diagnostics?.rejectionReason).toBeUndefined();
      expect(r.structuredResult).toBeDefined();
    }
  });
  it('신강 answer → SEMANTIC_REJECTED classification + FORBIDDEN_THEORY reason, safe message, no structuredResult', async () => {
    const r = await buildServerConsultation({ birthInput: birth, question: '내 성격의 장단점을 알려줘' }, deps(answer(SIN_GANG)));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.diagnostics?.outputClassification).toBe('SEMANTIC_REJECTED');
      expect(r.diagnostics?.rejectionReason).toBe('FORBIDDEN_THEORY');
      expect(r.structuredResult).toBeUndefined();
      expect(r.text).not.toMatch(/신강/); // raw unsafe text discarded → safe message
    }
  });
});

// Reproduces + fixes the production log: STANDARD "2027년 사업운" → RESPONSE_VALIDATION /
// TIMING_CLAIM_MISMATCH / SEMANTIC_REJECTED. Root cause: 세운 grounding covered only the CURRENT
// year, so the questioned year was never an anchor. Fix: buildMyungriEvidence now computes the
// questioned year's 세운 from the frozen engine → it is grounded AND anchored. The validator is
// NOT weakened: a year the user did NOT ask (ungrounded) is still rejected.
describe('TIMING_CLAIM_MISMATCH fix — question-targeted 세운 grounding (§2)', () => {
  // NOW = 2024-01-15 (before 立春 → current 사주 year 2023). A 2027 question must ground 2027.
  let G2027: Awaited<ReturnType<typeof buildConsultationGrounding>>;
  beforeAll(async () => {
    clearZiweiCache();
    clearQimenCache();
    G2027 = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: NOW }, '2027년 사업운은 어때?');
  });

  it('grounding now anchors the questioned year (2027) via a real frozen 세운', () => {
    expect(G2027.status).toBe('available');
    if (G2027.status === 'available') {
      expect(G2027.evidence.myungri.timingAnchors?.years).toContain(2027);
    }
  });
  it('a grounded 2027 answer is ACCEPTED (previously TIMING_CLAIM_MISMATCH)', () => {
    const core = '2027년에는 사업 흐름이 점차 안정되며, 무리한 확장보다 검증된 분야에 집중하는 편이 유리한 해로 보입니다.';
    expect(firstStructuredRejectionReason(answer(core), G2027)).toBe('NONE');
    expect(classifyConsultationOutput(answer(core), G2027).kind).toBe('ACCEPTED');
  });
  it('a NON-asked, ungrounded year (2035) is STILL rejected — validator not weakened', () => {
    const core = '2035년에는 반드시 사업이 크게 번창하고 큰돈을 벌게 되는 시기가 찾아옵니다.';
    expect(firstStructuredRejectionReason(answer(core), G2027)).toBe('TIMING_CLAIM_MISMATCH');
  });
});

// Reproduces + fixes the live failure: "앞으로 10년 사업 흐름 알려줘" → safe fallback. Root cause: the
// resolver had no forward-DURATION parsing, so a range question grounded ZERO extra years → the DEEP
// multi-year answer was ungrounded → TIMING_CLAIM_MISMATCH. Fix: resolveQuestionYears expands the range
// and each year's 세운 is computed from the frozen engine.
describe('multi-year range grounding — "앞으로 N년" (Temporal Sprint §8/§12)', () => {
  // NOW = 2024-01-15 (current 사주 year 2023). "앞으로 5년" grounds 2023..2027.
  let G5: Awaited<ReturnType<typeof buildConsultationGrounding>>;
  beforeAll(async () => {
    clearZiweiCache();
    clearQimenCache();
    G5 = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: NOW }, '앞으로 5년 사업 흐름 알려줘');
  });

  it('anchors EVERY year in the requested range (a real frozen 세운 per year)', () => {
    expect(G5.status).toBe('available');
    if (G5.status === 'available') {
      const years = G5.evidence.myungri.timingAnchors?.years ?? [];
      for (const y of [2023, 2024, 2025, 2026, 2027]) expect(years).toContain(y);
    }
  });
  it('an answer within the range (2027) is ACCEPTED', () => {
    const core = '앞으로 몇 해는 기반을 다지는 흐름이고, 2027년 무렵에는 확장의 기회가 조금씩 열리는 편으로 보입니다.';
    expect(firstStructuredRejectionReason(answer(core), G5)).toBe('NONE');
  });
  it('an answer BEYOND the range (2035) is STILL rejected — validator not weakened', () => {
    const core = '2035년에는 반드시 큰 성공과 큰돈이 따라오는 해가 될 것입니다.';
    expect(firstStructuredRejectionReason(answer(core), G5)).toBe('TIMING_CLAIM_MISMATCH');
  });
});

// SEMANTIC_GUARD_STABILIZATION — reproduces + fixes two false positives found while root-causing the
// FINAL DIVINATION CONSULTATION QA's remaining rejections (both confirmed via a real OpenAI call, not
// inferred from aggregate numbers):
//  1. CONSENSUS_CLAIM_MISMATCH fired on the ordinary word "합치다" (combine/synthesize) used in an honest
//     multi-discipline SUMMARY sentence ("세 학문을 합치면…"), not an actual "all three agree" claim.
//  2. TIMING_CLAIM_MISMATCH fired on the mere token "올해" even when the sentence explicitly DECLINED to
//     give a specific-period judgment for it ("올해 하반기 근거는 제공되지 않아 평가가 어렵습니다").
describe('CONSENSUS_CLAIM_MISMATCH false positive — "합치다" (combine) is not "일치" (agree)', () => {
  let G: Awaited<ReturnType<typeof buildConsultationGrounding>>;
  beforeAll(async () => {
    clearZiweiCache(); clearQimenCache();
    G = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: NOW }, '내 성격의 장단점을 알려줘');
  });

  it('an honest multi-discipline synthesis sentence ("세 학문을 합치면…") is ACCEPTED, not flagged as fabricated consensus', () => {
    const core = `${CLEAN} 명리 관점과 자미두수 관점, 기문둔갑 관점을 각각 살펴보았습니다. 세 학문을 합치면, 지금은 범위를 좁혀 안정적으로 움직이는 편이 유리하다는 결론입니다.`;
    expect(classifyConsultationOutput(answer(core), G).kind).toBe('ACCEPTED');
    expect(firstStructuredRejectionReason(answer(core), G)).toBe('NONE');
  });

  it('REGRESSION — a genuine fabricated 3-engine consensus ("완전히 일치") is still rejected', () => {
    expect(classifyConsultationOutput(answer(THREE), G).kind).toBe('SEMANTIC_REJECTED');
    expect(firstStructuredRejectionReason(answer(THREE), G)).toBe('CONSENSUS_CLAIM_MISMATCH');
  });

  it('REGRESSION — the two-engine "완전히 일치/합치" consensus guard is untouched and still rejects', () => {
    expect(firstStructuredRejectionReason(answer(CROSS), G)).toBe('CROSS_ENGINE_CONSENSUS');
  });
});

describe('TIMING_CLAIM_MISMATCH false positive — a hedged/declined relative-year mention is not a claim', () => {
  let G: Awaited<ReturnType<typeof buildConsultationGrounding>>;
  beforeAll(async () => {
    clearZiweiCache(); clearQimenCache();
    // A non-timing question — the current civil year is NOT among the grounded timing anchors.
    G = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: NOW }, '내 성격의 장단점을 알려줘');
  });

  it('an ungrounded "올해" mention that explicitly declines a specific-period judgment is ACCEPTED', () => {
    const core = `${CLEAN} 다만 구체적인 올해 하반기 시기 근거는 제공되지 않아 정확한 시점 평가는 어렵습니다.`;
    expect(classifyConsultationOutput(answer(core), G).kind).toBe('ACCEPTED');
    expect(firstStructuredRejectionReason(answer(core), G)).toBe('NONE');
  });

  it('REGRESSION — an UNHEDGED, asserted "올해" claim with no grounded current year is still rejected', () => {
    const core = `${CLEAN} 올해 하반기에는 큰 변화가 찾아옵니다.`;
    expect(firstStructuredRejectionReason(answer(core), G)).toBe('TIMING_CLAIM_MISMATCH');
  });

  it('REGRESSION — explicit-year (YYYY년) fabrication outside any hedge is still rejected (this check is untouched)', () => {
    const core = '2035년에는 반드시 큰 성공과 큰돈이 따라오는 해가 될 것입니다.';
    expect(firstStructuredRejectionReason(answer(core), G)).toBe('TIMING_CLAIM_MISMATCH');
  });
});
