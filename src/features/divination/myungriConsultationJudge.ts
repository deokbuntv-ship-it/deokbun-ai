// MYUNGRI CORE CONSULTATION JUDGES V1 — turns Structural V2 + Yongshin V1 + natal baseline + temporal
// layers into 7 domain-specific consultation conclusions: BUSINESS, MONEY, CAREER, LOVE, REUNION,
// CHANGE, TIMING. This is the layer that makes a consultation actually about THIS chart's structure
// rather than a generic reading — see module header of `consultationJudgeTypes.ts` for the shared
// contract (also used by `ziweiConsultationJudge.ts`) and `consultationJudgeCore.ts` for the shared
// combination mechanics (`combineStatus`/`finalize`).
//
// ARCHITECTURE (§21 of the implementation brief): the SHARED combination core (`consultationJudgeCore.ts`)
// + 7 domain-specific RULE FUNCTIONS that each read real existing facts and push typed `DomainRule`s. No
// domain is a duplicated engine — the differences between domains live entirely in WHICH facts each
// rule function reads and WHY, never in the combination mechanics.
//
// NO VOTING, NO SCORING (§5). `combineStatus` is a 4-way categorical gate over two BOOLEANS (does a
// grounded opportunity exist / does a grounded risk exist), never a count, weight, or percentage — the
// same discipline `polarityKernel.ts`'s own header insists on for its own 4-way tier.
//
// NEITHER STRENGTH NOR YONGSHIN IS KING (§3). No rule function reads `structuralV2.strengthView` or
// `yongshin.primaryCandidate` alone and calls that a verdict — Structural V2 informs `structuralDrivers`
// context and gates BUSINESS/MONEY's baseline presence checks are read from `NatalBaseline`
// (independent of the strength label), and Yongshin only ever ADDS or WITHHOLDS a supporting/risk
// signal on top of natal+temporal facts that already exist — removing it never flips a domain's status
// from FAVORABLE to UNRESOLVED (verified by `myungriConsultationJudge.test.ts`).
import type { FiveElement } from '@/features/interpretation';
import type { JudgmentEvidence } from './contracts';
import type { NatalBaseline } from './myungriNatal';
import type { LayerAnalysis } from './myungriLayer';
import { axisPressure } from './myungriLayer';
import type { TenGodFamily } from './myungriJudge';
import type { MyungriStructuralV2Result } from './myungriStructuralV2';
import { familyOf, type MyungriYongshinResult } from './myungriYongshin';
import type {
  ConsultationJudgeDomain, DomainJudgeResult, DomainJudgeStatus, SyntheticInference,
} from './consultationJudgeTypes';
import { combineStatus, finalize, type DomainRule } from './consultationJudgeCore';

export type { ConsultationJudgeDomain, DomainJudgeResult, DomainJudgeStatus, SyntheticInference } from './consultationJudgeTypes';

export const MYUNGRI_CONSULTATION_JUDGE_V1_METHOD = 'deokbunai.myungri-consultation-judge.v1' as const;

export type MyungriConsultationJudgeInput = {
  dayMasterElement: FiveElement;
  structuralV2: MyungriStructuralV2Result;
  yongshin: MyungriYongshinResult;
  baseline: NatalBaseline | null;
  layers: LayerAnalysis[];
};

const FAMILY_LABEL: Record<TenGodFamily, string> = {
  WEALTH: '재성', OFFICER: '관성', OUTPUT: '식상', PEER: '비겁', RESOURCE: '인성',
};

const ev = (fact: string, meaning: string, domain: JudgmentEvidence['domain'], scope: JudgmentEvidence['temporalScope']): JudgmentEvidence => ({
  fact, meaning, domain, temporalScope: scope, directness: 'ADJACENT',
});

// ── shared fact-reading helpers (existing facts only — §19, NEW_FACT_PROVIDERS = 0 — §20) ──────────
const hasFamily = (baseline: NatalBaseline | null, family: TenGodFamily): boolean =>
  (baseline?.familyPresence[family] ?? 0) > 0;
const layerFamilyActive = (layers: LayerAnalysis[], family: TenGodFamily): LayerAnalysis[] =>
  layers.filter((l) => l.family === family && !l.silent);
/** Does at least one active layer carry a genuine (not silent) relation to the natal chart at all? */
const anyLayerActive = (layers: LayerAnalysis[]): boolean => layers.some((l) => !l.silent);

