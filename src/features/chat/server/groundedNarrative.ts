// GROUNDED CONSULTATION NARRATIVE V2 — presentation authority for the WHOLE answer body.
//
// AUDIT-DRIVEN REMEDIATION V1 server-materialized only the "전문근거" section (VerifiedEvidenceCatalog). The
// independent 40-case review then showed the dominant remaining failure sits BETWEEN the authoritative
// engine/Cross output and the free-prose rendering of everything ELSE: core interpretation, strengths,
// cautions, domain interpretation and future flow were still free LLM prose, so the model could keep
// inventing 대운 age ranges, 세운/십신 characterizations, phantom palaces, wrong star→palace and pillar
// relationships, and wrong discipline attribution.
//
// This module is PRESENTATION ONLY. It calculates nothing: every claim it carries is an existing Cross /
// Judge / VerifiedEvidence string copied verbatim. It adds three structural things:
//
//   1. GroundedClaimCatalog  — every factual proposition allowed to reach the consumer answer, each with an
//                              id, a discipline attribution, a temporal scope, and an authoritative polarity.
//   2. GroundedNarrativePlan — which user-visible section each claim belongs to, plus the GROUNDED CORPUS
//                              (the union of all authoritative text) the LLM's language is checked against.
//   3. A deterministic gate + fallback — the LLM may write LANGUAGE; it may not introduce a technical or
//                              temporal PRODUCT FACT. A violation strips the offending list item, or (in the
//                              core prose, where a fact cannot be excised) swaps in a deterministic
//                              composition of the same grounded claims instead of fabricated prose.
//
// The LLM keeps its job: natural Korean, transitions, warmth, readability. It simply no longer has authority
// over which technical entity, relationship, or period reaches the user.
import type { ParsedStructuredConsultation } from '@/features/chat/prompts/structuredConsultation';
import {
  type CrossDivinationVerdict, type Discipline, type DivinationJudgment, type JudgmentDomain,
  type TemporalScope, type QuestionIntent,
  contributedNothing, isDeclinedToDecide, stanceValence,
} from '@/features/divination';

import type { ConsultationContentPlan, VerifiedEvidenceCatalogItem } from './consultationContentPlan';
import { joinDistinctSentences, realize } from './koreanRealization';

export const GROUNDED_NARRATIVE_VERSION = 'grounded-narrative@4.0.0';

// ── 1. GROUNDED CLAIM CATALOG ────────────────────────────────────────────────────────────────────────
/** The authoritative stance a claim carries. Never rewritten into its opposite (§6). */
export type ClaimPolarity = 'SUPPORT' | 'LIMIT' | 'MIXED' | 'NEUTRAL';
export type ClaimRole =
  | 'CONCLUSION' | 'CORE_REASON' | 'POSITIVE' | 'CAUTION' | 'CONTRADICTION' | 'TIMING' | 'SYNTHESIS' | 'EVIDENCE'
  // V3 §8 — the verdict's OWN implication sentence, carried as a claim so the deterministic composition can
  // close a causal chain with authoritative text instead of a generic sentence of its own.
  | 'IMPLICATION';

export type GroundedClaim = {
  id: string; // C1.., S1.., T1.., E1.. — stable within one plan
  discipline: Discipline | 'CROSS';
  domain: JudgmentDomain | null;
  scope: TemporalScope | 'UNSCOPED';
  polarity: ClaimPolarity;
  role: ClaimRole;
  /** Server text, VERBATIM and atomic — a compound "A는 열리지만 B는 막힙니다" is never split (§7). */
  authoritativeMeaning: string;
  technicalAnchor?: string;
  provenance: string;
};

/** §14 — the question shape a DECLINED answer must speak in. Derived from the ALREADY-COMPUTED
 *  `verdict.questionIntent` plus the answer plan's comparison recognition — no new classifier, no LLM. */
export type NarrativeIntent = 'DECISION' | 'TIMING' | 'EXPLANATION' | 'TRAIT' | 'COMPARISON';

export function narrativeIntentOf(intent: QuestionIntent, isComparison: boolean): NarrativeIntent {
  if (isComparison) return 'COMPARISON';
  if (intent === 'CAUSE_WHY') return 'EXPLANATION';
  if (intent === 'DESCRIPTIVE') return 'TRAIT';
  if (intent === 'TIMING') return 'TIMING';
  return 'DECISION';
}

export type GroundedNarrativePlan = {
  verdictState: 'DIRECTIONAL' | 'DECLINED';
  intent: NarrativeIntent;
  /** SERVER_OWNED headline material (the LLM may re-say it in its own words, never re-decide it). */
  directConclusion: string;
  claims: readonly GroundedClaim[];
  coreReasons: readonly string[];
  positiveClaims: readonly string[];
  cautionClaims: readonly string[];
  contradictionClaims: readonly string[];
  timingClaims: readonly string[];
  implicationClaims: readonly string[];
  actionBoundary: 'GUIDED' | 'CAUTIOUS';
  /** Disciplines that did not cover this question. NOT_COVERED — never a calculation failure (§15). */
  coverageGaps: readonly Discipline[];
  /** Disciplines that DID carry this question — the other half of the V4 scope-separation claim. */
  coveredBy: readonly Discipline[];
  /**
   * V5 §2 — the disciplines that MATERIALLY contributed: applied, and carrying at least one real finding
   * rather than only a coverage-gap notice (`contributedNothing`). `coveredBy` is an alias of this list;
   * it is named separately because the synthesis mode is decided by its SIZE, not by applicability.
   */
  materialContributors: readonly Discipline[];
  /**
   * COMBINED  ⇒ two or more systems really spoke, so the answer must lead with the combined Cross meaning
   *             (reinforcement / contradiction / scope or temporal separation) that Cross already authorized.
   * SINGLE_SYSTEM ⇒ exactly one system spoke. There is nothing to combine; inventing a three-system
   *             synthesis here is the fabrication the V4 rescore measured. The answer states the usable
   *             stance and the coverage limitation honestly instead.
   * NONE ⇒ no system carried a finding.
   */
  synthesisMode: 'COMBINED' | 'SINGLE_SYSTEM' | 'NONE';
  /** The union of every authoritative string above — the fact boundary the LLM's language is checked against. */
  groundedCorpus: string;
  provenance: readonly ['deokbunai.grounded-narrative-plan.v2'];
};

