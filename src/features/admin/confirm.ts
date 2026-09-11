import { Alert, Platform } from 'react-native';

// Cross-platform destructive-action confirmation. Web uses window.confirm; native
// uses Alert.alert. Resolves true only if the operator confirms.
//
// ⚠ 언제 이것을 쓰고 언제 `AdminConfirmDialog` 를 쓰나 (2026-09-06).
//   이것은 **한 줄짜리 물음**이다. window.confirm 은 서식을 못 담고, 기본 초점이 "확인" 에 간다.
//   되돌릴 수 없고 영향 범위가 넓은 동작 — 킬 스위치·메일 발송·유명인 발행 — 에는 부족하다.
//   그런 자리에는 `features/admin/components/AdminConfirmDialog` 를 쓴다:
//   **하는 일 · 영향 범위 · 되돌리기** 셋을 필수로 받고, 취소가 먼저·중립이며, 렌더 테스트로
//   문구를 검증할 수 있다. 보관·삭제처럼 되돌릴 여지가 있고 범위가 한 건인 동작은 이대로 둔다.
export function confirmDestructive(message: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(
      typeof window !== 'undefined' && typeof window.confirm === 'function'
        ? window.confirm(message)
        : true,
    );
  }
  return new Promise((resolve) => {
    Alert.alert('확인', message, [
      { text: '취소', style: 'cancel', onPress: () => resolve(false) },
      { text: '확인', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}
