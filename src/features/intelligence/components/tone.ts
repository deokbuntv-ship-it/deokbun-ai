// Maps the presentation LabelTone → a consumer semantic color and an AdminBadge tone.
// Pure lookup — no semantics. Kept next to the components (imports @/theme data + admin
// tones), NOT in the pure barrel.
import type { LabelTone } from '@/features/intelligence';
import type { SemanticColors } from '@/theme';

import type { AdminBadgeTone } from '@/features/admin/components/AdminBadge';

export function toneColor(tone: LabelTone, theme: SemanticColors): string {
  switch (tone) {
    case 'strong':
      return theme.secondary; // teal — committal/positive
    case 'caution':
      return theme.accent; // warm orange — attention (never alarm-red)
    case 'muted':
      return theme.textSecondary;
    case 'neutral':
    default:
      return theme.textPrimary;
  }
}

export const TONE_TO_BADGE: Record<LabelTone, AdminBadgeTone> = {
  strong: 'success',
  neutral: 'info',
  caution: 'warning',
  muted: 'neutral',
};
