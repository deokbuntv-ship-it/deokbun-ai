// Render-harness setup — the mock surface, in one place.
//
// Only three externals need mocking, because the design system under `src/components/**` imports
// almost nothing outside `react-native` + `@/theme`. react-native itself is NOT mocked: it is
// aliased to react-native-web, which is already a production dependency because the app ships a
// static web build. So these tests render the real web product, not a stand-in.
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';

afterEach(cleanup);

// expo-router — navigation is an effect, not a render concern. Tests assert what was pushed.
export const routerMock = { push: jest.fn(), replace: jest.fn(), back: jest.fn(), dismissTo: jest.fn(), navigate: jest.fn(), setParams: jest.fn() };
jest.mock('expo-router', () => ({
  __esModule: true,
  useRouter: () => routerMock,
  useLocalSearchParams: () => (globalThis as Record<string, unknown>).__routeParams ?? {},
  usePathname: () => '/',
  // Screens that guard on "is the navigator ready yet" read this; a stable ready state is the
  // only sensible answer when there is no navigation container.
  useRootNavigationState: () => ({ key: 'root', index: 0, routes: [] }),
  useSegments: () => [],
  useNavigation: () => ({ addListener: () => () => {}, setOptions: () => {}, isFocused: () => true }),
  useFocusEffect: (cb: () => void) => { const React = require('react'); React.useEffect(cb, []); },
  // A <Redirect> is invisible on screen but is exactly what several of these screens do instead of
  // rendering. Emitting a marker element makes "it redirected" assertable rather than a blank tree.
  Redirect: ({ href }: { href: string }) => {
    const React = require('react');
    return React.createElement('span', { 'data-testid': 'redirect', 'data-href': String(href) });
  },
  Link: ({ children }: { children: unknown }) => children,
  Stack: { Screen: () => null },
}));

jest.mock('react-native-safe-area-context', () => ({
  __esModule: true,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: { children: unknown }) => children,
  SafeAreaView: ({ children }: { children: unknown }) => children,
}));

jest.mock('expo-image', () => {
  const React = require('react');
  return { __esModule: true, Image: (p: Record<string, unknown>) => React.createElement('img', { alt: '', ...p }) };
});

// `expo-router/head` is a separate module path from `expo-router`, so the mock above does not cover
// it. The real one calls useIsFocused → useNavigation, which needs a navigation container these
// tests deliberately do not build. The <head> content it emits is asserted by the source-contract
// tests (shareCard.test.ts), not here.
jest.mock('expo-router/head', () => ({
  __esModule: true,
  default: ({ children }: { children: unknown }) => children ?? null,
}));
