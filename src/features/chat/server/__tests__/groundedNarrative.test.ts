// GROUNDED CONSULTATION NARRATIVE V2 — structural proof that the NORMAL product path makes the independent
// review's failure taxonomy impossible, not merely discouraged. Each describe block maps to one lettered
// requirement of the batch brief (§17 A–M).
//
// These tests exercise the real, pure presentation modules (no LLM, no network): the claim catalog / plan
// builder, the fact gate, the server-materialized sections, and the deterministic fallback.
import {
  buildConsultationContentPlan, type ConsultationContentPlan,
} from '@/features/chat/server/consultationContentPlan';
import {
  buildGroundedNarrativePlan, composeGroundedFallback, gateAgainstGroundedNarrative,
  narrativeIntentOf, renderGroundedSections, stripScaffold, untraceableFacts,
  type GroundedNarrativePlan,
} from '@/features/chat/server/groundedNarrative';
import { applyVerdictAuthorityClamp } from '@/features/chat/server/buildServerConsultation';
import type { ConsultationOutcome, ParsedStructuredConsultation } from '@/features/chat/prompts/structuredConsultation';
import type {
  CrossDivinationVerdict, DisciplineContribution, DivinationJudgment, JudgmentEvidence,
} from '@/features/divination/contracts';

function ev(overrides: Partial<JudgmentEvidence>): JudgmentEvidence {
  return {
    fact: '일지 육합', meaning: '테스트 근거 의미', domain: 'GENERAL', temporalScope: 'NATAL', directness: 'GENERAL',
    ...overrides,
  };
}

function mkJudgment(overrides: Partial<DivinationJudgment>): DivinationJudgment {
  return {
    discipline: 'MYUNGRI', applicable: true, dataReliability: 'EXACT',
    questionDomain: 'OPPORTUNITY', temporalScope: 'NATAL', stance: 'FOR',
    dominantConclusion: '테스트 결론', dominantFactor: '테스트 근거',
    directEvidence: [], counterEvidence: [], internalContradictions: [],
    timingSignals: [], domainSubJudgments: [],
    confidence: 'MEDIUM', questionDirectness: 'DIRECT', evidenceStrength: 'STRONG',
    factGroupsUsed: [],
    ...overrides,
  };
}

function mkVerdict(overrides: Partial<CrossDivinationVerdict> = {}): CrossDivinationVerdict {
  return {
    question: '지금 이 사업 시작해도 될까?',
    questionDomain: 'OPPORTUNITY',
    questionIntent: 'DECISION',
    evaluatedAtEpochSeconds: null,
    asksTiming: false,
    premises: [],
    primaryConclusion: '지금 시작하시는 쪽이 맞습니다.',
    headlinePropositionIds: [],
    direction: 'FOR',
    dominantBasis: '명리',
    disciplineJudgments: [
      mkJudgment({
        discipline: 'MYUNGRI',
        directEvidence: [
          ev({ fact: '재성 통근', meaning: '돈이 들어오는 통로가 열려 있습니다', domain: 'OPPORTUNITY', directness: 'DIRECT' }),
        ],
        counterEvidence: [
          ev({ fact: '편관 혼잡', meaning: '외부 압박이 함께 옵니다', domain: 'OPPORTUNITY', directness: 'DIRECT' }),
        ],
      }),
    ],
    contributions: [] as DisciplineContribution[],
    axisVerdicts: [],
    propositions: [],
    agreementPoints: ['두 체계가 같은 방향을 가리킵니다'],
    contradictionPoints: [],
    contradictionResolutions: [],
    natalBaseline: '타고난 바탕에 확장의 힘이 있습니다',
    currentFlow: '지금 흐름이 그 바탕을 지지합니다',
    timingConclusion: null,
    favorableFactors: [],
    riskFactors: [],
    actionableInterpretation: '단계적으로 확장하며 검증하십시오',
    confidence: 'MEDIUM',
    confidenceReason: '테스트',
    evidenceReferences: [{ discipline: 'MYUNGRI', lines: ['재성 통근 — 돈이 들어오는 통로'] }],
    verdictVersion: 'test',
    ...overrides,
  };
}

function planFor(v: CrossDivinationVerdict): { content: ConsultationContentPlan; grounded: GroundedNarrativePlan } {
  const content = buildConsultationContentPlan(v);
  return { content, grounded: buildGroundedNarrativePlan(v, content, 'DECISION') };
}

