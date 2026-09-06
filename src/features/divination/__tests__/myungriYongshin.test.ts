// MYUNGRI YONGSHIN V1 — structural-treatment selection built on top of the frozen Structural V2
// judgment graph. Every chart fixture below is one of the REAL, independently-probed charts already
// verified against the frozen engine in myungriStructuralV2.test.ts (copied verbatim, same technique
// myungriStructuralV2LiveIntegration.test.ts already uses) — nothing here hand-computes a chart's
// root/season/relation facts.
import { buildMyungriStrengthFactBundle, calculateNatalRelations, type NatalPillarContext } from '@/features/myungri';
import type { EarthlyBranch } from '@/features/interpretation';
import { judgeMyungriStructuralV2, type MyungriStructuralV2Result } from '../myungriStructuralV2';
import { judgeMyungriYongshin } from '../myungriYongshin';
import type { TenGodFamily } from '../myungriJudge';

const CHART = {
  // 甲 day master, 子月 (SUPPORTED), rooted at DAY+HOUR. Also carries a REAL YEAR↔DAY 지지충 (申-寅).
  ANCHORED_SUPPORTED: { dayMaster: 'JIA', pillars: { year: { stem: 'WU', branch: 'SHEN' }, month: { stem: 'BING', branch: 'ZI' }, day: { stem: 'JIA', branch: 'YIN' }, hour: { stem: 'JI', branch: 'CHEN' } } },
  // 甲 day master, 午月 (NEUTRAL), rooted at YEAR+HOUR. Also carries a REAL MONTH↔DAY 지지충 (午-子).
  ANCHORED_NEUTRAL: { dayMaster: 'JIA', pillars: { year: { stem: 'JIA', branch: 'YIN' }, month: { stem: 'BING', branch: 'WU' }, day: { stem: 'JIA', branch: 'ZI' }, hour: { stem: 'WU', branch: 'CHEN' } } },
  // 甲 day master, 申月 (OPPOSED), zero wood anywhere — Structural V2's own SPECIAL-01 CANDIDATE case.
  UNANCHORED_OPPOSED_CANDIDATE: { dayMaster: 'JIA', pillars: { year: { stem: 'JI', branch: 'SI' }, month: { stem: 'GENG', branch: 'SHEN' }, day: { stem: 'JIA', branch: 'WU' }, hour: { stem: 'BING', branch: 'XU' } } },
  // 甲 day master, 戌月 (DRAINED, not OPPOSED), zero wood anywhere. No branch clash among its 4 branches.
  UNANCHORED_DRAINED_NOT_CANDIDATE: { dayMaster: 'JIA', pillars: { year: { stem: 'JI', branch: 'SI' }, month: { stem: 'GENG', branch: 'XU' }, day: { stem: 'JIA', branch: 'WU' }, hour: { stem: 'BING', branch: 'SI' } } },
  // 丙 day master, 子月 (OPPOSED), rooted at YEAR/DAY/HOUR — root+season disagree, MIXED_STRUCTURE.
  // Also carries a REAL YEAR↔MONTH 지지충 (午-子).
  MIXED_ROOTED_OPPOSED: { dayMaster: 'BING', pillars: { year: { stem: 'JIA', branch: 'WU' }, month: { stem: 'BING', branch: 'ZI' }, day: { stem: 'BING', branch: 'YIN' }, hour: { stem: 'WU', branch: 'XU' } } },
  // A second WEAK-leaning chart with a DIFFERENT day master (丙/FIRE, not 甲/WOOD) — proves EOKBU's
  // output element tracks the actual day master, not a fixed vocabulary item. 酉月(METAL) is DRAINED
  // (火克金) for a FIRE day master, not OPPOSED, and no branch here hides a FIRE stem — no root, no
  // special-structure CANDIDATE trigger.
  UNANCHORED_DRAINED_FIRE_DM: { dayMaster: 'BING', pillars: { year: { stem: 'JI', branch: 'CHOU' }, month: { stem: 'XIN', branch: 'YOU' }, day: { stem: 'BING', branch: 'SHEN' }, hour: { stem: 'GUI', branch: 'HAI' } } },
} as const satisfies Record<string, NatalPillarContext>;