const byId = (claims: readonly GroundedClaim[], role: ClaimRole): string[] =>
  claims.filter((c) => c.role === role).map((c) => c.id);

const DISCIPLINE_LABEL: Record<Discipline, string> = { MYUNGRI: '명리', ZIWEI: '자미두수', QIMEN: '기문둔갑' };
const disciplineLabel = (d: Discipline): string => DISCIPLINE_LABEL[d];

function evidencePolarity(e: VerifiedEvidenceCatalogItem): ClaimPolarity {
  return e.evidenceRole === 'COUNTER' ? 'LIMIT' : 'SUPPORT';
}

/**
 * Build the catalog + plan from material the verdict and content plan ALREADY carry. Pure and deterministic:
 * same verdict + plan in ⇒ same narrative plan out. No inference authority of its own.
 */
export function buildGroundedNarrativePlan(
  verdict: CrossDivinationVerdict,
  contentPlan: ConsultationContentPlan,
  intent: NarrativeIntent,
): GroundedNarrativePlan {
  const declined = isDeclinedToDecide(verdict);
  const claims: GroundedClaim[] = [];
  let n = 0;
  const add = (c: Omit<GroundedClaim, 'id'>, prefix: string) => {
    n += 1;
    claims.push({ ...c, id: `${prefix}${n}` });
  };

  // CORE REASONS — the structural baseline and the active period, exactly as Cross stated them.
  if (verdict.natalBaseline) {
    add({
      discipline: 'CROSS', domain: verdict.questionDomain, scope: 'NATAL', polarity: 'NEUTRAL',
      role: 'CORE_REASON', authoritativeMeaning: verdict.natalBaseline, provenance: 'CROSS:natalBaseline',
    }, 'C');
  }
  if (verdict.currentFlow) {
    add({
      discipline: 'CROSS', domain: verdict.questionDomain, scope: 'DAEWOON', polarity: 'NEUTRAL',
      role: 'CORE_REASON', authoritativeMeaning: verdict.currentFlow, provenance: 'CROSS:currentFlow',
    }, 'C');
  }
  // COMPOUND TRUTH (§7) — each axis keeps its OWN resolved stance, never averaged into the headline.
  for (const a of verdict.axisVerdicts) {
    if (a.domain === verdict.questionDomain) continue;
    const valence = stanceValence(a.stance);
    if (valence === 'NONE') continue;
    add({
      discipline: a.dominantDiscipline, domain: a.domain, scope: 'UNSCOPED',
      polarity: valence === 'FOR' ? 'SUPPORT' : 'LIMIT',
      role: valence === 'FOR' ? 'POSITIVE' : 'CAUTION',
      authoritativeMeaning: a.conclusion, provenance: `CROSS:axisVerdicts:${a.domain}`,
    }, 'C');
  }
  for (const r of verdict.riskFactors) {
    add({
      discipline: 'CROSS', domain: r.domain, scope: r.temporalScope, polarity: 'LIMIT', role: 'CAUTION',
      authoritativeMeaning: r.meaning, technicalAnchor: r.fact, provenance: 'CROSS:riskFactors',
    }, 'C');
  }
  // CROSS SYNTHESIS (§8) — reinforcement and scope/temporal separation come from Cross, never from the LLM.
  for (const a of verdict.agreementPoints) {
    add({
      discipline: 'CROSS', domain: verdict.questionDomain, scope: 'UNSCOPED', polarity: 'NEUTRAL',
      role: 'SYNTHESIS', authoritativeMeaning: a, provenance: 'CROSS:agreementPoints',
    }, 'S');
  }
  for (const r of verdict.contradictionResolutions) {
    add({
      discipline: r.dominant, domain: verdict.questionDomain, scope: 'UNSCOPED', polarity: 'MIXED',
      role: 'CONTRADICTION', authoritativeMeaning: `${r.conflict} → ${r.resolution}`,
      provenance: 'CROSS:contradictionResolutions',
    }, 'S');
  }
  // V4 §3 SCOPE SEPARATION — WHY this particular set of systems produced this conclusion. Straight from
  // `verdict.contributions[].applied`, which the Cross Judge already decided: the sentence names COVERAGE and
  // nothing else, so it can never become a calculation-failure claim (§15) nor a new metaphysical inference.
  // Carried as a SYNTHESIS claim so it reaches the reader through the same path as every other Cross
  // synthesis, and joins the grounded corpus like any other authoritative string.
  // V5 §2 — MATERIAL contribution, not mere applicability. A discipline that was computed but reported only
  // a coverage gap used to land on the "applied" side of this sentence, so the answer told the reader a
  // system had carried the question when it had said nothing.
  const judgments = verdict.disciplineJudgments as DivinationJudgment[];
  const appliedDisciplines = judgments.filter((j) => !contributedNothing(j))
    .filter((j) => verdict.contributions.find((c) => c.discipline === j.discipline)?.applied !== false)
    .map((j) => j.discipline);
  const unappliedDisciplines = verdict.contributions.map((c) => c.discipline)
    .filter((d) => !appliedDisciplines.includes(d));
  if (appliedDisciplines.length > 0 && unappliedDisciplines.length > 0) {
    add({
      discipline: 'CROSS', domain: verdict.questionDomain, scope: 'UNSCOPED', polarity: 'NEUTRAL',
      role: 'SYNTHESIS',
      authoritativeMeaning: `${appliedDisciplines.map(disciplineLabel).join('·')} 쪽에 이 질문을 직접 보는 자리가 있어 그 근거로 판단했고, `
        + `${unappliedDisciplines.map(disciplineLabel).join('·')}에는 이 축을 직접 다루는 자리가 없어 판단에 넣지 않았습니다.`,
      provenance: 'CROSS:contributions',
    }, 'S');
  }
  // TEMPORAL (§3) — the ONLY authority for anything the answer says about the future.
  if (verdict.timingConclusion) {
    add({
      discipline: 'CROSS', domain: 'TIMING', scope: 'SEWOON', polarity: 'NEUTRAL', role: 'TIMING',
      authoritativeMeaning: verdict.timingConclusion, provenance: 'CROSS:timingConclusion',
    }, 'T');
  }
  // VERIFIED EVIDENCE — reuses the existing catalog ids so the two sections cite the same atoms.
  for (const e of contentPlan.selectedEvidence) {
    claims.push({
      id: e.id, discipline: e.discipline, domain: e.domain, scope: e.temporalScope,
      polarity: evidencePolarity(e), role: 'EVIDENCE',
      authoritativeMeaning: e.canonicalMeaning, technicalAnchor: e.canonicalTechnicalAnchor,
      provenance: e.provenance,
    });
  }
  // V3 §8 — the verdict's own "so what" sentence. Verbatim Cross output, exactly like every claim above;
  // carried LAST so it never displaces a substantive reason in any selection that takes the first N.
  if (verdict.actionableInterpretation) {
    add({
      discipline: 'CROSS', domain: verdict.questionDomain, scope: 'UNSCOPED', polarity: 'NEUTRAL',
      role: 'IMPLICATION', authoritativeMeaning: verdict.actionableInterpretation,
      provenance: 'CROSS:actionableInterpretation',
    }, 'C');
  }

  const coverageGaps = unappliedDisciplines;
  // A time LAYER is grounded when a claim actually stands on it. Cross's own prose does not always spell the
  // layer name out ("지금 흐름이 …" rather than "대운이 …"), so naming a layer that genuinely carries a claim
  // must not read as fabrication — what §3 forbids is a CHARACTERIZATION of a layer that supplied nothing,
  // and that is still caught by the 십신 / age-range rules below.
  const SCOPE_TOKEN: Partial<Record<TemporalScope, string>> = {
    NATAL: '원국', DAEWOON: '대운', SEWOON: '세운', WOLWOON: '월운', PRESENT_MOMENT: '일운',
  };
  const groundedScopeTokens = [...new Set(claims.map((c) => SCOPE_TOKEN[c.scope as TemporalScope]))]
    .filter((s): s is string => !!s);
  const groundedCorpus = [
    ...groundedScopeTokens,
    verdict.primaryConclusion, verdict.dominantBasis, verdict.actionableInterpretation,
    ...verdict.contributions.map((c) => c.contribution),
    ...verdict.favorableFactors.flatMap((e) => [e.fact, e.meaning]),
    ...verdict.evidenceReferences.flatMap((r) => r.lines),
    ...claims.flatMap((c) => [c.authoritativeMeaning, c.technicalAnchor ?? '']),
  ].filter((s) => typeof s === 'string' && s.length > 0).join('\n');
  // CRITICAL ORDERING — the corpus is built from the FULL claim list ABOVE, deduplication happens BELOW.
  // Deduplication is a presentation concern; letting it shrink the corpus would tighten the fact gate and
  // push MORE answers into fallback for text the server itself supplied.
  const distinct = dedupeClaims(claims);

  return {
    verdictState: declined ? 'DECLINED' : 'DIRECTIONAL',
    intent,
    directConclusion: verdict.primaryConclusion,
    claims: distinct,
    coreReasons: byId(distinct, 'CORE_REASON'),
    positiveClaims: byId(distinct, 'POSITIVE'),
    cautionClaims: byId(distinct, 'CAUTION'),
    contradictionClaims: [...byId(distinct, 'SYNTHESIS'), ...byId(distinct, 'CONTRADICTION')],
    timingClaims: byId(distinct, 'TIMING'),
    implicationClaims: byId(distinct, 'IMPLICATION'),
    actionBoundary: contentPlan.actionBoundary,
    coverageGaps,
    coveredBy: appliedDisciplines,
    materialContributors: appliedDisciplines,
    synthesisMode: appliedDisciplines.length >= 2 ? 'COMBINED'
      : appliedDisciplines.length === 1 ? 'SINGLE_SYSTEM' : 'NONE',
    groundedCorpus,
    provenance: ['deokbunai.grounded-narrative-plan.v2'],
  };
}

