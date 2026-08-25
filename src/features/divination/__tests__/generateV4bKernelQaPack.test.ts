// V4B §31 — TARGETED-FIX QA PACK GENERATOR.
//
// The V4A pack asked the engine what it had achieved and printed the answer. This one does not ask. For every
// CANDIDATE the runtime nominates, the harness removes and reverses that candidate's OWN premises — and, for
// cross conclusions, re-targets and re-scopes the propositions it was built from — re-runs the reasoning, and
// records whether THAT conclusion moved. The classification printed here is the harness's, never the engine's.
import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';

import type { BirthInfoDraft, ConsultationDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { buildConsultationGrounding, resolveQuestionIntent } from '@/features/chat/services/consultationGrounding';
import { parseDecisionMeta } from '@/features/chat/server/decisionMeta';
import {
  PRIMITIVE_RULE, screenAll, standingPropositions,
  type CrossDivinationVerdict, type DerivationContext, type ReasonedProposition,
} from '@/features/divination';
import {
  certify, classifyPremiseMateriality, crossMutations, crossRederive, myungriRederive,
  type Certification,
} from './support/certify';

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
  { group: '재물', label: 'D · 보유', question: '저축이 남을까요?', birth: D },
  { group: '사업·기회', label: 'A · 확장', question: '사업을 더 키워도 될까요?', birth: A },
  { group: '사업·기회', label: 'C · 확장', question: '사업을 더 키워도 될까요?', birth: C },
  { group: '자리·이동', label: 'A · 이직', question: '이직해도 될까요?', birth: A },
  { group: '자리·이동', label: 'D · 이사', question: '이사해도 될까요?', birth: D },
  { group: '관계', label: 'A · 결혼', question: '결혼해도 될까요?', birth: A },
  { group: '관계', label: 'B · 재회', question: '재회 가능성이 있을까요?', birth: B },
  { group: '시점', label: 'A · 지금 계약', question: '지금 계약해도 될까요?', birth: A },
  { group: '서술형(§12)', label: 'A · 성격', question: '제 타고난 성격이 어떤가요?', birth: A },
  { group: '원인형(§22)', label: 'C · 왜 부딪히나', question: '왜 자꾸 부딪힐까요?', birth: C },
];

async function verdictFor(birth: BirthInfoDraft, question: string): Promise<CrossDivinationVerdict | null> {
  const draft: ConsultationDraft = {
    subject: { id: 'self', displayName: String(birth.displayName ?? 'x'), relationship: null },
    birthInfo: birth,
  };
  const g = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: NOW }, question);
  return g.status === 'available' ? g.divinationVerdict ?? null : null;
}

const ctxOf = (v: CrossDivinationVerdict): DerivationContext & { asksTiming?: boolean } => ({
  subject: v.premises[0]?.subject ?? '본인',
  questionIntent: v.questionIntent,
  askedAxis: v.questionDomain,
  dataComplete: true,
  asksTiming: v.asksTiming,
});

/** Certify every candidate the runtime nominated, using the mutation set appropriate to where it came from. */
function certifyAll(v: CrossDivinationVerdict): { p: ReasonedProposition; c: Certification }[] {
  const ctx = ctxOf(v);
  return standingPropositions(v.propositions)
    .filter((p) => p.derivationRule !== PRIMITIVE_RULE)
    .map((p) => ({
      p,
      c: p.discipline === 'CROSS'
        ? certify(p, v.premises, crossRederive(v.propositions, ctx), crossMutations(p, v.propositions, v.premises, ctx))
        : certify(p, v.premises, myungriRederive(ctx)),
    }));
}

