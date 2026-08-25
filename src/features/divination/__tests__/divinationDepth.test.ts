// DEPTH REBUILD §19 — ADVERSARIAL / COUNTERFACTUAL SUITE (groups A–O).
//
// The previous 40-test benchmark passed while the architecture was shallow, so test COUNT proves nothing.
// These tests are written from the independent audit's failure modes, and — critically — the counterfactual
// groups run the REAL judges on REAL engine output rather than hand-built judgment shapes (§18), because the
// audit found capabilities that "worked" only in fixtures and were unreachable in production.
import { createHash } from 'crypto';

import type { BirthInfoDraft, ConsultationDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { computeZiweiChartMemoized, toZiweiBirthInput } from '@/features/ziwei';
import { buildConsultationGrounding, resolveJudgmentDomain } from '@/features/chat/services/consultationGrounding';
import {
  isDirectional,
  judgeCross,
  judgeQimen,
  judgeZiwei,
  stanceValence,
  type CrossDivinationVerdict,
  type DivinationJudgment,
  type DomainSubJudgment,
  type JudgmentDomain,
  type Stance,
} from '@/features/divination';

const digestProvider: DigestProvider = {
  async sha256Utf8(input: string): Promise<string> {
    return createHash('sha256').update(input, 'utf8').digest('hex');
  },
};
const NOW = Math.floor(Date.UTC(2026, 5, 15, 3, 0, 0) / 1000);

const CHART_A = {
  displayName: 'A', gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1990', birthMonth: '8', birthDay: '15',
  birthTimeAccuracy: 'exact', birthHour: '14', birthMinute: '0',
  approximateTimePeriod: null, birthPlace: '서울',
} as unknown as BirthInfoDraft;
const CHART_B = {
  displayName: 'B', gender: 'female', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1978', birthMonth: '2', birthDay: '3',
  birthTimeAccuracy: 'exact', birthHour: '5', birthMinute: '30',
  approximateTimePeriod: null, birthPlace: '서울',
} as unknown as BirthInfoDraft;

async function verdictFor(birth: BirthInfoDraft, question: string): Promise<CrossDivinationVerdict> {
  const draft: ConsultationDraft = {
    subject: { id: 'self', displayName: String(birth.displayName ?? 'x'), relationship: null },
    birthInfo: birth,
  };
  const g = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: NOW }, question);
  if (g.status !== 'available' || !g.divinationVerdict) throw new Error('expected a verdict');
  return g.divinationVerdict;
}

/** A structural fingerprint — compares JUDGMENT SHAPE, not strings (§14: "do not test only string difference"). */
function fingerprint(v: CrossDivinationVerdict) {
  return {
    direction: v.direction,
    axes: v.axisVerdicts.map((a) => `${a.domain}:${a.stance}`).sort().join('|'),
    dominant: v.dominantBasis,
    facts: v.disciplineJudgments.flatMap((j) => j.factGroupsUsed).sort().join('|'),
    evidence: v.evidenceReferences.flatMap((r) => r.lines).sort().join('|'),
  };
}

// ── synthetic builders (only for cross-judge logic groups C–G) ─────────────────────────────────────
const sub = (
  domain: JudgmentDomain, stance: Stance, over: Partial<DomainSubJudgment> = {},
): DomainSubJudgment => ({
  domain, stance, conclusion: `${domain} 결론`,
  temporalScope: 'NATAL', directness: 'DIRECT', reliability: 'EXACT',
  evidence: stance.includes('FOR') ? [{ fact: `${domain} 근거`, meaning: 'm', domain, temporalScope: 'NATAL', directness: 'DIRECT' }] : [],
  counterEvidence: stance.includes('AGAINST') ? [{ fact: `${domain} 반대근거`, meaning: 'm', domain, temporalScope: 'NATAL', directness: 'DIRECT' }] : [],
  ...over,
});
const judgment = (
  discipline: DivinationJudgment['discipline'], subs: DomainSubJudgment[], over: Partial<DivinationJudgment> = {},
): DivinationJudgment => ({
  discipline, applicable: true, dataReliability: 'EXACT',
  questionDomain: subs[0]?.domain ?? 'GENERAL', temporalScope: subs[0]?.temporalScope ?? 'NATAL',
  stance: subs[0]?.stance ?? 'INSUFFICIENT_EVIDENCE',
  dominantConclusion: '결론', dominantFactor: '근거',
  directEvidence: subs.flatMap((s) => s.evidence), counterEvidence: subs.flatMap((s) => s.counterEvidence),
  internalContradictions: [], timingSignals: [], domainSubJudgments: subs,
  confidence: 'MEDIUM', questionDirectness: subs[0]?.directness ?? 'DIRECT',
  evidenceStrength: 'MODERATE', factGroupsUsed: ['테스트'],
  ...over,
});
const cross = (domain: JudgmentDomain, judgments: DivinationJudgment[], asksTiming = false) =>
  judgeCross({ question: 'q', questionDomain: domain, judgments, asksTiming });

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
describe('A — two different charts, SAME question → materially different judgment structure', () => {
  it('money question on chart A vs chart B differs in judgment structure, not just wording', async () => {
    const a = fingerprint(await verdictFor(CHART_A, '올해 돈을 벌 수 있을까요?'));
    const b = fingerprint(await verdictFor(CHART_B, '올해 돈을 벌 수 있을까요?'));
    // the personalization-collision risk the audit rated HIGH: two real charts must not collapse together
    expect(a.evidence).not.toBe(b.evidence);
    expect(`${a.direction}${a.axes}${a.dominant}`).not.toBe(`${b.direction}${b.axes}${b.dominant}`);
  });

  it('marriage question on chart A vs chart B differs structurally', async () => {
    const a = fingerprint(await verdictFor(CHART_A, '결혼해도 될까요?'));
    const b = fingerprint(await verdictFor(CHART_B, '결혼해도 될까요?'));
    expect(a.evidence).not.toBe(b.evidence);
  });
});

