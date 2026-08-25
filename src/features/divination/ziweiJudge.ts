// DIVINATION_ENGINE_V1 — ZIWEI (자미두수) INDEPENDENT JUDGE. REBUILT for depth (audit: ZIWEI_DEPTH = LOW,
// "ZIWEI_IS_SINGLE_PALACE_HEURISTIC = YES").
//
// WHAT THE AUDIT FOUND, AND WHAT CHANGED:
//   · one palace → one 四化 → polarity. Now the judge reads the palace TOGETHER WITH its 삼방사정(三方四正):
//     the opposite palace (대궁) and the two triangle palaces, which is how a 궁 is actually read.
//   · 主星 were label-only. Now 주성 presence/absence contributes: an empty palace (무주성/공궁) borrows from
//     its 대궁, so its verdict must lean on the opposite palace rather than on nothing.
//   · E1 (the audit's most damaging finding): "no 四化 → CONDITIONAL_FOR" turned DATA ABSENCE into a positive
//     vote, which is what flipped the C7 business case against a HIGH-confidence direct Myungri negative.
//     Absence now yields NO_SIGNAL and casts NO vote.
//   · 身宮 / 五行局 / 命主 are now read as structural context.
//
// DOCTRINE (C-class, newly adopted, declared explicitly for review — see docs):
//   R1 궁위 → 질문 영역 (재백=재물, 전택=보관, 관록=직업, 부처=배우자, 천이=이동, 질액=몸, 명궁=본인).
//   R2 四化 방향: 록·권·과 = 열림, 기(忌) = 막힘.
//   R3 삼방사정: 한 궁은 대궁(+6)과 삼합궁(+4, +8)의 영향을 함께 받는다.
//   R4 무주성(공궁)이면 대궁의 주성을 빌려 본다(차성안궁).
// NOT AVAILABLE AT RUNTIME → never claimed: 유년/流年 (annual) is not computed, so no year-level claim; star
// brightness is emitted as numeric codes under ko-KR, so it is deliberately unused rather than guessed.
import type { ZiweiChart, ZiweiPalace } from '@/features/ziwei/domain/ziweiTypes';

import {
  NO_SIGNAL,
  evidenceAdequacy,
  type DataReliability,
  type DivinationJudgment,
  type DomainSubJudgment,
  type EvidenceStrength,
  type JudgmentDomain,
  type JudgmentEvidence,
  type QuestionDirectness,
  type Stance,
} from './contracts';

/** R1 — palace → domain. */
export function palaceForDomain(domain: JudgmentDomain): string | null {
  switch (domain) {
    case 'MONEY_INFLOW': return '재백';
    case 'MONEY_RETENTION': return '전택';
    case 'CAREER':
    case 'OUTCOME': return '관록';
    case 'MOVEMENT': return '천이';
    case 'RELATION_STABILITY':
    case 'RELATION_BOND': return '부처';
    case 'CONFLICT':
    case 'INFLUENCE': return '형제';
    case 'HEALTH_ENERGY': return '질액';
    case 'OPPORTUNITY':
    case 'DECISION':
    case 'GENERAL': return '명궁';
    default: return null;
  }
}

export type SihuaKind = 'ROK' | 'GWON' | 'GWA' | 'GI';
export function sihuaKind(label: string | undefined): SihuaKind | null {
  if (!label) return null;
  if (label.includes('록') || label.includes('祿')) return 'ROK';
  if (label.includes('권') || label.includes('權')) return 'GWON';
  if (label.includes('과') || label.includes('科')) return 'GWA';
  if (label.includes('기') || label.includes('忌')) return 'GI';
  return null;
}
const SIHUA_MEANING: Record<SihuaKind, string> = {
  ROK: '흐름이 열리고 들어오는 힘', GWON: '주도권을 쥐고 밀어붙이는 힘',
  GWA: '이름·평판·문서가 따라오는 힘', GI: '막히거나 얽혀서 애를 먹는 힘',
};
const SIHUA_POSITIVE: Record<SihuaKind, boolean> = { ROK: true, GWON: true, GWA: true, GI: false };

