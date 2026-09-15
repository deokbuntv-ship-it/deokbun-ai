// FINAL DIVINATION CONSULTATION QA V1 — fixtures. NOT a jest test file (no `.test.ts` suffix on this one),
// lives outside `src/` so it is never picked up by a bare `npx jest` (jest.config.js roots = <rootDir>/src).
// 10 diverse birth profiles + 100 user-style QA cases (95 single-turn + 5 five-turn follow-up chains).
import type { BirthInfoDraft } from '@/features/consultation';

export type QaProfile = { id: string; label: string; birth: BirthInfoDraft };

// Spread across gender, decade, season, and day/night birth hour — day/night hour drives different
// Ziwei 命宮/身宮 placements; decade spread drives different active 대운/세운 pressure; no doctrine-specific
// hunting, just broad natural variety per the brief's own instruction (§4).
export const QA_PROFILES: QaProfile[] = [
  { id: 'P1', label: '남성 1990-08 오후', birth: bi('테스트1', 'male', '1990', '8', '15', '14', '0') },
  { id: 'P2', label: '여성 1985-02 오전', birth: bi('테스트2', 'female', '1985', '2', '3', '9', '30') },
  { id: 'P3', label: '남성 1998-11 새벽', birth: bi('테스트3', 'male', '1998', '11', '20', '3', '15') },
  { id: 'P4', label: '여성 1975-06 밤', birth: bi('테스트4', 'female', '1975', '6', '1', '22', '45') },
  { id: 'P5', label: '남성 1993-01 오전', birth: bi('테스트5', 'male', '1993', '1', '10', '11', '0') },
  { id: 'P6', label: '남성 1988-09 오후', birth: bi('테스트6', 'male', '1988', '9', '20', '14', '0') },
  { id: 'P7', label: '여성 1965-06 오후', birth: bi('테스트7', 'female', '1965', '6', '15', '15', '30') },
  { id: 'P8', label: '여성 2000-04 아침', birth: bi('테스트8', 'female', '2000', '4', '5', '7', '20') },
  { id: 'P9', label: '남성 1979-12 저녁', birth: bi('테스트9', 'male', '1979', '12', '25', '19', '10') },
  { id: 'P10', label: '여성 1992-07 새벽', birth: bi('테스트10', 'female', '1992', '7', '7', '5', '50') },
];

function bi(name: string, gender: 'male' | 'female', y: string, m: string, d: string, h: string, min: string): BirthInfoDraft {
  return {
    displayName: name, gender, calendarType: 'solar', lunarMonthType: null,
    birthYear: y, birthMonth: m, birthDay: d,
    birthTimeAccuracy: 'exact', birthHour: h, birthMinute: min,
    approximateTimePeriod: null, birthPlace: '서울',
  };
}

export type QaDomain = 'BUSINESS' | 'MONEY' | 'CAREER' | 'LOVE' | 'REUNION' | 'CHANGE' | 'TIMING' | 'FOLLOWUP';

export type QaCase = { caseId: string; domain: QaDomain; profileId: string; question: string };
export type QaChain = { chainId: string; domain: QaDomain; profileId: string; turns: string[] };

const BUSINESS_Q = [
  '지금 이 사업 시작해도 될까?',
  '내 사주상 사업 체질이 있는 편이야?',
  '지금 확장하는 게 맞아, 유지하는 게 맞아?',
  '올해 매출을 크게 키우는 흐름이 있어?',
  '동업보다 혼자 하는 게 나아?',
  '지금 사업을 접는 게 나을까?',
  '온라인 사업을 새로 벌여도 괜찮을까?',
  '사업 규모를 줄이는 게 맞는 시기일까?',
  '지금 투자자를 받는 게 좋을까?',
  '프랜차이즈를 시작해도 괜찮을까?',
  '지금 사업을 잠깐 쉬어야 할까?',
  '내가 대표 자리에 어울리는 사람일까?',
  '지금 이 아이템으로 창업해도 될까?',
  '사업 파트너를 바꾸는 게 맞을까?',
  '올해 안에 법인을 새로 세워도 될까?',
  '지금 사업을 다각화하는 게 맞을까?',
  '이 시점에 오프라인 매장을 내도 괜찮을까?',
  '사업이 자꾸 삐걱대는데 구조적인 문제일까?',
  '지금 사업 방향을 완전히 틀어도 될까?',
  '앞으로 몇 년간 사업 운은 어떤 흐름이야?',
];

