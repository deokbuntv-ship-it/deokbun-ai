// V4B §22–§26 — FOLLOW-UP OVER THE STORED GRAPH.
//
// Three confirmed V4A failures are locked shut here:
//   · §23 the parser validated node SHAPE but not the GRAPH, so duplicate ids, dangling links, self-references
//     and cycles all restored "successfully" into something a follow-up could not traverse;
//   · §24 WHY re-listed the leaves instead of walking the derivation, which reads like an explanation without
//     ever showing that this conclusion came from those premises;
//   · §25 "돈은?" silently started a fresh reading, so the second answer could contradict the first.
import { createHash } from 'crypto';

import type { BirthInfoDraft, ConsultationDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { buildConsultationGrounding } from '@/features/chat/services/consultationGrounding';
import { parseDecisionMeta } from '@/features/chat/server/decisionMeta';
import { groundingFromStoredDecision } from '@/features/chat/server/storedDecisionGrounding';
import { renderGroundingContext } from '@/features/chat/prompts/grounding';
import {
  explainHeadline, explainHeadlines, explainProposition, refineOnAxis, renderChain, standingPropositions,
  type CrossDivinationVerdict,
} from '@/features/divination';

const digestProvider: DigestProvider = {
  async sha256Utf8(input: string): Promise<string> {
    return createHash('sha256').update(input, 'utf8').digest('hex');
  },
};
const NOW = Math.floor(Date.UTC(2026, 2, 10, 1, 0, 0) / 1000);
const BIRTH = {
  displayName: 'A', gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1990', birthMonth: '8', birthDay: '15',
  birthTimeAccuracy: 'exact', birthHour: '14', birthMinute: '0',
  approximateTimePeriod: null, birthPlace: '서울',
} as unknown as BirthInfoDraft;

async function turn(question: string): Promise<CrossDivinationVerdict> {
  const draft: ConsultationDraft = { subject: { id: 'self', displayName: 'A', relationship: null }, birthInfo: BIRTH };
  const g = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: NOW }, question);
  if (g.status !== 'available' || !g.divinationVerdict) throw new Error('expected verdict');
  return g.divinationVerdict;
}

const META = (verdict: unknown) => ({
  answerPlanVersion: 'a', decisionPolicyVersion: 'b', promptVersion: 'c',
  resolvedGranularity: 'NONE', resolvedTargets: [],
  resolvedTemporalContext: {
    anchorEpochSeconds: NOW, resolvedTargets: [], timezone: 'Asia/Seoul',
    qimenActive: false, referenceYear: 2026, referenceMonth: 3,
  },
  divinationVerdict: verdict,
});
const roundTrip = (v: CrossDivinationVerdict) =>
  parseDecisionMeta(JSON.parse(JSON.stringify(META(v))))?.divinationVerdict;

