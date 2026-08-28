// MYUNGRI YONGSHIN V1 — deterministic structural-treatment selection, built on top of the frozen
// Myungri Structural V2 judgment graph (myungriStructuralV2.ts). Product implementation, not a
// research artifact — see the header note at the bottom of this file for scope/deferral rationale.
//
// STRENGTH != YONGSHIN. This module NEVER shortcuts:
//   STRONG_LEANING -> WEALTH/OFFICER/OUTPUT
//   WEAK_LEANING   -> RESOURCE/PEER
// Every candidate is derived by inspecting the ACTUAL structural facts (root existence, season role,
// branch-clash elements) that produced the Structural V2 result, never the label alone. See
// `runEokbu`/`runTonggwan`/`runByeongyak` for exactly which facts each rationale consults.
//
// FIVE TREATMENT RATIONALES (not five votes — distinct reasoning, combined by explicit priority,
// never counted):
//   EOKBU (억부)                — structural reinforcement/restraint, branched on the SPECIFIC
//                                  root/season combination, not the strength label
//   JOHOO (조후)                 — DEFERRED. The live pipeline has never asserted an extreme-season
//                                  fact (`NatalStructureInput.strengthInputs.extremeSeason` is always
//                                  `null` in production — see `consultationGrounding.ts`'s own comment:
//                                  "조후는 억부와 다른 학파의 관점이라, 억부 판정을 대신하지 않습니다" /
//                                  "조후는 canonical extreme-season rule 없이 assert하지 않는다"). This
//                                  module does not invent that rule either — deferred, not guessed.
//   TONGGWAN (통관)               — mediation of an ACTUAL branch clash (충) between two elements in a
//                                  genuine control relationship; the mediator is computed mechanically
//                                  from the fixed five-element generation cycle, never looked up by
//                                  static "element X always mediates" table
//   BYEONGYAK (병약)              — problem-first: names the MIXED_STRUCTURE root/season contradiction
//                                  as a real, chart-grounded structural pathology. Deliberately does
//                                  NOT invent a remedy for it (Structural V2 itself has no resolved
//                                  tiebreaker for that contradiction) — contributes honest uncertainty,
//                                  never a fabricated candidate
//   SPECIAL_STRUCTURE_CONSTRAINT — gates the WHOLE result: a chart flagged `CANDIDATE` for a
//                                  following/dominant special structure needs the OPPOSITE Yongshin
//                                  direction from an ordinary chart (support the dominant force, not
//                                  reinforce/restrain the Day Master) — since Structural V2 never
//                                  confirms CANDIDATE beyond a screen (no HIGH_CONFIDENCE state exists),
//                                  asserting an ordinary Yongshin here risks being exactly backwards.
//
// NO NEW FACT PROVIDERS. Every element-relationship computation below (`controls`, `generates`,
// `mediatorBetween`, `familyOf`) reuses the SAME frozen `calculateTenGod` primitive every other real
// ten-god computation in this codebase uses, applied to a representative yang stem per element — the
// identical technique `services/monthCommand.ts` and `services/generalSeasonalPhase.ts` already use
// independently (their own header comments explain why: a small, auditable re-derivation rather than
// a shared table those FROZEN files would have to be edited to expose).
import { calculateTenGod, getBranchElement, type EarthlyBranch, type FiveElement, type HeavenlyStem } from '@/features/interpretation';
import type { TenGod } from '@/features/interpretation/saju/derived/contracts';
import { tenGodFamily, type TenGodFamily } from './myungriJudge';
import type { MyungriStructuralV2Result, StructuralState } from './myungriStructuralV2';
import type { JudgmentEvidence } from './contracts';

export const MYUNGRI_YONGSHIN_V1_METHOD = 'deokbunai.myungri-yongshin.v1' as const;

export type TreatmentRationale = 'EOKBU' | 'JOHOO' | 'TONGGWAN' | 'BYEONGYAK' | 'SPECIAL_STRUCTURE_CONSTRAINT';

export type YongshinCandidate = {
  element: FiveElement;
  rationale: TreatmentRationale;
  reasoning: string;
  evidence: JudgmentEvidence[];
};

export type YongshinStatus = 'SELECTED' | 'MULTI_CANDIDATE' | 'UNRESOLVED' | 'NOT_APPLICABLE_SPECIAL_CONFLICT';

