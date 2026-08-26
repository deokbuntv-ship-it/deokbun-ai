// V4A §14 — MYUNGRI PREMISE CONSTRUCTION. Runs BEFORE any stance exists.
//
// Every premise below is an interpretation of a fact the frozen engine already computed, licensed by doctrine
// this repository has ALREADY adopted (§26 freezes new doctrine for this sprint):
//   · 궁위: 년=뿌리·집안 / 월=사회·직업 / 일=배우자·자기 / 시=말년·결과   (myungriLayer POSITION_AXIS)
//   · 십신 family → 삶의 축                                              (tenGodJudgmentDomain)
//   · 충·형 = 자리를 흔드는 구조적 타격, 파·해 = 가벼운 마찰, 합 = 맞물림  (myungriLayer KIND sets)
//   · 통근(同干) / 득령                                                   (frozen rooting + month-command)
//   · 겁재(ROB_WEALTH) = 같은 몫을 두고 겨루는 십신                        (canonical 십신 identity)
//
// WHAT IS DELIBERATELY *NOT* DONE HERE. The V3 judge wrote conjunctions inline —
// `if (robbingLayer && chartHasWealth) leakage.push(...)` — which is a static rule masquerading as reasoning:
// the two facts never exist separately, so nothing can test whether either one mattered. Here they become TWO
// premises, and a named derivation rule combines them. That is what makes the resulting conclusion inspectable
// and what makes the metamorphic test (remove one premise, watch the conclusion change) possible at all.
import type {
  DataReliability, JudgmentDomain, QuestionIntent,
} from '../contracts';
import { domainFamily, type NatalBaseline } from '../myungriNatal';
import type { LayerAnalysis } from '../myungriLayer';
import { tenGodJudgmentDomain, type TenGodFamily } from '../myungriJudge';
import {
  natalSeatPairTarget, natalSeatTarget, nextId, target, type DivinationPremise,
} from './kernel';

const FAMILY_LABEL: Record<TenGodFamily, string> = {
  WEALTH: '재물', OFFICER: '자리·책임', OUTPUT: '활동·표현', PEER: '경쟁·동료', RESOURCE: '지원·배움',
};
const SCOPE_LABEL = {
  NATAL: '타고난 바탕', DAEWOON: '지금의 큰 흐름', SEWOON: '올해 흐름',
  WOLWOON: '이 시기 흐름', PRESENT_MOMENT: '지금 시점', UNSCOPED: '전반 흐름',
} as const;

/** Which axis a 십신 family natively answers. Reused, not redefined. */
const FAMILY_AXIS: Record<TenGodFamily, JudgmentDomain> = {
  WEALTH: 'MONEY_INFLOW', OFFICER: 'CAREER', OUTPUT: 'OPPORTUNITY',
  PEER: 'INFLUENCE', RESOURCE: 'GENERAL',
};

export type MyungriPremiseInput = {
  subject: string;
  questionIntent: QuestionIntent;
  askedAxis: JudgmentDomain;
  baseline: NatalBaseline | null;
  layers: LayerAnalysis[];
  reliability: DataReliability;
  /** True when the chart HAS the inputs a 강약 judgment would need — used to surface the doctrine blocker. */
  strengthInputsPresent?: boolean;
};

