// V3 §25 + §43 — QIMEN PROVIDER GAP: FIXED, and locked so it cannot regress.
//
// HISTORY. `qimen-dunjia@2.1.0` normalised solar-term names with a 3-entry substring map
// (谷雨/惊蛰/处暑). lunar-javascript emits SIMPLIFIED names, so 小满→小滿 and 芒种→芒種 were never
// converted, the 局 table lookup missed, and the library threw `未知的節氣`. Because those two terms run
// consecutively, the product lost Qimen for ~32 days EVERY year (~May 21 → Jun 21).
//
// RESOLUTION. Upstream fixed exactly this in 3.x, replacing substring replacement with a whole-name alias
// table (its own comment cites 「小满」「芒种」 and the ~32-day outage). We upgraded 2.1.0 → 3.1.0 pinned.
// The bump is a MAJOR version, so it was gated on this repo's own characterization locks: all Qimen golden /
// conformance tests pass UNCHANGED, i.e. no calculation semantics moved — only the name normalisation.
//
// These tests now assert the WORKING state and would fail loudly on a downgrade or a regression.
import { computeQimenBoard } from '@/features/qimen';
import { resolveQimenActivation, epochToProviderQueryTime } from '@/features/chat/selectors/qimenActivation';
import { judgeQimen } from '@/features/divination';

/** 12:00 KST on the given civil date. */
const at = (y: number, m: number, d: number, hourKst = 12) =>
  Math.floor(Date.UTC(y, m - 1, d, hourKst - 9, 0, 0) / 1000);
const boardAt = (y: number, m: number, d: number, hourKst = 12) =>
  computeQimenBoard(resolveQimenActivation('지금 계약해도 될까요?', at(y, m, d, hourKst)));

describe('§25 — the previously-broken 32-day window now computes', () => {
  it('小满 window (May 21 → Jun 5) computes a board', () => {
    for (const [m, d] of [[5, 21], [5, 25], [6, 1], [6, 4]] as [number, number][]) {
      expect(boardAt(2026, m, d).availability).toBe('available');
    }
  });

  it('芒种 window (Jun 6 → Jun 21) computes a board', () => {
    for (const [m, d] of [[6, 6], [6, 10], [6, 15], [6, 21]] as [number, number][]) {
      expect(boardAt(2026, m, d).availability).toBe('available');
    }
  });

  it('holds across multiple years (the outage was annual)', () => {
    for (const y of [2024, 2025, 2026, 2027]) {
      expect(boardAt(y, 6, 15).availability).toBe('available');
    }
  });

  it('terms that always worked still work — no collateral damage from the upgrade', () => {
    for (const [m, d] of [[3, 10], [5, 20], [6, 22], [9, 15], [12, 25]] as [number, number][]) {
      expect(boardAt(2026, m, d).availability).toBe('available');
    }
  });

  it('a board inside the formerly-broken window yields a REAL Qimen judgment (not a degraded stub)', () => {
    const r = boardAt(2026, 6, 15);
    expect(r.board).not.toBeNull();
    const j = judgeQimen({ question: '지금 계약해도 될까요?', questionDomain: 'TIMING', board: r.board, availability: r.availability });
    expect(j.applicable).toBe(true);
    expect(j.evidenceStrength).not.toBe('NONE');
    expect(j.dominantFactor).toMatch(/값사/);
  });
});

describe('§43 — solar-term and hour boundary coverage', () => {
  it('the day either side of the 芒种 entry both compute', () => {
    expect(boardAt(2026, 6, 5).availability).toBe('available');
    expect(boardAt(2026, 6, 6).availability).toBe('available');
  });

  it('the day either side of the 夏至 exit both compute', () => {
    expect(boardAt(2026, 6, 21).availability).toBe('available');
    expect(boardAt(2026, 6, 22).availability).toBe('available');
  });

  it('adjacent HOUR instants produce the provider time basis we intend (時辰 boundary)', () => {
    // 10:00 KST → 09:00 CST ; 11:00 KST → 10:00 CST — different 時辰 blocks, correctly derived.
    expect(epochToProviderQueryTime(at(2026, 6, 15, 10)).hour).toBe(9);
    expect(epochToProviderQueryTime(at(2026, 6, 15, 11)).hour).toBe(10);
    expect(boardAt(2026, 6, 15, 10).availability).toBe('available');
    expect(boardAt(2026, 6, 15, 11).availability).toBe('available');
  });

  it('boards at adjacent 時辰 are genuinely different (the hour actually reaches the calculation)', () => {
    const a = boardAt(2026, 6, 15, 10).board!;
    const b = boardAt(2026, 6, 15, 14).board!;
    expect(`${a.zhishi}${a.zhifu}${a.zhishiPalace}`).not.toBe(`${b.zhishi}${b.zhifu}${b.zhishiPalace}`);
  });
});
