// DIVINATION_ENGINE_V1 — the LLM AUTHORITY BOUNDARY (§16/§17).
//
// The prose model receives the verdict as a BINDING instruction, not as suggestions. It may explain, order,
// simplify and add practical guidance; it may not reverse the direction, dilute it into "경우에 따라 다릅니다",
// invent divination facts or timing, or replace the judgment with self-help advice. The quality guard
// (qualityGuard.ts) then re-checks the produced text against this same verdict, so a model that ignores the
// boundary is caught rather than published.
import {
  AGAINST_STANCES,
  FOR_STANCES,
  type CrossDivinationVerdict,
  type Discipline,
  type Stance,
} from './contracts';

const DISCIPLINE_LABEL: Record<Discipline, string> = {
  MYUNGRI: '명리',
  ZIWEI: '자미두수',
  QIMEN: '기문둔갑',
};

const DIRECTION_INSTRUCTION: Record<Stance, string> = {
  STRONGLY_FOR: '결론은 "하는 쪽"입니다. 분명하게 그렇게 말하십시오.',
  FOR: '결론은 "하는 쪽"입니다. 분명하게 말하되 과장하지는 마십시오.',
  CONDITIONAL_FOR: '결론은 "조건을 갖추면 하는 쪽"입니다. 어떤 조건인지 함께 말하십시오.',
  FOR_BUT_LATER: '결론은 "방향은 맞지만 지금은 아니다"입니다. 방향과 시점을 반드시 나눠서 말하십시오.',
  AGAINST_FOR_NOW: '결론은 "지금 시점은 아니다"입니다. 영영 안 된다는 뜻이 아님을 함께 말하십시오.',
  CONDITIONAL_AGAINST: '결론은 "범위를 줄이는 쪽"입니다. 무엇을 줄여야 하는지 말하십시오.',
  AGAINST: '결론은 "하지 않는 쪽"입니다. 분명하게 말하십시오.',
  STRONGLY_AGAINST: '결론은 "하지 않는 쪽"입니다. 흐리지 말고 분명하게 말하십시오.',
  // V4A §12 — the question was answered, but it was never a decision. Forcing 하는 쪽/않는 쪽 onto
  // "제 성격이 어떤가요?" or "왜 자꾸 부딪히나요?" is a category error, not a strong answer.
  STRUCTURAL_ANSWER: '이 질문은 결정을 묻는 질문이 아닙니다. 하라/하지 마라로 답하지 말고, 구조와 원인을 그대로 설명하십시오.',
  INSUFFICIENT_DATA: '지금 근거로는 방향을 정하지 않습니다. 무엇이 있어야 볼 수 있는지 솔직하게 말하십시오.',
  // §12 — CONTRADICTION ≠ FORCED_DECISION. When the chart genuinely carries no directional signal, saying so
  // is the professional answer; do NOT manufacture a 좋다/나쁘다 to sound confident.
  INSUFFICIENT_EVIDENCE:
    '이 질문에 대해서는 방향을 정할 만한 신호가 없습니다. 억지로 좋다·나쁘다를 만들지 말고, 무엇이 보이고 무엇이 안 보이는지 솔직하게 말하십시오.',
  NOT_APPLICABLE: '이 질문은 점사로 답할 성질이 아닙니다. 솔직하게 말하십시오.',
};

/**
 * Render the verdict as the system-side reading contract. Never shown to the user verbatim.
 */