describe('B — SAME chart, different question → different evidence selection', () => {
  it('money-INFLOW and money-RETENTION are no longer the same question (audit §7 regression)', () => {
    expect(resolveJudgmentDomain('올해 돈을 벌 수 있을까요?')).toBe('MONEY_INFLOW');
    expect(resolveJudgmentDomain('돈이 모일까요?')).toBe('MONEY_RETENTION');
    expect(resolveJudgmentDomain('저축이 남을까요?')).toBe('MONEY_RETENTION');
  });

  it('inflow vs retention on the SAME chart produce different verdict structure', async () => {
    const inflow = fingerprint(await verdictFor(CHART_A, '올해 돈을 벌 수 있을까요?'));
    const retention = fingerprint(await verdictFor(CHART_A, '돈이 모일까요?'));
    expect(inflow.axes + inflow.dominant).not.toBe(retention.axes + retention.dominant);
  });

  it('career vs relationship on the SAME chart select different evidence', async () => {
    const career = fingerprint(await verdictFor(CHART_A, '이직해도 될까요?'));
    const love = fingerprint(await verdictFor(CHART_A, '결혼해도 될까요?'));
    expect(career.evidence).not.toBe(love.evidence);
    expect(career.axes).not.toBe(love.axes);
  });
});

describe('C — strong-vs-weak cross contradiction (the C7 general rule, not a special case)', () => {
  it('a STRONG direct negative is NOT overturned by a weak/no-signal positive', () => {
    const strongNo = judgment('MYUNGRI', [
      sub('OPPORTUNITY', 'STRONGLY_AGAINST', {
        counterEvidence: [1, 2, 3].map((i) => ({ fact: `충 ${i}`, meaning: 'm', domain: 'OPPORTUNITY' as JudgmentDomain, temporalScope: 'WOLWOON' as const, directness: 'DIRECT' as const })),
        temporalScope: 'WOLWOON',
      }),
    ]);
    const weakYes = judgment('ZIWEI', [
      sub('OPPORTUNITY', 'CONDITIONAL_FOR', { evidence: [], temporalScope: 'NATAL', reliability: 'EXACT' }),
    ]);
    const v = cross('OPPORTUNITY', [strongNo, weakYes]);
    expect(stanceValence(v.direction)).toBe('AGAINST');
  });

  it('SYMMETRIC: a strong natal negative is not overturned by a weak near-term positive either', () => {
    const strongNo = judgment('ZIWEI', [
      sub('CAREER', 'AGAINST', {
        counterEvidence: [1, 2, 3].map((i) => ({ fact: `화기 ${i}`, meaning: 'm', domain: 'CAREER' as JudgmentDomain, temporalScope: 'NATAL' as const, directness: 'DIRECT' as const })),
        temporalScope: 'NATAL',
      }),
    ]);
    const weakYes = judgment('MYUNGRI', [sub('CAREER', 'CONDITIONAL_FOR', { evidence: [], temporalScope: 'SEWOON' })]);
    const v = cross('CAREER', [strongNo, weakYes]);
    expect(stanceValence(v.direction)).toBe('AGAINST');
  });

  it('a NO-SIGNAL judgment casts no vote and says so in its contribution', () => {
    const noSignal = judgment('ZIWEI', [sub('CAREER', 'INSUFFICIENT_EVIDENCE', { evidence: [], counterEvidence: [] })]);
    const real = judgment('MYUNGRI', [sub('CAREER', 'AGAINST')]);
    const v = cross('CAREER', [real, noSignal]);
    expect(stanceValence(v.direction)).toBe('AGAINST');
    const z = v.contributions.find((c) => c.discipline === 'ZIWEI')!;
    expect(z.contribution).toMatch(/신호가 없어|표를 더하지/);
  });
});

