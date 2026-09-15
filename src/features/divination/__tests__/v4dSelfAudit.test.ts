// V4D §42 — THE FORBIDDEN PATTERNS, AS AN EXECUTABLE GUARD.
//
// Every item on §42's list is a defect that has ALREADY shipped at least once in this kernel's history, and
// each was found by an independent audit rather than by the suite. These assertions exist so the next one is
// caught here instead.
//
// They read SOURCE, so they strip comments first: every one of these files explains the pattern it removed,
// and matching that explanation would fail a file for documenting its own fix.
import { ALL_DERIVATION_RULES, MYUNGRI_RULES, isCanonicalTarget } from '@/features/divination';

const read = (p: string) =>
  require('fs').readFileSync(require('path').join(process.cwd(), p), 'utf8') as string;
const code = (p: string) => read(p).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

const KERNEL = [
  'src/features/divination/reasoning/kernel.ts',
  'src/features/divination/reasoning/crossRules.ts',
  'src/features/divination/reasoning/crossReasoner.ts',
  'src/features/divination/reasoning/myungriReasoner.ts',
  'src/features/divination/reasoning/myungriRules.ts',
  'src/features/divination/reasoning/myungriPremises.ts',
  'src/features/divination/reasoning/disciplineAdapter.ts',
  'src/features/divination/reasoning/targets.ts',
  'src/features/divination/reasoning/graphQuery.ts',
  'src/features/divination/reasoning/graphExtension.ts',
  'src/features/divination/axisOntology.ts',
  'src/features/divination/claimOntology.ts',
];

describe('§42 — evidence quantity confers no authority', () => {
  it('supersession compares no set sizes at all', () => {
    const s = code('src/features/divination/reasoning/kernel.ts');
    const body = s.slice(s.indexOf('export function supersedes'), s.indexOf('export function standingPropositions'));
    // The V4C tiebreak was `[...bp].some((id) => !ap.includes(id))` — a strict superset of premises.
    expect(body).not.toMatch(/\.size|\.length/);
    expect(body).not.toMatch(/supportingPremiseIds|opposingPremiseIds/);
    // The ONLY route is the declared derivation link.
    expect(body).toContain('b.derivedFromPropositionIds.includes(a.id)');
  });

  it('no "more evidence wins" survives anywhere in the kernel', () => {
    for (const p of KERNEL) {
      const s = code(p);
      expect(s).not.toMatch(/evidence(Count|Score)|voteCount|\btally\b/i);
      expect(s).not.toMatch(/\.size\s*>\s*[a-zA-Z_]+\.length/);
    }
  });
});

describe('§42 — a temporal band never stands in for a scope', () => {
  it('supersession compares the EXACT scope', () => {
    const s = code('src/features/divination/reasoning/kernel.ts');
    const body = s.slice(s.indexOf('export function supersedes'), s.indexOf('export function standingPropositions'));
    expect(body).toContain('b.temporalScope !== a.temporalScope');
    expect(body).not.toContain('temporalBand');
  });

  it('the relation classifier compares the EXACT scope before it ever consults a band', () => {
    const s = code('src/features/divination/reasoning/crossRules.ts');
    const body = s.slice(s.indexOf('export function classifyPair'), s.indexOf('export type SubordinationReason'));
    expect(body).toContain('a.temporalScope !== b.temporalScope');
    // …and the band is only used to tell the two temporal relations apart, never to equate two scopes.
    expect(body).toContain("'DIFFERENT_TIME_BAND'");
    expect(body).toContain("'DIFFERENT_TIME_SCALE'");
  });
});

describe('§42 — claim compatibility is not a boolean', () => {
  it('the binary decisional/non-decisional test is gone from supersession', () => {
    const s = code('src/features/divination/reasoning/kernel.ts');
    expect(s).not.toMatch(/const decisional = \(p: ReasonedProposition\)/);
    expect(s).toContain('claimKind(b) !== claimKind(a)');
  });

  it('and the claim ontology declares no outcome, only a shape', () => {
    const s = read('src/features/divination/claimOntology.ts');
    // §32 — a claim kind says what SHAPE a statement has. It must not encode strength, favourability, or
    // any doctrine-specific claim.
    expect(s).not.toMatch(/강약|용신|신강|신약|길|흉/);
    expect(code('src/features/divination/claimOntology.ts')).not.toMatch(/score|weight|rank|priority/i);
  });
});

describe('§42 — cross candidate identity is lossless, and no first specification is retained', () => {
  const s = code('src/features/divination/reasoning/crossRules.ts');

  it('every candidate key is DERIVED from the specification', () => {
    // V4C hand-wrote a key at each add() site and each one omitted most of the semantics.
    expect(s).toContain('const candidateIdentity = (');
    expect(s).not.toMatch(/key:\s*'CROSS_[A-Z_]+:'/);
    for (const field of ['spec.questionAxis', 'spec.target.key', 'spec.conclusionType', 'spec.direction',
      'spec.temporalScope', 'spec.restriction']) {
      expect(s).toContain(field);
    }
  });

  it('merging touches PROVENANCE only — the specification is never rewritten', () => {
    const add = s.slice(s.indexOf('const add = (c: Candidate)'), s.indexOf('const emit = ('));
    expect(add).not.toMatch(/existing\.spec\s*=/);
    expect(add).toMatch(/existing\.from/);
  });
});

