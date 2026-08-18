import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AcquisitionBridge } from '@/features/ads/acquisition/AcquisitionBridge';
import { AuthProvider } from '@/features/auth';
import { ConsultationDraftProvider } from '@/features/consultation';
import { useColorScheme } from '@/hooks/use-color-scheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <ConsultationDraftProvider>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <AnimatedSplashOverlay />
          {/* Additive, fail-closed ad-acquisition capture (Sprint 3B). Renders nothing;
              organic (no ?ad=) visitors are unaffected. */}
          <AcquisitionBridge />
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="birth-info" options={{ headerShown: false }} />
            <Stack.Screen name="chat" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            {/* Provider-neutral OAuth return route (web popup completion; native
                intercepts the deep link and never mounts this). */}
            <Stack.Screen name="login-callback" options={{ headerShown: false }} />
            {/* 운세우편 상세 (05) — pushed from 운세우편함; own AppHeader back. */}
            <Stack.Screen name="mail-detail" options={{ headerShown: false }} />
            {/* 상담 보고서 상세 — pushed from 우편함>보고서 and the chat report CTA; own AppHeader,
                owner-only (RLS), redirects to login when signed out. */}
            <Stack.Screen name="report/[id]" options={{ headerShown: false }} />
            {/* 분석 대상자 관리 (from MY) — subject management; own AppHeader. */}
            <Stack.Screen name="subjects" options={{ headerShown: false }} />
            {/* 대상자 상담 이력 / 만세력 (pushed from subjects); own AppHeader. */}
            <Stack.Screen name="subject-history" options={{ headerShown: false }} />
            <Stack.Screen name="subject-manse" options={{ headerShown: false }} />
            {/* Deep-link compatibility redirects. */}
            <Stack.Screen name="records" options={{ headerShown: false }} />
            <Stack.Screen name="today" options={{ headerShown: false }} />
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
        </ConsultationDraftProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