export type MyungriYongshinResult = {
  ruleVersion: typeof MYUNGRI_YONGSHIN_V1_METHOD;
  status: YongshinStatus;
  primaryCandidate: FiveElement | null;
  supportingCandidates: FiveElement[];
  contraindicatedCandidates: FiveElement[];
  treatmentRationalesFired: TreatmentRationale[];
  candidates: YongshinCandidate[];
  evidence: JudgmentEvidence[];
  reasoning: { premises: string[]; conclusion: string }[];
  uncertaintyReasons: string[];
  johooStatus: 'DEFERRED';
};

const ev = (fact: string, meaning: string): JudgmentEvidence => ({
  fact, meaning, domain: 'GENERAL', temporalScope: 'NATAL', directness: 'ADJACENT',
});

// ── element-relationship helpers, all reusing the frozen calculateTenGod primitive ────────────────
const ELEMENT_YANG_STEM: Readonly<Record<FiveElement, HeavenlyStem>> = {
  WOOD: 'JIA', FIRE: 'BING', EARTH: 'WU', METAL: 'GENG', WATER: 'REN',
};
const ALL_ELEMENTS: readonly FiveElement[] = ['WOOD', 'FIRE', 'EARTH', 'METAL', 'WATER'];

/**
 * `candidate`'s ten-god FAMILY relative to `reference` (e.g. familyOf(WOOD, EARTH) === 'WEALTH', wood
 * controls earth). Exported so a downstream domain judge (e.g. the consultation-domain layer) can ask
 * "is this Yongshin candidate element USEFUL/HARMFUL for the axis I'm reasoning about" without
 * reimplementing the same five-element-cycle derivation a second time.
 */
export function familyOf(reference: FiveElement, candidate: FiveElement): TenGodFamily {
  const tg = calculateTenGod(ELEMENT_YANG_STEM[reference], ELEMENT_YANG_STEM[candidate]);
  // calculateTenGod never fails for two valid FiveElement-derived yang stems — both are always
  // registered stems, so this branch cannot be reached with real FiveElement inputs. A safe
  // interpretation-nonsense value is returned rather than throwing, per fail-closed convention.
  return tg.ok ? tenGodFamily(tg.value as TenGod) : 'RESOURCE';
}
/** The unique element that is `family` relative to `reference` (guaranteed exactly one in a 5-element system). */
function elementForFamily(reference: FiveElement, family: TenGodFamily): FiveElement {
  return ALL_ELEMENTS.find((e) => familyOf(reference, e) === family) ?? reference;
}
const controls = (a: FiveElement, b: FiveElement): boolean => familyOf(a, b) === 'WEALTH';
const generates = (a: FiveElement, b: FiveElement): boolean => familyOf(a, b) === 'OUTPUT';
/** M such that a generates M and M generates b — the mechanical 통관 mediator, or null if none exists
 *  between distinct elements (cannot happen for two genuinely DIFFERENT elements in a 5-element cycle,
 *  but guarded rather than assumed). */
function mediatorBetween(a: FiveElement, b: FiveElement): FiveElement | null {
  return ALL_ELEMENTS.find((m) => generates(a, m) && generates(m, b)) ?? null;
}

