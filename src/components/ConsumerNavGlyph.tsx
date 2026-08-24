import Svg, { Circle, Path, Rect } from 'react-native-svg';

import type { ConsumerNavKey } from './consumerNav';

// Native consumer bottom-nav glyphs via react-native-svg — a 1:1 port of ConsumerNavGlyph.web so the
// detail-screen bottom bar shows the SAME 5 icons on device as on web (was a null no-op before the svg dep).
export function ConsumerNavGlyph({ name, color, active }: { name: ConsumerNavKey; color: string; active: boolean }) {
  const s = {
    stroke: color,
    strokeWidth: active ? 2.3 : 1.8,
    fill: 'none',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  const svg = (children: React.ReactNode) => (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      {children}
    </Svg>
  );
  switch (name) {
    case 'home':
      return svg(
        <>
          <Path d="M3 11 12 4l9 7" {...s} />
          <Path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" {...s} />
        </>,
      );
    case 'consult':
      return svg(<Path d="M21 11.5a8 8 0 0 1-11.6 7.1L4 20l1.4-4.3A8 8 0 1 1 21 11.5z" {...s} />);
    case 'compatibility':
      return svg(
        <>
          <Circle cx="8.5" cy="8.5" r="2.6" {...s} />
          <Circle cx="15.5" cy="8.5" r="2.6" {...s} />
          <Path d="M4 19c0-2.4 2-4 4.5-4 1.4 0 2.6.5 3.5 1.4.9-.9 2.1-1.4 3.5-1.4 2.5 0 4.5 1.6 4.5 4" {...s} />
        </>,
      );
    case 'inbox':
      return svg(
        <>
          <Rect x="3" y="5" width="18" height="14" rx="2.5" {...s} />
          <Path d="m3.5 7 8.5 6 8.5-6" {...s} />
        </>,
      );
    case 'my':
      return svg(
        <>
          <Circle cx="12" cy="8" r="4" {...s} />
          <Path d="M4.5 20c0-3.8 3.4-6 7.5-6s7.5 2.2 7.5 6" {...s} />
        </>,
      );
  }
}
