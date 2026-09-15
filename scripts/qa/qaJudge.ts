// FINAL DIVINATION CONSULTATION QA — LLM-as-judge scoring against the brief's §6 rubric + §7 hard-fail
// list + §8 personalization gate + §9 new-insight gate + §10 cross-system quality + §22 advice-secondary
// check. A SEPARATE OpenAI call from generation (judgeCallLLM in openaiCallLLM.ts) — self-grading-bias is
// mitigated by (a) an explicit "harsh, skeptical grader" instruction and (b) a human (Claude) spot-check of
// the best/worst 5 per §33 rather than trusting these numbers blindly.
//
// V5 COMPLETE-PRODUCT CONTRACT. The V4 rescore measured the wrong artifact twice over:
//
//   1. USER_VISIBLE_ANSWER was a handful of raw schema fields. The server-materialized blocks the reader
//      actually receives — 전문근거, 왜 이렇게 보나요, and (V5) 행동/한마디 — were never shown to the judge, so
//      visible content was scored as missing when it had in fact been delivered.
//   2. The engine's internal grounded facts WERE shown, unlabelled, alongside the answer. Internal reference
//      must never earn visible-content quality points; it exists only so the judge can tell prose that
//      correctly reflects this chart from prose that would fit anyone.
//
// The two are now separate inputs with separate rules, and the answer comes from ONE definition shared with
// the product: `buildUserVisibleAnswer` in src/features/chat/presentation/userVisibleAnswer.ts.
import type { UserVisibleAnswer } from '@/features/chat/presentation/userVisibleAnswer';

import { judgeCallLLM } from './openaiCallLLM';

export type QaScoreBreakdown = {
  personalization: number; // /20
  conclusionClarity: number; // /15
  divinationDepth: number; // /15
  crossSystemSynthesis: number; // /15
  contradictionHandling: number; // /10
  timingQuality: number; // /10
  actionUsefulness: number; // /5
  readability: number; // /5
  professionalTrust: number; // /5
};

export type QaJudgeVerdict = {
  scoreBreakdown: QaScoreBreakdown;
  totalScore: number;
  hardFail: boolean;
  hardFailReasons: string[];
  personalizationFail: boolean;
  crossSynthesisPresent: boolean;
  newInsightPresent: boolean;
  paidUserValue: 'YES' | 'BORDERLINE' | 'NO';
  issues: string[];
  notes: string;
  judgeError?: string;
};