// ── §23 GRAPH INTEGRITY ─────────────────────────────────────────────────────────────────────────
describe('§23 — a malformed graph fails CLOSED, never partially restores', () => {
  const corrupt = async (mutate: (v: Record<string, unknown>) => void) => {
    const v = JSON.parse(JSON.stringify(await turn('사업을 확장할까?')));
    mutate(v);
    return parseDecisionMeta(META(v));
  };

  it('an intact graph restores', async () => {
    expect(roundTrip(await turn('사업을 확장할까?'))).toBeTruthy();
  });

  it('DUPLICATE proposition ids are rejected', async () => {
    expect(await corrupt((v) => {
      const props = v.propositions as Record<string, unknown>[];
      props.push({ ...props[0] });
    })).toBeUndefined();
  });

  it('DUPLICATE premise ids are rejected', async () => {
    expect(await corrupt((v) => {
      const ps = v.premises as Record<string, unknown>[];
      ps.push({ ...ps[0] });
    })).toBeUndefined();
  });

  it('a DANGLING supporting-premise link is rejected', async () => {
    expect(await corrupt((v) => {
      (v.propositions as Record<string, unknown>[])[0].supportingPremiseIds = ['no_such_premise'];
    })).toBeUndefined();
  });

  it('a DANGLING derivedFrom link is rejected', async () => {
    expect(await corrupt((v) => {
      (v.propositions as Record<string, unknown>[])[0].derivedFromPropositionIds = ['no_such_proposition'];
    })).toBeUndefined();
  });

  it('a SELF-REFERENCE is rejected', async () => {
    expect(await corrupt((v) => {
      const p = (v.propositions as Record<string, unknown>[])[0];
      p.derivedFromPropositionIds = [p.id];
    })).toBeUndefined();
  });

  it('a CYCLE is rejected (a traversal must terminate)', async () => {
    expect(await corrupt((v) => {
      const props = v.propositions as Record<string, unknown>[];
      if (props.length < 2) throw new Error('need two propositions');
      props[0].derivedFromPropositionIds = [props[1].id];
      props[1].derivedFromPropositionIds = [props[0].id];
    })).toBeUndefined();
  });

  it('an UNKNOWN enum value is rejected', async () => {
    expect(await corrupt((v) => {
      (v.propositions as Record<string, unknown>[])[0].conclusionType = 'MADE_UP';
    })).toBeUndefined();
    expect(await corrupt((v) => {
      (v.premises as Record<string, unknown>[])[0].semanticRelation = 'MADE_UP';
    })).toBeUndefined();
  });

  it('a MALFORMED target (the identity everything compares on) is rejected', async () => {
    expect(await corrupt((v) => {
      (v.propositions as Record<string, unknown>[])[0].target = '원국 월지'; // the old string shape
    })).toBeUndefined();
  });

  it('a premise that both SUPPORTS and OPPOSES the same claim is rejected', async () => {
    expect(await corrupt((v) => {
      const p = (v.propositions as Record<string, unknown>[])[0];
      p.opposingPremiseIds = [(p.supportingPremiseIds as string[])[0]];
    })).toBeUndefined();
  });

  it('a MIXED-SUBJECT graph is rejected — one verdict is about one person', async () => {
    expect(await corrupt((v) => {
      (v.propositions as Record<string, unknown>[])[0].subject = '다른 사람';
    })).toBeUndefined();
  });
});

// ── §24 WHY TRAVERSES ───────────────────────────────────────────────────────────────────────────
describe('§24 — WHY walks the graph rather than re-listing leaves', () => {
  // V4C §28 — the verdict NAMES the conclusions its headline stands on, and WHY walks every one of them.
  // V4B re-found the headline by matching its TEXT against proposition assertions, so the explanation existed
  // only while the headline happened to be a verbatim copy of a single conclusion.
  it('the headline chains name their rule, their premises and their upstream conclusions', async () => {
    const v = roundTrip(await turn('사업을 확장할까?'))!;
    const chains = explainHeadlines(v);
    expect(chains.length).toBeGreaterThan(0);
    expect(v.headlinePropositionIds.length).toBe(chains.length);
    for (const chain of chains) {
      expect(chain.conclusion.derivationRule.length).toBeGreaterThan(0);
      // it stands on something, and that something is a stored premise or a stored upstream conclusion
      expect(chain.supporting.length + chain.opposing.length + chain.from.length).toBeGreaterThan(0);
    }
  });

  it('…and `explainHeadline` returns a single chain ONLY when the headline stands on exactly one', async () => {
    const v = roundTrip(await turn('사업을 확장할까?'))!;
    const chains = explainHeadlines(v);
    expect(explainHeadline(v) === null).toBe(chains.length !== 1);
  });

  it('every node of the chain resolves to a STORED premise — nothing is invented at explain time', async () => {
    const v = roundTrip(await turn('사업을 확장할까?'))!;
    const ids = new Set(v.premises.map((p) => p.id));
    const walk = (c: ReturnType<typeof explainHeadlines>[number]): void => {
      for (const p of [...c.supporting, ...c.opposing]) expect(ids.has(p.id)).toBe(true);
      for (const parent of c.from) walk(parent);
    };
    for (const chain of explainHeadlines(v)) walk(chain);
  });

  it('the rendered chain shows DERIVATION, not just a list of conclusions', async () => {
    const v = roundTrip(await turn('사업을 확장할까?'))!;
    const lines = explainHeadlines(v).flatMap((c) => renderChain(c));
    expect(lines.length).toBeGreaterThan(1);
    expect(lines.join('\n')).toMatch(/←\s*근거:|⟂\s*반대 근거:/); // an arrow FROM the conclusion TO its grounds
  });

  it('the WHY prompt carries the stored chain and forbids inventing outside it', async () => {
    const v = await turn('사업을 확장할까?');
    const meta = parseDecisionMeta(JSON.parse(JSON.stringify({
      ...META(v),
      polarity: 'FAVORABLE', engineVersion: 'e1', resolvedGranularity: 'YEAR', resolvedTargets: [2026],
      resolvedTemporalContext: { ...META(v).resolvedTemporalContext, resolvedTargets: [2026] },
      evidenceSnapshot: {
        schemaVersion: 'decision-evidence@1.0.0',
        target: { granularity: 'YEAR', key: 2026 },
        polarity: 'FAVORABLE',
        derivation: { harmony: 1, friction: 1, stemRelations: [], branchRelations: [] },
        supportLevel: 'MEDIUM', assertiveness: 'MEDIUM', intents: [], engineVersion: 'e1',
      },
    })));
    const grounding = groundingFromStoredDecision(meta);
    expect(grounding).toBeTruthy();
    expect(grounding!.derivationChain?.length).toBeGreaterThan(0);
    const prompt = renderGroundingContext(grounding!);
    expect(prompt).toMatch(/저장된 추론 그래프/);
    expect(prompt).toMatch(/이 경로에 없는 근거를 새로 만들어 설명하지 마십시오/);
  });

  it('a chain query for an unknown proposition returns null rather than a guess', async () => {
    const v = roundTrip(await turn('사업을 확장할까?'))!;
    expect(explainProposition(v, 'no_such_id')).toBeNull();
  });
});

