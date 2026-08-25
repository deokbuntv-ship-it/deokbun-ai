// V4A §24 — REASONING KERNEL QA PACK GENERATOR.
//
// This is an ARCHITECTURE PROOF pack, not a demo. For every scenario it prints the premise graph, the derived
// propositions with their derivation links, the counter-premises, and then ACTUALLY RUNS the metamorphic
// variants — deleting or reversing one premise, re-deriving, and recording what changed. A conclusion that
// survives the removal of its own premises is decorative, and this pack is where that would become visible.
//
// Everything runs the REAL production grounding path; the variants re-run the REAL derivation rules over the
// REAL premises that path produced.
import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';

import type { BirthInfoDraft, ConsultationDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { buildConsultationGrounding, resolveQuestionIntent } from '@/features/chat/services/consultationGrounding';
import { parseDecisionMeta } from '@/features/chat/server/decisionMeta';
import {
  MYUNGRI_RULES, PRIMITIVE_RULE, classifySynthesis, countRealSynthesis, primitivePropositions,
  runDerivations, standingPropositions,
  type CrossDivinationVerdict, type DerivationContext, type DivinationPremise, type ReasonedProposition,
} from '@/features/divination';

const digestProvider: DigestProvider = {
  async sha256Utf8(input: string): Promise<string> {
    return createHash('sha256').update(input, 'utf8').digest('hex');
  },
};
const NOW = Math.floor(Date.UTC(2026, 2, 10, 1, 0, 0) / 1000);

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

type Scenario = { group: string; label: string; question: string; birth: BirthInfoDraft };

const SCENARIOS: Scenario[] = [
  { group: '재물', label: 'A · 유입', question: '올해 돈을 벌 수 있을까요?', birth: A },
  { group: '재물', label: 'A · 보유', question: '저축이 남을까요?', birth: A },
  { group: '재물', label: 'B · 유입', question: '올해 돈을 벌 수 있을까요?', birth: B },
  { group: '사업·기회', label: 'A · 확장', question: '사업을 더 키워도 될까요?', birth: A },
  { group: '사업·기회', label: 'C · 확장', question: '사업을 더 키워도 될까요?', birth: C },
  { group: '자리·이동', label: 'A · 이직', question: '이직해도 될까요?', birth: A },
  { group: '자리·이동', label: 'D · 이사', question: '이사해도 될까요?', birth: D },
  { group: '관계', label: 'A · 결혼', question: '결혼해도 될까요?', birth: A },
  { group: '관계', label: 'B · 재회', question: '재회 가능성이 있을까요?', birth: B },
  { group: '시점', label: 'A · 지금 계약', question: '지금 계약해도 될까요?', birth: A },
  { group: '서술형(§12)', label: 'A · 성격', question: '제 타고난 성격이 어떤가요?', birth: A },
  { group: '원인형(§12)', label: 'C · 왜 부딪히나', question: '왜 자꾸 부딪힐까요?', birth: C },
];

async function verdictFor(birth: BirthInfoDraft, question: string): Promise<CrossDivinationVerdict | null> {
  const draft: ConsultationDraft = {
    subject: { id: 'self', displayName: String(birth.displayName ?? 'x'), relationship: null },
    birthInfo: birth,
  };
  const g = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: NOW }, question);
  return g.status === 'available' ? g.divinationVerdict ?? null : null;
}

// ── D/E/F — METAMORPHIC VARIANTS, ACTUALLY EXECUTED ─────────────────────────────────────────────
/**
 * `MATERIAL`   — removing/reversing this premise changed the conclusion.
 * `REDUNDANT`  — it alone changed nothing, but removing every INTERCHANGEABLE source of the same role did.
 *                A chart with both 통근 and 득령 genuinely still holds when one is taken away, and an engine
 *                that said otherwise would be wrong. Redundancy is not decoration — but it only counts as
 *                redundancy when the group removal is shown to move the conclusion, so it cannot be an alibi.
 * `INERT`       — nothing moved, alone or as a group. The premise was decorative and the sprint fails.
 */
type Materiality = 'MATERIAL' | 'REDUNDANT' | 'INERT';
type Variant = { kind: string; premise: string; expected: string; actual: string; materiality: Materiality };

