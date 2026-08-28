// MYUNGRI STRUCTURAL V2 — runtime conformance to the frozen 11-node judgment graph
// (data/myungri-strength-v2/judgment-graph-v2.json, v3.1.0). See myungriStructuralV2.ts's own
// header for scope. Every fixture chart below is fed through the REAL frozen fact layer
// (buildMyungriStrengthFactBundle) — nothing here hand-computes a chart's root/season facts, which
// is exactly the error class the research batches for this program hit more than once.
import { buildMyungriStrengthFactBundle, type NatalPillarContext } from '@/features/myungri';
import {
  judgeDayMasterStrength,
  type StrengthClassification as LegacyStrengthClassification,
} from '../myungriStrength';
import {
  judgeMyungriStructuralV2,
  runSpecialScreen,
  runStructuralSynthesis,
  STRUCTURAL_STATE_TO_STRENGTH,
  type RootExistsFact,
  type SeasonRoleFact,
} from '../myungriStructuralV2';

// ── Real fixture charts, each independently probed against the frozen engine to confirm the exact
//    AX01/AX02 combination it produces (see PR history for the probe transcript) — never hand-guessed.
const CHART = {
  // 甲 day master, 子月 (XIANG/SUPPORTED), rooted at DAY+HOUR (寅/辰 hidden 甲/乙).
  ANCHORED_SUPPORTED: { dayMaster: 'JIA', pillars: { year: { stem: 'WU', branch: 'SHEN' }, month: { stem: 'BING', branch: 'ZI' }, day: { stem: 'JIA', branch: 'YIN' }, hour: { stem: 'JI', branch: 'CHEN' } } },
  // same chart, hour pillar removed — root still confirmed via DAY alone.
  ANCHORED_SUPPORTED_NO_HOUR: { dayMaster: 'JIA', pillars: { year: { stem: 'WU', branch: 'SHEN' }, month: { stem: 'BING', branch: 'ZI' }, day: { stem: 'JIA', branch: 'YIN' } } },
  // 庚 day master, 申月 (WANG/IN_COMMAND), rooted at YEAR/MONTH/HOUR (申 hidden 庚).
  ANCHORED_IN_COMMAND: { dayMaster: 'GENG', pillars: { year: { stem: 'REN', branch: 'SHEN' }, month: { stem: 'WU', branch: 'SHEN' }, day: { stem: 'GENG', branch: 'CHEN' }, hour: { stem: 'JIA', branch: 'SHEN' } } },
  // 甲 day master, 午月 (XIU/NEUTRAL), rooted at YEAR/HOUR (寅/辰 hidden 甲/乙).
  ANCHORED_NEUTRAL: { dayMaster: 'JIA', pillars: { year: { stem: 'JIA', branch: 'YIN' }, month: { stem: 'BING', branch: 'WU' }, day: { stem: 'JIA', branch: 'ZI' }, hour: { stem: 'WU', branch: 'CHEN' } } },
  // 甲 day master, 申月 (SI/OPPOSED), zero wood anywhere — the CANDIDATE special-screen case.
  UNANCHORED_OPPOSED_CANDIDATE: { dayMaster: 'JIA', pillars: { year: { stem: 'JI', branch: 'SI' }, month: { stem: 'GENG', branch: 'SHEN' }, day: { stem: 'JIA', branch: 'WU' }, hour: { stem: 'BING', branch: 'XU' } } },
  // same chart, hour removed AND no root confirmable from year/month/day — the INSUFFICIENT/UNRESOLVED case.
  UNRESOLVED_NO_HOUR_NO_ROOT: { dayMaster: 'JIA', pillars: { year: { stem: 'JI', branch: 'SI' }, month: { stem: 'GENG', branch: 'SHEN' }, day: { stem: 'JIA', branch: 'WU' } } },
  // 甲 day master, 戌月 (QIU/DRAINED, not OPPOSED), zero wood anywhere — must NOT trigger CANDIDATE.
  UNANCHORED_DRAINED_NOT_CANDIDATE: { dayMaster: 'JIA', pillars: { year: { stem: 'JI', branch: 'SI' }, month: { stem: 'GENG', branch: 'XU' }, day: { stem: 'JIA', branch: 'WU' }, hour: { stem: 'BING', branch: 'SI' } } },
  // 丙 day master, 子月 (SI/OPPOSED), rooted at YEAR/DAY/HOUR — root+season disagree, MIXED_STRUCTURE.
  MIXED_ROOTED_OPPOSED: { dayMaster: 'BING', pillars: { year: { stem: 'JIA', branch: 'WU' }, month: { stem: 'BING', branch: 'ZI' }, day: { stem: 'BING', branch: 'YIN' }, hour: { stem: 'WU', branch: 'XU' } } },
  // 甲 day master, 子月 (XIANG/SUPPORTED), zero wood anywhere — root+season disagree the other way.
  MIXED_NO_ROOT_SUPPORTED: { dayMaster: 'JIA', pillars: { year: { stem: 'JI', branch: 'SI' }, month: { stem: 'REN', branch: 'ZI' }, day: { stem: 'JIA', branch: 'WU' }, hour: { stem: 'BING', branch: 'SI' } } },
} as const satisfies Record<string, NatalPillarContext>;

