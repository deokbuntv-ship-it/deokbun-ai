// QIMEN CONSULTATION JUDGES V1 — turns the (already-substantial, library-verified) Qimen board into
// explicit TARGET-SELECTION-driven question judgments: BUSINESS, MONEY, CAREER, LOVE, REUNION, CHANGE,
// EVENT_SUCCESS, TIMING.
//
// QIMEN'S CENTRAL PROBLEM IS TARGET SELECTION (§8 of the implementation brief), not "생문 좋다, 사문
// 나쁘다". Every domain below is explicit about WHO/WHAT each palace represents, using the SAME
// subject/object pair `judgeQimen` (`./qimenJudge.ts`) already reads — 값부궁(zhifuPalace, R2: "판의
// 주도 기운", the self/practitioner driving the board) as SUBJECT, 값사궁(zhishiPalace, R2: "사안 자체를
// 이끄는 문", the matter/affair/counterparty in motion) as OBJECT — never a new target-selection school.
// A genuine STRUCTURAL RELATION between them is now computable for the first time via
// `qimenPalaceGeometry.ts`'s trigram→element table (Later Heaven Bagua, universal, not school-specific)
// and the SAME five-element generation/control cycle already used in `myungriYongshin.ts`.
//
// REUSE, NOT REBUILD (§2): every domain reuses `judgeQimen`'s own R1/R3/R4 classification tables
// (`doorClass`/`starClass`/`godClass`, now exported) rather than reinventing door/star/deity meaning.
// Door/star/deity are read CONTEXTUALLY per domain (which palace, combined with the subject-object
// relation) — never "생문 = always favorable" (§12).
//
// EVENT_SUCCESS is NOT part of Myungri's/Ziwei's shared `ConsultationJudgeDomain` (§9 of this brief adds
// it as an 8th, Qimen-specific domain — situational "will this proceed", which natal/period disciplines
// don't answer the same way). Widening the SHARED type would force an entry into Myungri's and Ziwei's
// closed `JUDGES` maps for a domain neither owns, so Qimen keeps its own domain/result types here
// instead — see `QimenConsultationDomain`/`QimenDomainJudgeResult` below. `combineStatus` (the actual
// FAVORABLE/CAUTION/MIXED/UNRESOLVED gate) IS reused from `consultationJudgeCore.ts` unchanged — it was
// already domain-agnostic.
//
// NO SCORE/VOTE MODEL (§13), same discipline as `combineStatus` itself: two grounded booleans, never a
// count of auspicious vs inauspicious symbols.
//
// SITUATIONAL, NOT SUBORDINATE (§26/§27): this module reads ONLY the Qimen board — never Myungri/Ziwei
// facts — and never merges into a cross-discipline verdict. `judgeQimen`'s own R1-R5 stance stays its
// unmodified authority; this is ADDITIONAL evidence, exactly like the Myungri/Ziwei consultation judges.
import type { QimenBoard, QimenPalace } from '@/features/qimen/domain/qimenTypes';
import { findPalaceByTrigram, TRIGRAM_ELEMENT, elementRelation, type QimenElement, type ElementRelation } from '@/features/qimen/services/qimenPalaceGeometry';
import { doorClass, starClass, godClass } from './qimenJudge';
import type { JudgmentDomain, JudgmentEvidence } from './contracts';
import { combineStatus, type DomainRule } from './consultationJudgeCore';
import type { DomainJudgeStatus, SyntheticInference } from './consultationJudgeTypes';

export const QIMEN_CONSULTATION_JUDGE_V1_METHOD = 'deokbunai.qimen-consultation-judge.v1' as const;

export type QimenConsultationDomain = 'BUSINESS' | 'MONEY' | 'CAREER' | 'LOVE' | 'REUNION' | 'CHANGE' | 'EVENT_SUCCESS' | 'TIMING';

export type QimenTargetRef = { trigram: string; palaceLabel: string; element: QimenElement };

