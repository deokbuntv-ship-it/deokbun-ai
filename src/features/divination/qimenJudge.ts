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
import { findPalaceByTrigram } from '@/features/qimen/services/qimenPalaceGeometry';

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
/** Exported so a domain-specific consultation judge (`qimenConsultationJudge.ts`) can classify a star
 *  or deity string without reimplementing R3/R4's own tables. */
export const starClass = (star: string | undefined): DoorClass | null => classify(STAR_CLASS, star);
export const godClass = (god: string | undefined): DoorClass | null => classify(GOD_CLASS, god);
const doorMeaning = (door: string): string =>
  DOOR_MEANING[Object.keys(DOOR_MEANING).find((d) => door.includes(d)) ?? ''] ?? '기록된 문';

export type QimenJudgeInput = {
  question: string;
  questionDomain: JudgmentDomain;
  board: QimenBoard | null;
  availability: 'available' | 'not_applicable' | 'missing_question_time' | 'unsupported_case' | 'calculation_failed';
  /**
   * Qimen Consultation Judge V1's result (`./qimenConsultationJudge.ts`, computed by the caller from
   * the SAME `board`) — surfaced as ADDITIONAL evidence below, never overriding this function's own
   * R1-R5 stance/dominantConclusion. `null`/absent when no domain routed or the consultation-judge
   * layer was not computed.
   */
  consultationJudgment?: { domain: string; supportingEvidence: JudgmentEvidence[]; counterEvidence: JudgmentEvidence[] } | null;
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

  // The palace the acting door sits in, and what shares it. `palaceLabel` (e.g. "九紫右弼") is the
  // CURRENT star/color rotating through a palace, never the trigram itself, so it can never be matched
  // against `zhifuPalace`/`zhishiPalace` — resolved instead via the library's own fixed trigram→index
  // geometry (`qimenPalaceGeometry.ts`), verified against real boards.
  const dutyPalace = findPalaceByTrigram(board, board.zhishiPalace);
  const commanderPalace = findPalaceByTrigram(board, board.zhifuPalace);
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

  // ── STRUCTURAL READING (V3 §22 — replaces `door×2 + star + deity + adjustment`) ───────────────────
  // The board is read as a NAMED CONFIGURATION, not a sum. 값사문 sets what the matter itself is doing; the
  // 값부 구성 and the 팔신 at the acting palace say whether the rest of the board is pulling with it or against
  // it; 값부·값사 동궁 says how concentrated that reading is. Each element can therefore change the verdict —
  // and the configuration that produced it is reported, so the reasoning is inspectable rather than arithmetic.
  const boardWith = starCls === 'AUSPICIOUS' || godCls === 'AUSPICIOUS';
  const boardAgainst = starCls === 'INAUSPICIOUS' || godCls === 'INAUSPICIOUS';

  let stance: Stance;
  let dominantConclusion: string;
  let configuration: string;
  let evidenceStrength: EvidenceStrength;

  if (dutyDoorClass === 'INAUSPICIOUS') {
    if (boardAgainst && !boardWith) {
      configuration = '흉문에 판 전체가 함께 막힘';
      stance = 'AGAINST_FOR_NOW';
      dominantConclusion = '일을 이끄는 문도 막혀 있고 판의 기운도 같은 방향이라, 지금 시점은 아닙니다.';
      evidenceStrength = 'STRONG';
    } else if (boardWith) {
      configuration = '흉문이나 도와주는 기운이 붙음';
      stance = 'AGAINST_FOR_NOW';
      dominantConclusion = '이끄는 문이 막혀 있습니다. 돕는 기운이 있어 아주 흉하지는 않으나, 지금 밀어붙일 때는 아닙니다.';
      evidenceStrength = 'MODERATE';
    } else {
      configuration = '흉문 단독';
      stance = 'AGAINST_FOR_NOW';
      dominantConclusion = '지금 이 일을 이끄는 자리가 막혀 있어, 시점을 미루는 쪽으로 봅니다.';
      evidenceStrength = 'MODERATE';
    }
  } else if (dutyDoorClass === 'AUSPICIOUS') {
    if (boardWith && !boardAgainst) {
      configuration = '길문에 판이 함께 열림';
      stance = 'FOR';
      dominantConclusion = '이끄는 문이 열려 있고 판의 기운도 같이 밀어 줍니다. 지금 움직여도 됩니다.';
      evidenceStrength = 'STRONG';
    } else if (boardAgainst) {
      // A blocked star/deity on an open door is the classic "열렸으나 방해가 붙은" board — conditional, not FOR.
      configuration = '길문이나 방해하는 기운이 붙음';
      stance = 'CONDITIONAL_FOR';
      dominantConclusion = '길은 열려 있지만 붙어 있는 기운이 껄끄럽습니다. 크게 벌이지 않는 선에서 진행하십시오.';
      evidenceStrength = 'MODERATE';
    } else {
      configuration = '길문 단독';
      stance = 'FOR';
      dominantConclusion = '지금 시점으로 보면 판이 열려 있습니다.';
      evidenceStrength = 'MODERATE';
    }
  } else {
    // 杜門/景門 — the matter itself is neither opened nor blocked, so the rest of the board decides.
    if (boardAgainst && !boardWith) {
      configuration = '중평문에 방해 기운';
      stance = 'AGAINST_FOR_NOW';
      dominantConclusion = '일 자체는 중립인데 판의 기운이 껄끄러워, 지금 서두를 자리는 아닙니다.';
      evidenceStrength = 'MODERATE';
    } else if (boardWith && !boardAgainst) {
      configuration = '중평문에 돕는 기운';
      stance = 'CONDITIONAL_FOR';
      dominantConclusion = '일 자체는 중립이지만 판이 도와주어, 조용히 진행할 만합니다.';
      evidenceStrength = 'MODERATE';
    } else {
      configuration = '중평문·판도 중립';
      stance = 'CONDITIONAL_FOR';
      dominantConclusion = '지금 판은 크게 열리지도 막히지도 않아, 조용히 진행하는 정도가 알맞습니다.';
      evidenceStrength = 'WEAK';
    }
  }

  // 값부·값사 동궁 concentrates the board, so the SAME reading is held with more certainty (it does not flip it).
  if (sameSeat && evidenceStrength === 'MODERATE') evidenceStrength = 'STRONG';
  if (sameSeat) configuration += ' · 값부값사 동궁으로 신호가 뚜렷';
  const mixed = evidence.length > 0 && counterEvidence.length > 0;

  // Qimen Consultation Judge V1 — surfaced the SAME way Myungri's/Ziwei's own consultation judges are:
  // as ADDITIONAL evidence, never touching `stance`/`dominantConclusion` above (those stay the R1-R5
  // structural judge's own, unmodified authority).
  const cj = input.consultationJudgment;
  const factGroupsUsed = ['값사문', '값부 구성', '팔신', '값사·값부 착궁', '천반·지반'];
  if (cj) factGroupsUsed.push(`상담판정(${cj.domain})`);

  return {
    discipline: 'QIMEN',
    applicable: true,
    dataReliability: 'EXACT',
    questionDomain: 'TIMING',
    temporalScope: 'PRESENT_MOMENT',
    stance,
    dominantConclusion,
    dominantFactor: `값사 ${dutyDoor}${starCls ? ` · 값부 ${board.zhifu}` : ''}${dutyPalace?.god ? ` · ${dutyPalace.god}` : ''}`,
    directEvidence: [...evidence, ...(cj?.supportingEvidence ?? [])],
    counterEvidence: [...counterEvidence, ...(cj?.counterEvidence ?? [])],
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
    factGroupsUsed,
  };
}