/**
 * §6 — one authoritative claim, one appearance. The engines emit the SAME sentence through several arrays
 * (a 재백 axis conclusion is also a favorableFactor meaning, and one 화기 meaning is attached to every axis
 * it touches), so the raw catalog carried up to seven ids for one sentence and the answer said it as many
 * times. Identity is EXACT normalized authoritative text — provenance-stable, never fuzzy similarity, so a
 * genuinely different fact with similar wording is always kept. First occurrence wins, which is build order
 * (core → axis → risk → synthesis → timing → evidence → implication); when the survivor carried no
 * technical anchor and a later copy does, the anchor is adopted so §7's concrete evidence is never the thing
 * that gets dropped.
 */
function dedupeClaims(claims: readonly GroundedClaim[]): GroundedClaim[] {
  const kept: GroundedClaim[] = [];
  const seen = new Map<string, number>();
  for (const c of claims) {
    const key = c.authoritativeMeaning.replace(/\s+/g, '');
    const at = seen.get(key);
    if (at === undefined) {
      seen.set(key, kept.length);
      kept.push(c);
      continue;
    }
    if (!kept[at].technicalAnchor && c.technicalAnchor) kept[at] = { ...kept[at], technicalAnchor: c.technicalAnchor };
  }
  return kept;
}

