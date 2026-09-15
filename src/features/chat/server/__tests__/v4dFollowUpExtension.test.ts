// V4D §19–§23 / §38-15..17 — A REFINEMENT EXTENDS THE STANDING GRAPH.
//
// The failure this suite pins down was a HARD PRODUCTION one, not a fixture artefact: Q1 built G1 and
// persisted it; Q2 ("돈은?") LOADED G1 and then built a complete second graph G2 containing zero nodes of G1,
// persisted G2 over it, and kept G1 only as prompt prose. Two readings, one conversation.
//
// Only the outbound LLM call is mocked. Grounding, the engines, the graph and the parser are all real.
import { createHash } from 'crypto';

import { buildServerConsultation } from '@/features/chat/server';
import type {
  ConsultationDecisionMeta, PriorHistoryLoad, ServerConsultationDeps, ServerConsultationRequest,
} from '@/features/chat/server';
import type { BirthInfoDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { parseDecisionMeta } from '@/features/chat/server/decisionMeta';

const digestProvider: DigestProvider = {
  async sha256Utf8(s: string) { return createHash('sha256').update(s, 'utf8').digest('hex'); },
};

/** T1 — the instant Q1 is answered at. */
const T1 = Math.floor(Date.UTC(2024, 0, 15, 1, 0, 0) / 1000);
/** T2 — six months later. A refinement must NOT drift here; a re-evaluation must. */
const T2 = Math.floor(Date.UTC(2024, 6, 15, 1, 0, 0) / 1000);

const birth: BirthInfoDraft = {
  displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1990', birthMonth: '8', birthDay: '15', birthTimeAccuracy: 'exact', birthHour: '14',
  birthMinute: '0', approximateTimePeriod: null, birthPlace: '서울',
};

const GOOD_ANSWER = JSON.stringify({
  coreSummary: '차분한 흐름입니다.',
  coreInterpretation:
    '사주로 보면 일간을 중심으로 차분함과 추진력이 균형을 이루는 구조이며 월지의 기운과 십신 배치가 이를 뒷받침합니다. '
    + '꾸준히 쌓아 올리면 좋고 조급하게 서두르면 흐름이 흐트러지기 쉬우니 속도를 조절하는 편이 좋습니다.',
  strengths: ['끈기'],
  cautions: ['조급하게 서두르기보다 속도를 조절하는 편이 좋습니다.'],
  followUps: ['어떤 방식이 맞을까요?'],
});

const deps = (
  nowEpochSeconds: number,
  loadPreviousDecision?: () => Promise<PriorHistoryLoad>,
): ServerConsultationDeps => ({
  digestProvider,
  nowEpochSeconds,
  async callLLM() { return GOOD_ANSWER; },
  ...(loadPreviousDecision ? { loadPreviousDecision } : {}),
});

const request = (question: string): ServerConsultationRequest => ({ birthInput: birth, question });

/** Run one turn and hand back the decision meta EXACTLY as it would be re-read from the database. */
async function turn(
  question: string, now: number, previous?: ConsultationDecisionMeta | null,
): Promise<ConsultationDecisionMeta> {
  const load = previous === undefined ? undefined
    : async () => (previous === null ? { status: 'NONE' as const } : { status: 'VALID' as const, meta: previous });
  const out = await buildServerConsultation(request(question), deps(now, load));
  if (!out.ok) throw new Error(`turn failed: ${out.reason}`);
  const meta = out.structuredResult?.decisionMeta as ConsultationDecisionMeta | undefined;
  if (!meta) throw new Error('no decisionMeta');
  // Round-trip through the real whitelist parser, so nothing is asserted about a field that would not survive.
  const restored = parseDecisionMeta(JSON.parse(JSON.stringify(meta)) as unknown);
  if (!restored) throw new Error('decisionMeta failed to restore');
  return restored;
}

describe('§38-15 — the money follow-up EXTENDS the graph rather than starting a new one', () => {
  it('Q2 keeps every proposition Q1 stood on, and adds to them', async () => {
    const q1 = await turn('사업을 확장할까?', T1);
    expect(q1.divinationVerdict).toBeDefined();
    const q2 = await turn('돈은?', T1, q1);
    expect(q2.divinationVerdict).toBeDefined();

    const before = new Set(q1.divinationVerdict!.propositions.map((p) => p.id));
    const after = new Set(q2.divinationVerdict!.propositions.map((p) => p.id));
    // EVERY node of G1 is still there. V4C's G2 shared none of them.
    for (const id of before) expect(after.has(id)).toBe(true);
    expect(after.size).toBeGreaterThanOrEqual(before.size);
  });

  it('…and it is the SAME graph: same premises, same question, same evaluation instant', async () => {
    const q1 = await turn('사업을 확장할까?', T1);
    const q2 = await turn('돈은?', T1, q1);
    const g1 = q1.divinationVerdict!;
    const g2 = q2.divinationVerdict!;

    expect(g2.premises.map((p) => p.id).sort()).toEqual(g1.premises.map((p) => p.id).sort());
    expect(g2.evaluatedAtEpochSeconds).toBe(g1.evaluatedAtEpochSeconds);
    // The ORIGINAL question is preserved — the graph still knows what it was built to answer.
    expect(g2.question).toBe(g1.question);
  });

  it('…while the ASKED AXIS moves to what the follow-up actually asked', async () => {
    const q1 = await turn('사업을 확장할까?', T1);
    const q2 = await turn('돈은?', T1, q1);
    expect(q2.divinationVerdict!.questionDomain).not.toBe(q1.divinationVerdict!.questionDomain);
    expect(['MONEY_INFLOW', 'MONEY_RETENTION']).toContain(q2.divinationVerdict!.questionDomain);
  });

  it('§23 — the revision is RECORDED as an extension of the previous graph', async () => {
    const q1 = await turn('사업을 확장할까?', T1);
    const q2 = await turn('돈은?', T1, q1);
    const rev = q2.graphRevision;
    expect(rev).toBeDefined();
    expect(rev!.kind).toBe('EXTENDED');
    // An extension does not move in time — that is exactly what distinguishes it from a re-evaluation.
    expect(rev!.previousEvaluatedAtEpochSeconds).toBe(rev!.evaluationInstantEpochSeconds);
    expect(rev!.evaluationInstantEpochSeconds).toBe(q1.divinationVerdict!.evaluatedAtEpochSeconds);
  });
});

describe('§38-16 — a refinement answers from T1, in every field of the row', () => {
  it('the verdict AND the temporal context both resolve from the original instant', async () => {
    const q1 = await turn('사업을 확장할까?', T1);
    // The refinement arrives SIX MONTHS later. Nothing about the answer may drift to that moment.
    const q2 = await turn('돈은?', T2, q1);

    expect(q2.divinationVerdict!.evaluatedAtEpochSeconds).toBe(T1);
    // V4C preserved the verdict's instant but still built the temporal context from the current clock, so a
    // single row carried a T1 verdict beside a T2 anchor, reference year and resolved targets.
    expect(q2.resolvedTemporalContext.anchorEpochSeconds).toBe(T1);
    expect(q2.resolvedTemporalContext.referenceYear)
      .toBe(q1.resolvedTemporalContext.referenceYear);
    expect(q2.resolvedTemporalContext.referenceMonth)
      .toBe(q1.resolvedTemporalContext.referenceMonth);
  });
});

describe('§38-17 — an explicit re-evaluation creates a NEW revision at the new instant', () => {
  it('"지금 다시 보면?" moves the clock and says so', async () => {
    const q1 = await turn('사업을 확장할까?', T1);
    const q2 = await turn('지금 다시 보면?', T2, q1);

    // A re-evaluation is a deliberate restart: it is answered at the NEW instant …
    expect(q2.divinationVerdict!.evaluatedAtEpochSeconds).toBe(T2);
    expect(q2.resolvedTemporalContext.anchorEpochSeconds).toBe(T2);
    // … and the link back to what it replaced is recorded rather than silently overwritten.
    expect(q2.graphRevision).toBeDefined();
    expect(q2.graphRevision!.kind).toBe('REEVALUATED');
    expect(q2.graphRevision!.previousEvaluatedAtEpochSeconds).toBe(T1);
    expect(q2.graphRevision!.evaluationInstantEpochSeconds).toBe(T2);
  });

  it('a genuinely NEW question records no revision at all', async () => {
    const q1 = await turn('사업을 확장할까?', T1);
    const q2 = await turn('결혼해도 될까요?', T2, q1);
    expect(q2.graphRevision).toBeUndefined();
    // …and it is answered fresh, at the new instant.
    expect(q2.divinationVerdict!.evaluatedAtEpochSeconds).toBe(T2);
  });
});

describe('§23 — a malformed revision claim fails CLOSED', () => {
  const withRevision = (meta: ConsultationDecisionMeta, over: Record<string, unknown>) =>
    parseDecisionMeta(JSON.parse(JSON.stringify({
      ...meta,
      graphRevision: { ...meta.graphRevision, ...over },
    })) as unknown);

  it('an EXTENDED revision whose instants disagree is rejected', async () => {
    const q1 = await turn('사업을 확장할까?', T1);
    const q2 = await turn('돈은?', T1, q1);
    // An extension that claims to have moved in time is not an extension.
    expect(withRevision(q2, { evaluationInstantEpochSeconds: T2 })).toBeUndefined();
  });

  it('an unknown revision kind or schema version is rejected', async () => {
    const q1 = await turn('사업을 확장할까?', T1);
    const q2 = await turn('돈은?', T1, q1);
    expect(withRevision(q2, { kind: 'MERGED' })).toBeUndefined();
    expect(withRevision(q2, { schemaVersion: 'graph-revision@9.9.9' })).toBeUndefined();
  });
});

describe('V4E §5 — extension failure through the REAL server path fails CLOSED', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const divination = require('@/features/divination') as typeof import('@/features/divination');

  it('when extendGraph THROWS, the restored graph stays authoritative — never the fresh primary one', async () => {
    const q1 = await turn('사업을 확장할까?', T1);
    const spy = jest.spyOn(divination, 'extendGraph').mockImplementation(() => {
      throw new Error('forced extension failure');
    });
    try {
      const q2 = await turn('돈은?', T1, q1);
      const v = q2.divinationVerdict!;
      // The freshly built primary graph must NOT become authoritative: every proposition the answer stands on
      // is a node of G1, the original question and instant survive, and the headline is a controlled decline.
      const g1Ids = new Set(q1.divinationVerdict!.propositions.map((p) => p.id));
      for (const p of v.propositions) expect(g1Ids.has(p.id)).toBe(true);
      expect(v.question).toBe(q1.divinationVerdict!.question);
      expect(v.evaluatedAtEpochSeconds).toBe(T1);
      expect(v.direction).toBe('INSUFFICIENT_EVIDENCE');
      expect(v.headlinePropositionIds).toEqual([]);
      expect(v.primaryConclusion).toContain('앞선 판정');
      // and the failed refinement records NO extension — provenance stays honest
      expect(q2.graphRevision).toBeUndefined();
    } finally {
      spy.mockRestore();
    }
  });

  it('…and with the spy gone, the same follow-up extends again (the failure was the forced one)', async () => {
    const q1 = await turn('사업을 확장할까?', T1);
    const q2 = await turn('돈은?', T1, q1);
    expect(q2.graphRevision?.kind).toBe('EXTENDED');
  });
});
