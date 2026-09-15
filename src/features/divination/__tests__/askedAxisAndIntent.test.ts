// V3 §8/§9/§42 — QUESTION INTENT and ASKED-AXIS STRICTNESS, on the REAL production path.
//
// Two V2 product defects this locks shut:
//   · "제 성격이 어떤가요?" came back shaped like an action verdict, and "왜 자꾸 부딪히나요?" was converted
//     into a timing stance. A description is not a recommendation; a cause is not a verdict.
//   · When the asked axis had no evidence, the headline silently switched to whatever axis WAS supported —
//     so a 건강 question could be answered with a career reading, and "돈이 들어올까?" could headline retention.
import { createHash } from 'crypto';

import type { BirthInfoDraft, ConsultationDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import {
  buildConsultationGrounding, resolveJudgmentDomain, resolveQuestionIntent,
} from '@/features/chat/services/consultationGrounding';
import { isDirectional, judgeCross, type CrossDivinationVerdict, type DivinationJudgment } from '@/features/divination';

const digestProvider: DigestProvider = {
  async sha256Utf8(input: string): Promise<string> {
    return createHash('sha256').update(input, 'utf8').digest('hex');
  },
};
const NOW = Math.floor(Date.UTC(2026, 2, 10, 1, 0, 0) / 1000);
const CHART = {
  displayName: 'A', gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1990', birthMonth: '8', birthDay: '15',
  birthTimeAccuracy: 'exact', birthHour: '14', birthMinute: '0',
  approximateTimePeriod: null, birthPlace: '서울',
} as unknown as BirthInfoDraft;

async function verdict(question: string): Promise<CrossDivinationVerdict> {
  const draft: ConsultationDraft = { subject: { id: 'self', displayName: 'A', relationship: null }, birthInfo: CHART };
  const g = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: NOW }, question);
  if (g.status !== 'available' || !g.divinationVerdict) throw new Error('expected verdict');
  return g.divinationVerdict;
}

describe('§8 — question intent selects the SHAPE of the answer', () => {
  it('classifies descriptive / cause / decision / timing distinctly', () => {
    expect(resolveQuestionIntent('제 타고난 성격이 어떤가요?')).toBe('DESCRIPTIVE');
    expect(resolveQuestionIntent('왜 자꾸 부딪힐까요?')).toBe('CAUSE_WHY');
    expect(resolveQuestionIntent('사업 확장해도 될까요?')).toBe('DECISION');
    expect(resolveQuestionIntent('언제가 좋을까요?')).toBe('TIMING');
  });

  // V4A §12 — V3 answered these by gluing a canned prefix ("구조는 이렇게 봅니다") onto a conclusion that had
  // still been produced by the FOR/AGAINST pipeline. The graph now derives a STRUCTURAL or CAUSAL proposition
  // instead, so the assertion is about the KIND of answer, not about a prefix string.
  // V4B §9 — STRUCTURAL_PROFILE was removed because it built a chart description out of count buckets. A
  // descriptive question is now answered only from individually grounded propositions, and where none exist it
  // declines. The requirement that survives is the one that matters: it must never be answered with a
  // recommendation.
  it('a DESCRIPTIVE question is answered as structure OR declined — never as a recommendation', async () => {
    const v = await verdict('제 타고난 성격이 어떤가요?');
    expect(isDirectional(v.direction)).toBe(false);
    expect(v.primaryConclusion).not.toMatch(/하지 않는 쪽|접고|밀어붙이지|벌일 자리는 아/);
    if (v.direction === 'STRUCTURAL_ANSWER') {
      expect(v.propositions.some((p) => p.conclusionType === 'STRUCTURAL' || p.conclusionType === 'CAUSAL')).toBe(true);
    }
  });

  it('a CAUSE_WHY question explains the friction instead of issuing a verdict', async () => {
    const v = await verdict('왜 자꾸 부딪힐까요?');
    expect(isDirectional(v.direction)).toBe(false);
    const causal = v.propositions.filter((p) => p.conclusionType === 'CAUSAL');
    // §22 — every causal conclusion is directionless: it explains, it does not recommend.
    for (const c of causal) expect(c.direction).toBe('NONE');
    if (v.direction === 'STRUCTURAL_ANSWER') {
      expect(causal.length).toBeGreaterThan(0);
      expect(v.primaryConclusion).toMatch(/우연이 아니다|되풀이|겹쳐|때문/);
    }
  });
});