/** Yongshin's PRIMARY or SUPPORTING candidates whose ten-god family (relative to the day master) is `family`. */
function yongshinSupportsFamily(yongshin: MyungriYongshinResult, dayMasterElement: FiveElement, family: TenGodFamily): FiveElement | null {
  if (yongshin.status !== 'SELECTED' && yongshin.status !== 'MULTI_CANDIDATE') return null;
  const candidates = [yongshin.primaryCandidate, ...yongshin.supportingCandidates].filter((e): e is FiveElement => !!e);
  return candidates.find((c) => familyOf(dayMasterElement, c) === family) ?? null;
}
/**
 * Yongshin's CONTRAINDICATED candidates whose ten-god family (relative to the day master) is `family`.
 *
 * 2026-09-02 — status 가드를 지지 쪽과 **대칭**으로 맞췄다 (YONGSHIN_CONSISTENCY_AUDIT N11). 이전에는
 * 지지 쪽에만 가드가 있어서, MULTI_CANDIDATE(용신·희신이 비어 지지 신호가 구조적으로 불가능)에서
 * 경고만 살아남았다 — "방향을 정할 근거가 없다"고 선언한 사주가 RISK 만 만드는 편향이었다.
 * 두 헬퍼가 같은 조건에서만 말하도록 한다.
 */
function yongshinWarnsAgainstFamily(yongshin: MyungriYongshinResult, dayMasterElement: FiveElement, family: TenGodFamily): FiveElement | null {
  if (yongshin.status !== 'SELECTED' && yongshin.status !== 'MULTI_CANDIDATE') return null;
  return yongshin.contraindicatedCandidates.find((c) => familyOf(dayMasterElement, c) === family) ?? null;
}

// ══ BUSINESS (§7, §16) ══════════════════════════════════════════════════════════════════════════
function judgeBusiness(input: MyungriConsultationJudgeInput): DomainJudgeResult {
  const { baseline, layers, yongshin, dayMasterElement } = input;
  const rules: DomainRule[] = [];
  const syn: SyntheticInference[] = [];

  const outputExists = hasFamily(baseline, 'OUTPUT');
  const wealthExists = hasFamily(baseline, 'WEALTH');
  const outputActiveLayers = layerFamilyActive(layers, 'OUTPUT');
  const wealthActiveLayers = layerFamilyActive(layers, 'WEALTH');
  const outputAvailable = outputExists || outputActiveLayers.length > 0;
  const wealthAvailable = wealthExists || wealthActiveLayers.length > 0;

  if (outputAvailable && wealthAvailable) {
    rules.push({
      kind: 'OPPORTUNITY',
      reasoning: '활동·표현으로 만든 결과가 재물로 이어질 수 있는 구조적 통로가 있습니다.',
      evidence: [ev(
        `원국/운 식상 존재=${outputAvailable}, 재성 존재=${wealthAvailable}`,
        '활동이 재물로 연결되는 자리가 구조적으로 갖춰져 있습니다.', 'OPPORTUNITY', 'NATAL',
      )],
      structuralDriver: 'NATAL_FAMILY:OUTPUT+WEALTH',
    });
    syn.push({
      premises: [`활동(식상) 통로 존재=${outputAvailable}`, `재물(재성) 통로 존재=${wealthAvailable}`],
      conclusion: '활동이 재물로 이어지는 실행 경로가 구조적으로 성립합니다 — 사업/활동이 수익으로 연결될 수 있는 바탕입니다.',
    });
  }

  const controlBurden = layers.some((l) => axisPressure(l, 'CAREER').heavyHit);
  if (controlBurden) {
    const evList = layers.flatMap((l) => axisPressure(l, 'CAREER').counterEvidence);
    rules.push({
      kind: 'RISK',
      reasoning: '지금 흐름이 사회적 책임·통제 자리를 정면으로 흔들어, 실행 과정에서 부담이 따를 수 있습니다.',
      evidence: evList,
      structuralDriver: 'SEAT_CONTACT:MONTH(heavy)',
    });
  }

  // §3 — Yongshin never MANUFACTURES an opportunity/risk on its own; it only reinforces or warns
  // against a signal a natal/temporal fact has ALREADY established this turn (`rules.length > 0`).
  // Removing Yongshin from the input can soften a FAVORABLE/CAUTION conclusion's wording, but can
  // never flip UNRESOLVED into a directional status by itself (verified by a dedicated negative test).
  if (rules.length > 0) {
    const supportElement = yongshinSupportsFamily(yongshin, dayMasterElement, 'OUTPUT') ?? yongshinSupportsFamily(yongshin, dayMasterElement, 'WEALTH');
    if (supportElement) {
      rules.push({
        kind: 'OPPORTUNITY',
        reasoning: '억부용신 방향이 활동·재물 계열과 맞아, 사업 실행을 구조적으로 뒷받침합니다.',
        evidence: [],
        disciplineNote: `yongshin candidate ${supportElement} supports OUTPUT/WEALTH`,
      });
      syn.push({
        premises: [`억부용신 후보=${supportElement}`, `해당 오행의 십신 계열=${familyOf(dayMasterElement, supportElement)}`],
        conclusion: '억부용신 방향이 사업 실행에 필요한 방향과 겹쳐, 지금 구조가 실행을 방해하지 않습니다.',
      });
    }
    const warnElement = yongshinWarnsAgainstFamily(yongshin, dayMasterElement, 'OUTPUT') ?? yongshinWarnsAgainstFamily(yongshin, dayMasterElement, 'WEALTH');
    if (warnElement) {
      rules.push({
        kind: 'RISK',
        reasoning: '억부용신 기준으로 피해야 할 방향이 활동·재물 계열과 겹쳐, 무리한 확장은 구조를 해칠 수 있습니다.',
        evidence: [],
        disciplineNote: `yongshin contraindicated ${warnElement} overlaps OUTPUT/WEALTH`,
      });
    }
  }

  return finalize('BUSINESS', rules, syn,
    ['사업을 뒷받침할 활동·재물 구조가 원국과 현재 흐름 어디에서도 확인되지 않습니다.'],
    ['BUSINESS-01:output_wealth_route', 'BUSINESS-02:control_burden', 'BUSINESS-03:yongshin_relevance'], MYUNGRI_CONSULTATION_JUDGE_V1_METHOD);
}

