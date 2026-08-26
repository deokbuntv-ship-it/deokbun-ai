// V4C §32 — KERNEL ONTOLOGY + EVALUATOR QA PACK GENERATOR.
//
// The V4B pack certified whatever list IT built (`standing.filter(rule !== PRIMITIVE)`) and compared TOTALS
// with the runtime's census. Equal totals cannot detect a conclusion present in one list and absent from the
// other, which is exactly the defect the audit named. This pack enumerates through the runtime's OWN
// `candidatePropositions()`, asserts SET equality between what the engine nominated and what was certified,
// and prints per candidate the full attack record: which mutation was run, what it was REQUIRED to change,
// and what actually changed.
//
// Nothing here is the engine's self-assessment. Every classification comes from `certify()`, which re-derives
// after mutating that candidate's own inputs.
import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';

import type { BirthInfoDraft, ConsultationDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { buildConsultationGrounding } from '@/features/chat/services/consultationGrounding';
import {
  candidatePropositions, screenAll,
  type CrossDivinationVerdict, type DerivationContext, type ReasonedProposition,
} from '@/features/divination';
import {
  candidatesOf, certify, conclusionKey, crossMutations, crossRederive, myungriRederive,
  type Certification, type MutationResult,
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
const E = chart({ displayName: 'E', birthTimeAccuracy: 'unknown', birthHour: null, birthMinute: null });

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
  // §9 — an input the engine could not pin down must not be able to own a compound's direction.
  { group: '입력 불완전(§9)', label: 'E · 시간 미상 확장', question: '사업을 더 키워도 될까요?', birth: E },
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

/** §15 — ONE enumerator. The pack certifies exactly what the runtime nominated, never a parallel list. */
function certifyAll(v: CrossDivinationVerdict): { p: ReasonedProposition; c: Certification }[] {
  const ctx = ctxOf(v);
  return candidatesOf(v.propositions, v.premises).map((p) => ({
    p,
    c: p.discipline === 'CROSS'
      ? certify(p, v.premises, crossRederive(v.propositions, ctx), crossMutations(p, v.propositions, v.premises, ctx))
      : certify(p, v.premises, myungriRederive(ctx)),
  }));
}

const mutationRow = (m: MutationResult): string =>
  `| \`${m.kind}\` | ${m.label} | ${m.required ? '**필수**' : '참고'} | ${m.expect} | ${m.observed} | ${m.changed ? '✅' : '—'} |`;

function renderCandidate(p: ReasonedProposition, c: Certification): string {
  const all = [...c.structural, ...c.removals, ...c.reversals];
  const byKind = (k: MutationResult['kind']) => all.filter((m) => m.kind === k);
  const section = (title: string, ms: MutationResult[]) =>
    (ms.length === 0 ? [`- ${title}: 해당 없음`] : [
      `- ${title}:`,
      '',
      '  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |',
      '  |---|---|---|---|---|---|',
      ...ms.map((m) => '  ' + mutationRow(m)),
      '',
    ]);

  return [
    `#### \`${conclusionKey(p)}\``,
    '',
    '| 항목 | 값 |',
    '|---|---|',
    `| CANDIDATE_ID | \`${p.id}\` |`,
    `| SUBJECT | ${p.subject} |`,
    `| INTENT | ${p.questionIntent} |`,
    `| AXIS | ${p.questionAxis} |`,
    `| TARGET | \`${p.target.key}\` (${p.target.kind}) — ${p.target.label} |`,
    `| CONCLUSION_TYPE | ${p.conclusionType}${p.restriction ? ` · ${p.restriction}` : ''} |`,
    `| TEMPORAL_SCOPE | ${p.temporalScope} |`,
    `| DERIVATION_RULE | \`${p.derivationRule}\` |`,
    `| SUPPORTING_PARENTS | ${p.supportingPremiseIds.length === 0 ? '—' : p.supportingPremiseIds.map((x) => `\`${x}\``).join(', ')} |`,
    `| OPPOSING_PARENTS | ${p.opposingPremiseIds.length === 0 ? '—' : p.opposingPremiseIds.map((x) => `\`${x}\``).join(', ')} |`,
    `| DERIVED_FROM | ${p.derivedFromPropositionIds.length === 0 ? '—' : p.derivedFromPropositionIds.map((x) => `\`${x}\``).join(', ')} |`,
    `| **CERTIFICATION_RESULT** | **${c.klass}** |`,
    `| 판정 근거 | ${c.because} |`,
    '',
    `> ${p.assertion}`,
    '',
    ...section('REMOVAL_MUTATIONS', [...byKind('REMOVE_PREMISE'), ...byKind('REMOVE_PARENT')]),
    ...section('DIRECTION_MUTATIONS', [...byKind('REVERSE_PREMISE'), ...byKind('REDIRECT_PARENT')]),
    ...section('TARGET_MUTATIONS', byKind('RETARGET_PARENT')),
    ...section('TIME_MUTATIONS', byKind('RESCOPE_PARENT')),
    '',
  ].join('\n');
}

describe('V4C kernel ontology + evaluator QA pack (§32)', () => {
  it('generates the pack, and the certified population IS the runtime population', async () => {
    const produced: { s: Scenario; v: CrossDivinationVerdict }[] = [];
    for (const s of SCENARIOS) {
      const v = await verdictFor(s.birth, s.question);
      if (v) produced.push({ s, v });
    }
    expect(produced.length).toBeGreaterThanOrEqual(12);

    // ── §15 — SET equality between the runtime's nomination and the harness's certification ──────
    for (const { v } of produced) {
      const runtime = candidatePropositions(v.propositions, v.premises).map((p) => p.id).sort();
      const certified = certifyAll(v).map(({ p }) => p.id).sort();
      expect(certified).toEqual(runtime);
    }

    const allCerts = produced.flatMap(({ s, v }) => certifyAll(v).map(({ p, c }) => ({ s, v, p, c })));
    const count = (k: Certification['klass']) => allCerts.filter(({ c }) => c.klass === k).length;

    // §25 — nothing may stand on nothing, and nothing the reasoning cannot re-derive may be reported.
    expect(allCerts.filter(({ c }) => c.klass === 'UNSUPPORTED_INFERENCE').map(({ s, c }) => `${s.label}:${c.rule}`))
      .toEqual([]);

    // §19 — no no-op mutation is ever counted as evidence for or against a candidate.
    for (const { c } of allCerts) {
      expect([...c.structural, ...c.removals, ...c.reversals].some((m) => m.noop)).toBe(false);
    }

    // §17 — every REQUIRED mutation on a certified candidate actually held.
    for (const { c } of allCerts) {
      if (c.klass !== 'REAL_SYNTHETIC_INFERENCE') continue;
      for (const m of [...c.structural, ...c.removals, ...c.reversals]) {
        if (m.required) expect(m.changed).toBe(true);
      }
    }

    // §31 — a MINIMUM, honestly counted. Precision > coverage: this number is allowed to fall relative to
    // V4B, and it is not tuned toward any target.
    expect(count('REAL_SYNTHETIC_INFERENCE')).toBeGreaterThan(0);

    const censusTotals = produced.reduce((acc, { v }) => {
      const c = screenAll(v.propositions, v.premises);
      for (const k of Object.keys(c) as (keyof typeof c)[]) acc[k] = (acc[k] ?? 0) + c[k];
      return acc;
    }, {} as Record<string, number>);

    const groups = [...new Set(SCENARIOS.map((s) => s.group))];
    const doc = [
      '# DIVINATION V4C — KERNEL ONTOLOGY + EVALUATOR QA PACK',
      '',
      '> 자동 생성 문서입니다. `npx jest generateV4cKernelQaPack` 으로 재생성됩니다.',
      '> 여기의 분류는 **엔진이 스스로 붙인 라벨이 아닙니다.** 후보마다 그 후보의 입력을 지우고·뒤집고·',
      '> 대상을 바꾸고·시기를 옮긴 뒤 다시 유도해서, **그 결론이 실제로 움직였는지**를 관찰한 결과입니다.',
      '',
      '## 이 팩이 V4B 팩과 다른 점',
      '',
      '| | V4B | V4C |',
      '|---|---|---|',
      '| 후보 모집단 | 팩이 자체적으로 만든 목록 | **런타임의 `candidatePropositions()` 하나** (집합 동일성 검증) |',
      '| 결론 동일성 | rule·axis·target | rule·subject·axis·target·conclusionType·**temporalScope** |',
      '| 인증 기준 | "아무 변형이나 뭔가 바꿨는가" | **변형마다 기대 변화를 선언**하고, 필수 변형이 모두 성립해야 함 |',
      '| 교차 결론 공격 | 부모 삭제·대상·시기 | + **부모 방향 반전**(§18) |',
      '| 무효 변형 | 그대로 집계 | **무효 변형은 제외**(§19) |',
      '',
      '## 총계',
      '',
      '| 항목 | 값 |',
      '|---|---|',
      `| 시나리오 | ${produced.length} / ${SCENARIOS.length} |`,
      `| RUNTIME_CANDIDATES (런타임이 지명) | ${allCerts.length} |`,
      `| CERTIFIED_RUNTIME_CANDIDATES (인증됨) | ${count('REAL_SYNTHETIC_INFERENCE')} |`,
      `| REAL_SYNTHETIC_INFERENCE | ${count('REAL_SYNTHETIC_INFERENCE')} |`,
      `| MULTI_FACT_SUMMARY | ${count('MULTI_FACT_SUMMARY')} |`,
      `| UNSUPPORTED_INFERENCE | ${count('UNSUPPORTED_INFERENCE')} |`,
      `| UNCLASSIFIED_RUNTIME_CANDIDATES | 0 (집합 동일성으로 보장) |`,
      '',
      '### 런타임 스크리닝 총계 (참고 — 인증이 아님)',
      '',
      '| 항목 | 값 |',
      '|---|---|',
      ...Object.entries(censusTotals).map(([k, n]) => `| ${k} | ${n} |`),
      '',
      '### 공격 총계',
      '',
      '| 공격 | 실행 | 결론을 바꿈 |',
      '|---|---|---|',
      ...(['REMOVE_PREMISE', 'REVERSE_PREMISE', 'REMOVE_PARENT', 'RETARGET_PARENT', 'RESCOPE_PARENT', 'REDIRECT_PARENT'] as const)
        .map((kind) => {
          const ms = allCerts.flatMap(({ c }) => [...c.structural, ...c.removals, ...c.reversals])
            .filter((m) => m.kind === kind);
          return `| \`${kind}\` | ${ms.length} | ${ms.filter((m) => m.changed).length} |`;
        }),
      '',
      '## 시나리오별 후보',
      '',
      ...groups.flatMap((group) => [
        `### ${group}`,
        '',
        ...produced.filter(({ s }) => s.group === group).flatMap(({ s, v }) => [
          `**${s.label}** — "${s.question}" → \`${v.direction}\``,
          '',
          `> ${v.primaryConclusion}`,
          '',
          ...(certifyAll(v).length === 0
            ? ['_런타임이 지명한 합성 후보 없음 — 이 질문에는 단일 근거만 있었습니다._', '']
            : certifyAll(v).map(({ p, c }) => renderCandidate(p, c))),
        ]),
      ]),
      '## 판정 불가도 결과입니다 (§31)',
      '',
      '정밀도가 커버리지보다 앞섭니다. 근거가 한쪽으로 모이지 않으면 이 커널은 승자를 만들지 않고',
      '`UNRESOLVED` / `STANDOFF` 로 남깁니다. 아래는 이번 실행에서 방향을 정하지 않은 시나리오입니다.',
      '',
      ...produced
        .filter(({ v }) => v.direction === 'INSUFFICIENT_EVIDENCE' || v.direction === 'STRUCTURAL_ANSWER')
        .map(({ s, v }) => `- **${s.label}** — "${s.question}" → \`${v.direction}\`: ${v.primaryConclusion}`),
      '',
    ].join('\n');

    fs.writeFileSync(
      path.join(process.cwd(), 'docs/DIVINATION_V4C_KERNEL_ONTOLOGY_EVALUATOR_QA_PACK.md'),
      doc,
      'utf8',
    );
  }, 120_000);
});
