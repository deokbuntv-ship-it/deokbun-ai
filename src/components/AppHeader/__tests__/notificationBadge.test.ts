import { notificationBadgeText } from '../notificationBadge';

// Bounded notification badge (retention §13) — a large unread count must never blow out the header.
describe('notificationBadgeText', () => {
  it('hides the badge for zero / negative / non-finite counts', () => {
    [0, -1, -100, NaN, Infinity].forEach((n) => expect(notificationBadgeText(n)).toBeNull());
  });
  it('shows the exact number for 1..9', () => {
    for (let n = 1; n <= 9; n += 1) expect(notificationBadgeText(n)).toBe(String(n));
  });
  it('caps anything above 9 at "9+"', () => {
    [10, 11, 42, 1000].forEach((n) => expect(notificationBadgeText(n)).toBe('9+'));
  });
});