// ── 2. TECHNICAL / TEMPORAL FACT GATE ────────────────────────────────────────────────────────────────
//
// §4/§5 — the previous remediation protected only 전문근거. This extends the contract to EVERY user-visible
// field: outside the server-rendered blocks, the LLM may not emit a technical entity or an exact period that
// the authoritative material did not supply. It is a bounded LEXICON check, not an NL classifier: each
// pattern is jargon that ordinary consumer Korean does not produce, and a hit is a violation only when the
// exact token is absent from the grounded corpus. This also closes relationship fidelity structurally — a
// model that cannot name 관록궁 at all cannot attach a 화기 to it.
const TECHNICAL_LEXICON: readonly RegExp[] = [
  // Ziwei — palaces (bare 명궁/신궁 are jargon; the rest only with the 궁 suffix, since 형제/자녀/부모 are
  // ordinary Korean words), decadal period, stars, and the four transformations.
  /명궁|신궁|(?:형제|부처|자녀|재백|질액|천이|노복|교우|관록|전택|복덕|부모)궁|대한궁/g,
  /화록|화권|화과|화기|사화|삼방사정/g,
  /자미|천기|무곡|천동|염정|천부|태음|탐랑|거문|천량|칠살|파군|좌보|우필|문창|문곡|천괴|천월|녹존|천마|경양|타라|영성|지공|지겁/g,
  // Qimen — doors, nine stars, eight deities, duty symbols, palace/board vocabulary.
  /팔문|휴문|생문|상문|두문|경문|사문|개문|구성|구궁|팔신|값부|값사|천반|지반|음둔|양둔|삼원/g,
  /천봉|천임|천충|천보|천영|천예|천주|천심|천금|등사|육합|백호|현무|구지|구천/g,
  // Myungri — 십신 (인성 is excluded: it is also the ordinary Korean word for "personality"; 상관 is guarded
  // against 상관없다/상관있다), pillar positions, and the time layers.
  /비견|겁재|식신|편재|정재|편관|정관|편인|재성|관성|식상|비겁|칠살|상관(?!없|있|한다|하지|하고)/g,
  /년주|월주|일주|시주|년간|월간|일간|년지|월지|일지|시지|원국|통근|투간|득령|실령/g,
  /대운|세운|월운|일운/g,
  // Stem/branch hanja — never authored freely.
  /[甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]/g,
];

// §3 — an EXACT 대운 age range ("28~37세") is the single most-fabricated artifact in the review. The existing
// timing validator only checks membership in the lifetime Daewoon span, so any in-life range passed. Here the
// exact PAIR must appear in the authoritative material.
const AGE_RANGE = /(\d{1,3})\s*[~\-–—]\s*(\d{1,3})\s*(?:세|살)/g;

// §15 — a coverage gap described as an engine malfunction.
const CALCULATION_FAILED_CLAIM =
  /계산(?:이)?\s*(?:실패|안\s*됨|되지\s*않|불가)|엔진\s*(?:오류|실패|장애)|분석\s*실패|데이터\s*처리\s*실패|처리하지\s*못했/;

// §16 — prompt-scaffold / QA vocabulary leaking into the product answer.
const SCAFFOLD_LEAK =
  /\((?:예시로\s*제시된[^)]*|예시[^)]{0,10})\)|\b(?:coreSummary|coreInterpretation|domainInterpretation|futureFlow|followUps|strengths|cautions|groundedCorpus|GroundedClaim)\b/g;

const norm = (s: string): string => s.replace(/\s+/g, '');

function ageRangesIn(text: string): Set<string> {
  const out = new Set<string>();
  for (const m of text.matchAll(AGE_RANGE)) out.add(`${Number(m[1])}~${Number(m[2])}`);
  return out;
}

/**
 * Every technical entity / exact age range in `text` that the grounded corpus does not supply. Empty ⇒ the
 * text introduced no product fact of its own.
 */
export function untraceableFacts(text: string, plan: GroundedNarrativePlan): string[] {
  if (!text) return [];
  const corpus = norm(plan.groundedCorpus);
  const found = new Set<string>();
  for (const re of TECHNICAL_LEXICON) {
    for (const m of text.matchAll(re)) {
      const token = m[0];
      if (!corpus.includes(norm(token))) found.add(token);
    }
  }
  const groundedRanges = ageRangesIn(plan.groundedCorpus);
  for (const r of ageRangesIn(text)) if (!groundedRanges.has(r)) found.add(`${r}세`);
  if (CALCULATION_FAILED_CLAIM.test(text)) found.add('NOT_COVERED_AS_FAILURE');
  return [...found];
}

