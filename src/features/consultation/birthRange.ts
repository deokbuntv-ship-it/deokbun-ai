// 지원하는 출생 연도와 **사실만 적은 안내 문구** (2026-09-21).
//
// 무엇이 문제였나 (2026-09-18 로컬 실측)
//   V1 의 절기 · 대운 자료는 1970-01-01 ~ 2050-12-31 만 덮는다(`docs/ENGINE_12_SOLAR_TERM_DAEWOON_V1.md:58`).
//   그 밖의 해에 태어나면 네 기능이 **서로 다르게** 막히고, 그중 셋은 **틀린 까닭**을 보여 줬다:
//     · 상담     → 사주 없이 자미두수 · 기문둔갑으로 답한다 (아무 안내 없음)
//     · 궁합     → "태어난 시각을 확인해 주시면" (시각을 넣어도 안 된다)
//     · 프리미엄 → "절기가 바뀌는 날과 겹치면 … 정확한 시각을 입력해 주시면" (틀린 까닭)
//     · 오늘/이달 → "시간을 알 수 없는 경우 …" (틀린 까닭)
//
// 톤 규칙 (CTO 2026-09-18): **사실만** 적는다. "정확도가 떨어진다" 같은 말은 쓰지 않는다.
export const SUPPORTED_BIRTH_YEAR_MIN = 1970;
export const SUPPORTED_BIRTH_YEAR_MAX = 2050;

/** 생년이 지원 범위 밖인가. 숫자로 읽을 수 없으면 **범위 밖으로 보지 않는다**(그건 다른 문제다). */
export function isBirthYearOutOfRange(birthYear: string | number | null | undefined): boolean {
  const year = typeof birthYear === 'number' ? birthYear : Number(String(birthYear ?? '').trim());
  if (!Number.isFinite(year) || year === 0) return false;
  return year < SUPPORTED_BIRTH_YEAR_MIN || year > SUPPORTED_BIRTH_YEAR_MAX;
}

/** 입력 화면에서 쓰는 한 줄. 막지 않고 사실만 알려 준다. */
export const BIRTH_RANGE_NOTICE =
  `덕분이는 ${SUPPORTED_BIRTH_YEAR_MIN}년부터 ${SUPPORTED_BIRTH_YEAR_MAX}년 사이에 태어난 분의 사주를 계산해요.`;

/** 기능이 막혔을 때 쓰는 문구 — 왜 안 되는지 + 덕이 빠지지 않았다는 사실. */
export function birthRangeBlockedMessage(what: string): string {
  return `${BIRTH_RANGE_NOTICE}\n그래서 ${what}는 만들 수 없어요. 덕은 차감되지 않았어요.`;
}

/**
 * 해외 출생 안내 — 막지 않는다. **사실만** 말한다 (CTO 2026-09-18).
 *
 * V1 은 장소를 계산에 쓰지 않고 언제나 한국 시간으로 계산한다(`birthInputMapper.ts`). 그 사실을 그대로
 * 적는다. "정확도" 라는 말은 쓰지 않는다.
 */
export const OVERSEAS_BIRTH_NOTICE = '입력하신 날짜와 시각은 한국 시간 기준으로 계산해요.';

/** 태어난 곳 — 계산에는 쓰지 않고 안내를 고르는 데만 쓴다. */
export type BirthCountry = 'KR' | 'OVERSEAS';
export const BIRTH_COUNTRY_LABEL: Readonly<Record<BirthCountry, string>> = {
  KR: '대한민국',
  OVERSEAS: '해외',
};
