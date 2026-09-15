// ZIWEI CORE CONSULTATION JUDGES V1 — turns 12-palace placement + 삼방사정 + 四化 + 大限 into 7
// domain-specific consultation conclusions: BUSINESS, MONEY, CAREER, LOVE, REUNION, CHANGE, TIMING.
// Same shared architecture and result contract as `myungriConsultationJudge.ts`
// (`consultationJudgeTypes.ts`/`consultationJudgeCore.ts`) — INDEPENDENT of Myungri: this module never
// imports anything from `myungriStructuralV2.ts`/`myungriYongshin.ts`/`myungriNatal.ts`, and Myungri's
// facts can never alter a Ziwei verdict (kernel-integration brief §28/§29 — no cross-discipline merge
// happens here; that is a later Cross Judge task).
//
// REUSE, NOT REBUILD (§2 of the implementation brief — "one operational system, do not duplicate an
// existing engine"): every domain function below reuses `judgePalaceAxis` from `ziweiJudge.ts`, the
// SAME 삼방사정 + R2′ 사화-role reasoning that module's own independent structural judge already uses
// (never counts 록/권/과 as interchangeable positives — see that file's own header for why). This module
// does not reimplement palace/사화 reasoning; it only DECIDES WHICH axes each of the 7 domains reads and
// COMBINES their stances into the shared FAVORABLE/CAUTION/MIXED/UNRESOLVED contract (§9 — no
// score/vote model; §5 of the Myungri brief this architecture was built for still applies verbatim).
//
// 大限 (decadal period) is the ONE genuinely new capability this batch adds (`ziweiDecadal.ts`) — TIMING
// is the only domain that reads it, since natal-structure domains (BUSINESS/MONEY/CAREER/LOVE/REUNION/
// CHANGE) are correctly read from the NATAL chart regardless of period (§14 of the brief: keep NATAL
// and 大限 distinct, never collapse a natal structure into an event date).
import type { ZiweiChart, ZiweiPalace } from '@/features/ziwei/domain/ziweiTypes';
import { NO_SIGNAL, type JudgmentDomain, type Stance } from './contracts';
import { judgePalaceAxis, palaceForDomain, sihuaKind, triadOf } from './ziweiJudge';
import type {
  ConsultationJudgeDomain, DomainJudgeResult, SyntheticInference,
} from './consultationJudgeTypes';
import { finalize, routeConsultationJudgeDomain, type DomainRule } from './consultationJudgeCore';

export type { ConsultationJudgeDomain, DomainJudgeResult, DomainJudgeStatus, SyntheticInference } from './consultationJudgeTypes';

export const ZIWEI_CONSULTATION_JUDGE_V1_METHOD = 'deokbunai.ziwei-consultation-judge.v1' as const;

export type ZiweiConsultationJudgeInput = {
  chart: ZiweiChart;
  /** This person's CURRENT 大限 palace (`ziweiDecadal.ts`'s `activeDecadalPalace`), or `null` when
   *  unavailable (no birth time precision, or the computed age falls outside all 12 ranges). */
  activeDecadal: ZiweiPalace | null;
};

const OPPORTUNITY_STANCES = new Set<Stance>(['STRONGLY_FOR', 'FOR', 'CONDITIONAL_FOR']);
const RISK_STANCES = new Set<Stance>(['AGAINST', 'CONDITIONAL_AGAINST', 'STRONGLY_AGAINST', 'AGAINST_FOR_NOW']);

/** One palace-axis read (`judgePalaceAxis`), turned into a shared `DomainRule` — reuses the REAL
 *  R2′ 사화-role stance `ziweiJudge.ts` already computed; never recomputes 사화 meaning itself. */
function ruleFromAxis(chart: ZiweiChart, axis: JudgmentDomain, asked: JudgmentDomain, structuralDriver: string): DomainRule | null {
  const read = judgePalaceAxis(chart, axis, asked);
  if (!read || read.sub.stance === NO_SIGNAL) return null;
  const { sub } = read;
  if (OPPORTUNITY_STANCES.has(sub.stance)) {
    return { kind: 'OPPORTUNITY', reasoning: sub.conclusion, evidence: sub.evidence, structuralDriver };
  }
  if (RISK_STANCES.has(sub.stance)) {
    return { kind: 'RISK', reasoning: sub.conclusion, evidence: sub.counterEvidence, structuralDriver };
  }
  return null; // a non-directional stance this reasoning never produces (STRUCTURAL_ANSWER etc.) — skip, never force
}

