// Verifies the trigram→index resolution against REAL computed boards — this is the exact fix for a
// prior dead lookup in `qimenJudge.ts` (`palaceLabel.includes(trigram)`, which could never match since
// `palaceLabel` never contains the trigram character). Cross-checked two independent ways per fixture:
// the star sitting at the resolved 값부 palace must equal `board.zhifu`, and the (heaven-plate) door
// sitting at the resolved 값사 palace must equal `board.zhishi`.
import { computeQimenBoard } from '../services/qimenService';
import { findPalaceByTrigram, TRIGRAM_ELEMENT, elementRelation } from '../services/qimenPalaceGeometry';
import type { QimenBoard } from '../domain/qimenTypes';

function boardAt(year: number, month: number, day: number, hour: number): QimenBoard {
  const r = computeQimenBoard({ isTimingQuestion: true, questionTime: { year, month, day, hour } });
  if (r.availability !== 'available') throw new Error(`fixture board unavailable: ${JSON.stringify(r)}`);
  return r.board;
}

describe('findPalaceByTrigram — resolves the REAL palace a 값부/값사 trigram sits in', () => {
  it('the resolved 값부 palace\'s star matches board.zhifu, for a real board', () => {
    const b = boardAt(2026, 3, 10, 9);
    const p = findPalaceByTrigram(b, b.zhifuPalace);
    expect(p).not.toBeNull();
    expect(p!.star).toBe(b.zhifu);
  });

  it('the resolved 값사 palace\'s heaven-plate door matches board.zhishi, for the same real board', () => {
    const b = boardAt(2026, 3, 10, 9);
    const p = findPalaceByTrigram(b, b.zhishiPalace);
    expect(p).not.toBeNull();
    expect(p!.heavenDoor).toBe(b.zhishi);
  });

  it('holds across a second, independently different real board', () => {
    const b = boardAt(1990, 8, 15, 14);
    const zf = findPalaceByTrigram(b, b.zhifuPalace);
    const zs = findPalaceByTrigram(b, b.zhishiPalace);
    expect(zf!.star).toBe(b.zhifu);
    expect(zs!.heavenDoor).toBe(b.zhishi);
  });

  it('an unrecognized trigram string returns null, never a guess', () => {
    const b = boardAt(2026, 3, 10, 9);
    expect(findPalaceByTrigram(b, '?')).toBeNull();
  });

  it('every one of the 9 real trigram labels resolves to a distinct palace index', () => {
    const b = boardAt(2026, 3, 10, 9);
    const indices = new Set(['巽', '離', '坤', '震', '中', '兌', '艮', '坎', '乾'].map((t) => findPalaceByTrigram(b, t)?.index));
    expect(indices.size).toBe(9);
  });
});

describe('TRIGRAM_ELEMENT / elementRelation', () => {
  it('every one of the 9 real trigram labels has a defined element', () => {
    for (const t of ['巽', '離', '坤', '震', '中', '兌', '艮', '坎', '乾']) {
      expect(TRIGRAM_ELEMENT[t]).toBeDefined();
    }
  });

  it('the relation is symmetric-complementary: A_CONTROLS_B from a\'s side is B_CONTROLS_A from b\'s side', () => {
    expect(elementRelation('WOOD', 'EARTH')).toBe('A_CONTROLS_B');
    expect(elementRelation('EARTH', 'WOOD')).toBe('B_CONTROLS_A');
  });

  it('generation is likewise directional and consistent both ways', () => {
    expect(elementRelation('WOOD', 'FIRE')).toBe('A_GENERATES_B');
    expect(elementRelation('FIRE', 'WOOD')).toBe('B_GENERATES_A');
  });

  it('the same element relates to itself as SAME', () => {
    expect(elementRelation('METAL', 'METAL')).toBe('SAME');
  });
});