/**
 * R2′ (C-class, newly adopted, declared for review) — THE 四化 ARE NOT INTERCHANGEABLE POSITIVES.
 *
 * V3 §19–§21: the previous build counted how many non-忌 transformations landed on the 본궁 (`>=2 → STRONGLY_FOR,
 * ===1 → FOR`). That is a vote engine, and it is wrong on the doctrine's own terms — 祿·權·科 answer DIFFERENT
 * propositions, so two of them are not "more yes" than one:
 *   · 祿 재록이 실제로 들어옴          → answers a RECEPTIVE question ("들어올까?") directly
 *   · 權 주도권을 쥐고 밀어붙임        → answers an AGENCY question ("밀어붙여도 될까?"); for a receptive
 *                                       question it means "저절로 오지는 않고 내가 밀어야 열린다"
 *   · 科 이름·평판·문서가 따라옴        → answers STANDING; on a money question it is real but indirect
 *   · 忌 막히고 얽힘                   → obstruction, and on the 본궁 it is decisive
 * So the stance follows WHICH transformation landed and whether it answers what was asked.
 */
type SihuaRole = 'RECEPTIVE' | 'AGENCY' | 'STANDING';
const SIHUA_ROLE: Record<Exclude<SihuaKind, 'GI'>, SihuaRole> = { ROK: 'RECEPTIVE', GWON: 'AGENCY', GWA: 'STANDING' };
const DOMAIN_ASKS: Partial<Record<JudgmentDomain, SihuaRole>> = {
  MONEY_INFLOW: 'RECEPTIVE', MONEY_RETENTION: 'RECEPTIVE', OPPORTUNITY: 'RECEPTIVE',
  RELATION_BOND: 'RECEPTIVE', OUTCOME: 'RECEPTIVE',
  CAREER: 'AGENCY', DECISION: 'AGENCY', CONFLICT: 'AGENCY', INFLUENCE: 'AGENCY', MOVEMENT: 'AGENCY',
  RELATION_STABILITY: 'STANDING', GENERAL: 'STANDING', HEALTH_ENERGY: 'STANDING',
};

export type ZiweiJudgeInput = {
  question: string;
  questionDomain: JudgmentDomain;
  chart: ZiweiChart | null;
  availability: 'available' | 'partial' | 'missing_birth_time' | 'unsupported_case' | 'calculation_failed';
};

function notApplicable(reason: string, reliability: DataReliability, domain: JudgmentDomain): DivinationJudgment {
  return {
    discipline: 'ZIWEI', applicable: false, applicabilityReason: reason, dataReliability: reliability,
    questionDomain: domain, temporalScope: 'NATAL', stance: 'NOT_APPLICABLE',
    dominantConclusion: '자미두수로는 이 질문을 볼 수 없습니다.', dominantFactor: reason,
    directEvidence: [], counterEvidence: [], internalContradictions: [], timingSignals: [],
    domainSubJudgments: [], confidence: 'LOW', questionDirectness: 'GENERAL',
    evidenceStrength: 'NONE', factGroupsUsed: [],
  };
}

const findPalace = (chart: ZiweiChart, name: string): ZiweiPalace | null =>
  chart.palaces.find((p) => p.name.includes(name)) ?? null;

/** R3 — the 삼방사정 set for a palace: itself, its 대궁(+6), and the two 삼합궁(+4, +8). */
function triadOf(chart: ZiweiChart, palace: ZiweiPalace): { opposite: ZiweiPalace | null; triangles: ZiweiPalace[] } {
  const at = (offset: number) =>
    chart.palaces.find((p) => p.index === (palace.index + offset) % 12) ?? null;
  return { opposite: at(6), triangles: [at(4), at(8)].filter((p): p is ZiweiPalace => p !== null) };
}

type PalaceRead = {
  palace: ZiweiPalace;
  role: '본궁' | '대궁' | '삼합궁';
  sihua: { kind: SihuaKind; star: string }[];
  majorStars: string[];
};