function synthesisFromRules(domain: string, tag1: string, r1: DomainRule | null, tag2: string, r2: DomainRule | null): SyntheticInference[] {
  if (!r1 && !r2) return [];
  return [{
    premises: [`${tag1}=${r1 ? r1.kind : 'NO_SIGNAL'}`, `${tag2}=${r2 ? r2.kind : 'NO_SIGNAL'}`],
    conclusion: `${domain} 관련 두 궁(${tag1}/${tag2})의 실제 사화·삼방사정 신호를 함께 읽어 이 결론에 이릅니다.`,
  }];
}

// ══ BUSINESS — 명궁(실행력) + 재백(실제 재물 유입) ═════════════════════════════════════════════════
function judgeBusiness(input: ZiweiConsultationJudgeInput): DomainJudgeResult {
  const { chart } = input;
  const self = ruleFromAxis(chart, 'OPPORTUNITY', 'OPPORTUNITY', 'PALACE:명궁');
  const wealth = ruleFromAxis(chart, 'MONEY_INFLOW', 'OPPORTUNITY', 'PALACE:재백');
  const rules = [self, wealth].filter((r): r is DomainRule => r !== null);
  const syn = synthesisFromRules('사업', '명궁', self, '재백', wealth);
  return finalize('BUSINESS', rules, syn,
    ['명궁·재백 삼방사정에 실행/재물 방향을 정할 사화 신호가 없습니다.'],
    ['ZBUSINESS-01:self_palace', 'ZBUSINESS-02:wealth_palace'], ZIWEI_CONSULTATION_JUDGE_V1_METHOD);
}

// ══ MONEY — 재백(유입) + 전택(보관·자산) ═══════════════════════════════════════════════════════════
function judgeMoney(input: ZiweiConsultationJudgeInput): DomainJudgeResult {
  const { chart } = input;
  const inflow = ruleFromAxis(chart, 'MONEY_INFLOW', 'MONEY_INFLOW', 'PALACE:재백');
  const retention = ruleFromAxis(chart, 'MONEY_RETENTION', 'MONEY_INFLOW', 'PALACE:전택');
  const rules = [inflow, retention].filter((r): r is DomainRule => r !== null);
  const syn = synthesisFromRules('재물', '재백', inflow, '전택', retention);
  return finalize('MONEY', rules, syn,
    ['재백·전택 삼방사정에 유입/보관 방향을 정할 사화 신호가 없습니다.'],
    ['ZMONEY-01:wealth_palace', 'ZMONEY-02:property_palace'], ZIWEI_CONSULTATION_JUDGE_V1_METHOD);
}

// ══ CAREER — 관록(직업 자리) + 천이(이동·변동 압력) ═══════════════════════════════════════════════
function judgeCareer(input: ZiweiConsultationJudgeInput): DomainJudgeResult {
  const { chart } = input;
  const career = ruleFromAxis(chart, 'CAREER', 'CAREER', 'PALACE:관록');
  const movement = ruleFromAxis(chart, 'MOVEMENT', 'CAREER', 'PALACE:천이');
  const rules = [career, movement].filter((r): r is DomainRule => r !== null);
  const syn = synthesisFromRules('직업', '관록', career, '천이', movement);
  return finalize('CAREER', rules, syn,
    ['관록·천이 삼방사정에 직업 방향을 정할 사화 신호가 없습니다.'],
    ['ZCAREER-01:career_palace', 'ZCAREER-02:travel_palace'], ZIWEI_CONSULTATION_JUDGE_V1_METHOD);
}

// ══ LOVE — 부처(배우자 자리) + 형제(대인관계 마찰 맥락) ═══════════════════════════════════════════
function judgeLove(input: ZiweiConsultationJudgeInput): DomainJudgeResult {
  const { chart } = input;
  const spouse = ruleFromAxis(chart, 'RELATION_BOND', 'RELATION_BOND', 'PALACE:부처');
  const conflict = ruleFromAxis(chart, 'CONFLICT', 'RELATION_BOND', 'PALACE:형제');
  const rules = [spouse, conflict].filter((r): r is DomainRule => r !== null);
  const syn = synthesisFromRules('연애', '부처', spouse, '형제', conflict);
  return finalize('LOVE', rules, syn,
    ['부처·형제 삼방사정에 관계 방향을 정할 사화 신호가 없습니다.'],
    ['ZLOVE-01:spouse_palace', 'ZLOVE-02:sibling_palace_context'], ZIWEI_CONSULTATION_JUDGE_V1_METHOD);
}