export type QimenDomainJudgeResult = {
  domain: QimenConsultationDomain;
  status: DomainJudgeStatus;
  /** WHO the subject palace is (값부궁) — `null` only when the board itself is unavailable. */
  subjectTarget: QimenTargetRef | null;
  /** WHAT/WHO the object-or-counterparty palace is (값사궁). */
  objectTarget: QimenTargetRef | null;
  conclusion: string;
  supportingEvidence: JudgmentEvidence[];
  counterEvidence: JudgmentEvidence[];
  syntheticInferences: SyntheticInference[];
  /** e.g. "값부(兌/METAL)가 값사(離/FIRE)를 극함" — always present when both targets resolved. */
  targetRelations: string[];
  /** Same-shape convenience as Myungri's/Ziwei's own `opportunities`/`risks` (plain-Korean reasoning
   *  strings, one per contributing rule) — not part of the brief's own §23 field list, but kept for
   *  consistency across all three disciplines' result shapes. */
  opportunities: string[];
  risks: string[];
  timingDrivers: string[];
  uncertaintyReasons: string[];
  ruleIds: string[];
  provenance: readonly [typeof QIMEN_CONSULTATION_JUDGE_V1_METHOD];
};

const DOMAIN_LABEL: Record<QimenConsultationDomain, string> = {
  BUSINESS: '사업', MONEY: '재물', CAREER: '직업', LOVE: '연애', REUNION: '재회',
  CHANGE: '변화', EVENT_SUCCESS: '성사', TIMING: '시기',
};
const DOMAIN_AXIS: Record<QimenConsultationDomain, JudgmentDomain> = {
  BUSINESS: 'OPPORTUNITY', MONEY: 'MONEY_INFLOW', CAREER: 'CAREER', LOVE: 'RELATION_BOND',
  REUNION: 'RELATION_STABILITY', CHANGE: 'MOVEMENT', EVENT_SUCCESS: 'OUTCOME', TIMING: 'TIMING',
};
const ELEMENT_LABEL: Record<QimenElement, string> = { WOOD: '木', FIRE: '火', EARTH: '土', METAL: '金', WATER: '水' };

const ev = (fact: string, meaning: string, domain: QimenConsultationDomain, directness: JudgmentEvidence['directness'] = 'ADJACENT'): JudgmentEvidence => ({
  fact, meaning, domain: DOMAIN_AXIS[domain], temporalScope: 'PRESENT_MOMENT', directness,
});

// ── target resolution (§9/§10) — explicit, traceable: QUESTION_DOMAIN's shared subject/object pair →
// SUBJECT_PALACE(값부궁) → OBJECT_PALACE(값사궁) → STRUCTURAL_RELATION. Same pair for every domain,
// per this module's own header (no per-domain palace-selection school invented). ──────────────────
function targetRef(palace: QimenPalace, trigram: string): QimenTargetRef {
  return { trigram, palaceLabel: palace.palaceLabel, element: TRIGRAM_ELEMENT[trigram] };
}
function relationNote(subject: QimenTargetRef, object: QimenTargetRef, relation: ElementRelation): string {
  const s = `값부(${subject.trigram}/${ELEMENT_LABEL[subject.element]})`;
  const o = `값사(${object.trigram}/${ELEMENT_LABEL[object.element]})`;
  switch (relation) {
    case 'SAME': return `${s}와 ${o}가 같은 오행입니다.`;
    case 'A_GENERATES_B': return `${s}가 ${o}를 생(生)합니다 — 내가 이 일에 힘을 보태는 관계입니다.`;
    case 'B_GENERATES_A': return `${o}가 ${s}를 생(生)합니다 — 이 일이 나를 살려 주는 관계입니다.`;
    case 'A_CONTROLS_B': return `${s}가 ${o}를 극(剋)합니다 — 내가 이 일을 다스릴 수 있는 관계입니다.`;
    case 'B_CONTROLS_A': return `${o}가 ${s}를 극(剋)합니다 — 이 일이 나를 누르는 관계입니다.`;
  }
}

type Facts = {
  board: QimenBoard;
  subject: QimenPalace | null; subjectTarget: QimenTargetRef | null;
  object: QimenPalace | null; objectTarget: QimenTargetRef | null;
  relation: ElementRelation | null;
  matterDoorClass: ReturnType<typeof doorClass>;
  subjectStarClass: ReturnType<typeof starClass>;
  objectGodClass: ReturnType<typeof godClass>;
  subjectGodClass: ReturnType<typeof godClass>;
  sameSeat: boolean;
};
function readFacts(board: QimenBoard): Facts {
  const subject = findPalaceByTrigram(board, board.zhifuPalace);
  const object = findPalaceByTrigram(board, board.zhishiPalace);
  const subjectTarget = subject ? targetRef(subject, board.zhifuPalace) : null;
  const objectTarget = object ? targetRef(object, board.zhishiPalace) : null;
  const relation = subjectTarget && objectTarget ? elementRelation(subjectTarget.element, objectTarget.element) : null;
  return {
    board, subject, subjectTarget, object, objectTarget, relation,
    matterDoorClass: doorClass(board.zhishi),
    subjectStarClass: starClass(board.zhifu),
    objectGodClass: godClass(object?.god),
    subjectGodClass: godClass(subject?.god),
    sameSeat: board.zhifuPalace === board.zhishiPalace,
  };
}

