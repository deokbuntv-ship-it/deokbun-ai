// Deterministic Decision Engine (Answer-Seeking V1.4 §3–§15). SERVER-OWNED: it decides — from the question
// pattern + the deterministic evidence inventory (grounding anchors) — WHAT the LLM is allowed and expected
// to conclude (intent, support level, assertiveness, comparison/ranking permission, allowed/forbidden claim
// types). The ONE LLM call then only VERBALIZES this plan; it never decides its own confidence, whether a
// comparison/ranking is valid, or whether to hedge. PURE + testable; no extra LLM call; reusable across
// future consultation modes (solo / compatibility) via `mode`.
//
// SAFETY: the plan can only make the answer clearer or SAFER — it never authorizes an ungrounded claim
// (the semantic validator remains the final boundary) and it never fabricates evidence. It reads only the
// deterministic grounding anchors (years/months), never the conversation summary.
import type { ConsultationGrounding } from '@/features/chat/prompts/grounding';
import { resolveQuestionMonths } from '@/features/chat/services/questionMonths';
import { resolveQuestionYears } from '@/features/chat/services/questionYears';
import type { PolarityTier } from '@/features/polarity/polarityKernel';

export type ConsultationMode = 'solo' | 'compatibility'; // extensibility seam (§38) — solo today
export type DecisionIntent =
  | 'DESCRIPTIVE'
  | 'SUITABILITY'
  | 'TIMING'
  | 'COMPARISON'
  | 'RANKING'
  | 'EVENT_PREDICTION'
  | 'ACTION';
export type SupportLevel = 'DIRECT' | 'PARTIAL' | 'ALTERNATIVE' | 'NONE';
export type Assertiveness = 'VERY_STRONG' | 'STRONG' | 'MODERATE' | 'LIMITED';
export type Granularity = 'NONE' | 'YEAR' | 'MONTH';

export type AnswerPlan = {
  mode: ConsultationMode;
  intents: DecisionIntent[];
  requestedGranularity: Granularity;
  resolvedGranularity: Granularity;
  supportLevel: SupportLevel;
  assertiveness: Assertiveness;
  // CAPABILITY flags (NOT results): whether the candidate SET is grounded enough to discuss comparatively
  // / rank-worthily. They NEVER authorize the LLM to pick a winner or a 1순위 — V1 has no server-decided
  // temporal winner/order (Sprint C §0.B/§9-§11), and the directive treats them as "discuss each candidate",
  // never "choose the better one".
  comparisonSupported: boolean;
  rankingSupported: boolean;
  forbidEventCertainty: boolean;
  // DECIDED_OUTPUT: a cautionary conclusion must carry ≥1 practical direction (Sprint A §10). Now ACTIVATED
  // deterministically from the server-owned polarity (Sprint C §7): CAUTION ⇒ true.
  requireMitigation: boolean;
  // DECIDED_OUTPUT: the server-owned overall polarity tier (Sprint C §5), from the shared kernel over the
  // current 세운 relations. Absent when the year flow is not grounded — never guessed by the LLM.
  polarity?: PolarityTier;
};

// Decision-affecting versions. Bumped when the SERVER's decision changes — distinct from the
// verbalization-only CONSULTATION_PROMPT_VERSION. Sprint C.1: polarity is now TARGET-SCOPED (was global),
// the month reference is fixed, and the Option-B/polarity output guards are active — all decision changes.
export const ANSWER_PLAN_VERSION = 'answer-plan@1.2.0';
export const DECISION_POLICY_VERSION = 'decision-policy@1.2.0';

