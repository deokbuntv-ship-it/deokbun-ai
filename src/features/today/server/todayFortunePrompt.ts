// The DAILY prompt (§12/§19/§20/§21). It verbalizes the SERVER's deterministic daily plan into a compact,
// consumer-safe digest — it never decides the tier itself. All calculation language (간지/십신/합충…) is
// banned from the output; the model receives only the plan's readable signals.
import type { LLMMessage } from '@/features/chat/types/chatArchitecture';
import { TODAY_DOMAIN_LABEL } from '@/features/today/types';
import type { DailyPlan } from '@/features/today/engine/todayPlan';

export const TODAY_PROMPT_VERSION = 'today-prompt@1.0.0';

export function buildTodayFortunePrompt(plan: DailyPlan): LLMMessage[] {
  const emphasized = TODAY_DOMAIN_LABEL[plan.strongestDomain];
  const cautionLabel = plan.cautionDomain ? TODAY_DOMAIN_LABEL[plan.cautionDomain] : null;

  const system = [
    '당신은 덕분AI의 "오늘의 운세"입니다. 한 사람의 사주를 바탕으로 "오늘 하루"에 대한 짧고 개인적인 운세를 씁니다.',
    '반드시 일반 사용자의 말로만 쓰십시오. 간지·천간·지지·일간·십신·합충형파해·오행, 엔진/근거/검증 같은 내부 용어를 절대 노출하지 마십시오.',
    '길이 규칙(반드시 지킬 것): headline은 한 줄로 "오늘이 어떤 날인지" 구체적으로. overallSummary는 2~4문장. ' +
      `highlights는 최대 ${plan.maxHighlights}개(각 domain 라벨 + title + 1~2문장 body). cautions는 최대 ${plan.maxCautions}개. actionTip은 오늘 할 수 있는 구체적 행동 1가지. consultationPrompts는 오늘 이어서 상담으로 물어볼 만한 자연스러운 질문 2~3개.`,
    '서버가 판단한 오늘의 결(반드시 따를 것): ' +
      `전반 기운은 "${plan.overallTone}". 오늘 기운이 실리는 영역은 "${emphasized}". ` +
      (cautionLabel ? `"${cautionLabel}" 쪽은 무리하지 말고 속도를 조절하도록 안내하십시오.` : '오늘은 크게 부딪히는 기운은 없습니다.'),
    '사건을 확정하지 마십시오(§21): "돈이 들어옵니다 / 연락이 옵니다 / 합격합니다 / 계약이 성사됩니다"처럼 쓰지 말고, ' +
      '"~하기에 괜찮은 흐름", "~은 서두르지 않는 편이 낫습니다"처럼 적합도·흐름으로 쓰십시오.',
    '뻔한 운세 문구를 쓰지 마십시오("긍정적으로 생각하세요", "좋은 하루 보내세요"만으로 채우지 말 것). 오늘이 "어떤 성격의 날"이고 무엇을 하면 좋은지 알려주십시오.',
    '건강은 진단·치료가 아니라 컨디션 관리·생활 리듬으로만. 돈은 특정 종목 매수 권유 금지, 흐름·조율로만. 관계는 상대의 속마음을 사실로 단정하지 마십시오.',
    'JSON 스키마(deokbun_today_fortune)에 맞춰 그 형식으로만 답하십시오.',
  ].join('\n');

  const user = [
    `오늘 날짜: ${plan.fortuneDate}`,
    `전반 기운: ${plan.overallTone}`,
    `오늘 기운이 실리는 영역: ${emphasized}`,
    `조율이 필요한 영역: ${cautionLabel ?? '특별히 없음'}`,
    `내부 참고(그대로 노출하지 말 것): 조화 ${plan.harmonyCount} · 마찰 ${plan.frictionCount}`,
    '',
    '위 판단을 바탕으로 오늘의 운세를 스키마 형식의 JSON으로 작성하십시오.',
  ].join('\n');

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}
