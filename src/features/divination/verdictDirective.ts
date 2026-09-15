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
  contributedNothing,
  type CrossDivinationVerdict,
  type Discipline,
  type DivinationJudgment,
  type Stance,
} from './contracts';
import { routeConsultationJudgeDomain } from './consultationJudgeCore';
import type { RequestedOutcome } from './decisionJudgment';

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
// FINAL_VERDICT_FIDELITY_MICRO_FIX — the recurring, cross-batch-confirmed defect (LOVE-06, TIMING-02):
// when the verdict genuinely declined to decide, the prose obeyed the headline instruction ("don't manufacture
// 좋다/나쁘다") but then quietly re-introduced a direction inside the PRACTICAL-ADVICE sentence instead
// ("기다리는 편이 안전합니다", "유지하는 쪽이 낫습니다") — a hidden verdict wearing the shape of advice. Root
// cause: `v.actionableInterpretation`'s own fallback for a declined verdict is ITSELF directionally phrased
// ("지금은 크게 방향을 틀기보다, 이미 하고 있는 일을 유지하시는 편이 낫습니다.") and this renderer handed it to
// the model unconditionally as authoritative "실용적 조언". Cross Judge's data is unchanged (still correct,
// still not touched here) — only how THIS renderer chooses to present that one field for the two genuinely
// undecided stances (INSUFFICIENT_DATA/INSUFFICIENT_EVIDENCE — not STRUCTURAL_ANSWER/NOT_APPLICABLE, which
// are a different "never a decision question" case where ordinary advice is fine).
export function isDeclinedToDecide(v: CrossDivinationVerdict): boolean {
  return v.direction === 'INSUFFICIENT_DATA' || v.direction === 'INSUFFICIENT_EVIDENCE';
}

// FINAL_VERDICT_AUTHORITY_CLAMP — the deterministic backstop the advisory instruction above could not
// fully replace. Proven stochastic across 3 prior QA batches: the prompt-only instruction reduced but did
// not eliminate the LLM occasionally smuggling a direction back into `coreSummary` — the ONE field whose
// own schema purpose already IS "결론... 그래서 어떤 방향이 유리한지" (the conclusion + the favorable lean,
// i.e. final decision authority — see STRUCTURED_OUTPUT_INSTRUCTION in structuredConsultation.ts). This
// server-authored sentence REPLACES that field outright for a declined verdict — never a rejection, never
// a regeneration, applied only to an already-valid ACCEPTED answer (see buildServerConsultation.ts's call
// site). Every other field (reasoning, evidence, counterevidence, cautions) is the LLM's own untouched prose.
export const DECLINED_TO_DECIDE_SUMMARY =
  '현재 확인된 근거만으로는 한쪽을 확정하기 어렵습니다. 큰 결정을 바로 확정하기보다, 되돌릴 수 있는 범위에서 준비·확인·검증하세요.';

// AUDIT-DRIVEN REMEDIATION V1 — root cause 2: the clamp above (see applyVerdictAuthorityClamp) used to
// replace EVERY declined verdict's coreSummary with the exact same DECLINED_TO_DECIDE_SUMMARY sentence
// (16/16 in the independent review), which protects direction but throws away question specificity too. This
// builds a QUESTION-AWARE declined headline instead — a short scope label plus one of 3 deterministic reason
// categories — while remaining structurally incapable of asserting a direction: the sentence is a fixed
// template with exactly 2 bounded variable slots (a scope phrase, a reason clause), never free text from the
// LLM, never a new fact, never a date.
export type DeclinedReasonCategory = 'DIRECT_EVIDENCE_INSUFFICIENT' | 'CROSS_SCOPE_CONFLICT' | 'PARTIAL_COVERAGE';

const SCOPE_LABEL: Record<string, string> = {
  BUSINESS: '사업', MONEY: '재물', CAREER: '직업', LOVE: '연애', REUNION: '재회', CHANGE: '변화', TIMING: '시기',
};