// ══ REUNION — 부처 삼방사정의 화록(접촉/열림)과 부처 본궁의 화기(안정성 우려)를 별도로 읽음 ═════════
// Deliberately NOT `ruleFromAxis('RELATION_BOND', ...)` — that reuses LOVE's generic FOR/AGAINST
// role reasoning. REUNION asks a DIFFERENT question ("is reconnection open" vs "is the bond stable"),
// so it reads the SAME 부처 palace with a DIFFERENT, narrower rule: 화록 anywhere in 부처's 삼방사정 is
// the "contact/opening" signal (recreates DeokbunAI Myungri REUNION's day-seat-harmony design in
// Ziwei's own vocabulary); 화기 landing specifically ON 부처 itself (not the triad) is the stability
// concern — the palace's OWN obstruction, not a peripheral one.
function judgeReunion(input: ZiweiConsultationJudgeInput): DomainJudgeResult {
  const { chart } = input;
  const spousePalace = chart.palaces.find((p) => p.name.includes('부처'));
  if (!spousePalace) {
    return finalize('REUNION', [], [], ['명반에서 부처궁을 찾지 못했습니다.'], ['ZREUNION-00:no_palace'], ZIWEI_CONSULTATION_JUDGE_V1_METHOD);
  }
  const { opposite, triangles } = triadOf(chart, spousePalace);
  const triadSet = [spousePalace, opposite, ...triangles].filter((p): p is ZiweiPalace => p !== null);
  const landedOn = (palace: ZiweiPalace) => chart.transformations.filter((t) => palace.name.includes(t.palaceName) || t.palaceName.includes(palace.name));

  const rules: DomainRule[] = [];
  const opening = triadSet.flatMap((p) => landedOn(p).map((t) => ({ p, t }))).find((x) => sihuaKind(x.t.transformation) === 'ROK');
  if (opening) {
    rules.push({
      kind: 'OPPORTUNITY',
      reasoning: `부처궁의 삼방사정(${opening.p.name})에 화록이 들어와, 연락·접촉이 다시 열릴 수 있는 구조적 신호가 있습니다.`,
      evidence: [{
        fact: `${opening.p.name}에 ${opening.t.star} 화록`, meaning: '배우자 자리와 맞물린 자리에 접촉이 열리는 힘이 들어옵니다.',
        domain: 'RELATION_BOND', temporalScope: 'NATAL', directness: opening.p === spousePalace ? 'DIRECT' : 'ADJACENT',
      }],
      structuralDriver: 'PALACE:부처_삼방사정_화록',
    });
  }
  const giOnSpouse = landedOn(spousePalace).find((t) => sihuaKind(t.transformation) === 'GI');
  if (giOnSpouse) {
    rules.push({
      kind: 'RISK',
      reasoning: '부처궁 본궁에 화기가 들어와, 접촉이 되더라도 안정적인 회복까지는 별개로 봐야 합니다.',
      evidence: [{
        fact: `부처(본궁)에 ${giOnSpouse.star} 화기`, meaning: '배우자 자리 자체가 막히거나 얽히는 힘을 받습니다.',
        domain: 'RELATION_STABILITY', temporalScope: 'NATAL', directness: 'DIRECT',
      }],
      structuralDriver: 'PALACE:부처_본궁_화기',
    });
  }
  const syn: SyntheticInference[] = (opening || giOnSpouse)
    ? [{
        premises: [`부처궁 삼방사정 화록(접촉 신호)=${!!opening}`, `부처궁 본궁 화기(안정성 우려)=${!!giOnSpouse}`],
        conclusion: opening && giOnSpouse
          ? '재회·재접촉의 가능성은 구조적으로 열려 있지만, 안정적인 회복까지는 별개의 문제입니다.'
          : opening
            ? '재회·재접촉이 구조적으로 열릴 수 있는 신호가 있습니다.'
            : '접촉이 열렸다는 신호 없이, 배우자 자리의 불안정만 확인됩니다.',
      }]
    : [];
  return finalize('REUNION', rules, syn,
    ['부처궁 삼방사정에 접촉(화록)·안정성(화기) 신호가 확인되지 않습니다.'],
    ['ZREUNION-01:triad_rok_opening', 'ZREUNION-02:main_gi_stability'], ZIWEI_CONSULTATION_JUDGE_V1_METHOD);
}

