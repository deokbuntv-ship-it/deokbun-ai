// DIVINATION_ENGINE_V1 — QIMEN (기문둔갑) INDEPENDENT JUDGE (§7).
//
// AUDIT FINDING THIS FIXES. The Qimen board is fully computed (值符/值使 + their palaces, 9 palaces with
// 八門/九星/八神) but contributed EXACTLY ZERO bits to the deterministic decision: it set no timing anchors,
// no polarity, and appeared only as prose the model was merely *permitted* to mention. That is §24's
// forbidden "name the discipline, ignore the discipline".
//
// APPLICABILITY IS NOT AUTOMATIC (§7). Qimen answers "지금 움직여도 되는가" — a PRESENT-MOMENT tactical
// question read from the question instant, never from the birth chart. It stays NOT_APPLICABLE for natal /
// personality / long-horizon questions, and it is never used as an automatic tie-breaker: its authority is
// scoped to the present moment, which the cross judge weighs by question type.
//
// INTERPRETATION RULE USED (core, textbook 기문둔갑 — new to THIS repository, so declared explicitly and
// reviewably rather than hidden):
//   R1. 八門吉凶: 開門·休門·生門 = 三吉門(길), 死門·驚門·傷門 = 흉문, 杜門·景門 = 중평.
//   R2. 값사(值使門) is the door governing THE MATTER ASKED. Its auspiciousness is the primary read for
//       "acting now"; 값부(值符) star is reported as supporting context.
// NOTHING ELSE is inferred. In particular the engine drops 方位 (direction) entirely, so this judge NEVER
// produces a directional/compass recommendation — an audit-confirmed gap, honestly not claimed.
import type { QimenBoard } from '@/features/qimen/domain/qimenTypes';

import {
  type DivinationJudgment,
  type JudgmentDomain,
  type JudgmentEvidence,
  type Stance,
} from './contracts';

// ── R1: 八門 auspiciousness ───────────────────────────────────────────────────────────────────────
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

export function doorClass(door: string | undefined): DoorClass | null {
  if (!door) return null;
  const key = Object.keys(DOOR_CLASS).find((d) => door.includes(d));
  return key ? DOOR_CLASS[key] : null;
}
function doorMeaning(door: string): string {
  const key = Object.keys(DOOR_MEANING).find((d) => door.includes(d));
  return key ? DOOR_MEANING[key] : '기록된 문';
}

export type QimenJudgeInput = {
  question: string;
  questionDomain: JudgmentDomain;
  board: QimenBoard | null;
  /** The engine's own availability. 'not_applicable' = the shipped timing classifier said this is not a Qimen question. */
  availability: 'available' | 'not_applicable' | 'missing_question_time' | 'unsupported_case' | 'calculation_failed';
};

function inapplicable(reason: string, domain: JudgmentDomain): DivinationJudgment {
  return {
    discipline: 'QIMEN',
    applicable: false,
    applicabilityReason: reason,
    dataReliability: 'UNUSABLE',
    questionDomain: domain,
    temporalScope: 'PRESENT_MOMENT',
    stance: 'NOT_APPLICABLE',
    dominantConclusion: '이 질문은 기문둔갑으로 볼 성질의 질문이 아닙니다.',
    dominantFactor: reason,
    directEvidence: [],
    counterEvidence: [],
    internalContradictions: [],
    timingSignals: [],
    domainSubJudgments: [],
    confidence: 'LOW',
    questionDirectness: 'GENERAL',
  };
}

/**
 * Judge "is NOW the moment" from the Qimen board alone. Scope is strictly PRESENT_MOMENT — this judge never
 * speaks to natal structure and never claims a future date. Decisive: the 값사문 class sets the direction.
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
  const dutyDoor = board.zhishi; // 값사 — the door governing the matter
  const cls = doorClass(dutyDoor);
  const dutyPalace = board.palaces.find((p) => p.palaceLabel.includes(board.zhishiPalace)) ?? null;
  const god = dutyPalace?.god ?? '';
  const star = board.zhifu;

  if (!cls) {
    return inapplicable('질문 시점의 값사문을 판별할 수 없습니다.', asked);
  }

  const doorEvidence: JudgmentEvidence = {
    fact: `값사 ${dutyDoor} (${board.zhishiPalace}궁)`,
    meaning: `지금 이 일을 이끄는 자리는 ${doorMeaning(dutyDoor)}입니다.`,
    domain: 'TIMING',
    temporalScope: 'PRESENT_MOMENT',
    directness: 'DIRECT',
  };
  const contextEvidence: JudgmentEvidence = {
    fact: `값부 ${star}${god ? ` · ${god}` : ''}`,
    meaning: '지금 판의 주도적인 기운입니다.',
    domain: 'TIMING',
    temporalScope: 'PRESENT_MOMENT',
    directness: 'ADJACENT',
  };

  let stance: Stance;
  let dominantConclusion: string;
  if (cls === 'AUSPICIOUS') {
    stance = 'FOR';
    dominantConclusion = '지금 시점으로만 보면 움직여도 되는 판입니다.';
  } else if (cls === 'INAUSPICIOUS') {
    stance = 'AGAINST_FOR_NOW';
    dominantConclusion = '지금 이 시점에 밀어붙이는 것은 좋지 않습니다. 시점을 미루는 쪽으로 봅니다.';
  } else {
    stance = 'CONDITIONAL_FOR';
    dominantConclusion = '지금 판은 크게 열리지도 막히지도 않아, 조용히 진행하는 정도가 알맞습니다.';
  }

  return {
    discipline: 'QIMEN',
    applicable: true,
    dataReliability: 'EXACT', // the board is built from the SERVER question instant
    questionDomain: asked,
    temporalScope: 'PRESENT_MOMENT',
    stance,
    dominantConclusion,
    dominantFactor: `값사 ${dutyDoor}`,
    directEvidence: cls === 'AUSPICIOUS' ? [doorEvidence, contextEvidence] : [contextEvidence],
    counterEvidence: cls === 'INAUSPICIOUS' ? [doorEvidence] : [],
    internalContradictions: [],
    timingSignals: [doorEvidence],
    domainSubJudgments: [
      {
        domain: 'TIMING',
        stance,
        conclusion:
          cls === 'INAUSPICIOUS'
            ? '지금 당장의 시점은 아닙니다.'
            : cls === 'AUSPICIOUS'
              ? '지금 움직이는 것 자체는 무리가 없습니다.'
              : '지금은 크게 벌이지 않는 선에서 진행할 만합니다.',
      },
    ],
    confidence: 'MEDIUM', // present-moment only; deliberately never outranks structure by itself
    questionDirectness: 'DIRECT',
  };
}
