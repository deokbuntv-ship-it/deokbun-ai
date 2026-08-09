import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';

import type { AdminAuthorizationStatus } from '../types';

// Every non-admin state renders here (never the admin shell). Messages are
// product-facing only — no DB enum / stack trace / technical detail is exposed.
export type AdminGateVariant =
  | Exclude<AdminAuthorizationStatus, 'admin'>
  | 'native-blocked';

const MESSAGE: Record<AdminGateVariant, string> = {
  loading: '관리자 권한을 확인하는 중입니다...',
  unauthenticated: '관리자 페이지를 이용하려면 로그인이 필요합니다.',
  not_admin: '관리자 권한이 없습니다.',
  unavailable:
    '관리자 권한 확인을 완료할 수 없습니다. 잠시 후 다시 시도해 주세요.',
  'native-blocked': '관리자 페이지는 웹에서만 이용할 수 있습니다.',
};

export function AdminGate({
  variant,
  onLeave,
  onLogin,
}: {
  variant: AdminGateVariant;
  onLeave: () => void;
  onLogin?: () => void;
}) {
  return (
    <Screen>
      <Stack
        style={{ flex: 1, paddingTop: 24 }}
        align="center"
        justify="center"
        gap="md"
      >
        <Card>
          <Text variant="bodyMedium" colorToken="textSecondary">
            {MESSAGE[variant]}
          </Text>
        </Card>

        {variant === 'unauthenticated' && onLogin ? (
          <Button label="로그인" onPress={onLogin} />
        ) : null}

        {variant !== 'loading' ? (
          <Button label="앱으로 돌아가기" variant="secondary" onPress={onLeave} />
        ) : null}
      </Stack>
    </Screen>
  );
}