const MONEY_Q = [
  '돈은 들어오는데 왜 잘 안 모이지?',
  '올해 재물 흐름은 좋은 편이야?',
  '투자보다 본업 확대가 나아?',
  '큰돈이 들어오는 구조가 있어?',
  '지금 주식 투자를 시작해도 될까?',
  '부동산 매매를 지금 해도 괜찮을까?',
  '돈이 자꾸 빠져나가는 이유가 뭘까?',
  '올해 목돈을 만질 수 있는 시기가 있을까?',
  '지금 대출을 받아서 투자해도 될까?',
  '재물운이 약한 편인데 방법이 있을까?',
  '지금 저축을 늘리는 게 맞을까, 투자를 하는 게 맞을까?',
  '돈 관련해서 조심해야 할 시기가 있을까?',
  '평생 돈 걱정 없이 살 수 있는 구조야?',
  '지금 가상자산에 투자해도 괜찮을까?',
  '올해 하반기 재물운은 어때?',
];

const CAREER_Q = [
  '이직하는 게 맞아?',
  '회사원보다 독립이 더 맞아?',
  '지금 직장에서 버티는 게 나아?',
  '승진운이 있는 시기야?',
  '지금 다니는 회사가 나랑 안 맞는 걸까?',
  '프리랜서로 전향해도 괜찮을까?',
  '공무원 시험을 준비해도 될까?',
  '지금 이직 준비를 시작해도 될까?',
  '상사와 계속 갈등이 있는데 구조적인 이유가 있을까?',
  '지금 퇴사하는 게 맞는 시기일까?',
  '나한테 맞는 직업 방향이 따로 있을까?',
  '지금 부서 이동을 신청해도 괜찮을까?',
  '앞으로 몇 년간 직업운은 어떻게 흘러가?',
  '지금 창업보다 취업이 나을까?',
  '이번에 지원한 자리에 합격할 수 있을까?',
];

const LOVE_Q = [
  '결혼운이 강한 편이야?',
  '지금 만나는 사람과 오래 갈 가능성이 있어?',
  '연애할 때 내가 반복하는 패턴이 뭐야?',
  '올해 새로운 인연을 만날 수 있을까?',
  '지금 이 사람과 결혼해도 괜찮을까?',
  '연애가 잘 안 풀리는 이유가 사주에 있을까?',
  '지금 만나는 사람과 헤어지는 게 나을까?',
  '나는 어떤 스타일의 사람과 잘 맞아?',
  '올해 안에 결혼할 수 있는 흐름이 있을까?',
  '지금 짝사랑하는 사람에게 고백해도 될까?',
  '내가 연애에서 자꾸 상처받는 이유가 있을까?',
  '지금 소개팅을 받아도 괜찮은 시기일까?',
  '결혼 생활이 안정적으로 유지될 수 있는 구조야?',
  '올해 애정운은 전반적으로 어때?',
  '지금 이 관계를 더 진지하게 생각해도 될까?',
];

const REUNION_Q = [
  '전 연인과 다시 이어질 가능성이 있을까?',
  '연락은 올 수 있어도 다시 잘 만나기는 어려운 거야?',
  '지금 내가 먼저 연락하는 게 맞아?',
  '헤어진 사람과 다시 만나면 오래 갈 수 있을까?',
  '전 애인이 나를 다시 생각하고 있을까?',
  '재회하면 예전과 다르게 잘 지낼 수 있을까?',
  '지금 연락을 끊는 게 나을까, 기다리는 게 나을까?',
  '재회가 가능하더라도 결혼까지 갈 수 있을까?',
  '전 배우자와 다시 합칠 가능성이 있을까?',
  '지금 이 타이밍에 연락하면 반응이 있을까?',
];