const JUDGE_SYSTEM_PROMPT = `당신은 한국어 명리/자미두수/기문둔갑 기반 AI 상담 제품의 매우 엄격한 QA 심사관입니다.
목적은 코드 품질이 아니라 "유료 사용자가 실제로 이 답변에 만족할 것인가"를 냉정하게 평가하는 것입니다.
관대하게 채점하지 마십시오. 답변이 이 사람의 실제 명식 데이터 없이도 쓸 수 있는 일반적인 내용이라면 personalization 점수를 낮게 주십시오.
질문에 직접 답하지 않으면 conclusionClarity를 낮게 주십시오. Cross Judge 결론(제공된 경우)과 최종 답변이 모순되면 hardFail=true 로 표시하십시오.

[채점 대상 — 매우 중요]
"사용자에게 실제로 보이는 답변" 블록만 채점하십시오. 그 안의 [전문근거 · …] 항목도 사용자에게 그대로 보이는 제품 내용이므로
채점 대상에 포함됩니다. [행동]·[한마디]·[왜 이렇게 보나요]·[앞으로의 흐름] 블록도 마찬가지로 보이는 내용입니다.
"엔진 내부 참고 자료"는 사용자에게 보이지 않습니다. 그것은 오직 (a) 답변이 이 사람의 실제 계산 결과와 맞는지,
(b) 답변이 사실을 지어냈는지 판단하는 용도로만 쓰십시오. 내부 참고 자료에 좋은 내용이 있다는 이유로 점수를 올리지 마십시오 —
사용자는 그것을 보지 못합니다.

다음 루브릭으로 채점하십시오 (총 100점):
- personalization (0-20): 아래 [개별화 판정 규칙]을 그대로 따르십시오.
- conclusionClarity (0-15): 사용자의 실제 질문에 명확히 답했는가.
- divinationDepth (0-15): 상징 나열이 아니라 실제 추론인가.
- crossSystemSynthesis (0-15): 아래 [교차 종합 채점 규칙]을 그대로 따르십시오.
- contradictionHandling (0-10): 상반된 근거가 있을 때 억지로 하나로 뭉개지 않고 지적으로 보존했는가.
- timingQuality (0-10): 장기 바탕과 현재 시점/기간이 구분되는가, 가짜 정밀 날짜를 지어내지 않았는가.
- actionUsefulness (0-5): 행동 제안이 구체적이고, 답변 안의 실제 근거에 묶여 있는가. 근거와 무관한 일반론("전문가와 상의하세요",
  "신중하게 결정하세요")은 낮은 점수. 무엇을 먼저 확인해야 하는지, 어떤 조건이면 진행/보류인지가 근거와 함께 제시되면 높은 점수.
- readability (0-5): 명리/자미/기문 훈련이 없는 일반 사용자가 이해할 수 있는가.
- professionalTrust (0-5): 별자리 운세 생성기가 아니라 전문 상담처럼 느껴지는가.

[교차 종합 채점 규칙 — crossSystemSynthesis, 15점]
"실제로 근거를 낸 체계"(materialContributors)의 수로 판단하십시오. 적용 여부가 아니라 실제 기여 여부입니다.
- 2개 이상이 실제로 근거를 냈을 때: 평소대로 채점하십시오. 진짜 결합 추론(서로 보강 / 상반 / 영역 분리 / 시간 분리 / 복합 진실)이
  있으면 높은 점수. 단순히 "명리는 X, 자미는 Y, 기문은 Z"로 나열만 했으면 0에 가깝게 주십시오.
- 정확히 1개만 실제로 근거를 냈고 나머지가 정당하게 미적용/미커버(NOT_COVERED / NOT_APPLICABLE / NO_DIRECT_JUDGMENT)일 때:
  **"체계가 하나뿐"이라는 사실 자체는 감점 사유가 아닙니다. 그것만을 이유로 0점을 주는 것은 잘못된 채점입니다.**
  이 경우 다음 네 가지를 반드시 각각 평가하고, 그 결과로 점수를 정하십시오:
    (a) 적용 범위를 정직하게 처리했는가 — 미적용 체계를 쓴 것처럼 말하지 않았는가
    (b) 없는 결합을 지어내지 않았는가
    (c) 쓸 수 있는 체계의 결론(입장)을 분명하게 설명했는가
    (d) 커버되지 않은 부분을 이 질문과 관련지어 밝혔는가
  네 가지를 모두 잘했다면 높은 점수를 줄 수 있습니다. 일부만 했다면 그만큼만 주십시오.
  0점은 위 네 가지 중 어느 것도 하지 못했을 때에만 줍니다.
  반대로 실제로는 한 체계뿐인데 여러 체계가 맞물린 것처럼 말했다면 그것은 조작이므로 0점이며 hardFail 후보입니다.
  이 경우 crossSystemSynthesis 점수의 근거를 반드시 issues 또는 notes에 (a)~(d) 기준으로 한 문장 이상 적으십시오.
- 점수를 부풀리지 마십시오. 정직함에 대한 점수이지, 정직하다는 이유만으로 만점을 주라는 뜻이 아닙니다.

hardFail=true 로 표시해야 하는 경우: 잘못된 사람의 명식 사실 사용, 제공된 명리/자미/기문 엔진 데이터와 모순, 결정론적 판정을 LLM이 뒤집음,
숨겨진 목표 대상 혼동, 시간 축 혼동, 근거 없는 확신, 조작된 정확한 날짜, 최종 답변이 Cross Judge 결론과 모순, 실제로 근거를 내지 않은
체계가 근거를 낸 것처럼 서술, 거의 모든 사람에게 해당될 수 있는 일반적 답변, 실제로 질문에 답하지 않음.

[개별화 판정 규칙 — personalization / personalizationFail]
판정 기준은 "보이는 답변 전체(완성 제품)"에 이 사람에게 고유한 근거가 실제로 실려 있는가입니다.

1. 위치를 따지지 마십시오. 구체적 근거가 [전문근거]·[행동]·[왜 이렇게 보나요]·본문 어디에 있든 똑같이 인정됩니다.
   같은 기술적 근거를 본문 산문에 한 번 더 옮겨 적지 않았다는 이유로 감점하지 마십시오 — 전문 용어는 [전문근거]에
   두고 본문은 쉬운 말로 푸는 것이 이 제품의 의도된 구조입니다.
2. 다만 기술적이라는 이유만으로 자동 인정되지는 않습니다. 그 근거는 반드시 (a) 구체적이고, (b) 이 사람의 명식/국에서
   나온 것이며, (c) 지금 질문한 사안과 관련이 있어야 합니다.
   - 예: 돈 관련 질문에 재물·전택 계열의 구체적 근거가 보이면 인정.
   - 예: 재결합 질문에 부처(배우자) 자리의 구체적 근거가 보이면 인정.
   - 반례: 명식에서 나온 근거이긴 하나 질문한 사안과 무관한 자리만 제시되어 있으면 인정하지 마십시오.
3. "엔진 내부 참고 자료"에만 있고 사용자에게 보이지 않는 근거는 인정하지 마십시오.

personalizationFail=true: 위 1~3을 적용했을 때, 보이는 답변 전체에 질문과 관련된 구체적·개인적 근거가 하나도 없어
"이 답변이 이 사람의 실제 명식 데이터를 보지 않고도 쓸 수 있었다"면 true. 하나라도 있으면 false.
crossSynthesisPresent: 실제로 근거를 낸 체계가 2개 이상일 때만 평가하고, 진짜 새로운 결합 추론이 있으면 true.
  1개뿐이면 false로 두되, 그것만으로 감점하지 마십시오(위 규칙 참조).
newInsightPresent: 단순 사실 재진술이 아닌 유용한 추론이 최소 하나 있으면 true.
paidUserValue: "유료 사용자가 이 시스템이 자신의 실제 상황을 이해하고 유용한 판단을 줬다고 느낄 것인가?" YES/BORDERLINE/NO.

반드시 아래 JSON 스키마와 정확히 일치하는 JSON 객체만 출력하십시오. 다른 텍스트는 출력하지 마십시오:
{
  "scoreBreakdown": {"personalization": number, "conclusionClarity": number, "divinationDepth": number, "crossSystemSynthesis": number, "contradictionHandling": number, "timingQuality": number, "actionUsefulness": number, "readability": number, "professionalTrust": number},
  "hardFail": boolean, "hardFailReasons": string[], "personalizationFail": boolean, "crossSynthesisPresent": boolean, "newInsightPresent": boolean,
  "paidUserValue": "YES"|"BORDERLINE"|"NO", "issues": string[], "notes": string
}`;

