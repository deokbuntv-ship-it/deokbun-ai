// MYUNGRI CORE CONSULTATION JUDGES V1 — BUSINESS/MONEY/CAREER/LOVE/REUNION/CHANGE/TIMING.
//
// Fixtures are built via the REAL fact-shaping functions (`analyzeLayer`, `readNatalBaseline`) fed
// small, literal, canonical relation facts (e.g. ZI-WU is a real 六沖 pair, not invented) — never a
// hand-faked LayerAnalysis/NatalBaseline object. `MyungriStructuralV2Result`/`MyungriYongshinResult`
// fixtures are literal objects matching the real AVAILABLE shape exactly (same technique already
// established in myungriYongshin.test.ts for isolating decision logic from a full chart probe).
import { analyzeLayer, type LayerAnalysis } from '../myungriLayer';
import { readNatalBaseline, type NatalStructureInput } from '../myungriNatal';
import type { MyungriStructuralV2Result, StructuralState, SpecialStructureStatusValue } from '../myungriStructuralV2';
import type { MyungriYongshinResult } from '../myungriYongshin';
import {
  judgeAllMyungriConsultationDomains, type ConsultationJudgeDomain, type MyungriConsultationJudgeInput,
} from '../myungriConsultationJudge';
import type { RelationsToNatal } from '@/features/myungri/domain/contracts';
import type { TenGod, SajuPillarPosition } from '@/features/interpretation/saju/derived/contracts';
import type { BranchPairRelationKind, EarthlyBranch } from '@/features/myungri';

const RV = 'deokbunai.myungri-pillar-relations.v1' as const;

function branchHit(position: SajuPillarPosition, kind: BranchPairRelationKind, branches: readonly [EarthlyBranch, EarthlyBranch]): RelationsToNatal['branch'][number] {
  return { position, relation: { kind, branches, ruleVersion: RV } };
}
function relations(branch: RelationsToNatal['branch'] = [], stem: RelationsToNatal['stem'] = []): RelationsToNatal {
  return { stem, branch };
}
function layer(scope: LayerAnalysis['scope'], family: TenGod, rel: RelationsToNatal = relations()): LayerAnalysis {
  return analyzeLayer(scope, family, family, rel);
}
const SILENT_LAYERS: LayerAnalysis[] = [];

function baseline(overrides: Partial<NatalStructureInput> = {}): ReturnType<typeof readNatalBaseline> {
  const input: NatalStructureInput = {
    positionedTenGods: [], natalRelations: null, monthCommandInCommand: null,
    seasonalPhase: null, rootedCount: null, transparentCount: null, hourKnown: true,
    strengthInputs: null,
    ...overrides,
  };
  return readNatalBaseline(input);
}

const SV2_AVAILABLE_BASE: Omit<Extract<MyungriStructuralV2Result, { capability: 'AVAILABLE' }>, 'structuralState' | 'specialStructureStatus'> = {
  capability: 'AVAILABLE', ruleVersion: 'deokbunai.myungri-structural-v2.judgment-graph.v3.1.0',
  graphVersion: 'v3.1.0', dayMaster: 'JIA', dayMasterElement: 'WOOD', hourKnown: true,
  strengthView: { classification: 'STRONG_LEANING', evidence: [], doesNotImply: [], reasoningNodeIds: [] },
  confidenceClass: 'HIGH', numerousnessEvidence: { supportCount: 0, drainCount: 0, incompleteCount: false },
  taskCapacities: 'NOT_EVALUATED', reasoningTrace: [], schoolSensitiveFlags: [],
};
function sv2(structuralState: StructuralState = 'ANCHORED', special: SpecialStructureStatusValue = 'NONE_DETECTED'): MyungriStructuralV2Result {
  return {
    ...SV2_AVAILABLE_BASE, structuralState,
    specialStructureStatus: { status: special, evidence: [], doesNotImply: [], reasoningNodeIds: [] },
  };
}
const UNRESOLVED: MyungriYongshinResult = {
  ruleVersion: 'deokbunai.myungri-yongshin.v1', status: 'UNRESOLVED', primaryCandidate: null,
  supportingCandidates: [], contraindicatedCandidates: [], treatmentRationalesFired: [], candidates: [],
  evidence: [], reasoning: [], uncertaintyReasons: ['no candidate'], johooStatus: 'DEFERRED',
};
function yong(overrides: Partial<MyungriYongshinResult> = {}): MyungriYongshinResult {
  return { ...UNRESOLVED, ...overrides };
}