// ══ CHANGE — 천이(이동) + 관록(직업 변동 압력) — pressure, never a guaranteed move (§21) ══════════
function judgeChange(input: ZiweiConsultationJudgeInput): DomainJudgeResult {
  const { chart } = input;
  const travel = ruleFromAxis(chart, 'MOVEMENT', 'MOVEMENT', 'PALACE:천이');
  const career = ruleFromAxis(chart, 'CAREER', 'MOVEMENT', 'PALACE:관록');
  const rules = [travel, career].filter((r): r is DomainRule => r !== null)
    // §21 — a RISK rule here reports PRESSURE, never a guaranteed event; ziweiJudge's own conclusion
    // text is already framed as "쉽지 않다"/"막히기 쉽다" (obstruction), never "반드시 이동합니다".
    .map((r) => r);
  const syn = synthesisFromRules('변화', '천이', travel, '관록', career);
  return finalize('CHANGE', rules, syn,
    ['천이·관록 삼방사정에 변화 방향을 정할 사화 신호가 없습니다.'],
    ['ZCHANGE-01:travel_palace', 'ZCHANGE-02:career_palace_pressure'], ZIWEI_CONSULTATION_JUDGE_V1_METHOD);
}

// ══ TIMING — reads the CURRENTLY ACTIVE 大限 palace's own 사화, never natal-only, never a date ═════
function judgeTiming(input: ZiweiConsultationJudgeInput): DomainJudgeResult {
  const { chart, activeDecadal } = input;
  if (!activeDecadal) {
    return finalize('TIMING', [], [],
      ['현재 활성화된 大限(10년 주기) 정보가 없어 시기를 판단하지 않습니다.'],
      ['ZTIMING-00:no_active_decadal'], ZIWEI_CONSULTATION_JUDGE_V1_METHOD);
  }
  const landed = chart.transformations.filter((t) => activeDecadal.name.includes(t.palaceName) || t.palaceName.includes(activeDecadal.name));
  const rules: DomainRule[] = [];
  for (const t of landed) {
    const kind = sihuaKind(t.transformation);
    if (!kind) continue;
    if (kind === 'GI') {
      rules.push({
        kind: 'RISK',
        reasoning: `지금의 大限(${activeDecadal.name})에 화기가 들어와, 이 시기는 막히거나 얽히기 쉬운 흐름입니다.`,
        evidence: [{ fact: `${activeDecadal.name}(大限)에 ${t.star} 화기`, meaning: '지금 이 10년 주기가 막히는 힘을 받습니다.', domain: 'TIMING', temporalScope: 'DAEWOON', directness: 'DIRECT' }],
        temporalNote: `active decadal palace ${activeDecadal.name} carries 화기`,
      });
    } else {
      rules.push({
        kind: 'OPPORTUNITY',
        reasoning: `지금의 大限(${activeDecadal.name})에 사화가 들어와, 이 시기는 움직이기에 뒷받침이 되는 흐름입니다.`,
        evidence: [{ fact: `${activeDecadal.name}(大限)에 ${t.star} 화${kind === 'ROK' ? '록' : kind === 'GWON' ? '권' : '과'}`, meaning: '지금 이 10년 주기가 열리는 힘을 받습니다.', domain: 'TIMING', temporalScope: 'DAEWOON', directness: 'DIRECT' }],
        temporalNote: `active decadal palace ${activeDecadal.name} carries 화${kind}`,
      });
    }
  }
  const syn: SyntheticInference[] = rules.length > 0
    ? [{
        premises: [`활성 大限 궁=${activeDecadal.name}`, `해당 궁 사화 존재=${landed.length > 0}`],
        conclusion: '지금 활성화된 大限 궁 자체에 사화가 실제로 들어와 있어, 시기 판단이 구조적으로 근거를 가집니다.',
      }]
    : [];
  return finalize('TIMING', rules, syn,
    [`지금의 大限(${activeDecadal.name})에 방향을 정할 사화 신호가 없습니다.`],
    ['ZTIMING-01:active_decadal_sihua'], ZIWEI_CONSULTATION_JUDGE_V1_METHOD);
}

const JUDGES: Record<ConsultationJudgeDomain, (input: ZiweiConsultationJudgeInput) => DomainJudgeResult> = {
  BUSINESS: judgeBusiness, MONEY: judgeMoney, CAREER: judgeCareer, LOVE: judgeLove,
  REUNION: judgeReunion, CHANGE: judgeChange, TIMING: judgeTiming,
};

/**
 * Compute all 7 consultation-domain judgments from one Ziwei chart + its currently active 大限 palace.
 * Pure, deterministic, synchronous — same input always produces the same 7 results.
 */
export function judgeAllZiweiConsultationDomains(
  input: ZiweiConsultationJudgeInput,
): Record<ConsultationJudgeDomain, DomainJudgeResult> {
  const out = {} as Record<ConsultationJudgeDomain, DomainJudgeResult>;
  for (const domain of Object.keys(JUDGES) as ConsultationJudgeDomain[]) {
    out[domain] = JUDGES[domain](input);
  }
  return out;
}

/** Re-exported so a live-pipeline caller does not need to import both judge modules to route. */
export { routeConsultationJudgeDomain };
export { palaceForDomain };