describe('§42 — no first-match decides a verdict', () => {
  it('neither reasoner selects its answer with `.find(`', () => {
    for (const p of ['src/features/divination/reasoning/crossReasoner.ts',
      'src/features/divination/reasoning/myungriReasoner.ts',
      'src/features/divination/reasoning/graphExtension.ts']) {
      const s = code(p);
      expect(s).toContain('resolveAnswer(');
      expect(s).not.toMatch(/const\s+primary\s*=\s*[^;]*\.find\(/);
      expect(s).not.toMatch(/(standing|onAsked|candidates)\.find\(/);
    }
  });

  it('every remaining top-N over a competing set is ordered by CONTENT first', () => {
    const s = code('src/features/divination/reasoning/myungriReasoner.ts');
    const timing = s.slice(s.indexOf('timingSignals:'), s.indexOf('domainSubJudgments:'));
    expect(timing).toContain('.sort(');
    const stored = code('src/features/chat/server/storedDecisionGrounding.ts');
    // The follow-up prompt's evidence cap is ordered AND reported.
    expect(stored).toMatch(/\.sort\([\s\S]{0,200}\.slice\(0, 4\)/);
    expect(stored).toContain('건만 옮겼습니다');
  });
});

describe('§42 — required parents are cited, and the graph parser fails closed', () => {
  it('a derived conclusion whose rule declares a parent CITES that parent', () => {
    const s = code('src/features/divination/reasoning/myungriRules.ts');
    // The id accounts for derived parents, so two conclusions built on two different contests cannot collide.
    expect(s).toContain('parentIds: string[] = []');
    // INFLOW_VS_RETENTION names its retention half by whatever establishes it.
    expect(s).toContain('const retentionMembers = [');
    expect(s).toContain('contested.map((c) => c.target)');
  });

  it('every derivation rule that can appear in a persisted graph is registered', () => {
    for (const r of MYUNGRI_RULES) expect(ALL_DERIVATION_RULES).toContain(r.id);
    expect(ALL_DERIVATION_RULES).toContain('PRIMITIVE');
    expect(ALL_DERIVATION_RULES).toContain('CROSS_TIMING_SPLIT');
  });

  it('the parser reconstructs rather than returning the payload it was handed', () => {
    const s = code('src/features/chat/server/decisionMeta.ts');
    expect(s).not.toContain('return v as CrossDivinationVerdict;');
    expect(s).toContain('return restored as unknown as CrossDivinationVerdict;');
  });

  it('and the target validator is a closed registry, not a regex', () => {
    const s = code('src/features/divination/reasoning/targets.ts');
    expect(s).not.toMatch(/const NAMESPACE: Record<TargetKind, RegExp>/);
    expect(s).toContain('const VALIDATE: Record<TargetKind, IdValidator>');
    // mint and restore run the SAME function — V4C shared only the regex, which is how they drifted.
    expect(s).toMatch(/export function target\([\s\S]{0,200}VALIDATE\[kind\]\(id, 0\)/);
    expect(s).toMatch(/export function isCanonicalTarget\([\s\S]{0,600}VALIDATE\[kind\]\(/);
    expect(isCanonicalTarget({ key: 'COMPOSITE:X', label: 'x', kind: 'COMPOSITE' })).toBe(false);
  });
});

describe('§42 — a refinement does not build a second graph, and one row has one clock', () => {
  const s = code('src/features/chat/server/buildServerConsultation.ts');

  it('the refinement EXTENDS the restored graph', () => {
    expect(s).toContain('extendGraph(');
    expect(s).toContain("continuation === 'REFINE_EXISTING' ? previousMeta?.divinationVerdict ?? null : null");
  });

  it('the temporal context resolves from the SAME instant the verdict did', () => {
    expect(s).toContain('buildResolvedTemporalContext(question, evaluationInstant, effectiveGrounding)');
    expect(s).not.toContain('buildResolvedTemporalContext(question, deps.nowEpochSeconds');
  });

  it('and the extension never rewrites what makes it the same graph', () => {
    const g = code('src/features/divination/reasoning/graphExtension.ts');
    for (const forbidden of ['question:', 'evaluatedAtEpochSeconds:', 'premises:', 'disciplineJudgments:']) {
      // the returned object spreads `...v` and overrides only the axis-dependent fields
      expect(g.slice(g.indexOf('return {'))).not.toContain(forbidden);
    }
  });
});

describe('§42 — the doctrine freeze holds', () => {
  it('no strength or Yongshin verdict is wired into the kernel', () => {
    for (const p of KERNEL) {
      expect(code(p)).not.toMatch(/judgeDayMasterStrength|judgeYongshin|STRENGTH_LABEL/);
    }
  });

  it('the axis ontology declares relationships, never outcomes', () => {
    // Comments are stripped: the file's own note explaining that the prose MOVED names the functions it no
    // longer has, and matching that would fail the file for documenting its own fix.
    const s = code('src/features/divination/axisOntology.ts');
    expect(s).not.toContain('agreedHeadline');
    expect(s).not.toContain('unresolvedHeadline');
    expect(s).not.toMatch(/열려 있는 자리로|크게 벌일 자리는/);
    // What it DOES declare is a relationship, and GENERAL — the absence of an axis — is not one half of a matter.
    expect(s).toContain('axesShareOneMatter');
    expect(s).toContain("if (a === 'GENERAL' || b === 'GENERAL') return false;");
  });
});