function input(overrides: Partial<MyungriConsultationJudgeInput> = {}): MyungriConsultationJudgeInput {
  return {
    dayMasterElement: 'WOOD', structuralV2: sv2('ANCHORED'), yongshin: yong(), baseline: null, layers: [],
    ...overrides,
  };
}
function judge(domain: ConsultationJudgeDomain, i: MyungriConsultationJudgeInput) {
  return judgeAllMyungriConsultationDomains(i)[domain];
}

const WEALTH_TENGOD: TenGod = 'DIRECT_WEALTH';
const OUTPUT_TENGOD: TenGod = 'EATING_GOD';
const OFFICER_TENGOD: TenGod = 'DIRECT_OFFICER';

// ══ BUSINESS ═══════════════════════════════════════════════════════════════════════════════════
describe('BUSINESS', () => {
  it('FAVORABLE: output + wealth both present in the natal chart', () => {
    const b = baseline({ positionedTenGods: [
      { position: 'YEAR', tenGod: OUTPUT_TENGOD, source: 'STEM' },
      { position: 'MONTH', tenGod: WEALTH_TENGOD, source: 'STEM' },
    ] });
    const r = judge('BUSINESS', input({ baseline: b }));
    expect(r.status).toBe('FAVORABLE');
    expect(r.opportunities.length).toBeGreaterThan(0);
    expect(r.syntheticInferences.length).toBeGreaterThan(0);
  });

  it('MIXED: opportunity route exists but a heavy CAREER-axis hit burdens execution', () => {
    const b = baseline({ positionedTenGods: [
      { position: 'YEAR', tenGod: OUTPUT_TENGOD, source: 'STEM' },
      { position: 'MONTH', tenGod: WEALTH_TENGOD, source: 'STEM' },
    ] });
    const l = layer('SEWOON', OFFICER_TENGOD, relations([branchHit('MONTH', 'BRANCH_CLASH', ['ZI', 'WU'])]));
    const r = judge('BUSINESS', input({ baseline: b, layers: [l] }));
    expect(r.status).toBe('MIXED');
    expect(r.opportunities.length).toBeGreaterThan(0);
    expect(r.risks.length).toBeGreaterThan(0);
  });

  it('UNRESOLVED: no output/wealth anywhere, no fabricated opportunity', () => {
    const r = judge('BUSINESS', input({ baseline: baseline() }));
    expect(r.status).toBe('UNRESOLVED');
    expect(r.opportunities).toEqual([]);
    expect(r.uncertaintyReasons.length).toBeGreaterThan(0);
  });
});

// ══ MONEY ══════════════════════════════════════════════════════════════════════════════════════
describe('MONEY', () => {
  it('MIXED: earning opportunity present but retention caution (floating root)', () => {
    const b = baseline({
      positionedTenGods: [{ position: 'YEAR', tenGod: WEALTH_TENGOD, source: 'STEM' }],
      strengthInputs: {
        dayMaster: 'JIA', dayMasterElement: 'WOOD', dayMasterRootPositions: [], peerHiddenPositions: [],
        visibleSupportPositions: [], visibleDrainPositions: [], supportRevealed: false,
        elementCounts: { WOOD: 0, FIRE: 0, EARTH: 0, METAL: 0, WATER: 0 }, extremeSeason: null,
      },
    });
    const r = judge('MONEY', input({ baseline: b }));
    expect(r.status).toBe('MIXED');
    expect(r.opportunities.some((o) => o.includes('통로'))).toBe(true);
    expect(r.risks.some((rk) => rk.includes('남기'))).toBe(true);
  });

  it('FAVORABLE: earning opportunity + rooted retention', () => {
    const b = baseline({
      positionedTenGods: [{ position: 'YEAR', tenGod: WEALTH_TENGOD, source: 'STEM' }],
      strengthInputs: {
        dayMaster: 'JIA', dayMasterElement: 'WOOD', dayMasterRootPositions: ['DAY'], peerHiddenPositions: [],
        visibleSupportPositions: [], visibleDrainPositions: [], supportRevealed: false,
        elementCounts: { WOOD: 1, FIRE: 0, EARTH: 0, METAL: 0, WATER: 0 }, extremeSeason: null,
      },
    });
    const r = judge('MONEY', input({ baseline: b }));
    expect(r.status).toBe('FAVORABLE');
  });

  it('UNRESOLVED: no wealth family, no rooting signal', () => {
    const r = judge('MONEY', input({ baseline: baseline() }));
    expect(r.status).toBe('UNRESOLVED');
  });
});

