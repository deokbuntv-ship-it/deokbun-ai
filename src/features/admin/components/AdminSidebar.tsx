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
  | '/admin/support'
  | '/admin/popular-questions'
  | '/admin/retention'
  | '/admin/ads'
  | '/admin/fortune-mail'
  | '/admin/economy'
  | '/admin/ai-usage'
  | '/admin/engine-status'
  | '/admin/system-settings';

const NAV_ITEMS: { label: string; href: NavHref }[] = [
  { label: '대시보드', href: '/admin' },
  { label: '사용자 관리', href: '/admin/users' },
  { label: '상담 관리', href: '/admin/consultations' },
  // ⚠ 2026-09-06 메뉴에서 감춤 — **화면 파일은 남겨 둔다.**
  //   이 화면은 `admin_list_intelligence_runs` · `admin_get_intelligence_run` 을 부르는데,
  //   그 둘은 `docs/CONSULTATION_INTELLIGENCE_DB.sql` 에만 있고 staging·production 어디에도
  //   승격되지 않았다. 시임(`isConnected()`)이 있어 크래시는 안 나지만, 오너에게는 **열면 늘
  //   비어 있는 메뉴**로 보인다. 파이프라인이 생기면 이 줄의 주석만 풀면 되살아난다.
  //   (미승격 사유는 `FEATURE_MASTER_CHECKLIST` §스키마 표 참조 — "쓰는 코드가 없어서" 가 아니라
  //    "파이프라인이 없어서" 다. 화면과 서비스는 이미 있다.)
  // { label: '상담 인텔리전스', href: '/admin/consultation-intelligence' },
  { label: '고객문의', href: '/admin/support' },
  { label: '홈 인기질문', href: '/admin/popular-questions' },
  { label: '리텐션 · 알림', href: '/admin/retention' },
  { label: '광고', href: '/admin/ads' },
  { label: '운세우편 관리', href: '/admin/fortune-mail' },
  { label: '덕 경제', href: '/admin/economy' },
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
                  aria-selected={active}
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