function renderScenario(s: Scenario, v: CrossDivinationVerdict): string {
  const ctx = ctxOf(v);
  const certified = certifyAll(v);
  const byId = new Map(v.premises.map((p) => [p.id, p]));
  const nameOf = (id: string) => {
    const p = byId.get(id);
    return p ? `${p.semanticRelation}·${p.target.label}` : id;
  };

  const blocks = certified.map(({ p, c }) => {
    const materiality = p.discipline === 'CROSS'
      ? []
      : [...p.supportingPremiseIds, ...p.opposingPremiseIds]
        .map((id) => byId.get(id))
        .filter((x): x is NonNullable<typeof x> => !!x)
        .map((x) => `    - \`${nameOf(x.id)}\` → **${classifyPremiseMateriality(p, x, v.premises, myungriRederive(ctx))}**`);
    return [
      `#### ${c.rule} — \`${p.target.key}\``,
      '',
      `- **AXIS** = ${p.questionAxis} · **SUBJECT** = ${p.subject} · **TARGET** = ${p.target.label} (\`${p.target.key}\`)`,
      `- **TEMPORAL_SCOPE** = ${p.temporalScope} · **TYPE** = ${p.conclusionType}/${p.direction}${p.restriction ? `(${p.restriction})` : ''}`,
      `- **DERIVED_PROPOSITION** = ${p.assertion}`,
      `- **INPUT_PREMISES** = ${p.supportingPremiseIds.map(nameOf).join(', ') || '(없음)'}`,
      `- **COUNTER_PREMISES** = ${p.opposingPremiseIds.map(nameOf).join(', ') || '(없음)'}`,
      `- **PREMISE_REMOVAL_TESTS** = ${c.removals.length
        ? c.removals.map((m) => `${m.label}→${m.changed ? '결론 변함' : '변화 없음'}`).join(' / ') : '(없음)'}`,
      `- **PREMISE_REVERSAL_TESTS** = ${c.reversals.length
        ? c.reversals.map((m) => `${m.label}→${m.changed ? '결론 변함' : '변화 없음'}`).join(' / ') : '(없음)'}`,
      ...(c.structural.length
        ? [`- **TARGET/TIME_MUTATION_TESTS** = ${c.structural.map((m) => `${m.label}→${m.changed ? '변함' : '없음'}`).join(' / ')}`]
        : []),
      `- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다`,
      `- **ACTUAL_DELTA** = ${c.because}`,
      ...(materiality.length ? ['- **PREMISE_MATERIALITY**:', ...materiality] : []),
      `- **INDEPENDENT_CLASSIFICATION** = **${c.klass}**`,
      '',
    ].join('\n');
  });

  return [
    `## [${s.group}] ${s.label}`,
    '',
    `**QUESTION** = ${s.question}`,
    `**INTENT** = ${resolveQuestionIntent(s.question)} · **ASKED_AXIS** = ${v.questionDomain} · **VERDICT** = ${v.direction}`,
    `**결론** = ${v.primaryConclusion}`,
    `**전제 수** = ${v.premises.length} · **명제 수** = ${v.propositions.length} · **후보(runtime)** = ${screenAll(v.propositions, v.premises).CANDIDATE_SYNTHESIS}`,
    '',
    ...(blocks.length ? blocks : ['_(파생 결론 없음 — 개별 근거만으로는 추론이 성립하지 않아 답하지 않음)_', '']),
    '---',
    '',
  ].join('\n');
}

