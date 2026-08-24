// DESIGN_FREEZE_FINAL §03 — card lg 18 · button md 14 · bottom sheet top 24 · chip/avatar pill.
//
// The token NAMES are unchanged and the values are chosen so every existing consumer call site
// lands on its freeze value with zero edits:
//   Card radius="xl"   → 18  (freeze card)
//   Card default 'lg'  → 14  (admin console cards — outside the consumer freeze)
//   Button default 'md'→ 14  (freeze button)
//   Button radius="lg" → 14  (freeze button — consumer CTAs already pass this)
//   Input radius.md    → 14  (freeze input)
//   Sheet radius.xxl   → 24  (freeze bottom sheet)
// `md` and `lg` deliberately share 14: both are "control" radii here, and collapsing them is what
// keeps this a values-only change instead of a sweep through every screen.
export const radius = {
  none: 0,
  sm: 10,
  md: 14,
  lg: 14,
  xl: 18,
  xxl: 24,
  pill: 999,
  full: 9999,
} as const;

export type RadiusToken = keyof typeof radius;