const answer = (o: Partial<ParsedStructuredConsultation> = {}): ParsedStructuredConsultation => ({
  coreSummary: '지금 시작하셔도 좋은 흐름입니다.',
  coreInterpretation: '돈이 들어오는 통로가 열려 있고, 지금 흐름이 그 바탕을 지지합니다.',
  strengths: ['실행한 만큼 결과로 이어지기 쉬운 시기입니다'],
  cautions: ['외부 압박이 함께 오니 속도는 조절하십시오'],
  domainInterpretation: [{ title: '사업', body: '규모보다 구조를 먼저 단단히 하시는 편이 유리합니다.' }],
  followUps: ['어떤 부분부터 준비하면 좋을까요?'],
  ...o,
});

// ── A. unsupported 대운 age range ─────────────────────────────────────────────────────────────────────
describe('A — an unsupported 대운 age range cannot reach the user', () => {
  it('rejects an exact age range the authoritative material never supplied', () => {
    const { grounded } = planFor(mkVerdict());
    expect(untraceableFacts('28~37세 대운에는 재물이 크게 들어옵니다.', grounded)).toEqual(
      expect.arrayContaining(['28~37세']),
    );
  });

  it('accepts the exact range when the grounded corpus states it verbatim', () => {
    const { grounded } = planFor(mkVerdict({ timingConclusion: '28~37세 대운 구간이 이 흐름의 중심입니다' }));
    expect(untraceableFacts('28~37세 구간이 중심입니다.', grounded)).toEqual([]);
  });

  it('a fabricated range inside the core prose forces the deterministic composition', () => {
    const { grounded } = planFor(mkVerdict());
    const gated = gateAgainstGroundedNarrative(
      answer({ coreInterpretation: '36~45세 대운에서 크게 열립니다.' }),
      grounded,
    );
    expect(gated.fatal).toBe(true);
  });
});

// ── B. unsupported 세운 / 십신 characterization ──────────────────────────────────────────────────────
describe('B — unsupported 세운 / 십신 characterization cannot reach the user', () => {
  it('flags 십신 and time-layer labels absent from the grounded corpus', () => {
    const { grounded } = planFor(mkVerdict({ evidenceReferences: [], disciplineJudgments: [mkJudgment({})] }));
    const bad = untraceableFacts('세운의 정재가 들어와 재물이 늘어납니다.', grounded);
    expect(bad).toEqual(expect.arrayContaining(['세운', '정재']));
  });

  it('does NOT flag a 십신 label the judge itself supplied', () => {
    const { grounded } = planFor(mkVerdict());
    expect(untraceableFacts('재성이 자리를 잡고 있습니다.', grounded)).toEqual([]);
  });
});

// ── C. phantom palace ────────────────────────────────────────────────────────────────────────────────
describe('C — a phantom palace cannot reach the user', () => {
  it('flags a palace the chart material never mentioned', () => {
    const { grounded } = planFor(mkVerdict());
    expect(untraceableFacts('관록궁이 튼튼합니다.', grounded)).toEqual(['관록궁']);
  });
});

// ── D. wrong star-to-palace relationship ─────────────────────────────────────────────────────────────
describe('D — a wrong star→palace relationship cannot be assembled from valid parts', () => {
  it('valid 부처궁 + valid 화기 does NOT authorize attaching one to the other elsewhere', () => {
    const { grounded } = planFor(
      mkVerdict({
        evidenceReferences: [{ discipline: 'ZIWEI', lines: ['부처궁 삼방사정에 화록'] }],
      }),
    );
    // 부처궁 and 화록 are both grounded; 명궁 and 화기 are not — the recombination is caught by its parts.
    expect(untraceableFacts('명궁에 화기가 들어옵니다.', grounded)).toEqual(
      expect.arrayContaining(['명궁', '화기']),
    );
  });
});

// ── E. wrong pillar relationship ─────────────────────────────────────────────────────────────────────
describe('E — a wrong pillar relationship cannot reach the user', () => {
  it('flags a pillar position the grounded material never named', () => {
    const { grounded } = planFor(
      mkVerdict({ evidenceReferences: [{ discipline: 'MYUNGRI', lines: ['일지 육합'] }] }),
    );
    expect(untraceableFacts('월지가 충을 맞고 있습니다.', grounded)).toEqual(['월지']);
    expect(untraceableFacts('일지 쪽이 움직입니다.', grounded)).toEqual([]);
  });
});

