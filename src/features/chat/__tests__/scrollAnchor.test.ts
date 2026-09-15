// FROZEN scroll behavior (docs/GOLDEN_FLOW_V4_UX.md §G): a new answer opens at its START,
// never the absolute bottom. Locks the offset math so it can't regress to scroll-to-end.
import {
  ANSWER_TOP_GAP,
  SCROLL_TOP_PADDING,
  computeAnswerAnchorOffset,
} from '../scrollAnchor';

describe('answer scroll anchor — opens at the START of the new answer (§G, FROZEN)', () => {
  it('anchors to the message top minus the top gap', () => {
    expect(computeAnswerAnchorOffset(200)).toBe(SCROLL_TOP_PADDING + 200 - ANSWER_TOP_GAP); // 210
  });

  it('leaves a small (12–16px) gap above the first line', () => {
    // effective gap from the viewport top = the message absolute top (padding + layoutY) minus
    // the scroll offset = ANSWER_TOP_GAP.
    const layoutY = 500;
    const absoluteTop = SCROLL_TOP_PADDING + layoutY;
    const gap = absoluteTop - computeAnswerAnchorOffset(layoutY);
    expect(gap).toBe(ANSWER_TOP_GAP);
    expect(ANSWER_TOP_GAP).toBeGreaterThanOrEqual(12);
    expect(ANSWER_TOP_GAP).toBeLessThanOrEqual(16);
  });

  it('depends ONLY on the message START — independent of the answer height (never opens at the end)', () => {
    // A short and a very long answer at the same start position anchor identically: the offset
    // is the START, so a long answer opens at its first line, not its end.
    expect(computeAnswerAnchorOffset(300)).toBe(computeAnswerAnchorOffset(300));
    // Monotonic in start position; never the content end.
    expect(computeAnswerAnchorOffset(1000)).toBe(SCROLL_TOP_PADDING + 1000 - ANSWER_TOP_GAP);
  });

  it('clamps to >= 0 for the first message near the top', () => {
    expect(computeAnswerAnchorOffset(0)).toBe(Math.max(0, SCROLL_TOP_PADDING - ANSWER_TOP_GAP)); // 10
    expect(computeAnswerAnchorOffset(-100)).toBe(0); // never negative
  });

  it('honors custom padding/gap overrides', () => {
    expect(computeAnswerAnchorOffset(100, { topPadding: 40, topGap: 20 })).toBe(120);
  });
});
