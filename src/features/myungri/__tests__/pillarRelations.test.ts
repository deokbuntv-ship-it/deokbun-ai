// Unit + invariant tests for the canonical pillar relation tables (합/충/형/파/해 · 삼합 · 방합).
// These assert KNOWN classical 명리 facts against explicit tables, plus structural invariants of
// the modular formulas — so a future edit that corrupts a table fails loudly.
import {
  DEOKBUNAI_MYUNGRI_RELATIONS_V1_RULE,
  branchRelations,
  branchSetRelations,
  stemRelation,
} from '../rules/pillarRelations';
import { EARTHLY_BRANCHES, HEAVENLY_STEMS } from '../../interpretation';

const RV = DEOKBUNAI_MYUNGRI_RELATIONS_V1_RULE.ruleVersion;

describe('천간 (stem) relations', () => {
  it('천간합: 甲己→土, 乙庚→金, 丙辛→水, 丁壬→木, 戊癸→火 (canonical 化 element)', () => {
    expect(stemRelation('JIA', 'JI')).toMatchObject({
      kind: 'STEM_COMBINATION',
      nominalTransformElement: 'EARTH',
      ruleVersion: RV,
    });
    expect(stemRelation('YI', 'GENG')?.nominalTransformElement).toBe('METAL');
    expect(stemRelation('BING', 'XIN')?.nominalTransformElement).toBe('WATER');
    expect(stemRelation('DING', 'REN')?.nominalTransformElement).toBe('WOOD');
    expect(stemRelation('GUI', 'WU')?.nominalTransformElement).toBe('FIRE'); // 戊癸, order-independent
  });

  it('천간충: 甲庚 乙辛 丙壬 丁癸; 戊·己(중앙 土) 무충', () => {
    expect(stemRelation('JIA', 'GENG')).toMatchObject({ kind: 'STEM_CLASH' });
    expect(stemRelation('BING', 'REN')).toMatchObject({ kind: 'STEM_CLASH' });
    expect(stemRelation('WU', 'JIA')).toBeNull(); // 戊 has no clash partner
    expect(stemRelation('JI', 'YI')).toBeNull();
  });

  it('same stem and non-relations → null', () => {
    expect(stemRelation('JIA', 'JIA')).toBeNull();
    expect(stemRelation('JIA', 'YI')).toBeNull();
  });

  it('invariant: exactly 5 combination pairs and 4 clash pairs across all 45 unordered pairs', () => {
    let combos = 0;
    let clashes = 0;
    for (let i = 0; i < HEAVENLY_STEMS.length; i += 1) {
      for (let j = i + 1; j < HEAVENLY_STEMS.length; j += 1) {
        const r = stemRelation(HEAVENLY_STEMS[i], HEAVENLY_STEMS[j]);
        if (r?.kind === 'STEM_COMBINATION') combos += 1;
        if (r?.kind === 'STEM_CLASH') clashes += 1;
      }
    }
    expect(combos).toBe(5);
    expect(clashes).toBe(4);
  });
});