// ── EOKBU (억부) — branches on the ACTUAL root/season combination, never the strength label alone ──
function runEokbu(
  structuralState: StructuralState,
  dayMasterElement: FiveElement,
  familyExists: (family: TenGodFamily) => boolean,
): { primary: FiveElement; supporting: FiveElement; contraindicated: FiveElement; candidates: YongshinCandidate[] } | null {
  if (structuralState === 'UNANCHORED') {
    // DM lacks root AND season support — needs reinforcement. (A direct seasonal conquest sub-case
    // is not handled here: whenever season OPPOSED co-occurs with UNANCHORED, Structural V2's own
    // SPECIAL-01 screen always classifies it CANDIDATE, and the SPECIAL_STRUCTURE_CONSTRAINT gate
    // above already returns before this function runs — see judgeMyungriYongshin.) 비겁(PEER, same
    // element) is the direct structural reinforcement; 인성(RESOURCE, generates the DM) supports it.
    const primary = elementForFamily(dayMasterElement, 'PEER');
    const supporting = elementForFamily(dayMasterElement, 'RESOURCE');
    const contraindicated = elementForFamily(dayMasterElement, 'OFFICER'); // further conquest of an already-weak DM
    return {
      primary, supporting, contraindicated,
      candidates: [
        {
          element: primary, rationale: 'EOKBU',
          reasoning: '일간이 뿌리도 계절의 도움도 받지 못해, 같은 오행으로 세력을 더하는 쪽이 우선 필요합니다.',
          evidence: [ev(`구조 상태 ${structuralState}`, '일간이 뿌리와 계절 양쪽에서 힘을 받지 못하는 구조입니다.')],
        },
      ],
    };
  }
  if (structuralState === 'ANCHORED') {
    // DM has both root and season support — no deficiency to reinforce. Classical 억부 response to a
    // well-supported DM is an OUTLET, but ONLY for a family the chart actually shows EXISTS (never a
    // count, an existence check — matching AX-09's own fact-only, non-decision-bearing design in
    // Structural V2). Priority OUTPUT > WEALTH > OFFICER: output is the most direct/gentle outlet,
    // wealth is productive expenditure, officer is restraint — each tried only if the previous is
    // structurally absent.
    const priority: TenGodFamily[] = ['OUTPUT', 'WEALTH', 'OFFICER'];
    const chosen = priority.find((f) => familyExists(f));
    if (!chosen) return null; // no outlet family exists anywhere in the chart — genuinely indeterminate
    const primary = elementForFamily(dayMasterElement, chosen);
    const supporting = elementForFamily(dayMasterElement, priority.find((f) => f !== chosen && familyExists(f)) ?? chosen);
    const contraindicated = elementForFamily(dayMasterElement, 'RESOURCE'); // further reinforcing an already-supported DM
    return {
      primary, supporting, contraindicated,
      candidates: [
        {
          element: primary, rationale: 'EOKBU',
          reasoning: `일간이 뿌리와 계절 양쪽에서 힘을 받아 여유가 있어, 실제로 존재하는 ${chosen} 계열 기운을 배출구로 우선 씁니다.`,
          evidence: [ev(`구조 상태 ${structuralState}`, '일간이 뿌리와 계절 양쪽에서 힘을 받는 구조입니다.'), ev(`${chosen} 계열 존재`, '원국에 해당 계열의 십신이 실제로 있습니다.')],
        },
      ],
    };
  }
  return null; // MIXED_STRUCTURE / UNRESOLVED — no directional EOKBU candidate; see BYEONGYAK/UNRESOLVED
}

// ── TONGGWAN (통관) — an ACTUAL branch clash between elements in a genuine control relationship ────
function runTonggwan(
  branchClashes: readonly { branches: readonly [EarthlyBranch, EarthlyBranch] }[],
): YongshinCandidate | null {
  for (const clash of branchClashes) {
    const e1 = getBranchElement(clash.branches[0]);
    const e2 = getBranchElement(clash.branches[1]);
    if (!e1.ok || !e2.ok) continue;
    const [controller, controlled] = controls(e1.value, e2.value)
      ? [e1.value, e2.value]
      : controls(e2.value, e1.value)
        ? [e2.value, e1.value]
        : [null, null];
    if (!controller || !controlled) continue; // a clash whose two elements are not in a control relationship has no 통관 mediator
    const mediator = mediatorBetween(controller, controlled);
    if (!mediator) continue;
    return {
      element: mediator, rationale: 'TONGGWAN',
      reasoning: `원국 안에서 ${controller}가 ${controlled}를 극하는 충(沖)이 실제로 있어, 두 오행을 통관시키는 ${mediator}가 후보로 성립합니다.`,
      evidence: [ev(`지지충: ${clash.branches.join('-')}`, `${controller}와 ${controlled}가 정면으로 부딪히는 자리입니다.`)],
    };
  }
  return null;
}

// ── BYEONGYAK (병약) — problem-first, remedy deliberately left indeterminate when unresolvable ─────
function runByeongyak(structuralState: StructuralState): { problem: string } | null {
  if (structuralState !== 'MIXED_STRUCTURE') return null;
  return { problem: '일간의 뿌리와 계절이 서로 다른 방향을 가리켜, 구조적으로 상충하는 지점이 있습니다.' };
}

