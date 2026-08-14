import { Link, usePathname, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/Text';
import { useAuth } from '@/features/auth';

import { adminTheme } from '../adminTheme';

// Admin sidebar (Stitch §8) — deep-navy, fixed 260px. Exactly the 7 operational
// sections + 도움말 / 로그아웃. Active state uses the teal-tint highlight. Legacy
// admin routes (famous/content/publications) are NOT deleted — they remain
// reachable by URL — but are intentionally not shown in the FINAL nav (§8/§12).
type NavHref =
  | '/admin'
  | '/admin/users'
  | '/admin/consultations'
  | '/admin/consultation-intelligence'
  | '/admin/fortune-mail'
  | '/admin/ai-usage'
  | '/admin/engine-status'
  | '/admin/system-settings';

const NAV_ITEMS: { label: string; href: NavHref }[] = [
  { label: '대시보드', href: '/admin' },
  { label: '사용자 관리', href: '/admin/users' },
  { label: '상담 관리', href: '/admin/consultations' },
  { label: '상담 인텔리전스', href: '/admin/consultation-intelligence' },
  { label: '운세우편 관리', href: '/admin/fortune-mail' },
  { label: 'AI 사용량 · 비용', href: '/admin/ai-usage' },
  { label: '해석엔진 상태', href: '/admin/engine-status' },
  { label: '시스템 설정', href: '/admin/system-settings' },
];

function isActive(pathname: string, href: string): boolean {
  return href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
}

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  return (
    <View style={{ width: 260, backgroundColor: adminTheme.sidebarBg, paddingVertical: 24, paddingHorizontal: 16, justifyContent: 'space-between' }}>
      <View style={{ gap: 24 }}>
        {/* Brand */}
        <View style={{ paddingHorizontal: 8, gap: 2 }}>
          <Text variant="headingMedium" style={{ color: adminTheme.sidebarBrand, fontWeight: '700' }}>
            덕분AI
          </Text>
          <Text variant="bodySmall" style={{ color: adminTheme.sidebarBrandSub }}>
            관리자 콘솔
          </Text>
        </View>

        {/* Nav */}
        <View style={{ gap: 4 }}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link key={item.href} href={item.href} asChild>
                <Pressable
                  accessibilityRole="link"
                  accessibilityState={{ selected: active }}
                  style={{
                    paddingVertical: 11,
                    paddingHorizontal: 12,
                    borderRadius: 6,
                    backgroundColor: active ? adminTheme.sidebarActiveBg : 'transparent',
                  }}
                >
                  <Text
                    variant="bodyMedium"
                    style={{
                      color: active ? adminTheme.sidebarActiveText : adminTheme.sidebarText,
                      fontWeight: active ? '700' : '500',
                    }}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              </Link>
            );
          })}
        </View>
      </View>

      {/* Footer */}
      <View style={{ gap: 4, borderTopWidth: 1, borderTopColor: adminTheme.sidebarBorder, paddingTop: 16 }}>
        <View style={{ paddingVertical: 11, paddingHorizontal: 12 }}>
          <Text variant="bodyMedium" style={{ color: adminTheme.sidebarText, fontWeight: '500' }}>
            도움말
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void signOut();
            router.replace('/login');
          }}
          style={{ paddingVertical: 11, paddingHorizontal: 12 }}
        >
          <Text variant="bodyMedium" style={{ color: adminTheme.sidebarText, fontWeight: '500' }}>
            로그아웃
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