// ══ CAREER ═════════════════════════════════════════════════════════════════════════════════════
describe('CAREER', () => {
  it('FAVORABLE: organizational (officer) support present, no pressure', () => {
    const b = baseline({ positionedTenGods: [{ position: 'MONTH', tenGod: OFFICER_TENGOD, source: 'STEM' }] });
    const r = judge('CAREER', input({ baseline: b }));
    expect(r.status).toBe('FAVORABLE');
  });

  it('CAUTION: heavy friction on the MONTH (career) seat -> change/burden pressure', () => {
    const l = layer('DAEWOON', WEALTH_TENGOD, relations([branchHit('MONTH', 'BRANCH_CLASH', ['YIN', 'SHEN'])]));
    const r = judge('CAREER', input({ layers: [l] }));
    expect(r.status).toBe('CAUTION');
    expect(r.risks.some((rk) => rk.includes('이직') || rk.includes('변동'))).toBe(true);
  });

  it('MIXED: organizational support exists AND the career seat is under pressure', () => {
    const b = baseline({ positionedTenGods: [{ position: 'MONTH', tenGod: OFFICER_TENGOD, source: 'STEM' }] });
    const l = layer('SEWOON', WEALTH_TENGOD, relations([branchHit('MONTH', 'BRANCH_CLASH', ['MAO', 'YOU'])]));
    const r = judge('CAREER', input({ baseline: b, layers: [l] }));
    expect(r.status).toBe('MIXED');
  });

  it('independent-leaning: no officer, output present -> opportunity, not a fabricated org-fit claim', () => {
    const b = baseline({ positionedTenGods: [{ position: 'YEAR', tenGod: OUTPUT_TENGOD, source: 'STEM' }] });
    const r = judge('CAREER', input({ baseline: b }));
    expect(r.status).toBe('FAVORABLE');
    expect(r.opportunities.some((o) => o.includes('독립'))).toBe(true);
  });
});

// ══ LOVE ═══════════════════════════════════════════════════════════════════════════════════════
describe('LOVE', () => {
  it('FAVORABLE: day-seat harmony from an active layer', () => {
    const l = layer('SEWOON', PEER_TENGOD(), relations([branchHit('DAY', 'BRANCH_SIX_COMBINATION', ['ZI', 'CHOU'])]));
    const r = judge('LOVE', input({ layers: [l] }));
    expect(r.status).toBe('FAVORABLE');
  });

  it('CAUTION: natal spouse-seat strain (own natal friction, not a temporal layer)', () => {
    const b = baseline({ natalRelations: { stem: [], branch: [{ positions: ['DAY', 'MONTH'], relation: { kind: 'BRANCH_CLASH', branches: ['ZI', 'WU'], ruleVersion: RV } }], sets: [] } });
    const r = judge('LOVE', input({ baseline: b }));
    expect(r.status).toBe('CAUTION');
    expect(r.risks.some((rk) => rk.includes('배우자 자리'))).toBe(true);
  });

  it('MIXED: natal spouse-seat strain AND a temporal harmony hit both present', () => {
    const b = baseline({ natalRelations: { stem: [], branch: [{ positions: ['DAY', 'MONTH'], relation: { kind: 'BRANCH_CLASH', branches: ['ZI', 'WU'], ruleVersion: RV } }], sets: [] } });
    const l = layer('SEWOON', PEER_TENGOD(), relations([branchHit('DAY', 'BRANCH_SIX_COMBINATION', ['ZI', 'CHOU'])]));
    const r = judge('LOVE', input({ baseline: b, layers: [l] }));
    expect(r.status).toBe('MIXED');
  });
});
function PEER_TENGOD(): TenGod { return 'PEER'; }

