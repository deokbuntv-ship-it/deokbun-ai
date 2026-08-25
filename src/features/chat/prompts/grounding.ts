// Consultation GROUNDING seam (directive §12/§13/§26/§47) — the typed boundary where
// Codex will later hand deterministic engine output to the consultation prompt.
//
// PRINCIPLE (§3): the LLM is an INTERPRETER, not a CALCULATOR. Calculation FACTS must
// come from the deterministic layer. Until Codex wires the engines, grounding is
// `unavailable` and the prompt fail-closes: it forbids the model from inventing a
// 명식/오행/십성/자미 성계/기문 국 or any timing. We do NOT fabricate engine output to
// fill the gap (§2/§12) and we do NOT silently pretend calculation happened (§53).
//
// REUSE (§75): this seam reuses `EngineEvidence` (facts-only availability+summary) and
// the myungri/ziwei/qimen triplet from `@/features/analysis` — it introduces NO new
// evidence/assessment model. Codex owns the SEMANTICS that fill `summary`.
import type { EngineEvidence } from '@/features/analysis';
import type { CrossDivinationVerdict } from '@/features/divination';
import type { PolarityTier } from '@/features/polarity/polarityKernel';

export type GroundingUnavailableReason =
  | 'engine_not_connected' // pipeline not wired yet (current default)
  | 'birth_time_unknown' // time-dependent calculation not possible
  | 'calculation_failed'
  | 'not_applicable';

// The three deterministic engines, mirroring StructuredAiResponse['evidence'].
export type EngineEvidenceTriplet = {
  myungri: EngineEvidence; // 명리 (SAJU)
  ziwei: EngineEvidence; // 자미두수
  qimen: EngineEvidence; // 기문둔갑
};

export type ConsultationGrounding =
  | { status: 'unavailable'; reason: GroundingUnavailableReason }
  | {
      status: 'available';
      evidence: EngineEvidenceTriplet;
      // Optional user-facing assessment SUMMARY (categorical natural language, produced
      // by the Codex ruleset). NEVER a fabricated numeric score (§28/§2). The prompt
      // relays it verbatim; Claude does not compute it.
      assessmentSummary?: string | null;
      engineVersion?: string | null; // Codex-supplied when wired (§37)
      assessmentVersion?: string | null;
      // Server-derived CURRENT KST CIVIL reference year + month (Sprint C.1 §6 / Sprint E.1 §8). These are
      // the LINGUISTIC anchors for 올해/내년/이번 달/다음 달 — CIVIL calendar, NOT the saju 立春-based 세운 year.
      // The Answer Plan + ResolvedTemporalContext + validator READ them so relative periods resolve
      // identically everywhere; never the client clock. (The saju 세운 year stays internal to the engine.)
      referenceYear?: number | null;
      referenceMonth?: number | null;
      // SERVER-owned TARGET-SCOPED polarity (Sprint C.1 §2-§4): the shared kernel's categorical tier for each
      // grounded temporal target (a year's 세운 or a month's 월운), KEYED so a conclusion is bound to THIS
      // resolved target. Categorical only — never a score, never a winner/order across candidates. The
      // Answer Plan selects the ONE that matches the question's resolved target; the prompt never exposes it.
      targetPolarities?: TargetPolarity[];
      // DIVINATION_ENGINE_V1 — the SERVER's cross-discipline 점사 verdict for THIS question. Produced by the
      // judgment layer (per-discipline judges → cross judge) from the SAME deterministic facts rendered above;
      // it adds no astrology of its own. The prompt relays it as a binding directive and the quality guard
      // re-checks the produced prose against it, so the model can explain the verdict but never reverse it.
      // Absent when no discipline could speak (the reading then falls back to the pre-existing behavior).
      divinationVerdict?: CrossDivinationVerdict | null;
      /**
       * V4B §24 — the STORED derivation chain behind the headline, for a follow-up that asks "왜?". Structured
       * traversal of the persisted graph (conclusion ← rule ← premises ← upstream conclusions), never
       * chain-of-thought: every line names a node the first turn already recorded.
       */
      derivationChain?: string[];
      /**
       * V4B §25 — when a follow-up drills into a DIFFERENT axis ("사업을 확장할까?" → "돈은?"), what the
       * PREVIOUS turn's stored graph already established about that axis. Without this the second turn is a
       * fresh reading that can contradict the first; with it the answer can say why the original judgment
       * landed where it did.
       */
      priorAxisContext?: string[];
    };