const COMPARE_CUE = /나아|낫|더\s*좋|vs|대비|보다|중\s*(?:에서|엔)?\s*(?:뭐|어느|언제|누가)/;
const RANK_CUE = /가장|제일|최고|1순위|첫\s*번째|베스트|best|순서대로|언제\s*가장/;
const EVENT_CUE = /하게\s*(?:돼|되|될까|되나|됩니까)|이사하게|성공하게|합격하게|이뤄지|일어(?:나|날)/;
// GUARANTEE-seeking: "무조건 성공해?", "반드시 붙나요?", "100% 부자 될까요?" — a demand for a CERTAIN
// outcome that is NOT phrased as "~하게 돼", so EVENT_CUE misses it. It is still an event-certainty ask:
// the engine must forbid guaranteeing the event and answer with suitability instead (§6/§11/§28).
const GUARANTEE_CUE = /무조건|반드시|100\s*%|꼭\s|틀림없이|절대(?:\s|로)|확실히/;
const SUITABILITY_CUE = /해도\s*(?:돼|되나|괜찮|될까)|괜찮(?:을까|아)|좋을까|어때|어떨까|맞(?:아|을까|나)|추천/;
const ACTION_CUE = /할까|말까|해야\s*(?:돼|하나|할까)|어떻게\s*(?:해|하면)|계속\s*할|확장|바꿀까|움직/;

const groundedMonthsOf = (g: ConsultationGrounding): Set<number> => {
  const out = new Set<number>();
  if (g.status !== 'available') return out;
  for (const ev of [g.evidence.myungri, g.evidence.ziwei, g.evidence.qimen]) {
    for (const m of ev.timingAnchors?.months ?? []) if (Number.isInteger(m)) out.add(m);
  }
  return out;
};
const groundedYearsOf = (g: ConsultationGrounding): Set<number> => {
  const out = new Set<number>();
  if (g.status !== 'available') return out;
  for (const ev of [g.evidence.myungri, g.evidence.ziwei, g.evidence.qimen]) {
    for (const y of ev.timingAnchors?.years ?? []) if (Number.isInteger(y)) out.add(y);
  }
  return out;
};
const referenceYearOf = (g: ConsultationGrounding): number | null => {
  if (g.status !== 'available') return null;
  for (const ev of [g.evidence.myungri, g.evidence.ziwei, g.evidence.qimen]) {
    const r = ev.timingAnchors?.referenceYear;
    if (typeof r === 'number') return r;
  }
  return null;
};

// Server-derived reference month (Sprint C.1 §6) — the SAME value the grounding used to resolve
// 이번 달/다음 달, so the plan resolves relative months identically. Never the client clock.
const referenceMonthOf = (g: ConsultationGrounding): number | null =>
  g.status === 'available' ? g.referenceMonth ?? null : null;

// TARGET-SCOPED polarity (Sprint C.1 §2-§5): bind the conclusion tier to the question's ONE resolved
// target. Emit ONLY when exactly one target resolves at the resolved granularity AND that target is
// grounded (present in `targetPolarities`). Multi-candidate (comparison/ranking) → none. Non-temporal /
// natal (NONE granularity) → none. Never a global/overall guess, never a cross-candidate winner.
function selectTargetPolarity(
  g: ConsultationGrounding,
  granularity: Granularity,
  monthTargets: readonly { year: number; month: number }[],
  requestedYears: readonly number[],
): PolarityTier | undefined {
  if (g.status !== 'available' || !g.targetPolarities) return undefined;
  const find = (kind: 'YEAR' | 'MONTH', key: number) =>
    g.targetPolarities?.find((t) => t.granularity === kind && t.targetKey === key)?.polarity;
  if (granularity === 'MONTH') {
    return monthTargets.length === 1 ? find('MONTH', monthTargets[0].year * 100 + monthTargets[0].month) : undefined;
  }
  if (granularity === 'YEAR') {
    return requestedYears.length === 1 ? find('YEAR', requestedYears[0]) : undefined;
  }
  return undefined;
}