// ══ MONEY (§8, §17) ═════════════════════════════════════════════════════════════════════════════
function judgeMoney(input: MyungriConsultationJudgeInput): DomainJudgeResult {
  const { baseline, layers, yongshin, dayMasterElement } = input;
  const rules: DomainRule[] = [];
  const syn: SyntheticInference[] = [];

  const wealthExists = hasFamily(baseline, 'WEALTH');
  const wealthActive = layerFamilyActive(layers, 'WEALTH');
  const earningAvailable = wealthExists || wealthActive.length > 0;
  if (earningAvailable) {
    rules.push({
      kind: 'OPPORTUNITY',
      reasoning: '재물이 들어올 수 있는 통로가 원국 또는 현재 흐름에 실제로 있습니다.',
      evidence: [ev(`원국 재성 존재=${wealthExists}, 운 재성 활성=${wealthActive.length > 0}`, '재물이 들어오는 자리가 구조적으로 갖춰져 있습니다.', 'MONEY_INFLOW', 'NATAL')],
      structuralDriver: 'NATAL_FAMILY:WEALTH',
    });
  }

  if (baseline?.anchored === 'FLOATING') {
    rules.push({
      kind: 'RISK',
      reasoning: '일간의 뿌리가 약해, 들어온 재물이 오래 남기는 어려운 구조입니다.',
      evidence: baseline.evidence.filter((e) => e.domain === 'MONEY_RETENTION'),
      structuralDriver: 'ROOTING:FLOATING',
    });
  } else if (baseline?.anchored === 'ROOTED') {
    rules.push({
      kind: 'OPPORTUNITY',
      reasoning: '일간의 뿌리가 단단해, 들어온 재물을 지키는 힘이 있습니다.',
      evidence: baseline.evidence.filter((e) => e.domain === 'MONEY_RETENTION'),
      structuralDriver: 'ROOTING:ROOTED',
    });
  }

  if (earningAvailable && (baseline?.anchored === 'ROOTED' || baseline?.anchored === 'FLOATING')) {
    syn.push({
      premises: [`재물 유입 통로 존재=${earningAvailable}`, `일간 뿌리 상태=${baseline.anchored}`],
      conclusion: baseline.anchored === 'ROOTED'
        ? '재물이 들어오는 통로와 그것을 지키는 구조가 함께 있어, 유입과 보유가 같이 갑니다.'
        : '재물이 들어오는 통로는 있으나 지키는 구조가 약해, 유입과 보유를 나누어 봐야 합니다.',
    });
  }

  // §3 — Yongshin only reinforces/warns against a signal already established above; see BUSINESS's
  // identical guard for the full rationale.
  if (rules.length > 0) {
    const support = yongshinSupportsFamily(yongshin, dayMasterElement, 'WEALTH');
    if (support) {
      rules.push({
        kind: 'OPPORTUNITY', reasoning: '억부용신 방향이 재물 계열과 맞아, 재물 흐름을 구조적으로 뒷받침합니다.',
        evidence: [], disciplineNote: `yongshin candidate ${support} supports WEALTH`,
      });
      if (syn.length === 0) {
        syn.push({
          premises: [`억부용신 후보=${support}`, `해당 오행의 십신 계열=WEALTH`],
          conclusion: '억부용신 방향이 재물 계열과 겹쳐, 재물 흐름이 구조적으로 막혀 있지 않습니다.',
        });
      }
    }
    const warn = yongshinWarnsAgainstFamily(yongshin, dayMasterElement, 'WEALTH');
    if (warn) {
      rules.push({
        kind: 'RISK', reasoning: '억부용신 기준으로 피해야 할 방향이 재물 계열과 겹쳐, 무리한 재물 확장은 조심해야 합니다.',
        evidence: [], disciplineNote: `yongshin contraindicated ${warn} overlaps WEALTH`,
      });
    }
  }

  return finalize('MONEY', rules, syn,
    ['재물의 유입·보유를 판단할 구조적 근거가 원국과 현재 흐름 어디에서도 확인되지 않습니다.'],
    ['MONEY-01:inflow', 'MONEY-02:retention', 'MONEY-03:yongshin_relevance'], MYUNGRI_CONSULTATION_JUDGE_V1_METHOD);
}