/** Re-derive Myungri's graph from a MUTATED premise set and report what the conclusion did. */
function metamorphic(v: CrossDivinationVerdict): Variant[] {
  const myungri = v.premises.filter((p) => p.discipline === 'MYUNGRI');
  if (myungri.length === 0) return [];
  const ctx: DerivationContext = {
    subject: '본인', questionIntent: v.questionIntent, askedAxis: v.questionDomain, dataComplete: true,
  };
  // Compare CONCLUSIONS, not which rules fired. "STRUCTURAL_PROFILE still fired" is not evidence that the
  // removed premise was immaterial — the rule can fire with a materially different statement. The question is
  // whether what the engine SAYS changed.
  const derive = (ps: DivinationPremise[]) =>
    standingPropositions(runDerivations(MYUNGRI_RULES, ps, primitivePropositions(ps, ctx), ctx))
      .filter((p) => p.derivationRule !== PRIMITIVE_RULE)
      .map((p) => `${p.derivationRule}:${p.questionAxis}:${p.assertion}`)
      .sort();
  const baseline = derive(myungri);
  if (baseline.length === 0) return [];

  const out: Variant[] = [];
  // Sample ONE cited premise per distinct derived rule, rather than the first N cited premises. Taking the
  // first four happened to pick four natal-family premises that all feed the same rule, so the pack proved one
  // rule four times and said nothing about the others. This exercises each rule that actually fired.
  const derivedProps = standingPropositions(runDerivations(MYUNGRI_RULES, myungri, primitivePropositions(myungri, ctx), ctx))
    .filter((p) => p.derivationRule !== PRIMITIVE_RULE);
  const perRule = new Map<string, string>();
  for (const p of derivedProps) {
    const cite = [...p.supportingPremiseIds, ...p.opposingPremiseIds][0];
    if (cite && !perRule.has(p.derivationRule)) perRule.set(p.derivationRule, cite);
  }
  const sampled = new Set(perRule.values());
  for (const target of myungri.filter((p) => sampled.has(p.id))) {
    const after = derive(myungri.filter((p) => p.id !== target.id));
    const lost = baseline.filter((r) => !after.includes(r));
    const gained = after.filter((r) => !baseline.includes(r));
    const short = (r: string) => r.split(':').slice(0, 2).join(':');
    const movedAlone = lost.length > 0 || gained.length > 0;
    // When one premise alone changes nothing, ask whether it is REDUNDANT rather than decorative: remove every
    // premise playing the same structural ROLE and see whether the conclusion moves then.
    const sameRole = myungri.filter((p) => p.semanticRelation === target.semanticRelation);
    const groupAfter = movedAlone ? [] : derive(myungri.filter((p) => !sameRole.some((r) => r.id === p.id)));
    const movedAsGroup = !movedAlone && groupAfter.join('|') !== baseline.join('|');
    out.push({
      kind: 'REMOVE',
      premise: `${target.semanticRelation} · ${target.target}`,
      expected: '이 전제를 인용한 결론이 사라지거나 진술이 바뀐다',
      actual: movedAlone
        ? `사라짐: ${lost.map(short).join(', ') || '없음'} / 바뀜·생김: ${gained.map(short).join(', ') || '없음'}`
        : movedAsGroup
          ? `단독 제거로는 변화 없음. 같은 역할(${target.semanticRelation}) ${sameRole.length}개를 모두 제거하면 결론이 바뀜 → 대체 가능한 근거`
          : '변화 없음',
      materiality: movedAlone ? 'MATERIAL' : movedAsGroup ? 'REDUNDANT' : 'INERT',
    });
  }
  // Reverse the chart's CAPACITY — the conclusion should change KIND, not wording.
  //
  // Capacity comes from more than one place (통근 뿌리 AND 월령 득령), so flipping only the root is not the
  // "no capacity" counterfactual — a 득령 chart still holds, and the engine is right to say so. The variant
  // therefore flips EVERY capacity-providing premise, which is the counterfactual actually being claimed.
  const capacityPremises = myungri.filter((p) =>
    p.semanticRelation === 'STABILIZES'
    || (p.semanticRelation === 'ENABLES' && p.target.includes('계절')));
  if (capacityPremises.length > 0) {
    const capacity = capacityPremises[0];
    const capacityIds = new Set(capacityPremises.map((p) => p.id));
    const flipped = myungri.map((p) => (capacityIds.has(p.id)
      ? { ...p, semanticRelation: (p.semanticRelation === 'STABILIZES' ? 'WEAKENS' : 'CONSTRAINS') as DivinationPremise['semanticRelation'] }
      : p));
    const after = derive(flipped);
    const changed = after.filter((r) => !baseline.includes(r));
    out.push({
      kind: 'REVERSE',
      premise: `버틸 바탕 전체(${capacityPremises.length}개: ${capacityPremises.map((p) => p.target).join(', ')})`,
      expected: '버티는 결론 ↔ 못 버티는 결론으로 방향 자체가 바뀐다',
      actual: changed.length
        ? `바뀐 결론: ${changed.map((r) => r.split(':').slice(0, 2).join(':')).join(', ')}`
        : '변화 없음',
      materiality: changed.length > 0 ? 'MATERIAL' : 'INERT',
    });
  }
  return out;
}