export function deriveAnswerPlan(
  question: string,
  grounding: ConsultationGrounding,
  mode: ConsultationMode = 'solo',
): AnswerPlan {
  const q = (question ?? '').trim();
  const refYear = referenceYearOf(grounding);
  const refMonth = referenceMonthOf(grounding); // Sprint C.1 §6 — resolves 이번 달/다음 달 (was null → bug)
  const monthPlan = resolveQuestionMonths(q, refYear, refMonth);
  const requestedYears = resolveQuestionYears(q, refYear);
  const gMonths = groundedMonthsOf(grounding);
  const gYears = groundedYearsOf(grounding);

  // Intent (multi). EVENT_PREDICTION is recognised but always down-converted to a suitability/timing answer
  // (§6/§11) — the decision NEED, not the literal event, drives the answer.
  const intents: DecisionIntent[] = [];
  // A comparison is RECOGNISED whenever the question compares options: two named months (the structure
  // signals it, e.g. "2월이 좋아 5월이 좋아?") OR a comparison cue — INCLUDING a NON-TEMPORAL choice
  // ("직장 vs 사업 뭐가 더 좋아?") that has no year/month candidates. Recognition ≠ permission: the user
  // asked us to choose, so we must engage the comparison — but `comparisonSupported` below still requires
  // ≥2 GROUNDED temporal candidates, so a domain choice is weighed honestly without fabricating a timing
  // "winner" (§12/§29).
  const isCompare = monthPlan.intent === 'COMPARE_MONTHS' || COMPARE_CUE.test(q);
  // A best/range ask over a candidate set is a ranking.
  const isRanking =
    monthPlan.intent === 'BEST_MONTH' ||
    monthPlan.intent === 'MONTH_RANGE' ||
    (RANK_CUE.test(q) && requestedYears.length >= 2);
  if (isCompare) intents.push('COMPARISON');
  if (isRanking) intents.push('RANKING');
  if (EVENT_CUE.test(q) || GUARANTEE_CUE.test(q)) intents.push('EVENT_PREDICTION');
  if (ACTION_CUE.test(q)) intents.push('ACTION');
  if (SUITABILITY_CUE.test(q)) intents.push('SUITABILITY');
  if (monthPlan.intent !== 'NONE' || requestedYears.length > 0) intents.push('TIMING');
  if (intents.length === 0) intents.push('DESCRIPTIVE');

  // Granularity: what was asked vs what the deterministic evidence actually grounds.
  const requestedGranularity: Granularity = monthPlan.intent !== 'NONE' ? 'MONTH' : requestedYears.length > 0 ? 'YEAR' : 'NONE';
  const requestedMonthKeys = monthPlan.targets.map((t) => t.year * 100 + t.month);
  const monthsGrounded = requestedMonthKeys.length > 0 && requestedMonthKeys.every((k) => gMonths.has(k));
  const anyMonthGrounded = requestedMonthKeys.some((k) => gMonths.has(k));
  const yearsGrounded = requestedYears.length > 0 && requestedYears.every((y) => gYears.has(y));

  let resolvedGranularity: Granularity = 'NONE';
  let supportLevel: SupportLevel = 'NONE';
  if (requestedGranularity === 'MONTH') {
    if (monthsGrounded) {
      resolvedGranularity = 'MONTH';
      supportLevel = 'DIRECT';
    } else if (anyMonthGrounded) {
      resolvedGranularity = 'MONTH';
      supportLevel = 'PARTIAL';
    } else if (gYears.size > 0) {
      resolvedGranularity = 'YEAR'; // fall back to the year's flow (best-supported alternative, §14)
      supportLevel = 'ALTERNATIVE';
    }
  } else if (requestedGranularity === 'YEAR') {
    if (yearsGrounded) {
      resolvedGranularity = 'YEAR';
      supportLevel = 'DIRECT';
    } else if (gYears.size > 0) {
      resolvedGranularity = 'YEAR';
      supportLevel = 'PARTIAL';
    }
  } else {
    // non-temporal: a natal/descriptive question is directly answerable when grounding exists.
    if (grounding.status === 'available') {
      resolvedGranularity = 'NONE';
      supportLevel = 'DIRECT';
    }
  }

  // Comparison / ranking permission — deterministic: the candidate set must actually be grounded (§12/§13).
  const groundedMonthCandidates = requestedMonthKeys.filter((k) => gMonths.has(k)).length;
  const groundedYearCandidates = requestedYears.filter((y) => gYears.has(y)).length;
  const groundedCandidates = Math.max(groundedMonthCandidates, groundedYearCandidates);
  const comparisonSupported = isCompare && groundedCandidates >= 2;
  const rankingSupported = isRanking && groundedCandidates >= 2;

  // Assertiveness follows the evidence, not the model's mood (§10/§29). A DIRECT answer is STRONG — it is
  // NEVER escalated to VERY_STRONG by comparison/ranking permission, because V1 authorizes NO winner/order
  // for the model to be "very strong" ABOUT (Sprint C §10/§11).
  let assertiveness: Assertiveness = 'LIMITED';
  if (supportLevel === 'DIRECT') assertiveness = 'STRONG';
  else if (supportLevel === 'PARTIAL') assertiveness = 'MODERATE';
  else if (supportLevel === 'ALTERNATIVE') assertiveness = 'LIMITED';
  else assertiveness = 'LIMITED';

  // TARGET-SCOPED polarity (Sprint C.1 §5) + mitigation activation (§7): the conclusion tier is bound to
  // the question's resolved target (this year / that year / this month / …). A CAUTION on the RESOLVED
  // target — never a wrong-timeframe or global guess — activates requireMitigation.
  const polarity = selectTargetPolarity(grounding, resolvedGranularity, monthPlan.targets, requestedYears);

  return {
    mode,
    intents,
    requestedGranularity,
    resolvedGranularity,
    supportLevel,
    assertiveness,
    comparisonSupported,
    rankingSupported,
    forbidEventCertainty: intents.includes('EVENT_PREDICTION'),
    requireMitigation: polarity === 'CAUTION',
    ...(polarity ? { polarity } : {}),
  };
}

