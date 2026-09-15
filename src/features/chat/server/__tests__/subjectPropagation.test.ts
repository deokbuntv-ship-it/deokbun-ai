// FINAL SUBJECT PROPAGATION FIX — real production path, including the Ziwei-only case that exposed the bug.
// Only the outbound LLM is mocked. Subject authority, grounding, judgeCross, graph persistence, strict restore,
// and multi-hop follow-up extension all run through their production implementations.
import { createHash } from 'crypto';

import { buildServerConsultation } from '@/features/chat/server';
import type {
  ConsultationDecisionMeta, PriorHistoryLoad, ServerConsultationDeps, ServerConsultationRequest,
} from '@/features/chat/server';
import { parseDecisionMeta } from '@/features/chat/server/decisionMeta';
import type { BirthInfoDraft } from '@/features/consultation';
import {
  judgeCross, type CrossDivinationVerdict, type DivinationJudgment, type JudgmentEvidence,
} from '@/features/divination';
import type { DigestProvider } from '@/features/interpretation';

const digestProvider: DigestProvider = {
  async sha256Utf8(s: string) { return createHash('sha256').update(s, 'utf8').digest('hex'); },
};

// Saju is intentionally out of its frozen 1970–2050 range while Ziwei remains available. Before this fix,
// Myungri's empty standing set made judgeCross fall back to "본인", even when the canonical owner was a name.
const birth = (subject: string): BirthInfoDraft => ({
  displayName: subject, gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1965', birthMonth: '6', birthDay: '15', birthTimeAccuracy: 'exact', birthHour: '14',
  birthMinute: '0', approximateTimePeriod: null, birthPlace: '서울',
});

const T1 = Math.floor(Date.UTC(2024, 0, 15, 1, 0, 0) / 1000);
const GOOD_ANSWER = JSON.stringify({
  coreSummary: '차분한 흐름입니다.',
  coreInterpretation:
    '자미두수 명반에서는 명궁의 주성과 오행국이 전반적인 기질을 보여 줍니다. 차분하면서도 필요한 순간에는 ' +
    '추진력을 내는 균형형으로, 꾸준히 축적하는 방식이 잘 맞습니다. 관계에서는 신뢰를 바탕으로 오래가는 인연을 만드는 편입니다.',
  strengths: ['끈기'], cautions: ['속도 조절'], followUps: ['어떤 방식이 맞을까요?'],
});

const request = (subject: string, question: string): ServerConsultationRequest => ({
  birthInput: birth(subject), subjectLabel: subject, question,
});

const deps = (loadPreviousDecision?: () => Promise<PriorHistoryLoad>): ServerConsultationDeps => ({
  digestProvider, nowEpochSeconds: T1, async callLLM() { return GOOD_ANSWER; },
  ...(loadPreviousDecision ? { loadPreviousDecision } : {}),
});

type Turn = {
  raw: ConsultationDecisionMeta;
  persisted: ConsultationDecisionMeta;
  restored: ConsultationDecisionMeta;
};

async function turn(
  subject: string, question: string, previous?: ConsultationDecisionMeta,
): Promise<Turn> {
  const load = previous
    ? async (): Promise<PriorHistoryLoad> => ({ status: 'VALID', meta: previous })
    : undefined;
  const out = await buildServerConsultation(request(subject, question), deps(load));
  if (!out.ok) throw new Error(`turn failed: ${out.reason}`);
  const raw = out.structuredResult?.decisionMeta as ConsultationDecisionMeta | undefined;
  if (!raw?.divinationVerdict) throw new Error('turn produced no persisted verdict');

  // The Edge writes this JSON shape to consultation_decisions.decision_meta, then the next turn parses it.
  const persisted = JSON.parse(JSON.stringify(raw)) as ConsultationDecisionMeta;
  const restored = parseDecisionMeta(persisted);
  if (!restored?.divinationVerdict) throw new Error('persisted graph did not restore');
  return { raw, persisted, restored };
}