function structuralOf(chart: NatalPillarContext): MyungriStructuralV2Result {
  const b = buildMyungriStrengthFactBundle(chart);
  if (b.capability !== 'AVAILABLE') throw new Error(`fixture chart unavailable: ${JSON.stringify(b)}`);
  return judgeMyungriStructuralV2(b.bundle);
}

function clashesOf(chart: NatalPillarContext): readonly { branches: readonly [EarthlyBranch, EarthlyBranch] }[] {
  const r = calculateNatalRelations(chart);
  return (r?.branch ?? [])
    .filter((p) => p.relation.kind === 'BRANCH_CLASH')
    .map((p) => ({ branches: p.relation.branches }));
}

const NO_FAMILIES: (family: TenGodFamily) => boolean = () => false;
const familyIn = (families: TenGodFamily[]) => (f: TenGodFamily) => families.includes(f);

function judge(chart: NatalPillarContext, familyExists: (f: TenGodFamily) => boolean = NO_FAMILIES) {
  return judgeMyungriYongshin({ structuralV2: structuralOf(chart), branchClashes: clashesOf(chart), familyExists });
}

// ═══ A/B — forbidden mechanical shortcuts rejected ═════════════════════════════════════════════════
describe('A/B — WEAK/STRONG labels never mechanically select a fixed element set', () => {
  it('A: UNANCHORED (WEAK-leaning) primary tracks the ACTUAL day master element, not a fixed element', () => {
    const wood = judge(CHART.UNANCHORED_DRAINED_NOT_CANDIDATE); // 甲/WOOD day master
    const fire = judge(CHART.UNANCHORED_DRAINED_FIRE_DM); // 丙/FIRE day master
    expect(wood.status).toBe('SELECTED');
    expect(fire.status).toBe('SELECTED');
    expect(wood.primaryCandidate).toBe('WOOD'); // 비겁 of a WOOD day master is WOOD itself
    expect(fire.primaryCandidate).toBe('FIRE'); // 비겁 of a FIRE day master is FIRE itself
    expect(wood.primaryCandidate).not.toBe(fire.primaryCandidate);
  });

  it('B: ANCHORED (STRONG-leaning) selects an outlet ONLY when that family actually exists in the chart — never a fixed default', () => {
    const noOutlet = judge(CHART.ANCHORED_NEUTRAL, NO_FAMILIES);
    expect(noOutlet.treatmentRationalesFired).not.toContain('EOKBU');

    const withOutput = judge(CHART.ANCHORED_NEUTRAL, familyIn(['OUTPUT']));
    expect(withOutput.treatmentRationalesFired).toContain('EOKBU');
    expect(withOutput.candidates.find((c) => c.rationale === 'EOKBU')?.element).toBe('FIRE'); // 甲 wood's OUTPUT family is FIRE
  });

  it('the forbidden direction is CONTRAINDICATED, not selected: UNANCHORED never contraindicates PEER/RESOURCE, ANCHORED never contraindicates OUTPUT/WEALTH/OFFICER as primary', () => {
    const weak = judge(CHART.UNANCHORED_DRAINED_NOT_CANDIDATE);
    expect(weak.contraindicatedCandidates).toContain('METAL'); // 甲 wood's OFFICER family is METAL — further conquest of a weak DM

    // 2026-09-02 (YONGSHIN_CONSISTENCY_AUDIT F2/§7) — this half used to assert on
    // `judge(CHART.ANCHORED_NEUTRAL, familyIn(['OUTPUT']))`, which does NOT reach a SELECTED result:
    // that fixture carries a real 子午冲, so for a 甲 WOOD day master the mediator is WOOD (=PEER),
    // EOKBU and TONGGWAN disagree, and the branch returns MULTI_CANDIDATE. The old assertion was
    // therefore checking the contraindication of a result that had explicitly declined to pick a
    // direction — the exact self-contradiction the audit confirmed. MULTI_CANDIDATE now carries no
    // contraindication at all (see the MULTI branch's own comment), so the assertion is split:
    // the SELECTED case still proves the contraindication exists, and the MULTI case proves it does not.
    const strongSelected = judgeMyungriYongshin({
      structuralV2: structuralOf(CHART.ANCHORED_NEUTRAL),
      branchClashes: [], // 충이 없는 ANCHORED 라야 억부 단독 SELECTED 에 도달한다
      familyExists: familyIn(['OUTPUT']),
    });
    expect(strongSelected.status).toBe('SELECTED');
    expect(strongSelected.contraindicatedCandidates).toContain('WATER'); // 甲 wood's RESOURCE family is WATER — over-reinforcing an already-strong DM

    const strongConflicted = judge(CHART.ANCHORED_NEUTRAL, familyIn(['OUTPUT']));
    expect(strongConflicted.status).toBe('MULTI_CANDIDATE');
    expect(strongConflicted.contraindicatedCandidates).toEqual([]);
  });
});

