import { useWindowDimensions } from 'react-native';

import { ConsumerMaxContentWidth } from '@/constants/theme';

// DESIGN_FREEZE_FINAL §Adaptive — width is ABSORBED, never designed to one device.
//
//   < 360dp   older small Android — the only band allowed to shrink the screen margin (20 → 16).
//              Type never shrinks; wrapping and ellipsis solve overflow instead.
//   360–392   Galaxy S8 / SE — the reference layout. Nothing may break here.
//   393–479   Pixel / iPhone 15 / S24 — margins grow (20 → 24). Type, card heights, icon sizes are
//              unchanged; only the hero may step up one size.
//   >= 480    Fold open / tablet / web — body is capped at 480 and centred; the surplus stays as
//              surface.base margin. Never split into columns: the reading flow is the product.
export type ConsumerLayout = {
  /** Horizontal screen margin for this width band. */
  hPad: number;
  /** Max body width — the consumer reading measure, NOT the 800 admin/public measure. */
  maxWidth: number;
  /** True at >= 393dp, where the hero may take the larger display size. */
  roomyHero: boolean;
};

export function useConsumerLayout(): ConsumerLayout {
  const { width } = useWindowDimensions();
  const hPad = width < 360 ? 16 : width >= 393 ? 24 : 20;
  return { hPad, maxWidth: ConsumerMaxContentWidth, roomyHero: width >= 393 };
}
