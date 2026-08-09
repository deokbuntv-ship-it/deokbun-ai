import type { FiveElement } from '@/features/interpretation';
import { fiveElementTiles, type FiveElementColorKey, type FiveElementTile } from '@/theme';

// Maps the ENGINE's authoritative FiveElement identity onto DeokbunAI theme tile
// tokens (background/glyph/border). This is presentation/theming ONLY — the APP
// does not compute elements (stem→element / branch→element is ENGINE authority).
// No color values are defined here; they live in the theme (src/theme/colors.ts).

const ELEMENT_COLOR_KEY: Record<FiveElement, FiveElementColorKey> = {
  WOOD: 'wood',
  FIRE: 'fire',
  EARTH: 'earth',
  METAL: 'metal',
  WATER: 'water',
};

export function fiveElementColorKey(element: FiveElement): FiveElementColorKey {
  return ELEMENT_COLOR_KEY[element];
}

export function getFiveElementTile(
  key: FiveElementColorKey,
  scheme: 'light' | 'dark',
): FiveElementTile {
  return fiveElementTiles[scheme][key];
}
