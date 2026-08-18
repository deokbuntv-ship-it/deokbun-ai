import type { ConsumerNavKey } from './consumerNav';

// Native counterpart of ConsumerNavGlyph.web. The native consumer nav is label-forward (no inline SVG
// without an extra dependency — matching the app's LineIcon-null-on-native convention), and the native
// primary tab bar uses SF Symbols, so there is no glyph to draw here. Exists so `./ConsumerNavGlyph`
// resolves for TypeScript; Metro swaps in the .web implementation on web.
export function ConsumerNavGlyph(_props: {
  name: ConsumerNavKey;
  color: string;
  active: boolean;
}): null {
  return null;
}
