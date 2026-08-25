// DIVINATION_ENGINE_V1 — QIMEN (기문둔갑) INDEPENDENT JUDGE. REBUILT for depth (audit: QIMEN_DEPTH = LOW,
// "QIMEN_IS_ZHISHI_DOOR_HEURISTIC = YES").
//
// WHAT THE AUDIT FOUND, AND WHAT CHANGED:
//   · the whole 9-palace board collapsed into ONE 값사문 class → fixed stance. Boards with completely
//     different 星/神/宮 composition produced identical verdicts.
//   · 값부 star and 팔신 deity appeared in prose but could not change the judgment.
//   Now the stance is composed from FOUR canonical signals that can each move it:
//     값사문(the matter's door) · 구성(값부 star) · 팔신(deity at the acting palace) · 값부/값사 궁 관계.
//
// DOCTRINE (C-class, newly adopted, declared explicitly for review — see docs):
//   R1 八門 길흉: 開·休·生 = 길문, 死·驚·傷 = 흉문, 杜·景 = 중평.
//   R2 값사(值使)문 = 사안 자체를 이끄는 문 → 주 신호. 값부(值符) = 판의 주도 기운 → 보조 신호.
//   R3 九星 길흉: 天輔·天禽·天心 = 길성, 天蓬·天芮·天柱 = 흉성, 天沖·天任·天英 = 중평.
//   R4 八神: 值符·太陰·六合·九天 = 도움 주는 신, 螣蛇·白虎·玄武 = 방해하는 신, 九地 = 지키는 신(중평).
//   R5 값부와 값사가 같은 궁에 있으면 기운이 한곳에 모여 신호가 뚜렷해진다.
// NOT AVAILABLE AT RUNTIME → never claimed: 方位(direction) is dropped at the adapter boundary, so this judge
// NEVER recommends a direction. Scope is strictly PRESENT_MOMENT — it never speaks to natal structure.
import type { QimenBoard } from '@/features/qimen/domain/qimenTypes';

import {
  type DivinationJudgment,
  type EvidenceStrength,
  type JudgmentDomain,
  type JudgmentEvidence,
  type Stance,
} from './contracts';

export type DoorClass = 'AUSPICIOUS' | 'INAUSPICIOUS' | 'NEUTRAL';

const DOOR_CLASS: Record<string, DoorClass> = {
  開門: 'AUSPICIOUS', 休門: 'AUSPICIOUS', 生門: 'AUSPICIOUS',
  死門: 'INAUSPICIOUS', 驚門: 'INAUSPICIOUS', 傷門: 'INAUSPICIOUS',
  杜門: 'NEUTRAL', 景門: 'NEUTRAL',
};
const DOOR_MEANING: Record<string, string> = {
  開門: '길이 열려 있는 문', 休門: '쉬어 가며 순조로운 문', 生門: '살아 움직이며 얻는 문',
  死門: '멈추고 막히는 문', 驚門: '놀라고 시끄러워지는 문', 傷門: '부딪히고 다치는 문',
  杜門: '닫아 두고 숨기는 문', 景門: '드러나되 실속은 갈리는 문',
};
// R3 — 九星
const STAR_CLASS: Record<string, DoorClass> = {
  天輔: 'AUSPICIOUS', 天禽: 'AUSPICIOUS', 天心: 'AUSPICIOUS',
  天蓬: 'INAUSPICIOUS', 天芮: 'INAUSPICIOUS', 天柱: 'INAUSPICIOUS',
  天沖: 'NEUTRAL', 天任: 'NEUTRAL', 天英: 'NEUTRAL',
};
// R4 — 八神
const GOD_CLASS: Record<string, DoorClass> = {
  值符: 'AUSPICIOUS', 太陰: 'AUSPICIOUS', 六合: 'AUSPICIOUS', 九天: 'AUSPICIOUS',
  螣蛇: 'INAUSPICIOUS', 白虎: 'INAUSPICIOUS', 玄武: 'INAUSPICIOUS',
  九地: 'NEUTRAL',
};

const classify = (table: Record<string, DoorClass>, value: string | undefined): DoorClass | null => {
  if (!value) return null;
  const key = Object.keys(table).find((k) => value.includes(k));
  return key ? table[key] : null;
};
export const doorClass = (door: string | undefined): DoorClass | null => classify(DOOR_CLASS, door);
const doorMeaning = (door: string): string =>
  DOOR_MEANING[Object.keys(DOOR_MEANING).find((d) => door.includes(d)) ?? ''] ?? '기록된 문';