function renderScenario(s: Scenario, v: CrossDivinationVerdict): string {
  const standing = standingPropositions(v.propositions);
  const byId = new Map(v.premises.map((p) => [p.id, p]));
  const derived = standing.filter((p) => p.derivationRule !== PRIMITIVE_RULE);
  const census = countRealSynthesis(v.propositions, v.premises);
  const variants = metamorphic(v);
  const nameOf = (id: string) => {
    const p = byId.get(id);
    return p ? `${p.semanticRelation}·${p.target}` : id;
  };

  return [
    `## [${s.group}] ${s.label}`,
    '',
    `**QUESTION** = ${s.question}`,
    `**INTENT** = ${resolveQuestionIntent(s.question)} · **ASKED_AXIS** = ${v.questionDomain} · **VERDICT** = ${v.direction}`,
    `**결론** = ${v.primaryConclusion}`,
    '',
    '### A. PREMISE GRAPH',
    ...(v.premises.length
      ? v.premises.slice(0, 14).map((p) =>
        `- \`${p.id}\` [${p.discipline}] **${p.semanticRelation}** ${p.target} · ${p.temporalScope} · ${p.applicability}\n    - ${p.assertion}\n    - ← ${p.sourceFactIds.join(' / ') || '(부재 사실)'}  · 근거학설: ${p.doctrineReference}`)
      : ['- (전제 없음)']),
    ...(v.premises.length > 14 ? [`- … 외 ${v.premises.length - 14}개`] : []),
    '',
    '### B. DERIVED PROPOSITIONS',
    ...(derived.length
      ? derived.map((p) =>
        `- **${p.derivationRule}** (${p.discipline}) · ${p.conclusionType}/${p.direction}${p.restriction ? `(${p.restriction})` : ''}\n    - ${p.assertion}\n    - 지지 전제: ${p.supportingPremiseIds.map(nameOf).join(', ') || '(없음)'}\n    - 상위 명제로부터: ${p.derivedFromPropositionIds.join(', ') || '(없음)'}`)
      : ['- (파생 명제 없음 — 단일 전제만으로는 추론이 성립하지 않음)']),
    '',
    '### C. COUNTER-PREMISES',
    ...(derived.some((p) => p.opposingPremiseIds.length)
      ? derived.filter((p) => p.opposingPremiseIds.length).map((p) =>
        `- ${p.derivationRule} ← 반대 전제: ${p.opposingPremiseIds.map(nameOf).join(', ')}`)
      : ['- (반대 전제 없음)']),
    '',
    '### D/E/F. METAMORPHIC VARIANTS · 기대 변화 · 실제 변화',
    ...(variants.length
      ? variants.map((x) =>
        `- **${x.kind}** \`${x.premise}\`\n    - 기대: ${x.expected}\n    - 실제: ${x.actual}\n    - **판정: ${x.materiality === 'MATERIAL' ? 'MATERIAL (전제가 결론을 실제로 움직임)'
          : x.materiality === 'REDUNDANT' ? 'REDUNDANT (대체 근거가 있어 단독으로는 결론을 바꾸지 않음 — 장식이 아님)'
            : '⚠ INERT (장식적 전제 — 있으나 마나)'}**`)
      : ['- (파생 명제가 없어 변형 실험 대상 없음)']),
    '',
    '### G. SYNTHESIS CLASSIFICATION',
    `- REAL_SYNTHETIC_INFERENCE = ${census.REAL_SYNTHETIC_INFERENCE}`,
    `- MULTI_FACT_SUMMARY = ${census.MULTI_FACT_SUMMARY}`,
    `- STATIC_RULE_OUTPUT = ${census.STATIC_RULE_OUTPUT} (단일 전제 재진술 — 추론으로 세지 않음)`,
    `- UNSUPPORTED_INFERENCE = ${census.UNSUPPORTED_INFERENCE} (0이어야 함)`,
    ...standing.map((p) => `    - ${p.derivationRule} → ${classifySynthesis(p, byId)}`),
    '',
    '---',
    '',
  ].join('\n');
}

