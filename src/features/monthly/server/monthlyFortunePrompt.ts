// The MONTHLY prompt (§29-§33). It verbalizes the SERVER's deterministic monthly plan into a compact, specific,
// consumer-safe digest — it NEVER decides the tier / mode / domain status itself (those are server-owned). All
// calculation language (간지/십신/합충…) is banned from the output; the model receives only the plan's readable
// signals and must answer the month DIRECTLY. Crucially, it must NOT invent exact dates/weeks (§24) — monthly
// evidence grounds a MONTH, not a day; a user who wants a specific date is pointed to 상담.
import type { LLMMessage } from '@/features/chat/types/chatArchitecture';
import { MONTHLY_DOMAIN_LABEL } from '@/features/monthly/types';
import { formatMonthLabel } from '@/features/monthly/engine/monthDate';
import type { MonthlyPlan } from '@/features/monthly/engine/monthlyPlan';

export const MONTHLY_PROMPT_VERSION = 'monthly-prompt@1.4.0';

export function buildMonthlyFortunePrompt(plan: MonthlyPlan): LLMMessage[] {
  const label = formatMonthLabel({ year: plan.year, month: plan.month });
  const emphasized = MONTHLY_DOMAIN_LABEL[plan.strongestDomain];
  const cautionLabel = plan.cautionDomain ? MONTHLY_DOMAIN_LABEL[plan.cautionDomain] : null;

  // P1 domain breadth (§2.1-§2.7): diversify opportunities across the SUPPORTED domains (server-owned
  // coverage), or — when only one domain is genuinely supported — stay focused rather than fabricate breadth.
  const secondaryLabels = plan.secondaryDomains.map((d) => MONTHLY_DOMAIN_LABEL[d]);
  const coverageDirective = secondaryLabels.length > 0
    ? `opportunities는 서로 다른 영역을 다루십시오 — 우선 "${emphasized}", 그다음 ${secondaryLabels.map((l) => `"${l}"`).join(', ')} 순으로 넓히십시오. 같은 영역(예: 관계=연애·대화·소통)을 다른 말로 반복하지 말고 지원되는 다른 영역으로 넓히십시오.`
    : `이번 달은 "${emphasized}" 영역이 중심입니다. 억지로 다른 영역을 만들지 말고, "${emphasized}" 안에서 서로 다른 측면(실행·조율·점검 등)을 다루십시오.`;

  // When the civil month spans a 節 boundary AND the two regimes differ, tell the model to describe the shift
  // in "초반 / 중반 이후" terms (§5). The exact 節 date is server-owned (shown by the UI) — the model must NOT
  // claim a specific day is "가장 좋다" (§8); it only narrates that the flow changes.
  const transitionDirective = plan.hasMeaningfulTransition && plan.transition
    ? `이번 달은 초반과 중반 이후의 흐름이 다릅니다. 초반은 "${plan.transition.early.tier}", 중반 이후는 "${plan.transition.later.tier}" 흐름입니다. verdict와 overallSummary에서 "초반에는 ~, 중반 이후에는 ~"처럼 이 변화를 자연스럽게 설명하십시오. 단, 특정 날짜가 "가장 좋다"고 단정하지 말고 "초반 / 중반 이후" 표현을 쓰십시오.`
    : null;

  const system = [
    `당신은 덕분이의 "이번 달 운세"입니다. 한 사람의 사주를 ${label}에 대입해 나온 "이번 달의 판단"을 씁니다. 일반적인 생활 조언이 아니라, 이번 달이 어떤 달이고 무엇을 밀고 무엇을 조심하면 좋은지 분명히 답해야 합니다.`,
    '반드시 일반 사용자의 말로만 쓰십시오. 간지·천간·지지·일간·십신·합충형파해·오행, 엔진/근거/검증 같은 내부 용어를 절대 노출하지 마십시오.',
    '서버가 이미 판단한 이번 달의 결(반드시 그대로 따를 것 — 당신은 이 판단을 "말로 풀어내는" 역할입니다):',
    `- 이번 달 전반 기운: "${plan.overallTier}"`,
    `- 이번 달 권하는 방식: "${plan.primaryModeLabel}"`,
    `- 기운이 실리는 영역: "${emphasized}"`,
    cautionLabel ? `- 속도를 조절할 영역: "${cautionLabel}"` : '- 이번 달은 크게 부딪히는 기운은 없습니다.',
    ...(transitionDirective ? [transitionDirective] : []),
    ...(plan.backgroundFlow && (plan.backgroundFlow.daewoon || plan.backgroundFlow.year)
      ? [
          'PRIMARY(중심) = 위 "이번 달의 결". SECONDARY(배경) = 아래 큰 흐름. 배경은 이번 달을 연간·대운 안에 "자리매김"하는 역할이며, 이번 달의 결론(전반 기운)을 덮어쓰지 않습니다:',
          plan.backgroundFlow.daewoon ? `- 지금의 큰 흐름(대운): "${plan.backgroundFlow.daewoon}"` : '',
          plan.backgroundFlow.year ? `- 올해 전반 흐름(세운): "${plan.backgroundFlow.year}"` : '',
          plan.backgroundSummary ? `- 이번 달과 큰 흐름의 관계: "${plan.backgroundSummary}" — 이 뉘앙스를 verdict/overallSummary에 자연스럽게 한 번 반영하십시오(반복하지 말 것).` : '',
          '대운·세운을 새로 계산하거나, 확정적 미래(합격/이별/입금 등)로 말하지 마십시오.',
        ].filter(Boolean)
      : []),
    '작성 규칙(반드시 지킬 것):',
    '- 반복 금지: opportunities·cautions·actions는 서로 다른 생활 영역/행동을 다루십시오. 같은 조언 계열("정리하세요/기록하세요/확인하세요/천천히")을 여러 항목에서 되풀이하지 말고, 한 결과가 한 주제(예: 지출·정리)로만 수렴하지 않게 하십시오.',
    '- verdict: 이번 달 전반 판단 + 가장 밀어볼 만한 기회 + 가장 조심할 점을 1~3문장으로 분명히. 뻔한 격려("긍정적인 마음", "좋은 기운")로 채우지 마십시오.',
    '- headline: verdict를 한 줄로 압축한 구체적 문장(감성적 슬로건 금지).',
    '- overallSummary: 2~3문장. verdict를 반복하지 말고 "왜 그런 흐름인지"를 생활 언어로.',
    `- opportunities: 최대 ${plan.maxOpportunities}개. 서로 다른 새로운 정보. 각 항목 = domain 라벨 + 짧은 title + 1~2문장 body.`,
    `- ${coverageDirective}`,
    `- cautions: 최대 ${plan.maxCautions}개. "조심하세요"로 끝내지 말고 무엇을 어떻게 조심할지 구체적으로. ${cautionLabel ? '위 조절 영역 중심으로.' : '특별한 마찰이 없으면 억지로 만들지 말고 0~1개만.'}`,
    `- actions: 이번 달을 어떻게 보내면 좋은지 구체적 행동 ${plan.maxActions}개 이내("그래서 이번 달 어떻게 보내면 되지?"에 답).`,
    '- followUps: 정확히 3개. 각 항목 = displayLabel(10~18자 내외의 짧은 질문형, 마침표 없이) + question(상담에 그대로 전달할 자연스러운 한 문장). 1) 기운이 실리는 영역, 2) 조율/주의 영역(없으면 이번 달 결정), 3) 시기/실행 순으로.',
    '정확한 날짜·주간을 지어내지 마십시오(§24): 이번 달 근거는 "달" 단위입니다. "8월 17~21일이 가장 좋다"처럼 특정 날짜/주를 단정하지 말고, 더 구체적인 시기가 궁금하면 상담에서 날짜를 비교해볼 수 있다고 안내하십시오.',
    '사건을 확정하지 마십시오(§32): "돈이 들어옵니다 / 계약이 성사됩니다 / 연락이 옵니다 / 이직합니다 / 헤어집니다"처럼 쓰지 말고, "~하기에 좋은 흐름", "~은 조건을 확인하고 움직이는 편이 낫습니다"처럼 적합도·기회로 쓰십시오. 행운의 색·방향·숫자·점수도 만들지 마십시오.',
    '건강은 진단·치료가 아니라 컨디션 관리·생활 리듬으로만. 돈은 특정 종목 매수 권유 금지, 흐름·조율로만. 관계는 상대의 속마음을 사실로 단정하지 마십시오.',
    'JSON 스키마(deokbun_monthly_fortune)에 맞춰 그 형식으로만 답하십시오. 글은 모바일에서 읽기 좋게 간결하게(긴 에세이 금지).',
  ].join('\n');

  const user = [
    `이번 달: ${label}`,
    `전반 기운: ${plan.overallTier}`,
    `권하는 방식: ${plan.primaryModeLabel}`,
    `기운이 실리는 영역: ${emphasized}`,
    `조율이 필요한 영역: ${cautionLabel ?? '특별히 없음'}`,
    ...(plan.hasMeaningfulTransition && plan.transition
      ? [`이번 달 흐름 변화: 초반 "${plan.transition.early.tier}" → 중반 이후 "${plan.transition.later.tier}" ("초반/중반 이후"로만 표현, 특정 날짜 단정 금지)`]
      : []),
    `내부 참고(그대로 노출하지 말 것): 조화 ${plan.harmonyCount} · 마찰 ${plan.frictionCount}`,
    '',
    `위 판단을 바탕으로, 이번 달 무엇을 밀고 무엇을 조심하면 좋은지 분명히 답하는 ${label} 운세를 스키마 형식의 JSON으로 작성하십시오.`,
  ].join('\n');

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}
