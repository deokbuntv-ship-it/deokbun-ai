// V4A — PROPOSITION GRAPH REASONING KERNEL (software ontology; NO astrology doctrine lives here).
//
// WHY THIS EXISTS. Three generations failed for one architectural reason: the conclusion was chosen first and
// then decorated. V1/V2 chose it with scores and votes; V3 replaced those with boolean ladders and then wrapped
// the ALREADY-CHOSEN stance in a `proposition` object — `propositionFor(resolution)` literally copied
// `resolution.conclusion` and labelled the copy `MULTI_FACT_WITHIN_DISCIPLINE` when the evidence array happened
// to hold two items. The independent re-audit counted REAL_SYNTHETIC_INFERENCE = 0 and STATIC_RULE_OUTPUT = 126.
// It was right: an evidence-array length is not a derivation.
//
// The dependency is inverted here:
//
//   FACTS → PREMISES → PROPOSITIONS → DERIVED PROPOSITIONS → SYNTHESIS → VERDICT
//
// A premise is an INTERPRETED statement grounded in named engine facts ("현재 운의 변화 압력이 배우자 자리에
// 직접 작용한다") — not yet a recommendation. A proposition is a semantic conclusion that cites the premises it
// stands on. A DERIVED proposition is one that no single premise states, produced by a NAMED rule that had to
// find a pattern across several premises. The verdict is read off the graph at the end; it can never be the
// input to it.
//
// THIS FILE DEFINES NO ASTROLOGY. Relation vocabulary, adequacy and derivation plumbing are software concepts.
// The doctrine that licenses each interpretation is named per-premise in `doctrineReference`.
import type {
  DataReliability, Discipline, JudgmentDomain, QuestionIntent, TemporalScope,
} from '../contracts';

// ── PREMISES ─────────────────────────────────────────────────────────────────────────────────────

/**
 * WHAT a premise says about its target. Deliberately NOT a polarity scale: these are not ±1 values to be
 * summed, they are distinct semantic relations, and rules match on the RELATION, never on a sign.
 */
export type SemanticRelation =
  | 'SUPPORTS'      // 이 축을 받쳐 준다
  | 'OPPOSES'       // 이 축을 정면으로 거스른다
  | 'ACTIVATES'     // 지금 이 축이 실제로 움직인다
  | 'WEAKENS'       // 힘을 빼앗는다
  | 'DELAYS'        // 방향은 유지되나 지금은 아니다
  | 'ACCELERATES'
  | 'CONNECTS'      // 두 자리가 맞물린다 (합)
  | 'SEPARATES'
  | 'STABILIZES'    // 흔들려도 되돌아오는 바탕
  | 'DESTABILIZES'  // 자리 자체가 흔들린다 (충·형)
  | 'CONSTRAINS'    // 할 수는 있으나 범위가 제한된다
  | 'ENABLES'       // 할 수 있는 바탕이 있다
  | 'ABSENT';       // 이 축을 받칠 구조가 원국에 없다 (부재도 사실이다)

/** What ROLE the premise plays for the asked question — never a strength. */
export type PremiseRole =
  | 'ASSERTS'    // 이 축에 대해 직접 무언가를 주장한다
  | 'QUALIFIES'  // 다른 주장의 범위를 좁히거나 조건을 붙인다
  | 'DESCRIBES'; // 구조를 서술할 뿐, 방향을 주장하지 않는다

/** How close this premise sits to the asked question. Metadata for rules — NOT convertible into a winner. */
export type PremiseApplicability = 'DIRECT' | 'CONTEXTUAL' | 'BACKGROUND';

/**
 * WHAT KIND of structural thing this premise is about, as a STRUCTURED tag.
 *
 * Derivation rules match on this, never on the Korean text. The first cut of the rules did
 * `p.target.includes('겁재')` and `p.target.includes('계절')`, which makes the user-facing wording
 * load-bearing: rename a label for readability and a rule silently stops firing. §9 is explicit that the
 * wording must not BE the reasoning, and a rule keyed on a display string violates that even when it happens
 * to work.
 */