describe('§9/§42 — the asked axis answers, or we say we cannot; never a substitute axis', () => {
  it('a HEALTH question never headlines career/relationship/general', async () => {
    const v = await verdict('요즘 몸이 어떤가요?');
    if (isDirectional(v.direction)) {
      // if it answered, it answered on the asked axis
      const asked = v.axisVerdicts.find((a) => a.domain === 'HEALTH_ENERGY');
      expect(asked).toBeTruthy();
      expect(isDirectional(asked!.stance)).toBe(true);
    } else {
      // Declining is one honest outcome; a STRUCTURAL answer ON THE ASKED AXIS is the other. What is forbidden
      // is answering 건강 with a different axis, which is what this case exists to catch.
      expect(['INSUFFICIENT_EVIDENCE', 'INSUFFICIENT_DATA', 'STRUCTURAL_ANSWER']).toContain(v.direction);
      expect(v.primaryConclusion).toMatch(/억지로 좋다·나쁘다를 말씀드리지 않겠습니다|없는 이야기를 지어내지는 않겠습니다|몸|기운/);
    }
  });

  it('a MONEY_INFLOW question never headlines MONEY_RETENTION', async () => {
    const v = await verdict('올해 돈을 벌 수 있을까요?');
    expect(v.questionDomain).toBe('MONEY_INFLOW');
    if (isDirectional(v.direction)) {
      // An axis can carry SEVERAL standing conclusions (a directional one and a causal one, say), so the
      // invariant is that the headline matches ONE of the asked axis's verdicts — not that it matches
      // whichever happens to be listed first.
      const asked = v.axisVerdicts.filter((a) => a.domain === 'MONEY_INFLOW');
      expect(asked.some((a) => a.stance === v.direction)).toBe(true);
      // and the headline is never a MONEY_RETENTION conclusion
      const retention = v.axisVerdicts.filter((a) => a.domain === 'MONEY_RETENTION');
      expect(retention.every((a) => a.conclusion !== v.primaryConclusion)).toBe(true);
    } else {
      // Declining, or answering structurally, is allowed — headlining MONEY_RETENTION is not.
      const retention = v.axisVerdicts.find((a) => a.domain === 'MONEY_RETENTION');
      if (retention) expect(v.primaryConclusion).not.toBe(retention.conclusion);
    }
  });

  it('when the asked axis is unsupported, other axes are kept as CONTEXT, not promoted to the answer', () => {
    // Synthetic: only CAREER carries evidence; the asked axis (HEALTH_ENERGY) has none.
    const j: DivinationJudgment = {
      discipline: 'MYUNGRI', applicable: true, dataReliability: 'EXACT',
      questionDomain: 'HEALTH_ENERGY', temporalScope: 'NATAL', stance: 'FOR',
      dominantConclusion: 'c', dominantFactor: 'f',
      directEvidence: [], counterEvidence: [], internalContradictions: [], timingSignals: [],
      domainSubJudgments: [{
        domain: 'CAREER', stance: 'FOR', conclusion: '자리는 열립니다',
        temporalScope: 'NATAL', directness: 'DIRECT', reliability: 'EXACT',
        evidence: [{ fact: '관록 근거', meaning: 'm', domain: 'CAREER', temporalScope: 'NATAL', directness: 'DIRECT' }],
        counterEvidence: [],
      }],
      confidence: 'MEDIUM', questionDirectness: 'DIRECT', evidenceStrength: 'MODERATE', factGroupsUsed: ['t'],
    };
    const v = judgeCross({ question: '몸이 어떤가요?', questionDomain: 'HEALTH_ENERGY', judgments: [j], asksTiming: false });
    expect(isDirectional(v.direction)).toBe(false); // no career answer smuggled in
    expect(v.axisVerdicts.some((a) => a.domain === 'CAREER')).toBe(true); // but kept visible as context
  });
});