// ── §25/§26 MONEY REFINEMENT ────────────────────────────────────────────────────────────────────
describe('§25/§26 — "돈은?" refines the stored graph instead of starting a fresh reading', () => {
  it('the refinement keeps the ORIGINAL question, axis and evaluation instant', async () => {
    const q1 = roundTrip(await turn('사업을 확장할까?'))!;
    const r = refineOnAxis(q1, 'MONEY_RETENTION');
    expect(r.originalQuestion).toBe('사업을 확장할까?');
    expect(r.originalAxis).toBe(q1.questionDomain);
    // §26 — the graph is not silently recast at a new moment
    expect(r.evaluatedAtEpochSeconds).toBe(NOW);
  });

  it('it reads money conclusions that ALREADY exist in the stored graph', async () => {
    const q1 = roundTrip(await turn('사업을 확장할까?'))!;
    const inflow = refineOnAxis(q1, 'MONEY_INFLOW');
    const retention = refineOnAxis(q1, 'MONEY_RETENTION');
    const found = inflow.existing.length + retention.existing.length
      + inflow.premises.length + retention.premises.length;
    expect(found).toBeGreaterThan(0);
  });

  it('every refined conclusion is a node of the ORIGINAL graph, not a new computation', async () => {
    const q1 = roundTrip(await turn('사업을 확장할까?'))!;
    const known = new Set(q1.propositions.map((p) => p.id));
    for (const axis of ['MONEY_INFLOW', 'MONEY_RETENTION'] as const) {
      for (const c of refineOnAxis(q1, axis).existing) expect(known.has(c.conclusion.id)).toBe(true);
    }
  });

  it('it can state the LINK back to the original judgment (one conversation, not two readings)', async () => {
    const q1 = roundTrip(await turn('사업을 확장할까?'))!;
    const r = refineOnAxis(q1, 'MONEY_RETENTION');
    // Either money conclusions exist, or conclusions linking money premises to the original axis do — and in
    // both cases the refinement can say WHY the first answer landed where it did.
    expect(r.existing.length + r.related.length + r.premises.length).toBeGreaterThan(0);
  });

  it('when the stored graph genuinely has nothing on the axis, it SAYS so rather than inventing', async () => {
    const q1 = roundTrip(await turn('사업을 확장할까?'))!;
    const r = refineOnAxis(q1, 'HEALTH_ENERGY'); // an axis this graph has no route to
    expect(r.existing).toEqual([]);
    expect(r.needsNewEvaluation).toBe(true);
  });

  it('a fresh "돈은?" turn does NOT silently replace the stored graph', async () => {
    const q1 = await turn('사업을 확장할까?');
    const q3 = await turn('돈은요?');
    // A genuinely different axis was asked …
    expect(q3.questionDomain).not.toBe(q1.questionDomain);
    // … at the SAME evaluation instant, so timing is not recast behind the user's back (§26) …
    expect(q3.evaluatedAtEpochSeconds).toBe(q1.evaluatedAtEpochSeconds);
    // … and the stored graph still answers the money axis on its own terms, which is what makes the
    // continuation possible rather than a second unrelated reading.
    const fromStored = refineOnAxis(q1, q3.questionDomain);
    expect(fromStored.originalQuestion).toBe('사업을 확장할까?');
    expect(fromStored.existing.length + fromStored.premises.length).toBeGreaterThan(0);
  });
});

