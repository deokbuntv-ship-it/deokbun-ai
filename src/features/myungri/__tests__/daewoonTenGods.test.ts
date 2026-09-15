// 대운십신 — connects ENGINE-12 Daewoon cycles to the natal 일간 via frozen ten-god rules.
// It must NOT recompute direction/age/progression — only annotate each cycle's 간지.
import { calculateDaewoonTenGods } from '../index';
import { sexagenaryIndexToPillar } from '../../interpretation';
import type { DaewoonCycle } from '../../interpretation';

function cyc(ordinal: number, index: number, startAge: number): DaewoonCycle {
  const p = sexagenaryIndexToPillar(index);
  if (!p.ok) throw new Error('bad index');
  return { ordinal, pillar: p.value, startAgeInclusive: startAge, endAgeInclusive: startAge + 9 };
}

// 甲 일간. Cycles: 丙寅(idx2), 庚午(idx6), 乙丑(idx1).
const CYCLES = [cyc(1, 2, 5), cyc(2, 6, 15), cyc(3, 1, 25)];

describe('대운십신', () => {
  const r = calculateDaewoonTenGods({ dayMaster: 'JIA', cycles: CYCLES });
  if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');

  it('천간 십신: 丙=식신, 庚=편관/칠살, 乙=겁재 (음양 polarity 차이 vs 甲)', () => {
    expect(r.cycles[0].tenGods.stemTenGod).toBe('EATING_GOD'); // 丙 (WOOD→FIRE 同性)
    expect(r.cycles[1].tenGods.stemTenGod).toBe('SEVEN_KILLINGS'); // 庚 (金剋木 同性)
    expect(r.cycles[2].tenGods.stemTenGod).toBe('ROB_WEALTH'); // 乙 (同 WOOD 異性)
  });

  it('지장간 십신: 丙寅 대운의 지지 정기(寅→甲) = 비견', () => {
    expect(r.cycles[0].tenGods.branchMainTenGod).toBe('PEER'); // 寅 정기 甲 vs 甲
    expect(r.cycles[0].tenGods.hiddenStemTenGods.length).toBe(3); // 寅 = 戊·丙·甲
  });

  it('ENGINE-12 cycle identifiers (ordinal / start age) are carried over unchanged', () => {
    expect(r.cycles.map((c) => c.ordinal)).toEqual([1, 2, 3]);
    expect(r.cycles.map((c) => c.startAgeInclusive)).toEqual([5, 15, 25]);
    expect(r.cycles.map((c) => c.endAgeInclusive)).toEqual([14, 24, 34]);
    expect(r.provenance.tenGodRuleVersion).toBe('deokbunai.saju-ten-gods.v1');
    expect(r.ruleVersion).toBe('deokbunai.myungri-daewoon-ten-gods.v1');
  });

  it('fail-closed: no cycles / invalid day master', () => {
    const noCycles = calculateDaewoonTenGods({ dayMaster: 'JIA', cycles: [] });
    expect(noCycles.capability).toBe('UNAVAILABLE');
    if (noCycles.capability === 'UNAVAILABLE') expect(noCycles.reason).toBe('NO_CYCLES');
    const badDm = calculateDaewoonTenGods({ dayMaster: 'NOPE' as never, cycles: CYCLES });
    if (badDm.capability === 'UNAVAILABLE') expect(badDm.reason).toBe('INVALID_DAY_MASTER');
    else throw new Error('expected UNAVAILABLE');
  });
});
