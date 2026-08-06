import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ConsultationDraftProvider } from '@/features/consultation';
import { useColorScheme } from '@/hooks/use-color-scheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const colorScheme = useColorScheme();

	return (
		<ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
			<ConsultationDraftProvider>
				<StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
				<AnimatedSplashOverlay />
				<Stack>
					<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
					<Stack.Screen name="birth-info" options={{ headerShown: false }} />
					<Stack.Screen name="chat" options={{ headerShown: false }} />
				</Stack>
			</ConsultationDraftProvider>
		</ThemeProvider>
	);
}