// ── shared finalize — Qimen's own (not the shared 7-domain one: EVENT_SUCCESS is an 8th domain the
// shared type doesn't carry; `combineStatus` itself IS reused, unchanged). ──────────────────────────
function finalizeQimen(
  domain: QimenConsultationDomain, f: Facts, rules: DomainRule[], syn: SyntheticInference[],
  unresolvedReasons: string[], ruleIds: string[],
): QimenDomainJudgeResult {
  const opportunities = rules.filter((r) => r.kind === 'OPPORTUNITY');
  const risks = rules.filter((r) => r.kind === 'RISK');
  const status = combineStatus(opportunities.length > 0, risks.length > 0);
  const opp = opportunities.map((r) => r.reasoning).join(' ');
  const risk = risks.map((r) => r.reasoning).join(' ');
  const conclusion = status === 'FAVORABLE' ? opp
    : status === 'CAUTION' ? risk
    : status === 'MIXED' ? `${opp} 다만, ${risk}`
    : `${DOMAIN_LABEL[domain]}을(를) 지금 판에서 판단할 근거가 충분하지 않습니다.`;
  const targetRelations = f.subjectTarget && f.objectTarget && f.relation
    ? [relationNote(f.subjectTarget, f.objectTarget, f.relation)] : [];
  return {
    domain, status, subjectTarget: f.subjectTarget, objectTarget: f.objectTarget, conclusion,
    supportingEvidence: opportunities.flatMap((r) => r.evidence),
    counterEvidence: risks.flatMap((r) => r.evidence),
    syntheticInferences: status === 'UNRESOLVED' ? [] : syn,
    targetRelations,
    opportunities: opportunities.map((r) => r.reasoning),
    risks: risks.map((r) => r.reasoning),
    timingDrivers: [...new Set(rules.map((r) => r.temporalNote).filter((x): x is string => !!x))],
    uncertaintyReasons: status === 'UNRESOLVED' ? unresolvedReasons : [],
    ruleIds,
    provenance: [QIMEN_CONSULTATION_JUDGE_V1_METHOD],
  };
}

const UNRESOLVED_NO_BOARD: QimenDomainJudgeResult['uncertaintyReasons'] = ['질문 시점의 기문 국이 없어 판단하지 않습니다.'];
function unresolvedNoBoard(domain: QimenConsultationDomain): QimenDomainJudgeResult {
  return {
    domain, status: 'UNRESOLVED', subjectTarget: null, objectTarget: null,
    conclusion: `${DOMAIN_LABEL[domain]}을(를) 지금 판에서 판단할 근거가 충분하지 않습니다.`,
    supportingEvidence: [], counterEvidence: [], syntheticInferences: [], targetRelations: [],
    opportunities: [], risks: [], timingDrivers: [],
    uncertaintyReasons: UNRESOLVED_NO_BOARD, ruleIds: ['QNOBOARD-00'], provenance: [QIMEN_CONSULTATION_JUDGE_V1_METHOD],
  };
}