const ASSERTIVENESS_LINE: Record<Assertiveness, string> = {
  // VERY_STRONG is no longer produced (Sprint C §10/§11 — comparison/ranking no longer escalates certainty).
  // Kept for the type; deliberately winner-free so no directive can authorize choosing a winner/1순위.
  VERY_STRONG: '근거가 충분합니다. 결론을 분명하게 말하십시오. 습관적으로 유보하지 마십시오.',
  STRONG: '근거가 뒷받침됩니다. 결론을 분명하게 말하십시오(예: "추천합니다", "좋은 시기입니다"). 습관적으로 유보하지 마십시오.',
  MODERATE: '근거가 부분적입니다. "상대적으로 유리한 편", "우선 후보" 정도로 방향은 주되 과도한 단정은 피하십시오.',
  LIMITED: '요청한 정확한 범위의 근거는 부족합니다. 확인 가능한 더 넓은 범위로 분명히 답하고 대안을 제시하되, 없는 근거를 지어내지 마십시오.',
};

// Categorical tone for the SERVER-owned polarity (Sprint C §5/§8). Guides the prose to lean the right way;
// it exposes NO harmony/friction tally and no score — the machine `conclusionPolarity` is server-injected.
const POLARITY_TONE: Record<PolarityTier, string> = {
  FAVORABLE: '전반적인 흐름은 좋은 편입니다',
  STEADY: '전반적인 흐름은 무난한 편입니다',
  DYNAMIC: '전반적인 흐름은 변화가 많은 편입니다',
  CAUTION: '전반적인 흐름은 조심이 필요한 편입니다',
};