export type QimenJudgeInput = {
  question: string;
  questionDomain: JudgmentDomain;
  board: QimenBoard | null;
  availability: 'available' | 'not_applicable' | 'missing_question_time' | 'unsupported_case' | 'calculation_failed';
};

function inapplicable(reason: string, domain: JudgmentDomain): DivinationJudgment {
  return {
    discipline: 'QIMEN', applicable: false, applicabilityReason: reason, dataReliability: 'UNUSABLE',
    questionDomain: domain, temporalScope: 'PRESENT_MOMENT', stance: 'NOT_APPLICABLE',
    dominantConclusion: '이 질문은 기문둔갑으로 볼 성질의 질문이 아닙니다.', dominantFactor: reason,
    directEvidence: [], counterEvidence: [], internalContradictions: [], timingSignals: [],
    domainSubJudgments: [], confidence: 'LOW', questionDirectness: 'GENERAL',
    evidenceStrength: 'NONE', factGroupsUsed: [],
  };
}

const SIGN = { AUSPICIOUS: 1, NEUTRAL: 0, INAUSPICIOUS: -1 } as const;

/**
 * Judge "is NOW the moment" from the WHOLE board. Four canonical signals compose the stance, so two boards
 * sharing a 값사문 but differing in 성/신/궁 no longer collapse to the same verdict.
 */