// ══ REUNION (never aliased to LOVE) ════════════════════════════════════════════════════════════
describe('REUNION', () => {
  it('MIXED: opening (day-seat harmony) exists but stability is a separate concern (§18 compound truth)', () => {
    const l = layer('SEWOON', PEER_TENGOD(), relations([branchHit('DAY', 'BRANCH_SIX_COMBINATION', ['ZI', 'CHOU'])]));
    const b = baseline({ natalRelations: { stem: [], branch: [{ positions: ['DAY', 'MONTH'], relation: { kind: 'BRANCH_CLASH', branches: ['ZI', 'WU'], ruleVersion: RV } }], sets: [] } });
    const r = judge('REUNION', input({ baseline: b, layers: [l] }));
    expect(r.status).toBe('MIXED');
    expect(r.conclusion).not.toMatch(/재회.*(예|아니오)$/); // never collapses to a bare yes/no
  });

  it('CAUTION: blocked/weak — heavy day-seat strike, no opening', () => {
    const l = layer('SEWOON', PEER_TENGOD(), relations([branchHit('DAY', 'BRANCH_CLASH', ['ZI', 'WU'])]));
    const r = judge('REUNION', input({ layers: [l] }));
    expect(r.status).toBe('CAUTION');
  });

  it('UNRESOLVED: no day-seat contact at all', () => {
    const r = judge('REUNION', input());
    expect(r.status).toBe('UNRESOLVED');
  });

  it('REUNION and LOVE differ on the identical input — not aliased', () => {
    const l = layer('SEWOON', PEER_TENGOD(), relations([branchHit('DAY', 'BRANCH_SIX_COMBINATION', ['ZI', 'CHOU'])]));
    const i = input({ layers: [l] });
    const love = judge('LOVE', i);
    const reunion = judge('REUNION', i);
    expect(love.conclusion).not.toBe(reunion.conclusion);
  });
});

// ══ CHANGE / MOVEMENT ══════════════════════════════════════════════════════════════════════════
describe('CHANGE', () => {
  it('CAUTION: a real heavy hit reads as PRESSURE, phrased as non-guaranteed', () => {
    const l = layer('DAEWOON', WEALTH_TENGOD, relations([branchHit('YEAR', 'BRANCH_CLASH', ['CHEN', 'XU'])]));
    const r = judge('CHANGE', input({ layers: [l] }));
    expect(r.status).toBe('CAUTION');
    expect(r.risks.some((rk) => rk.includes('압력'))).toBe(true);
    expect(r.conclusion).not.toMatch(/이동합니다|이직합니다/); // pressure, never a guaranteed-event claim
  });

  it('a single clash does NOT collapse into a guaranteed-event claim', () => {
    const l = layer('DAEWOON', WEALTH_TENGOD, relations([branchHit('YEAR', 'BRANCH_CLASH', ['CHEN', 'XU'])]));
    const r = judge('CHANGE', input({ layers: [l] }));
    expect(JSON.stringify(r)).not.toMatch(/이동합니다|이직합니다|반드시 변화/);
  });

  it('MIXED: heavy pressure AND harmony support both present', () => {
    const l = layer('DAEWOON', WEALTH_TENGOD, relations([
      branchHit('YEAR', 'BRANCH_CLASH', ['CHEN', 'XU']),
      branchHit('HOUR', 'BRANCH_SIX_COMBINATION', ['ZI', 'CHOU']),
    ]));
    const r = judge('CHANGE', input({ layers: [l] }));
    expect(r.status).toBe('MIXED');
  });

  it('UNRESOLVED: no active layer at all', () => {
    const r = judge('CHANGE', input());
    expect(r.status).toBe('UNRESOLVED');
  });
});