// One grounded period's categorical polarity, keyed to its target (Sprint C.1 §3). `targetKey` is the year
// (granularity YEAR) or year*100+month (granularity MONTH). There is deliberately no cross-target ordering.
export type TargetPolarity = {
  granularity: 'YEAR' | 'MONTH';
  targetKey: number;
  polarity: PolarityTier;
  // The exact bounded relation facts consumed by the shared polarity kernel. This is audit evidence,
  // not prose and not a new score: harmony/friction are the kernel's existing categorical inputs.
  derivation: TargetPolarityDerivation;
};

export type TargetPolarityRelation = {
  position: 'YEAR' | 'MONTH' | 'DAY' | 'HOUR';
  kind: string;
};

export type TargetPolarityDerivation = {
  harmony: number;
  friction: number;
  stemRelations: TargetPolarityRelation[];
  branchRelations: TargetPolarityRelation[];
};

// The current, honest default: no verified calculation is connected.
export const GROUNDING_UNAVAILABLE: ConsultationGrounding = {
  status: 'unavailable',
  reason: 'engine_not_connected',
};

export function isConsultationGrounded(g: ConsultationGrounding): boolean {
  return g.status === 'available';
}

const AVAILABILITY_LABEL: Record<EngineEvidence['availability'], string> = {
  available: '제공됨',
  not_applicable: '해당 없음',
  missing_birth_time: '출생시간 정보 없음',
  engine_not_connected: '미연결',
  calculation_failed: '계산 실패',
};

const UNAVAILABLE_REASON_LABEL: Record<GroundingUnavailableReason, string> = {
  engine_not_connected: '역학 계산 엔진이 아직 연결되지 않았습니다',
  birth_time_unknown: '출생시간을 알 수 없어 시간 의존 계산을 수행할 수 없습니다',
  calculation_failed: '계산에 실패했습니다',
  not_applicable: '이 질문에는 계산 근거가 적용되지 않습니다',
};

function renderEngine(label: string, ev: EngineEvidence): string {
  if (ev.availability === 'available') {
    // Codex FIX #3/#4: deliver the FULL structured fact sections to the prompt (not only a
    // one-line summary). Malformed sections are skipped defensively (no throw at prompt time).
    const sections = Array.isArray(ev.sections)
      ? ev.sections.filter(
          (s) => s && typeof s.label === 'string' && Array.isArray(s.lines) && s.lines.length > 0,
        )
      : [];
    if (sections.length > 0) {
      const body = sections
        .map((s) => `  · ${s.label}: ${s.lines.filter((l) => typeof l === 'string').join(' | ')}`)
        .join('\n');
      return `- ${label}(제공됨):\n${body}`;
    }
    const summary = ev.summary?.trim();
    if (summary) return `- ${label}(제공됨): ${summary}`;
    // Fail-closed against a mis-wire: `available` with no usable facts is NOT grounding.
    return `- ${label}: 제공됨(요약 없음 — 근거로 쓸 내용이 없으므로 지어내지 마십시오)`;
  }
  return `- ${label}: ${AVAILABILITY_LABEL[ev.availability]}`;
}

// Codex pipeline FIX #5 — STRICT runtime guard used before prompt construction. A structurally
// malformed grounding degrades to fail-closed UNAVAILABLE rather than reaching the LLM as trusted
// facts. This validates the FULL shape (availability enum, summary/section/timing shapes, unavailable
// reason enum, engineVersion type, and connected-engine consistency) — not just "availability is a string".
const AVAILABILITY_VALUES: readonly EngineEvidence['availability'][] = [
  'available', 'not_applicable', 'missing_birth_time', 'engine_not_connected', 'calculation_failed',
];
const UNAVAILABLE_REASON_VALUES: readonly GroundingUnavailableReason[] = [
  'engine_not_connected', 'birth_time_unknown', 'calculation_failed', 'not_applicable',
];