// ── F. wrong discipline attribution ──────────────────────────────────────────────────────────────────
describe('F — discipline attribution is server-owned', () => {
  it('every catalog claim carries the discipline that actually produced it', () => {
    const { grounded } = planFor(mkVerdict());
    for (const c of grounded.claims) {
      expect(['MYUNGRI', 'ZIWEI', 'QIMEN', 'CROSS']).toContain(c.discipline);
      expect(c.provenance.length).toBeGreaterThan(0);
    }
    const evidence = grounded.claims.filter((c) => c.role === 'EVIDENCE');
    expect(evidence.every((c) => c.discipline === 'MYUNGRI')).toBe(true);
  });

  it('Ziwei vocabulary is unusable when only Myungri spoke', () => {
    const { grounded } = planFor(mkVerdict());
    expect(untraceableFacts('자미두수로 보면 탐랑이 강합니다.', grounded)).toEqual(
      expect.arrayContaining(['자미', '탐랑']),
    );
  });
});

// ── G. polarity inversion ────────────────────────────────────────────────────────────────────────────
describe('G — the authoritative stance survives into the rendered claim', () => {
  it('a COUNTER evidence atom is catalogued as LIMIT and rendered verbatim, never flipped', () => {
    const { grounded } = planFor(mkVerdict());
    const limit = grounded.claims.find((c) => c.role === 'EVIDENCE' && c.polarity === 'LIMIT');
    expect(limit?.authoritativeMeaning).toBe('외부 압박이 함께 옵니다');
    expect(composeGroundedFallback(grounded).cautions).toContain('외부 압박이 함께 옵니다');
  });

  it('a compound meaning stays atomic — never split into only its favorable half', () => {
    const compound = '돈이 들어오는 쪽은 막혀 있고, 남는 쪽은 열려 있습니다';
    const { grounded } = planFor(
      mkVerdict({
        disciplineJudgments: [
          mkJudgment({ directEvidence: [ev({ fact: '재성 통근', meaning: compound, directness: 'DIRECT' })] }),
        ],
      }),
    );
    expect(grounded.claims.some((c) => c.authoritativeMeaning === compound)).toBe(true);
  });
});

// ── H. Cross contradiction → false consensus ─────────────────────────────────────────────────────────
describe('H — cross synthesis is server-planned', () => {
  it('a Cross contradiction resolution is rendered as an authoritative section, not left to the LLM', () => {
    const { grounded } = planFor(
      mkVerdict({
        agreementPoints: [],
        contradictionPoints: ['방향은 같지만 시기가 다릅니다'],
        contradictionResolutions: [
          {
            kind: 'TEMPORAL_DECOMPOSITION', between: ['MYUNGRI', 'ZIWEI'],
            conflict: '명리는 지금, 자미두수는 나중을 가리킵니다',
            resolution: '방향은 같고 실행 시점만 다릅니다',
            dominant: 'MYUNGRI', whyOtherDidNotDominate: '시기 축이 더 좁게 잡힙니다',
          },
        ],
      }),
    );
    const sections = renderGroundedSections(grounded);
    const why = sections.find((s) => s.title === '왜 이렇게 보나요');
    expect(why?.body).toContain('명리는 지금, 자미두수는 나중을 가리킵니다');
    expect(why?.body).toContain('방향은 같고 실행 시점만 다릅니다');
  });

  it('claims exist for both reinforcement and contradiction material, with the resolution attributed', () => {
    const { grounded } = planFor(mkVerdict());
    expect(grounded.contradictionClaims.length).toBeGreaterThan(0);
    expect(grounded.claims.find((c) => c.role === 'SYNTHESIS')?.authoritativeMeaning).toBe(
      '두 체계가 같은 방향을 가리킵니다',
    );
  });
});

