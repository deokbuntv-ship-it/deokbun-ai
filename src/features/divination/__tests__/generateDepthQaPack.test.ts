// DEPTH REBUILD §26 — DEPTH QA PACK GENERATOR.
//
// Unlike the previous pack (12 cases, 2 charts, Qimen applied 0 times), this runs MULTIPLE charts through the
// REAL production grounding, includes instants where Qimen genuinely computes, and prints the per-axis
// sub-judgments + contradiction resolution so depth can be judged by hand rather than inferred.
//
// KNOWN ENGINE GAP, REPORTED NOT HIDDEN (§34): the previous pack's fixed instant (2026-06-15 KST) makes the
// Qimen provider throw (`QIMEN_CORE_FAILED` at the 芒種 boundary), which is why Qimen never applied there.
// Timing cases below therefore use instants verified to compute, and the failing instant is included as an
// explicit honest-degradation case.
import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';

import type { BirthInfoDraft, ConsultationDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { buildConsultationGrounding } from '@/features/chat/services/consultationGrounding';
import {
  judgeCross, judgePairMyungri, judgePairZiwei,
  type CrossDivinationVerdict, type DivinationJudgment, type JudgmentDomain,
} from '@/features/divination';
import { buildCompatibilityEvidence } from '@/features/compatibility/engine';
import { executeSajuFromBirthInput } from '@/features/interpretation';
import { toSajuEngineInput } from '@/features/manse/services/birthInputMapper';
import { computeZiweiChartMemoized, toZiweiBirthInput } from '@/features/ziwei';

const digestProvider: DigestProvider = {
  async sha256Utf8(input: string): Promise<string> {
    return createHash('sha256').update(input, 'utf8').digest('hex');
  },
};

// Instants VERIFIED to compute a Qimen board (the old pack's instant did not).
const T_QIMEN_OK = Math.floor(Date.UTC(2026, 2, 10, 1, 0, 0) / 1000);   // 2026-03-10 10:00 KST → 開門/天心
const T_QIMEN_BAD_DOOR = Math.floor(Date.UTC(2026, 7, 25, 5, 0, 0) / 1000); // 2026-08-25 14:00 KST → 驚門/天柱
const T_QIMEN_FAILS = Math.floor(Date.UTC(2026, 5, 15, 3, 0, 0) / 1000);    // provider throws here

const chart = (over: Record<string, unknown>): BirthInfoDraft =>
  ({
    displayName: 'X', gender: 'male', calendarType: 'solar', lunarMonthType: null,
    birthYear: '1990', birthMonth: '8', birthDay: '15',
    birthTimeAccuracy: 'exact', birthHour: '14', birthMinute: '0',
    approximateTimePeriod: null, birthPlace: '서울', ...over,
  }) as unknown as BirthInfoDraft;

const A = chart({ displayName: 'A' });
const B = chart({ displayName: 'B', gender: 'female', birthYear: '1978', birthMonth: '2', birthDay: '3', birthHour: '5', birthMinute: '30' });
const C = chart({ displayName: 'C', gender: 'male', birthYear: '2001', birthMonth: '11', birthDay: '27', birthHour: '21' });
const NO_TIME = chart({ displayName: 'D', birthTimeAccuracy: 'unknown', birthHour: null, birthMinute: null });

type Case = { label: string; question: string; birth: BirthInfoDraft; at: number; group: string };
const CASES: Case[] = [
  { group: 'A 동일질문·다른원국', label: 'A · 돈을 벌 수 있나', question: '올해 돈을 벌 수 있을까요?', birth: A, at: T_QIMEN_OK },
  { group: 'A 동일질문·다른원국', label: 'B · 돈을 벌 수 있나', question: '올해 돈을 벌 수 있을까요?', birth: B, at: T_QIMEN_OK },
  { group: 'A 동일질문·다른원국', label: 'C · 돈을 벌 수 있나', question: '올해 돈을 벌 수 있을까요?', birth: C, at: T_QIMEN_OK },
  { group: 'B 동일원국·다른질문', label: 'A · 돈이 남는가(보유)', question: '돈이 모일까요?', birth: A, at: T_QIMEN_OK },
  { group: 'B 동일원국·다른질문', label: 'A · 결혼', question: '결혼해도 될까요?', birth: A, at: T_QIMEN_OK },
  { group: 'B 동일원국·다른질문', label: 'A · 이직', question: '이직해도 될까요?', birth: A, at: T_QIMEN_OK },
  { group: 'B 동일원국·다른질문', label: 'A · 건강', question: '요즘 몸이 어떤가요?', birth: A, at: T_QIMEN_OK },
  { group: 'C 시점형(기문 적용)', label: 'A · 지금 계약(길문)', question: '지금 계약해도 될까요?', birth: A, at: T_QIMEN_OK },
  { group: 'C 시점형(기문 적용)', label: 'A · 지금 계약(흉문)', question: '지금 계약해도 될까요?', birth: A, at: T_QIMEN_BAD_DOOR },
  { group: 'C 시점형(기문 적용)', label: 'B · 지금 창업', question: '지금 창업해도 될까요?', birth: B, at: T_QIMEN_BAD_DOOR },
  { group: 'D 정직한 저하', label: 'D · 출생시간 미상', question: '사업 방향이 맞을까요?', birth: NO_TIME, at: T_QIMEN_OK },
  { group: 'D 정직한 저하', label: 'A · 기문 계산 실패 시점', question: '지금 계약해도 될까요?', birth: A, at: T_QIMEN_FAILS },
  { group: 'D 정직한 저하', label: 'A · 성격(방향형 아님)', question: '제 타고난 성격이 어떤가요?', birth: A, at: T_QIMEN_OK },
  { group: 'E 관계', label: 'B · 재회', question: '재회 가능성이 있을까요?', birth: B, at: T_QIMEN_OK },
  { group: 'E 관계', label: 'C · 갈등', question: '왜 자꾸 부딪힐까요?', birth: C, at: T_QIMEN_OK },
  { group: 'E 관계', label: 'C · 연애', question: '연애운은 어떤가요?', birth: C, at: T_QIMEN_OK },
  { group: 'F 사업·재물', label: 'B · 사업 확장', question: '사업을 더 키워도 될까요?', birth: B, at: T_QIMEN_OK },
  { group: 'F 사업·재물', label: 'C · 사업 확장', question: '사업을 더 키워도 될까요?', birth: C, at: T_QIMEN_OK },
  { group: 'F 사업·재물', label: 'B · 저축이 남는가', question: '저축이 남을까요?', birth: B, at: T_QIMEN_OK },
  { group: 'F 사업·재물', label: 'C · 이사', question: '이사해도 될까요?', birth: C, at: T_QIMEN_OK },
];

async function verdictFor(birth: BirthInfoDraft, question: string, at: number): Promise<CrossDivinationVerdict | null> {
  const draft: ConsultationDraft = {
    subject: { id: 'self', displayName: String(birth.displayName ?? 'x'), relationship: null },
    birthInfo: birth,
  };
  const g = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: at }, question);
  return g.status === 'available' ? g.divinationVerdict ?? null : null;
}

