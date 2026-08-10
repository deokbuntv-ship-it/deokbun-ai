import { Alert, Platform } from 'react-native';

// Cross-platform destructive-action confirmation. Web uses window.confirm; native
// uses Alert.alert. Resolves true only if the operator confirms.
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
