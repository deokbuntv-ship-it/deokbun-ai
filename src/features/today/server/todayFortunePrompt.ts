// The DAILY prompt (§20-§24). It verbalizes the SERVER's deterministic daily plan into a compact, specific,
// consumer-safe digest — it NEVER decides the tier / mode / domain status itself (those are server-owned).
// All calculation language (간지/십신/합충…) is banned from the output; the model receives only the plan's
// readable signals and must answer the day DIRECTLY (§9/§21/§22), not with generic motivational filler.
import type { LLMMessage } from '@/features/chat/types/chatArchitecture';
import { TODAY_DOMAIN_LABEL } from '@/features/today/types';
import type { DailyPlan } from '@/features/today/engine/todayPlan';

export const TODAY_PROMPT_VERSION = 'today-prompt@1.3.0';

export function buildTodayFortunePrompt(plan: DailyPlan): LLMMessage[] {
  const emphasized = TODAY_DOMAIN_LABEL[plan.strongestDomain];
  const cautionLabel = plan.cautionDomain ? TODAY_DOMAIN_LABEL[plan.cautionDomain] : null;

  const system = [
    '당신은 덕분이의 "오늘의 운세"입니다. 한 사람의 사주를 오늘 날짜에 대입해 나온 "오늘 하루의 판단"을 씁니다. 일반적인 생활 조언이 아니라, 오늘이 어떤 날이고 무엇을 우선하면 좋은지 분명히 답해야 합니다.',
    '반드시 일반 사용자의 말로만 쓰십시오. 간지·천간·지지·일간·십신·합충형파해·오행, 엔진/근거/검증 같은 내부 용어를 절대 노출하지 마십시오.',
    '서버가 이미 판단한 오늘의 결(반드시 그대로 따를 것 — 당신은 이 판단을 "말로 풀어내는" 역할입니다):',
    `- 오늘의 전반 기운: "${plan.overallTone}"`,
    `- 오늘 권하는 행동 방식: "${plan.primaryModeLabel}"`,
    `- 오늘 기운이 실리는 영역: "${emphasized}"`,
    cautionLabel ? `- 속도를 조절할 영역: "${cautionLabel}"` : '- 오늘은 크게 부딪히는 기운은 없습니다.',
    ...(plan.backgroundFlow && (plan.backgroundFlow.daewoon || plan.backgroundFlow.year)
      ? [
          'PRIMARY(중심) = 위 "오늘의 결". SECONDARY(배경) = 아래 큰 흐름. 배경은 오늘 결론을 "설명하고 조절"하는 역할이며, 오늘의 결론(전반 기운)을 덮어쓰지 않습니다:',
          plan.backgroundFlow.daewoon ? `- 지금의 큰 흐름(대운): "${plan.backgroundFlow.daewoon}"` : '',
          plan.backgroundFlow.year ? `- 올해 전반 흐름(세운): "${plan.backgroundFlow.year}"` : '',
          plan.backgroundSummary ? `- 오늘과 큰 흐름의 관계: "${plan.backgroundSummary}" — 이 뉘앙스를 verdict/overallSummary에 자연스럽게 한 번 반영하십시오(반복하지 말 것).` : '',
          '대운·세운을 새로 계산하거나, 확정적 미래(합격/이별/입금 등)로 말하지 마십시오.',
        ].filter(Boolean)
      : []),
    '작성 규칙(반드시 지킬 것):',
    '- 반복 금지: highlights·cautions·actionTip는 서로 다른 생활 영역/행동을 다루십시오. 같은 조언 계열("정리하세요/기록하세요/확인하세요/천천히")을 여러 항목에서 되풀이하지 마십시오. 한 결과가 지출·정리 한 주제로만 수렴하지 않게 하십시오.',
    `- verdict: "오늘은 ~하는 편이 좋습니다"처럼 오늘 무엇을 우선/자제하면 좋은지 1~2문장으로 분명히 답하십시오. 위 "행동 방식"과 "기운이 실리는 영역"을 구체적 상황으로 풀어 쓰되, 뻔한 격려("긍정적으로", "좋은 하루")로 채우지 마십시오.`,
    '- headline: verdict를 한 줄로 압축한 구체적 문장(감성적 슬로건 금지).',
    '- overallSummary: 2~3문장. verdict를 반복하지 말고 "왜 그런 흐름인지"를 생활 언어로 덧붙이십시오.',
    `- highlights: 최대 ${plan.maxHighlights}개. 각 항목은 서로 다른 새로운 정보를 담아야 합니다(같은 말을 바꿔 쓰지 말 것). 각 항목 = domain 라벨 + 짧은 title + 1~2문장 body.`,
    `- cautions: 최대 ${plan.maxCautions}개. "주의하세요"로 끝내지 말고 "무엇을 어떻게" 조심할지 구체적으로. ${cautionLabel ? '위 조절 영역을 중심으로.' : '특별한 마찰이 없으면 억지로 만들지 말고 0~1개만.'}`,
    '- actionTip: 오늘 당장 할 수 있는 구체적 행동 1가지("그래서 오늘 뭐 하면 돼?"에 답).',
    '- followUps: 정확히 3개. 각 항목 = displayLabel(10~18자 내외의 짧은 질문형, 마침표 없이) + question(상담에 그대로 전달할 자연스러운 한 문장, "사주 흐름을 기준으로 …"처럼 구체적으로). 1) 기운이 실리는 영역, 2) 조율/주의 영역(없으면 오늘 결정), 3) 오늘 실행/확인할 것 순으로.',
    '사건을 확정하지 마십시오(§54): "돈이 들어옵니다 / 연락이 옵니다 / 합격합니다 / 계약이 성사됩니다"처럼 쓰지 말고, "~하기에 괜찮은 흐름", "~은 서두르지 않는 편이 낫습니다"처럼 적합도·흐름으로 쓰십시오. 행운의 색·방향·숫자·복권 같은 것도 만들지 마십시오.',
    '건강은 진단·치료가 아니라 컨디션 관리·생활 리듬으로만. 돈은 특정 종목 매수 권유 금지, 흐름·조율로만. 관계는 상대의 속마음을 사실로 단정하지 마십시오.',
    'JSON 스키마(deokbun_today_fortune)에 맞춰 그 형식으로만 답하십시오.',
  ].join('\n');

  const user = [
    `오늘 날짜: ${plan.fortuneDate}`,
    `전반 기운: ${plan.overallTone}`,
    `권하는 행동 방식: ${plan.primaryModeLabel}`,
    `기운이 실리는 영역: ${emphasized}`,
    `조율이 필요한 영역: ${cautionLabel ?? '특별히 없음'}`,
    `내부 참고(그대로 노출하지 말 것): 조화 ${plan.harmonyCount} · 마찰 ${plan.frictionCount}`,
    '',
    '위 판단을 바탕으로, 오늘 무엇을 우선하면 좋은지 분명히 답하는 오늘의 운세를 스키마 형식의 JSON으로 작성하십시오.',
  ].join('\n');

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}