// ── I. unsupported futureFlow ────────────────────────────────────────────────────────────────────────
describe('I — futureFlow exists only on an authoritative temporal claim', () => {
  it('is dropped entirely when the verdict supplied no timing conclusion', () => {
    const { grounded } = planFor(mkVerdict({ timingConclusion: null }));
    expect(grounded.timingClaims).toHaveLength(0);
    const gated = gateAgainstGroundedNarrative(answer({ futureFlow: '앞으로 흐름이 더 좋아집니다.' }), grounded);
    expect(gated.fatal).toBe(false);
    expect(gated.result.futureFlow).toBeUndefined();
  });

  it('survives when a grounded temporal claim exists and the prose stays inside it', () => {
    const { grounded } = planFor(mkVerdict({ timingConclusion: '올해 후반부터 흐름이 열립니다' }));
    const gated = gateAgainstGroundedNarrative(answer({ futureFlow: '올해 후반부터 조금씩 열립니다.' }), grounded);
    expect(gated.result.futureFlow).toBe('올해 후반부터 조금씩 열립니다.');
  });

  it('the deterministic composition also omits the section with no grounded time', () => {
    const { grounded } = planFor(mkVerdict({ timingConclusion: null }));
    expect(composeGroundedFallback(grounded).futureFlow).toBeUndefined();
  });
});

// ── J. NOT_COVERED != CALCULATION_FAILED ─────────────────────────────────────────────────────────────
describe('J — a coverage gap is never described as a calculation failure', () => {
  it('records the uncovered discipline as a coverage gap', () => {
    const { grounded } = planFor(
      mkVerdict({
        contributions: [{ discipline: 'QIMEN', applied: false, contribution: '이 축을 직접 다루는 판단 경로가 없습니다' }] as DisciplineContribution[],
      }),
    );
    expect(grounded.coverageGaps).toEqual(['QIMEN']);
  });

  it('rejects prose that reframes the gap as an engine failure', () => {
    const { grounded } = planFor(mkVerdict());
    expect(untraceableFacts('기문둔갑은 계산이 실패했습니다.', grounded)).toContain('NOT_COVERED_AS_FAILURE');
    expect(untraceableFacts('이 부분은 직접 다루지 않았습니다.', grounded)).toEqual([]);
  });
});

// ── K. gate failure → grounded deterministic composition ─────────────────────────────────────────────
describe('K — a failed stylistic rendering falls back to grounded composition, not fabricated prose', () => {
  it('produces a substantive answer built only from authoritative claims', () => {
    const { grounded } = planFor(mkVerdict({ timingConclusion: '올해 후반부터 흐름이 열립니다' }));
    const fallback = composeGroundedFallback(grounded);
    expect(fallback.coreSummary).toBe('지금 시작하시는 쪽이 맞습니다.');
    expect(fallback.coreInterpretation).toContain('타고난 바탕에 확장의 힘이 있습니다');
    expect(fallback.coreInterpretation).toContain('지금 흐름이 그 바탕을 지지합니다');
    expect(fallback.futureFlow).toBe('올해 후반부터 흐름이 열립니다');
    expect((fallback.domainInterpretation ?? []).length).toBeGreaterThan(0);
  });

  it('never repeats the headline as the body, and never repeats a section the caller already renders', () => {
    const { grounded } = planFor(mkVerdict());
    const fallback = composeGroundedFallback(grounded);
    expect(fallback.coreInterpretation).not.toBe(fallback.coreSummary);
    expect(fallback.coreInterpretation).not.toContain(fallback.coreSummary as string);
    const titles = (fallback.domainInterpretation ?? []).map((d) => d.title);
    const serverTitles = renderGroundedSections(grounded).map((s) => s.title);
    expect(titles.filter((t) => serverTitles.includes(t))).toEqual([]);
  });

  it('falls back to the conclusion as the body only when no baseline/flow was supplied', () => {
    const { grounded } = planFor(mkVerdict({ natalBaseline: null, currentFlow: null }));
    expect(composeGroundedFallback(grounded).coreInterpretation).toBe('지금 시작하시는 쪽이 맞습니다.');
  });

  it('every sentence of the composition traces back to a grounded claim', () => {
    const { grounded } = planFor(mkVerdict());
    const fallback = composeGroundedFallback(grounded);
    const body = [
      fallback.coreSummary, fallback.coreInterpretation,
      ...(fallback.strengths ?? []), ...(fallback.cautions ?? []),
    ].join(' ');
    expect(untraceableFacts(body, grounded)).toEqual([]);
  });
});

// ── L. user-visible technical evidence is always traceable ───────────────────────────────────────────
describe('L — every server-rendered section traces to a supplied claim', () => {
  it('the grounded sections quote claim meanings verbatim', () => {
    const { grounded } = planFor(mkVerdict({ timingConclusion: '올해 후반부터 흐름이 열립니다' }));
    const meanings = new Set(grounded.claims.map((c) => c.authoritativeMeaning));
    for (const s of renderGroundedSections(grounded)) {
      expect([...meanings].some((m) => s.body.includes(m))).toBe(true);
    }
  });
});