export function buildMyungriPremises(input: MyungriPremiseInput): DivinationPremise[] {
  const { subject, questionIntent, askedAxis, baseline, layers, reliability } = input;
  const out: DivinationPremise[] = [];

  const base = (over: Partial<DivinationPremise> & Pick<DivinationPremise,
    'target' | 'questionAxis' | 'temporalScope' | 'semanticRelation' | 'concept' | 'assertion' | 'role' | 'doctrineReference'>,
  ): DivinationPremise => ({
    id: nextId('mp'),
    discipline: 'MYUNGRI',
    sourceFactIds: [],
    subject,
    questionIntent,
    reliability,
    applicability: over.questionAxis === askedAxis ? 'DIRECT' : 'CONTEXTUAL',
    ...over,
  });

  // ── NATAL: which axes this chart is natively built around, and which it is not ─────────────────
  if (baseline) {
    for (const fam of Object.keys(baseline.familyPresence) as TenGodFamily[]) {
      const count = baseline.familyPresence[fam];
      const axis = FAMILY_AXIS[fam];
      if (count > 0) {
        out.push(base({
          sourceFactIds: [`원국 ${FAMILY_LABEL[fam]} ${count}자리`],
          target: target('TEN_GOD_FAMILY', fam, `원국 ${FAMILY_LABEL[fam]}`),
          questionAxis: axis,
          temporalScope: 'NATAL',
          // V4B §10 — the count NO LONGER changes the semantic relation. `count >= 2 ? 'ENABLES' : 'SUPPORTS'`
          // silently made "two seats" mean "can carry this axis" and "one seat" mean merely "present", which is
          // an astrology claim with no adopted doctrine behind the boundary. The count survives as FACTUAL
          // metadata in the source fact and in the wording; it no longer creates significance by itself.
          semanticRelation: 'SUPPORTS',
          concept: 'NATAL_FAMILY',
          assertion: `${FAMILY_LABEL[fam]} 쪽 자리가 원국에 ${count}곳 있다.`,
          role: 'DESCRIBES',
          doctrineReference: '십신 배치 → 축 (frozen 십신 분포)',
        }));
      } else {
        // Absence is a FACT, and it is the premise that lets "기회는 와도 받을 그릇이 없다" be derived later.
        out.push(base({
          sourceFactIds: [`원국 ${FAMILY_LABEL[fam]} 없음`],
          target: target('TEN_GOD_FAMILY', fam, `원국 ${FAMILY_LABEL[fam]}`),
          questionAxis: axis,
          temporalScope: 'NATAL',
          semanticRelation: 'ABSENT',
          concept: 'NATAL_FAMILY',
          assertion: `${FAMILY_LABEL[fam]} 쪽을 받쳐 줄 자리가 원국에 없다.`,
          role: 'QUALIFIES',
          doctrineReference: '십신 배치 → 축 (frozen 십신 분포)',
        }));
      }
    }

    if (baseline.inCommand !== null) {
      out.push(base({
        sourceFactIds: [baseline.inCommand ? '원국 득령' : '원국 실령'],
        target: target('DAY_MASTER_FOOTING', 'SEASON', '일간의 계절 기반'),
        concept: 'SEASONAL_FOOTING',
        questionAxis: 'GENERAL',
        temporalScope: 'NATAL',
        semanticRelation: baseline.inCommand ? 'ENABLES' : 'CONSTRAINS',
        assertion: baseline.inCommand
          ? '계절의 기운을 등에 업고 있어, 흐름이 올 때 밀고 나갈 힘이 있다.'
          : '계절의 기운을 얻지 못해, 좋은 흐름이 와도 혼자 밀어붙이면 힘에 부친다.',
        role: 'QUALIFIES',
        applicability: 'CONTEXTUAL',
        doctrineReference: '월령 득령/실령 (frozen month-command)',
      }));
    }

    if (baseline.anchored !== 'UNKNOWN') {
      out.push(base({
        sourceFactIds: [`원국 통근 ${baseline.anchored}`],
        target: target('DAY_MASTER_FOOTING', 'ROOT', '일간의 뿌리'),
        concept: 'ROOTING',
        questionAxis: 'GENERAL',
        temporalScope: 'NATAL',
        semanticRelation: baseline.anchored === 'FLOATING' ? 'WEAKENS' : 'STABILIZES',
        assertion: baseline.anchored === 'ROOTED'
          ? '뿌리가 실리는 자리(월지·일지)에 박혀 있어, 흔들려도 되돌아오는 바탕이 있다.'
          : baseline.anchored === 'PARTLY_ROOTED'
            ? '뿌리가 일부만 있어, 받쳐 주는 자리에서만 오래 간다.'
            : '뿌리가 없어 벌인 일이 오래 남기 어렵다.',
        role: 'QUALIFIES',
        applicability: 'CONTEXTUAL',
        doctrineReference: '통근(同干) (frozen rooting)',
      }));
    }

    if (baseline.spouseSeatStrained) {
      out.push(base({
        sourceFactIds: ['원국 일지 충·형·파·해'],
        target: target('NATAL_SEAT', 'DAY', '원국 일지(배우자·자기 자리)'),
        concept: 'NATAL_SEAT_STRAIN',
        questionAxis: 'RELATION_STABILITY',
        temporalScope: 'NATAL',
        semanticRelation: 'DESTABILIZES',
        assertion: '타고난 배우자 자리 자체가 흔들리는 구조다.',
        role: 'ASSERTS',
        doctrineReference: '궁위: 일지=배우자·자기 자리',
      }));
    }

    for (const friction of baseline.natalFrictions) {
      const seatPair = natalSeatPairTarget(friction.positions[0], friction.positions[1] ?? friction.positions[0]);
      out.push(base({
        sourceFactIds: [`원국 ${friction.label}`],
        target: seatPair,
        questionAxis: 'GENERAL',
        temporalScope: 'NATAL',
        semanticRelation: 'DESTABILIZES',
        concept: 'NATAL_SEAT_STRAIN',
        assertion: `${seatPair.label} 사이가 원국에서 이미 부딪히는 구조다.`,
        role: 'QUALIFIES',
        applicability: 'BACKGROUND',
        doctrineReference: '원국 합충형파해 (frozen natal relations)',
      }));
    }
  }

  // ── TEMPORAL LAYERS: what is moving now, and exactly which natal seat it lands on ───────────────
  for (const layer of layers) {
    const where = SCOPE_LABEL[layer.scope];

    // The layer's own 십신 says WHICH axis is being activated at this time level.
    out.push(base({
      sourceFactIds: [`${where} ${FAMILY_LABEL[layer.family]}`],
      target: target('TEN_GOD_FAMILY', layer.family, `${where}의 ${FAMILY_LABEL[layer.family]}`),
      concept: 'LAYER_ACTIVATION',
      questionAxis: FAMILY_AXIS[layer.family],
      temporalScope: layer.scope,
      semanticRelation: 'ACTIVATES',
      assertion: `${where}에 ${FAMILY_LABEL[layer.family]} 쪽 기운이 들어와 이 축이 실제로 움직인다.`,
      role: 'ASSERTS',
      doctrineReference: '십신 배치 → 축 (frozen 십신 분포)',
    }));

    // 겁재 is emitted on its OWN terms — a competitor for the same share. Whether that MATTERS depends on
    // whether there is a share to contest, which is a different premise and therefore a real derivation.
    if (layer.robWealth) {
      out.push(base({
        sourceFactIds: [`${where} 겁재`],
        target: target('LUCK_LAYER', `${layer.scope}:RIVAL`, `${where}의 겁재`),
        concept: 'RIVAL_CLAIM',
        questionAxis: 'INFLUENCE',
        temporalScope: layer.scope,
        semanticRelation: 'OPPOSES',
        assertion: `${where}에 같은 몫을 두고 겨루는 기운이 들어온다.`,
        role: 'ASSERTS',
        doctrineReference: '겁재(ROB_WEALTH) = 같은 몫을 두고 겨루는 십신',
      }));
    }

    // Each relation the layer forms with the natal chart, keeping KIND and the exact seat it struck.
    for (const hit of layer.hits) {
      // V4D §33 — the seat's TARGET LABEL comes from the seat; the RELATION KIND stays in the assertion,
      // where it belongs. V4C keyed `NATAL_SEAT:DAY` with a label split off `hit.evidence.fact`, so two hits
      // on 일주 produced one key with two labels ("원국 일주 천간충" / "원국 일주 지지형") — and the label is
      // interpolated into assertion text, which `screenSynthesis` and the certification harness COMPARE.
      const struck = hit.evidence.fact.split('→ ')[1] ?? hit.kind;
      out.push(base({
        sourceFactIds: [hit.evidence.fact],
        target: natalSeatTarget(hit.position),
        concept: 'SEAT_CONTACT',
        questionAxis: hit.axis,
        temporalScope: layer.scope,
        semanticRelation: hit.friction ? (hit.heavy ? 'DESTABILIZES' : 'CONSTRAINS') : 'CONNECTS',
        assertion: hit.friction
          ? hit.heavy
            ? `${where}이 ${struck}를 정면으로 흔든다.`
            : `${where}이 ${struck}에 마찰을 일으킨다.`
          : `${where}이 ${struck}와 맞물려 풀린다.`,
        role: 'ASSERTS',
        doctrineReference: '궁위 + 합충형파해 (frozen relations to natal)',
      }));
    }

    // Silence is a fact too, and it must never be read as a quiet yes.
    if (layer.silent) {
      out.push(base({
        sourceFactIds: [`${where} 원국과 무관계`],
        target: target('LUCK_LAYER', layer.scope, where),
        concept: 'LAYER_SILENT',
        questionAxis: 'GENERAL',
        temporalScope: layer.scope,
        semanticRelation: 'ABSENT',
        assertion: `${where}은 원국의 어느 자리와도 관계를 맺지 않는다.`,
        role: 'DESCRIBES',
        applicability: 'BACKGROUND',
        doctrineReference: '관계 부재 (frozen relations to natal)',
      }));
    }
  }

  // ── WITHHELD DOCTRINE (§2) — the gap must stay VISIBLE, not merely absent ──────────────────────
  // 강약 등급과 억부용신은 채택 학파가 없어 판정하지 않는다. 계산할 입력은 다 있으므로, '못 한다'가 아니라
  // '보류한다'는 사실 자체를 전제로 남긴다 — 그래야 depth 리포트와 QA 팩에서 공백이 보인다.
  if (input.strengthInputsPresent) {
    out.push(base({
      sourceFactIds: ['일간 강약: 판정 보류(채택 학파 없음)'],
      target: target('DOCTRINE_GAP', 'STRENGTH_YONGSHIN', '일간 강약 · 억부용신'),
      concept: 'DOCTRINE_BLOCK',
      questionAxis: 'GENERAL',
      temporalScope: 'NATAL',
      semanticRelation: 'ABSENT',
      assertion: '강약 등급과 억부용신은 채택된 학파가 없어 판정을 보류한다. 구조 요소는 모두 산출되어 있다.',
      role: 'DESCRIBES',
      applicability: 'BACKGROUND',
      doctrineReference: 'BLOCKED: 강약 학파 미채택 → 강약 등급·억부용신 판정 보류',
    }));
  }

  // ── ASKED-AXIS DOCTRINE COVERAGE (§13 honesty, not a conclusion) ────────────────────────────────
  // When the asked axis has no route in adopted Myungri doctrine, that is recorded as a premise so the
  // synthesis can say WHY it cannot answer instead of implying the chart was silent.
  if (domainFamily(askedAxis) === null && !out.some((p) => p.questionAxis === askedAxis)) {
    out.push(base({
      sourceFactIds: [],
      target: target('DOCTRINE_GAP', `AXIS:${askedAxis}`, `질문 축 ${askedAxis}`),
      concept: 'DOCTRINE_BLOCK',
      questionAxis: askedAxis,
      temporalScope: 'UNSCOPED',
      semanticRelation: 'ABSENT',
      assertion: '명리에서 이 축을 직접 보는 경로가 아직 채택되어 있지 않다.',
      role: 'DESCRIBES',
      applicability: 'DIRECT',
      doctrineReference: 'BLOCKED: 해당 축 도메인 매핑 미채택',
    }));
  }

  return out;
}
