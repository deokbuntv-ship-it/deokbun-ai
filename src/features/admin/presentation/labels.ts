// 관리자 화면 — 한국어 라벨 맵.
//
// WHY. 2026-09-06 전수 조사에서 관리자 화면에 **원문 enum 이 그대로 찍히는 곳**이 하나 남아 있었다:
// `system-settings` 의 사용률 줄이 `NORMAL` · `WATCH_50` · `WARNING_80` · `CRITICAL_95` 를 영문
// 대문자로 보여 줬다. 오너는 비개발자다. `WATCH_50` 을 보고 "50이 무슨 뜻인지" 를 알 방법이 없다.
//
// ⚠ 새 방식을 만들지 않는다. `src/features/intelligence/presentation/labels.ts` 가 이미
//   `Readonly<Record<값, 한국어>>` 로 같은 일을 한다. 그 패턴을 그대로 쓴다 — 값을 **단어로
//   바꾸기만** 하고 아무것도 계산하지 않는다.
//
// ⚠ 숫자가 든 값은 그 숫자의 뜻이 드러나게 적는다. `WATCH_50` → "주의(50% 초과)".
//   비율 자체는 옆에 이미 찍히므로, 라벨은 **그 숫자가 어느 문턱을 넘었다는 뜻인지**를 말한다.
import type { GenerationWarningLevel } from '../services/globalGenerationGuardService';

export const GUARD_WARNING_LABELS: Readonly<Record<GenerationWarningLevel, string>> = {
  NORMAL: '정상',
  WATCH_50: '주의(한도 50% 초과)',
  WARNING_80: '경고(한도 80% 초과)',
  CRITICAL_95: '위험(한도 95% 초과)',
};

/**
 * 매핑에 없는 값이 오면 **원문을 그대로** 돌려준다.
 *
 * ⚠ 조용히 빈 문자열이 되게 두지 않는다. 빈 칸은 "값이 없다" 로 읽히지만 실제로는 "우리가 모르는
 * 새 값이 생겼다" 는 뜻이다. 원문이라도 보이면 그 사실이 사람 눈에 띄고, 라벨을 추가할 계기가 된다.
 * (지금은 서비스 층이 모르는 값을 'NORMAL' 로 좁히므로 여기까지 오기 어렵다 — 그래도 둔다.)
 */
export function guardWarningLabel(level: string): string {
  return (GUARD_WARNING_LABELS as Readonly<Record<string, string>>)[level] ?? level;
}