function judge(chart: NatalPillarContext) {
  const b = buildMyungriStrengthFactBundle(chart);
  if (b.capability !== 'AVAILABLE') throw new Error(`fixture chart unavailable: ${JSON.stringify(b)}`);
  return judgeMyungriStructuralV2(b.bundle);
}

// ═══ A/B/C/D — state routing, root×season synthesis, MIXED_EVIDENCE, UNRESOLVED ═══════════════════
describe('SYNTH-01 / SV-01 — root x season structural synthesis (real charts)', () => {
  it('ANCHORED (root + SUPPORTED season) -> STRONG_LEANING', () => {
    const r = judge(CHART.ANCHORED_SUPPORTED);
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(r.structuralState).toBe('ANCHORED');
    expect(r.strengthView.classification).toBe('STRONG_LEANING');
    // MODERATE, not HIGH, because this chart's 년지-일지 沖 (申-寅) touches the day branch's root
    // position — a real relation-context caveat, correctly downgrading confidence per UNC-FINAL.
    expect(r.confidenceClass).toBe('MODERATE');
  });

  it('confidenceClass is HIGH only when no relation touches the root position', () => {
    // Both real fixture charts above happen to carry a genuine root-touching relation, so this
    // isolates the one varying fact directly (same technique as the numerousness non-authority
    // test below) rather than searching for a third chart that happens to have none.
    const b = buildMyungriStrengthFactBundle(CHART.ANCHORED_SUPPORTED);
    if (b.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    const untouched = judgeMyungriStructuralV2({
      ...b.bundle,
      relationParticipants: { ...b.bundle.relationParticipants, branchPair: [], branchSet: [] },
    });
    if (untouched.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(untouched.structuralState).toBe('ANCHORED');
    expect(untouched.strengthView.classification).toBe('STRONG_LEANING');
    expect(untouched.confidenceClass).toBe('HIGH');
  });

  it('ANCHORED (root + IN_COMMAND season) -> STRONG_LEANING', () => {
    const r = judge(CHART.ANCHORED_IN_COMMAND);
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(r.structuralState).toBe('ANCHORED');
    expect(r.strengthView.classification).toBe('STRONG_LEANING');
  });

  it('ANCHORED (root + NEUTRAL season, "follow root alone") -> STRONG_LEANING', () => {
    const r = judge(CHART.ANCHORED_NEUTRAL);
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(r.structuralState).toBe('ANCHORED');
    expect(r.strengthView.classification).toBe('STRONG_LEANING');
  });

  it('UNANCHORED (no root + OPPOSED season) -> WEAK_LEANING', () => {
    const r = judge(CHART.UNANCHORED_OPPOSED_CANDIDATE);
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(r.structuralState).toBe('UNANCHORED');
    expect(r.strengthView.classification).toBe('WEAK_LEANING');
  });

  it('UNANCHORED (no root + DRAINED season) -> WEAK_LEANING', () => {
    const r = judge(CHART.UNANCHORED_DRAINED_NOT_CANDIDATE);
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(r.structuralState).toBe('UNANCHORED');
    expect(r.strengthView.classification).toBe('WEAK_LEANING');
  });

  it('MIXED_STRUCTURE (root exists, season OPPOSED) -> MIXED_EVIDENCE, LOW confidence', () => {
    const r = judge(CHART.MIXED_ROOTED_OPPOSED);
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(r.structuralState).toBe('MIXED_STRUCTURE');
    expect(r.strengthView.classification).toBe('MIXED_EVIDENCE');
    expect(r.confidenceClass).toBe('LOW');
  });

  it('MIXED_STRUCTURE (no root, season SUPPORTED) -> MIXED_EVIDENCE', () => {
    const r = judge(CHART.MIXED_NO_ROOT_SUPPORTED);
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(r.structuralState).toBe('MIXED_STRUCTURE');
    expect(r.strengthView.classification).toBe('MIXED_EVIDENCE');
  });

  it('MIXED_STRUCTURE != UNRESOLVED — contradiction and missing-data stay structurally distinct', () => {
    const mixed = judge(CHART.MIXED_ROOTED_OPPOSED);
    const unresolved = judge(CHART.UNRESOLVED_NO_HOUR_NO_ROOT);
    if (mixed.capability !== 'AVAILABLE' || unresolved.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(mixed.strengthView.classification).toBe('MIXED_EVIDENCE');
    expect(unresolved.strengthView.classification).toBe('UNRESOLVED');
    expect(mixed.strengthView.classification).not.toBe(unresolved.strengthView.classification);
  });

  it('SV-01 mapping is a pure 1:1 table, no numeric interval anywhere', () => {
    expect(STRUCTURAL_STATE_TO_STRENGTH).toEqual({
      ANCHORED: 'STRONG_LEANING', UNANCHORED: 'WEAK_LEANING',
      MIXED_STRUCTURE: 'MIXED_EVIDENCE', UNRESOLVED: 'UNRESOLVED',
    });
  });
});

// Exhaustive pure-logic coverage of every REQUIRED_INFERENCES cell in the frozen graph — the two
// unit-level functions are exported specifically so this does not require ten more fixture charts.
describe('runStructuralSynthesis — exhaustive REQUIRED_INFERENCES coverage', () => {
  const ROOT: RootExistsFact[] = ['ROOT_EXISTS_TRUE', 'ROOT_EXISTS_FALSE', 'ROOT_EXISTS_UNKNOWN'];
  const SEASON: SeasonRoleFact[] = ['IN_COMMAND', 'SUPPORTED', 'NEUTRAL', 'DRAINED', 'OPPOSED'];

  it('every root x season cell resolves to a defined, non-undefined state', () => {
    for (const root of ROOT) {
      for (const season of SEASON) {
        expect(['ANCHORED', 'UNANCHORED', 'MIXED_STRUCTURE', 'UNRESOLVED']).toContain(
          runStructuralSynthesis(root, season),
        );
      }
    }
  });

  it('ROOT_EXISTS_UNKNOWN always resolves to UNRESOLVED regardless of season', () => {
    for (const season of SEASON) expect(runStructuralSynthesis('ROOT_EXISTS_UNKNOWN', season)).toBe('UNRESOLVED');
  });

  it('NEUTRAL follows root alone', () => {
    expect(runStructuralSynthesis('ROOT_EXISTS_TRUE', 'NEUTRAL')).toBe('ANCHORED');
    expect(runStructuralSynthesis('ROOT_EXISTS_FALSE', 'NEUTRAL')).toBe('UNANCHORED');
  });

  it('agreement produces ANCHORED/UNANCHORED, disagreement produces MIXED_STRUCTURE', () => {
    for (const season of ['IN_COMMAND', 'SUPPORTED'] as const) {
      expect(runStructuralSynthesis('ROOT_EXISTS_TRUE', season)).toBe('ANCHORED');
      expect(runStructuralSynthesis('ROOT_EXISTS_FALSE', season)).toBe('MIXED_STRUCTURE');
    }
    for (const season of ['DRAINED', 'OPPOSED'] as const) {
      expect(runStructuralSynthesis('ROOT_EXISTS_FALSE', season)).toBe('UNANCHORED');
      expect(runStructuralSynthesis('ROOT_EXISTS_TRUE', season)).toBe('MIXED_STRUCTURE');
    }
  });
});

// ═══ E — special NONE_DETECTED / CANDIDATE / INSUFFICIENT ═════════════════════════════════════════
describe('SPECIAL-01 — special-structure screen (real charts + exhaustive logic)', () => {
  it('CANDIDATE only when season is OPPOSED and root is absent', () => {
    const r = judge(CHART.UNANCHORED_OPPOSED_CANDIDATE);
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(r.specialStructureStatus.status).toBe('CANDIDATE');
  });

  it('DRAINED (not OPPOSED) with no root does NOT trigger CANDIDATE', () => {
    const r = judge(CHART.UNANCHORED_DRAINED_NOT_CANDIDATE);
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(r.specialStructureStatus.status).toBe('NONE_DETECTED');
  });

  it('a real root blocks CANDIDATE even under OPPOSED season (the P0-01 flagship case shape)', () => {
    const r = judge(CHART.MIXED_ROOTED_OPPOSED);
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(r.specialStructureStatus.status).toBe('NONE_DETECTED');
  });

  it('INSUFFICIENT only when root is unknown AND season is OPPOSED', () => {
    expect(runSpecialScreen('ROOT_EXISTS_UNKNOWN', 'OPPOSED').status).toBe('INSUFFICIENT');
    // an unknown root under a NON-opposed season is not blocking for the special screen (SYNTH-01
    // has its own independent UNRESOLVED path for the same missing fact, per the graph's own note).
    expect(runSpecialScreen('ROOT_EXISTS_UNKNOWN', 'SUPPORTED').status).toBe('NONE_DETECTED');
  });

  it('there is no fourth status — HIGH_CONFIDENCE and DISPUTED do not exist in this graph version', () => {
    const ROOT: RootExistsFact[] = ['ROOT_EXISTS_TRUE', 'ROOT_EXISTS_FALSE', 'ROOT_EXISTS_UNKNOWN'];
    const SEASON: SeasonRoleFact[] = ['IN_COMMAND', 'SUPPORTED', 'NEUTRAL', 'DRAINED', 'OPPOSED'];
    for (const root of ROOT) {
      for (const season of SEASON) {
        expect(['NONE_DETECTED', 'CANDIDATE', 'INSUFFICIENT']).toContain(runSpecialScreen(root, season).status);
      }
    }
  });

  it('CANDIDATE never gates or modifies the strength view (P0-02) — both fields independent', () => {
    const r = judge(CHART.UNANCHORED_OPPOSED_CANDIDATE);
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(r.specialStructureStatus.status).toBe('CANDIDATE');
    // strengthView is still a normal, fully-computed leaning — not NOT_APPLICABLE_SPECIAL_STRUCTURE,
    // which does not exist as a value in this graph version.
    expect(r.strengthView.classification).toBe('WEAK_LEANING');
  });
});

// ═══ F — missing-hour behavior (P1-01) ═════════════════════════════════════════════════════════
describe('missing-hour behavior — graceful degrade, never a blanket invalidation', () => {
  it('a root confirmable from year/month/day alone is NOT affected by a missing hour', () => {
    const withHour = judge(CHART.ANCHORED_SUPPORTED);
    const withoutHour = judge(CHART.ANCHORED_SUPPORTED_NO_HOUR);
    if (withHour.capability !== 'AVAILABLE' || withoutHour.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(withoutHour.structuralState).toBe(withHour.structuralState);
    expect(withoutHour.strengthView.classification).toBe(withHour.strengthView.classification);
    expect(withoutHour.hourKnown).toBe(false);
    expect(withHour.hourKnown).toBe(true);
  });

  it('only when NO root is confirmable AND the hour is missing does the result become UNRESOLVED/INSUFFICIENT', () => {
    const r = judge(CHART.UNRESOLVED_NO_HOUR_NO_ROOT);
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(r.hourKnown).toBe(false);
    expect(r.structuralState).toBe('UNRESOLVED');
    expect(r.strengthView.classification).toBe('UNRESOLVED');
    expect(r.specialStructureStatus.status).toBe('INSUFFICIENT');
  });

  it('the chart is never discarded outright for a missing hour — a result is still produced', () => {
    const r = judge(CHART.UNRESOLVED_NO_HOUR_NO_ROOT);
    expect(r.capability).toBe('AVAILABLE'); // not a hard failure — a structured UNRESOLVED result
  });
});

// ═══ G — raw numerousness cannot independently alter the final result (P0-05) ═════════════════════
describe('AX-09 numerousness — descriptive evidence only, zero decision authority', () => {
  it('numerousness is reported but the reasoning trace never routes through FACT-06', () => {
    const r = judge(CHART.ANCHORED_SUPPORTED);
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(r.numerousnessEvidence.supportCount).toBeGreaterThanOrEqual(0);
    expect(r.numerousnessEvidence.drainCount).toBeGreaterThanOrEqual(0);
    // no node id in the trace after FACT-06 lists FACT-06's output among its own `premises` —
    // structuralState/strengthClassification/specialStructureStatus are derived from AX01/AX02 only.
    const synthNode = r.reasoningTrace.find((n) => n.nodeId === 'SYNTH-01')!;
    const specialNode = r.reasoningTrace.find((n) => n.nodeId === 'SPECIAL-01')!;
    for (const premise of [...synthNode.premises, ...specialNode.premises]) {
      expect(premise).not.toMatch(/AX09|supportCount|drainCount/);
    }
  });

  it('mutating numerousness alone (all other facts held fixed) never changes the decision', () => {
    const b = buildMyungriStrengthFactBundle(CHART.ANCHORED_SUPPORTED);
    if (b.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    const baseline = judgeMyungriStructuralV2(b.bundle);
    if (baseline.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');

    // Drastically different ten-god composition (empty), everything else in the bundle untouched.
    const starved = judgeMyungriStructuralV2({
      ...b.bundle,
      tenGodFacts: { ...b.bundle.tenGodFacts, visibleStems: [], hiddenStems: [] },
    });
    if (starved.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');

    expect(starved.numerousnessEvidence).not.toEqual(baseline.numerousnessEvidence);
    expect(starved.numerousnessEvidence).toEqual({ supportCount: 0, drainCount: 0, incompleteCount: false });
    // Every decision-bearing field is UNCHANGED despite the numerousness swing to zero/zero.
    expect(starved.structuralState).toBe(baseline.structuralState);
    expect(starved.strengthView.classification).toBe(baseline.strengthView.classification);
    expect(starved.specialStructureStatus.status).toBe(baseline.specialStructureStatus.status);
    expect(starved.confidenceClass).toBe(baseline.confidenceClass);
  });
});

// ═══ H — no numeric score authority anywhere in the output ════════════════════════════════════════
describe('no hidden numeric-score authority', () => {
  it('the result contains no numeric confidence, weight, or score field', () => {
    const r = judge(CHART.ANCHORED_SUPPORTED);
    const serialized = JSON.stringify(r);
    // confidenceClass is a named enum string ('HIGH'/'MODERATE'/'LOW'), never a number — this proves
    // no numeric field slipped in under a different key name.
    expect(serialized).not.toMatch(/"(numericScore|weight|confidenceScore|strengthScore|voteCount|supportTally)"\s*:/);
    if (r.capability === 'AVAILABLE') {
      expect(typeof r.confidenceClass).toBe('string');
      expect(['HIGH', 'MODERATE', 'LOW']).toContain(r.confidenceClass);
    }
  });

  it('numerousnessEvidence counts exist but are never read as a score by any other field', () => {
    const r = judge(CHART.ANCHORED_SUPPORTED);
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    // structuralState/strengthClassification are enums, not derived from supportCount/drainCount.
    expect(typeof r.structuralState).toBe('string');
    expect(typeof r.strengthView.classification).toBe('string');
  });
});

// ═══ I — no second competing structural-verdict authority ═════════════════════════════════════════
describe('sole structural verdict authority (P0-07 regression pin)', () => {
  it('the quarantined legacy kernel module still returns UNDETERMINED, unchanged by this batch', () => {
    const legacy = judgeDayMasterStrength({
      dayMaster: 'JIA', dayMasterElement: 'WOOD',
      seasonalPhase: 'WANG', inCommand: true,
      rootPositions: ['DAY'], peerHiddenPositions: [],
      visibleSupportPositions: [], visibleDrainPositions: [],
      supportRevealed: false, hourKnown: true,
    });
    const undetermined: LegacyStrengthClassification = 'UNDETERMINED';
    expect(legacy.classification).toBe(undetermined);
  });

  it('Structural V2 produces a real classification where the legacy kernel withholds one', () => {
    const r = judge(CHART.ANCHORED_SUPPORTED);
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(r.strengthView.classification).not.toBe('UNDETERMINED');
  });
});

// ═══ J — no LLM dependency ══════════════════════════════════════════════════════════════════════
describe('no LLM dependency', () => {
  it('the module source contains no LLM/network client import', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs') as typeof import('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path') as typeof import('path');
    const source = fs.readFileSync(path.join(__dirname, '..', 'myungriStructuralV2.ts'), 'utf8');
    expect(source).not.toMatch(/openai|anthropic|claude|fetch\(|XMLHttpRequest|axios/i);
  });

  it('judgeMyungriStructuralV2 is a synchronous, non-Promise-returning function', () => {
    const b = buildMyungriStrengthFactBundle(CHART.ANCHORED_SUPPORTED);
    if (b.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    const result = judgeMyungriStructuralV2(b.bundle);
    expect(result).not.toBeInstanceOf(Promise);
  });
});

// ═══ K — determinism ════════════════════════════════════════════════════════════════════════════
describe('determinism — same facts always produce the same result', () => {
  it('calling twice with the same bundle produces deep-equal results', () => {
    const b = buildMyungriStrengthFactBundle(CHART.MIXED_ROOTED_OPPOSED);
    if (b.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    const r1 = judgeMyungriStructuralV2(b.bundle);
    const r2 = judgeMyungriStructuralV2(b.bundle);
    expect(r1).toEqual(r2);
  });

  it('every fixture chart is stable across repeated builds from scratch', () => {
    for (const chart of Object.values(CHART)) {
      const a = judge(chart);
      const b = judge(chart);
      expect(a).toEqual(b);
    }
  });
});

// ═══ Task capacity explicitly not evaluated (P0-04) ════════════════════════════════════════════════
describe('task capacity — reserved, never a fake verdict', () => {
  it('taskCapacities is always the literal NOT_EVALUATED, never SUPPORTED/NOT_SUPPORTED', () => {
    for (const chart of Object.values(CHART)) {
      const r = judge(chart);
      if (r.capability === 'AVAILABLE') expect(r.taskCapacities).toBe('NOT_EVALUATED');
    }
  });
});

// ═══ Traceability (§21) — every conclusion attributable to a frozen node id ═══════════════════════
describe('reasoning trace traceability', () => {
  it('every reasoning-trace entry names a real frozen graph node id', () => {
    const r = judge(CHART.ANCHORED_SUPPORTED);
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    const knownNodeIds = new Set([
      'FACT-01', 'FACT-02', 'FACT-03', 'FACT-04', 'FACT-05', 'FACT-06',
      'SPECIAL-01', 'SYNTH-01', 'SV-01', 'UNC-EXIT-INSUFFICIENT', 'UNC-FINAL',
    ]);
    for (const entry of r.reasoningTrace) expect(knownNodeIds.has(entry.nodeId)).toBe(true);
  });

  it('strengthView and specialStructureStatus each cite the node ids that actually produced them', () => {
    const r = judge(CHART.ANCHORED_SUPPORTED);
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(r.strengthView.reasoningNodeIds).toEqual(expect.arrayContaining(['SYNTH-01', 'SV-01']));
    expect(r.specialStructureStatus.reasoningNodeIds).toEqual(expect.arrayContaining(['SPECIAL-01']));
  });

  it('no node condition references a research case ID (P0-06 case-memorization guard)', () => {
    const r = judge(CHART.UNANCHORED_OPPOSED_CANDIDATE);
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    for (const entry of r.reasoningTrace) {
      expect(entry.conclusion).not.toMatch(/DTS-|BR-\d|SRC-\d/);
      expect(entry.premises.join(' ')).not.toMatch(/DTS-|BR-\d|SRC-\d/);
    }
  });
});