// ══ TIMING ══════════════════════════════════════════════════════════════════════════════════════
describe('TIMING', () => {
  it('SUPPORTIVE (FAVORABLE): an active layer with harmony, no friction', () => {
    const l = layer('SEWOON', WEALTH_TENGOD, relations([branchHit('YEAR', 'BRANCH_SIX_COMBINATION', ['ZI', 'CHOU'])]));
    const r = judge('TIMING', input({ layers: [l] }));
    expect(r.status).toBe('FAVORABLE');
  });

  it('PRESSURE (CAUTION): an active layer with friction, no harmony', () => {
    const l = layer('SEWOON', WEALTH_TENGOD, relations([branchHit('YEAR', 'BRANCH_CLASH', ['ZI', 'WU'])]));
    const r = judge('TIMING', input({ layers: [l] }));
    expect(r.status).toBe('CAUTION');
  });

  it('MIXED_WINDOW (MIXED): one layer contributes both harmony and friction', () => {
    const l = layer('SEWOON', WEALTH_TENGOD, relations([
      branchHit('YEAR', 'BRANCH_CLASH', ['ZI', 'WU']),
      branchHit('HOUR', 'BRANCH_SIX_COMBINATION', ['MAO', 'CHEN']),
    ]));
    const r = judge('TIMING', input({ layers: [l] }));
    expect(r.status).toBe('MIXED');
  });

  it('INSUFFICIENT (UNRESOLVED): no active temporal layer at all', () => {
    const r = judge('TIMING', input({ layers: SILENT_LAYERS }));
    expect(r.status).toBe('UNRESOLVED');
    expect(r.uncertaintyReasons.length).toBeGreaterThan(0);
  });

  it('a silent layer (no relation to natal) contributes nothing — matches TIMING analysis, never a default positive', () => {
    const silent = layer('SEWOON', WEALTH_TENGOD, relations());
    expect(silent.silent).toBe(true);
    const r = judge('TIMING', input({ layers: [silent] }));
    expect(r.status).toBe('UNRESOLVED');
  });
});

// ══ CROSS-DOMAIN DIFFERENTIATION (§26/§28) — no global good/bad chart state ══════════════════════
describe('cross-domain differentiation — no global good/bad chart state', () => {
  it('the SAME chart legitimately produces different statuses across domains', () => {
    const b = baseline({ positionedTenGods: [{ position: 'MONTH', tenGod: OFFICER_TENGOD, source: 'STEM' }] });
    const l = layer('SEWOON', WEALTH_TENGOD, relations([branchHit('DAY', 'BRANCH_CLASH', ['ZI', 'WU'])]));
    const all = judgeAllMyungriConsultationDomains(input({ baseline: b, layers: [l] }));
    const statuses = new Set(Object.values(all).map((r) => r.status));
    expect(statuses.size).toBeGreaterThan(1); // CAREER should read FAVORABLE-leaning while LOVE reads CAUTION
    expect(all.CAREER.status).toBe('FAVORABLE');
    expect(all.LOVE.status).toBe('CAUTION');
  });

  it('there is no GLOBAL_FAVORABLE_SCORE / GLOBAL_BAD_CHART / GLOBAL_LUCK_LEVEL field anywhere in the module', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs') as typeof import('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path') as typeof import('path');
    const source = fs.readFileSync(path.join(__dirname, '../myungriConsultationJudge.ts'), 'utf8');
    expect(source).not.toMatch(/GLOBAL_FAVORABLE_SCORE|GLOBAL_BAD_CHART|GLOBAL_LUCK_LEVEL/);
  });
});