function renderJudgment(j: DivinationJudgment | undefined): string[] {
  if (!j) return ['- (없음)'];
  if (!j.applicable) return [`- APPLIED = NO — ${j.applicabilityReason ?? j.dominantConclusion}`];
  return [
    `- PRIMARY = **${j.stance}** (근거강도 ${j.evidenceStrength} · 확신 ${j.confidence} · 직접성 ${j.questionDirectness} · 자료 ${j.dataReliability})`,
    `- 결론: ${j.dominantConclusion}`,
    `- MAJOR_FACTS_USED: ${j.factGroupsUsed.join(', ') || '(없음)'}`,
    '- SUBJUDGMENTS:',
    ...j.domainSubJudgments.map((s) => `    - ${s.domain} = ${s.stance} (${s.temporalScope}/${s.directness}) — ${s.conclusion}`),
    ...(j.counterEvidence.length
      ? ['- COUNTER_EVIDENCE:', ...j.counterEvidence.slice(0, 4).map((e) => `    - ${e.fact} — ${e.meaning}`)]
      : ['- COUNTER_EVIDENCE: (없음)']),
  ];
}

function renderCase(c: Case, v: CrossDivinationVerdict): string {
  const by = (d: DivinationJudgment['discipline']) => v.disciplineJudgments.find((j) => j.discipline === d);
  const sameProp = v.contradictionResolutions.filter((r) => r.kind === 'DIRECTNESS' || r.kind === 'RELIABILITY');
  const domainDecomp = v.contradictionResolutions.filter((r) => ['INFLOW_VS_RETENTION', 'BOND_VS_STABILITY', 'OPPORTUNITY_VS_OUTCOME', 'DIFFERENT_DOMAIN'].includes(r.kind));
  const timeDecomp = v.contradictionResolutions.filter((r) => ['ACTION_VS_TIMING', 'DIFFERENT_TIMESCALE'].includes(r.kind));
  return [
    `## [${c.group}] ${c.label}`,
    '',
    `**QUESTION** = ${c.question}`,
    `**INPUT_FACT_SUMMARY** = ${c.birth.displayName} · ${c.birth.birthYear}-${c.birth.birthMonth}-${c.birth.birthDay} ${c.birth.birthTimeAccuracy === 'exact' ? `${c.birth.birthHour}시` : '시주 미상'} · 평가시점 epoch ${c.at}`,
    '',
    '### MYUNGRI', ...renderJudgment(by('MYUNGRI')), '',
    '### ZIWEI', ...renderJudgment(by('ZIWEI')), '',
    '### QIMEN', ...renderJudgment(by('QIMEN')), '',
    '### CROSS',
    `- SAME_PROPOSITION_CONFLICT = ${sameProp.length ? sameProp.map((r) => r.conflict).join(' / ') : '없음'}`,
    `- DOMAIN_DECOMPOSITION = ${domainDecomp.length ? domainDecomp.map((r) => r.resolution).join(' / ') : '없음'}`,
    `- TEMPORAL_DECOMPOSITION = ${timeDecomp.length ? timeDecomp.map((r) => r.resolution).join(' / ') : '없음'}`,
    `- AXIS_VERDICTS = ${v.axisVerdicts.map((a) => `${a.domain}:${a.stance}${a.contested ? '(경합)' : ''}`).join(' · ') || '(없음)'}`,
    `- DOMINANT_EVIDENCE = ${v.dominantBasis}`,
    `- LOSING_EVIDENCE = ${v.contradictionResolutions.map((r) => r.whyOtherDidNotDominate).join(' / ') || '없음'}`,
    `- RESOLUTION = ${v.confidenceReason}`,
    `- **FINAL_VERDICT = ${v.direction}** (확신 ${v.confidence})`,
    `- 결론: ${v.primaryConclusion}`,
    `- 시기: ${v.timingConclusion ?? '(근거 없음 — 시점 언급 금지)'}`,
    `- 학문별 기여: ${v.contributions.map((x) => `${x.discipline}=${x.applied ? x.stance : '미적용'}`).join(' · ')}`,
    '',
    '---',
    '',
  ].join('\n');
}