// ══ BUSINESS — 값부(자신의 실행력) × 값사(사업이라는 사안) ═════════════════════════════════════════
function judgeBusiness(f: Facts): QimenDomainJudgeResult {
  const rules: DomainRule[] = [];
  if (f.matterDoorClass === 'AUSPICIOUS') {
    rules.push({ kind: 'OPPORTUNITY', reasoning: '사업이라는 사안 자체의 문이 열려 있어, 실행 여건이 갖춰져 있습니다.', evidence: [ev(`값사문(${f.board.zhishi})`, '사안을 이끄는 자리가 열려 있습니다.', 'BUSINESS', 'DIRECT')] });
  } else if (f.matterDoorClass === 'INAUSPICIOUS') {
    rules.push({ kind: 'RISK', reasoning: '사업이라는 사안 자체의 문이 막혀 있어, 지금 실행 여건은 갖춰져 있지 않습니다.', evidence: [ev(`값사문(${f.board.zhishi})`, '사안을 이끄는 자리가 막혀 있습니다.', 'BUSINESS', 'DIRECT')] });
  }
  if (f.relation === 'A_GENERATES_B' || f.relation === 'B_GENERATES_A') {
    rules.push({ kind: 'OPPORTUNITY', reasoning: '나와 사업이 서로 생(生)하는 관계라, 힘이 오가는 구조입니다.', evidence: [] });
  } else if (f.relation === 'A_CONTROLS_B') {
    rules.push({ kind: 'RISK', reasoning: '내가 사업을 극(剋)하는 관계라, 무리하게 밀어붙이면 구조를 해칠 수 있습니다.', evidence: [] });
  } else if (f.relation === 'B_CONTROLS_A') {
    rules.push({ kind: 'RISK', reasoning: '사업이 나를 극(剋)하는 관계라, 감당하기 벅찬 부담이 될 수 있습니다.', evidence: [] });
  }
  const syn = f.relation ? [{ premises: [`값사문=${f.matterDoorClass ?? '중평'}`, `값부-값사 관계=${f.relation}`], conclusion: '사안 자체의 문과 나-사업 관계를 함께 읽어 이 결론에 이릅니다.' }] : [];
  return finalizeQimen('BUSINESS', f, rules, syn, ['값사문·값부값사 관계 모두 방향을 정할 신호가 없습니다.'], ['QBUSINESS-01:matter_door', 'QBUSINESS-02:relation']);
}

// ══ MONEY — 값부가 값사를 극(剋)하면 "내가 다스릴 수 있는 재물"(고전 아극자위재), 반대는 위험 ═══════
function judgeMoney(f: Facts): QimenDomainJudgeResult {
  const rules: DomainRule[] = [];
  if (f.relation === 'A_CONTROLS_B') {
    rules.push({ kind: 'OPPORTUNITY', reasoning: '내가 재물 자리를 극(剋)하는 관계라, 재물을 다스릴 수 있는 구조입니다.', evidence: [] });
  } else if (f.relation === 'B_CONTROLS_A') {
    rules.push({ kind: 'RISK', reasoning: '재물 자리가 나를 극(剋)하는 관계라, 재물 문제에 오히려 눌리기 쉬운 구조입니다.', evidence: [] });
  }
  if (f.matterDoorClass === 'AUSPICIOUS') {
    rules.push({ kind: 'OPPORTUNITY', reasoning: '재물이 놓인 자리의 문이 열려 있어, 실제로 접근할 수 있는 통로가 있습니다.', evidence: [ev(`값사문(${f.board.zhishi})`, '재물 자리로 가는 문이 열려 있습니다.', 'MONEY', 'DIRECT')] });
  } else if (f.matterDoorClass === 'INAUSPICIOUS') {
    rules.push({ kind: 'RISK', reasoning: '재물이 놓인 자리의 문이 막혀 있어, 접근 자체가 막혀 있습니다.', evidence: [ev(`값사문(${f.board.zhishi})`, '재물 자리로 가는 문이 막혀 있습니다.', 'MONEY', 'DIRECT')] });
  }
  const syn = f.relation ? [{ premises: [`값부-값사 오행 관계=${f.relation}`, `값사문=${f.matterDoorClass ?? '중평'}`], conclusion: '내가 재물을 다스릴 수 있는 관계인지와 접근 통로가 열려 있는지를 함께 읽습니다.' }] : [];
  return finalizeQimen('MONEY', f, rules, syn, ['값부값사 관계·값사문 모두 재물 방향을 정할 신호가 없습니다.'], ['QMONEY-01:command_relation', 'QMONEY-02:access_door']);
}