describe('D — same-domain TRUE contradiction (both well-evidenced) is decided, not decomposed', () => {
  it('picks the more question-direct side and explains the loser', () => {
    const direct = judgment('ZIWEI', [sub('CAREER', 'AGAINST', {
      counterEvidence: [1, 2, 3].map((i) => ({ fact: `직접근거 ${i}`, meaning: 'm', domain: 'CAREER' as JudgmentDomain, temporalScope: 'NATAL' as const, directness: 'DIRECT' as const })),
      directness: 'DIRECT',
    })]);
    const indirect = judgment('MYUNGRI', [sub('CAREER', 'FOR', {
      evidence: [{ fact: '간접근거', meaning: 'm', domain: 'CAREER', temporalScope: 'NATAL', directness: 'GENERAL' }],
      directness: 'GENERAL',
    })]);
    const v = cross('CAREER', [indirect, direct]);
    expect(stanceValence(v.direction)).toBe('AGAINST');
    expect(v.contradictionResolutions[0].dominant).toBe('ZIWEI');
    expect(v.contradictionResolutions[0].whyOtherDidNotDominate).toMatch(/명리/);
  });
});

describe('E — different-domain APPARENT contradiction keeps both truths (compound verdict)', () => {
  it('inflow FOR + retention AGAINST → both axes survive; headline follows the asked axis', () => {
    const m = judgment('MYUNGRI', [sub('MONEY_INFLOW', 'FOR'), sub('MONEY_RETENTION', 'AGAINST')]);
    const v = cross('MONEY_RETENTION', [m]);
    expect(stanceValence(v.direction)).toBe('AGAINST');
    const axes = Object.fromEntries(v.axisVerdicts.map((a) => [a.domain, a.stance]));
    expect(stanceValence(axes.MONEY_INFLOW as Stance)).toBe('FOR');
    expect(stanceValence(axes.MONEY_RETENTION as Stance)).toBe('AGAINST');
    expect(v.primaryConclusion).toMatch(/들어오는 것과 남는 것은 다르게/);
  });

  it('bond FOR + marriage-stability AGAINST → "인연은 강하지만 결혼생활은 어렵다" survives', () => {
    const m = judgment('MYUNGRI', [sub('RELATION_BOND', 'STRONGLY_FOR'), sub('RELATION_STABILITY', 'AGAINST')]);
    const v = cross('RELATION_STABILITY', [m]);
    const axes = Object.fromEntries(v.axisVerdicts.map((a) => [a.domain, a.stance]));
    expect(stanceValence(axes.RELATION_BOND as Stance)).toBe('FOR');
    expect(stanceValence(axes.RELATION_STABILITY as Stance)).toBe('AGAINST');
    expect(v.contradictionResolutions.some((r) => r.kind === 'BOND_VS_STABILITY')).toBe(true);
  });
});