/**
 * Judge Yongshin V1 from an ALREADY-COMPUTED Structural V2 result plus the same natal-relation and
 * ten-god-family facts the live pipeline already carries. Pure, deterministic, synchronous.
 */
export function judgeMyungriYongshin(input: {
  structuralV2: MyungriStructuralV2Result;
  branchClashes: readonly { branches: readonly [EarthlyBranch, EarthlyBranch] }[];
  /** Whether at least one visible-or-hidden ten-god of the given family exists ANYWHERE in the natal
   *  chart — existence only, never a count (matches AX-09's own fact-only design). */
  familyExists: (family: TenGodFamily) => boolean;
}): MyungriYongshinResult {
  const base = {
    ruleVersion: MYUNGRI_YONGSHIN_V1_METHOD,
    johooStatus: 'DEFERRED' as const,
  };

  if (input.structuralV2.capability !== 'AVAILABLE') {
    return {
      ...base, status: 'UNRESOLVED', primaryCandidate: null, supportingCandidates: [], contraindicatedCandidates: [],
      treatmentRationalesFired: [], candidates: [], evidence: [],
      reasoning: [{ premises: ['Structural V2 = INSUFFICIENT'], conclusion: '구조 판정이 보류되어 용신을 세우지 않습니다.' }],
      uncertaintyReasons: [input.structuralV2.reason],
    };
  }

  const sv2 = input.structuralV2;

  // ── SPECIAL_STRUCTURE_CONSTRAINT — gates the whole result (§14) ──────────────────────────────
  if (sv2.specialStructureStatus.status === 'CANDIDATE') {
    return {
      ...base, status: 'NOT_APPLICABLE_SPECIAL_CONFLICT', primaryCandidate: null, supportingCandidates: [], contraindicatedCandidates: [],
      treatmentRationalesFired: ['SPECIAL_STRUCTURE_CONSTRAINT'],
      candidates: [{
        element: sv2.dayMasterElement, rationale: 'SPECIAL_STRUCTURE_CONSTRAINT',
        reasoning: '이 배치는 특수구조(종격 등) 후보 조건을 보입니다. 특수구조가 실제라면 일반 억부 용신과 정반대 방향이 필요할 수 있어, 특수구조 확정 없이는 일반 용신을 세우지 않습니다.',
        evidence: sv2.specialStructureStatus.evidence,
      }],
      evidence: sv2.specialStructureStatus.evidence,
      reasoning: [{
        premises: [`specialStructureStatus=CANDIDATE`],
        conclusion: '특수구조 후보와 일반 억부는 서로 반대 방향을 요구할 수 있어, 확정 전에는 일반 용신을 세우지 않습니다.',
      }],
      uncertaintyReasons: ['특수구조 후보 상태 — 확정되지 않음(HIGH_CONFIDENCE 상태가 Structural V2에 존재하지 않음)'],
    };
  }

  const eokbu = runEokbu(sv2.structuralState, sv2.dayMasterElement, input.familyExists);
  const tonggwan = runTonggwan(input.branchClashes);
  const byeongyak = runByeongyak(sv2.structuralState);

  const rationalesFired: TreatmentRationale[] = [];
  if (byeongyak) rationalesFired.push('BYEONGYAK');
  if (eokbu) rationalesFired.push('EOKBU');
  if (tonggwan) rationalesFired.push('TONGGWAN');

  const uncertaintyReasons: string[] = [];
  if (byeongyak) uncertaintyReasons.push(`병약: ${byeongyak.problem} (구체적 처방은 현재 근거로 판단하지 않습니다.)`);

  if (!eokbu && !tonggwan) {
    return {
      ...base, status: 'UNRESOLVED', primaryCandidate: null, supportingCandidates: [], contraindicatedCandidates: [],
      treatmentRationalesFired: rationalesFired, candidates: [],
      evidence: [], reasoning: [{ premises: [`structuralState=${sv2.structuralState}`], conclusion: '억부·통관 어느 쪽도 실행 가능한 후보를 내지 못해 용신을 세우지 않습니다.' }],
      uncertaintyReasons: [...uncertaintyReasons, '억부·통관 근거 모두 부족합니다.'],
    };
  }

  // ── priority when BOTH fire: does 통관's mediator worsen the 억부 need? ──────────────────────
  if (eokbu && tonggwan) {
    const tongFamily = familyOf(sv2.dayMasterElement, tonggwan.element);
    const eokbuNeedsSupport = sv2.structuralState === 'UNANCHORED';
    const worsens = eokbuNeedsSupport
      ? tongFamily === 'OUTPUT' || tongFamily === 'WEALTH' || tongFamily === 'OFFICER'
      : tongFamily === 'RESOURCE' || tongFamily === 'PEER';
    if (worsens) {
      return {
        ...base, status: 'MULTI_CANDIDATE', primaryCandidate: null,
        supportingCandidates: [], contraindicatedCandidates: [eokbu.contraindicated],
        treatmentRationalesFired: rationalesFired,
        candidates: [...eokbu.candidates, tonggwan],
        evidence: [...eokbu.candidates.flatMap((c) => c.evidence), ...tonggwan.evidence],
        reasoning: [{
          premises: [`EOKBU->${eokbu.primary}`, `TONGGWAN->${tonggwan.element}(${tongFamily})`],
          conclusion: '억부가 필요로 하는 방향과 통관 후보가 서로 상충해, 우선순위를 하나로 정할 근거가 없습니다.',
        }],
        uncertaintyReasons: [...uncertaintyReasons, '억부와 통관 후보가 서로 상충합니다.'],
      };
    }
    // 통관(즉각적 구조 장애 해소)이 억부(일반 보강)보다 우선 — 서로 상충하지 않을 때만.
    return {
      ...base, status: 'SELECTED', primaryCandidate: tonggwan.element,
      supportingCandidates: [eokbu.primary, eokbu.supporting].filter((e) => e !== tonggwan.element),
      contraindicatedCandidates: [eokbu.contraindicated],
      treatmentRationalesFired: rationalesFired,
      candidates: [tonggwan, ...eokbu.candidates],
      evidence: [...tonggwan.evidence, ...eokbu.candidates.flatMap((c) => c.evidence)],
      reasoning: [{
        premises: [`TONGGWAN->${tonggwan.element}`, `EOKBU->${eokbu.primary} (상충 없음)`],
        conclusion: '실제 충(沖)으로 인한 구조적 장애를 먼저 통관으로 풀고, 억부 보강을 함께 씁니다.',
      }],
      uncertaintyReasons,
    };
  }

  if (eokbu) {
    return {
      ...base, status: 'SELECTED', primaryCandidate: eokbu.primary,
      supportingCandidates: [eokbu.supporting].filter((e) => e !== eokbu.primary),
      contraindicatedCandidates: [eokbu.contraindicated],
      treatmentRationalesFired: rationalesFired, candidates: eokbu.candidates,
      evidence: eokbu.candidates.flatMap((c) => c.evidence),
      reasoning: [{ premises: [`structuralState=${sv2.structuralState}`], conclusion: `${eokbu.primary}를 일차 치료 방향으로 선택합니다.` }],
      uncertaintyReasons,
    };
  }

  // tonggwan only
  return {
    ...base, status: 'SELECTED', primaryCandidate: tonggwan!.element,
    supportingCandidates: [], contraindicatedCandidates: [],
    treatmentRationalesFired: rationalesFired, candidates: [tonggwan!],
    evidence: tonggwan!.evidence,
    reasoning: [{ premises: [`TONGGWAN->${tonggwan!.element}`], conclusion: '실제 충으로 인한 구조적 장애를 통관으로 풉니다.' }],
    uncertaintyReasons,
  };
}

// ── HANDOFF NOTE (not code) ─────────────────────────────────────────────────────────────────────
// Deferred this batch, per explicit instruction rather than by omission:
//   JOHOO (조후) — no canonical extreme-season rule exists anywhere in this repository (confirmed by
//     reading consultationGrounding.ts's own `extremeSeason: null` comment); inventing one here would
//     be exactly the kind of doctrine invention this whole program has repeatedly rejected elsewhere.
//   Temporal use of Yongshin (favorable/adverse luck years) — explicitly out of scope for V1 (§21);
//     belongs to a future domain/temporal judge, not this structural-treatment selector.
//   Heesin/Gisin as a separate labelled taxonomy — supportingCandidates/contraindicatedCandidates
//     already cover the V1 product need (§22); no separate expansion attempted.
