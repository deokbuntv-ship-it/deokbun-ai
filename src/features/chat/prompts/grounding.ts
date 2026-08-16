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

// Codex FIX #6 — runtime guard used before prompt construction: a structurally malformed
// grounding degrades to fail-closed UNAVAILABLE rather than reaching the LLM as trusted facts.
export function toSafeGrounding(g: ConsultationGrounding | null | undefined): ConsultationGrounding {
  if (!g || (g.status !== 'available' && g.status !== 'unavailable')) return GROUNDING_UNAVAILABLE;
  if (g.status === 'unavailable') return g;
  const ev = g.evidence;
  const ok =
    ev &&
    typeof ev === 'object' &&
    isEngineEvidence(ev.myungri) &&
    isEngineEvidence(ev.ziwei) &&
    isEngineEvidence(ev.qimen);
  return ok ? g : GROUNDING_UNAVAILABLE;
}

function isEngineEvidence(v: unknown): v is EngineEvidence {
  const o = v as { availability?: unknown } | null;
  return o !== null && typeof o === 'object' && typeof o.availability === 'string';
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
  // Engine-attribution discipline (§20/§21): each fact belongs to its own engine — never relabel
  // one engine's evidence as another's.
  if (myungriAvailable && ziweiAvailable) {
    lines.push(
      '【엔진 구분】 명리 근거와 자미두수 근거는 각각 어느 엔진에서 나왔는지 구분해 설명하십시오.',
      '한 엔진의 근거를 다른 엔진의 근거라고 말하지 마십시오. 명리는 立春·12절 기준, 자미두수는 자체 음력월',
      '기준이라 월주 간지 등이 다를 수 있는데 이는 계산 오류가 아니라 관례 차이이니 한쪽을 다른 쪽으로 덮어쓰지',
      '마십시오. 두 엔진이 실제로 같은 방향을 가리킬 때만 조심스럽게 그렇게 언급하되, 단지 둘 다 제공됐다는',
      "이유로 '두 학문이 완전히 일치한다'고 단정하지 말고 각 관점을 별도로 설명하십시오.",
    );
  }
  lines.push(
    "'미연결'·'해당 없음'·'출생시간 정보 없음'·'계산 실패'로 표시된 항목은 근거가 없는 것이므로,",
    '그 부분을 지어내지 말고 한계를 밝히십시오. 기문둔갑은 사용하지 않았으므로 언급하지 마십시오.',
  );
  return lines.join('\n');
}
