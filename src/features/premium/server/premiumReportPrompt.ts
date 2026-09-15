// Premium Report prompt. NEW FILE — the consultation prompt is not touched and not reused. The contract is
// the one every surface holds: the LLM is a LANGUAGE REALIZER. It receives facts that were already
// decided and writes them in plain Korean. It computes nothing, decides nothing, adds nothing.
//
// REWRITTEN 2026-09-02 after reading four real reports. The old brief carried one element name, an age
// span and twelve ten-god pairs — about 827 tokens — and the four outputs were interchangeable: the same
// four "이렇게 지내보세요" lines for a 1970 and a 2001 birth, and twelve months no reader could tell apart.
// Two things changed. The brief now carries what the engine already computed (see premiumEvidence.ts),
// and the instructions below name the failure modes explicitly instead of hoping. The single most
// important addition is per-month STRUCTURE: each month arrives with its own positioned relations to the
// natal chart and to the year, which is the only thing that can make month 3 differ from month 9.
import type { LLMMessage } from '@/features/chat/types/chatArchitecture';
import { plainify, type PremiumEvidence } from '@/features/premium/engine/premiumEvidence';

const SYSTEM = [
  '너는 덕분이의 프리미엄 리포트 작성자다. 사주 계산은 이미 끝났고, 너는 주어진 사실만 한국어 산문으로 옮긴다.',
  '',
  '■ 절대 규칙',
  '- 주어지지 않은 사실을 만들지 않는다. 없는 항목은 쓰지 않는다("없음"이라고 쓰지도 않는다).',
  '- 십신 이름(비견·정관·편재 …), 사주 용어(원국·대운·세운·월운·통근·투간·득령), 자리 이름(년주·월주 …)을',
  '  **출력 문장에 그대로 쓰지 않는다.** 이것들은 네가 읽고 해석할 재료이지 독자가 읽을 말이 아니다.',
  '  아래 【근거】는 이미 뜻으로 풀린 말로 주어진다 — 그 말을 다시 전문용어로 되돌리지 마라.',
  '  예) "둘째 기둥 부딪힘" → "일과 자리 쪽이 정면으로 흔들리는 시기"',
  '- 특정 날짜·주 단위 단정("17~21일이 좋습니다")을 쓰지 않는다. 근거는 달 단위까지만이다.',
  '- 사건을 보장하지 않는다("합격합니다", "돈이 들어옵니다" 금지). 경향과 대응으로 쓴다.',
  '- 의료·법률·투자 판단을 대신하지 않는다.',
  '- 한국어와 일반 문장부호만 쓴다. 다른 언어의 문자를 섞지 않는다.',
  '',
  '■ 이 리포트가 실패하는 방식 — 반드시 피할 것',
  '1) 누구에게나 맞는 글. "기록하세요", "기준을 정하세요", "무리하지 마세요" 같은 조언은',
  '   이 사람의 명식에서 나온 것이 아니므로 쓰지 마라. 모든 문장은 아래 【근거】의 특정 항목에서',
  '   나와야 하고, 다른 사람의 명식에 옮겨 놓으면 말이 안 되어야 한다.',
  '2) 구별되지 않는 열두 달. 각 달에는 서로 다른 구조가 붙어 있다. 같은 조언을 두 달에',
  '   반복하지 마라. 관계가 걸리지 않은 달은 "조용한 달"로 쓰고, 걸린 달과 대비시켜라.',
  '3) 틀릴 수 없는 문장. "상황에 따라 다를 수 있습니다" 같은 말은 아무것도 말하지 않은 것이다.',
  '   근거가 있으면 분명히 말하라. 근거가 없으면 그 항목을 아예 쓰지 마라.',
  '4) 나이를 무시한 글. 아래에 나이와 현재 흐름 구간이 주어진다. 20대와 50대의 같은 구조는',
  '   같은 의미가 아니다. 생애 단계에 맞는 장면으로 써라.',
  '5) 열두 달이 전부 경고인 글. 이것이 가장 흔한 실패다. 실제 근거는 절반이 "맞물림"인데도',
  '   흔들림·충돌·마찰·재편만 반복해서 쓰면, 1년치 불안을 판 것이 된다.',
  '',
  '■ 열두 달의 톤 — 반드시 지킬 것',
  '- 맞물림이 있는 달과 걸리는 곳이 없는 달은 **경고로 쓰지 마라.**',
  '  맞물림 → 기회 · 연결 · 정리되는 시기.  걸리는 곳 없음 → 압력이 없어 준비하고 회복하기 좋은 시기.',
  '  부딪힘이 있는 달만 조정·확인의 언어를 쓴다.',
  '- 열두 달을 다 쓰고 나서 세어 보라. 기회·순조로움·준비하기 좋음으로 읽히는 달이 **4개 이상**이어야 한다.',
  '  모자라면 근거 없이 좋게 고치지 말고, 맞물림·조용한 달을 제대로 다시 써라.',
  '- 근거가 아예 없는 달은 좋다고도 나쁘다고도 하지 말고 중립으로 쓴다.',
  '',
  '■ 같은 말 반복 금지',
  '- "일의 자리", "개인 선택", "앞으로의 계획", "역할 조율" 같은 표현을 열두 줄에서 3번 넘게 쓰지 마라.',
  '  달마다 붙은 근거가 다르므로 장면도 달라야 한다 — 사람·돈·배움·건강·이동·정리처럼 구체적인 장면으로 갈라 써라.',
  '',
  '■ 분량과 형식',
  '- natalSummary: 3~5문장. 이 사람의 타고난 결이 무엇인지.',
  '- flowSummary: 현재 흐름 구간이 주어졌을 때만. 없으면 빈 문자열.',
  '- sections: 4~6개. 각 body 3~4문장. 제목은 이 사람에게 실제로 해당하는 주제로 지어라',
  '  (일반적인 "성향/관계/재물" 나열이 아니라, 이 명식에서 실제로 두드러지는 것).',
  '- monthlyOutlook: 주어진 달 수와 **정확히 같은 개수**, 각 한 문장, 순서 그대로.',
  '  **문장 안에 연도나 월 표기를 쓰지 마라** (앞에 날짜가 이미 붙는다). "이 달은"으로도 시작하지 마라.',
  '  바로 내용으로 들어가라.',
  '- actions: 3~5개. 각 한 문장. 이 사람의 구조에서 나온 행동이어야 한다.',
].join('\n');

