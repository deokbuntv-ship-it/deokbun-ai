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
  type CrossDivinationVerdict, type Discipline, type JudgmentDomain, type TemporalScope,
  type QuestionIntent,
  isDeclinedToDecide, stanceValence,
} from '@/features/divination';

import type { ConsultationContentPlan, VerifiedEvidenceCatalogItem } from './consultationContentPlan';

export const GROUNDED_NARRATIVE_VERSION = 'grounded-narrative@2.0.0';

// ── 1. GROUNDED CLAIM CATALOG ────────────────────────────────────────────────────────────────────────
/** The authoritative stance a claim carries. Never rewritten into its opposite (§6). */
export type ClaimPolarity = 'SUPPORT' | 'LIMIT' | 'MIXED' | 'NEUTRAL';
export type ClaimRole =
  | 'CONCLUSION' | 'CORE_REASON' | 'POSITIVE' | 'CAUTION' | 'CONTRADICTION' | 'TIMING' | 'SYNTHESIS' | 'EVIDENCE';

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
  actionBoundary: 'GUIDED' | 'CAUTIOUS';
  /** Disciplines that did not cover this question. NOT_COVERED — never a calculation failure (§15). */
  coverageGaps: readonly Discipline[];
  /** The union of every authoritative string above — the fact boundary the LLM's language is checked against. */
  groundedCorpus: string;
  provenance: readonly ['deokbunai.grounded-narrative-plan.v2'];
};

const byId = (claims: readonly GroundedClaim[], role: ClaimRole): string[] =>
  claims.filter((c) => c.role === role).map((c) => c.id);

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

  const coverageGaps = verdict.contributions.filter((c) => !c.applied).map((c) => c.discipline);
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

  return {
    verdictState: declined ? 'DECLINED' : 'DIRECTIONAL',
    intent,
    directConclusion: verdict.primaryConclusion,
    claims,
    coreReasons: byId(claims, 'CORE_REASON'),
    positiveClaims: byId(claims, 'POSITIVE'),
    cautionClaims: byId(claims, 'CAUTION'),
    contradictionClaims: [...byId(claims, 'SYNTHESIS'), ...byId(claims, 'CONTRADICTION')],
    timingClaims: byId(claims, 'TIMING'),
    actionBoundary: contentPlan.actionBoundary,
    coverageGaps,
    groundedCorpus,
    provenance: ['deokbunai.grounded-narrative-plan.v2'],
  };
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
const meaningsOf = (plan: GroundedNarrativePlan, ids: readonly string[]): string[] =>
  ids.map((id) => plan.claims.find((c) => c.id === id)?.authoritativeMeaning).filter((s): s is string => !!s);

/**
 * §8/§9 — the SERVER-OWNED narrative sections, rendered directly from the claim catalog with NO LLM step:
 * the cross-system synthesis ("왜 이렇게 보나요") and the temporal flow ("앞으로의 흐름", present only when a
 * grounded temporal claim exists). These sit alongside the existing VerifiedEvidence citations and, like
 * them, the LLM can neither alter nor invent their content.
 */
export function renderGroundedSections(plan: GroundedNarrativePlan): { title: string; body: string }[] {
  const out: { title: string; body: string }[] = [];
  const synthesis = meaningsOf(plan, plan.contradictionClaims);
  if (synthesis.length > 0) out.push({ title: '왜 이렇게 보나요', body: synthesis.join(' ') });
  const timing = meaningsOf(plan, plan.timingClaims);
  if (timing.length > 0) out.push({ title: '앞으로의 흐름', body: timing.join(' ') });
  return out;
}

const ACTION_BOUNDARY_TEXT: Record<GroundedNarrativePlan['actionBoundary'], string> = {
  GUIDED: '지금 확인된 근거 안에서 움직이시고, 근거가 닿지 않는 부분까지 한 번에 확정하지는 마십시오.',
  CAUTIOUS: '되돌릴 수 있는 범위에서 준비·확인하시고, 큰 비용이나 되돌리기 어려운 약속은 아직 확정하지 마십시오.',
};

/**
 * §12 — the deterministic grounded composition. NOT another judge: it only renders claims that are already
 * authoritative, in the narrative plan's own section order. Used when the LLM's stylistic rendering fails the
 * grounded contract, so the user still receives a grounded answer instead of fabricated prose. Presentation
 * only — billing/charge-release semantics are untouched.
 */
export function composeGroundedFallback(plan: GroundedNarrativePlan): ParsedStructuredConsultation {
  const reasons = meaningsOf(plan, plan.coreReasons);
  const positives = meaningsOf(plan, plan.positiveClaims);
  const cautions = meaningsOf(plan, plan.cautionClaims);
  const evidence = plan.claims.filter((c) => c.role === 'EVIDENCE');
  const support = evidence.filter((c) => c.polarity === 'SUPPORT').map((c) => c.authoritativeMeaning);
  const limits = evidence.filter((c) => c.polarity === 'LIMIT').map((c) => c.authoritativeMeaning);
  // The headline is already `directConclusion`; repeating it verbatim as the body was the first thing this
  // composition got wrong in practice. Lead with the REASONS and fall back to the conclusion only when the
  // verdict supplied no baseline/flow of its own.
  const core = reasons.length > 0 ? reasons.join(' ') : plan.directConclusion;
  const timing = meaningsOf(plan, plan.timingClaims);

  // The synthesis and temporal blocks are appended separately by the caller from `renderGroundedSections`,
  // so this section carries only the action boundary — the same claim is never shown twice.
  const domainInterpretation = [
    { title: '이렇게 움직이시면 됩니다', body: ACTION_BOUNDARY_TEXT[plan.actionBoundary] },
  ];

  return {
    coreSummary: plan.directConclusion,
    coreInterpretation: core,
    strengths: [...positives, ...support].slice(0, 3),
    cautions: [...cautions, ...limits].slice(0, 3),
    domainInterpretation,
    futureFlow: timing.length > 0 ? timing.join(' ') : undefined,
  };
}