// §6 — a deterministic PRESENTATION mapping of existing statuses only (never a new metaphysical status).
// CROSS_SCOPE_CONFLICT: disciplines genuinely disagreed. PARTIAL_COVERAGE: at least one discipline could not
// speak to this question at all. DIRECT_EVIDENCE_INSUFFICIENT: the default — applicable disciplines simply
// lacked enough direct signal.
export function declinedReasonCategory(v: CrossDivinationVerdict): DeclinedReasonCategory {
  if (v.contradictionPoints.length > 0) return 'CROSS_SCOPE_CONFLICT';
  if (v.disciplineJudgments.some((j) => !j.applicable)) return 'PARTIAL_COVERAGE';
  return 'DIRECT_EVIDENCE_INSUFFICIENT';
}

const REASON_PHRASE: Record<DeclinedReasonCategory, string> = {
  DIRECT_EVIDENCE_INSUFFICIENT: '직접적인 근거가 아직 충분하지 않아',
  CROSS_SCOPE_CONFLICT: '체계 간에 서로 다른 신호가 겹쳐 있어',
  PARTIAL_COVERAGE: '일부 영역만 직접 판단할 수 있어',
};

// A short, quotable echo of the actual question when it's reasonably short (most consumer questions are);
// otherwise the domain scope label alone. Never longer than a bounded, sanitized snippet — this feeds a
// server-authoritative sentence, not a free-text field.
function scopePhrase(v: CrossDivinationVerdict): string {
  const q = (v.question ?? '').trim().replace(/\s+/g, ' ');
  if (q.length > 0 && q.length <= 40) return `"${q}"`;
  const domain = routeConsultationJudgeDomain(undefined, v.questionDomain);
  return domain ? `${SCOPE_LABEL[domain]} 관련 질문` : '이 질문';
}

// GROUNDED_NARRATIVE_V2 §14 — the declined sentence's CLOSING clause used to assume a decision question in
// every case ("큰 결정을 바로 확정하기보다…"), which is the wrong language for "왜 연애에서 상처받나?" or
// "어떤 스타일과 잘 맞나?". These variants keep the SAME non-directionality (none of them recommends a side)
// and only change the shape of the ask. Selected from the ALREADY-COMPUTED question intent — no new
// classifier, no LLM, no new fact.
export type DeclinedNarrativeIntent = 'DECISION' | 'TIMING' | 'EXPLANATION' | 'TRAIT' | 'COMPARISON';

const DECLINED_CLOSING: Record<DeclinedNarrativeIntent, string> = {
  DECISION: '큰 결정을 바로 확정하기보다, 되돌릴 수 있는 범위에서 준비·확인·검증하세요.',
  TIMING: '특정 시점을 지금 못박기보다, 근거가 더 모이는 지점을 기준으로 다시 보시는 편이 좋습니다.',
  EXPLANATION: '원인을 한 가지로 단정하기보다, 지금 보이는 부분과 아직 보이지 않는 부분을 나눠서 보시는 편이 좋습니다.',
  TRAIT: '한 가지 성향으로 규정하기보다, 지금 확인되는 부분만 그대로 보시는 편이 좋습니다.',
  COMPARISON: '한쪽을 지금 고르기보다, 각 후보의 근거를 나란히 두고 비교해 보시는 편이 좋습니다.',
};

export function buildDeclinedSummary(
  v: CrossDivinationVerdict,
  intent: DeclinedNarrativeIntent = 'DECISION',
): string {
  const scope = scopePhrase(v);
  const reason = REASON_PHRASE[declinedReasonCategory(v)];
  return `${scope}에 대해서는 ${reason} 현재 근거만으로 한쪽 방향을 확정하기 어렵습니다. ${DECLINED_CLOSING[intent]}`;
}

