// DIVINATION_ENGINE_V1 — FOUNDER QA PACK GENERATOR (§30).
//
// Runs the REAL engines through the REAL paid-consultation grounding and writes a human-readable artifact the
// Founder can judge by hand. It emits the deterministic half of each reading — per-discipline judgments, the
// cross verdict, and the EXACT binding directive the prose model receives.
//
// HONEST LIMIT (§34): the FINAL Korean answer is produced by the LLM inside the Edge, which needs the staging
// OpenAI key. It cannot be generated here, so the artifact marks it as pending a staging run rather than
// printing an invented "sample answer".
import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';

import type { BirthInfoDraft, ConsultationDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { buildConsultationGrounding } from '@/features/chat/services/consultationGrounding';
import { renderVerdictDirective, type CrossDivinationVerdict, type DivinationJudgment } from '@/features/divination';

const digestProvider: DigestProvider = {
  async sha256Utf8(input: string): Promise<string> {
    return createHash('sha256').update(input, 'utf8').digest('hex');
  },
};
const NOW = Math.floor(Date.UTC(2026, 5, 15, 3, 0, 0) / 1000); // fixed → reproducible artifact

const subject = (over: Record<string, unknown> = {}): BirthInfoDraft =>
  ({
    displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null,
    birthYear: '1990', birthMonth: '8', birthDay: '15',
    birthTimeAccuracy: 'exact', birthHour: '14', birthMinute: '0',
    approximateTimePeriod: null, birthPlace: '서울', ...over,
  }) as unknown as BirthInfoDraft;

const CASES: { label: string; question: string; birth: BirthInfoDraft }[] = [
  { label: '사업 확장', question: '사업을 더 키워도 될까요?', birth: subject() },
  { label: '이직', question: '지금 이직해도 될까요?', birth: subject() },
  { label: '돈이 들어오는가', question: '올해 돈을 벌 수 있을까요?', birth: subject() },
  { label: '돈이 남는가', question: '돈이 모일까요?', birth: subject() },
  { label: '계약 시점', question: '지금 계약해도 괜찮을까요?', birth: subject() },
  { label: '연애', question: '연애운은 어떤가요?', birth: subject() },
  { label: '결혼', question: '결혼해도 될까요?', birth: subject() },
  { label: '이사', question: '이사해도 될까요?', birth: subject() },
  { label: '성격(자연 질문)', question: '제 타고난 성격이 어떤가요?', birth: subject() },
  { label: '출생시간 미상', question: '사업 방향이 맞을까요?', birth: subject({ birthTimeAccuracy: 'unknown', birthHour: null, birthMinute: null }) },
  { label: '여성 · 관계 갈등', question: '왜 자꾸 부딪힐까요?', birth: subject({ gender: 'female', birthYear: '1988', birthMonth: '3', birthDay: '2', birthHour: '9' }) },
  { label: '여성 · 커리어', question: '직장에서 자리를 옮겨야 할까요?', birth: subject({ gender: 'female', birthYear: '1988', birthMonth: '3', birthDay: '2', birthHour: '9' }) },
];

function renderJudgment(j: DivinationJudgment | undefined): string {
  if (!j) return '- (없음)';
  if (!j.applicable) return `- 적용 안 함 — ${j.applicabilityReason ?? j.dominantConclusion}`;
  const ev = [...j.directEvidence, ...j.counterEvidence].map((e) => `    - ${e.fact} → ${e.meaning}`);
  return [
    `- stance: **${j.stance}** (확신 ${j.confidence} · 직접성 ${j.questionDirectness} · 자료 ${j.dataReliability})`,
    `- 결론: ${j.dominantConclusion}`,
    `- 중심 근거: ${j.dominantFactor}`,
    ...(ev.length ? ['- 근거:', ...ev] : []),
    ...(j.domainSubJudgments.length
      ? ['- 영역별:', ...j.domainSubJudgments.map((s) => `    - ${s.domain}: ${s.stance} — ${s.conclusion}`)]
      : []),
  ].join('\n');
}

function renderCase(label: string, question: string, v: CrossDivinationVerdict): string {
  const by = (d: DivinationJudgment['discipline']) => v.disciplineJudgments.find((j) => j.discipline === d);
  return [
    `## ${label}`,
    '',
    `**QUESTION** = ${question}`,
    '',
    '**MYUNGRI_JUDGMENT**',
    renderJudgment(by('MYUNGRI')),
    '',
    '**ZIWEI_JUDGMENT**',
    renderJudgment(by('ZIWEI')),
    '',
    '**QIMEN_JUDGMENT**',
    renderJudgment(by('QIMEN')),
    '',
    '**CROSS_VERDICT**',
    `- 방향: **${v.direction}** (확신 ${v.confidence} — ${v.confidenceReason})`,
    `- 결론: ${v.primaryConclusion}`,
    `- 중심 근거: ${v.dominantBasis}`,
    ...(v.agreementPoints.length ? [`- 일치: ${v.agreementPoints.join(' / ')}`] : []),
    ...(v.contradictionResolutions.length
      ? [
          '- 엇갈림과 정리:',
          ...v.contradictionResolutions.map(
            (r) => `    - [${r.kind}] ${r.conflict} → ${r.resolution} (우세: ${r.dominant}; ${r.whyOtherDidNotDominate})`,
          ),
        ]
      : ['- 엇갈림: 없음']),
    `- 시기: ${v.timingConclusion ?? '(근거 없음 — 시점 언급 금지)'}`,
    `- 학문별 기여: ${v.contributions.map((c) => `${c.discipline}=${c.applied ? c.stance : '미적용'}`).join(' · ')}`,
    `- 현실 조언(보조): ${v.actionableInterpretation}`,
    '',
    '**왜 이렇게 보나요? (사용자 노출 근거)**',
    ...v.evidenceReferences.flatMap((r) => r.lines.map((l) => `- [${r.discipline}] ${l}`)),
    '',
    '**LLM에 전달되는 구속 지시(발췌)**',
    '```',
    renderVerdictDirective(v).split('\n').slice(0, 8).join('\n'),
    '```',
    '',
    '**FINAL_KOREAN_ANSWER** = _(스테이징 실행 필요 — 최종 한국어 문장은 Edge의 LLM이 생성합니다. 이 파일은 그 LLM이 반드시 지켜야 할 판정까지를 보여줍니다.)_',
    '',
    '---',
    '',
  ].join('\n');
}

describe('Founder QA pack (§30)', () => {
  it('generates at least 10 representative paid readings from the REAL engines', async () => {
    const blocks: string[] = [];
    let produced = 0;
    for (const c of CASES) {
      const draft: ConsultationDraft = {
        subject: { id: 'self', displayName: c.birth.displayName ?? '테스트', relationship: null },
        birthInfo: c.birth,
      };
      const g = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: NOW }, c.question);
      if (g.status !== 'available' || !g.divinationVerdict) continue;
      blocks.push(renderCase(c.label, c.question, g.divinationVerdict));
      produced += 1;
    }

    expect(produced).toBeGreaterThanOrEqual(10);

    const doc = [
      '# DEOKBUNI — DIVINATION QA PACK (Founder manual review)',
      '',
      'Generated by `src/features/divination/__tests__/generateFounderQaPack.test.ts` from the REAL engines',
      `at a fixed evaluation instant (2026-06-15 12:00 KST) so the pack is reproducible.`,
      '',
      '판단 기준 (§31): ① 결론이 있는가 ② 이 사람의 실제 데이터가 느껴지는가 ③ 명리가 기여했는가 ④ 자미가 기여했는가',
      '⑤ 기문 적용 질문이면 기문이 기여했는가 ⑥ 충돌을 회피하지 않고 해결했는가 ⑦ 근거 있을 때만 시기를 말했는가',
      '⑧ 일반 조언으로 대체되지 않았는가 ⑨ 근거가 결론과 일치하는가 ⑩ 유료로 돈이 아깝지 않은가.',
      '',
      '> FINAL_KOREAN_ANSWER는 Edge의 LLM이 생성하므로 로컬에서 만들 수 없습니다. 이 문서는 그 LLM이 반드시',
      '> 지켜야 하는 **점사 판정**까지를 결정론적으로 보여 줍니다. 최종 문장 품질은 스테이징 배포 후 확인해야 합니다.',
      '',
      '---',
      '',
      ...blocks,
    ].join('\n');

    const out = path.resolve(__dirname, '../../../../docs/DIVINATION_QA_PACK.md');
    fs.writeFileSync(out, doc, 'utf8');
    expect(fs.existsSync(out)).toBe(true);
  });
});
