// 오늘의 운세 — 실물 길이의 레코드. 짧은 더미로는 360dp 넘침도 줄바꿈도 볼 수 없다.
import type { DailyFortuneRecord } from '@/features/today';

export const TODAY_RECORD: DailyFortuneRecord = {
  id: 'df-1',
  fortuneDate: '2026-09-06',
  timezone: 'Asia/Seoul',
  overallTone: '좋은 흐름',
  evidenceVersion: 'today-evidence@1.2.0',
  policyVersion: 'today@1.1.0',
  model: 'test',
  createdAt: '2026-09-06T00:00:00.000Z',
  updatedAt: '2026-09-06T00:00:00.000Z',
  result: {
    headline: '오늘은 벌이기보다 매듭을 짓는 편이 이득인 날이에요',
    verdict: '미뤄 둔 일을 하나 끝내면 나머지가 따라옵니다. 새로 시작하는 것은 내일로 넘기세요.',
    overallSummary:
      '전체적으로 무리하지 않으면 흐름이 나쁘지 않습니다. 오전에는 사람 만나는 일이 잘 풀리고, '
      + '오후로 갈수록 혼자 정리하는 일이 잘 됩니다. 급한 결정을 요구받아도 오늘 안에 답하지 않아도 됩니다.',
    overallTone: '좋은 흐름',
    primaryMode: 'ADJUST',
    primaryModeLabel: '정리하기',
    domainSignals: [
      { domain: 'work', status: '좋음' },
      { domain: 'wealth', status: '주의' },
    ],
    highlights: [
      { domain: 'work', title: '미뤄 둔 일이 풀립니다', body: '오래 붙들고 있던 건을 오늘 닫으면 뒤가 편해집니다.' },
      { domain: 'relationship', title: '먼저 연락하기 좋은 날', body: '망설이던 연락은 오전에 하는 편이 낫습니다.' },
    ],
    cautions: [
      { title: '즉답을 피하세요', body: '오늘 답을 달라는 요구가 있어도 하루 시간을 두는 편이 안전합니다.' },
    ],
    actionTip: '오늘 끝낼 수 있는 일 하나를 정하고 그것만 끝내세요.',
    followUps: [
      { displayLabel: '이직 시기', question: '올해 안에 직장을 옮기는 것이 저에게 맞을까요?' },
      { displayLabel: '금전 흐름', question: '지금 큰 지출을 해도 괜찮은 시기인가요?' },
    ],
    evidence: ['오늘 일진이 일간을 돕는 자리에 있습니다.', '이번 달 흐름은 확장보다 정리 쪽으로 기울어 있습니다.'],
    backgroundSummary: '올해 전체로는 자리를 지키는 흐름 안에 있습니다.',
  },
};

/**
 * 본인 대상자. `birthInfo` 는 `BirthInfoDraft` 형태 그대로다 — today.tsx 가 이 값을
 * `isSolarTermBoundaryTimeRequired` 에 그대로 넘기므로 모양이 맞아야 분기가 재현된다.
 */
export const SELF_SUBJECT = {
  id: "subj-self",
  isSelf: true,
  displayName: "나",
  relationship: "self",
  birthInfo: {
    displayName: "나", gender: "female", calendarType: "solar", lunarMonthType: null,
    birthYear: "1994", birthMonth: "5", birthDay: "20",
    birthTimeAccuracy: "exact", birthHour: "9", birthMinute: "30",
    approximateTimePeriod: null, birthPlace: "서울",
  },
};

/**
 * 절기 경계일 계정. 1996-10-08 은 한로가 그 날에 드는 날이고(기존
 * `birthBoundaryGate.test.ts` 가 쓰는 값), 시각이 unknown 이라 원국을 세울 수 없다.
 */
export const BOUNDARY_SUBJECT = {
  ...SELF_SUBJECT,
  id: "subj-boundary",
  birthInfo: {
    ...SELF_SUBJECT.birthInfo,
    birthYear: "1996", birthMonth: "10", birthDay: "8",
    birthTimeAccuracy: "unknown", birthHour: "", birthMinute: "",
  },
};