export type QaJudgeInput = {
  domain: string;
  question: string;
  profileLabel: string;
  /** V5 — systems that MATERIALLY contributed a finding, not merely systems that were applicable. */
  materialContributors: string[];
  /** Systems legitimately NOT_COVERED / NOT_APPLICABLE / NO_DIRECT_JUDGMENT for this question. */
  notCoveredSystems: string[];
  crossJudgeSummary: string; // primaryConclusion + a few agreement/contradiction lines, or '없음'
  /**
   * AUTHORITATIVE_REFERENCE — internal, NOT user-visible. The engine-computed facts for this chart, used only
   * to check whether the visible answer reflects them and invents nothing. Never scored as delivered content
   * (that conflation is exactly what the V4 contract got wrong).
   */
  authoritativeReference: string[];
  /** USER_VISIBLE_ANSWER — the complete product, in delivery order, from `buildUserVisibleAnswer`. */
  userVisibleAnswer: UserVisibleAnswer;
};

function userPrompt(input: QaJudgeInput): string {
  return `도메인: ${input.domain}
사용자 질문: ${input.question}
프로필: ${input.profileLabel}
실제로 근거를 낸 체계(materialContributors): ${input.materialContributors.join(', ') || '없음'}
이 질문을 커버하지 않는 체계(정당한 미적용): ${input.notCoveredSystems.join(', ') || '없음'}
Cross Judge 참고 (결정론적, 답변이 이것과 모순되면 hardFail): ${input.crossJudgeSummary}

=== 엔진 내부 참고 자료 (사용자에게 보이지 않음 — 사실 검증 전용, 점수 근거로 쓰지 말 것) ===
${input.authoritativeReference.length ? input.authoritativeReference.map((f) => `- ${f}`).join('\n') : '(근거 사실 없음)'}

=== 사용자에게 실제로 보이는 답변 (채점 대상) ===
${input.userVisibleAnswer.text || '(빈 답변)'}`;
}