// ═══ C — clear EOKBU selection ══════════════════════════════════════════════════════════════════
describe('C — a clean EOKBU selection', () => {
  it('UNANCHORED with no branch clash selects PEER primary / RESOURCE supporting, EOKBU only', () => {
    const r = judge(CHART.UNANCHORED_DRAINED_NOT_CANDIDATE);
    expect(r.status).toBe('SELECTED');
    expect(r.treatmentRationalesFired).toEqual(['EOKBU']);
    expect(r.primaryCandidate).toBe('WOOD');
    expect(r.supportingCandidates).toContain('WATER');
  });
});

// ═══ E — a real 통관 case ═══════════════════════════════════════════════════════════════════════
describe('E — a real, chart-grounded TONGGWAN case', () => {
  it('a genuine YEAR<->DAY 지지충 (寅-申) is mediated by the mechanically-computed generation-cycle element', () => {
    const clashes = clashesOf(CHART.ANCHORED_SUPPORTED);
    expect(clashes.length).toBeGreaterThan(0); // proves this is a REAL relation on a REAL chart, not invented
    const r = judge(CHART.ANCHORED_SUPPORTED, NO_FAMILIES); // no EOKBU outlet available -> isolates TONGGWAN
    expect(r.status).toBe('SELECTED');
    expect(r.treatmentRationalesFired).toEqual(['TONGGWAN']);
    expect(r.primaryCandidate).toBe('WATER'); // 金克木(寅申) mediated by 水: 金生水, 水生木
  });

  it('the mediator is NOT a static per-clash lookup table: a different real clash on a different chart yields a different mediator', () => {
    const r = judge(CHART.ANCHORED_NEUTRAL, NO_FAMILIES); // real MONTH<->DAY 子午冲
    expect(r.treatmentRationalesFired).toEqual(['TONGGWAN']);
    expect(r.primaryCandidate).toBe('WOOD'); // 水克火(子午) mediated by 木: 水生木, 木生火
  });
});

// ═══ F — a real 병약 case (problem identified, remedy honestly left open) ══════════════════════════
describe('F — BYEONGYAK: problem-first, no fabricated remedy', () => {
  it('MIXED_STRUCTURE (root/season contradiction) reports the pathology and withholds an EOKBU remedy', () => {
    const r = judge(CHART.MIXED_ROOTED_OPPOSED, familyIn(['OUTPUT', 'WEALTH', 'OFFICER'])); // even if outlets exist
    expect(r.treatmentRationalesFired).toContain('BYEONGYAK');
    expect(r.treatmentRationalesFired).not.toContain('EOKBU'); // MIXED_STRUCTURE has no directional EOKBU rule
    expect(r.uncertaintyReasons.some((u) => u.startsWith('병약:'))).toBe(true);
  });

  it('when the SAME chart also carries a real branch clash, TONGGWAN can still resolve to a real candidate alongside the honest BYEONGYAK uncertainty', () => {
    const r = judge(CHART.MIXED_ROOTED_OPPOSED, NO_FAMILIES);
    expect(r.status).toBe('SELECTED');
    expect(r.treatmentRationalesFired).toEqual(expect.arrayContaining(['BYEONGYAK', 'TONGGWAN']));
    expect(r.primaryCandidate).toBe('WOOD'); // same 子午冲 mediator as case E
    expect(r.uncertaintyReasons.length).toBeGreaterThan(0); // the pathology is still surfaced, not hidden by the selection
  });
});