describe('V4B targeted-fix QA pack (§31)', () => {
  it('generates the pack and holds the V4B invariants', async () => {
    const produced: { s: Scenario; v: CrossDivinationVerdict }[] = [];
    for (const s of SCENARIOS) {
      const v = await verdictFor(s.birth, s.question);
      if (v) produced.push({ s, v });
    }
    expect(produced.length).toBeGreaterThanOrEqual(12);

    const allCerts = produced.flatMap(({ s, v }) => certifyAll(v).map(({ p, c }) => ({ s, v, p, c })));
    const real = allCerts.filter(({ c }) => c.klass === 'REAL_SYNTHETIC_INFERENCE');

    // §25 — no claim may stand on nothing, and no conclusion may be produced that the reasoning cannot re-derive.
    expect(allCerts.filter(({ c }) => c.klass === 'UNSUPPORTED_INFERENCE').map(({ s, c }) => `${s.label}:${c.rule}`))
      .toEqual([]);

    // §30 — a MINIMUM, honestly counted. Real Myungri syntheses across at least two distinct rules, and real
    // Cross syntheses. Coverage below these numbers is reported, never manufactured.
    const myungriReal = real.filter(({ p }) => p.discipline === 'MYUNGRI');
    const crossReal = real.filter(({ p }) => p.discipline === 'CROSS');
    expect(myungriReal.length).toBeGreaterThanOrEqual(4);
    expect(new Set(myungriReal.map(({ c }) => c.rule)).size).toBeGreaterThanOrEqual(2);
    expect(crossReal.length).toBeGreaterThanOrEqual(3);

    // §19 — every cross candidate is attacked structurally, whatever it is finally classified as.
    for (const { p, c } of allCerts) {
      if (p.discipline === 'CROSS') expect(c.structural.length).toBeGreaterThan(0);
    }

    // §21 — exact temporal scopes survive into derived conclusions; nothing is flattened to a band.
    for (const { p } of allCerts) {
      expect(['NATAL', 'DAEWOON', 'SEWOON', 'WOLWOON', 'PRESENT_MOMENT', 'UNSCOPED']).toContain(p.temporalScope);
    }

    // §23 — the whole graph still round-trips through the REAL production parser.
    const sample = produced.find(({ s }) => s.label === 'A · 확장')!.v;
    const restored = parseDecisionMeta(JSON.parse(JSON.stringify({
      answerPlanVersion: 'a', decisionPolicyVersion: 'b', promptVersion: 'c',
      resolvedGranularity: 'NONE', resolvedTargets: [],
      resolvedTemporalContext: {
        anchorEpochSeconds: NOW, resolvedTargets: [], timezone: 'Asia/Seoul',
        qimenActive: false, referenceYear: 2026, referenceMonth: 3,
      },
      divinationVerdict: sample,
    })))?.divinationVerdict;
    expect(restored).toBeTruthy();

    const counts = allCerts.reduce((acc, { c }) => {
      acc[c.klass] = (acc[c.klass] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const runtimeCandidates = produced.reduce((n, { v }) => n + screenAll(v.propositions, v.premises).CANDIDATE_SYNTHESIS, 0);

    const header = [
      '# DEOKBUNI — V4B KERNEL TARGETED-FIX QA PACK',
      '',
      '> 자동 생성 문서입니다. 손으로 고치지 마세요.',
      '> 생성기: `src/features/divination/__tests__/generateV4bKernelQaPack.test.ts`',
      '> 모든 케이스는 실제 운영 경로(`buildConsultationGrounding`)를 그대로 통과시켜 얻은 결과입니다.',
      '',
      '## 이 팩이 V4A와 다른 점',
      '',
      'V4A 팩은 엔진에게 "무엇을 해냈나"를 묻고 그 대답을 옮겨 적었습니다. 독립 감사는 그렇게 집계된 117건 중',
      '실제 추론이 2건이었다고 판정했습니다. **엔진이 스스로에게 준 라벨을 세는 것은 측정이 아닙니다.**',
      '',
      '여기서 런타임이 할 수 있는 말은 "추론일 수 있다"(CANDIDATE)까지입니다. REAL 판정은 전적으로 검증',
      '하네스가 내립니다 — 그 결론의 **자기 전제를** 하나씩 지우고 뒤집고, 교차 결론이면 그 결론이 딛고 선',
      '명제의 **대상과 시점까지 바꿔** 다시 추론을 돌린 뒤, **그 결론이 실제로 움직였는지**만 봅니다.',
      '',
      '| 항목 | 값 |',
      '| --- | --- |',
      `| 시나리오 | ${produced.length} |`,
      `| 런타임이 지목한 후보(CANDIDATE) | ${runtimeCandidates} |`,
      `| 하네스가 인증한 REAL_SYNTHETIC_INFERENCE | ${counts.REAL_SYNTHETIC_INFERENCE ?? 0} |`,
      `| ├ 명리 | ${myungriReal.length} (규칙 ${new Set(myungriReal.map(({ c }) => c.rule)).size}종) |`,
      `| └ 교차 | ${crossReal.length} |`,
      `| MULTI_FACT_SUMMARY (과다결정·비인과) | ${counts.MULTI_FACT_SUMMARY ?? 0} |`,
      `| STATIC_RULE_OUTPUT | ${counts.STATIC_RULE_OUTPUT ?? 0} |`,
      `| ⚠ UNSUPPORTED_INFERENCE | ${counts.UNSUPPORTED_INFERENCE ?? 0} (0이어야 함) |`,
      '',
      '- **후보 수 > 인증 수는 정상입니다.** 그 차이가 곧 "스스로 붙인 라벨과 실제 인과성의 간격"이고,',
      '  V4A에서는 그 간격이 보이지 않았습니다.',
      '- **MULTI_FACT_SUMMARY**는 거짓말이라는 뜻이 아니라, 단일 전제를 지워도 결론이 그대로여서',
      '  그 전제의 인과적 필연성이 증명되지 않았다는 뜻입니다(여러 경로가 같은 결론에 이르는 과다결정 포함).',
      '- V4B에서 제거된 규칙(UNRECEIVED_OPPORTUNITY / PRESSURE_AGAINST_CAPACITY / STRUCTURAL_PROFILE) 때문에',
      '  결론 수는 V4A보다 줄었습니다. §29가 명시한 대로 **정밀도가 커버리지에 우선합니다.**',
      '',
      '---',
      '',
    ].join('\n');

    const doc = [header, ...produced.map(({ s, v }) => renderScenario(s, v))].join('\n');
    const out = path.join(process.cwd(), 'docs', 'DIVINATION_V4B_KERNEL_TARGETED_FIX_QA_PACK.md');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, doc, 'utf8');
    expect(fs.existsSync(out)).toBe(true);
  }, 180_000);
});