const isNonEmptyString = (v: unknown): boolean => typeof v === 'string' && v.trim().length > 0;
// The frozen product-supported year range, mirrored as a runtime schema guard (Codex A2):
// V1_SUPPORTED_BIRTH_RANGE_1970_01_01_THROUGH_2050_12_31. Reuses the product policy — NOT a new
// calendar rule — so a timing year outside 1970–2050 (or 2026.5 / -1 / NaN / Infinity / string) fails closed.
const SUPPORTED_YEAR_MIN = 1970;
const SUPPORTED_YEAR_MAX = 2050;
const isPlausibleYear = (v: unknown): boolean =>
  typeof v === 'number' && Number.isInteger(v) && v >= SUPPORTED_YEAR_MIN && v <= SUPPORTED_YEAR_MAX;

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string');
}
// Type-shape check (valid on ANY availability): sections, if present, is an array of {label, lines[]}.
function isValidSectionsShape(v: unknown): boolean {
  if (v === undefined) return true;
  if (!Array.isArray(v)) return false;
  return v.every(
    (s) => s !== null && typeof s === 'object' && typeof (s as { label?: unknown }).label === 'string' && isStringArray((s as { lines?: unknown }).lines),
  );
}
// CONTENT check required for AVAILABLE: ≥1 section, each with a non-empty label + ≥1 non-empty line
// (rejects sections=[] / empty label / lines=[] / whitespace-only lines) — Codex FIX #2 §9.
function hasUsableSections(v: unknown): boolean {
  if (!Array.isArray(v) || v.length === 0) return false;
  return v.every((s) => {
    if (s === null || typeof s !== 'object') return false;
    const o = s as { label?: unknown; lines?: unknown };
    if (!isNonEmptyString(o.label)) return false;
    if (!Array.isArray(o.lines) || o.lines.length === 0) return false;
    return o.lines.every((l) => isNonEmptyString(l));
  });
}
function isValidTimingAnchors(v: unknown): boolean {
  if (v === undefined) return true;
  if (v === null || typeof v !== 'object') return false;
  const o = v as { years?: unknown; referenceYear?: unknown; daewoonAgeSpan?: unknown; hasMonthlyEvidence?: unknown };
  if (!Array.isArray(o.years) || !o.years.every((y) => isPlausibleYear(y))) return false; // finite integer + range
  if (o.referenceYear !== undefined && o.referenceYear !== null && !isPlausibleYear(o.referenceYear)) return false; // rejects 2026.5 / -1 / NaN / Infinity
  if (o.hasMonthlyEvidence !== undefined && typeof o.hasMonthlyEvidence !== 'boolean') return false;
  if ((o as { months?: unknown }).months !== undefined) {
    const months = (o as { months?: unknown }).months;
    // year*100+month; year plausible, month 1..12. Rejects fractional / out-of-range / bad month.
    if (
      !Array.isArray(months) ||
      !months.every(
        (m) => Number.isInteger(m) && isPlausibleYear(Math.floor((m as number) / 100)) && (m as number) % 100 >= 1 && (m as number) % 100 <= 12,
      )
    ) {
      return false;
    }
  }
  if (o.daewoonAgeSpan !== undefined && o.daewoonAgeSpan !== null) {
    const s = o.daewoonAgeSpan as { min?: unknown; max?: unknown };
    if (s === null || typeof s !== 'object' || typeof s.min !== 'number' || typeof s.max !== 'number') return false;
    if (!Number.isInteger(s.min) || !Number.isInteger(s.max)) return false; // rejects fractional (33.5) + NaN/Infinity
    if (s.min < 0 || s.max < 0) return false; // rejects negative age
    if (s.min > s.max) return false; // rejects reversed span (startAge > endAge)
  }
  return true;
}
function isValidEngineEvidence(v: unknown): v is EngineEvidence {
  if (v === null || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  if (typeof o.availability !== 'string' || !(AVAILABILITY_VALUES as readonly string[]).includes(o.availability)) return false;
  if (o.summary !== undefined && typeof o.summary !== 'string') return false;
  if (o.detail !== undefined && typeof o.detail !== 'string') return false;
  if (o.hasTimingEvidence !== undefined && typeof o.hasTimingEvidence !== 'boolean') return false;
  if (!isValidSectionsShape(o.sections)) return false;
  if (!isValidTimingAnchors(o.timingAnchors)) return false;
  // AVAILABLE must carry USABLE deterministic content (Codex FIX #2 §4): BOTH a non-empty summary AND
  // ≥1 usable section (non-empty label + non-empty lines). Half-shaped "available" → fail-closed.
  if (o.availability === 'available') {
    if (!isNonEmptyString(o.summary)) return false;
    if (!hasUsableSections(o.sections)) return false;
  }
  return true;
}

export function toSafeGrounding(g: ConsultationGrounding | null | undefined): ConsultationGrounding {
  if (!g || typeof g !== 'object' || typeof (g as { status?: unknown }).status !== 'string') return GROUNDING_UNAVAILABLE;
  if (g.status === 'unavailable') {
    return (UNAVAILABLE_REASON_VALUES as readonly string[]).includes(g.reason) ? g : GROUNDING_UNAVAILABLE;
  }
  if (g.status !== 'available') return GROUNDING_UNAVAILABLE;
  const ev = g.evidence as EngineEvidenceTriplet | undefined;
  if (
    !ev ||
    typeof ev !== 'object' ||
    !isValidEngineEvidence(ev.myungri) ||
    !isValidEngineEvidence(ev.ziwei) ||
    !isValidEngineEvidence(ev.qimen)
  ) {
    return GROUNDING_UNAVAILABLE;
  }
  if (g.engineVersion !== undefined && g.engineVersion !== null && typeof g.engineVersion !== 'string') {
    return GROUNDING_UNAVAILABLE;
  }
  if (g.assessmentSummary !== undefined && g.assessmentSummary !== null && typeof g.assessmentSummary !== 'string') {
    return GROUNDING_UNAVAILABLE;
  }
  if (g.assessmentVersion !== undefined && g.assessmentVersion !== null && typeof g.assessmentVersion !== 'string') {
    return GROUNDING_UNAVAILABLE;
  }
  if (g.referenceYear !== undefined && g.referenceYear !== null && !isPlausibleYear(g.referenceYear)) {
    return GROUNDING_UNAVAILABLE;
  }
  if (g.referenceMonth !== undefined && g.referenceMonth !== null && !isCivilMonth(g.referenceMonth)) {
    return GROUNDING_UNAVAILABLE;
  }
  if (g.targetPolarities !== undefined && !isValidTargetPolarities(g.targetPolarities)) {
    return GROUNDING_UNAVAILABLE;
  }
  return g;
}

const POLARITY_TIER_VALUES: readonly PolarityTier[] = ['FAVORABLE', 'STEADY', 'DYNAMIC', 'CAUTION'];
const isCivilMonth = (v: unknown): boolean => typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 12;
function isValidTargetPolarities(v: unknown): boolean {
  if (!Array.isArray(v)) return false;
  return v.every((t) => {
    if (t === null || typeof t !== 'object') return false;
    const o = t as { granularity?: unknown; targetKey?: unknown; polarity?: unknown; derivation?: unknown };
    if (o.granularity !== 'YEAR' && o.granularity !== 'MONTH') return false;
    if (typeof o.targetKey !== 'number' || !Number.isInteger(o.targetKey)) return false;
    if (typeof o.polarity !== 'string' || !(POLARITY_TIER_VALUES as readonly string[]).includes(o.polarity)) return false;
    return isValidTargetPolarityDerivation(o.derivation);
  });
}

const PILLAR_POSITIONS = ['YEAR', 'MONTH', 'DAY', 'HOUR'];
const STEM_RELATION_KINDS = ['STEM_COMBINATION', 'STEM_CLASH'];
const BRANCH_RELATION_KINDS = [
  'BRANCH_SIX_COMBINATION', 'BRANCH_CLASH', 'BRANCH_HALF_THREE_HARMONY',
  'BRANCH_PUNISHMENT', 'BRANCH_SELF_PUNISHMENT', 'BRANCH_DESTRUCTION', 'BRANCH_HARM',
];
function isValidTargetPolarityDerivation(v: unknown): boolean {
  if (v === null || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  const validCount = (n: unknown) => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n <= 8;
  if (!validCount(o.harmony) || !validCount(o.friction)) return false;
  const validRelations = (relations: unknown, kinds: readonly string[]) =>
    Array.isArray(relations) && relations.length <= 8 && relations.every((relation) => {
      if (relation === null || typeof relation !== 'object') return false;
      const r = relation as Record<string, unknown>;
      return typeof r.position === 'string' && PILLAR_POSITIONS.includes(r.position) &&
        typeof r.kind === 'string' && kinds.includes(r.kind);
    });
  return validRelations(o.stemRelations, STEM_RELATION_KINDS) &&
    validRelations(o.branchRelations, BRANCH_RELATION_KINDS);
}

/**
 * Render the grounding as a prompt CONTEXT block (a system message body).
 *
 * `unavailable` → a fail-closed instruction: interpret only the plainly-stated birth
 * facts, and NEVER fabricate a chart or timing. `available` → the engine facts, with an
 * instruction to interpret ONLY from them. Either way the model is told exactly what is
 * and is not verified, so it cannot present invented calculation as fact.
 */
export function renderGroundingContext(grounding: ConsultationGrounding): string {
  if (grounding.status === 'unavailable') {
    return [
      '【계산 근거】',
      `현재 검증된 역학 계산 결과가 제공되지 않았습니다 (${UNAVAILABLE_REASON_LABEL[grounding.reason]}).`,
      '따라서 명식·오행 개수·십성·자미두수 성계·기문 국 등 어떤 계산 결과도 직접 만들어내지 마십시오.',
      '제공된 출생 정보의 표면적 사실만을 바탕으로, 계산 근거가 아직 없다는 한계를 자연스럽게 인지한 채',
      '일반적인 수준에서 신중하게 상담하십시오. 특정 연·월·일 등 시점을 단정하지 마십시오.',
    ].join('\n');
  }

  const myungriAvailable = grounding.evidence.myungri.availability === 'available';
  const ziweiAvailable = grounding.evidence.ziwei.availability === 'available';

  const lines = [
    '【계산 근거】',
    '아래는 결정론적 엔진이 계산한 검증된 근거입니다. 이 근거의 범위 안에서만 해석하십시오.',
    renderEngine('명리', grounding.evidence.myungri),
    renderEngine('자미두수', grounding.evidence.ziwei),
    renderEngine('기문둔갑', grounding.evidence.qimen),
  ];
  if (grounding.assessmentSummary) {
    lines.push(`【종합 판단(근거 기반)】 ${grounding.assessmentSummary}`);
  }
  // V4B §24 — a WHY turn carries the STORED derivation chain of the very judgment being questioned. These are
  // persisted graph nodes and their stored links, not reasoning produced now, so the explanation cannot drift
  // to a different conclusion than the answer it is explaining.
  if (grounding.priorAxisContext && grounding.priorAxisContext.length > 0) {
    lines.push(
      '【앞선 판정에서 이 축에 대해 이미 나온 근거】',
      ...grounding.priorAxisContext,
      '이 질문은 앞선 상담의 연장입니다. 앞 판정을 없던 일로 하고 새로 답하지 마시고, 위 근거와 이어서',
      '설명하십시오. 앞 판정과 결론이 달라진다면 무엇 때문에 달라지는지를 밝히십시오.',
    );
  }
  if (grounding.derivationChain && grounding.derivationChain.length > 0) {
    lines.push(
      '【이 판단이 나온 경로(저장된 추론 그래프)】',
      ...grounding.derivationChain,
      '이 경로에 없는 근거를 새로 만들어 설명하지 마십시오. 설명은 이 경로를 풀어 쓰는 것입니다.',
    );
  }
  const qimenAvailable = grounding.evidence.qimen.availability === 'available';

  // Engine-attribution discipline (§20/§21/§14): each fact belongs to its own engine — never relabel,
  // and NEVER auto-claim multi-engine agreement (V1 has no formal cross-engine consensus algorithm).
  if ((myungriAvailable && ziweiAvailable) || qimenAvailable) {
    lines.push(
      '【엔진 구분】 명리·자미두수·기문둔갑 근거는 각각 어느 엔진에서 나왔는지 구분해 설명하십시오. 한 엔진의',
      '근거를 다른 엔진의 근거라고 말하지 마십시오. 명리는 출생 기준(立春·12절), 자미두수는 출생 기준(음력월),',
      '기문둔갑은 질문 시점 기준(상황판)이라 계산 기준이 서로 다릅니다 — 이는 계산 오류가 아니라 기준/관례 차이',
      "이니 한쪽을 다른 쪽으로 덮어쓰지 마십시오. 실제로 같은 방향일 때만 조심스럽게 언급하고, 여럿이 제공됐다는",
      "이유만으로 '두 학문/세 학문이 완전히 일치한다'고 단정하지 말고 각 관점을 별도로 설명하십시오.",
    );
  }
  if (qimenAvailable) {
    lines.push(
      '【기문둔갑 안내】 기문둔갑 근거는 질문을 제출한 시점(Asia/Seoul)의 상황판이며 출생 명식이 아닙니다.',
      '이 상황판을 근거로 특정 장기 연도(예: 2028년)를 확정 예측하지 말고, 질문 시점의 국세(상황)로만 설명하십시오.',
    );
  }
  lines.push(
    "'미연결'·'해당 없음'·'출생시간 정보 없음'·'계산 실패'로 표시된 항목은 근거가 없는 것이므로,",
    '그 부분을 지어내지 말고 한계를 밝히십시오.',
  );
  if (!qimenAvailable) {
    lines.push('기문둔갑 근거가 제공되지 않았으므로(해당 없음/미연결/계산 실패) 기문둔갑을 사용했다고 말하지 마십시오.');
  }
  return lines.join('\n');
}
