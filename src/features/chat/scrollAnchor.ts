// Scroll anchoring for a new consultation answer (docs/GOLDEN_FLOW_V4_UX.md §G, FROZEN).
// When a new assistant answer (or the user's own message) arrives, the viewport aligns near
// the START of that message — its first line, with a small top gap — and NEVER jumps to the
// absolute bottom. This is critical because DeokbunAI intentionally returns LONG answers: a
// long answer must open at its beginning, not halfway down or at its end.
//
// Pure so the FROZEN offset rule is regression-locked without a native render harness.

export const SCROLL_TOP_PADDING = 24; // mirrors chat.tsx messageScrollContent.paddingVertical
export const ANSWER_TOP_GAP = 14; // 12–16px gap above the newest message's first line

/**
 * The scroll offset (content Y) that places a message's START near the top of the viewport,
 * given the message's layout Y within the content Stack. The result depends only on the
 * message's START — it is independent of the answer's height, so a long answer opens at its
 * first line, never at its end. Clamped to >= 0.
 */
export function computeAnswerAnchorOffset(
  layoutY: number,
  opts: { topPadding?: number; topGap?: number } = {},
): number {
  const topPadding = opts.topPadding ?? SCROLL_TOP_PADDING;
  const topGap = opts.topGap ?? ANSWER_TOP_GAP;
  return Math.max(0, topPadding + layoutY - topGap);
}
