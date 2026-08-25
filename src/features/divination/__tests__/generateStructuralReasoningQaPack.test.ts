// V3 §39/§41 — STRUCTURAL REASONING QA PACK GENERATOR.
//
// The previous packs printed verdicts. This one prints the REASONING, because that is what the re-audit said
// was missing: for every case it shows each proposition's DERIVATION (was this inferred, or just reworded?),
// which axis actually answered, what the doctrine blockers are, and — for counterfactual groups — what changed
// between two cases that differ in exactly one input.
//
// Everything here runs the REAL production grounding path (`buildConsultationGrounding`), never a fixture.
import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';

import type { BirthInfoDraft, ConsultationDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { buildConsultationGrounding, resolveQuestionIntent } from '@/features/chat/services/consultationGrounding';
import {
  countSyntheticInferences, isDirectional, validatePaidReading, judgeCross, judgePairMyungri, judgePairZiwei,
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

// Instants chosen so Qimen genuinely computes — including one inside the window that used to fail (§25).
const T_OK = Math.floor(Date.UTC(2026, 2, 10, 1, 0, 0) / 1000);        // 2026-03-10 10:00 KST
const T_BAD_DOOR = Math.floor(Date.UTC(2026, 7, 25, 5, 0, 0) / 1000);  // 2026-08-25 14:00 KST → 흉문
const T_FIXED_GAP = Math.floor(Date.UTC(2026, 5, 15, 3, 0, 0) / 1000); // 2026-06-15 12:00 KST → 芒種 (was broken)

const chart = (over: Record<string, unknown>): BirthInfoDraft =>
  ({
    displayName: 'X', gender: 'male', calendarType: 'solar', lunarMonthType: null,
    birthYear: '1990', birthMonth: '8', birthDay: '15',
    birthTimeAccuracy: 'exact', birthHour: '14', birthMinute: '0',
    approximateTimePeriod: null, birthPlace: '서울', ...over,
  }) as unknown as BirthInfoDraft;

const A = chart({ displayName: 'A' });
const B = chart({ displayName: 'B', gender: 'female', birthYear: '1978', birthMonth: '2', birthDay: '3', birthHour: '5', birthMinute: '30' });
const C = chart({ displayName: 'C', birthYear: '2001', birthMonth: '11', birthDay: '27', birthHour: '21' });
const D = chart({ displayName: 'D', gender: 'female', birthYear: '1985', birthMonth: '5', birthDay: '9', birthHour: '3' });
const A_NO_TIME = chart({ displayName: 'A′(시주미상)', birthTimeAccuracy: 'unknown', birthHour: null, birthMinute: null });
const A_HOUR_SHIFT = chart({ displayName: 'A″(시주만 다름)', birthHour: '2' });

type Case = { group: string; label: string; question: string; birth: BirthInfoDraft; at: number };

const CASES: Case[] = [
  // A — 같은 질문, 다른 원국: 결론이 원국에 따라 실제로 갈리는가
  { group: 'A 같은 질문·다른 원국', label: 'A · 돈', question: '올해 돈을 벌 수 있을까요?', birth: A, at: T_OK },
  { group: 'A 같은 질문·다른 원국', label: 'B · 돈', question: '올해 돈을 벌 수 있을까요?', birth: B, at: T_OK },
  { group: 'A 같은 질문·다른 원국', label: 'C · 돈', question: '올해 돈을 벌 수 있을까요?', birth: C, at: T_OK },
  { group: 'A 같은 질문·다른 원국', label: 'D · 돈', question: '올해 돈을 벌 수 있을까요?', birth: D, at: T_OK },

  // B — 같은 원국, 다른 축: 축이 바뀌면 답도 바뀌는가 (한 결론의 재탕이 아닌가)
  { group: 'B 같은 원국·다른 축', label: 'A · 버는 쪽', question: '올해 돈을 벌 수 있을까요?', birth: A, at: T_OK },
  { group: 'B 같은 원국·다른 축', label: 'A · 남는 쪽', question: '저축이 남을까요?', birth: A, at: T_OK },
  { group: 'B 같은 원국·다른 축', label: 'A · 자리', question: '이직해도 될까요?', birth: A, at: T_OK },
  { group: 'B 같은 원국·다른 축', label: 'A · 관계', question: '결혼해도 될까요?', birth: A, at: T_OK },
  { group: 'B 같은 원국·다른 축', label: 'A · 몸', question: '요즘 몸이 어떤가요?', birth: A, at: T_OK },

  // C — 질문 의도(§8): 서술/원인 질문이 행동 권고로 변형되지 않는가
  { group: 'C 질문 의도', label: 'A · 서술형', question: '제 타고난 성격이 어떤가요?', birth: A, at: T_OK },
  { group: 'C 질문 의도', label: 'A · 원인형', question: '왜 자꾸 부딪힐까요?', birth: A, at: T_OK },
  { group: 'C 질문 의도', label: 'A · 결정형', question: '사업을 더 키워도 될까요?', birth: A, at: T_OK },
  { group: 'C 질문 의도', label: 'A · 시기형', question: '언제 움직이는 게 나을까요?', birth: A, at: T_OK },
  { group: 'C 질문 의도', label: 'C · 원인형', question: '왜 자꾸 부딪힐까요?', birth: C, at: T_OK },

  // D — 반사실(counterfactual): 입력 하나만 바꾸면 판단이 그 방향으로 움직이는가
  { group: 'D 반사실 · 시주', label: 'A · 시주 14시', question: '사업 방향이 맞을까요?', birth: A, at: T_OK },
  { group: 'D 반사실 · 시주', label: 'A″ · 시주 02시', question: '사업 방향이 맞을까요?', birth: A_HOUR_SHIFT, at: T_OK },
  { group: 'D 반사실 · 시주', label: 'A′ · 시주 미상', question: '사업 방향이 맞을까요?', birth: A_NO_TIME, at: T_OK },
  { group: 'D 반사실 · 시점', label: 'A · 길문 시점', question: '지금 계약해도 될까요?', birth: A, at: T_OK },
  { group: 'D 반사실 · 시점', label: 'A · 흉문 시점', question: '지금 계약해도 될까요?', birth: A, at: T_BAD_DOOR },
  { group: 'D 반사실 · 시점', label: 'A · 구 결번 구간(芒種)', question: '지금 계약해도 될까요?', birth: A, at: T_FIXED_GAP },

  // E — 물어본 축이 답한다 (§9): 다른 축으로 대신 답하지 않는가
  { group: 'E 물어본 축', label: 'A · 건강', question: '요즘 몸이 어떤가요?', birth: A, at: T_OK },
  { group: 'E 물어본 축', label: 'B · 건강', question: '요즘 몸이 어떤가요?', birth: B, at: T_OK },
  { group: 'E 물어본 축', label: 'C · 이동', question: '이사해도 될까요?', birth: C, at: T_OK },
  { group: 'E 물어본 축', label: 'D · 이동', question: '이사해도 될까요?', birth: D, at: T_OK },

  // F — 시점형(기문 적용): 시점 판단이 원국 판단을 뒤엎지 않는가
  { group: 'F 시점형', label: 'B · 지금 창업', question: '지금 창업해도 될까요?', birth: B, at: T_BAD_DOOR },
  { group: 'F 시점형', label: 'C · 지금 투자', question: '지금 투자해도 될까요?', birth: C, at: T_OK },
  { group: 'F 시점형', label: 'D · 지금 계약', question: '지금 계약해도 될까요?', birth: D, at: T_BAD_DOOR },

  // G — 정직한 저하: 근거가 없을 때 없다고 말하는가
  { group: 'G 정직한 저하', label: 'A′ · 시주미상 · 결혼', question: '결혼해도 될까요?', birth: A_NO_TIME, at: T_OK },
  { group: 'G 정직한 저하', label: 'A′ · 시주미상 · 시기', question: '언제가 좋을까요?', birth: A_NO_TIME, at: T_OK },

  // H — 사업/재물 심화
  { group: 'H 사업·재물', label: 'B · 확장', question: '사업을 더 키워도 될까요?', birth: B, at: T_OK },
  { group: 'H 사업·재물', label: 'C · 확장', question: '사업을 더 키워도 될까요?', birth: C, at: T_OK },
  { group: 'H 사업·재물', label: 'D · 저축', question: '저축이 남을까요?', birth: D, at: T_OK },
  { group: 'H 사업·재물', label: 'B · 저축', question: '저축이 남을까요?', birth: B, at: T_OK },

  // I — 관계 심화
  { group: 'I 관계', label: 'B · 재회', question: '재회 가능성이 있을까요?', birth: B, at: T_OK },
  { group: 'I 관계', label: 'C · 연애', question: '연애운은 어떤가요?', birth: C, at: T_OK },
  { group: 'I 관계', label: 'D · 결혼', question: '결혼해도 될까요?', birth: D, at: T_OK },
];

async function verdictFor(birth: BirthInfoDraft, question: string, at: number): Promise<CrossDivinationVerdict | null> {
  const draft: ConsultationDraft = {
    subject: { id: 'self', displayName: String(birth.displayName ?? 'x'), relationship: null },
    birthInfo: birth,
  };
  const g = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: at }, question);
  return g.status === 'available' ? g.divinationVerdict ?? null : null;
}