export function renderVerdictDirective(v: CrossDivinationVerdict): string {
  const lines: string[] = ['[점사 판정 — 서버가 확정한 결론(그대로 노출하지 말 것)]'];

  lines.push(`· 결론: ${v.primaryConclusion}`);
  lines.push(`· ${DIRECTION_INSTRUCTION[v.direction]}`);
  lines.push(`· 이 결론을 뒤집거나 "경우에 따라 다릅니다 / 반반입니다"로 흐리지 마십시오. 설명·정리·쉬운 표현은 자유입니다.`);
  lines.push(`· 중심 근거: ${v.dominantBasis}`);

  for (const c of v.contributions) {
    if (!c.applied) {
      lines.push(`· ${DISCIPLINE_LABEL[c.discipline]}: 이번 질문에는 적용하지 않았습니다 — ${c.contribution} (썼다고 말하지 마십시오.)`);
      continue;
    }
    lines.push(
      `· ${DISCIPLINE_LABEL[c.discipline]}: ${c.contribution}${c.whyItDidNotDominate ? ` (다만 ${c.whyItDidNotDominate})` : ''}`,
    );
  }

  // §13 COMPOUND TRUTH — the multi-axis result must survive into the prose, not be averaged into one ±.
  const otherAxes = v.axisVerdicts.filter((a) => a.domain !== v.questionDomain && a.stance !== 'INSUFFICIENT_EVIDENCE');
  if (otherAxes.length) {
    lines.push(
      `· 축별 결론(하나로 뭉뚱그리지 말 것): ${otherAxes.map((a) => `${a.domain}=${a.stance}(${a.conclusion})`).join(' / ')}`,
    );
  }
  if (v.agreementPoints.length) {
    lines.push(`· 일치하는 지점: ${v.agreementPoints.join(' / ')}`);
  }
  for (const r of v.contradictionResolutions) {
    lines.push(
      `· 엇갈리는 지점과 정리: ${r.conflict} → ${r.resolution} 어느 한쪽을 감추지 말고, 왜 ${DISCIPLINE_LABEL[r.dominant]} 쪽을 따랐는지 함께 설명하십시오.`,
    );
  }

  if (v.timingConclusion) {
    lines.push(`· 시기: ${v.timingConclusion} (근거 없는 특정 연·월을 새로 만들지 마십시오.)`);
  } else {
    lines.push('· 시기 근거는 없습니다. 구체적인 시점을 만들어 말하지 마십시오.');
  }

  if (v.riskFactors.length) {
    lines.push(`· 조심할 지점: ${v.riskFactors.map((e) => e.meaning).join(' / ')}`);
  }
  lines.push(`· 현실적인 움직임(결론 뒤에 붙이는 보조): ${v.actionableInterpretation}`);
  lines.push(
    '· 순서: ① 점사 결론 → ② 왜 그렇게 보는지(학문별 핵심) → ③ 세 학문을 합치면 → ④ 시기(근거 있을 때만) → ⑤ 조심할 점 → ⑥ 현실적으로 어떻게 움직일지. 조언이 결론을 대신하지 않게 하십시오.',
  );

  return lines.join('\n');
}

/** The source-attributed evidence lines for the "왜 이렇게 보나요?" layer (§22). */
export function verdictEvidenceLines(v: CrossDivinationVerdict): string[] {
  const label = (d: Discipline | 'CROSS') => (d === 'CROSS' ? '교차판정' : DISCIPLINE_LABEL[d]);
  return v.evidenceReferences.flatMap((ref) => ref.lines.map((line) => `[${label(ref.discipline)}] ${line}`));
}

// FINAL_PROSE_DELIVERY_REPAIR_V1 §3-6 — `verdictEvidenceLines` above was computed for exactly this purpose
// (§22's "왜 이렇게 보나요?" layer) but was never actually appended to the prompt anywhere in the real
// pipeline — root-caused via the prose-loss QA analysis: the final answer routinely verbalized at a
// structural/generic level ("원국과 흐름이 충돌합니다") instead of naming the concrete 간지/궁/성/화/문 facts
// that were ALREADY sitting in this list. This renders that same list as a bounded instruction: cite 1–3 of
// THESE exact lines (never invent/recompute — the list IS the fact boundary), in plain language first.
export function renderEvidenceDirective(v: CrossDivinationVerdict): string {
  const lines = verdictEvidenceLines(v);
  if (lines.length === 0) return '';
  return [
    '[실제 근거 문장 — 아래 목록에 있는 사실만 사용하고, 새로 만들지 마십시오]',
    ...lines.map((l) => `· ${l}`),
    '· 위 근거 중 이번 질문과 가장 관련 있는 1~3개를 답변에서 구체적으로 언급하십시오(전부 나열하지 마십시오). 먼저 쉬운 말로 결론과 이유를 설명한 뒤, 그 다음에 위 근거를 자연스럽게 붙여 구체적인 이유로 삼으십시오. "원국과 흐름이 충돌합니다"처럼 뭉뚱그리지 말고, 위 목록의 실제 표현(간지·궁·성·화·문 등)을 살려 설명하되, 용어를 나열만 하지 말고 일반 사용자가 이해할 수 있게 풀어서 설명하십시오.',
  ].join('\n');
}

/** Convenience for guards/tests: does this verdict assert a direction the prose must carry? */
export function verdictIsDirectional(v: CrossDivinationVerdict): boolean {
  return FOR_STANCES.includes(v.direction) || AGAINST_STANCES.includes(v.direction);
}
