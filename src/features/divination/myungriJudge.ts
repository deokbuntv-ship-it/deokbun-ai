// DIVINATION_ENGINE_V1 — MYUNGRI (명리) INDEPENDENT JUDGE. REBUILT for depth (audit: MYUNGRI_DEPTH = LOW).
//
// WHAT THE AUDIT FOUND, AND WHAT CHANGED:
//   · natal chart entirely discarded (production even passed `natalRelations: null`) → now the natal baseline
//     (십신 by position, 원국 관계, 월령, 통근/투간) is the reference plane every luck layer is judged against.
//   · relations flattened to two counts → now each relation keeps its KIND and the natal POSITION it struck,
//     and position determines WHICH life axis is disturbed (년=뿌리, 월=사회·직업, 일=배우자·자기, 시=결과).
//   · one broad domain per discipline → now multiple real sub-axes are emitted, which is what lets the cross
//     judge decompose on the REAL path instead of only in fixtures.
//   · a layer with ZERO relations counted as positive (STEADY) → now silence is silence: no directional vote.
//
// STILL NO DEFERRED THEORY: no 신강/신약, 용신, 희신, 기신, 격국, 종격, no element weighting. Reading how many
// positions carry 재성, or which pillar a 충 lands on, is reading the engine's own output — not a strength verdict.
import type { RelationsToNatal } from '@/features/myungri/domain/contracts';
import type { TenGod } from '@/features/interpretation/saju/derived/contracts';

import type { JudgmentDomain, QuestionIntent, TemporalScope } from './contracts';
import type { NatalStructureInput } from './myungriNatal';
import type { FiveElement } from '@/features/interpretation';
import type { SemanticTarget } from './reasoning/targets';

// ── 십신 semantics (canonical identities, mirrored from the shipped monthly/today mapping) ────────────
export type TenGodFamily = 'WEALTH' | 'OFFICER' | 'OUTPUT' | 'PEER' | 'RESOURCE';

export function tenGodFamily(tg: TenGod): TenGodFamily {
  switch (tg) {
    case 'DIRECT_WEALTH':
    case 'INDIRECT_WEALTH':
      return 'WEALTH';
    case 'DIRECT_OFFICER':
    case 'SEVEN_KILLINGS':
      return 'OFFICER';
    case 'EATING_GOD':
    case 'HURTING_OFFICER':
      return 'OUTPUT';
    case 'PEER':
    case 'ROB_WEALTH':
      return 'PEER';
    default:
      return 'RESOURCE';
  }
}

export function tenGodJudgmentDomain(tg: TenGod): JudgmentDomain {
  switch (tenGodFamily(tg)) {
    case 'WEALTH': return 'MONEY_INFLOW';
    case 'OFFICER': return 'CAREER';
    case 'OUTPUT': return 'OPPORTUNITY';
    case 'PEER': return 'INFLUENCE';
    case 'RESOURCE': return 'GENERAL';
  }
}

/** 십신 계열의 소비자용 한국어. 이 모듈이 `TenGodFamily` 의 정의처이므로 라벨도 여기 둔다. */
export const FAMILY_LABEL: Record<TenGodFamily, string> = {
  WEALTH: '재물의 기운', OFFICER: '자리·책임의 기운', OUTPUT: '활동·표현의 기운',
  PEER: '경쟁·동료의 기운', RESOURCE: '지원·배움의 기운',
};
const SCOPE_LABEL: Record<TemporalScope, string> = {
  NATAL: '타고난 바탕', DAEWOON: '지금의 큰 흐름', SEWOON: '올해 흐름',
  WOLWOON: '이 시기 흐름', PRESENT_MOMENT: '지금 시점', UNSCOPED: '전반 흐름',
};

export type TemporalLayerFacts = {
  stemTenGod: TenGod;
  branchTenGod: TenGod;
  relationsToNatal: RelationsToNatal;
  targetYear?: number | null;
  /** CONSTITUTION V2 §14 — the element this layer brings, so 용신 can materially change its reading. */
  stemElement?: FiveElement | null;
};

export type MyungriJudgeInput = {
  question: string;
  questionDomain: JudgmentDomain;
  hourKnown: boolean;
  /** REBUILD: the full natal structure. Previously null in production — the audit's headline finding. */
  natal: NatalStructureInput | null;
  activeDaewoon: TemporalLayerFacts | null;
  sewoon: TemporalLayerFacts | null;
  wolwoon: TemporalLayerFacts | null;
  asksTiming: boolean;
  /** V4A §12 — what SHAPE of answer the question wants. Absent → OUTCOME (legacy behaviour). */
  questionIntent?: QuestionIntent;
  /** Whose chart this is, for premise attribution. */
  subject?: string;
  /**
   * The literal matter the question named (`resolveAskedTarget`, `../chat/services/consultationGrounding.ts`)
   * — the SAME value already computed there for `judgeCross`, passed through rather than re-derived, so
   * `myungriReasoner.ts` can route to the matching Myungri Consultation Judge V1 domain (§22 of that
   * brief: "if current pipeline already has question classification/intents, reuse it"). Absent/null →
   * routing falls back to `questionDomain` alone.
   */
  askedTarget?: SemanticTarget | null;
};
/**
 * REMOVED IN V4B — the legacy `judgeMyungri` / `judgeAxis` / `axesFor` judge.
 *
 * It had been DEAD since V4A wired production to `reasonMyungri`: nothing called it, and it survived only
 * as a re-export. Deleting it is not tidying — it carried, in live-looking code, two of the exact patterns
 * the V4B audit asked to be eliminated:
 *   · a GLOBAL capacity inference (`canHold = anchored === ROOTED || inCommand`) applied to whatever axis
 *     happened to be under pressure — a 강약 judgment in all but name, while 강약 is deliberately WITHHELD;
 *   · `familyPresence[fam] >= 2 → support: STRONG`, a count bucket creating astrology significance.
 * Dead code with those shapes is one import away from being live again, so it is gone rather than fenced.
 *
 * What remains in this file is the shared 십신 vocabulary (`tenGodFamily`, `tenGodJudgmentDomain`) and the
 * input contracts, all of which the V4B reasoner and the premise builder genuinely use.
 */