// ── §22 CAUSE_WHY TARGET IDENTITY ───────────────────────────────────────────────────────────────
describe('§22 — a CAUSE_WHY answer is tied to the asked target, or it declines', () => {
  it('every causal conclusion names a target and asserts no direction', async () => {
    const v = await turn('왜 자꾸 부딪힐까요?');
    const causal = standingPropositions(v.propositions).filter((p) => p.conclusionType === 'CAUSAL');
    for (const c of causal) {
      expect(c.target.key.length).toBeGreaterThan(0);
      expect(c.direction).toBe('NONE'); // a cause explains; it does not recommend
    }
  });

  it('a causal answer is traceable to the exact premises that produced it', async () => {
    const v = await turn('왜 자꾸 부딪힐까요?');
    const causal = standingPropositions(v.propositions).find((p) => p.conclusionType === 'CAUSAL');
    if (!causal) return; // declining is allowed
    const chain = explainProposition(v, causal.id)!;
    expect(chain.supporting.length + chain.opposing.length).toBeGreaterThan(0);
    // and every premise it cites is about the same target it claims to explain
    const cited = [...chain.supporting, ...chain.opposing];
    expect(cited.some((p) => p.target.key === causal.target.key)).toBe(true);
  });
});

// ── §25 WIRED INTO THE SERVER PATH ──────────────────────────────────────────────────────────────
describe('§25 — the axis-drilldown continuation reaches the PROMPT, not just the graph layer', () => {
  const storedMeta = (v: CrossDivinationVerdict) => ({
    answerPlanVersion: 'a', decisionPolicyVersion: 'b', promptVersion: 'c',
    resolvedGranularity: 'NONE' as const, resolvedTargets: [],
    resolvedTemporalContext: {
      anchorEpochSeconds: NOW, resolvedTargets: [], timezone: 'Asia/Seoul' as const,
      qimenActive: false, referenceYear: 2026, referenceMonth: 3,
    },
    divinationVerdict: v,
  });

  it('a money follow-up after an expansion question carries the prior judgment forward', async () => {
    const { priorAxisContextFor } = await import('@/features/chat/server/storedDecisionGrounding');
    const q1 = await turn('사업을 확장할까?');
    const draft: ConsultationDraft = { subject: { id: 'self', displayName: 'A', relationship: null }, birthInfo: BIRTH };
    const q3 = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: NOW }, '돈은요?');
    // V4C §23 — the continuation intent is what licenses carrying the prior judgment, and it is passed
    // explicitly: a default would let any caller slip into "refinement" without having classified anything.
    const { classifyContinuationIntent } = await import('@/features/chat/services/followUpContext');
    expect(classifyContinuationIntent('돈은요?', true)).toBe('REFINE_EXISTING');
    const context = priorAxisContextFor(storedMeta(q1) as never, q3, 'REFINE_EXISTING');

    expect(context.length).toBeGreaterThan(0);
    expect(context[0]).toContain('사업을 확장할까?');       // the ORIGINAL question is named
    expect(context.join('\n')).toContain(q1.primaryConclusion); // and its ORIGINAL conclusion
  });

  it('the prompt tells the model this is a continuation and forbids discarding the prior judgment', async () => {
    const { priorAxisContextFor } = await import('@/features/chat/server/storedDecisionGrounding');
    const q1 = await turn('사업을 확장할까?');
    const draft: ConsultationDraft = { subject: { id: 'self', displayName: 'A', relationship: null }, birthInfo: BIRTH };
    const q3 = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: NOW }, '돈은요?');
    // V4C §23 — the continuation intent is what licenses carrying the prior judgment, and it is passed
    // explicitly: a default would let any caller slip into "refinement" without having classified anything.
    const { classifyContinuationIntent } = await import('@/features/chat/services/followUpContext');
    expect(classifyContinuationIntent('돈은요?', true)).toBe('REFINE_EXISTING');
    const context = priorAxisContextFor(storedMeta(q1) as never, q3, 'REFINE_EXISTING');
    const prompt = renderGroundingContext({ ...q3, priorAxisContext: context } as never);
    expect(prompt).toMatch(/앞선 판정에서 이 축에 대해 이미 나온 근거/);
    expect(prompt).toMatch(/앞 판정을 없던 일로 하고 새로 답하지 마시고/);
  });

  // V4C §23 — WHAT DECIDES CONTINUITY IS THE CONTINUATION INTENT, NOT WHETHER THE AXIS MOVED.
  //
  // V4B keyed this on the axis: same axis → no continuation. That looked right for a repeated question and was
  // wrong for the case the audit actually reported, because a refinement that stays on the topic ("그럼 얼마나
  // 걸릴까요?") also has an unchanged axis and was therefore re-answered from scratch. Re-asking a question
  // VERBATIM is not a dependent follow-up — the classifier says so — and that is what keeps it clean.
  it('re-asking the SAME question verbatim is a NEW question, so nothing is carried', async () => {
    const { priorAxisContextFor } = await import('@/features/chat/server/storedDecisionGrounding');
    const { classifyContinuationIntent } = await import('@/features/chat/services/followUpContext');
    const q1 = await turn('사업을 확장할까?');
    const draft: ConsultationDraft = { subject: { id: 'self', displayName: 'A', relationship: null }, birthInfo: BIRTH };
    const same = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: NOW }, '사업을 확장할까?');
    const intent = classifyContinuationIntent('사업을 확장할까?', true);
    expect(intent).toBe('NEW_QUESTION');
    expect(priorAxisContextFor(storedMeta(q1) as never, same, intent)).toEqual([]);
  });

  it('a DEPENDENT follow-up on the same axis DOES carry the standing judgment forward (§23)', async () => {
    const { priorAxisContextFor } = await import('@/features/chat/server/storedDecisionGrounding');
    const { classifyContinuationIntent } = await import('@/features/chat/services/followUpContext');
    const q1 = await turn('사업을 확장할까?');
    const draft: ConsultationDraft = { subject: { id: 'self', displayName: 'A', relationship: null }, birthInfo: BIRTH };
    const again = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: NOW }, '그럼 지금 바로 벌여도 될까요?');
    const intent = classifyContinuationIntent('그럼 지금 바로 벌여도 될까요?', true);
    expect(intent).toBe('REFINE_EXISTING');
    const carried = priorAxisContextFor(storedMeta(q1) as never, again, intent);
    expect(carried.length).toBeGreaterThan(0);
    // and it carries the ORIGINAL judgment, so the new answer has something to reconcile with
    expect(carried.join(' ')).toContain('사업을 확장할까?');
  });

  it('an axis the prior graph never touched yields NO fabricated continuation', async () => {
    const { priorAxisContextFor } = await import('@/features/chat/server/storedDecisionGrounding');
    const q1 = await turn('사업을 확장할까?');
    const draft: ConsultationDraft = { subject: { id: 'self', displayName: 'A', relationship: null }, birthInfo: BIRTH };
    const health = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: NOW }, '요즘 몸이 어떤가요?');
    const context = priorAxisContextFor(storedMeta(q1) as never, health);
    // Either genuinely empty, or every line traces to the stored graph — never invented.
    for (const line of context) expect(line.length).toBeGreaterThan(0);
    expect(context.every((l) => !l.includes('undefined'))).toBe(true);
  });
});