// ══ CAREER (§9) ═════════════════════════════════════════════════════════════════════════════════
function judgeCareer(input: MyungriConsultationJudgeInput): DomainJudgeResult {
  const { baseline, layers, yongshin, dayMasterElement } = input;
  const rules: DomainRule[] = [];
  const syn: SyntheticInference[] = [];

  const officerExists = hasFamily(baseline, 'OFFICER');
  if (officerExists) {
    rules.push({
      kind: 'OPPORTUNITY', reasoning: '원국에 조직·자리를 받쳐 주는 구조가 있어, 소속 안에서 자리를 잡기 유리합니다.',
      evidence: [ev('원국 관성 존재', '조직·직위를 받쳐 주는 자리가 있습니다.', 'CAREER', 'NATAL')],
      structuralDriver: 'NATAL_FAMILY:OFFICER',
    });
  }

  const careerPressures = layers.map((l) => axisPressure(l, 'CAREER'));
  const careerFriction = careerPressures.some((p) => p.touched && p.frictionKinds.length > 0);
  const careerHeavy = careerPressures.some((p) => p.heavyHit);
  const careerHarmony = careerPressures.some((p) => p.touched && p.harmonyKinds.length > 0);
  if (careerFriction) {
    rules.push({
      kind: 'RISK',
      reasoning: careerHeavy
        ? '지금 흐름이 직업·자리 자리를 정면으로 흔들어, 이직/변동 압력이 실제로 있습니다.'
        : '지금 흐름이 직업·자리 자리에 마찰을 일으켜, 자잘한 변동 압력이 있습니다.',
      evidence: careerPressures.flatMap((p) => p.counterEvidence),
      structuralDriver: `SEAT_CONTACT:MONTH(${careerHeavy ? 'heavy' : 'light'})`,
      temporalNote: 'career-axis friction from an active luck layer',
    });
  }
  if (careerHarmony) {
    rules.push({
      kind: 'OPPORTUNITY', reasoning: '지금 흐름이 직업·자리 자리와 맞물려 풀려, 안정적으로 자리를 지킬 수 있는 흐름입니다.',
      evidence: careerPressures.flatMap((p) => p.evidence),
      temporalNote: 'career-axis harmony from an active luck layer',
    });
  }
  if (officerExists && (careerFriction || careerHarmony)) {
    syn.push({
      premises: [`원국 관성 존재=${officerExists}`, `현재 흐름의 직업 자리 접촉=${careerFriction ? '마찰' : '조화'}`],
      conclusion: careerFriction
        ? '조직 내 자리는 갖춰져 있으나 지금 흐름이 그 자리를 흔들어, 변동 압력 속에서도 자리 자체는 남아 있는 구조입니다.'
        : '조직 내 자리가 갖춰진 상태에서 지금 흐름도 그 자리와 맞물려, 안정적으로 자리를 지킬 수 있는 시기입니다.',
    });
  }

  const outputExists = hasFamily(baseline, 'OUTPUT');
  if (!officerExists && outputExists) {
    rules.push({
      kind: 'OPPORTUNITY', reasoning: '조직보다 활동·표현 쪽 구조가 뚜렷해, 독립적인 실행이 더 맞는 구조일 수 있습니다.',
      evidence: [ev('원국 관성 없음, 식상 존재', '조직에 매이기보다 스스로 만들어 가는 쪽이 구조에 맞습니다.', 'CAREER', 'NATAL')],
      structuralDriver: 'NATAL_FAMILY:OFFICER_ABSENT+OUTPUT_PRESENT',
    });
    if (syn.length === 0) {
      syn.push({
        premises: ['원국 관성 없음', '원국 식상 존재'], conclusion: '조직 소속보다 독립적 활동 쪽이 구조적으로 더 자연스럽습니다.',
      });
    }
  }

  // §3 — Yongshin only reinforces a signal already established above; see BUSINESS's identical guard.
  if (rules.length > 0) {
    const support = yongshinSupportsFamily(yongshin, dayMasterElement, 'OFFICER');
    if (support) {
      rules.push({
        kind: 'OPPORTUNITY', reasoning: '억부용신 방향이 조직·자리 계열과 맞아, 지금 자리를 지키거나 승진 방향을 구조적으로 뒷받침합니다.',
        evidence: [], disciplineNote: `yongshin candidate ${support} supports OFFICER`,
      });
    }
  }

  return finalize('CAREER', rules, syn,
    ['직업의 안정·변동을 판단할 구조적 근거가 원국과 현재 흐름 어디에서도 확인되지 않습니다.'],
    ['CAREER-01:officer_presence', 'CAREER-02:month_seat_pressure', 'CAREER-03:independent_leaning', 'CAREER-04:yongshin_relevance'], MYUNGRI_CONSULTATION_JUDGE_V1_METHOD);
}

