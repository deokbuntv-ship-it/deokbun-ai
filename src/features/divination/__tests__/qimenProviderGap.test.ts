// CONSTITUTION V2 §36 — QIMEN PROVIDER GAP: scope, root cause, and honest fail-closed behaviour.
//
// ROOT CAUSE (provider bug, NOT this repository's code):
//   `qimen-dunjia@2.1.0` derives the solar term internally via lunar-javascript, which returns SIMPLIFIED
//   names, then converts them with an incomplete map:
//       SIMPLIFIED_TO_TRADITIONAL = { '谷雨':'穀雨', '惊蛰':'驚蟄', '处暑':'處暑' }   // 3 entries only
//   Of the 24 terms, exactly five differ between scripts: 惊蛰/谷雨/处暑 (mapped) and
//   **小满→小滿 · 芒种→芒種 (NOT mapped)**. Their table lookup therefore misses and the library throws
//   `未知的節氣`. That is precisely the observed outage window.
//
// SCOPE: every year, 小满 through 芒种 — i.e. ~May 21 → ~Jun 21 inclusive (~32 days ≈ 8.8% of the year).
// FIX: two entries in the provider's map (upstream patch / patch-package / version bump). NOT applied here:
// §36 forbids mixing a risky engine change into a judgment sprint, and the failing code is inside the
// dependency, so it cannot be corrected from our adapter (the library resolves the term itself).
//
// PRODUCT BEHAVIOUR MEANWHILE: fail-closed and honest — Qimen reports not-applicable, contributes no vote,
// and the prose layer is told not to claim 기문둔갑 was used. No board is ever fabricated.
import { computeQimenBoard } from '@/features/qimen';
import { resolveQimenActivation } from '@/features/chat/selectors/qimenActivation';
import { judgeQimen } from '@/features/divination';

const at = (y: number, m: number, d: number) => Math.floor(Date.UTC(y, m - 1, d, 3, 0, 0) / 1000); // 12:00 KST
const boardAt = (y: number, m: number, d: number) =>
  computeQimenBoard(resolveQimenActivation('지금 계약해도 될까요?', at(y, m, d)));

describe('QIMEN provider gap — scope is bounded and documented', () => {
  it('fails across the 小满–芒种 window (May 21 → Jun 21), every year', () => {
    for (const [m, d] of [[5, 21], [6, 1], [6, 10], [6, 21]] as [number, number][]) {
      expect(boardAt(2026, m, d).availability).not.toBe('available');
    }
    for (const y of [2024, 2025, 2027]) {
      expect(boardAt(y, 6, 15).availability).not.toBe('available');
    }
  });

  it('works immediately OUTSIDE that window — the outage is not general', () => {
    for (const [m, d] of [[5, 20], [6, 22], [3, 10], [9, 15], [12, 25]] as [number, number][]) {
      expect(boardAt(2026, m, d).availability).toBe('available');
    }
  });

  it('degrades HONESTLY: not-applicable, no vote, no fabricated board', () => {
    const failed = boardAt(2026, 6, 15);
    expect(failed.board).toBeNull(); // never a made-up 국
    const j = judgeQimen({
      question: '지금 계약해도 될까요?', questionDomain: 'TIMING',
      board: failed.board, availability: failed.availability,
    });
    expect(j.applicable).toBe(false);
    expect(j.evidenceStrength).toBe('NONE'); // casts no vote in the cross judge
    expect(j.applicabilityReason).toMatch(/기문 국을 세우지 못했습니다/);
  });

  it('the provider map is still missing the two terms (remove this test when the provider is fixed)', () => {
    // Guard so a future dependency bump that fixes it is noticed rather than silently assumed.
    const ok = boardAt(2026, 6, 15).availability === 'available';
    expect(ok).toBe(false);
  });
});
