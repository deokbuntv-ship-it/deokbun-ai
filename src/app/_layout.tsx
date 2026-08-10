import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
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
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="birth-info" options={{ headerShown: false }} />
            <Stack.Screen name="chat" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
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