describe('지지 (branch) pairwise relations', () => {
  const kinds = (a: Parameters<typeof branchRelations>[0], b: Parameters<typeof branchRelations>[1]) =>
    branchRelations(a, b)
      .map((r) => r.kind)
      .sort();

  it('육합: 子丑 寅亥 午未', () => {
    expect(kinds('ZI', 'CHOU')).toContain('BRANCH_SIX_COMBINATION');
    expect(kinds('WU', 'WEI')).toContain('BRANCH_SIX_COMBINATION');
  });

  it('육충: 子午 寅申 辰戌', () => {
    expect(kinds('ZI', 'WU')).toContain('BRANCH_CLASH');
    expect(kinds('YIN', 'SHEN')).toContain('BRANCH_CLASH');
    expect(kinds('CHEN', 'XU')).toContain('BRANCH_CLASH');
  });

  it('반합 (half 삼합): 申子→水, 寅午→火 with harmony element', () => {
    const a = branchRelations('SHEN', 'ZI').find((r) => r.kind === 'BRANCH_HALF_THREE_HARMONY');
    expect(a?.harmonyElement).toBe('WATER');
    const b = branchRelations('YIN', 'WU').find((r) => r.kind === 'BRANCH_HALF_THREE_HARMONY');
    expect(b?.harmonyElement).toBe('FIRE');
  });

  it('형: 寅巳(상형) 丑戌(상형) 子卯(무례) 辰辰(자형)', () => {
    expect(kinds('YIN', 'SI')).toContain('BRANCH_PUNISHMENT');
    expect(kinds('CHOU', 'XU')).toContain('BRANCH_PUNISHMENT');
    expect(kinds('ZI', 'MAO')).toContain('BRANCH_PUNISHMENT');
    expect(branchRelations('CHEN', 'CHEN')).toEqual([
      { kind: 'BRANCH_SELF_PUNISHMENT', branches: ['CHEN', 'CHEN'], ruleVersion: RV },
    ]);
    expect(branchRelations('ZI', 'ZI')).toEqual([]); // 子 is not a 자형 branch
  });

  it('파: 子酉 寅亥; 해: 子未 卯辰', () => {
    expect(kinds('ZI', 'YOU')).toContain('BRANCH_DESTRUCTION');
    expect(kinds('ZI', 'WEI')).toContain('BRANCH_HARM');
    expect(kinds('MAO', 'CHEN')).toContain('BRANCH_HARM');
  });

  it('巳申 carries THREE simultaneous relations: 육합 + 파 + 형 (刑合破)', () => {
    expect(kinds('SI', 'SHEN')).toEqual(
      ['BRANCH_DESTRUCTION', 'BRANCH_PUNISHMENT', 'BRANCH_SIX_COMBINATION'].sort(),
    );
  });

  it('寅亥 = 육합 + 파 (합이면서 파)', () => {
    expect(kinds('YIN', 'HAI')).toEqual(['BRANCH_DESTRUCTION', 'BRANCH_SIX_COMBINATION'].sort());
  });

  it('invariant: 6 six-combination, 6 clash, 6 destruction, 6 harm pairs across all 66 unordered pairs', () => {
    const tally: Record<string, number> = {};
    for (let i = 0; i < EARTHLY_BRANCHES.length; i += 1) {
      for (let j = i + 1; j < EARTHLY_BRANCHES.length; j += 1) {
        for (const r of branchRelations(EARTHLY_BRANCHES[i], EARTHLY_BRANCHES[j])) {
          tally[r.kind] = (tally[r.kind] ?? 0) + 1;
        }
      }
    }
    expect(tally.BRANCH_SIX_COMBINATION).toBe(6);
    expect(tally.BRANCH_CLASH).toBe(6);
    expect(tally.BRANCH_DESTRUCTION).toBe(6);
    expect(tally.BRANCH_HARM).toBe(6);
  });
});

describe('지지 set relations (삼합 · 방합 · 삼형)', () => {
  it('삼합 완전국: 申子辰→水, 亥卯未→木, 寅午戌→火, 巳酉丑→金', () => {
    expect(branchSetRelations(['SHEN', 'ZI', 'CHEN'])).toEqual([
      { kind: 'BRANCH_THREE_HARMONY', branches: ['SHEN', 'ZI', 'CHEN'], element: 'WATER', ruleVersion: RV },
    ]);
    expect(branchSetRelations(['YIN', 'WU', 'XU'])[0]).toMatchObject({
      kind: 'BRANCH_THREE_HARMONY',
      element: 'FIRE',
    });
  });

  it('방합 완전국: 寅卯辰→木, 亥子丑→水', () => {
    expect(branchSetRelations(['YIN', 'MAO', 'CHEN'])[0]).toMatchObject({
      kind: 'BRANCH_DIRECTIONAL_UNION',
      element: 'WOOD',
    });
    expect(branchSetRelations(['HAI', 'ZI', 'CHOU'])[0]).toMatchObject({
      kind: 'BRANCH_DIRECTIONAL_UNION',
      element: 'WATER',
    });
  });

  it('삼형 완전: 寅巳申, 丑戌未', () => {
    expect(branchSetRelations(['YIN', 'SI', 'SHEN'])).toContainEqual({
      kind: 'BRANCH_THREE_PUNISHMENT',
      branches: ['YIN', 'SI', 'SHEN'],
      ruleVersion: RV,
    });
    expect(branchSetRelations(['CHOU', 'XU', 'WEI']).some((r) => r.kind === 'BRANCH_THREE_PUNISHMENT')).toBe(true);
  });

  it('partial trio (2 of 3) does NOT form a full set relation', () => {
    expect(branchSetRelations(['SHEN', 'ZI'])).toEqual([]);
    expect(branchSetRelations(['YIN', 'SI'])).toEqual([]);
  });

  it('duplicate branches do not fabricate a full 局 (needs 3 distinct 지)', () => {
    expect(branchSetRelations(['ZI', 'ZI', 'ZI'])).toEqual([]);
  });
});