// ══ CAREER — 값사가 값부를 극(剋)하면 "나를 다스리는 자리"(고전 극아자위관) — 정당한 권한/부담 겸용 ══
function judgeCareer(f: Facts): QimenDomainJudgeResult {
  const rules: DomainRule[] = [];
  if (f.relation === 'B_CONTROLS_A' && f.matterDoorClass === 'AUSPICIOUS') {
    rules.push({ kind: 'OPPORTUNITY', reasoning: '자리(직위)가 나를 다스리는 관계이면서 문도 열려 있어, 정당한 권한을 얻는 구조입니다.', evidence: [ev(`값사문(${f.board.zhishi})`, '자리·직위의 문이 열려 있습니다.', 'CAREER', 'DIRECT')] });
  } else if (f.relation === 'B_CONTROLS_A') {
    rules.push({ kind: 'RISK', reasoning: '자리(직위)가 나를 다스리는 관계인데 문은 막혀 있어, 지금은 그 무게가 부담으로 작용합니다.', evidence: f.matterDoorClass === 'INAUSPICIOUS' ? [ev(`값사문(${f.board.zhishi})`, '자리·직위의 문이 막혀 있습니다.', 'CAREER', 'DIRECT')] : [] });
  }
  if (f.subjectStarClass === 'AUSPICIOUS') {
    rules.push({ kind: 'OPPORTUNITY', reasoning: '나를 이끄는 기운 자체가 힘을 보태고 있어, 실행 여건이 받쳐 줍니다.', evidence: [ev(`값부 ${f.board.zhifu}`, '나를 이끄는 기운이 힘을 보탭니다.', 'CAREER')] });
  } else if (f.subjectStarClass === 'INAUSPICIOUS') {
    rules.push({ kind: 'RISK', reasoning: '나를 이끄는 기운이 껄끄러워, 실행 여건이 매끄럽지 않습니다.', evidence: [ev(`값부 ${f.board.zhifu}`, '나를 이끄는 기운이 껄끄럽습니다.', 'CAREER')] });
  }
  const syn = f.relation ? [{ premises: [`값부-값사 관계=${f.relation}`, `값부 구성=${f.subjectStarClass ?? '중평'}`], conclusion: '자리가 나를 다스리는 관계인지와 내 쪽 실행 여건을 함께 읽어 직업 방향을 판단합니다.' }] : [];
  return finalizeQimen('CAREER', f, rules, syn, ['값부값사 관계·값부 구성 모두 직업 방향을 정할 신호가 없습니다.'], ['QCAREER-01:authority_relation', 'QCAREER-02:self_condition']);
}

// ══ LOVE — 값부(나) × 값사(관계/상대) — door + god (호의/방해) 함께 ════════════════════════════════
function judgeLove(f: Facts): QimenDomainJudgeResult {
  const rules: DomainRule[] = [];
  if (f.matterDoorClass === 'AUSPICIOUS') {
    rules.push({ kind: 'OPPORTUNITY', reasoning: '관계가 놓인 자리의 문이 열려 있어, 자연스럽게 이어지는 구조입니다.', evidence: [ev(`값사문(${f.board.zhishi})`, '관계 자리가 열려 있습니다.', 'LOVE', 'DIRECT')] });
  } else if (f.matterDoorClass === 'INAUSPICIOUS') {
    rules.push({ kind: 'RISK', reasoning: '관계가 놓인 자리의 문이 막혀 있어, 지금은 매끄럽게 이어지기 어렵습니다.', evidence: [ev(`값사문(${f.board.zhishi})`, '관계 자리가 막혀 있습니다.', 'LOVE', 'DIRECT')] });
  }
  if (f.objectGodClass === 'AUSPICIOUS') {
    rules.push({ kind: 'OPPORTUNITY', reasoning: '상대 쪽 자리를 지키는 신이 도와주고 있어, 관계에 우호적인 기운이 있습니다.', evidence: [ev(`${f.object?.palaceLabel ?? ''} ${f.object?.god ?? ''}`, '상대 자리를 지키는 신이 도와줍니다.', 'LOVE')] });
  } else if (f.objectGodClass === 'INAUSPICIOUS') {
    rules.push({ kind: 'RISK', reasoning: '상대 쪽 자리를 지키는 신이 흔들고 있어, 관계에 방해가 되는 기운이 있습니다.', evidence: [ev(`${f.object?.palaceLabel ?? ''} ${f.object?.god ?? ''}`, '상대 자리를 지키는 신이 흔듭니다.', 'LOVE')] });
  }
  const syn = (f.matterDoorClass || f.objectGodClass) ? [{ premises: [`관계 자리 문=${f.matterDoorClass ?? '중평'}`, `상대 자리 신=${f.objectGodClass ?? '중평'}`], conclusion: '관계 자리의 문과 그 자리를 지키는 신을 함께 읽어 연애 방향을 판단합니다.' }] : [];
  return finalizeQimen('LOVE', f, rules, syn, ['관계 자리의 문·신 모두 방향을 정할 신호가 없습니다.'], ['QLOVE-01:relation_door', 'QLOVE-02:object_god']);
}