// ══ LOVE (§10) ══════════════════════════════════════════════════════════════════════════════════
function judgeLove(input: MyungriConsultationJudgeInput): DomainJudgeResult {
  const { baseline, layers } = input;
  const rules: DomainRule[] = [];
  const syn: SyntheticInference[] = [];

  const daySeatPressures = layers.map((l) => axisPressure(l, 'RELATION_STABILITY'));
  const daySeatFriction = daySeatPressures.some((p) => p.touched && p.frictionKinds.length > 0);
  const daySeatHarmony = daySeatPressures.some((p) => p.touched && p.harmonyKinds.length > 0);

  if (baseline?.spouseSeatStrained) {
    rules.push({
      kind: 'RISK', reasoning: '타고난 배우자 자리 자체가 흔들리는 구조라, 관계는 유지보다 조율에 힘이 듭니다.',
      evidence: [ev('원국 일지(배우자 자리) 충·형·파·해', '타고난 배우자 자리 자체가 흔들리는 구조입니다.', 'RELATION_STABILITY', 'NATAL')],
      structuralDriver: 'NATAL_SEAT_STRAIN:DAY',
    });
  }
  if (daySeatFriction) {
    rules.push({
      kind: 'RISK', reasoning: '지금 흐름이 배우자 자리를 직접 흔들어, 지금은 관계에 마찰이 생기기 쉬운 시기입니다.',
      evidence: daySeatPressures.flatMap((p) => p.counterEvidence), temporalNote: 'day-seat friction from an active luck layer',
    });
  }
  if (daySeatHarmony) {
    rules.push({
      kind: 'OPPORTUNITY', reasoning: '지금 흐름이 배우자 자리와 맞물려 풀려, 관계가 자연스럽게 이어지기 좋은 시기입니다.',
      evidence: daySeatPressures.flatMap((p) => p.evidence), temporalNote: 'day-seat harmony from an active luck layer',
    });
  }
  if (baseline && (daySeatFriction || daySeatHarmony)) {
    syn.push({
      premises: [`타고난 배우자 자리 상태=${baseline.spouseSeatStrained ? '이미 흔들림' : '안정'}`, `현재 흐름의 배우자 자리 접촉=${daySeatFriction ? '마찰' : '조화'}`],
      conclusion: baseline.spouseSeatStrained && daySeatFriction
        ? '타고난 자리도 흔들리고 지금 흐름도 그 자리를 흔들어, 지금은 관계를 새로 시작하기보다 기존 관계를 조율하는 데 힘이 필요한 시기입니다.'
        : daySeatHarmony
          ? '배우자 자리가 지금 흐름과 맞물려 풀려, 관계가 자연스럽게 진전될 수 있는 구조입니다.'
          : '타고난 자리는 안정적이나 지금 흐름이 그 자리를 흔들어, 일시적인 조율이 필요한 시기입니다.',
    });
  }

  return finalize('LOVE', rules, syn,
    ['연애·관계를 판단할 구조적 근거(배우자 자리 접촉)가 원국과 현재 흐름 어디에서도 확인되지 않습니다.'],
    ['LOVE-01:spouse_seat_strain', 'LOVE-02:day_seat_temporal_contact'], MYUNGRI_CONSULTATION_JUDGE_V1_METHOD);
}

