import { Link, usePathname } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

// Web-only admin sidebar. Available items navigate via expo-router Link; items
// for unimplemented sections show "준비 중" and are non-interactive. Active state
// is derived from the current path. No fake data.
type NavItem = {
  label: string;
  href?:
    | '/admin'
    | '/admin/users'
    | '/admin/consultations'
    | '/admin/ai-usage'
    | '/admin/famous'
    | '/admin/content'
    | '/admin/publications';
  available: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: '대시보드', href: '/admin', available: true },
  { label: '사용자', href: '/admin/users', available: true },
  { label: '상담', href: '/admin/consultations', available: true },
  { label: 'AI 사용량', href: '/admin/ai-usage', available: true },
  { label: '유명인', href: '/admin/famous', available: true },
  { label: '콘텐츠', href: '/admin/content', available: true },
  { label: '발행 현황', href: '/admin/publications', available: true },
];

function isActive(pathname: string, href?: string): boolean {
  if (!href) {
    return false;
  }
  // Dashboard is an exact match; section roots match their subtree.
  return href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
}

export function AdminSidebar() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const pathname = usePathname();

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
            const active = isActive(pathname, item.href);
            const rowStyle = {
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md,
              borderRadius: radius.md,
              backgroundColor: active ? theme.backgroundSelected : 'transparent',
            } as const;

            const label = (
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
            );

            if (item.available && item.href) {
              return (
                <Link key={item.label} href={item.href} asChild>
                  <Pressable style={rowStyle} accessibilityRole="link">
                    {label}
                  </Pressable>
                </Link>
              );
            }

            return (
              <View key={item.label} style={rowStyle}>
                {label}
              </View>
            );
          })}
        </Stack>
      </Stack>
    </View>
  );
}
