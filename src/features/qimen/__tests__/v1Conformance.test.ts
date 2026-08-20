import { QIMEN_RULESET_VERSION } from '../adapters/qimenCoreAdapter';
import { computeQimenBoard } from '../services/qimenService';

const board = (year: number, month: number, day: number, hour: number) => {
  const result = computeQimenBoard({ isTimingQuestion: true, questionTime: { year, month, day, hour } });
  if (result.availability !== 'available') throw new Error(result.reason);
  return result.board;
};

describe('Qimen V1 board-time conformance additions', () => {
  it('pins the exact 22→23 hour boundary and the civil-calendar midnight transition', () => {
    const fixtures = [board(2024, 1, 15, 22), board(2024, 1, 15, 23), board(2024, 1, 16, 0)];
    expect(fixtures.map((item) => ({
      rule: item.ruleSetVersion, dun: item.dunType, ju: item.ju, term: item.solarTerm,
      hour: item.ganzhi.hour, zhifu: item.zhifu, zhishi: item.zhishi,
    }))).toEqual([
      { rule: QIMEN_RULESET_VERSION, dun: 'yang', ju: 8, term: '小寒', hour: '癸亥', zhifu: '天輔', zhishi: '杜門' },
      { rule: QIMEN_RULESET_VERSION, dun: 'yang', ju: 8, term: '小寒', hour: '甲子', zhifu: '天任', zhishi: '生門' },
      { rule: QIMEN_RULESET_VERSION, dun: 'yang', ju: 8, term: '小寒', hour: '甲子', zhifu: '天任', zhishi: '生門' },
    ]);
  });

  it('is byte-stable for each exact supported wall-clock fixture', () => {
    for (const fixture of [[2024, 1, 15, 22], [2024, 1, 15, 23], [2024, 1, 16, 0]] as const) {
      expect(JSON.stringify(board(...fixture))).toBe(JSON.stringify(board(...fixture)));
    }
  });
});