// ══ REUNION (§11, §18) — separate from LOVE, never aliased ═══════════════════════════════════════
function judgeReunion(input: MyungriConsultationJudgeInput): DomainJudgeResult {
  const { baseline, layers } = input;
  const rules: DomainRule[] = [];
  const syn: SyntheticInference[] = [];

  const daySeatPressures = layers.map((l) => axisPressure(l, 'RELATION_STABILITY'));
  // REUNION reads a HARMONY hit on the spouse seat as the "opening/contact" signal specifically — a
  // 합 forming on 일지 is a real, chart-grounded contact/attraction event, not a guess.
  const opening = daySeatPressures.some((p) => p.touched && p.harmonyKinds.length > 0);
  const heavyStrike = daySeatPressures.some((p) => p.heavyHit);

  if (opening) {
    rules.push({
      kind: 'OPPORTUNITY', reasoning: '지금 흐름이 배우자 자리와 맞물려 풀려, 연락·접촉이 다시 열릴 수 있는 구조적 신호가 있습니다.',
      evidence: daySeatPressures.flatMap((p) => p.evidence), temporalNote: 'day-seat harmony (contact signal) from an active luck layer',
    });
  }
  const stabilityConcern = (baseline?.spouseSeatStrained ?? false) || heavyStrike;
  if (stabilityConcern) {
    rules.push({
      kind: 'RISK',
      reasoning: baseline?.spouseSeatStrained
        ? '타고난 배우자 자리 자체가 흔들리는 구조라, 접촉이 되더라도 안정적인 회복까지는 별개로 봐야 합니다.'
        : '지금 흐름이 배우자 자리를 정면으로 흔들어, 접촉이 되더라도 관계가 안정적으로 굳어지기는 어려운 시기입니다.',
      evidence: baseline?.spouseSeatStrained
        ? [ev('원국 일지(배우자 자리) 충·형·파·해', '타고난 배우자 자리 자체가 흔들리는 구조입니다.', 'RELATION_STABILITY', 'NATAL')]
        : daySeatPressures.flatMap((p) => p.counterEvidence),
      structuralDriver: baseline?.spouseSeatStrained ? 'NATAL_SEAT_STRAIN:DAY' : 'SEAT_CONTACT:DAY(heavy)',
    });
  }

  if (opening || stabilityConcern) {
    syn.push({
      premises: [`배우자 자리 접촉(합) 신호=${opening}`, `배우자 자리 안정성 우려=${stabilityConcern}`],
      conclusion: opening && stabilityConcern
        // §18 exact compound-truth pattern the brief asks for.
        ? '재회·재접촉의 가능성은 구조적으로 열려 있지만, 안정적인 회복까지는 별개의 문제입니다.'
        : opening
          ? '재회·재접촉이 구조적으로 열릴 수 있는 시기입니다.'
          : '접촉의 문이 열렸다는 구조적 신호 없이, 배우자 자리의 불안정만 확인됩니다.',
    });
  }

  return finalize('REUNION', rules, syn,
    ['재회 가능성을 판단할 구조적 근거(배우자 자리에 대한 지금 흐름의 접촉)가 확인되지 않습니다.'],
    ['REUNION-01:day_seat_opening', 'REUNION-02:stability_concern'], MYUNGRI_CONSULTATION_JUDGE_V1_METHOD);
}