const CHANGE_Q = [
  '이사하는 흐름이 있어?',
  '지금 직업을 바꾸는 게 맞아?',
  '사업 방향을 바꿔야 할 시기야?',
  '지금 사는 지역을 떠나는 게 나을까?',
  '올해 이사나 이전 계획을 잡아도 괜찮을까?',
  '지금 큰 변화를 주는 게 위험할까?',
  '해외로 이주하는 걸 고려해도 될까?',
  '지금 삶의 방향을 크게 바꿔야 하는 시기일까?',
  '변화를 미루는 게 나을까, 지금 해야 할까?',
  '지금 갑자기 일을 그만두고 싶은데 충동적인 걸까?',
];

const TIMING_Q = [
  '올해가 좋아, 내년이 좋아?',
  '지금 시작하는 게 좋아 아니면 기다리는 게 좋아?',
  '이번 달은 움직이는 달이야?',
  '지금이 중요한 결정을 내리기 좋은 시기일까?',
  '이번 분기 안에 결과를 볼 수 있을까?',
  '지금 서두르는 게 맞을까, 천천히 가는 게 맞을까?',
  '올해 안에 큰 기회가 올 수 있을까?',
  '지금 당장 움직여야 할 이유가 있을까?',
  '이번 달 안에 결정을 내려야 할까?',
  '지금이 준비하는 시기일까, 실행하는 시기일까?',
];

// §19/§36 — 5 real multi-turn chains (each ~4-5 turns), one per profile slot 1/2/3/4/5, spanning distinct
// domains so continuity is checked across BUSINESS/MONEY/LOVE/REUNION/CAREER, not just one repeated shape.
export const QA_CHAINS: QaChain[] = [
  {
    chainId: 'F1', domain: 'BUSINESS', profileId: 'P1',
    turns: ['지금 사업 시작해도 돼?', '왜 그렇게 봐?', '돈은 언제 붙어?', '지금 당장 해야 할 건 뭐야?', '반대로 제일 조심할 건?'],
  },
  {
    chainId: 'F2', domain: 'MONEY', profileId: 'P4',
    turns: ['올해 재물운 어때?', '왜 그렇게 판단한 거야?', '그럼 내년은 어때?', '지금 돈을 아껴야 할까, 써도 될까?'],
  },
  {
    chainId: 'F3', domain: 'LOVE', profileId: 'P8',
    turns: ['올해 연애운이 있을까?', '그 이유가 뭐야?', '그럼 지금 만나는 사람은 어때?', '결혼까지 갈 수 있을까?'],
  },
  {
    chainId: 'F4', domain: 'REUNION', profileId: 'P2',
    turns: ['전 연인과 다시 만날 가능성이 있을까?', '왜 그렇게 보는 거야?', '그럼 지금 내가 먼저 연락해도 될까?', '반대로 조심할 점은?'],
  },
  {
    chainId: 'F5', domain: 'CAREER', profileId: 'P6',
    turns: ['지금 이직하는 게 맞을까?', '왜 그렇게 봐?', '그럼 언제가 적기야?', '지금 당장 뭘 준비해야 해?'],
  },
];

function toCases(domain: QaDomain, questions: string[], profileOffset: number): QaCase[] {
  return questions.map((question, i) => ({
    caseId: `${domain}-${String(i + 1).padStart(2, '0')}`,
    domain,
    profileId: QA_PROFILES[(i + profileOffset) % QA_PROFILES.length].id,
    question,
  }));
}

export const QA_CASES: QaCase[] = [
  ...toCases('BUSINESS', BUSINESS_Q, 0),
  ...toCases('MONEY', MONEY_Q, 2),
  ...toCases('CAREER', CAREER_Q, 4),
  ...toCases('LOVE', LOVE_Q, 6),
  ...toCases('REUNION', REUNION_Q, 8),
  ...toCases('CHANGE', CHANGE_Q, 1),
  ...toCases('TIMING', TIMING_Q, 3),
];

// Sanity — this file IS the source of truth for the QA distribution the report cites (§2).
export const QA_DISTRIBUTION = {
  BUSINESS: BUSINESS_Q.length, MONEY: MONEY_Q.length, CAREER: CAREER_Q.length, LOVE: LOVE_Q.length,
  REUNION: REUNION_Q.length, CHANGE: CHANGE_Q.length, TIMING: TIMING_Q.length, FOLLOWUP_CHAINS: QA_CHAINS.length,
};