describe('V4A reasoning kernel QA pack (§24)', () => {
  it('generates the architecture proof pack from the REAL kernel', async () => {
    const produced: { s: Scenario; v: CrossDivinationVerdict }[] = [];
    for (const s of SCENARIOS) {
      const v = await verdictFor(s.birth, s.question);
      if (v) produced.push({ s, v });
    }
    expect(produced.length).toBeGreaterThanOrEqual(12);

    // §25 HARD FAILURE — an UNSUPPORTED inference is a claim standing on nothing.
    for (const { s, v } of produced) {
      expect(`${s.label}:${countRealSynthesis(v.propositions, v.premises).UNSUPPORTED_INFERENCE}`).toBe(`${s.label}:0`);
    }

    // §14 — at least SIX Myungri scenarios must carry a certified real synthesis, across different axes.
    const myungriReal = produced.filter(({ v }) => {
      const byId = new Map(v.premises.map((p) => [p.id, p]));
      return standingPropositions(v.propositions)
        .some((p) => p.discipline === 'MYUNGRI' && classifySynthesis(p, byId) === 'REAL_SYNTHETIC_INFERENCE');
    });
    expect(myungriReal.length).toBeGreaterThanOrEqual(6);
    expect(new Set(myungriReal.map(({ v }) => v.questionDomain)).size).toBeGreaterThanOrEqual(3);

    // §24 — at least THREE scenarios must carry a CROSS synthesis.
    const crossReal = produced.filter(({ v }) =>
      standingPropositions(v.propositions).some((p) => p.discipline === 'CROSS'));
    expect(crossReal.length).toBeGreaterThanOrEqual(3);

    // §8 — every metamorphic variant the pack ran must have MOVED the conclusion.
    // Only genuinely INERT premises fail. REDUNDANT ones are correct behaviour and are reported as such.
    const inert = produced.flatMap(({ s, v }) =>
      metamorphic(v).filter((x) => x.materiality === 'INERT').map((x) => `${s.label}: ${x.kind} ${x.premise}`));
    expect(inert).toEqual([]);

    // §22 — the follow-up chain, through the REAL parser.
    const q1 = produced.find(({ s }) => s.label === 'A · 확장')!.v;
    const meta = {
      answerPlanVersion: 'a', decisionPolicyVersion: 'b', promptVersion: 'c',
      resolvedGranularity: 'NONE', resolvedTargets: [],
      resolvedTemporalContext: {
        anchorEpochSeconds: NOW, resolvedTargets: [], timezone: 'Asia/Seoul',
        qimenActive: false, referenceYear: 2026, referenceMonth: 3,
      },
      divinationVerdict: q1,
    };
    const restored = parseDecisionMeta(JSON.parse(JSON.stringify(meta)))?.divinationVerdict;
    expect(restored).toBeTruthy();
    const q3 = await verdictFor(A, '돈은요?');

    const chain = [
      '## [후속 대화 체인] 사업을 확장할까? → 왜? → 돈은?', '',
      `- **Q1** \`${q1.questionDomain}\` → **${q1.direction}** — ${q1.primaryConclusion}`,
      `- **Q2 (왜?)** 는 저장된 그래프를 복원해 같은 전제를 설명합니다.`,
      `    - 복원된 전제 수 = ${restored!.premises.length} (Q1과 동일: ${restored!.premises.length === q1.premises.length})`,
      `    - 복원된 명제 수 = ${restored!.propositions.length} · 파생 링크 유실 = ${
        restored!.propositions.some((p) => p.derivedFromPropositionIds
          .some((id) => !restored!.propositions.find((x) => x.id === id))) ? '있음 ⚠' : '없음'}`,
      `    - 평가 시각 보존 = ${restored!.evaluatedAtEpochSeconds === NOW}`,
      `- **Q3 (돈은?)** \`${q3?.questionDomain}\` → **${q3?.direction}** — ${q3?.primaryConclusion}`,
      `    - 다른 축으로 이동했는가 = ${q3?.questionDomain !== q1.questionDomain}`,
      '', '---', '',
    ].join('\n');

    const totals = produced.reduce((acc, { v }) => {
      const c = countRealSynthesis(v.propositions, v.premises);
      acc.real += c.REAL_SYNTHETIC_INFERENCE;
      acc.summary += c.MULTI_FACT_SUMMARY;
      acc.staticRule += c.STATIC_RULE_OUTPUT;
      acc.unsupported += c.UNSUPPORTED_INFERENCE;
      return acc;
    }, { real: 0, summary: 0, staticRule: 0, unsupported: 0 });
    const allVariants = produced.flatMap(({ v }) => metamorphic(v));
    const variantCount = allVariants.length;
    const materialCount = allVariants.filter((x) => x.materiality === 'MATERIAL').length;
    const redundantCount = allVariants.filter((x) => x.materiality === 'REDUNDANT').length;

    const header = [
      '# DEOKBUNI — V4A REASONING KERNEL QA PACK',
      '',
      '> 자동 생성 문서입니다. 손으로 고치지 마세요.',
      '> 생성기: `src/features/divination/__tests__/generateV4aKernelQaPack.test.ts`',
      '> 모든 케이스는 실제 운영 경로(`buildConsultationGrounding`)를 그대로 통과시켜 얻은 결과이고,',
      '> 변형 실험(D/E/F)은 그 경로가 만든 실제 전제를 지우거나 뒤집어 **다시 추론을 돌린** 결과입니다.',
      '',
      '## 이 팩이 증명하려는 것',
      '',
      '이전 세대는 "결론에 근거가 붙어 있다"까지만 보여 줄 수 있었습니다. 그것은 추론이 아니라 장식일 수 있습니다.',
      '여기서 묻는 것은 하나뿐입니다 — **그 전제를 빼면 결론이 달라지는가?**',
      '',
      '| 항목 | 값 |',
      '| --- | --- |',
      `| 시나리오 | ${produced.length} |`,
      `| 실행된 변형 실험 | ${variantCount} |`,
      `| MATERIAL (전제가 결론을 직접 움직임) | ${materialCount} / ${variantCount} |`,
      `| REDUNDANT (대체 근거 존재 — 그룹 제거 시 움직임) | ${redundantCount} / ${variantCount} |`,
      `| ⚠ INERT (장식적 전제) | ${inert.length} (0이어야 함) |`,
      `| REAL_SYNTHETIC_INFERENCE | ${totals.real} |`,
      `| MULTI_FACT_SUMMARY | ${totals.summary} |`,
      `| STATIC_RULE_OUTPUT | ${totals.staticRule} |`,
      `| UNSUPPORTED_INFERENCE | ${totals.unsupported} (0이어야 함) |`,
      '',
      '- **STATIC_RULE_OUTPUT이 많은 것은 정상이자 의도된 것입니다.** 자미두수·기문둔갑은 이번 스프린트에서',
      '  전제 그래프로 이관하지 않았으므로(§19), 그 두 학문의 출력은 전부 단일 전제 재진술로 분류됩니다.',
      '  이것을 "학문 간 종합"이라고 부르지 않는 것이 이 숫자를 의미 있게 만듭니다.',
      '- **UNSUPPORTED_INFERENCE = 0** 은 근거 없는 주장이 하나도 없다는 뜻입니다.',
      '',
      '---',
      '',
    ].join('\n');

    const doc = [header, ...produced.map(({ s, v }) => renderScenario(s, v)), chain].join('\n');
    const out = path.join(process.cwd(), 'docs', 'DIVINATION_V4A_REASONING_KERNEL_QA_PACK.md');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, doc, 'utf8');
    expect(fs.existsSync(out)).toBe(true);
  }, 120_000);
});