// ══ CHANGE / MOVEMENT (§12) ════════════════════════════════════════════════════════════════════
function judgeChange(input: MyungriConsultationJudgeInput): DomainJudgeResult {
  const { layers, yongshin, dayMasterElement } = input;
  const rules: DomainRule[] = [];
  const syn: SyntheticInference[] = [];

  // MOVEMENT is not a natal-seat axis (no 궁위 maps to it) — change pressure is read from a genuine
  // heavy structural hit ANYWHERE in an active layer, framed as PRESSURE, never a guaranteed event
  // (§12's own explicit constraint: "a clash may be change pressure, not guaranteed event").
  const heavyHits = layers.flatMap((l) => l.hits.filter((h) => h.heavy));
  if (heavyHits.length > 0) {
    rules.push({
      kind: 'RISK',
      reasoning: '지금 흐름이 원국의 자리를 정면으로 흔드는 구조가 있어, 변화 쪽으로 떠밀릴 수 있는 압력이 있습니다. 다만 이것이 반드시 이동·이직을 뜻하지는 않습니다.',
      evidence: heavyHits.map((h) => h.evidence),
      structuralDriver: `SEAT_CONTACT:${[...new Set(heavyHits.map((h) => h.position))].join('+')}(heavy)`,
      temporalNote: 'heavy structural hit from an active luck layer',
    });
  }

  const harmonyAxesTouched = [...new Set(layers.flatMap((l) => l.harmonyAxes))];
  if (harmonyAxesTouched.length > 0) {
    rules.push({
      kind: 'OPPORTUNITY', reasoning: '지금 흐름이 원국과 맞물려 풀리는 자리가 있어, 변화를 만들어도 구조가 뒷받침해 줄 수 있는 시기입니다.',
      evidence: layers.flatMap((l) => l.hits.filter((h) => !h.friction).map((h) => h.evidence)),
      temporalNote: 'harmony hit from an active luck layer',
    });
  }

  // §3 — Yongshin only reinforces a signal already established above; see BUSINESS's identical guard.
  if (rules.length > 0) {
    const supportsAction = yongshinSupportsFamily(yongshin, dayMasterElement, 'OUTPUT');
    if (supportsAction) {
      rules.push({
        kind: 'OPPORTUNITY', reasoning: '억부용신 방향이 활동·전환 계열과 맞아, 새로운 시도를 시작하기에 구조적으로 유리한 방향입니다.',
        evidence: [], disciplineNote: `yongshin candidate ${supportsAction} supports OUTPUT (action/transition)`,
      });
    }
  }

  if (heavyHits.length > 0 || harmonyAxesTouched.length > 0) {
    syn.push({
      premises: [`정면 구조 타격 존재=${heavyHits.length > 0}`, `조화롭게 풀리는 자리 존재=${harmonyAxesTouched.length > 0}`],
      conclusion: heavyHits.length > 0 && harmonyAxesTouched.length > 0
        ? '변화의 압력과 그것을 뒷받침하는 흐름이 함께 있어, 변화 자체는 구조적으로 지지받을 수 있지만 진행 과정에는 마찰이 따릅니다.'
        : heavyHits.length > 0
          ? '변화 쪽으로 떠밀리는 압력은 있으나, 그것을 뒷받침하는 흐름은 확인되지 않습니다.'
          : '변화를 뒷받침하는 흐름은 있으나, 변화를 강제하는 압력은 확인되지 않습니다.',
    });
  }

  return finalize('CHANGE', rules, syn,
    ['변화·이동 압력을 판단할 구조적 근거가 현재 흐름 어디에서도 확인되지 않습니다.'],
    ['CHANGE-01:heavy_structural_pressure', 'CHANGE-02:harmony_support', 'CHANGE-03:yongshin_relevance'], MYUNGRI_CONSULTATION_JUDGE_V1_METHOD);
}