// V3 §2 — WHY the fallback fired, as a bounded category rather than the raw token. Recorded in the server
// diagnostics so the fallback rate can be attributed without ever logging answer content.
export type GroundedViolationCategory =
  | 'UNSUPPORTED_TEMPORAL_CLAIM'
  | 'UNSUPPORTED_TECHNICAL_ENTITY'
  | 'COVERAGE_GAP_AS_FAILURE'
  // The LLM's whole answer was discarded (semantic rejection / unrenderable output); the delivered answer is
  // the server's own grounded composition. Not a grounded-corpus miss — recorded separately so the two very
  // different causes of a deterministic answer are never conflated in the fallback rate.
  | 'LLM_OUTPUT_REJECTED';

const TEMPORAL_VIOLATION = /^(대운|세운|월운|일운|원국|대한궁)$|세$/;

export function classifyGroundedViolations(violations: readonly string[]): GroundedViolationCategory[] {
  const out = new Set<GroundedViolationCategory>();
  for (const v of violations) {
    if (v === 'NOT_COVERED_AS_FAILURE') out.add('COVERAGE_GAP_AS_FAILURE');
    else if (TEMPORAL_VIOLATION.test(v)) out.add('UNSUPPORTED_TEMPORAL_CLAIM');
    else out.add('UNSUPPORTED_TECHNICAL_ENTITY');
  }
  return [...out];
}

/** §16 — bounded output hygiene. Removes scaffold artifacts without touching product content. */
export function stripScaffold(text: string): string {
  return text.replace(SCAFFOLD_LEAK, '').replace(/[ \t]{2,}/g, ' ').replace(/\s+([.,!?])/g, '$1').trim();
}

export type GroundedGateResult = {
  result: ParsedStructuredConsultation;
  /** true ⇒ the CORE prose introduced an ungrounded fact; a fact cannot be excised from it (§11/§12). */
  fatal: boolean;
  violations: string[];
};

/**
 * Apply the grounded contract to an already-ACCEPTED LLM answer. List-shaped fields lose only the offending
 * item; `futureFlow` is dropped outright unless an authoritative temporal claim exists (§3); a violation in
 * the CORE prose is fatal, and the caller composes the deterministic grounded narrative instead (§11/§12).
 */
export function gateAgainstGroundedNarrative(
  parsed: ParsedStructuredConsultation,
  plan: GroundedNarrativePlan,
): GroundedGateResult {
  const violations: string[] = [];
  const clean = (s: string | undefined): string | undefined => {
    if (!s) return undefined;
    const t = stripScaffold(s);
    return t.length > 0 ? t : undefined;
  };
  const keep = (s: string): boolean => {
    const bad = untraceableFacts(s, plan);
    if (bad.length > 0) violations.push(...bad);
    return bad.length === 0;
  };

  const coreSummary = clean(parsed.coreSummary);
  const coreInterpretation = clean(parsed.coreInterpretation);
  const disposition = clean(parsed.disposition);
  const coreViolations = [coreSummary, coreInterpretation, disposition]
    .filter((s): s is string => typeof s === 'string')
    .flatMap((s) => untraceableFacts(s, plan));
  if (coreViolations.length > 0) {
    return { result: parsed, fatal: true, violations: coreViolations };
  }

  const strengths = (parsed.strengths ?? []).map(stripScaffold).filter((s) => s.length > 0 && keep(s));
  const cautions = (parsed.cautions ?? []).map(stripScaffold).filter((s) => s.length > 0 && keep(s));
  const domainInterpretation = (parsed.domainInterpretation ?? [])
    .map((d) => ({ title: stripScaffold(d.title), body: stripScaffold(d.body) }))
    .filter((d) => d.title.length > 0 && d.body.length > 0 && keep(`${d.title} ${d.body}`));
  const followUps = (parsed.followUps ?? []).map(stripScaffold).filter((s) => s.length > 0 && keep(s));

  // §3 — futureFlow may exist ONLY when an authoritative temporal claim exists. No grounded time ⇒ the
  // section is OMITTED; the space is never handed back to the model to fill.
  const rawFuture = clean(parsed.futureFlow);
  const futureFlow = plan.timingClaims.length > 0 && rawFuture && keep(rawFuture) ? rawFuture : undefined;

  return {
    result: {
      ...parsed,
      coreSummary,
      coreInterpretation,
      disposition,
      strengths: strengths.length > 0 ? strengths : undefined,
      cautions: cautions.length > 0 ? cautions : undefined,
      domainInterpretation: domainInterpretation.length > 0 ? domainInterpretation : undefined,
      futureFlow,
      followUps: followUps.length > 0 ? followUps : undefined,
    },
    fatal: false,
    violations,
  };
}

// ── 3. SERVER-MATERIALIZED SECTIONS + DETERMINISTIC FALLBACK ─────────────────────────────────────────
const claimsOf = (plan: GroundedNarrativePlan, ids: readonly string[]): GroundedClaim[] =>
  ids.map((id) => plan.claims.find((c) => c.id === id)).filter((c): c is GroundedClaim => !!c);

const meaningsOf = (plan: GroundedNarrativePlan, ids: readonly string[]): string[] =>
  claimsOf(plan, ids).map((c) => c.authoritativeMeaning);

/** The cross-synthesis heading. Shared, because the grounded fallback now renders this section into the
 *  answer body and the caller drops the duplicate rendered here. */