// ══ REUNION — 값부·값사 동궁(§R5, "이미 한자리에 모임") = 접촉 신호, 값부-값사 상극 = 안정성 우려 ═════
// 별도 구조: LOVE는 관계 자리의 문/신을 읽고, REUNION은 동궁 여부(접촉 자체가 성립하는가)와 극 관계
// (안정적으로 굳어질 수 있는가)를 읽습니다 — 같은 판단 로직의 별칭이 아닙니다.
function judgeReunion(f: Facts): QimenDomainJudgeResult {
  const rules: DomainRule[] = [];
  if (f.sameSeat) {
    rules.push({ kind: 'OPPORTUNITY', reasoning: '값부와 값사가 같은 궁에 있어, 나와 상대의 기운이 한곳에 모여 접촉이 이루어질 수 있는 구조입니다.', evidence: [ev(`값부·값사 동궁(${f.board.zhifuPalace}궁)`, '나와 상대가 지금 한 자리에 모입니다.', 'REUNION', 'DIRECT')] });
  }
  if (f.relation === 'A_CONTROLS_B' || f.relation === 'B_CONTROLS_A') {
    rules.push({ kind: 'RISK', reasoning: '나와 상대가 서로 극(剋)하는 관계라, 접촉이 되더라도 안정적으로 굳어지기는 쉽지 않습니다.', evidence: [] });
  }
  // sameSeat implies the SAME trigram, hence the SAME element (`relation` would be 'SAME', never a
  // control relation) — the two rules above can never both fire for the same board (verified: whenever
  // 값부·값사 sit together, the deity AT that palace is always 값符 itself, by definition always
  // AUSPICIOUS — so a same-palace god check would be equally entangled). `matterDoorClass` is the
  // genuinely INDEPENDENT signal (empirically confirmed: varies freely regardless of sameSeat), so it
  // is REUNION's second, real risk axis — letting REUNION express a genuine MIXED (opening exists, but
  // a separate obstruction also exists — §18/§25 compound truth) instead of being structurally
  // incapable of it.
  if (f.matterDoorClass === 'INAUSPICIOUS') {
    rules.push({ kind: 'RISK', reasoning: '접촉의 문 자체는 막혀 있어, 다시 만나더라도 안정적인 회복까지는 별개로 봐야 합니다.', evidence: [ev(`값사문(${f.board.zhishi})`, '접촉의 문이 막혀 있습니다.', 'REUNION')] });
  }
  const syn = (f.sameSeat || f.relation || f.matterDoorClass) ? [{ premises: [`값부값사 동궁=${f.sameSeat}`, `값부-값사 관계=${f.relation ?? '미상'}`, `접촉 문=${f.matterDoorClass ?? '중평'}`], conclusion: '접촉 자체가 성립하는지(동궁)와 그 접촉이 안정적으로 이어질 수 있는지(관계·문)를 따로 읽어 재회 방향을 판단합니다.' }] : [];
  return finalizeQimen('REUNION', f, rules, syn, ['동궁 여부·값부값사 관계·접촉 문 모두 재회 방향을 정할 신호가 없습니다.'], ['QREUNION-01:same_seat_contact', 'QREUNION-02:relation_stability', 'QREUNION-03:matter_door']);
}