export function judgeQimen(input: QimenJudgeInput): DivinationJudgment {
  const asked = input.questionDomain;
  if (input.availability === 'not_applicable') {
    return inapplicable('지금 시점의 움직임을 묻는 질문이 아니라, 기문둔갑은 적용하지 않았습니다.', asked);
  }
  if (input.availability !== 'available' || !input.board) {
    return inapplicable('질문 시점의 기문 국을 세우지 못했습니다.', asked);
  }
  const board = input.board;

  const dutyDoor = board.zhishi;
  const dutyDoorClass = doorClass(dutyDoor);
  if (!dutyDoorClass) return inapplicable('질문 시점의 값사문을 판별할 수 없습니다.', asked);

  // The palace the acting door sits in, and what shares it.
  const dutyPalace = board.palaces.find((p) => p.palaceLabel.includes(board.zhishiPalace)) ?? null;
  const commanderPalace = board.palaces.find((p) => p.palaceLabel.includes(board.zhifuPalace)) ?? null;
  const starCls = classify(STAR_CLASS, board.zhifu);
  const godCls = classify(GOD_CLASS, dutyPalace?.god);
  const sameSeat = board.zhishiPalace === board.zhifuPalace; // R5

  const evidence: JudgmentEvidence[] = [];
  const counterEvidence: JudgmentEvidence[] = [];
  const push = (cls: DoorClass | null, fact: string, meaning: string, directness: 'DIRECT' | 'ADJACENT') => {
    if (cls === null) return;
    const item: JudgmentEvidence = { fact, meaning, domain: 'TIMING', temporalScope: 'PRESENT_MOMENT', directness };
    if (cls === 'INAUSPICIOUS') counterEvidence.push(item);
    else evidence.push(item);
  };

  push(dutyDoorClass, `값사 ${dutyDoor} (${board.zhishiPalace}궁)`, `지금 이 일을 이끄는 자리는 ${doorMeaning(dutyDoor)}입니다.`, 'DIRECT');
  push(starCls, `값부 ${board.zhifu}${commanderPalace ? ` (${board.zhifuPalace}궁)` : ''}`,
    starCls === 'INAUSPICIOUS' ? '판을 이끄는 기운이 껄끄럽습니다.' : starCls === 'AUSPICIOUS' ? '판을 이끄는 기운이 힘을 보탭니다.' : '판을 이끄는 기운은 무난합니다.', 'ADJACENT');
  if (dutyPalace?.god) {
    push(godCls, `${board.zhishiPalace}궁 ${dutyPalace.god}`,
      godCls === 'INAUSPICIOUS' ? '이 자리를 지키는 신이 일을 흔듭니다.' : godCls === 'AUSPICIOUS' ? '이 자리를 지키는 신이 도와줍니다.' : '이 자리를 지키는 신은 지키기만 합니다.', 'ADJACENT');
  }
  if (dutyPalace) {
    evidence.push({
      fact: `${board.zhishiPalace}궁 천반 ${dutyPalace.heavenPlate} · 지반 ${dutyPalace.earthPlate}`,
      meaning: '지금 이 일이 놓인 자리의 위아래 기운입니다.',
      domain: 'TIMING', temporalScope: 'PRESENT_MOMENT', directness: 'ADJACENT',
    });
  }
  if (sameSeat) {
    evidence.push({
      fact: `값부·값사가 같은 ${board.zhishiPalace}궁`,
      meaning: '기운이 한곳에 모여, 지금의 신호가 그만큼 뚜렷합니다.',
      domain: 'TIMING', temporalScope: 'PRESENT_MOMENT', directness: 'ADJACENT',
    });
  }

  // ── compose the stance from all four signals (door weighted double: it governs the matter) ────────
  const score = SIGN[dutyDoorClass] * 2 + (starCls ? SIGN[starCls] : 0) + (godCls ? SIGN[godCls] : 0);
  const sharpened = sameSeat ? (score > 0 ? score + 1 : score < 0 ? score - 1 : 0) : score;

  let stance: Stance;
  let dominantConclusion: string;
  if (sharpened >= 3) {
    stance = 'FOR';
    dominantConclusion = '지금 시점으로 보면 판이 분명히 열려 있습니다. 움직여도 됩니다.';
  } else if (sharpened >= 1) {
    stance = 'CONDITIONAL_FOR';
    dominantConclusion = '지금 판은 나쁘지 않습니다. 크게 벌이지 않는 선에서 진행할 만합니다.';
  } else if (sharpened <= -3) {
    stance = 'AGAINST_FOR_NOW';
    dominantConclusion = '지금 이 시점은 판 자체가 막혀 있습니다. 시점을 미루는 쪽으로 봅니다.';
  } else if (sharpened <= -1) {
    stance = 'AGAINST_FOR_NOW';
    dominantConclusion = '지금 밀어붙이면 부딪히는 자리가 있습니다. 서두르지 않는 쪽이 낫습니다.';
  } else {
    stance = 'CONDITIONAL_FOR';
    dominantConclusion = '지금 판은 크게 열리지도 막히지도 않아, 조용히 진행하는 정도가 알맞습니다.';
  }

  const evidenceStrength: EvidenceStrength =
    Math.abs(sharpened) >= 3 ? 'STRONG' : Math.abs(sharpened) >= 1 ? 'MODERATE' : 'WEAK';
  const mixed = evidence.length > 0 && counterEvidence.length > 0;

  return {
    discipline: 'QIMEN',
    applicable: true,
    dataReliability: 'EXACT',
    questionDomain: 'TIMING',
    temporalScope: 'PRESENT_MOMENT',
    stance,
    dominantConclusion,
    dominantFactor: `값사 ${dutyDoor}${starCls ? ` · 값부 ${board.zhifu}` : ''}${dutyPalace?.god ? ` · ${dutyPalace.god}` : ''}`,
    directEvidence: evidence,
    counterEvidence,
    internalContradictions: mixed ? ['지금 판 안에서도 돕는 기운과 막는 기운이 섞여 있습니다.'] : [],
    timingSignals: [...evidence, ...counterEvidence].filter((e) => e.directness === 'DIRECT'),
    domainSubJudgments: [
      {
        domain: 'TIMING', stance,
        conclusion: stance === 'AGAINST_FOR_NOW' ? '지금 당장의 시점은 아닙니다.' : '지금 움직이는 것 자체는 무리가 없습니다.',
        temporalScope: 'PRESENT_MOMENT', directness: 'DIRECT', reliability: 'EXACT',
        evidence, counterEvidence,
      },
    ],
    // PRESENT_MOMENT authority only — deliberately never outranks structure on its own (§7/§12).
    confidence: evidenceStrength === 'STRONG' ? 'MEDIUM' : 'LOW',
    questionDirectness: 'DIRECT',
    evidenceStrength,
    factGroupsUsed: ['값사문', '값부 구성', '팔신', '값사·값부 착궁', '천반·지반'],
  };
}
