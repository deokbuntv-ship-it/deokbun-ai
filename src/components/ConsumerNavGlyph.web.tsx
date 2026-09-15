import type { ConsumerNavKey } from './consumerNav';

// Shared inline-SVG glyph set for the consumer bottom nav (WEB). Used by BOTH app-tabs.web (primary tab
// bar) and DetailBottomNav.web (detail-screen mirror) so the icon set is single-source. Line-style, one
// family, ~22px. The 궁합 glyph is a clean "two people" (relationship) mark consistent with the set —
// not a decorative heart.
export function ConsumerNavGlyph({
  name,
  color,
  active,
}: {
  name: ConsumerNavKey;
  color: string;
  active: boolean;
}) {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: active ? 2.3 : 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'home':
      return (
        <svg {...common}>
          <path d="M3 11 12 4l9 7" />
          <path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />
        </svg>
      );
    case 'consult':
      return (
        <svg {...common}>
          <path d="M21 11.5a8 8 0 0 1-11.6 7.1L4 20l1.4-4.3A8 8 0 1 1 21 11.5z" />
        </svg>
      );
    case 'compatibility':
      return (
        <svg {...common}>
          <circle cx="8.5" cy="8.5" r="2.6" />
          <circle cx="15.5" cy="8.5" r="2.6" />
          <path d="M4 19c0-2.4 2-4 4.5-4 1.4 0 2.6.5 3.5 1.4.9-.9 2.1-1.4 3.5-1.4 2.5 0 4.5 1.6 4.5 4" />
        </svg>
      );
    case 'inbox':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="m3.5 7 8.5 6 8.5-6" />
        </svg>
      );
    case 'my':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4.5 20c0-3.8 3.4-6 7.5-6s7.5 2.2 7.5 6" />
        </svg>
      );
  }
}