const bullet = (items: string[]): string => items.map((s) => `  - ${s}`).join('\n');

/** Facts → a structured brief. Identifiers are Korean structural terms the model must translate, never echo. */
export function buildPremiumReportPrompt(ev: Extract<PremiumEvidence, { available: true }>): LLMMessage[] {
  const n = ev.natal;
  const L: string[] = [];

  L.push('【근거 1 — 타고난 구성】');
  L.push(`나이: 만 ${ev.ageAtReport}세 전후`);
  if (n.dayMasterElement) L.push(`중심이 되는 성질: ${n.dayMasterElement}`);
  if (n.elementCounts.length > 0) {
    L.push(`오행 개수: ${n.elementCounts.map((e) => `${e.element} ${e.count}`).join(' · ')}`);
    const zero = n.elementCounts.filter((e) => e.count === 0).map((e) => e.element);
    if (zero.length > 0) L.push(`원국에 없는 기운: ${zero.join('·')} (이 사람이 환경에서 구해야 하는 것)`);
  }
  if (n.monthCommand) L.push(`태어난 계절: ${n.monthCommand.season} · 계절 대비 상태: ${n.monthCommand.status} (${n.monthCommand.phase})`);
  if (n.pillars.length > 0) L.push(`자리별 십신:\n${bullet(n.pillars.map((p) => `${plainify(p.position)} — ${p.tenGod}`))}`);
  if (n.roleCounts.length > 0) L.push(`겉으로 드러난 힘의 구성비: ${n.roleCounts.map((r) => `${r.role} ${r.count}`).join(' · ')}`);
  if (n.hiddenRoleCounts.length > 0) L.push(`속에 깔린 힘의 구성비: ${n.hiddenRoleCounts.map((r) => `${r.role} ${r.count}`).join(' · ')} (겉과 다르면 그 격차가 이 사람의 특징이다)`);
  if (n.hiddenByPillar.length > 0) {
    L.push(`자리별로 속에 품은 것:\n${bullet(n.hiddenByPillar.map((h) => plainify(`${h.position} — ${h.tenGods.join(', ')}`)))}`);
  }
  if (n.rootedStems.length > 0) {
    L.push(`뿌리가 있는 자리(실제로 쓸 수 있는 힘):\n${bullet(n.rootedStems.map((r) => plainify(`${r.position} ← ${r.roots.join(' · ')}`)))}`);
  } else L.push('뿌리가 있는 자리: 없음 (겉으로 보이는 힘을 뒷받침하는 바탕이 약하다)');
  if (n.revealedStems.length > 0) L.push(`속에 있던 것이 겉으로 올라온 자리:\n${bullet(n.revealedStems.map(plainify))}`);
  if (n.hiddenOnlyTenGods.length > 0) L.push(`속에만 있고 겉으로 안 드러난 것: ${n.hiddenOnlyTenGods.join(' · ')}`);
  if (n.natalRelations.length > 0) L.push(`타고난 네 기둥 사이의 관계:\n${bullet(n.natalRelations.map(plainify))}`);
  else L.push('타고난 네 기둥 사이의 관계: 두드러지게 부딪히거나 묶이는 자리가 없음 (구조가 서로 간섭하지 않는 편)');

  if (ev.daewoon) {
    L.push('');
    L.push('【근거 2 — 지금 지나는 큰 흐름】');
    L.push(`구간: ${ev.daewoon.startAge}~${ev.daewoon.endAge}세 (${ev.daewoon.ordinal}번째)`);
    L.push(`이 구간의 성격: ${ev.daewoon.tenGods.join(' · ')}`);
    L.push(ev.daewoon.relations.length > 0
      ? `타고난 자리와의 관계:\n${bullet(ev.daewoon.relations.map(plainify))}`
      : '타고난 자리와 직접 부딪히는 곳 없음');
  }

  if (ev.sewoon) {
    L.push('');
    L.push('【근거 3 — 올해 흐름】');
    L.push(`${ev.sewoon.year}년의 성격: ${ev.sewoon.tenGods.join(' · ')}`);
    L.push(ev.sewoon.relations.length > 0
      ? `타고난 자리와의 관계:\n${bullet(ev.sewoon.relations.map(plainify))}`
      : '타고난 자리와 직접 부딪히는 곳 없음');
  }

  L.push('');
  const harmonyTotal = ev.months.reduce((a, m) => a + m.harmony.length, 0);
  const frictionTotal = ev.months.reduce((a, m) => a + m.friction.length, 0);

  L.push(`【근거 4 — 향후 ${ev.months.length}개월】 이 순서 그대로 한 달에 한 문장씩.`);
  L.push('각 달에는 세 가지가 붙어 있다.');
  L.push('- "성격": 그 달이 데려오는 십신.');
  L.push('- "받쳐 주는 달 / 쓰는 달": 나를 채워 주는 쪽인지, 내가 힘을 써서 내보내는 쪽인지.');
  L.push('  **어느 쪽도 좋고 나쁨이 아니다.** 받쳐 주는 달은 배우고 채우기 좋은 달, 쓰는 달은 성과를 내는 달이다.');
  L.push('- "맞물림 / 부딪힘": 맞물림은 여러 자리가 함께 움직여 일이 연결되고 정리되는 신호다.');
  L.push('  **맞물림을 자동으로 "복잡하다"·"얽힌다"로 쓰지 마라.** 연결·정리·함께 풀림이 기본 뜻이다.');
  L.push('  부딪힘만 조정이 필요한 신호다.');
  L.push(`이 사람의 열두 달에는 맞물림 ${harmonyTotal}건, 부딪힘 ${frictionTotal}건이 들어 있다.`);
  ev.months.forEach((m, i) => {
    const parts = [`성격 ${[m.stemTenGod, m.branchTenGod].filter(Boolean).join('·')}`];
    parts.push(m.side === 'SUPPORT' ? '받쳐 주는 달' : '쓰는 달');
    if (m.harmony.length > 0) parts.push(`맞물림 ${m.harmony.map(plainify).join(' · ')}`);
    if (m.friction.length > 0) parts.push(`부딪힘 ${m.friction.map(plainify).join(' · ')}`);
    if (m.harmony.length === 0 && m.friction.length === 0) parts.push('걸리는 곳 없음(조용한 달)');
    L.push(`  ${String(i + 1).padStart(2, ' ')}. ${m.year}년 ${m.month}월 — ${parts.join(' / ')}`);
  });

  if (ev.brightMonths.length > 0 || ev.heavyMonths.length > 0) {
    L.push('');
    L.push('【근거 5 — 두드러지는 달】');
    if (ev.brightMonths.length > 0) {
      L.push(`맞물림이 가장 두터운 달 (기회·정리·연결로 써라):\n${bullet(ev.brightMonths.map((x) => `${x.year}년 ${x.month}월 — ${x.why.split(' · ').map(plainify).join(' · ')}`))}`);
    }
    if (ev.heavyMonths.length > 0) {
      L.push(`부딪힘이 가장 두터운 달 (조정·확인으로 써라):\n${bullet(ev.heavyMonths.map((x) => `${x.year}년 ${x.month}월 — ${x.why.split(' · ').map(plainify).join(' · ')}`))}`);
    }
    L.push('이 달들만 뚜렷하게 써라. 나머지 달을 이 달처럼 쓰지 마라.');
  }

  return [
    { role: 'system', content: SYSTEM },
    { role: 'user', content: L.join('\n') },
  ];
}

/** Test/diagnostic surface: how many evidence blocks the brief actually carries. */
export function premiumPromptBlockCount(ev: Extract<PremiumEvidence, { available: true }>): number {
  return buildPremiumReportPrompt(ev)[1].content.split('【').length - 1;
}