export async function judgeQaCase(apiKey: string, input: QaJudgeInput): Promise<QaJudgeVerdict> {
  const errorVerdict = (msg: string): QaJudgeVerdict => ({
    scoreBreakdown: { personalization: 0, conclusionClarity: 0, divinationDepth: 0, crossSystemSynthesis: 0, contradictionHandling: 0, timingQuality: 0, actionUsefulness: 0, readability: 0, professionalTrust: 0 },
    totalScore: 0, hardFail: true, hardFailReasons: ['JUDGE_CALL_FAILED'], personalizationFail: true,
    crossSynthesisPresent: false, newInsightPresent: false, paidUserValue: 'NO', issues: [msg], notes: '', judgeError: msg,
  });
  const raw = await judgeCallLLM(apiKey, JUDGE_SYSTEM_PROMPT, userPrompt(input));
  if (!raw) return errorVerdict('judge returned empty text');
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return errorVerdict('judge returned unparseable JSON');
  }
  const p = parsed as Record<string, unknown>;
  const sb = (p.scoreBreakdown ?? {}) as Record<string, unknown>;
  const num = (v: unknown, max: number): number => {
    const n = typeof v === 'number' && Number.isFinite(v) ? v : 0;
    return Math.max(0, Math.min(max, Math.round(n)));
  };
  const scoreBreakdown: QaScoreBreakdown = {
    personalization: num(sb.personalization, 20),
    conclusionClarity: num(sb.conclusionClarity, 15),
    divinationDepth: num(sb.divinationDepth, 15),
    crossSystemSynthesis: num(sb.crossSystemSynthesis, 15),
    contradictionHandling: num(sb.contradictionHandling, 10),
    timingQuality: num(sb.timingQuality, 10),
    actionUsefulness: num(sb.actionUsefulness, 5),
    readability: num(sb.readability, 5),
    professionalTrust: num(sb.professionalTrust, 5),
  };
  const totalScore = Object.values(scoreBreakdown).reduce((a, b) => a + b, 0);
  const strArr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
  return {
    scoreBreakdown, totalScore,
    hardFail: p.hardFail === true, hardFailReasons: strArr(p.hardFailReasons),
    personalizationFail: p.personalizationFail === true,
    crossSynthesisPresent: p.crossSynthesisPresent === true,
    newInsightPresent: p.newInsightPresent === true,
    paidUserValue: p.paidUserValue === 'YES' || p.paidUserValue === 'NO' ? p.paidUserValue : 'BORDERLINE',
    issues: strArr(p.issues), notes: typeof p.notes === 'string' ? p.notes : '',
  };
}
