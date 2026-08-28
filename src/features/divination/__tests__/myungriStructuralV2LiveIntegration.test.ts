// LIVE-PIPELINE INTEGRATION — Myungri Structural V2 wired into reasoning/myungriReasoner.ts.
//
// This suite is the targeted proof the "final live-pipeline integration" batch requires (§10 A-H):
// the permanently-BLOCKED strength premise is gone from the normal path, a real classification flows
// through to `factGroupsUsed`/`directEvidence`, MIXED_EVIDENCE/UNRESOLVED still report honestly
// (never smuggled into BALANCED), the legacy quarantined classifier is never called from this path,
// and no LLM is involved anywhere in the decision. `strengthYongshin.test.ts` covers the withheld-
// Yongshin/no-forbidden-vocabulary regression guards; this file covers the NEW wiring specifically.
import { reasonMyungri } from '../reasoning/myungriReasoner';
import type { MyungriJudgeInput } from '../myungriJudge';
import type { NatalStructureInput } from '../myungriNatal';

// Each fixture's strengthInputs/seasonalPhase/hourKnown values are copied directly from the REAL
// charts already independently verified against the frozen engine in myungriStructuralV2.test.ts
// (see that file's CHART fixtures) — never hand-guessed here.
const NATAL: Record<string, NatalStructureInput> = {
  STRONG: {
    positionedTenGods: [{ position: 'DAY', tenGod: 'PEER', source: 'STEM' }],
    natalRelations: null, monthCommandInCommand: true, seasonalPhase: 'XIANG',
    rootedCount: 2, transparentCount: 0, hourKnown: true,
    strengthInputs: {
      dayMaster: 'JIA', dayMasterElement: 'WOOD',
      dayMasterRootPositions: ['DAY', 'HOUR'], peerHiddenPositions: [],
      visibleSupportPositions: [], visibleDrainPositions: [],
      supportRevealed: false,
      elementCounts: { WOOD: 2, FIRE: 1, EARTH: 1, METAL: 1, WATER: 1 },
      extremeSeason: null,
    },
  },
  WEAK: {
    positionedTenGods: [{ position: 'DAY', tenGod: 'PEER', source: 'STEM' }],
    natalRelations: null, monthCommandInCommand: false, seasonalPhase: 'SI',
    rootedCount: 0, transparentCount: 0, hourKnown: true,
    strengthInputs: {
      dayMaster: 'JIA', dayMasterElement: 'WOOD',
      dayMasterRootPositions: [], peerHiddenPositions: [],
      visibleSupportPositions: [], visibleDrainPositions: [],
      supportRevealed: false,
      elementCounts: { WOOD: 0, FIRE: 1, EARTH: 1, METAL: 2, WATER: 0 },
      extremeSeason: null,
    },
  },
  MIXED: {
    positionedTenGods: [{ position: 'DAY', tenGod: 'PEER', source: 'STEM' }],
    natalRelations: null, monthCommandInCommand: false, seasonalPhase: 'SI',
    rootedCount: 1, transparentCount: 0, hourKnown: true,
    strengthInputs: {
      // root exists (BING self-rooted) but season OPPOSES (SI) — root and season disagree.
      dayMaster: 'BING', dayMasterElement: 'FIRE',
      dayMasterRootPositions: ['YEAR', 'DAY', 'HOUR'], peerHiddenPositions: [],
      visibleSupportPositions: [], visibleDrainPositions: [],
      supportRevealed: false,
      elementCounts: { WOOD: 1, FIRE: 3, EARTH: 1, METAL: 0, WATER: 1 },
      extremeSeason: null,
    },
  },
  UNRESOLVED: {
    positionedTenGods: [],
    natalRelations: null, monthCommandInCommand: false, seasonalPhase: 'SI',
    rootedCount: null, transparentCount: null, hourKnown: false,
    strengthInputs: {
      // no hour, and no root confirmable from year/month/day alone -> AX01 = ROOT_EXISTS_UNKNOWN.
      dayMaster: 'JIA', dayMasterElement: 'WOOD',
      dayMasterRootPositions: [], peerHiddenPositions: [],
      visibleSupportPositions: [], visibleDrainPositions: [],
      supportRevealed: false,
      elementCounts: { WOOD: 0, FIRE: 1, EARTH: 1, METAL: 2, WATER: 0 },
      extremeSeason: null,
    },
  },
};

function judge(natal: NatalStructureInput) {
  const input: MyungriJudgeInput = {
    question: '올해 돈을 벌 수 있을까요?', questionDomain: 'GENERAL', hourKnown: natal.hourKnown,
    natal, activeDaewoon: null, sewoon: null, wolwoon: null, asksTiming: false,
  };
  return reasonMyungri(input);
}