describe('F — long-term favourable / immediate unfavourable → timed verdict (BOTH sides supported)', () => {
  it('well-evidenced structural FOR + well-evidenced near AGAINST → FOR_BUT_LATER', () => {
    const structural = judgment('MYUNGRI', [sub('DECISION', 'FOR', {
      temporalScope: 'DAEWOON',
      evidence: [1, 2].map((i) => ({ fact: `대운근거 ${i}`, meaning: 'm', domain: 'DECISION' as JudgmentDomain, temporalScope: 'DAEWOON' as const, directness: 'DIRECT' as const })),
    })]);
    const near = judgment('QIMEN', [sub('DECISION', 'AGAINST_FOR_NOW', {
      temporalScope: 'PRESENT_MOMENT',
      counterEvidence: [1, 2].map((i) => ({ fact: `지금근거 ${i}`, meaning: 'm', domain: 'DECISION' as JudgmentDomain, temporalScope: 'PRESENT_MOMENT' as const, directness: 'DIRECT' as const })),
    })]);
    const v = cross('DECISION', [structural, near], true);
    expect(v.direction).toBe('FOR_BUT_LATER');
    expect(v.contradictionResolutions[0].kind).toBe('ACTION_VS_TIMING');
    expect(v.timingConclusion).toBeTruthy();
  });

  it('but a WEAK structural side does NOT get to own the direction via the temporal path (C7 root cause)', () => {
    const weakStructural = judgment('ZIWEI', [sub('OPPORTUNITY', 'CONDITIONAL_FOR', { temporalScope: 'NATAL', evidence: [] })]);
    const strongNear = judgment('MYUNGRI', [sub('OPPORTUNITY', 'STRONGLY_AGAINST', {
      temporalScope: 'WOLWOON',
      counterEvidence: [1, 2, 3].map((i) => ({ fact: `충 ${i}`, meaning: 'm', domain: 'OPPORTUNITY' as JudgmentDomain, temporalScope: 'WOLWOON' as const, directness: 'DIRECT' as const })),
    })]);
    const v = cross('OPPORTUNITY', [weakStructural, strongNear], true);
    expect(v.direction).not.toBe('FOR_BUT_LATER');
    expect(stanceValence(v.direction)).toBe('AGAINST');
  });
});

describe('G — genuinely insufficient evidence is ALLOWED (no forced decision, §12)', () => {
  it('all claims no-signal → INSUFFICIENT_EVIDENCE, not a manufactured direction', () => {
    const a = judgment('MYUNGRI', [sub('CAREER', 'INSUFFICIENT_EVIDENCE', { evidence: [], counterEvidence: [] })]);
    const b = judgment('ZIWEI', [sub('CAREER', 'INSUFFICIENT_EVIDENCE', { evidence: [], counterEvidence: [] })]);
    const v = cross('CAREER', [a, b]);
    expect(v.direction).toBe('INSUFFICIENT_EVIDENCE');
    expect(v.primaryConclusion).toMatch(/억지로 좋다·나쁘다를 말씀드리지 않겠습니다/);
  });

  it('a disagreement with ANY distinguishing reason still yields a direction (not an escape hatch)', () => {
    // Ziwei names an obstruction; Myungri is only conditionally open → explainable dominance.
    const v = cross('CAREER', [
      judgment('MYUNGRI', [sub('CAREER', 'CONDITIONAL_FOR')]),
      judgment('ZIWEI', [sub('CAREER', 'AGAINST')]),
    ]);
    expect(isDirectional(v.direction)).toBe(true);
    expect(v.contradictionResolutions[0].resolution.length).toBeGreaterThan(0);
  });

  it('V3 §27/§28: a PERFECTLY symmetric conflict refuses to invent a winner', () => {
    // Identical directness, reliability, firmness AND evidence shape (each side names both a support and an
    // obstruction) → NO criterion can explain dominance, so inventing one would be a forced decision.
    const evenPair = (d: JudgmentDomain, stance: Stance) =>
      sub(d, stance, {
        evidence: [{ fact: `${stance} 근거`, meaning: 'm', domain: d, temporalScope: 'NATAL', directness: 'DIRECT' }],
        counterEvidence: [{ fact: `${stance} 반대근거`, meaning: 'm', domain: d, temporalScope: 'NATAL', directness: 'DIRECT' }],
      });
    const v = cross('CAREER', [
      judgment('MYUNGRI', [evenPair('CAREER', 'FOR')]),
      judgment('ZIWEI', [evenPair('CAREER', 'AGAINST')]),
    ]);
    expect(v.direction).toBe('INSUFFICIENT_EVIDENCE');
    expect(v.primaryConclusion).not.toMatch(/좋은 점도|신중하세요/); // not neutralization either
    expect(v.contradictionResolutions[0].whyOtherDidNotDominate).toMatch(/억지로 승자를 만들지 않았습니다/);
  });
});