// ══ CHANGE — 값사문(변화라는 사안 자체) + 관계(변화가 나를 돕는지 거스르는지) — pressure, not guaranteed
function judgeChange(f: Facts): QimenDomainJudgeResult {
  const rules: DomainRule[] = [];
  if (f.matterDoorClass === 'AUSPICIOUS') {
    rules.push({ kind: 'OPPORTUNITY', reasoning: '변화라는 사안 자체의 문이 열려 있어, 움직임을 뒷받침하는 여건이 있습니다.', evidence: [ev(`값사문(${f.board.zhishi})`, '변화를 이끄는 자리가 열려 있습니다.', 'CHANGE', 'DIRECT')] });
  } else if (f.matterDoorClass === 'INAUSPICIOUS') {
    // §21 — pressure, never a guaranteed move.
    rules.push({ kind: 'RISK', reasoning: '변화라는 사안 자체의 문이 막혀 있어, 지금 움직이면 걸리는 지점이 있을 수 있습니다. 다만 이것이 반드시 변화가 없다는 뜻은 아닙니다.', evidence: [ev(`값사문(${f.board.zhishi})`, '변화를 이끄는 자리가 막혀 있습니다.', 'CHANGE', 'DIRECT')] });
  }
  if (f.relation === 'B_GENERATES_A') {
    rules.push({ kind: 'OPPORTUNITY', reasoning: '변화라는 사안이 나를 생(生)하는 관계라, 움직임이 나에게 힘을 보탭니다.', evidence: [] });
  } else if (f.relation === 'A_CONTROLS_B') {
    rules.push({ kind: 'RISK', reasoning: '내가 변화라는 사안을 극(剋)해야 하는 관계라, 움직이려면 힘을 써야 하는 구조입니다.', evidence: [] });
  }
  const syn = (f.matterDoorClass || f.relation) ? [{ premises: [`값사문=${f.matterDoorClass ?? '중평'}`, `값부-값사 관계=${f.relation ?? '미상'}`], conclusion: '변화 자체의 문과 나-변화 관계를 함께 읽어 변화 방향을 판단합니다.' }] : [];
  return finalizeQimen('CHANGE', f, rules, syn, ['값사문·값부값사 관계 모두 변화 방향을 정할 신호가 없습니다.'], ['QCHANGE-01:matter_door', 'QCHANGE-02:relation']);
}

// ══ EVENT_SUCCESS — "will THIS proceed": 값사문(주 신호) + 값부 구성(보조) + 관계(성사 가능성) ═══════
function judgeEventSuccess(f: Facts): QimenDomainJudgeResult {
  const rules: DomainRule[] = [];
  if (f.matterDoorClass === 'AUSPICIOUS') {
    rules.push({ kind: 'OPPORTUNITY', reasoning: '이 일 자체를 이끄는 문이 열려 있어, 진행될 수 있는 여건이 갖춰져 있습니다.', evidence: [ev(`값사문(${f.board.zhishi})`, '이 일을 이끄는 자리가 열려 있습니다.', 'EVENT_SUCCESS', 'DIRECT')] });
  } else if (f.matterDoorClass === 'INAUSPICIOUS') {
    rules.push({ kind: 'RISK', reasoning: '이 일 자체를 이끄는 문이 막혀 있어, 지금은 진행되기 어려운 여건입니다.', evidence: [ev(`값사문(${f.board.zhishi})`, '이 일을 이끄는 자리가 막혀 있습니다.', 'EVENT_SUCCESS', 'DIRECT')] });
  }
  if (f.subjectStarClass === 'AUSPICIOUS') {
    rules.push({ kind: 'OPPORTUNITY', reasoning: '판을 이끄는 기운도 힘을 보태고 있습니다.', evidence: [ev(`값부 ${f.board.zhifu}`, '판을 이끄는 기운이 힘을 보탭니다.', 'EVENT_SUCCESS')] });
  } else if (f.subjectStarClass === 'INAUSPICIOUS') {
    rules.push({ kind: 'RISK', reasoning: '판을 이끄는 기운이 껄끄러워, 진행에 방해가 될 수 있습니다.', evidence: [ev(`값부 ${f.board.zhifu}`, '판을 이끄는 기운이 껄끄럽습니다.', 'EVENT_SUCCESS')] });
  }
  if (f.sameSeat) {
    rules.push({ kind: 'OPPORTUNITY', reasoning: '값부와 값사가 같은 궁에 모여, 신호가 그만큼 뚜렷합니다.', evidence: [ev(`값부·값사 동궁(${f.board.zhifuPalace}궁)`, '기운이 한곳에 모여 신호가 뚜렷합니다.', 'EVENT_SUCCESS')] });
  }
  const syn = f.matterDoorClass ? [{ premises: [`값사문=${f.matterDoorClass}`, `값부 구성=${f.subjectStarClass ?? '중평'}`, `동궁=${f.sameSeat}`], conclusion: '이 일을 이끄는 문, 판을 이끄는 기운, 동궁 여부를 함께 읽어 성사 가능성을 판단합니다.' }] : [];
  return finalizeQimen('EVENT_SUCCESS', f, rules, syn, ['값사문·값부 구성·동궁 모두 성사 방향을 정할 신호가 없습니다.'], ['QEVENT-01:matter_door', 'QEVENT-02:commander_star', 'QEVENT-03:same_seat']);
}