// ── M. language-only fields cannot introduce a fact ──────────────────────────────────────────────────
describe('M — language-only fields carry language, never new product facts', () => {
  it('strips an offending list item while keeping the rest of the answer', () => {
    const { grounded } = planFor(mkVerdict());
    const gated = gateAgainstGroundedNarrative(
      answer({
        strengths: ['실행한 만큼 결과로 이어지기 쉬운 시기입니다', '관록궁이 튼튼해 승진운이 좋습니다'],
        followUps: ['어떤 부분부터 준비하면 좋을까요?', '탐랑의 영향은 어떤가요?'],
      }),
      grounded,
    );
    expect(gated.fatal).toBe(false);
    expect(gated.result.strengths).toEqual(['실행한 만큼 결과로 이어지기 쉬운 시기입니다']);
    expect(gated.result.followUps).toEqual(['어떤 부분부터 준비하면 좋을까요?']);
    expect(gated.violations).toEqual(expect.arrayContaining(['관록궁', '탐랑']));
  });

  it('a clean answer passes through untouched', () => {
    const { grounded } = planFor(mkVerdict());
    const original = answer();
    const gated = gateAgainstGroundedNarrative(original, grounded);
    expect(gated.fatal).toBe(false);
    expect(gated.violations).toEqual([]);
    expect(gated.result.coreSummary).toBe(original.coreSummary);
    expect(gated.result.strengths).toEqual(original.strengths);
  });

  it('ordinary consumer Korean is not falsely flagged as jargon', () => {
    const { grounded } = planFor(mkVerdict());
    const ordinary =
      '형제나 부모와 상의해 보셔도 좋고, 자녀 문제와는 상관없습니다. 인성이 좋은 분들과 함께 하시면 태양처럼 밝은 시기가 옵니다.';
    expect(untraceableFacts(ordinary, grounded)).toEqual([]);
  });
});

// ── §16 output hygiene + §14 question-intent-aware decline ───────────────────────────────────────────
describe('§16 — prompt-scaffold artifacts never reach the user', () => {
  it('removes example scaffolding and internal field names', () => {
    expect(stripScaffold('올해(예시로 제시된 해)는 흐름이 좋습니다.')).toBe('올해는 흐름이 좋습니다.');
    expect(stripScaffold('coreSummary 이 흐름은 좋습니다.')).toBe('이 흐름은 좋습니다.');
  });
});

describe('§14 — a declined answer speaks in the shape of the question that was asked', () => {
  const declined = mkVerdict({ direction: 'INSUFFICIENT_EVIDENCE', question: '왜 연애에서 자꾸 상처받을까?' });
  const outcome = (r: ParsedStructuredConsultation): ConsultationOutcome => ({ kind: 'ACCEPTED', result: r });

  it('maps the already-computed question intent without a new classifier', () => {
    expect(narrativeIntentOf('CAUSE_WHY', false)).toBe('EXPLANATION');
    expect(narrativeIntentOf('DESCRIPTIVE', false)).toBe('TRAIT');
    expect(narrativeIntentOf('TIMING', false)).toBe('TIMING');
    expect(narrativeIntentOf('DECISION', false)).toBe('DECISION');
    expect(narrativeIntentOf('DECISION', true)).toBe('COMPARISON');
  });

  it('a WHY question does not get decision language, and stays non-directional', () => {
    const clamped = applyVerdictAuthorityClamp(outcome(answer()), declined, 'EXPLANATION');
    expect(clamped?.coreSummary).toContain('원인을 한 가지로 단정하기보다');
    expect(clamped?.coreSummary).not.toContain('큰 결정을 바로 확정하기보다');
    expect(clamped?.coreSummary).toContain('한쪽 방향을 확정하기 어렵습니다');
  });

  it('a decision question keeps the original wording (default preserved)', () => {
    expect(applyVerdictAuthorityClamp(outcome(answer()), declined)?.coreSummary).toContain(
      '큰 결정을 바로 확정하기보다',
    );
  });
});

describe('determinism — the same verdict always yields the same plan', () => {
  it('two builds are byte-identical', () => {
    const v = mkVerdict({ timingConclusion: '올해 후반부터 흐름이 열립니다' });
    const a = planFor(v).grounded;
    const b = planFor(v).grounded;
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});