// ═══ I — special CANDIDATE prevents false certainty ════════════════════════════════════════════════
describe('I — special-structure CANDIDATE gates the whole result', () => {
  it('a chart flagged CANDIDATE never receives an ordinary Yongshin verdict', () => {
    const r = judge(CHART.UNANCHORED_OPPOSED_CANDIDATE, familyIn(['OUTPUT', 'WEALTH', 'OFFICER']));
    expect(r.status).toBe('NOT_APPLICABLE_SPECIAL_CONFLICT');
    expect(r.primaryCandidate).toBeNull();
    expect(r.treatmentRationalesFired).toEqual(['SPECIAL_STRUCTURE_CONSTRAINT']);
  });
});

// ═══ H/J — MULTI_CANDIDATE / UNRESOLVED ═════════════════════════════════════════════════════════
describe('H/J — honest MULTI_CANDIDATE and UNRESOLVED, never a silent default', () => {
  it('H: EOKBU and TONGGWAN genuinely disagree -> MULTI_CANDIDATE, no primary invented', () => {
    // Synthetic structuralV2 (mirrors runCore's real AVAILABLE shape, only used to isolate the
    // priority/contradiction logic itself — every element fact below is hand-verified against the
    // fixed five-element cycle, not guessed). An EARTH day master, UNANCHORED (needs EARTH/FIRE
    // support), with a real 子午冲 (ZI/WATER vs WU/FIRE, water controls fire): the mechanically-computed
    // mediator is WOOD — and WOOD controls EARTH, i.e. WOOD is exactly EOKBU's OFFICER-family
    // contraindicated element for an EARTH day master. A genuine, chart-grounded conflict.
    const sv2: MyungriStructuralV2Result = {
      capability: 'AVAILABLE', ruleVersion: 'deokbunai.myungri-structural-v2.judgment-graph.v3.1.0',
      graphVersion: 'v3.1.0', dayMaster: 'WU', dayMasterElement: 'EARTH', hourKnown: true,
      structuralState: 'UNANCHORED',
      strengthView: { classification: 'WEAK_LEANING', evidence: [], doesNotImply: [], reasoningNodeIds: [] },
      specialStructureStatus: { status: 'NONE_DETECTED', evidence: [], doesNotImply: [], reasoningNodeIds: [] },
      confidenceClass: 'HIGH',
      numerousnessEvidence: { supportCount: 0, drainCount: 0, incompleteCount: false },
      taskCapacities: 'NOT_EVALUATED', reasoningTrace: [], schoolSensitiveFlags: [],
    };
    const r = judgeMyungriYongshin({
      structuralV2: sv2,
      branchClashes: [{ branches: ['ZI', 'WU'] }],
      familyExists: NO_FAMILIES,
    });
    expect(r.status).toBe('MULTI_CANDIDATE');
    expect(r.primaryCandidate).toBeNull();
    expect(r.treatmentRationalesFired).toEqual(expect.arrayContaining(['EOKBU', 'TONGGWAN']));
    expect(r.candidates.some((c) => c.element === 'WOOD' && c.rationale === 'TONGGWAN')).toBe(true);
    expect(r.uncertaintyReasons.some((u) => u.includes('상충'))).toBe(true);
  });

  it('a WOOD day master with the SAME 子午冲 has no conflict: the WOOD mediator IS the EOKBU need itself -> SELECTED, not MULTI_CANDIDATE', () => {
    const r = judge(CHART.ANCHORED_NEUTRAL, NO_FAMILIES); // real MONTH<->DAY 子午冲, structuralState ANCHORED — see case E
    expect(r.status).toBe('SELECTED');
  });

  it('J: no EOKBU and no TONGGWAN candidate -> UNRESOLVED, never a fabricated primary', () => {
    const insufficient: MyungriStructuralV2Result = {
      capability: 'INSUFFICIENT', ruleVersion: 'deokbunai.myungri-structural-v2.judgment-graph.v3.1.0',
      graphVersion: 'v3.1.0', reason: '월령 계절 정보(旺相休囚死)가 없어 구조 판정을 시작할 수 없습니다.', blockedAtNodeId: 'FACT-04',
    };
    const j = judgeMyungriYongshin({ structuralV2: insufficient, branchClashes: [], familyExists: NO_FAMILIES });
    expect(j.status).toBe('UNRESOLVED');
    expect(j.primaryCandidate).toBeNull();
    expect(j.uncertaintyReasons.length).toBeGreaterThan(0);
  });
});