export type PremiseConcept =
  | 'NATAL_FAMILY'      // 원국 십신 계열의 유무
  | 'SEASONAL_FOOTING'  // 월령 득령/실령
  | 'ROOTING'           // 통근
  | 'NATAL_SEAT_STRAIN' // 원국 자체의 자리 마찰
  | 'LAYER_ACTIVATION'  // 시기 층이 어떤 축을 움직임
  | 'RIVAL_CLAIM'       // 겁재 — 같은 몫을 두고 겨루는 기운
  | 'SEAT_CONTACT'      // 시기 층이 원국 자리에 닿음 (충·형·합…)
  | 'LAYER_SILENT'      // 시기 층이 원국과 관계를 맺지 않음
  | 'DOCTRINE_BLOCK'    // 채택 학파가 없어 판정을 보류한 지점
  | 'ADAPTED';          // 아직 전제 그래프로 이관되지 않은 학문의 출력

/**
 * WHAT a claim is about, as a STRUCTURED identity — V4B's highest-priority fix.
 *
 * V4A carried `target` as a Korean display string and matched claims by AXIS alone, so two propositions about
 * completely different things could be treated as the same proposition merely because both were filed under
 * CAREER. That is how a long-term reading of 원국 관성 and a this-month strike on 원국 월지 became "방향은
 * 맞지만 지금은 아니다" — a temporal decomposition of two claims that were never about the same subject matter.
 *
 * **SAME AXIS IS NOT SAME TARGET.** Equality is `key`, never `label`; the label is for humans only.
 */
export type TargetKind =
  | 'NATAL_SEAT'          // 원국 년/월/일/시 자리
  | 'TEN_GOD_FAMILY'      // 원국 재성·관성·식상·비겁·인성 계열
  | 'LUCK_LAYER'          // 대운/세운/월운 그 자체
  | 'DAY_MASTER_FOOTING'  // 일간의 계절 기반 / 뿌리
  | 'PALACE'              // 자미두수 궁
  | 'BOARD_SEAT'          // 기문둔갑 값부·값사·문
  | 'DOCTRINE_GAP'        // 채택 학파가 없어 판정을 보류한 지점
  | 'COMPOSITE';          // 서로 다른 대상 사이의 관계를 다루는 복합 결론

export type SemanticTarget = {
  /** Stable identity. Two claims about the same thing share this EXACTLY. Matching uses only this. */
  key: string;
  /** Human label. Display only — never matched on. */
  label: string;
  kind: TargetKind;
};

/** Structural target equality. The single place "same thing" is decided. */
export const sameTarget = (a: SemanticTarget, b: SemanticTarget): boolean => a.key === b.key;

export const target = (kind: TargetKind, id: string, label: string): SemanticTarget =>
  ({ key: `${kind}:${id}`, label, kind });

export type DivinationPremise = {
  id: string;
  discipline: Discipline;
  /** Engine-traceable facts this interpretation stands on. Empty is only legal for an ABSENT relation. */
  sourceFactIds: string[];
  /** Whose chart. */
  subject: string;
  /** WHAT the premise is about — structured, so rules can compare identity rather than wording. */
  target: SemanticTarget;
  questionIntent: QuestionIntent;
  questionAxis: JudgmentDomain;
  temporalScope: TemporalScope;
  semanticRelation: SemanticRelation;
  /** Structured subject of the premise. Rules match on THIS, never on `target`'s Korean text. */
  concept: PremiseConcept;
  /** The interpreted statement, in plain Korean. Still a premise: never a recommendation. */
  assertion: string;
  role: PremiseRole;
  reliability: DataReliability;
  applicability: PremiseApplicability;
  /** Which adopted rule licensed reading the fact this way. Traceability, not decoration. */
  doctrineReference: string;
};

// ── ADEQUACY (NON-DIRECTIONAL — §11) ─────────────────────────────────────────────────────────────

/**
 * V3's `evidenceAdequacy` merged support and contradiction into one scale, so ADDING a counter-premise could
 * make a claim look BETTER supported. That is not a confidence measure, it is a disguised score, and the
 * re-audit flagged it. Adequacy here answers exactly one question — "do we have enough relevant material to
 * state this proposition at all?" — and it answers it about each side SEPARATELY. It never chooses a side.
 */
export type AdequacyLevel = 'ADEQUATE' | 'THIN' | 'NONE';

/**
 * SEMANTIC SIDES — the V4B correction.
 *
 * `supportAdequacy` describes the premises that BACK THIS PROPOSITION'S ASSERTION, whatever that assertion's
 * real-world valence is. For the proposition "현재 실행은 불리하다", the 충 that establishes the obstruction is
 * SUPPORTING evidence — it supports the claim. V4A leaked the opposite intuition into the projection layer:
 * an UNFAVORABLE proposition read `counterAdequacy` to decide how firmly to say AGAINST, so the strength of a
 * negative claim was being read off the material that ARGUED WITH it. Sides are now about the claim, never
 * about whether the news is good.
 */
