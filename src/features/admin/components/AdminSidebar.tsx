import { View } from 'react-native';

import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

import type { AdminNavKey } from '../types';

// Web-only admin sidebar. Nav items for unimplemented sections are shown as
// "준비 중" and are intentionally NON-interactive in ADMIN-01 (no routes exist
// yet) — clicking must never navigate to a non-existent route. No fake data.
const NAV_ITEMS: { key: AdminNavKey; label: string; available: boolean }[] = [
  { key: 'dashboard', label: '대시보드', available: true },
  { key: 'users', label: '사용자', available: false },
  { key: 'subjects', label: '상담 대상', available: false },
  { key: 'consultations', label: '상담', available: false },
  { key: 'ai-usage', label: 'AI 사용량', available: false },
  { key: 'famous', label: '유명인', available: false },
  { key: 'content', label: '콘텐츠', available: false },
];

export function AdminSidebar({
  activeKey = 'dashboard',
}: {
  activeKey?: AdminNavKey;
}) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  return (
    <View
      style={{
        width: 220,
        borderRightWidth: 1,
        borderRightColor: theme.border,
        backgroundColor: theme.surface,
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.md,
      }}
    >
      <Stack gap="lg">
        <Text variant="headingMedium">덕분AI 관리자</Text>

        <Stack gap="xs">
          {NAV_ITEMS.map((item) => {
            const isActive = item.available && item.key === activeKey;
            return (
              <View
                key={item.key}
                style={{
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.md,
                  borderRadius: radius.md,
                  backgroundColor: isActive
                    ? theme.backgroundSelected
                    : 'transparent',
                }}
              >
                <Stack direction="row" gap="xs" align="center">
                  <Text
                    variant="bodyMedium"
                    colorToken={item.available ? 'textPrimary' : 'textSecondary'}
                  >
                    {item.label}
                  </Text>
                  {!item.available ? (
                    <Text variant="caption" colorToken="textSecondary">
                      · 준비 중
                    </Text>
                  ) : null}
                </Stack>
              </View>
            );
          })}
        </Stack>
      </Stack>
    </View>
  );
}
