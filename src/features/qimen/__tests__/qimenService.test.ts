// Qimen engine tests (directive §24). HONESTY (§24): STRUCTURAL + DETERMINISM +
// ELIGIBILITY assertions; the fixed-input block is a CHARACTERIZATION LOCK on
// qimen-dunjia@2.1.0 output (NOT independent divination correctness — verified
// fixtures need independent references, Owner/Codex). No value here was
// hand-derived by Claude as ground truth.
import { computeQimenBoard } from '../services/qimenService';
import type { QimenQuery } from '../domain/qimenTypes';

const timing = (over: Partial<QimenQuery['questionTime'] & object> = {}): QimenQuery => ({
  isTimingQuestion: true,
  questionTime: { year: 2024, month: 1, day: 15, hour: 10, ...over },
});

describe('computeQimenBoard — eligibility (point-in-time, never fabricates)', () => {
  it('is not_applicable when the question is not a timing question', () => {
    const r = computeQimenBoard({ isTimingQuestion: false, questionTime: { year: 2024, month: 1, day: 15, hour: 10 } });
    expect(r.availability).toBe('not_applicable');
  });
  it('is missing_question_time when no question time is supplied (no current-clock fallback)', () => {
    const r = computeQimenBoard({ isTimingQuestion: true, questionTime: null });
    expect(r.availability).toBe('missing_question_time');
  });
  it('is unsupported_case for an invalid question time', () => {
    expect(computeQimenBoard(timing({ month: 13 })).availability).toBe('unsupported_case');
    expect(computeQimenBoard(timing({ hour: 24 })).availability).toBe('unsupported_case');
  });
});

describe('computeQimenBoard — structural correctness', () => {
  const r = computeQimenBoard(timing());

  it('produces an available board', () => {
    expect(r.availability).toBe('available');
    expect(r.board).not.toBeNull();
  });
  it('has 9 palaces, ju in 1..9, a valid dun type', () => {
    const b = r.board!;
    expect(b.palaces).toHaveLength(9);
    expect(b.ju).toBeGreaterThanOrEqual(1);
    expect(b.ju).toBeLessThanOrEqual(9);
    expect(['yang', 'yin']).toContain(b.dunType);
  });
  it('carries solar term, 三元, 값부/값사, and the query 干支', () => {
    const b = r.board!;
    expect(b.solarTerm).toBeTruthy();
    expect(b.sanyuan).toBeTruthy();
    expect(b.zhifu).toBeTruthy();
    expect(b.zhishi).toBeTruthy();
    expect(b.ganzhi.hour).toBeTruthy();
  });
  it('each palace carries the layered facts (地/天盤, 八門, 九星, 八神)', () => {
    const b = r.board!;
    for (const p of b.palaces) {
      expect(typeof p.palaceLabel).toBe('string');
      expect(typeof p.earthPlate).toBe('string');
      expect(typeof p.heavenPlate).toBe('string');
      expect(typeof p.star).toBe('string');
      expect(typeof p.god).toBe('string');
    }
  });
  it('tracks library + rule-set (拆補法) versions', () => {
    const b = r.board!;
    expect(b.library).toBe('qimen-dunjia');
    expect(b.libraryVersion).toBe('2.1.0');
    expect(b.ruleSetVersion).toContain('chaibu');
  });
});

describe('computeQimenBoard — DETERMINISM', () => {
  it('produces byte-identical boards for identical query time', () => {
    expect(JSON.stringify(computeQimenBoard(timing()))).toBe(JSON.stringify(computeQimenBoard(timing())));
  });
});

describe('CHARACTERIZATION LOCK — qimen-dunjia@2.1.0 output for a fixed query time', () => {
  const b = computeQimenBoard(timing()).board!; // 2024-01-15 10시
  it('음양둔/국수/節氣/값부/값사 are stable', () => {
    expect(b.dunType).toBe('yang'); // 陽
    expect(b.ju).toBe(8);
    expect(b.solarTerm).toBe('小寒');
    expect(b.sanyuan).toBe('中元');
    expect(b.zhifu).toBe('天輔');
    expect(b.zhishi).toBe('杜門');
  });
});