export const SYNTHESIS_SECTION_TITLE = '왜 이렇게 보나요';

/**
 * §8/§9 — the SERVER-OWNED narrative sections, rendered directly from the claim catalog with NO LLM step:
 * the cross-system synthesis ("왜 이렇게 보나요") and the temporal flow ("앞으로의 흐름", present only when a
 * grounded temporal claim exists). These sit alongside the existing VerifiedEvidence citations and, like
 * them, the LLM can neither alter nor invent their content.
 *
 * V3 §5/§6 — the join is sentence-deduplicating and surface-realized. Contradiction resolutions share their
 * closing sentence across axes, so a plain join printed the same closing sentence once per axis.
 */
export function renderGroundedSections(plan: GroundedNarrativePlan): { title: string; body: string }[] {
  const out: { title: string; body: string }[] = [];
  const synthesis = meaningsOf(plan, plan.contradictionClaims);
  if (synthesis.length > 0) out.push({ title: SYNTHESIS_SECTION_TITLE, body: realize(joinDistinctSentences(synthesis)) });
  const timing = meaningsOf(plan, plan.timingClaims);
  if (timing.length > 0) out.push({ title: '앞으로의 흐름', body: realize(joinDistinctSentences(timing)) });
  return out;
}

// §9/§14 — the question shape decides the ACTION section heading and boundary sentence. A "왜 이런가"
// question must not be answered with "큰 결정을 확정하지 마세요", and a "나는 어떤 사람인가" question must not
// read as a yes/no prompt. Every boundary below says the same thing about how far the evidence reaches; they
// differ only in what the reader was actually asking for.
const ACTION_SECTION: Record<
  NarrativeIntent,
  Record<GroundedNarrativePlan['actionBoundary'], { title: string; body: string }>
> = {
  DECISION: {
    GUIDED: { title: '이렇게 움직이시면 됩니다', body: '지금 확인된 근거 안에서 움직이시고, 근거가 닿지 않는 부분까지 한 번에 확정하지는 마십시오.' },
    CAUTIOUS: { title: '이렇게 움직이시면 됩니다', body: '되돌릴 수 있는 범위에서 준비·확인하시고, 큰 비용이나 되돌리기 어려운 약속은 아직 확정하지 마십시오.' },
  },
  COMPARISON: {
    GUIDED: { title: '어느 쪽을 먼저 보시면 됩니다', body: '위에서 확인된 근거가 더 두껍게 붙는 쪽을 먼저 보시고, 근거가 닿지 않는 쪽까지 한 번에 정하지는 마십시오.' },
    CAUTIOUS: { title: '어느 쪽을 먼저 보시면 됩니다', body: '두 쪽 모두 되돌릴 수 있는 범위에서만 시험해 보시고, 지금 한쪽으로 완전히 몰아두지는 마십시오.' },
  },
  TIMING: {
    GUIDED: { title: '시점을 이렇게 보시면 됩니다', body: '위에 확인된 시기 근거가 닿는 범위까지만 계획을 잡으시고, 그보다 먼 시점은 아직 고정하지 마십시오.' },
    CAUTIOUS: { title: '시점을 이렇게 보시면 됩니다', body: '지금은 되돌릴 수 있는 준비까지만 진행하시고, 시점을 확정해야 하는 약속은 근거가 닿는 범위 안에서만 잡으십시오.' },
  },
  EXPLANATION: {
    GUIDED: { title: '이렇게 이해하시면 됩니다', body: '위 구조가 지금 이 일이 그렇게 흘러가는 이유입니다. 사람이나 상황 하나를 원인으로 지목하기보다, 이 구조가 반복해서 건드려지는 자리라는 점을 기준으로 두십시오.' },
    CAUTIOUS: { title: '이렇게 이해하시면 됩니다', body: '위 구조가 지금 이 일이 그렇게 흘러가는 이유입니다. 다만 확인된 근거가 닿는 데까지가 설명의 범위이고, 그 밖의 원인까지 여기서 단정하지는 않습니다.' },
  },
  TRAIT: {
    GUIDED: { title: '이 결을 이렇게 쓰시면 됩니다', body: '위에서 확인된 결이 실제로 힘을 받는 자리에 시간을 쓰시고, 근거가 닿지 않는 영역까지 같은 결이라고 넓혀 보지는 마십시오.' },
    CAUTIOUS: { title: '이 결을 이렇게 쓰시면 됩니다', body: '위에서 확인된 결은 되돌릴 수 있는 범위에서 먼저 시험해 보시고, 그것을 근거로 큰 결정까지 한 번에 옮기지는 마십시오.' },
  },
};

// §9 — the follow-up offer, shaped by what was asked. Deterministic and fact-free: each one only offers to
// go deeper on material the answer ALREADY stands on, so it can never promise a fact the server lacks.
const FOLLOW_UPS: Record<NarrativeIntent, readonly string[]> = {
  DECISION: ['이 판단에서 가장 크게 걸리는 근거 하나만 더 자세히 봐주세요.', '지금 조건이 달라지면 결론도 달라지나요?'],
  COMPARISON: ['두 쪽의 근거 차이를 조금 더 자세히 짚어주세요.', '어느 쪽이 먼저 풀리는 구조인가요?'],
  TIMING: ['이 시기 판단의 근거를 조금 더 자세히 설명해주세요.', '이 시점 앞뒤로 흐름이 어떻게 달라지나요?'],
  EXPLANATION: ['이 구조가 왜 반복되는지 조금 더 풀어서 설명해주세요.', '이 구조에서 제가 바꿀 수 있는 부분은 어디인가요?'],
  TRAIT: ['이 결이 실제로 잘 드러나는 자리는 어디인가요?', '이 결과 잘 맞지 않는 자리는 어디인가요?'],
};

