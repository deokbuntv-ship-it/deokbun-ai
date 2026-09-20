// 저장된 운세가 **어느 출생정보로 만든 것인지** 를 나타내는 지문 (GAP-04 · 2026-09-21).
//
// 무엇이 틀렸나
//   `daily_fortunes` · `monthly_fortunes` 는 (사용자 · 대상 · 날짜 · 등급 · 판)으로만 저장됐다. 출생정보를
//   고쳐도 그 날짜의 저장본이 그대로 남아 **옛 명식으로 만든 운세**가 계속 보였다. 대상을 수정할 때 저장본을
//   지우는 곳도 없었다(`consultationSubjectService`).
//
// 고치는 방법 (CTO 판정 ⓐ)
//   저장 열쇠(`semantic_version`)에 출생정보 지문을 붙인다. 출생정보가 달라지면 열쇠가 달라져 **캐시가
//   자동으로 빗나가고** 새로 만든다. 지우기를 빠뜨려서 틀린 결과가 나오는 길이 아예 없어진다.
//   ⓑ(수정할 때 지우기)를 고르지 않은 이유: 지우는 곳을 하나라도 빠뜨리면 그대로 틀린 결과가 나온다.
//
// ⚠ 계산 교리는 건드리지 않는다. 이것은 **저장 열쇠**일 뿐이고 명식 계산에 들어가지 않는다.
// ⚠ 서버(Edge)와 앱이 **같은 값**을 만들어야 한다. 한쪽만 바뀌면 캐시가 영원히 빗나가 매번 새로 만든다
//   (비용이 샌다). 그래서 이 함수 하나를 양쪽이 함께 쓴다.
import type { BirthInfoDraft } from '@/features/consultation';

/** 열쇠에 넣기 안전하게 — 소문자·숫자·하이픈만 남긴다(빈 값은 `_`). */
function part(value: unknown): string {
  const s = String(value ?? '').trim().toLowerCase();
  const cleaned = s.replace(/[^a-z0-9-]/g, '');
  return cleaned.length > 0 ? cleaned : '_';
}

/**
 * 명식이 달라지는 칸만 넣는다.
 *
 * ⚠ 출생지(`birthPlace`)와 표시 이름(`displayName`)은 **넣지 않는다.** V1 은 언제나 한국 시간으로
 *   계산하므로 장소를 바꿔도 명식이 같고(`birthInputMapper`), 이름은 계산과 무관하다. 넣으면 이름만
 *   고쳐도 50덕짜리 계산을 다시 하게 된다.
 */
export function birthFingerprint(birth: Pick<BirthInfoDraft,
  'gender' | 'calendarType' | 'lunarMonthType' | 'birthYear' | 'birthMonth' | 'birthDay'
  | 'birthTimeAccuracy' | 'birthHour' | 'birthMinute' | 'approximateTimePeriod'> | null | undefined): string {
  const b = birth ?? null;
  return [
    part(b?.birthYear), part(b?.birthMonth), part(b?.birthDay),
    part(b?.calendarType), part(b?.lunarMonthType),
    part(b?.birthTimeAccuracy), part(b?.birthHour), part(b?.birthMinute), part(b?.approximateTimePeriod),
    part(b?.gender),
  ].join('-');
}

/**
 * 저장 열쇠 = 판 번호 + 출생정보 지문.
 *
 * 판 번호로 시작하므로 `like '판번호%'` 로 **그 사람의 지난 운세 전체**(옛 출생정보로 만든 것 포함)를
 * 여전히 목록으로 볼 수 있다 — 우편함은 역사를 지우지 않는다.
 */
export function canonicalFortuneVersion(
  baseVersion: string,
  birth: Parameters<typeof birthFingerprint>[0],
): string {
  return `${baseVersion}#${birthFingerprint(birth)}`;
}

/**
 * 목록 · 최근 조회에서 쓰는 검색 모양(판 번호로 시작하는 것 전부).
 *
 * ⚠ 지문이 붙기 **전에** 저장된 행(`판번호` 만 있는 행)도 같이 잡아야 한다 — 우편함에서 지난 운세가
 *   사라지면 안 된다. 그래서 `#` 를 붙이지 않고 판 번호로 시작하는 것을 모두 본다.
 */
export function canonicalFortuneVersionLike(baseVersion: string): string {
  return `${baseVersion}%`;
}
