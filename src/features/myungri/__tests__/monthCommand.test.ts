// 월령/득령 — deterministic month-command INPUT facts for a future 강약 layer. NO strength verdict.
// 왕상휴수사 of a 甲(WOOD) 일간 across month branches, consuming the canonical (立春/節) month branch.
import { calculateMonthCommand, type NatalPillarContext } from '../index';

const natal = (monthBranch: string): NatalPillarContext => ({
  dayMaster: 'JIA', // 甲 WOOD
  pillars: {
    year: { stem: 'GENG', branch: 'WU' },
    month: { stem: 'BING', branch: monthBranch as NatalPillarContext['pillars']['month']['branch'] },
    day: { stem: 'JIA', branch: 'ZI' },
  },
});
const run = (monthBranch: string) => {
  const r = calculateMonthCommand(natal(monthBranch));
  if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
  return r;
};

describe('월령/득령 (甲 일간, 旺相休囚死)', () => {
  it('寅월(木): 旺 → 득령(IN_COMMAND), 봄, 月建 1', () => {
    const r = run('YIN');
    expect(r.monthElement).toBe('WOOD');
    expect(r.dayMasterSeasonalPhase).toBe('WANG');
    expect(r.commandStatus).toBe('IN_COMMAND');
    expect(r.season).toBe('SPRING');
    expect(r.sajuMonthOrdinal).toBe(1);
  });

  it('子월(水 인성): 相 → 득령, 겨울, 月建 11', () => {
    const r = run('ZI');
    expect(r.dayMasterSeasonalPhase).toBe('XIANG');
    expect(r.commandStatus).toBe('IN_COMMAND');
    expect(r.season).toBe('WINTER');
    expect(r.sajuMonthOrdinal).toBe(11);
  });

  it('午월(火 식상): 休 → 실령(OUT_OF_COMMAND)', () => {
    const r = run('WU');
    expect(r.dayMasterSeasonalPhase).toBe('XIU');
    expect(r.commandStatus).toBe('OUT_OF_COMMAND');
    expect(r.season).toBe('SUMMER');
    expect(r.sajuMonthOrdinal).toBe(5);
  });

  it('辰월(土 재): 囚 → 실령; 申월(金 관살): 死 → 실령', () => {
    expect(run('CHEN').dayMasterSeasonalPhase).toBe('QIU');
    expect(run('CHEN').commandStatus).toBe('OUT_OF_COMMAND');
    expect(run('SHEN').dayMasterSeasonalPhase).toBe('SI');
    expect(run('SHEN').commandStatus).toBe('OUT_OF_COMMAND');
  });

  it('canonical month branch is used (月建 ordinal from branch), never a lunar month number', () => {
    // sajuMonthOrdinal is derived purely from the branch: 寅=1 … 丑=12 (no lunar input exists).
    expect(run('CHOU').sajuMonthOrdinal).toBe(12);
    expect(run('MAO').sajuMonthOrdinal).toBe(2);
  });

  it('emits NO strength verdict / score (input-fact only)', () => {
    const r = run('YIN');
    expect(r).not.toHaveProperty('strength');
    expect(r).not.toHaveProperty('strengthScore');
    expect(r).not.toHaveProperty('shinGang');
    expect(r.ruleVersion).toBe('deokbunai.myungri-month-command.v1');
  });
});