// §8 — the CAUSAL connectives. The composer may place these BETWEEN two claims; it may never alter either
// claim, and it never asserts a relation the claims' own polarities do not already carry.
const CONTRAST = '다만';
const THEREFORE = '그래서';

// V4 §Fix1 — the COMPETING-EVIDENCE labels. Under a DECLINED verdict a directional claim may still be shown,
// but only as ONE SIDE of a pair that the answer explicitly does not resolve. Like 다만/그래서 these are fixed
// connectives: they assert no direction of their own, and they never alter the claim they introduce.
const SIDE_SUPPORT = '한쪽으로는';
const SIDE_LIMIT = '다른 쪽으로는';

const INTENT_OPENER: Record<NarrativeIntent, string> = {
  DECISION: '',
  COMPARISON: '',
  TIMING: '시점만 놓고 보면 이렇습니다.',
  EXPLANATION: '왜 그런지부터 보겠습니다.',
  TRAIT: '타고난 결부터 보겠습니다.',
};

/** §7 — an anchored restatement: the claim, plus the technical fact it stands on, when it has one. */
function anchored(c: GroundedClaim): string {
  return c.technicalAnchor ? `${c.authoritativeMeaning} (근거: ${c.technicalAnchor})` : c.authoritativeMeaning;
}

const CAP = 3;

/**
 * Sentence-split a joined body back into bullet lines, realized and capped. `said` is the SHARED sentence
 * ledger: a sentence already delivered in the causal body or in 강점 can never reappear as a 주의할 점, which
 * a per-section dedupe misses because the repetition comes from two DIFFERENT claims (a two-sentence
 * riskFactor meaning that happens to contain a one-sentence evidence meaning verbatim).
 */
function bulletsFrom(pool: readonly GroundedClaim[], spent: ReadonlySet<string>, said: Set<string>): string[] {
  return joinDistinctSentences(pool.filter((c) => !spent.has(c.id)).map((c) => c.authoritativeMeaning), said)
    .split(/(?<=[.!?…])\s+/)
    .map((s) => realize(s))
    .filter((s) => s.length > 0)
    .slice(0, CAP);
}

/**
 * §4/§8/§12 — the deterministic grounded composition. NOT another judge: every sentence it renders is either
 * an authoritative claim verbatim or one of the fixed connectives/boundaries above.
 *
 * V2 shipped this as a claim DUMP whose body was `plan.directConclusion` — the SAME string as the headline —
 * because `coreReasons` is fed from `verdict.natalBaseline`/`verdict.currentFlow`, which the production Cross
 * Judge never populates (both are optional pass-throughs on the reasoner input that no caller supplies). Every
 * fallback answer therefore opened by saying its own headline twice and then listed bullets with no reasoning
 * between them. V3 keeps the exact same fact boundary and instead:
 *
 *   - builds the body as a CAUSAL chain (lead → contrast → implication) from claims that DO exist,
 *   - anchors the lead in a technical fact so the answer is visibly about THIS chart (§7),
 *   - frames the action section and the follow-ups by the question that was asked (§9),
 *   - realizes 조사 agreement and speech level so engine strings read as product prose (§5).
 *
 * Presentation only — billing/charge-release semantics are untouched.
 */