// Compact directive appended to the prompt so the LLM verbalizes the SERVER's decision (§13/§17). No
// internal field names reach the user — this is a system instruction only.
export function renderAnswerPlanDirective(plan: AnswerPlan): string {
  const lines: string[] = ['[상담 지침 — 서버 판단(사용자에게 그대로 노출하지 말 것)]'];
  lines.push('· 사용자는 답을 찾으러 왔습니다. 결론을 맨 먼저, 근거 범위 안에서 가능한 한 분명하게 말하십시오.');
  lines.push(`· ${ASSERTIVENESS_LINE[plan.assertiveness]}`);
  if (plan.polarity) {
    lines.push(`· ${POLARITY_TONE[plan.polarity]}(서버가 판단한 전반 흐름). 이 방향과 어긋나게 서술하지 말되, 없는 근거로 과장하지도 마십시오.`);
  }
  if (plan.requireMitigation) {
    lines.push('· 주의가 필요한 흐름입니다. 두려움만 남기지 말고, 실질적으로 대처·관리할 방향을 최소 한 가지 "주의할 점"에 함께 제시하십시오.');
  }
  // 궁합(compatibility) mode: the SAME decision engine, but reframed around the PAIR. The plan
  // still owns support/assertiveness/timing; these lines add the relationship framing + the safety
  // discipline (§60 no fatalism / §61 no mind-reading) the pairwise answer must obey.
  if (plan.mode === 'compatibility') {
    lines.push('· 이 상담은 두 사람의 "궁합"입니다. 한 사람만 풀이하지 말고, 두 사람 사이에서 무엇이 잘 맞고(강점) 무엇이 부딪히는지(마찰), 그래서 이 관계를 어떻게 가져가면 좋은지를 관계 중심으로 답하십시오.');
    lines.push('· 근거가 분명하면 "전체적으로 잘 맞는 편입니다"처럼 분명하게, 섞여 있으면 강점과 마찰을 함께 짚고, 근거가 약하면 가장 가까운 유효한 관계 해석을 주십시오. "궁합은 여러 요소에 따라 다릅니다"로 끝내지 마십시오.');
    lines.push('· 관계의 결과(결혼 성공/이별/바람 등)를 사건으로 확정하지 마십시오. 대신 두 사람의 결이 맞는 정도(적합도)와 조율 포인트로 답하십시오. "헤어져야 한다 / 결혼하면 실패한다 / 이 사람은 나쁜 사람이다"처럼 단정하지 마십시오.');
    lines.push('· 상대의 속마음을 사실로 단정하지 마십시오(예: "상대는 당신을 사랑합니다"). 관계의 흐름·표현 방식·(질문에 시점이 있으면) 타이밍으로 설명하고, 알 수 없는 내면은 구분해 말하십시오.');
  }
  // COMPARISON — Option B (Sprint C §9-§11): grounded candidates may be DISCUSSED side by side, but the
  // model is NEVER authorized to choose a winner. V1 has no server-decided temporal winner.
  if (plan.comparisonSupported) lines.push('· 두 후보 모두 근거를 확인할 수 있습니다. 각 후보의 특징과 유리한/유의할 지점을 나란히 설명하되, 지금 규칙으로는 한쪽을 "더 낫다/승자"로 단정하지 마십시오. 한쪽을 골라 달라는 질문이라도 "지금은 한쪽을 1순위로 단정하지 않는다"고 정직하게 밝히고 각 근거를 설명하십시오.');
  else if (plan.intents.includes('COMPARISON')) lines.push('· 비교할 후보 근거가 충분하지 않습니다. 한쪽을 승자로 단정하지 말고, 근거가 있는 범위까지만 답하십시오.');
  // RANKING — Option B: candidate periods may be described, but no 1순위 / best / order is manufactured.
  if (plan.rankingSupported) lines.push('· 여러 후보(시기)의 근거를 확인할 수 있습니다. 각 후보의 흐름을 설명하되, "1순위/가장 좋은 때"를 하나로 단정하지 마십시오. 순위·점수·등급을 만들지 마십시오.');
  else if (plan.intents.includes('RANKING')) lines.push('· 순위를 매길 후보군 근거가 부족합니다. "가장 좋다"를 하나로 단정하지 마십시오.');
  if (plan.forbidEventCertainty) lines.push('· 사건의 발생 자체를 확정하지 마십시오(예: "반드시 이사합니다"). 대신 시기 적합도로 답하십시오(예: "이사 시기를 고른다면 …는 좋은 후보입니다").');
  if (plan.supportLevel === 'ALTERNATIVE') lines.push('· 요청한 세부 시점 대신, 근거가 있는 더 넓은 시기의 흐름으로 답하고 다음으로 좁힐 수 있음을 안내하십시오. 사용자에게 다시 물으라고 미루지 마십시오.');
  return lines.join('\n');
}
