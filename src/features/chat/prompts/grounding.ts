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
  const summary = ev.summary?.trim();
  if (ev.availability === 'available' && summary) {
    return `- ${label}(제공됨): ${summary}`;
  }
  // Fail-closed against a mis-wire: `available` with no usable summary is NOT grounding.
  // Do not let the model treat an empty "제공됨" as facts it may elaborate on.
  if (ev.availability === 'available') {
    return `- ${label}: 제공됨(요약 없음 — 근거로 쓸 내용이 없으므로 지어내지 마십시오)`;
  }
  return `- ${label}: ${AVAILABILITY_LABEL[ev.availability]}`;
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
  lines.push(
    "'미연결'·'해당 없음'·'출생시간 정보 없음'으로 표시된 항목은 근거가 없는 것이므로,",
    '그 부분을 지어내지 말고 한계를 밝히십시오.',
  );
  return lines.join('\n');
}