const DERIVATION_KO: Record<string, string> = {
  SINGLE_FACT_RESTATEMENT: '단일사실 재진술(추론 아님)',
  MULTI_FACT_WITHIN_DISCIPLINE: '학문 내 다중사실 종합',
  CROSS_DISCIPLINE_SYNTHESIS: '학문 간 충돌 해소',
  COMPOUND_TRUTH: '복합진실(양축 동시 참)',
  STRUCTURAL_ABSENCE: '구조적 부재로부터의 판단',
};

/** Doctrine blockers must be VISIBLE in the pack — a withheld judgment that nobody can see is a hidden gap. */
function blockersIn(v: CrossDivinationVerdict): string[] {
  const out: string[] = [];
  for (const j of v.disciplineJudgments) {
    for (const e of [...j.directEvidence, ...j.counterEvidence]) {
      if (/보류|미채택|세우지 않습니다/.test(e.meaning) || /보류|미채택/.test(e.fact)) out.push(`${j.discipline}: ${e.fact}`);
    }
  }
  return [...new Set(out)];
}

function renderJudgment(j: DivinationJudgment | undefined): string[] {
  if (!j) return ['- (없음)'];
  if (!j.applicable) return [`- APPLIED = NO — ${j.applicabilityReason ?? j.dominantConclusion}`];
  return [
    `- PRIMARY = **${j.stance}** (근거강도 ${j.evidenceStrength} · 확신 ${j.confidence} · 직접성 ${j.questionDirectness} · 자료 ${j.dataReliability})`,
    `- 결론: ${j.dominantConclusion}`,
    `- 결정 요인(구조): ${j.dominantFactor}`,
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
  const asked = v.axisVerdicts.find((a) => a.domain === v.questionDomain);
  const synth = countSyntheticInferences(v.propositions);
  const blockers = blockersIn(v);
  return [
    `## [${c.group}] ${c.label}`,
    '',
    `**QUESTION** = ${c.question}`,
    `**QUESTION_INTENT** = ${resolveQuestionIntent(c.question)} · **ASKED_AXIS** = ${v.questionDomain}`,
    `**INPUT** = ${c.birth.displayName} · ${c.birth.birthYear}-${c.birth.birthMonth}-${c.birth.birthDay} ${c.birth.birthTimeAccuracy === 'exact' ? `${c.birth.birthHour}시` : '시주 미상'} · 평가시점 epoch ${c.at}`,
    '',
    '### MYUNGRI', ...renderJudgment(by('MYUNGRI')), '',
    '### ZIWEI', ...renderJudgment(by('ZIWEI')), '',
    '### QIMEN', ...renderJudgment(by('QIMEN')), '',
    '### REASONING',
    `- **FINAL_VERDICT = ${v.direction}** (확신 ${v.confidence})`,
    `- ANSWERED_ON_ASKED_AXIS = ${asked ? `YES (${asked.domain} = ${asked.stance}${asked.contested ? ', 경합 해소됨' : ''})` : 'NO — 물어본 축으로 답하지 않음'}`,
    `- 결론: ${v.primaryConclusion}`,
    `- SYNTHETIC_INFERENCES = ${synth} / ${v.propositions.length}`,
    '- PROPOSITIONS:',
    ...(v.propositions.length
      ? v.propositions.map((p) =>
          `    - [${DERIVATION_KO[p.derivation] ?? p.derivation}] (${p.fromDisciplines.join('+')}) ${p.claim}\n        ← ${p.fromFacts.slice(0, 3).join(' / ') || '(명시적 사실 없음 — 부재로부터의 판단)'}`)
      : ['    - (없음 — 방향을 정하지 않은 판정)']),
    `- CONTRADICTION_RESOLUTIONS = ${v.contradictionResolutions.length ? v.contradictionResolutions.map((r) => `${r.kind}: ${r.resolution}`).join(' / ') : '없음'}`,
    `- WHY_OTHER_DID_NOT_DOMINATE = ${v.contradictionResolutions.map((r) => r.whyOtherDidNotDominate).join(' / ') || '해당 없음'}`,
    `- AXIS_VERDICTS = ${v.axisVerdicts.map((a) => `${a.domain}:${a.stance}${a.contested ? '(경합)' : ''}`).join(' · ') || '(없음)'}`,
    `- DOCTRINE_BLOCKERS = ${blockers.length ? blockers.join(' / ') : '없음'}`,
    `- 시기: ${v.timingConclusion ?? '(근거 없음 — 시점 언급 금지)'}`,
    `- 학문별 기여: ${v.contributions.map((x) => `${x.discipline}=${x.applied ? x.stance : '미적용'}`).join(' · ')}`,
    '',
    '---',
    '',
  ].join('\n');
}

/** §41 — a counterfactual pair is only informative if it states WHAT MOVED between the two runs. */
function renderDelta(title: string, a: { c: Case; v: CrossDivinationVerdict }, b: { c: Case; v: CrossDivinationVerdict }): string {
  const axes = (v: CrossDivinationVerdict) => new Map(v.axisVerdicts.map((x) => [x.domain, x.stance]));
  const [ma, mb] = [axes(a.v), axes(b.v)];
  const moved = [...new Set([...ma.keys(), ...mb.keys()])]
    .filter((d) => ma.get(d) !== mb.get(d))
    .map((d) => `${d}: ${ma.get(d) ?? '(없음)'} → ${mb.get(d) ?? '(없음)'}`);
  return [
    `## [반사실 대조] ${title}`, '',
    `- A = ${a.c.label} → **${a.v.direction}**`,
    `- B = ${b.c.label} → **${b.v.direction}**`,
    `- DIRECTION_MOVED = ${a.v.direction === b.v.direction ? 'NO' : 'YES'}`,
    `- AXES_MOVED = ${moved.length ? moved.join(' · ') : '없음'}`,
    `- 근거 차이: ${a.v.dominantBasis}  ⟷  ${b.v.dominantBasis}`,
    '', '---', '',
  ].join('\n');
}

describe('Structural reasoning QA pack (§39/§41)', () => {
  it('generates ≥30 cases + counterfactual deltas + compatibility from the REAL engines', async () => {
    const produced: { c: Case; v: CrossDivinationVerdict }[] = [];
    for (const c of CASES) {
      const v = await verdictFor(c.birth, c.question, c.at);
      if (v) produced.push({ c, v });
    }
    expect(produced.length).toBeGreaterThanOrEqual(30);

    // §7 — the pack must not contain a single case that performed zero inference while still answering.
    const answeredWithoutInference = produced.filter(
      (p) => p.v.propositions.length > 0 && countSyntheticInferences(p.v.propositions) === 0,
    );
    expect(answeredWithoutInference.map((p) => p.c.label)).toEqual([]);

    // §28 — across ALL cases, a directional verdict's own headline must state its direction. A headline that
    // only describes the chart ("명궁에 …한 기운이 들어옵니다") is unusable to the person who paid for it.
    const unusableHeadlines = produced
      .filter((p) => isDirectional(p.v.direction))
      .filter((p) => validatePaidReading(p.v, `${p.v.primaryConclusion} ${p.v.actionableInterpretation}`)
        .some((f) => f.code === 'VERDICT_LOST_IN_PROSE' || f.code === 'VERDICT_REVERSED_IN_PROSE'))
      .map((p) => `${p.c.label}: ${p.v.primaryConclusion}`);
    expect(unusableHeadlines).toEqual([]);

    const find = (label: string) => produced.find((p) => p.c.label === label);
    const deltas: string[] = [];
    const pairs: [string, string, string][] = [
      ['시주만 바뀌면 판단이 움직이는가', 'A · 시주 14시', 'A″ · 시주 02시'],
      ['시주를 모르면 정직하게 낮아지는가', 'A · 시주 14시', 'A′ · 시주 미상'],
      ['시점(길문/흉문)이 판단을 바꾸는가', 'A · 길문 시점', 'A · 흉문 시점'],
      ['같은 원국에서 버는 축과 남는 축이 갈리는가', 'A · 버는 쪽', 'A · 남는 쪽'],
      ['같은 질문에서 원국이 다르면 갈리는가', 'A · 돈', 'C · 돈'],
    ];
    for (const [title, la, lb] of pairs) {
      const a = find(la);
      const b = find(lb);
      if (a && b) deltas.push(renderDelta(title, a, b));
    }

    // ── COMPATIBILITY (pair axes must diverge, not average into "보통") ────────────────────────────
    const compatBlocks: string[] = [];
    const compatPairs: { label: string; self: BirthInfoDraft; target: BirthInfoDraft; q: string; domain: JudgmentDomain }[] = [
      { label: '궁합 · 잘 맞나요(A×B)', self: A, target: B, q: '둘이 잘 맞나요?', domain: 'RELATION_BOND' },
      { label: '궁합 · 결혼하면(A×B)', self: A, target: B, q: '결혼하면 어떨까요?', domain: 'RELATION_STABILITY' },
      { label: '궁합 · 돈 문제(A×B)', self: A, target: B, q: '돈 문제로 부딪힐까요?', domain: 'MONEY_RETENTION' },
      { label: '궁합 · 돈 문제(A×C)', self: A, target: C, q: '돈 문제로 부딪힐까요?', domain: 'MONEY_RETENTION' },
      { label: '궁합 · 갈등(A×C)', self: A, target: C, q: '왜 자꾸 싸울까요?', domain: 'CONFLICT' },
      { label: '궁합 · 돈 문제(B×D)', self: B, target: D, q: '돈 문제로 부딪힐까요?', domain: 'MONEY_RETENTION' },
    ];
    for (const p of compatPairs) {
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
      const judgments = [
        judgePairMyungri({ question: p.q, questionDomain: p.domain, facts: pair.facts, assessment: pair.assessment, selfLabel: String(p.self.displayName), targetLabel: String(p.target.displayName) }),
        judgePairZiwei({ question: p.q, questionDomain: p.domain, selfChart: computeZiweiChartMemoized(toZiweiBirthInput(p.self)).chart, targetChart: computeZiweiChartMemoized(toZiweiBirthInput(p.target)).chart, selfLabel: String(p.self.displayName), targetLabel: String(p.target.displayName) }),
      ];
      const v = judgeCross({ question: p.q, questionDomain: p.domain, judgments, asksTiming: false });
      compatBlocks.push(renderCase({ group: '궁합', label: p.label, question: p.q, birth: p.self, at: 0 }, v));
    }
    expect(compatBlocks.length).toBeGreaterThanOrEqual(4);

    const totalSynth = produced.reduce((n, p) => n + countSyntheticInferences(p.v.propositions), 0);

    // §13 BLOCKING ITEM — which asked axes NO discipline can natively examine. This is a coverage gap in the
    // engines, not an absence of signal in the chart, and it is the single biggest reason cases decline.
    const coverage = new Map<string, Set<string>>();
    for (const { v } of produced) {
      const set = coverage.get(v.questionDomain) ?? new Set<string>();
      for (const j of v.disciplineJudgments) {
        if (j.applicable && j.domainSubJudgments.some((s) => s.domain === v.questionDomain)) set.add(j.discipline);
      }
      coverage.set(v.questionDomain, set);
    }
    const coverageRows = [...coverage.entries()]
      .sort()
      .map(([axis, set]) => `| ${axis} | ${[...set].sort().join(', ') || '**없음 — 어떤 학문도 이 축을 직접 보지 못함**'} |`);
    const declined = produced.filter((p) => p.v.direction === 'INSUFFICIENT_EVIDENCE' || p.v.direction === 'INSUFFICIENT_DATA');
    const header = [
      '# DEOKBUNI — DIVINATION STRUCTURAL REASONING QA PACK (V3)',
      '',
      '> 자동 생성 문서입니다. 손으로 고치지 마세요.',
      '> 생성기: `src/features/divination/__tests__/generateStructuralReasoningQaPack.test.ts`',
      '> 모든 케이스는 실제 운영 경로(`buildConsultationGrounding`)를 그대로 통과시켜 얻은 결과입니다.',
      '',
      '## 이 팩이 증명하려는 것',
      '',
      '| 항목 | 값 |',
      '| --- | --- |',
      `| 단독 상담 케이스 | ${produced.length} |`,
      `| 반사실 대조쌍 | ${deltas.length} |`,
      `| 궁합 케이스 | ${compatBlocks.length} |`,
      `| 총 합성추론(SYNTHETIC_INFERENCE) 수 | ${totalSynth} |`,
      `| 답을 내면서 추론이 0이던 케이스 | ${answeredWithoutInference.length} (0이어야 함 — §7) |`,
      `| 방향을 내지 못한 케이스 | ${declined.length} / ${produced.length} |`,
      '',
      '## ⚠ 미해결 블로커 — 축 커버리지 공백 (§13)',
      '',
      '아래 표는 "물어본 축"별로, 그 축을 **직접 보는 자리를 가진 학문**을 나열한 것입니다.',
      '비어 있는 축은 사주가 침묵해서가 아니라 **엔진에 그 축을 보는 경로가 정의되어 있지 않아서** 답이 나오지',
      '않습니다. 명리 축은 현재 년/월/일/시 궁위와 십신 오행에서만 유도되므로, 몸·이동·기회 같은 축은 원국이',
      '아무리 많은 구조를 담고 있어도 그 축으로 집계되지 않습니다.',
      '',
      '이 공백은 학파 채택 문제가 아니라 매핑 문제이므로 다음 스프린트에서 근거를 명시해 메워야 합니다.',
      '지금은 추측으로 메우지 않고, 답하지 못한 이유를 사용자에게 그대로 말합니다.',
      '',
      '| 물어본 축 | 이 축을 직접 보는 학문 |',
      '| --- | --- |',
      ...coverageRows,
      '',
      '- **SYNTHETIC_INFERENCES = n / m** — m개 명제 중 n개가 실제 추론입니다. 단일사실 재진술은 추론으로 세지 않습니다.',
      '- **ANSWERED_ON_ASKED_AXIS** — 물어본 축으로 답했는지. 다른 축으로 대신 답하는 것은 금지입니다(§9).',
      '- **DOCTRINE_BLOCKERS** — 근거 학파가 없어 판정을 보류한 항목. 비어 있지 않은 것이 정상이며, 숨기지 않습니다(§13).',
      '- **반사실 대조** — 입력 하나만 바꿨을 때 판단이 실제로 움직이는지. 움직이지 않으면 그 입력은 쓰이지 않은 것입니다.',
      '',
      '---',
      '',
    ].join('\n');

    const doc = [
      header,
      ...produced.map((p) => renderCase(p.c, p.v)),
      '# 반사실 대조(§41)', '',
      ...deltas,
      '# 궁합(§31–§33)', '',
      ...compatBlocks,
    ].join('\n');

    const out = path.join(process.cwd(), 'docs', 'DIVINATION_STRUCTURAL_REASONING_QA_PACK.md');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, doc, 'utf8');
    expect(fs.existsSync(out)).toBe(true);
  }, 120_000);
});