export type PropositionAdequacy = {
  /** Enough to assert this proposition? Counter-premises can never raise this. */
  supportAdequacy: AdequacyLevel;
  /** Enough standing AGAINST this proposition? Support-premises can never raise this. */
  counterAdequacy: AdequacyLevel;
  /** Was the input complete enough (exact birth time, computable layers)? */
  dataCompleteness: 'COMPLETE' | 'PARTIAL' | 'INSUFFICIENT';
  /** Does adopted doctrine actually cover this claim, or is it blocked pending a school? */
  doctrineApplicability: 'ADOPTED' | 'PARTIAL' | 'BLOCKED';
};

/** Adequacy of ONE side, from that side's premises only. A side with a DIRECT premise on exact data is adequate. */
function sideAdequacy(premises: DivinationPremise[]): AdequacyLevel {
  if (premises.length === 0) return 'NONE';
  const direct = premises.some((p) => p.applicability === 'DIRECT');
  const exact = premises.some((p) => p.reliability === 'EXACT');
  return direct && exact ? 'ADEQUATE' : 'THIN';
}

export function computeAdequacy(
  supporting: DivinationPremise[],
  opposing: DivinationPremise[],
  opts: { dataComplete: boolean; doctrine: PropositionAdequacy['doctrineApplicability'] },
): PropositionAdequacy {
  return {
    // Computed from DISJOINT inputs — this is the structural guarantee that a counter cannot inflate support.
    supportAdequacy: sideAdequacy(supporting),
    counterAdequacy: sideAdequacy(opposing),
    dataCompleteness: opts.dataComplete
      ? 'COMPLETE'
      : supporting.length + opposing.length > 0 ? 'PARTIAL' : 'INSUFFICIENT',
    doctrineApplicability: opts.doctrine,
  };
}

// ── PROPOSITIONS ─────────────────────────────────────────────────────────────────────────────────

/**
 * WHAT KIND of conclusion this is. A descriptive question must be able to produce a finished answer WITHOUT
 * ever entering a FOR/AGAINST pipeline — that was a V2 category error the type system now prevents.
 */
export type ConclusionType =
  | 'STRUCTURAL'   // 구조가 이러하다 — descriptive, no direction
  | 'CAUSAL'       // 이 구조 때문에 이런 일이 생긴다
  | 'DIRECTIONAL'  // 이 축에 유리/불리하다
  | 'TEMPORAL'     // 지금이냐 나중이냐
  | 'COMPOUND';    // 두 축(또는 방향과 시점)이 동시에 참이다

/** Direction is a PROPERTY of a directional conclusion, not the identity of the proposition. */
export type ConclusionDirection = 'FAVORABLE' | 'UNFAVORABLE' | 'RESTRICTED' | 'NONE';

/**
 * WHEN a conclusion is RESTRICTED, what kind of restriction it is. The rule that produced the conclusion
 * declares this itself, so projecting to the legacy stance enum needs no lookup ladder: a TIMING restriction
 * is "방향은 맞으나 지금은 아니다", a SCOPE restriction is "해도 되지만 범위를 좁혀야 한다".
 */
export type RestrictionKind = 'TIMING' | 'SCOPE' | 'CAPACITY';

/** `PRIMITIVE` = a single premise restated. Anything else is the id of the rule that had to find a pattern. */
export const PRIMITIVE_RULE = 'PRIMITIVE' as const;