// ══ PRODUCT QUALITY (§28/§37) ═══════════════════════════════════════════════════════════════════
describe('product quality — chart-specific, domain-specific, real synthetic inference', () => {
  it('two materially different charts do NOT produce identical domain reasoning merely because Strength states match', () => {
    const strongState = sv2('ANCHORED');
    const chartA = input({ structuralV2: strongState, baseline: baseline({ positionedTenGods: [{ position: 'MONTH', tenGod: OFFICER_TENGOD, source: 'STEM' }] }) });
    const chartB = input({ structuralV2: strongState, baseline: baseline({ positionedTenGods: [{ position: 'YEAR', tenGod: OUTPUT_TENGOD, source: 'STEM' }] }) });
    expect(judge('CAREER', chartA).conclusion).not.toBe(judge('CAREER', chartB).conclusion);
  });

  it('every non-UNRESOLVED result in this suite carries at least one real synthetic inference', () => {
    const b = baseline({ positionedTenGods: [
      { position: 'YEAR', tenGod: OUTPUT_TENGOD, source: 'STEM' }, { position: 'MONTH', tenGod: WEALTH_TENGOD, source: 'STEM' },
    ] });
    const r = judge('BUSINESS', input({ baseline: b }));
    expect(r.status).not.toBe('UNRESOLVED');
    expect(r.syntheticInferences.length).toBeGreaterThan(0);
    expect(r.syntheticInferences[0].premises.length).toBeGreaterThanOrEqual(2);
  });

  it('a MIXED result carries BOTH supportingEvidence and counterEvidence (contradiction preserved, never averaged)', () => {
    const b = baseline({ positionedTenGods: [{ position: 'MONTH', tenGod: OFFICER_TENGOD, source: 'STEM' }] });
    const l = layer('SEWOON', WEALTH_TENGOD, relations([branchHit('MONTH', 'BRANCH_CLASH', ['MAO', 'YOU'])]));
    const r = judge('CAREER', input({ baseline: b, layers: [l] }));
    expect(r.status).toBe('MIXED');
    expect(r.supportingEvidence.length).toBeGreaterThan(0);
    expect(r.counterEvidence.length).toBeGreaterThan(0);
  });
});

// ══ NEGATIVE SHORTCUT TESTS (§38) ═══════════════════════════════════════════════════════════════
describe('forbidden shortcuts do not determine the verdict', () => {
  it('Strength alone (ANCHORED vs UNANCHORED) does not change BUSINESS when natal/temporal facts are identical', () => {
    const b = baseline({ positionedTenGods: [
      { position: 'YEAR', tenGod: OUTPUT_TENGOD, source: 'STEM' }, { position: 'MONTH', tenGod: WEALTH_TENGOD, source: 'STEM' },
    ] });
    const strong = judge('BUSINESS', input({ baseline: b, structuralV2: sv2('ANCHORED') }));
    const weak = judge('BUSINESS', input({ baseline: b, structuralV2: sv2('UNANCHORED') }));
    expect(strong.status).toBe(weak.status);
    expect(strong.conclusion).toBe(weak.conclusion);
  });

  it('Yongshin alone does not manufacture an opportunity when no natal/temporal fact supports it', () => {
    const withYongshin = judge('BUSINESS', input({ yongshin: yong({ status: 'SELECTED', primaryCandidate: 'FIRE' }) }));
    expect(withYongshin.status).toBe('UNRESOLVED'); // FIRE's family relative to a WOOD DM is OUTPUT, but no natal/temporal fact backs it
  });

  it('one lone ten-god presence does not alone flip MONEY to FAVORABLE without earning+retention reasoning applying', () => {
    const b = baseline({ positionedTenGods: [{ position: 'YEAR', tenGod: OFFICER_TENGOD, source: 'STEM' }] }); // officer, not wealth
    const r = judge('MONEY', input({ baseline: b }));
    expect(r.status).toBe('UNRESOLVED');
  });

  it('one lone branch clash on an UNRELATED axis does not drive REUNION', () => {
    const l = layer('SEWOON', WEALTH_TENGOD, relations([branchHit('MONTH', 'BRANCH_CLASH', ['MAO', 'YOU'])])); // MONTH, not DAY
    const r = judge('REUNION', input({ layers: [l] }));
    expect(r.status).toBe('UNRESOLVED');
  });

  it('element/family COUNT does not drive the verdict — one vs many WEALTH positions reach the same status', () => {
    const one = baseline({ positionedTenGods: [{ position: 'YEAR', tenGod: WEALTH_TENGOD, source: 'STEM' }] });
    const many = baseline({ positionedTenGods: [
      { position: 'YEAR', tenGod: WEALTH_TENGOD, source: 'STEM' }, { position: 'MONTH', tenGod: WEALTH_TENGOD, source: 'STEM' },
      { position: 'HOUR', tenGod: WEALTH_TENGOD, source: 'STEM' },
    ] });
    expect(judge('MONEY', input({ baseline: one })).status).toBe(judge('MONEY', input({ baseline: many })).status);
  });

  it('season/month-command state alone (carried only inside structuralV2.strengthView) is never read by this module', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs') as typeof import('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path') as typeof import('path');
    const source = fs.readFileSync(path.join(__dirname, '../myungriConsultationJudge.ts'), 'utf8');
    const code = source.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    expect(code).not.toMatch(/strengthView\.|numerousnessEvidence\./);
  });

  it('one temporal relation alone (a single hit) does not drive TIMING to FAVORABLE without harmony-only reasoning applying', () => {
    const l = layer('SEWOON', WEALTH_TENGOD, relations([branchHit('YEAR', 'BRANCH_CLASH', ['ZI', 'WU'])])); // friction, not harmony
    const r = judge('TIMING', input({ layers: [l] }));
    expect(r.status).not.toBe('FAVORABLE');
  });

  it('no numeric score/weight/percentage vocabulary anywhere in the module', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs') as typeof import('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path') as typeof import('path');
    const source = fs.readFileSync(path.join(__dirname, '../myungriConsultationJudge.ts'), 'utf8');
    const code = source.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    expect(code).not.toMatch(/weight|score|percentage|majority/i);
  });

  it('no LLM/network client import anywhere in the module', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs') as typeof import('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path') as typeof import('path');
    const source = fs.readFileSync(path.join(__dirname, '../myungriConsultationJudge.ts'), 'utf8');
    expect(source).not.toMatch(/openai|anthropic|claude|fetch\(|XMLHttpRequest|axios/i);
  });
});