function readPalace(chart: ZiweiChart, palace: ZiweiPalace, role: PalaceRead['role']): PalaceRead {
  const landed = chart.transformations.filter(
    (t) => palace.name.includes(t.palaceName) || t.palaceName.includes(palace.name),
  );
  return {
    palace,
    role,
    sihua: landed
      .map((t) => ({ kind: sihuaKind(t.transformation), star: t.star }))
      .filter((x): x is { kind: SihuaKind; star: string } => x.kind !== null),
    majorStars: palace.majorStars.map((s) => s.name).filter(Boolean),
  };
}

/** Judge one palace-domain axis from its full 삼방사정 set. Returns null when the chart says nothing. */
function judgePalaceAxis(
  chart: ZiweiChart,
  domain: JudgmentDomain,
  asked: JudgmentDomain,
): { sub: DomainSubJudgment; reads: PalaceRead[] } | null {
  const name = palaceForDomain(domain);
  if (!name) return null;
  const main = findPalace(chart, name);
  if (!main) return null;

  const { opposite, triangles } = triadOf(chart, main);
  const reads: PalaceRead[] = [readPalace(chart, main, '본궁')];
  if (opposite) reads.push(readPalace(chart, opposite, '대궁'));
  for (const t of triangles) reads.push(readPalace(chart, t, '삼합궁'));

  const evidence: JudgmentEvidence[] = [];
  const counterEvidence: JudgmentEvidence[] = [];
  const directness: QuestionDirectness = domain === asked ? 'DIRECT' : 'ADJACENT';

  for (const r of reads) {
    for (const s of r.sihua) {
      const item: JudgmentEvidence = {
        fact: `${r.palace.name}(${r.role})에 ${s.star} 화${s.kind === 'ROK' ? '록' : s.kind === 'GWON' ? '권' : s.kind === 'GWA' ? '과' : '기'}`,
        meaning: `${r.role === '본궁' ? '이 자리' : `${r.role}`}에 ${SIHUA_MEANING[s.kind]}이 ${SIHUA_POSITIVE[s.kind] ? '들어옵니다' : '걸립니다'}.`,
        domain, temporalScope: 'NATAL',
        // 본궁 evidence is direct; 대궁/삼합궁 influence is real but one step removed.
        directness: r.role === '본궁' ? directness : 'ADJACENT',
      };
      if (SIHUA_POSITIVE[s.kind]) evidence.push(item);
      else counterEvidence.push(item);
    }
  }

  // R4 — 무주성(공궁): the palace borrows its 대궁's stars, so say so instead of pretending it is empty-neutral.
  const mainRead = reads[0];
  const borrowed = mainRead.majorStars.length === 0 && opposite;
  if (borrowed) {
    evidence.push({
      fact: `${main.name} 무주성 · 대궁 ${opposite!.name}의 ${reads[1]?.majorStars.join('·') || '주성'}을 빌려 봄`,
      meaning: '이 자리는 스스로 끌고 가기보다 맞은편 자리의 성향을 따라갑니다.',
      domain, temporalScope: 'NATAL', directness: 'ADJACENT',
    });
  }

  const hasSignal = evidence.length + counterEvidence.length > 0;
  // E1 FIX — absence of any 四化/structure is NOT a weak yes. It is silence, and silence casts no vote.
  if (!hasSignal) {
    return {
      reads,
      sub: {
        domain,
        stance: NO_SIGNAL,
        conclusion: `${main.name}에는 방향을 정할 만한 신호가 들어오지 않습니다.`,
        temporalScope: 'NATAL', directness, reliability: 'EXACT',
        evidence: mainRead.majorStars.length
          ? [{
              fact: `${main.name}의 ${mainRead.majorStars.join('·')}`,
              meaning: '이 자리는 그 성향대로 흘러갈 뿐, 특별히 밀거나 막는 힘은 없습니다.',
              domain, temporalScope: 'NATAL', directness: 'GENERAL',
            }]
          : [],
        counterEvidence: [],
      },
    };
  }

  // R2′ — read WHICH transformation landed on the 본궁 against WHAT this axis is asking (never a count).
  const onMain = new Set(mainRead.sihua.map((s) => s.kind));
  const giOnMain = onMain.has('GI');
  const rok = onMain.has('ROK');
  const gwon = onMain.has('GWON');
  const gwa = onMain.has('GWA');
  const asking = DOMAIN_ASKS[domain] ?? 'STANDING';
  const answersAsked = [...onMain]
    .filter((k): k is Exclude<SihuaKind, 'GI'> => k !== 'GI')
    .some((k) => SIHUA_ROLE[k] === asking);
  let stance: Stance;
  let conclusion: string;
  if (giOnMain && onMain.size > 1) {
    stance = 'CONDITIONAL_AGAINST';
    conclusion = `${main.name}은 힘도 실리지만 화기로 걸리는 지점이 함께 있어, 조건을 정리하지 않으면 쉽지 않습니다.`;
  } else if (giOnMain) {
    stance = 'AGAINST';
    conclusion = `${main.name}에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다.`;
  } else if (rok && gwon) {
    // 祿權相會 — a NAMED configuration (들어오는 힘과 밀어붙일 힘이 한 자리), not "two positives".
    stance = 'STRONGLY_FOR';
    conclusion = `${main.name}에 화록과 화권이 함께 들어와, 들어오는 힘과 밀어붙일 힘이 한 자리에 놓인 열려 있는 자리입니다.`;
  } else if (answersAsked) {
    stance = 'FOR';
    conclusion = rok
      ? `${main.name}에 화록이 들어와, 이 부분은 실제로 들어오는 자리라 진행하셔도 좋습니다.`
      : gwon
        ? `${main.name}에 화권이 들어와, 이 부분은 주도권을 쥐고 진행하셔도 되는 자리입니다.`
        : `${main.name}에 화과가 들어와, 이름과 신뢰가 따라붙어 열려 있는 자리입니다.`;
  } else if (rok || gwon || gwa) {
    // A transformation landed, but it answers a different proposition than the one asked. Say that plainly
    // instead of upgrading it into a yes.
    stance = 'CONDITIONAL_FOR';
    conclusion = gwon
      ? `${main.name}에 화권이 들어와 있어, 저절로 굴러오지는 않지만 직접 미시면 열리는 쪽입니다.`
      : rok
        ? `${main.name}에 화록이 들어와 있어 들어오는 몫은 있으나, 끌고 가는 힘까지는 아니라 크게 벌이기는 쉽지 않습니다.`
        : `${main.name}에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.`;
  } else if (counterEvidence.length > 0) {
    // signal only from 대궁/삼합궁, and it is obstructive
    stance = 'CONDITIONAL_AGAINST';
    conclusion = `${main.name} 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.`;
  } else {
    stance = 'CONDITIONAL_FOR';
    conclusion = `${main.name}은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.`;
  }

  return { reads, sub: { domain, stance, conclusion, temporalScope: 'NATAL', directness, reliability: 'EXACT', evidence, counterEvidence } };
}