export type ReasonedProposition = {
  id: string;
  discipline: Discipline | 'CROSS';
  subject: string;
  /** Structured — see `SemanticTarget`. Contradiction, temporal split, causal chain and reinforcement all
   *  require target identity, so this can never be a display string. */
  target: SemanticTarget;
  questionIntent: QuestionIntent;
  questionAxis: JudgmentDomain;
  temporalScope: TemporalScope;
  /** The semantic conclusion. Rendering happens LATER and separately (§9) — this is not a template output. */
  assertion: string;
  conclusionType: ConclusionType;
  direction: ConclusionDirection;
  /** Set only when `direction === 'RESTRICTED'` — the rule states what kind of restriction it found. */
  restriction?: RestrictionKind;
  /**
   * True when this proposition is a DIRECT answer to the question that was asked.
   *
   * Two comparisons are deliberately kept apart (V4B §3/§4):
   *   · **Same structural target** — required for TEMPORAL DECOMPOSITION. Only one thing can have a direction
   *     that is right while its timing is wrong, so a timing split needs the exact same 자리/궁/좌.
   *   · **Both answering the asked matter** — enough for CONTRADICTION and REINFORCEMENT. When 명리 reads 월지
   *     and 자미 reads 관록궁, they are reading different structures but answering the SAME question, and they
   *     really can disagree about it.
   * Collapsing these two into "same axis" is what produced C7; collapsing them into "same target" would make
   * cross-discipline disagreement undetectable while Ziwei/Qimen remain unmigrated.
   */
  answersAsked?: boolean;
  /**
   * The claim is HEDGED ("조건이 갖춰지면") rather than definite. An explainable professional distinction:
   * a side that commits asserts more than one that only leaves the door open, and when nothing else separates
   * two opposed claims this is a real reason rather than an invented one.
   */
  qualified?: boolean;
  supportingPremiseIds: string[];
  opposingPremiseIds: string[];
  derivedFromPropositionIds: string[];
  /** Premises that bear on this claim but that adopted doctrine cannot currently resolve (§13 honesty). */
  unresolvedPremiseIds: string[];
  doctrineReferences: string[];
  /** `PRIMITIVE`, or the NAMED derivation rule that produced this conclusion. */
  derivationRule: string;
  adequacy: PropositionAdequacy;
};

// ── REAL SYNTHETIC INFERENCE (§23) ───────────────────────────────────────────────────────────────

/**
 * The VERIFIED vocabulary. Only the metamorphic harness may assign `REAL_SYNTHETIC_INFERENCE`, and only after
 * observing that removing a required premise actually changes the conclusion. Runtime code cannot produce it.
 */
export type SynthesisClass =
  | 'REAL_SYNTHETIC_INFERENCE'
  | 'MULTI_FACT_SUMMARY'
  | 'STATIC_RULE_OUTPUT'
  | 'UNSUPPORTED_INFERENCE';

/**
 * Classify one proposition. This is deliberately STRICT and deliberately NOT length-based: the V3 counter
 * asked "does the evidence array have more than one entry?", which every multi-fact restatement passes.
 *
 * REAL requires that a named rule combined premises the caller can inspect, AND that the resulting assertion
 * is not something any one of those premises already said. Materiality itself is proven separately, by the
 * metamorphic tests — a conclusion that survives deleting its premises is decorative, and no static property
 * of the object can reveal that.
 */
/**
 * RUNTIME MAY ONLY NOMINATE. It may NOT certify.
 *
 * V4A's classifier awarded `REAL_SYNTHETIC_INFERENCE` from object shape — "two distinct premise signatures and
 * the text differs from theirs" — and the QA pack then COUNTED that self-awarded label. The independent audit
 * showed the effect plainly: 2 genuinely real inferences were reported as 117. A number a component assigns to
 * its own output and then tallies is not a measurement.
 *
 * So the runtime now answers only a screening question — "could this POSSIBLY be a real synthesis?" — and
 * disqualifies what obviously cannot be. Whether a candidate IS real is decided elsewhere, by removing its
 * premises and observing whether the conclusion actually moves (`certifySynthesis` in the test harness).
 */
export type SynthesisCandidacy =
  /** Structurally eligible: a named rule combined ≥2 distinct grounded inputs into a new statement. */
  | 'CANDIDATE_SYNTHESIS'
  /** A single premise restated. Never an inference, whatever it is labelled. */
  | 'STATIC_RULE_OUTPUT'
  /** Multiple facts listed or echoed, with no new claim. */
  | 'MULTI_FACT_SUMMARY'
  /** Nothing grounds it at all. */
  | 'UNSUPPORTED_INFERENCE';