// ══ TIMING (§13, §14) — supporting judgment, never a fabricated exact date ════════════════════════
function judgeTiming(input: MyungriConsultationJudgeInput): DomainJudgeResult {
  const { layers } = input;
  const rules: DomainRule[] = [];
  const syn: SyntheticInference[] = [];

  if (!anyLayerActive(layers)) {
    return finalize('TIMING', [], [],
      ['현재 시점에 활성화된 대운/세운/월운 흐름 정보가 없어 시기를 판단하지 않습니다.'],
      ['TIMING-01:no_active_layer'], MYUNGRI_CONSULTATION_JUDGE_V1_METHOD);
  }

  for (const layer of layers) {
    if (layer.silent) continue;
    const friction = layer.hits.filter((h) => h.friction);
    const harmony = layer.hits.filter((h) => !h.friction);
    if (harmony.length > 0 && friction.length === 0) {
      rules.push({
        kind: 'OPPORTUNITY', reasoning: `${scopeNote(layer.scope)} 원국과 조화롭게 맞물리는 흐름이라, 움직이기에 뒷받침이 되는 시기입니다.`,
        evidence: harmony.map((h) => h.evidence), temporalNote: `${layer.scope}: harmony, no friction`,
      });
    } else if (friction.length > 0 && harmony.length === 0) {
      rules.push({
        kind: 'RISK', reasoning: `${scopeNote(layer.scope)} 원국을 흔드는 흐름이라, 지금은 신중히 움직여야 하는 시기입니다.`,
        evidence: friction.map((h) => h.evidence), temporalNote: `${layer.scope}: friction, no harmony`,
      });
    } else if (friction.length > 0 && harmony.length > 0) {
      rules.push({
        kind: 'OPPORTUNITY', reasoning: `${scopeNote(layer.scope)} 조화와 마찰이 함께 있는 흐름입니다.`,
        evidence: harmony.map((h) => h.evidence), temporalNote: `${layer.scope}: mixed harmony+friction`,
      });
      rules.push({
        kind: 'RISK', reasoning: `${scopeNote(layer.scope)} 조화만큼의 마찰도 함께 있어, 좋은 흐름 안에서도 걸리는 지점이 있습니다.`,
        evidence: friction.map((h) => h.evidence), temporalNote: `${layer.scope}: mixed harmony+friction`,
      });
    }
  }

  const activeScopes = layers.filter((l) => !l.silent).map((l) => l.scope);
  if (activeScopes.length > 0) {
    syn.push({
      premises: [`활성 시기 층=${activeScopes.join(',')}`, `조화 존재=${rules.some((r) => r.kind === 'OPPORTUNITY')}`, `마찰 존재=${rules.some((r) => r.kind === 'RISK')}`],
      conclusion: '지금 활성화된 흐름이 원국과 실제로 관계를 맺고 있어, 시기 판단이 구조적으로 근거를 가집니다.',
    });
  }

  return finalize('TIMING', rules, syn,
    ['현재 시점에 활성화된 대운/세운/월운 흐름 정보가 없어 시기를 판단하지 않습니다.'],
    ['TIMING-02:per_layer_valence'], MYUNGRI_CONSULTATION_JUDGE_V1_METHOD);
}
const SCOPE_NOTE: Record<LayerAnalysis['scope'], string> = {
  NATAL: '타고난 바탕이', DAEWOON: '지금의 큰 흐름이', SEWOON: '올해 흐름이',
  WOLWOON: '이 시기 흐름이', PRESENT_MOMENT: '지금 시점이', UNSCOPED: '전반 흐름이',
};
const scopeNote = (scope: LayerAnalysis['scope']): string => SCOPE_NOTE[scope];

// ── dispatcher ──────────────────────────────────────────────────────────────────────────────────
const JUDGES: Record<ConsultationJudgeDomain, (input: MyungriConsultationJudgeInput) => DomainJudgeResult> = {
  BUSINESS: judgeBusiness, MONEY: judgeMoney, CAREER: judgeCareer, LOVE: judgeLove,
  REUNION: judgeReunion, CHANGE: judgeChange, TIMING: judgeTiming,
};

/**
 * Compute all 7 consultation-domain judgments from one set of already-computed facts. Pure,
 * deterministic, synchronous — same input always produces the same 7 results (§39). Cheap enough to
 * always compute all 7 (no branch/loop over external state), which is what lets §26/§28's
 * cross-domain-differentiation tests compare multiple domains from ONE chart directly.
 */
export function judgeAllMyungriConsultationDomains(
  input: MyungriConsultationJudgeInput,
): Record<ConsultationJudgeDomain, DomainJudgeResult> {
  const out = {} as Record<ConsultationJudgeDomain, DomainJudgeResult>;
  for (const domain of Object.keys(JUDGES) as ConsultationJudgeDomain[]) {
    out[domain] = JUDGES[domain](input);
  }
  return out;
}

export { routeConsultationJudgeDomain } from './consultationJudgeCore';