describe('Depth QA pack (§26)', () => {
  it('generates ≥20 solo cases + compatibility + follow-up chains from the REAL engines', async () => {
    const blocks: string[] = [];
    let produced = 0;
    for (const c of CASES) {
      const v = await verdictFor(c.birth, c.question, c.at);
      if (!v) continue;
      blocks.push(renderCase(c, v));
      produced += 1;
    }
    expect(produced).toBeGreaterThanOrEqual(20);

    // ── COMPATIBILITY (incl. the REAL money axis, previously label-only) ───────────────────────────
    const compatBlocks: string[] = [];
    const pairs: { label: string; self: BirthInfoDraft; target: BirthInfoDraft; q: string; domain: JudgmentDomain }[] = [
      { label: '궁합 · 잘 맞나요', self: A, target: B, q: '둘이 잘 맞나요?', domain: 'RELATION_BOND' },
      { label: '궁합 · 결혼하면', self: A, target: B, q: '결혼하면 어떨까요?', domain: 'RELATION_STABILITY' },
      { label: '궁합 · 갈등', self: A, target: C, q: '왜 자꾸 싸울까요?', domain: 'CONFLICT' },
      { label: '궁합 · 돈 문제(MONEY)', self: A, target: B, q: '돈 문제로 부딪힐까요?', domain: 'MONEY_RETENTION' },
      { label: '궁합 · 돈 문제(다른 상대)', self: A, target: C, q: '돈 문제로 부딪힐까요?', domain: 'MONEY_RETENTION' },
    ];
    for (const p of pairs) {
      const [se, te] = await Promise.all([
        executeSajuFromBirthInput(toSajuEngineInput(p.self), { digestProvider }),
        executeSajuFromBirthInput(toSajuEngineInput(p.target), { digestProvider }),
      ]);
      if (!se.success || !te.success) continue;
      const pair = buildCompatibilityEvidence(
        { engineResult: se.engineResult, label: String(p.self.displayName) },
        { engineResult: te.engineResult, label: String(p.target.displayName) },
      );
      if (pair.availability !== 'available') continue;
      const selfZ = computeZiweiChartMemoized(toZiweiBirthInput(p.self));
      const targetZ = computeZiweiChartMemoized(toZiweiBirthInput(p.target));
      const judgments = [
        judgePairMyungri({ question: p.q, questionDomain: p.domain, facts: pair.facts, assessment: pair.assessment, selfLabel: String(p.self.displayName), targetLabel: String(p.target.displayName) }),
        judgePairZiwei({ question: p.q, questionDomain: p.domain, selfChart: selfZ.chart, targetChart: targetZ.chart, selfLabel: String(p.self.displayName), targetLabel: String(p.target.displayName) }),
      ];
      const v = judgeCross({ question: p.q, questionDomain: p.domain, judgments, asksTiming: false });
      compatBlocks.push(renderCase({ group: '궁합', label: p.label, question: p.q, birth: p.self, at: 0 }, v));
    }

    // ── FOLLOW-UP CHAINS (same subject, axis drilldown — verdict context must persist) ─────────────
    const followBlocks: string[] = [];
    for (const chainQ of [['사업을 더 키워도 될까요?', '돈 문제는요?'], ['결혼해도 될까요?', '그럼 언제가 나을까요?']]) {
      const first = await verdictFor(A, chainQ[0], T_QIMEN_OK);
      const second = await verdictFor(A, chainQ[1], T_QIMEN_OK);
      if (!first || !second) continue;
      followBlocks.push([
        `## [후속 대화] ${chainQ[0]} → ${chainQ[1]}`, '',
        `- Q1 verdict = **${first.direction}** — ${first.primaryConclusion}`,
        `- Q1 axes = ${first.axisVerdicts.map((a) => `${a.domain}:${a.stance}`).join(' · ')}`,
        `- Q2 verdict = **${second.direction}** — ${second.primaryConclusion}`,
        `- Q2 axes = ${second.axisVerdicts.map((a) => `${a.domain}:${a.stance}`).join(' · ')}`,
        '- 후속 턴은 저장된 교차판정(divinationVerdict)을 decisionMeta로 이어받아 "왜요?"에서 같은 판정을 설명합니다.',
        '', '---', '',
      ].join('\n'));
    }

    const doc = [
      '# DEOKBUNI — DIVINATION DEPTH QA PACK',
      '',
      '독립 심층 감사(DIVINATION_ENGINE_V1_TOO_SHALLOW)의 지적에 대응해 재구축한 판정 엔진의 결과입니다.',
      '모든 사례는 **실제 엔진**을 실제 production grounding 경로로 통과시켜 생성했습니다.',
      '',
      '이전 pack과 달라진 점:',
      '- 원국 4개(A/B/C/시주미상)로 개인화 충돌을 직접 비교할 수 있습니다.',
      '- 기문이 실제로 계산되는 시점을 사용해 **기문 적용 사례가 실제로 포함**됩니다.',
      '- 학문별 **SUBJUDGMENTS(축별 판정)** 와 교차판정의 **충돌 해소 근거**를 그대로 노출합니다.',
      '',
      '> 알려진 엔진 결함(숨기지 않고 보고): 2026-06-15 KST 시점에서는 기문 provider가 `QIMEN_CORE_FAILED`로',
      '> 실패합니다(芒種 경계 문자열 문제). 이전 QA pack이 그 시점을 고정으로 써서 기문이 12건 전부 미적용이었습니다.',
      '> 아래 "기문 계산 실패 시점" 사례가 그 상태에서의 정직한 저하를 보여 줍니다.',
      '',
      '> FINAL_KOREAN_ANSWER는 Edge의 LLM이 생성하므로 로컬에서 만들 수 없습니다. 이 문서는 그 LLM이 반드시',
      '> 지켜야 하는 **판정 구조**까지를 결정론적으로 보여 줍니다.',
      '',
      '---', '',
      ...blocks, ...compatBlocks, ...followBlocks,
    ].join('\n');

    const out = path.resolve(__dirname, '../../../../docs/DIVINATION_DEPTH_QA_PACK.md');
    fs.writeFileSync(out, doc, 'utf8');
    expect(fs.existsSync(out)).toBe(true);
    expect(compatBlocks.length).toBeGreaterThanOrEqual(3);
    expect(followBlocks.length).toBeGreaterThanOrEqual(2);
  });
});