export function renderVerdictDirective(
  v: CrossDivinationVerdict,
  // DECISION JUDGMENT V1 — WHAT THE PERSON ACTUALLY ASKED FOR. Absent ⇒ the existing behaviour exactly.
  //
  // The direction instruction below states the verdict's stance as 하는 쪽 / 하지 않는 쪽, which is the right
  // reading contract for a decision and the WRONG one for a request that was never a decision. "조심할 게
  // 있을까요" answered with "결론은 범위를 줄이는 쪽입니다" answers a question that was not asked. The stance
  // is unchanged and still binding — this only tells the prose layer what shape of answer it is bound to.
  requestedOutcome?: RequestedOutcome,
  /**
   * DELIVERY V7 — the ONE customer meaning, when the verdict carried a synthesis.
   *
   * The direction instruction below is read off `v.direction`, which is the proposition GRAPH's projection.
   * Where the synthesis resolved a compound truth the graph could not express, that instruction says "방향을
   * 정할 만한 신호가 없습니다" while the answer's own headline states a direction — recreating exactly the
   * "directional headline + contradictory generic close" architecture V6 was built to remove. When a meaning
   * is supplied it governs, and the graph's own instruction is not emitted at all.
   */
  consumerMeaning?: {
    headlineMeaning: string; instruction: string; authorityDisclosure: string; actionBoundary: string;
    /** false ⇒ no proceed/hold language is authorised, whatever the graph's own direction says. */
    directional: boolean;
  } | null,
): string {
  const lines: string[] = ['[점사 판정 — 서버가 확정한 결론(그대로 노출하지 말 것)]'];
  // The no-direction warning must follow whichever authority is actually governing this answer, or a
  // resolved compound truth would be delivered under an instruction telling the model it has no direction.
  const declined = consumerMeaning ? !consumerMeaning.directional : isDeclinedToDecide(v);

  if (consumerMeaning) {
    lines.push(`· 결론: ${consumerMeaning.headlineMeaning}`);
    lines.push(`· ${consumerMeaning.instruction}`);
    lines.push(`· 참여한 학문에 대해 이렇게만 말하십시오 (더 늘리지 마십시오): ${consumerMeaning.authorityDisclosure}`);
    lines.push(`· 실용적 조언은 이 범위를 넘지 마십시오: ${consumerMeaning.actionBoundary}`);
  } else {
    lines.push(`· 결론: ${v.primaryConclusion}`);
    lines.push(`· ${DIRECTION_INSTRUCTION[v.direction]}`);
  }
  if (requestedOutcome === 'CONDUCT') {
    lines.push(
      '· 이 질문은 "할까 말까"가 아니라 "무엇을 조심하고 어떻게 해야 하는가"를 물었습니다. 위 방향은 판단의 근거로만 쓰고, 답은 아래 근거로 잡힌 제약·주의 지점을 구체적으로 짚는 형태로 쓰십시오. 근거에 없는 일반적인 조언을 지어내지 마십시오.',
    );
  } else if (requestedOutcome === 'PERIOD') {
    lines.push(
      '· 이 질문은 시기를 물었습니다. 답의 중심은 아래 시기 판단이어야 합니다. 시기를 좁힐 근거가 없으면 없다고 말하고, 없는 시기를 지어내지 마십시오.',
    );
  }
  if (declined) {
    lines.push(
      '· 방향을 정하지 않았다는 판정을, 뒤에 붙는 조언에서 슬쩍 한쪽으로 되돌리지 마십시오. "그래도 A가 낫습니다 / B가 안전합니다 / 기다리는 편이 좋습니다"처럼 들리는 문장은 그 자체로 다시 방향을 고른 것입니다 — 판단을 유보한 상태를 조언에서도 그대로 유지하십시오.',
    );
  }
  lines.push(`· 이 결론을 뒤집거나 "경우에 따라 다릅니다 / 반반입니다"로 흐리지 마십시오. 설명·정리·쉬운 표현은 자유입니다.`);
  lines.push(`· 중심 근거: ${v.dominantBasis}`);

  for (const c of v.contributions) {
    if (!c.applied) {
      // §7 — a coverage gap is NOT a calculation failure. Forbid the specific wording that implies engine
      // malfunction; only "적용되지 않음/직접 다루지 않음" framing is correct here.
      lines.push(
        `· ${DISCIPLINE_LABEL[c.discipline]}: 이번 질문에는 적용하지 않았습니다 — ${c.contribution} (썼다고 말하지 마십시오. "계산 실패"·"오류"·"계산이 안 됨"이라고 표현하지 말고, "이 축을 직접 다루는 판단 경로가 없습니다"처럼 적용 범위 밖이라는 뜻으로만 말하십시오.)`,
      );
      continue;
    }
    lines.push(
      `· ${DISCIPLINE_LABEL[c.discipline]}: ${c.contribution}${c.whyItDidNotDominate ? ` (다만 ${c.whyItDidNotDominate})` : ''}`,
    );
  }

  // V5 §2 — MULTI-SYSTEM SYNTHESIS, decided by MATERIAL contribution rather than applicability. Two or more
  // systems that actually said something is the only case where a combined reading exists; with one, the honest
  // answer is the usable stance plus the coverage limitation, and a manufactured "three systems agree" is the
  // fabrication the V4 rescore measured.
  const nulls = nullContributors(v);
  const materialCount = (v.disciplineJudgments as DivinationJudgment[])
    .filter((j) => j.applicable && !nulls.has(j.discipline)).length;
  lines.push(materialCount >= 2
    ? '· 실제로 근거를 낸 체계가 둘 이상입니다. 위의 일치·엇갈림·영역 분리·시간 분리를 합친 뜻을 먼저 말씀하십시오. "명리는 A, 자미는 B, 기문은 C"처럼 나열만 하면 종합이 아닙니다.'
    : '· 이번 질문에 실제로 근거를 낸 체계는 하나뿐입니다. 여러 체계가 같은 결론을 가리킨다거나 서로 맞물렸다고 말하지 마십시오. 쓸 수 있는 근거로 결론을 분명히 설명하고, 나머지는 이 축을 직접 보는 자리가 없어 넣지 않았다고만 말씀하십시오.');

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
  // The declined case gets its OWN risk-limiting instruction instead of the raw `actionableInterpretation`
  // string, which is itself directionally phrased for this exact stance (see isDeclinedToDecide above).
  if (declined) {
    lines.push(
      '· 현실적인 움직임(결론 뒤에 붙이는 보조): 한쪽을 권하지 말고, 어느 쪽으로 결론이 나든 위험을 줄이는 조언만 주십시오 — 예: 되돌릴 수 있는 범위에서만 준비·검증하기, 큰 비용이나 약속은 아직 확정하지 않기, 무엇이 더 확인되면 판단할 수 있는지 말하기. "A가 낫다/B가 안전하다/기다리는 게 좋다"처럼 들리는 문장은 그 자체로 결론이므로 쓰지 마십시오.',
    );
  } else {
    lines.push(`· 현실적인 움직임(결론 뒤에 붙이는 보조): ${v.actionableInterpretation}`);
  }
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

/**
 * Disciplines that were applied but reported only a coverage gap. Their lines stay in `evidenceReferences`
 * (the persisted record, the "왜 이렇게 보나요?" layer, and the grounded-fact corpus all still need them) —
 * what changes is that the composer is no longer told to CITE them, which is what produced answers that
 * attributed a share of the reasoning to a system holding nothing.
 */
function nullContributors(v: CrossDivinationVerdict): Set<Discipline | 'CROSS'> {
  return new Set((v.disciplineJudgments as DivinationJudgment[])
    .filter(contributedNothing)
    .map((j) => j.discipline as Discipline | 'CROSS'));
}

// FINAL_PROSE_DELIVERY_REPAIR_V1 §3-6 — `verdictEvidenceLines` above was computed for exactly this purpose
// (§22's "왜 이렇게 보나요?" layer) but was never actually appended to the prompt anywhere in the real
// pipeline — root-caused via the prose-loss QA analysis: the final answer routinely verbalized at a
// structural/generic level ("원국과 흐름이 충돌합니다") instead of naming the concrete 간지/궁/성/화/문 facts
// that were ALREADY sitting in this list. This renders that same list as a bounded instruction: cite 1–3 of
// THESE exact lines (never invent/recompute — the list IS the fact boundary), in plain language first.
export function renderEvidenceDirective(v: CrossDivinationVerdict): string {
  const nulls = nullContributors(v);
  const lines = verdictEvidenceLines({
    ...v, evidenceReferences: v.evidenceReferences.filter((r) => !nulls.has(r.discipline)),
  });
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