/** Axes worth reading for this question — Ziwei's own decomposition (business also needs 재백, etc.). */
function axesFor(asked: JudgmentDomain): JudgmentDomain[] {
  switch (asked) {
    case 'MONEY_INFLOW':
    case 'MONEY_RETENTION':
      return ['MONEY_INFLOW', 'MONEY_RETENTION', 'CAREER'];
    case 'OPPORTUNITY':
    case 'DECISION':
    case 'OUTCOME':
      return ['CAREER', 'MONEY_INFLOW', 'GENERAL'];
    case 'CAREER':
      return ['CAREER', 'MONEY_INFLOW', 'MOVEMENT'];
    case 'MOVEMENT':
      return ['MOVEMENT', 'CAREER', 'GENERAL'];
    case 'RELATION_BOND':
    case 'RELATION_STABILITY':
      return ['RELATION_STABILITY', 'GENERAL', 'CONFLICT'];
    case 'CONFLICT':
    case 'INFLUENCE':
      return ['CONFLICT', 'RELATION_STABILITY'];
    case 'HEALTH_ENERGY':
      return ['HEALTH_ENERGY', 'GENERAL'];
    default:
      return ['GENERAL', 'CAREER', 'RELATION_STABILITY'];
  }
}

export function judgeZiwei(input: ZiweiJudgeInput): DivinationJudgment {
  const asked = input.questionDomain;
  if (input.availability === 'missing_birth_time') {
    return notApplicable('출생시간이 확정되지 않아 자미두수 명반을 세울 수 없습니다.', 'UNUSABLE', asked);
  }
  if (input.availability !== 'available' || !input.chart) {
    return notApplicable('자미두수 명반이 계산되지 않았습니다.', 'UNUSABLE', asked);
  }
  const chart = input.chart;

  // The ASKED axis is always read first. `axesFor` lists the axes worth reading AROUND the question, and for
  // several domains (RELATION_BOND, DECISION, OPPORTUNITY…) it omitted the asked one — so 자미두수 had a
  // palace for the question (부처, 명궁) and never looked at it, which read downstream as "no signal".
  const results = [...new Set<JudgmentDomain>([asked, ...axesFor(asked)])]
    .map((d) => judgePalaceAxis(chart, d, asked))
    .filter((r): r is { sub: DomainSubJudgment; reads: PalaceRead[] } => r !== null);
  if (results.length === 0) {
    return notApplicable('이 질문에 해당하는 궁을 명반에서 찾지 못했습니다.', 'MINIMAL', asked);
  }

  const subs = results.map((r) => r.sub);
  const primary = subs.find((s) => s.domain === asked) ?? subs[0];

  // Structural context that colours the whole chart (used as evidence, never as a lone verdict).
  const contextEvidence: JudgmentEvidence[] = [];
  const bodyPalace = chart.palaces.find((p) => p.isBodyPalace);
  if (bodyPalace) {
    contextEvidence.push({
      fact: `신궁(身宮)이 ${bodyPalace.name}`,
      meaning: '살면서 실제로 무게가 실리는 자리입니다.',
      domain: 'GENERAL', temporalScope: 'NATAL', directness: 'GENERAL',
    });
  }
  if (chart.fiveElementsClass) {
    contextEvidence.push({
      fact: `${chart.fiveElementsClass} · 명주 ${chart.soul}`,
      meaning: '명반 전체의 기본 결입니다.',
      domain: 'GENERAL', temporalScope: 'NATAL', directness: 'GENERAL',
    });
  }

  const directional = subs.filter((s) => s.stance !== NO_SIGNAL);
  const evidenceStrength: EvidenceStrength = evidenceAdequacy(primary);

  const internalContradictions =
    primary.evidence.length > 0 && primary.counterEvidence.length > 0
      ? [`${palaceForDomain(primary.domain)}에 열어 주는 기운과 막는 기운이 함께 들어옵니다.`]
      : [];

  const factGroupsUsed = ['12궁 궁위', '사화(四化)', '삼방사정(대궁·삼합궁)', '주성 배치'];
  if (bodyPalace) factGroupsUsed.push('신궁');
  if (chart.fiveElementsClass) factGroupsUsed.push('오행국·명주');

  return {
    discipline: 'ZIWEI',
    applicable: true,
    dataReliability: 'EXACT',
    questionDomain: asked,
    temporalScope: 'NATAL',
    stance: primary.stance,
    dominantConclusion: primary.conclusion,
    dominantFactor:
      primary.counterEvidence[0]?.fact ?? primary.evidence[0]?.fact ?? `${palaceForDomain(primary.domain)} 신호 없음`,
    directEvidence: [...subs.flatMap((s) => s.evidence), ...contextEvidence],
    counterEvidence: subs.flatMap((s) => s.counterEvidence),
    internalContradictions,
    timingSignals: [], // 유년 미계산 — never a year claim
    domainSubJudgments: subs,
    confidence: evidenceStrength === 'STRONG' ? 'HIGH' : evidenceStrength === 'NONE' ? 'LOW' : 'MEDIUM',
    questionDirectness: primary.directness,
    evidenceStrength,
    factGroupsUsed,
  };
}