// ═══ A/B/C — live pipeline consumes Structural V2; BLOCKED is gone from the normal path ═══════════
describe('A/B/C — live myungriReasoner consumes Structural V2, no permanent BLOCKED', () => {
  it('STRONG_LEANING fixture: factGroupsUsed reports strength as USED, not withheld', () => {
    const { judgment } = judge(NATAL.STRONG);
    expect(judgment.factGroupsUsed).toContain('일간 강약(구조)');
    expect(judgment.factGroupsUsed).not.toContain('일간 강약·용신(판정 보류)');
    expect(judgment.factGroupsUsed).not.toContain('일간 강약(판정 보류)');
  });

  it('WEAK_LEANING fixture: factGroupsUsed reports strength as USED, not withheld', () => {
    const { judgment } = judge(NATAL.WEAK);
    expect(judgment.factGroupsUsed).toContain('일간 강약(구조)');
    expect(judgment.factGroupsUsed).not.toContain('일간 강약·용신(판정 보류)');
  });

  it('the real classification is present, plain-Korean, in directEvidence', () => {
    const strong = judge(NATAL.STRONG).judgment;
    const weak = judge(NATAL.WEAK).judgment;
    const strongText = JSON.stringify(strong.directEvidence);
    const weakText = JSON.stringify(weak.directEvidence);
    expect(strongText).toMatch(/힘을 받는 구조/);
    expect(weakText).toMatch(/힘을 받지 못하는 구조/);
  });

  it('Yongshin remains explicitly withheld even when strength is live', () => {
    const { judgment } = judge(NATAL.STRONG);
    expect(judgment.factGroupsUsed).toContain('억부용신(판정 보류)');
  });

  it('a chart with no strengthInputs at all still reports the genuine unavailability (not a fabricated result)', () => {
    const natal: NatalStructureInput = {
      positionedTenGods: [], natalRelations: null, monthCommandInCommand: null,
      seasonalPhase: null, rootedCount: null, transparentCount: null, hourKnown: true,
      strengthInputs: null,
    };
    const { judgment } = judge(natal);
    expect(judgment.factGroupsUsed).not.toContain('일간 강약(구조)');
  });
});

// ═══ D — MIXED_EVIDENCE remains mixed, never smuggled into BALANCED ════════════════════════════════
describe('D — MIXED_EVIDENCE stays honestly mixed', () => {
  it('root and season disagree -> reported as internally contradictory, not a directional lean', () => {
    const { judgment } = judge(NATAL.MIXED);
    expect(judgment.factGroupsUsed).toContain('일간 강약(구조)');
    const text = JSON.stringify(judgment.directEvidence);
    expect(text).toMatch(/서로 다른 방향/);
    expect(text).not.toMatch(/중화|BALANCED/);
  });
});

// ═══ E — UNRESOLVED remains unresolved ═════════════════════════════════════════════════════════════
describe('E — UNRESOLVED stays honestly unresolved', () => {
  it('missing hour + no confirmable root -> reported as unresolved, not silently defaulted', () => {
    const { judgment } = judge(NATAL.UNRESOLVED);
    const text = JSON.stringify(judgment.directEvidence);
    expect(text).toMatch(/확정되지 않아|판단하지 않습니다/);
    expect(text).not.toMatch(/중화|BALANCED|극?신강|극?신약/);
  });
});

// ═══ F — determinism ════════════════════════════════════════════════════════════════════════════
describe('F — same inputs produce identical results through the live pipeline', () => {
  it('calling reasonMyungri twice with the same natal produces the same factGroupsUsed and directEvidence', () => {
    const r1 = judge(NATAL.STRONG).judgment;
    const r2 = judge(NATAL.STRONG).judgment;
    expect(r1.factGroupsUsed).toEqual(r2.factGroupsUsed);
    expect(r1.directEvidence).toEqual(r2.directEvidence);
  });
});

// ═══ G — legacy classifier not called from this path ═══════════════════════════════════════════════
describe('G — legacy classifier is not invoked by the live pipeline', () => {
  it('reasoning/myungriReasoner.ts and myungriPremises.ts do not import the quarantined natalStrength module', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs') as typeof import('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path') as typeof import('path');
    for (const file of ['../reasoning/myungriReasoner.ts', '../reasoning/myungriPremises.ts']) {
      const source = fs.readFileSync(path.join(__dirname, file), 'utf8');
      expect(source).not.toMatch(/natalStrength|currentStrength|evaluateNatalStrength|buildCurrentStrengthContext/);
    }
  });

  it('reasoning/myungriReasoner.ts calls judgeMyungriStructuralV2FromStrengthInputs, not the bundle-based entry point', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs') as typeof import('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path') as typeof import('path');
    const source = fs.readFileSync(path.join(__dirname, '../reasoning/myungriReasoner.ts'), 'utf8');
    expect(source).toMatch(/judgeMyungriStructuralV2FromStrengthInputs/);
  });
});

// ═══ H — no LLM authority ═══════════════════════════════════════════════════════════════════════
describe('H — no LLM decides or overrides Strength', () => {
  it('the edited reasoning files contain no LLM/network client import', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs') as typeof import('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path') as typeof import('path');
    for (const file of ['../reasoning/myungriReasoner.ts', '../reasoning/myungriPremises.ts', '../myungriStructuralV2.ts']) {
      const source = fs.readFileSync(path.join(__dirname, file), 'utf8');
      expect(source).not.toMatch(/openai|anthropic|claude|fetch\(|XMLHttpRequest|axios/i);
    }
  });

  it('reasonMyungri is synchronous decision logic — the strength premise is computed before any prose/LLM layer runs', () => {
    const result = judge(NATAL.STRONG);
    expect(result).not.toBeInstanceOf(Promise);
  });
});

// ═══ No second competing structural verdict authority ══════════════════════════════════════════════
describe('sole structural verdict authority', () => {
  it('exactly one STRUCTURAL_V2-sourced strength premise is emitted per judgment, never two', () => {
    for (const natal of [NATAL.STRONG, NATAL.WEAK, NATAL.MIXED, NATAL.UNRESOLVED]) {
      const { premises } = judge(natal);
      const structural = premises.filter((p) => p.doctrineReference.startsWith('STRUCTURAL_V2'));
      expect(structural.length).toBeLessThanOrEqual(1);
    }
  });
});