function expectCanonicalSubject(verdict: CrossDivinationVerdict, subject: string): void {
  expect(verdict.premises.length).toBeGreaterThan(0);
  expect(verdict.propositions.length).toBeGreaterThan(0);
  expect(new Set(verdict.premises.map((p) => p.subject))).toEqual(new Set([subject]));
  expect(new Set(verdict.propositions.map((p) => p.subject))).toEqual(new Set([subject]));
}

function expectTurnSubject(t: Turn, subject: string): void {
  expectCanonicalSubject(t.raw.divinationVerdict!, subject);
  expectCanonicalSubject(t.persisted.divinationVerdict!, subject);
  expectCanonicalSubject(t.restored.divinationVerdict!, subject);
}

const SUBJECTS = ['본인', '김서윤', '박민준'] as const;

describe.each(SUBJECTS)('canonical subject propagation — %s', (subject) => {
  it('survives first consultation, one-hop, two-hop, persistence, and strict restoration', async () => {
    // This first turn is the exact pre-fix failure shape: Ziwei-only, with an empty Myungri standing set.
    const q1 = await turn(subject, '제 타고난 성격은?');
    expectTurnSubject(q1, subject);

    // Each follow-up loads the previous turn only after its real JSON round-trip and whitelist reconstruction.
    const q2 = await turn(subject, '돈은?', q1.restored);
    expectTurnSubject(q2, subject);
    expect(q2.restored.graphRevision?.kind).toBe('EXTENDED');

    const q3 = await turn(subject, '결혼하면?', q2.restored);
    expectTurnSubject(q3, subject);
    expect(q3.restored.graphRevision?.kind).toBe('EXTENDED');

    // Multi-hop continuity is graph continuity, not merely three equal labels on unrelated readings.
    const q1Ids = new Set(q1.restored.divinationVerdict!.propositions.map((p) => p.id));
    const q2Ids = new Set(q2.restored.divinationVerdict!.propositions.map((p) => p.id));
    const q3Ids = new Set(q3.restored.divinationVerdict!.propositions.map((p) => p.id));
    for (const id of q1Ids) expect(q2Ids.has(id)).toBe(true);
    for (const id of q2Ids) expect(q3Ids.has(id)).toBe(true);
  });
});

describe('judgeCross canonical subject boundary', () => {
  const evidence = (fact: string): JudgmentEvidence => ({
    fact, meaning: fact, domain: 'CAREER', temporalScope: 'NATAL', directness: 'DIRECT',
  });
  const judgment = (discipline: 'ZIWEI' | 'QIMEN', favorable: boolean): DivinationJudgment => {
    const support = favorable ? [evidence(`${discipline} support`)] : [];
    const opposition = favorable ? [] : [evidence(`${discipline} opposition`)];
    const stance = favorable ? 'FOR' as const : 'AGAINST' as const;
    return {
      discipline, applicable: true, dataReliability: 'EXACT', questionDomain: 'CAREER', temporalScope: 'NATAL',
      stance, dominantConclusion: `${discipline} conclusion`, dominantFactor: `${discipline} factor`,
      directEvidence: support, counterEvidence: opposition, internalContradictions: [], timingSignals: [],
      domainSubJudgments: [{
        domain: 'CAREER', stance, conclusion: `${discipline} conclusion`, temporalScope: 'NATAL',
        directness: 'DIRECT', reliability: 'EXACT', evidence: support, counterEvidence: opposition,
      }],
      confidence: 'MEDIUM', questionDirectness: 'DIRECT', evidenceStrength: 'MODERATE', factGroupsUsed: [discipline],
    };
  };

  it.each(SUBJECTS)('stamps adapted and CROSS propositions with %s', (subject) => {
    const verdict = judgeCross({
      question: '이직해도 될까요?', questionDomain: 'CAREER', subject,
      judgments: [judgment('ZIWEI', true), judgment('QIMEN', false)], asksTiming: false,
    });
    expectCanonicalSubject(verdict, subject);
    const cross = verdict.propositions.filter((p) => p.discipline === 'CROSS');
    expect(cross.length).toBeGreaterThan(0);
    expect(new Set(cross.map((p) => p.subject))).toEqual(new Set([subject]));
  });
});
