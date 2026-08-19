import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AcquisitionBridge } from '@/features/ads/acquisition/AcquisitionBridge';
import { AuthProvider } from '@/features/auth';
import { ConsultationDraftProvider } from '@/features/consultation';
import { OnboardingGate, OnboardingProvider } from '@/features/onboarding';
import { useColorScheme } from '@/hooks/use-color-scheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <OnboardingProvider>
          <ConsultationDraftProvider>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <AnimatedSplashOverlay />
            {/* Additive, fail-closed ad-acquisition capture (Sprint 3B). Renders nothing;
                organic (no ?ad=) visitors are unaffected. */}
            <AcquisitionBridge />
            {/* Signup-first gate (§7): one centralized, fail-closed authority that keeps anonymous /
                un-onboarded users out of personalized surfaces and routes them through login → terms →
                birth profile. Public routes (login, content, famous, admin, shared-report) pass through. */}
            <OnboardingGate>
              <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="birth-info" options={{ headerShown: false }} />
            <Stack.Screen name="chat" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            {/* Signup-first onboarding steps (gate-driven): resolver → terms → birth profile. */}
            <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/terms" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/birth" options={{ headerShown: false }} />
            {/* Provider-neutral OAuth return route (web popup completion; native
                intercepts the deep link and never mounts this). */}
            <Stack.Screen name="login-callback" options={{ headerShown: false }} />
            {/* 운세우편 상세 (05) — pushed from 운세우편함; own AppHeader back. */}
            <Stack.Screen name="mail-detail" options={{ headerShown: false }} />
            {/* 상담 보고서 상세 — owner-only (RLS), redirects to login when signed out; renders the real
                consumer bottom nav via DetailBottomNav. */}
            <Stack.Screen name="report/[id]" options={{ headerShown: false }} />
            {/* 공유받은 상담 보고서 — recipient view via a share token; login-required, read-only. */}
            <Stack.Screen name="shared-report/[token]" options={{ headerShown: false }} />
            {/* 궁합 선택은 이제 (tabs)의 기본 탭 → 여기 등록하지 않음. 궁합 상담(두 사람)은 pushed screen. */}
            <Stack.Screen name="compatibility-chat" options={{ headerShown: false }} />
            {/* 분석 대상자 관리 (from MY) — subject management; own AppHeader. */}
            <Stack.Screen name="subjects" options={{ headerShown: false }} />
            {/* 대상자 상담 이력 / 만세력 (pushed from subjects); own AppHeader. */}
            <Stack.Screen name="subject-history" options={{ headerShown: false }} />
            <Stack.Screen name="subject-manse" options={{ headerShown: false }} />
            {/* Deep-link compatibility redirects. */}
            <Stack.Screen name="records" options={{ headerShown: false }} />
            <Stack.Screen name="today" options={{ headerShown: false }} />
            <Stack.Screen name="monthly" options={{ headerShown: false }} />
            {/* Retention: notification preferences + life-event management (pushed from MY). */}
            <Stack.Screen name="notification-settings" options={{ headerShown: false }} />
            <Stack.Screen name="life-events" options={{ headerShown: false }} />
            {/* Public content / famous surface (consumer-facing, no auth). */}
            <Stack.Screen name="content/index" options={{ headerShown: false }} />
            <Stack.Screen name="content/[slug]" options={{ headerShown: false }} />
            <Stack.Screen
              name="content/category/[slug]"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="famous/index" options={{ headerShown: false }} />
            <Stack.Screen name="famous/[slug]" options={{ headerShown: false }} />
              </Stack>
            </OnboardingGate>
          </ConsultationDraftProvider>
        </OnboardingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
