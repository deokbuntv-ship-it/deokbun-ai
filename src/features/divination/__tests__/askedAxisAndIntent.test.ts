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

  it('a DESCRIPTIVE question is answered as structure, not as a recommendation', async () => {
    const v = await verdict('제 타고난 성격이 어떤가요?');
    expect(v.primaryConclusion).toMatch(/구조는 이렇게 봅니다/);
    // it must not read like an action instruction
    expect(v.primaryConclusion).not.toMatch(/하지 않는 쪽|접고|밀어붙이지/);
  });

  it('a CAUSE_WHY question explains the friction instead of issuing a verdict', async () => {
    const v = await verdict('왜 자꾸 부딪힐까요?');
    expect(v.primaryConclusion).toMatch(/부딪히는 지점은 이렇게 봅니다/);
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
      expect(v.direction).toBe('INSUFFICIENT_EVIDENCE');
      expect(v.primaryConclusion).toMatch(/다른 부분의 신호로 대신 답하지는 않겠습니다|방향을 정하지 않습니다/);
    }
  });

  it('a MONEY_INFLOW question never headlines MONEY_RETENTION', async () => {
    const v = await verdict('올해 돈을 벌 수 있을까요?');
    expect(v.questionDomain).toBe('MONEY_INFLOW');
    if (isDirectional(v.direction)) {
      const asked = v.axisVerdicts.find((a) => a.domain === 'MONEY_INFLOW')!;
      expect(asked.stance).toBe(v.direction); // the headline IS the asked axis
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