// ═══ K — determinism ════════════════════════════════════════════════════════════════════════════
describe('K — same facts always produce the identical result', () => {
  it('calling judgeMyungriYongshin twice with the same input is byte-identical', () => {
    const r1 = judge(CHART.UNANCHORED_DRAINED_NOT_CANDIDATE);
    const r2 = judge(CHART.UNANCHORED_DRAINED_NOT_CANDIDATE);
    expect(r1).toEqual(r2);
  });
});

// ═══ L/M/N — no vote/count/LLM authority ═══════════════════════════════════════════════════════════
describe('L/M/N — no numeric, voting, or LLM authority anywhere in the decision', () => {
  it('L: raw ten-god counts cannot select Yongshin — the module never reads numerousnessEvidence/strengthView at all', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs') as typeof import('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path') as typeof import('path');
    const source = fs.readFileSync(path.join(__dirname, '../myungriYongshin.ts'), 'utf8');
    // strip comments first — the module's own header names the forbidden shortcuts in prose as
    // documentation, which must not itself trip this check.
    const code = source.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    expect(code).not.toMatch(/numerousnessEvidence\.|strengthView\.|supportCount|drainCount|WEAK_LEANING|STRONG_LEANING/);
  });

  it('M: no LLM/network client import anywhere in the module', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs') as typeof import('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path') as typeof import('path');
    const source = fs.readFileSync(path.join(__dirname, '../myungriYongshin.ts'), 'utf8');
    expect(source).not.toMatch(/openai|anthropic|claude|fetch\(|XMLHttpRequest|axios/i);
  });

  it('N: Structural V2 state alone (without branch-relation/ten-god-family facts) cannot fully determine Yongshin — MULTI_CANDIDATE/SELECTED depend on branchClashes and familyExists too', () => {
    const withoutClash = judge(CHART.UNANCHORED_DRAINED_NOT_CANDIDATE, NO_FAMILIES);
    const sameStructuralStateWithClash = judgeMyungriYongshin({
      structuralV2: structuralOf(CHART.UNANCHORED_DRAINED_NOT_CANDIDATE),
      branchClashes: [{ branches: ['YIN', 'SHEN'] }], // synthetic: this chart has none for real
      familyExists: NO_FAMILIES,
    });
    expect(withoutClash.treatmentRationalesFired).not.toContain('TONGGWAN');
    expect(sameStructuralStateWithClash.treatmentRationalesFired).toContain('TONGGWAN');
  });
});

// ═══ synchronous / pure ════════════════════════════════════════════════════════════════════════════
describe('pure, synchronous decision logic', () => {
  it('judgeMyungriYongshin returns synchronously, never a Promise', () => {
    const r = judge(CHART.UNANCHORED_DRAINED_NOT_CANDIDATE);
    expect(r).not.toBeInstanceOf(Promise);
  });
});