export function screenSynthesis(
  p: ReasonedProposition,
  premisesById: Map<string, DivinationPremise>,
): SynthesisCandidacy {
  const sources = [...new Set([...p.supportingPremiseIds, ...p.opposingPremiseIds])];
  const known = sources.map((id) => premisesById.get(id)).filter((x): x is DivinationPremise => !!x);

  if (known.length === 0 && p.derivedFromPropositionIds.length === 0) return 'UNSUPPORTED_INFERENCE';
  if (p.derivationRule === PRIMITIVE_RULE) return 'STATIC_RULE_OUTPUT';

  // Distinctness is measured on STRUCTURED identity — including the target key, which V4A omitted, so two
  // premises about different things but the same axis counted as one.
  const distinct = new Set(known.map((x) => `${x.semanticRelation}|${x.questionAxis}|${x.temporalScope}|${x.target.key}`));
  if (distinct.size < 2 && p.derivedFromPropositionIds.length < 2) return 'MULTI_FACT_SUMMARY';
  if (known.some((x) => x.assertion === p.assertion)) return 'MULTI_FACT_SUMMARY';
  return 'CANDIDATE_SYNTHESIS';
}

/** Census of CANDIDACY. Deliberately not named "real" — nothing here has been verified yet. */
export function screenAll(
  props: ReasonedProposition[],
  premises: DivinationPremise[],
): Record<SynthesisCandidacy, number> {
  const byId = new Map(premises.map((p) => [p.id, p]));
  const out: Record<SynthesisCandidacy, number> = {
    CANDIDATE_SYNTHESIS: 0, MULTI_FACT_SUMMARY: 0, STATIC_RULE_OUTPUT: 0, UNSUPPORTED_INFERENCE: 0,
  };
  for (const p of props) out[screenSynthesis(p, byId)] += 1;
  return out;
}

// ── DERIVATION RULES ─────────────────────────────────────────────────────────────────────────────

export type DerivationContext = {
  subject: string;
  questionIntent: QuestionIntent;
  askedAxis: JudgmentDomain;
  dataComplete: boolean;
};

/**
 * A derivation rule looks for a PATTERN across premises/propositions and, when it finds one, states a
 * conclusion none of them states alone. It returns null when the pattern is absent — a rule that always fires
 * is a template, not a rule.
 */
export type DerivationRule = {
  id: string;
  /** What pattern this rule recognises, in one line — printed into the QA pack. */
  describes: string;
  apply(
    premises: DivinationPremise[],
    derivedSoFar: ReasonedProposition[],
    ctx: DerivationContext,
  ): ReasonedProposition[];
};

/**
 * Run the rule set to a FIXED POINT so a rule can build on another rule's output (that is what makes this a
 * graph rather than one pass of pattern matching). Bounded because a rule that keeps producing new ids would
 * otherwise loop; the bound is a safety net, never a semantic limit.
 */
export function runDerivations(
  rules: DerivationRule[],
  premises: DivinationPremise[],
  seed: ReasonedProposition[],
  ctx: DerivationContext,
): ReasonedProposition[] {
  const out = [...seed];
  const seen = new Set(out.map((p) => p.id));
  for (let pass = 0; pass < 4; pass += 1) {
    let added = false;
    for (const rule of rules) {
      for (const produced of rule.apply(premises, out, ctx)) {
        if (seen.has(produced.id)) continue;
        seen.add(produced.id);
        out.push(produced);
        added = true;
      }
    }
    if (!added) break;
  }
  return out;
}

/**
 * SUPERSESSION — the ONLY way one proposition outranks another here, and it is structural, not numeric:
 * B supersedes A when B accounts for every premise A accounts for AND at least one more. A conclusion that
 * explains strictly more of the evidence is the better conclusion; there is no score to compare.
 */
export function supersedes(b: ReasonedProposition, a: ReasonedProposition): boolean {
  if (b.id === a.id) return false;
  if (b.questionAxis !== a.questionAxis) return false;
  const bp = new Set([...b.supportingPremiseIds, ...b.opposingPremiseIds]);
  const ap = [...a.supportingPremiseIds, ...a.opposingPremiseIds];
  if (ap.length === 0) return false;
  if (!ap.every((id) => bp.has(id))) return false;
  return bp.size > ap.length || b.derivedFromPropositionIds.includes(a.id);
}

/** The propositions nothing else supersedes — the graph's leaves, which are what synthesis reads. */
export function standingPropositions(all: ReasonedProposition[]): ReasonedProposition[] {
  return all.filter((p) => !all.some((other) => supersedes(other, p)));
}

let counter = 0;
/** Stable-per-run ids. Deterministic (no clock, no randomness) so a run can be replayed and diffed. */
export function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}_${counter}`;
}
export function resetIds(): void {
  counter = 0;
}
