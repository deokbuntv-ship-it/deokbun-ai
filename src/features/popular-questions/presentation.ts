import type { LineIconName } from '@/components/LineIcon';

import type { PopularQuestionCategory } from './types';

// Category → leading icon. Presentation-only (a `import type` for LineIconName, so this stays erasable and
// node-importable). The DB never stores an icon name — the category is the single lever, so a new question in
// an existing category automatically gets the right icon.
const CATEGORY_ICON: Record<PopularQuestionCategory, LineIconName> = {
  MONEY: 'wallet',
  CAREER: 'briefcase',
  BUSINESS: 'briefcase',
  RELATIONSHIP: 'people',
  LOVE: 'heart',
  CHANGE: 'swap',
  WELLBEING: 'leaf',
  GENERAL: 'sparkle',
};

export function popularQuestionIcon(category: PopularQuestionCategory): LineIconName {
  return CATEGORY_ICON[category] ?? 'sparkle';
}