// ══ SPECIAL STRUCTURE CANDIDATE (§31) — narrow withhold, not a global block ═══════════════════════
describe('special-structure CANDIDATE narrows, never globally blocks', () => {
  it('a CANDIDATE special-structure chart still resolves domains whose reasoning does not depend on Yongshin', () => {
    const b = baseline({ positionedTenGods: [{ position: 'MONTH', tenGod: OFFICER_TENGOD, source: 'STEM' }] });
    const r = judge('CAREER', input({ baseline: b, structuralV2: sv2('UNANCHORED', 'CANDIDATE'), yongshin: yong({ status: 'NOT_APPLICABLE_SPECIAL_CONFLICT' }) }));
    expect(r.status).toBe('FAVORABLE'); // officer presence alone still resolves — not gated by special-structure status
  });

  it('JOHOO being DEFERRED on Yongshin never blocks a domain judge from resolving', () => {
    const b = baseline({ positionedTenGods: [{ position: 'YEAR', tenGod: WEALTH_TENGOD, source: 'STEM' }] });
    expect(yong().johooStatus).toBe('DEFERRED');
    const r = judge('MONEY', input({ baseline: b }));
    expect(r.status).not.toBe('UNRESOLVED');
  });
});

// ══ DETERMINISM (§39) ══════════════════════════════════════════════════════════════════════════
describe('determinism', () => {
  it('the same facts + same domain always produce a deep-equal result', () => {
    const b = baseline({ positionedTenGods: [{ position: 'YEAR', tenGod: WEALTH_TENGOD, source: 'STEM' }] });
    const i = input({ baseline: b });
    expect(judge('MONEY', i)).toEqual(judge('MONEY', i));
  });

  it('judgeAllMyungriConsultationDomains returns synchronously, never a Promise', () => {
    expect(judgeAllMyungriConsultationDomains(input())).not.toBeInstanceOf(Promise);
  });
});
