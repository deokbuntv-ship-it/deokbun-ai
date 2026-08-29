// FINAL DIVINATION CONSULTATION QA V1 — LLM-as-judge scoring against the brief's §6 rubric + §7 hard-fail
// list + §8 personalization gate + §9 new-insight gate + §10 cross-system quality + §22 advice-secondary
// check. A SEPARATE OpenAI call from generation (judgeCallLLM in openaiCallLLM.ts) — self-grading-bias is
// mitigated by (a) an explicit "harsh, skeptical grader" instruction and (b) a human (Claude) spot-check of
// the best/worst 5 per §33 rather than trusting these numbers blindly.
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

다음 루브릭으로 채점하십시오 (총 100점):
- personalization (0-20): "실제 근거 사실"(제공됨, 아래 참고)에 나온 구체적 사실(간지·궁·문·성 등)과 답변 내용을
  비교해서 판단하십시오. 답변이 그 사실들과 실제로 연결되는 결론을 내렸다면 personalization 높은 점수를 주십시오.
  반대로 실제 근거 사실이 있는데도 답변이 그것을 전혀 반영하지 않고 두루뭉술하면 낮은 점수. 실제 근거 사실 목록 자체에
  없는 세부(정확한 간지 나열 등)를 답변이 다시 언급하지 않았다는 이유만으로 감점하지 마십시오 — 소비자용 답변은 원래
  전문용어를 풀어서 설명해야 하는 제품입니다.
- conclusionClarity (0-15): 사용자의 실제 질문에 명확히 답했는가.
- divinationDepth (0-15): 상징 나열이 아니라 실제 추론인가.
- crossSystemSynthesis (0-15): 2개 이상 체계가 적용될 때 새로운 결합 추론이 있는가 (단순 "명리는 X, 자미는 Y, 기문은 Z" 나열은 0점).
- contradictionHandling (0-10): 상반된 근거가 있을 때 억지로 하나로 뭉개지 않고 지적으로 보존했는가.
- timingQuality (0-10): 장기 바탕과 현재 시점/기간이 구분되는가, 가짜 정밀 날짜를 지어내지 않았는가.
- actionUsefulness (0-5): 행동 제안이 구체적이고 근거에 기반하는가.
- readability (0-5): 명리/자미/기문 훈련이 없는 일반 사용자가 이해할 수 있는가.
- professionalTrust (0-5): 별자리 운세 생성기가 아니라 전문 상담처럼 느껴지는가.

hardFail=true 로 표시해야 하는 경우: 잘못된 사람의 명식 사실 사용, 제공된 명리/자미/기문 엔진 데이터와 모순, 결정론적 판정을 LLM이 뒤집음,
숨겨진 목표 대상 혼동, 시간 축 혼동, 근거 없는 확신, 조작된 정확한 날짜, 최종 답변이 Cross Judge 결론과 모순, 거의 모든 사람에게
해당될 수 있는 일반적 답변, 실제로 질문에 답하지 않음.

personalizationFail=true: "이 답변이 이 사람의 실제 명식 데이터를 보지 않고도 쓸 수 있었는가?"에 YES라면 true.
crossSynthesisPresent: 2개 이상 체계가 적용 가능할 때만 평가하고, 진짜 새로운 결합 추론이 있으면 true.
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
  systemsApplicable: string[]; // e.g. ['MYUNGRI','ZIWEI','QIMEN']
  crossJudgeSummary: string; // primaryConclusion + a few agreement/contradiction lines, or '없음'
  // The ACTUAL engine-computed facts available to the model for this chart (a sample of
  // evidenceReferences lines per discipline) — WITHOUT this the judge has no way to tell "generic prose"
  // from "prose that correctly reflects real chart-specific facts", and defaults to penalizing personalization
  // for not re-stating detail it was never shown either (found + fixed after the first QA run inflated
  // personalizationFailRate to 89% this way).
  groundedFacts: string[];
  answer: {
    coreSummary: string | null;
    disposition: string | null;
    coreInterpretation: string | null;
    strengths: string[];
    cautions: string[];
    domainInterpretation: { title: string; body: string }[];
    futureFlow: string | null;
  };
};

function userPrompt(input: QaJudgeInput): string {
  const a = input.answer;
  const answerText = [
    a.coreSummary, a.disposition ? `[기본 성향] ${a.disposition}` : null, a.coreInterpretation,
    a.strengths.length ? `[강점] ${a.strengths.join(' / ')}` : null,
    a.cautions.length ? `[주의] ${a.cautions.join(' / ')}` : null,
    ...a.domainInterpretation.map((d) => `[${d.title}] ${d.body}`),
    a.futureFlow ? `[앞으로 흐름] ${a.futureFlow}` : null,
  ].filter(Boolean).join('\n');
  return `도메인: ${input.domain}
사용자 질문: ${input.question}
프로필: ${input.profileLabel}
적용 가능한 체계: ${input.systemsApplicable.join(', ') || '없음'}
Cross Judge 참고 (결정론적, 답변이 이것과 모순되면 hardFail): ${input.crossJudgeSummary}

=== 이 사람에 대해 엔진이 실제로 계산한 근거 사실 (일부, personalization 판단용) ===
${input.groundedFacts.length ? input.groundedFacts.map((f) => `- ${f}`).join('\n') : '(근거 사실 없음)'}

=== 실제 답변 ===
${answerText || '(빈 답변)'}`;
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
