// Web-only inline-SVG line icons (react-native-web renders these via react-dom).
// No icon-font / vector-icons dependency. Native gets a graceful no-op fallback
// (LineIcon.tsx) so shared screens don't break — the polished icons show on web,
// where the Stitch visual QA happens. Monochrome, stroke-based, warm-guidance.
export type LineIconName =
  | 'wallet'
  | 'briefcase'
  | 'swap'
  | 'heart'
  | 'leaf'
  | 'people'
  | 'gear'
  | 'shield'
  | 'chat'
  | 'sparkle'
  | 'warning'
  | 'calendar'
  | 'send'
  | 'bell'
  // Presentation-only additions (DESIGN_FREEZE_FINAL, approved): list chevrons, header back, and the
  // subject-selection check. Navigation semantics and business logic are untouched — these are glyphs.
  | 'chevron-right'
  | 'chevron-down'
  | 'back'
  | 'check';

type Props = {
  name: LineIconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function LineIcon({ name, size = 22, color = '#6B6357', strokeWidth = 1.7 }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'wallet':
      return (
        <svg {...common}>
          <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H17a2 2 0 0 1 2 2v0" />
          <path d="M3 7.5V17a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-3" />
          <path d="M20 10.5h-4a2 2 0 0 0 0 4h4a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1z" />
        </svg>
      );
    case 'briefcase':
      return (
        <svg {...common}>
          <rect x="3" y="7.5" width="18" height="12" rx="2.5" />
          <path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5" />
          <path d="M3 12.5h18" />
        </svg>
      );
    case 'swap':
      return (
        <svg {...common}>
          <path d="M4 8h13l-3-3" />
          <path d="M20 16H7l3 3" />
        </svg>
      );
    case 'heart':
      return (
        <svg {...common}>
          <path d="M12 20s-7-4.3-7-9.2A3.8 3.8 0 0 1 12 7a3.8 3.8 0 0 1 7 3.8C19 15.7 12 20 12 20z" />
        </svg>
      );
    case 'leaf':
      return (
        <svg {...common}>
          <path d="M5 19c0-8 6-12 14-12 0 8-5 13-11 13a3 3 0 0 1-3-1z" />
          <path d="M9 15c2-3 5-4 8-4.5" />
        </svg>
      );
    case 'people':
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 19c0-3 2.5-4.5 5.5-4.5s5.5 1.5 5.5 4.5" />
          <path d="M16 5.2a3 3 0 0 1 0 5.6" />
          <path d="M17.5 14.7c2 .6 3.5 2 3.5 4.3" />
        </svg>
      );
    case 'gear':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3.5v2M12 18.5v2M4.6 7.5l1.7 1M17.7 15.5l1.7 1M19.4 7.5l-1.7 1M6.3 15.5l-1.7 1" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 3.5 5.5 6v5.5c0 4 2.8 7 6.5 8.5 3.7-1.5 6.5-4.5 6.5-8.5V6L12 3.5z" />
          <path d="M9.3 11.8l2 2 3.4-3.6" />
        </svg>
      );
    case 'chat':
      return (
        <svg {...common}>
          <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v6A2.5 2.5 0 0 1 17.5 15H9l-4 3.5V6.5z" />
        </svg>
      );
    case 'sparkle':
      return (
        <svg {...common}>
          <path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4z" />
        </svg>
      );
    case 'warning':
      return (
        <svg {...common}>
          <path d="M12 4.5 3.5 19h17L12 4.5z" />
          <path d="M12 10v4M12 16.5v.5" />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...common}>
          <rect x="4" y="5.5" width="16" height="14" rx="2.5" />
          <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
        </svg>
      );
    case 'send':
      return (
        <svg {...common}>
          <path d="M12 19V6M6 11l6-6 6 6" />
        </svg>
      );
    case 'chevron-right':
      return (
        <svg {...common}>
          <path d="M9.5 6l6 6-6 6" />
        </svg>
      );
    case 'chevron-down':
      return (
        <svg {...common}>
          <path d="M6 9.5l6 6 6-6" />
        </svg>
      );
    case 'back':
      return (
        <svg {...common}>
          <path d="M14.5 5L8 12l6.5 7" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common}>
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      );
    case 'bell':
      return (
        <svg {...common}>
          <path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 4.2 1.5 5.5 1.5 5.5H5s1.5-1.3 1.5-5.5z" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </svg>
      );
  }
}