describe('H — QIMEN: same 值使門, materially different board → different verdict', () => {
  const board = (over: Record<string, unknown>) =>
    ({
      engine: 'qimen', engineVersion: 'v', library: 'l', libraryVersion: 'v', ruleSetVersion: 'r',
      queryTime: { year: 2026, month: 6, day: 15, hour: 12 }, dunType: 'yang', ju: 1, sanyuan: '上元',
      solarTerm: '芒種', ganzhi: { year: 'a', month: 'b', day: 'c', hour: 'd' }, hourStem: '甲',
      xunHead: '甲子', fuHead: '戊', zhifu: '天輔', zhishi: '開門', zhifuPalace: '坎', zhishiPalace: '坎',
      palaces: [{ index: 0, palaceLabel: '坎一白', earthPlate: '戊', heavenPlate: '己', earthDoor: '開門', heavenDoor: '開門', star: '天輔', god: '值符' }],
      warnings: [], ...over,
    }) as never;

  it('an auspicious door with helpful star+deity beats the same door with harmful ones', () => {
    const good = judgeQimen({ question: 'q', questionDomain: 'TIMING', availability: 'available', board: board({}) });
    const bad = judgeQimen({
      question: 'q', questionDomain: 'TIMING', availability: 'available',
      board: board({
        zhifu: '天蓬', // 흉성
        palaces: [{ index: 0, palaceLabel: '坎一白', earthPlate: '戊', heavenPlate: '己', earthDoor: '開門', heavenDoor: '開門', star: '天蓬', god: '白虎' }],
      }),
    });
    expect(good.stance).not.toBe(bad.stance); // the audit's one-door collapse is gone
    expect(stanceValence(good.stance)).toBe('FOR');
    expect(good.factGroupsUsed).toEqual(expect.arrayContaining(['값부 구성', '팔신']));
  });
});

describe('I — ZIWEI: real chart, different palaces drive different axes (no single-palace collapse)', () => {
  const chart = computeZiweiChartMemoized(toZiweiBirthInput(CHART_A));

  it('the judge reports multiple axes and names 삼방사정 among its fact groups', () => {
    const j = judgeZiwei({ question: '돈?', questionDomain: 'MONEY_INFLOW', chart: chart.chart, availability: chart.availability });
    expect(j.domainSubJudgments.length).toBeGreaterThan(1);
    expect(j.factGroupsUsed).toEqual(expect.arrayContaining(['삼방사정(대궁·삼합궁)']));
  });

  it('E1 FIX: a palace with no 四化 yields NO SIGNAL, never a positive vote', () => {
    const j = judgeZiwei({ question: '돈?', questionDomain: 'MONEY_INFLOW', chart: chart.chart, availability: chart.availability });
    for (const s of j.domainSubJudgments) {
      const noEvidence = s.evidence.length === 0 && s.counterEvidence.length === 0;
      if (noEvidence) expect(stanceValence(s.stance)).toBe('NONE');
    }
  });
});

describe('J — MYUNGRI: relation POSITION changes the axis it disturbs (not just a count)', () => {
  it('the real judge names which natal pillar a luck cycle struck', async () => {
    const v = await verdictFor(CHART_A, '결혼해도 될까요?');
    const myungri = v.disciplineJudgments.find((j) => j.discipline === 'MYUNGRI')!;
    expect(myungri.factGroupsUsed).toEqual(expect.arrayContaining(['원국 십신 배치', '원국 합충형파해']));
    const lines = [...myungri.directEvidence, ...myungri.counterEvidence].map((e) => e.fact).join(' ');
    // position-aware evidence must exist (원국 + 자리), which the count-based build could not produce
    expect(lines).toMatch(/원국|자리|주/);
  });
});

describe('REAL-RUNTIME reachability (§18) — capabilities must work on the production path', () => {
  it('the production path produces MULTI-AXIS sub-judgments (decomposition is no longer fixture-only)', async () => {
    const v = await verdictFor(CHART_A, '사업을 더 키워도 될까요?');
    expect(v.axisVerdicts.length).toBeGreaterThan(1);
    const domains = new Set(v.disciplineJudgments.flatMap((j) => j.domainSubJudgments.map((s) => s.domain)));
    expect(domains.size).toBeGreaterThan(1); // audit: all judges previously reported ONE identical domain
  });

  it('every applied discipline reports the fact groups it actually consumed (depth utilization §20)', async () => {
    const v = await verdictFor(CHART_A, '올해 돈을 벌 수 있을까요?');
    for (const j of v.disciplineJudgments.filter((x) => x.applicable)) {
      expect(j.factGroupsUsed.length).toBeGreaterThan(0);
    }
  });

  it('no verdict is manufactured from absent evidence on the real path', async () => {
    const v = await verdictFor(CHART_A, '제 타고난 성격이 어떤가요?');
    if (!isDirectional(v.direction)) {
      expect(['INSUFFICIENT_EVIDENCE', 'INSUFFICIENT_DATA']).toContain(v.direction);
    } else {
      // if it IS directional, it must rest on named evidence
      expect(v.evidenceReferences.some((r) => r.lines.length > 0)).toBe(true);
    }
  });
});