// ══ TIMING — "is NOW favorable": 값사문 + 동궁(R5) — mirrors judgeQimen's own core question, through
// the shared opportunity/risk architecture; judgeQimen's own R1-R5 stance stays the authoritative one.
function judgeTiming(f: Facts): QimenDomainJudgeResult {
  const rules: DomainRule[] = [];
  if (f.matterDoorClass === 'AUSPICIOUS') {
    rules.push({ kind: 'OPPORTUNITY', reasoning: '지금 이 일을 이끄는 자리가 열려 있어, 움직이기에 뒷받침이 되는 시점입니다.', evidence: [ev(`값사문(${f.board.zhishi})`, '지금 이 일을 이끄는 자리가 열려 있습니다.', 'TIMING', 'DIRECT')], temporalNote: `duty door ${f.board.zhishi} auspicious` });
  } else if (f.matterDoorClass === 'INAUSPICIOUS') {
    rules.push({ kind: 'RISK', reasoning: '지금 이 일을 이끄는 자리가 막혀 있어, 신중히 움직여야 하는 시점입니다.', evidence: [ev(`값사문(${f.board.zhishi})`, '지금 이 일을 이끄는 자리가 막혀 있습니다.', 'TIMING', 'DIRECT')], temporalNote: `duty door ${f.board.zhishi} inauspicious` });
  }
  if (f.sameSeat) {
    rules.push({ kind: 'OPPORTUNITY', reasoning: '값부·값사가 같은 궁에 모여, 지금 신호가 뚜렷합니다.', evidence: [ev(`값부·값사 동궁(${f.board.zhifuPalace}궁)`, '기운이 한곳에 모여 신호가 뚜렷합니다.', 'TIMING')], temporalNote: 'same-seat concentration' });
  }
  const syn = f.matterDoorClass ? [{ premises: [`값사문=${f.matterDoorClass}`, `동궁=${f.sameSeat}`], conclusion: '지금 이 순간을 이끄는 문과 동궁 여부를 함께 읽어 시기 방향을 판단합니다.' }] : [];
  return finalizeQimen('TIMING', f, rules, syn, ['값사문·동궁 모두 시기 방향을 정할 신호가 없습니다.'], ['QTIMING-01:duty_door', 'QTIMING-02:same_seat']);
}

const JUDGES: Record<QimenConsultationDomain, (f: Facts) => QimenDomainJudgeResult> = {
  BUSINESS: judgeBusiness, MONEY: judgeMoney, CAREER: judgeCareer, LOVE: judgeLove,
  REUNION: judgeReunion, CHANGE: judgeChange, EVENT_SUCCESS: judgeEventSuccess, TIMING: judgeTiming,
};

/**
 * Compute all 8 consultation-domain judgments from one Qimen board. Pure, deterministic, synchronous —
 * same board always produces the same 8 results. `null` board (Qimen not applicable/unavailable for
 * this question) → all 8 honestly UNRESOLVED, never guessed.
 */
export function judgeAllQimenConsultationDomains(board: QimenBoard | null): Record<QimenConsultationDomain, QimenDomainJudgeResult> {
  const domains = Object.keys(JUDGES) as QimenConsultationDomain[];
  const out = {} as Record<QimenConsultationDomain, QimenDomainJudgeResult>;
  if (!board) {
    for (const d of domains) out[d] = unresolvedNoBoard(d);
    return out;
  }
  const f = readFacts(board);
  for (const d of domains) out[d] = JUDGES[d](f);
  return out;
}

// ── question routing — the 6 topic domains reuse the SAME routing Myungri/Ziwei already resolve
// (`routeConsultationJudgeDomain`); EVENT_SUCCESS/TIMING are always additionally available whenever
// Qimen itself is active (its own eligibility gate already requires a decision/timing-shaped question —
// see `qimenActivation.ts`), since a question decision-shaped enough to activate Qimen at all always
// implicitly asks both "will this work" and "is now the moment". ─────────────────────────────────────
export { routeConsultationJudgeDomain } from './consultationJudgeCore';