export function composeGroundedFallback(plan: GroundedNarrativePlan): ParsedStructuredConsultation {
  const declined = plan.verdictState === 'DECLINED';
  const evidence = plan.claims.filter((c) => c.role === 'EVIDENCE');
  const supports = [...claimsOf(plan, plan.positiveClaims), ...evidence.filter((c) => c.polarity === 'SUPPORT')];
  const limits = [...claimsOf(plan, plan.cautionClaims), ...evidence.filter((c) => c.polarity === 'LIMIT')];
  const reasons = claimsOf(plan, plan.coreReasons);
  const synthesis = claimsOf(plan, plan.contradictionClaims);
  const natal = [...reasons, ...supports, ...limits].filter((c) => c.scope === 'NATAL');
  const implication = meaningsOf(plan, plan.implicationClaims)[0];

  // §8 — SUPPORT + LIMIT is the compound truth the verdict already carries. Leading with the side that
  // actually carries more claims keeps a DIRECTIONAL body consistent with its headline.
  const leadIsLimit = limits.length >= supports.length;
  const dominant = leadIsLimit ? limits : supports;
  const other = leadIsLimit ? supports : limits;

  // Claims already placed. One id is delivered in exactly one position (§6/§10).
  const used = new Set<string>();
  // §7 — an ANCHORED claim first WITHIN a pool. Axis conclusions carry no technical anchor and are often a
  // near-restatement of the headline for a neighbouring axis, so taking the pool head produced a body that
  // said the headline again in different words and cited nothing.
  const pick = (pools: readonly (readonly GroundedClaim[])[]): GroundedClaim | undefined => {
    for (const pool of pools) {
      const free = pool.filter((c) => !used.has(c.id));
      const chosen = free.find((c) => !!c.technicalAnchor) ?? free[0];
      if (chosen) {
        used.add(chosen.id);
        return chosen;
      }
    }
    return undefined;
  };

  // V4 §Fix1 / §"QUESTION-INTENT-SPECIFIC FALLBACK" — WHICH claim is allowed to be the authoritative lead.
  //
  // DECLINED: never a directional support/counter claim. A neutral headline followed by a directional body
  // lead is the measured verdict-fidelity contradiction; only insufficiency, contradiction, scope separation
  // and neutral factual context may open. (Every pool listed here is NEUTRAL/MIXED by construction —
  // SYNTHESIS/CONTRADICTION/CORE_REASON/TIMING — and is re-filtered so a future role can never leak in.)
  //
  // DIRECTIONAL: the question shape decides what comes first — never raw array order (§"CLAIM PRIORITY").
  const nonDirectional = (pool: readonly GroundedClaim[]) =>
    pool.filter((c) => c.polarity === 'NEUTRAL' || c.polarity === 'MIXED');
  //
  // Timing is deliberately absent from every pool: an authoritative temporal claim is delivered by the
  // `futureFlow` section (and framed by the TIMING opener/heading), so leading with it too would say the same
  // sentence twice.
  const leadPools: readonly (readonly GroundedClaim[])[] = declined
    ? [nonDirectional(synthesis), nonDirectional(reasons)]
    : plan.intent === 'TIMING' ? [reasons, dominant, other, synthesis]
      : plan.intent === 'EXPLANATION' ? [reasons, dominant, synthesis, other]
        : plan.intent === 'TRAIT' ? [natal, reasons, dominant, other]
          : plan.intent === 'COMPARISON' ? [synthesis, dominant, other, reasons]
            : [dominant, other, reasons, synthesis];

  // ONE ledger for the whole answer: the headline, then the causal body, then the action section, then the
  // bullets. Nothing already said is said again (§6/§10). The connective is applied AFTER the ledger, so a
  // contrast whose claim was already stated is dropped outright rather than reappearing as
  // "다만 <the same sentence>" — the exact repetition a naive prefix-then-dedupe produces.
  const said = new Set<string>();
  joinDistinctSentences([plan.directConclusion], said);
  const chain: string[] = [];
  const emit = (text: string | undefined, connective = ''): void => {
    if (!text) return;
    const fresh = joinDistinctSentences([text], said);
    if (fresh.length > 0) chain.push(connective ? `${connective} ${fresh}` : fresh);
  };

  if (INTENT_OPENER[plan.intent]) chain.push(INTENT_OPENER[plan.intent]);
  const lead = pick(leadPools);
  if (lead) emit(anchored(lead));
  if (declined) {
    // §Fix1 — the two directions are shown side by side as COMPETING evidence. Neither is presented as the
    // product's chosen direction, and the labels carry no verdict of their own.
    const pro = pick([supports]);
    const con = pick([limits]);
    if (pro) emit(pro.authoritativeMeaning, SIDE_SUPPORT);
    if (con) emit(con.authoritativeMeaning, SIDE_LIMIT);
  } else {
    const counter = pick([other]);
    if (counter) emit(counter.authoritativeMeaning, CONTRAST);
    // A further reason only when it is genuinely a different claim — never padding for length (§10).
    emit(pick([reasons])?.authoritativeMeaning);
  }
  emit(implication, THEREFORE);
  const core = chain.length > 0 ? realize(chain.join(' ')) : realize(plan.directConclusion);

  // V4 §5 USEFUL IMPLICATION — a boundary sentence with no grounded reason attached is exactly the generic
  // advice the brief forbids. The reason is an authoritative claim not yet spent anywhere else, chosen by
  // what the boundary actually follows from: a CAUTIOUS boundary follows from a limitation, a GUIDED one
  // from the support that earned it. When nothing is left, the boundary stands alone rather than repeat.
  const base = ACTION_SECTION[plan.intent][plan.actionBoundary];
  const why = pick(plan.actionBoundary === 'CAUTIOUS'
    ? [limits, reasons, supports]
    : [supports, reasons, limits]);
  const whyText = why ? joinDistinctSentences([why.authoritativeMeaning], said) : '';
  // EXPLANATION/TRAIT boundaries are already causal sentences of their own ("… 이유입니다"), so a 그래서 in
  // front of them would double the connective.
  const bridge = plan.intent === 'EXPLANATION' || plan.intent === 'TRAIT' ? '' : `${THEREFORE} `;
  const actionSection = whyText.length > 0
    ? { title: base.title, body: realize(`${whyText} ${bridge}${base.body}`) }
    : base;

  // V4 §3 CROSS SYNTHESIS — rendered into the answer BODY, not only into the citation blocks, so the reader
  // actually learns why several systems produce this conclusion. Anything already spent above is skipped.
  const synthesisBody = realize(joinDistinctSentences(
    synthesis.filter((c) => !used.has(c.id)).map((c) => c.authoritativeMeaning), said,
  ));

  // Claims already spent above are not repeated as bullets (§6/§10).
  const strengths = bulletsFrom(supports, used, said);
  const cautions = bulletsFrom(limits, used, said);
  const timing = meaningsOf(plan, plan.timingClaims);

  return {
    coreSummary: realize(plan.directConclusion),
    coreInterpretation: core,
    // §4 — never force an empty section.
    strengths: strengths.length > 0 ? strengths : undefined,
    cautions: cautions.length > 0 ? cautions : undefined,
    domainInterpretation: [
      actionSection,
      ...(synthesisBody.length > 0 ? [{ title: SYNTHESIS_SECTION_TITLE, body: synthesisBody }] : []),
    ],
    futureFlow: timing.length > 0 ? realize(joinDistinctSentences(timing)) : undefined,
    followUps: [...FOLLOW_UPS[plan.intent]],
  };
}
