// DIVINATION_ENGINE_V1 — PAID-READING QUALITY GUARD (§16/§23).
//
// THE ACCEPTANCE QUESTION (§1): "could this answer have been written without seeing THIS person's data?"
// If yes, it is not a paid divination — it is advice. This guard is the automated half of that test.
//
// It validates STRUCTURE, not vocabulary (§23: "do not rely only on keyword bans"):
//   1. A verdict must exist and must be directional.
//   2. The prose must PRESERVE the verdict's direction — the LLM may explain, never reverse or dilute (§16).
//   3. Every APPLIED discipline must have visibly contributed (§24).
//   4. A resolved contradiction must not be re-flattened into "반반/좋은 점도 나쁜 점도" prose (§9).
//   5. The answer must not be advice-only (§1) — the generic-advice phrases are permitted only ALONGSIDE a
//      real conclusion, never instead of one.
import {
  AGAINST_STANCES,
  FOR_STANCES,
  isDirectional,
  type CrossDivinationVerdict,
} from './contracts';

export type QualityFailureCode =
  | 'NO_VERDICT'
  | 'NON_DIRECTIONAL_VERDICT'
  | 'VERDICT_LOST_IN_PROSE'
  | 'VERDICT_REVERSED_IN_PROSE'
  | 'NEUTRALIZED_CONTRADICTION'
  | 'ADVICE_ONLY'
  | 'APPLIED_DISCIPLINE_NOT_CONTRIBUTING'
  | 'NO_SUBJECT_SPECIFIC_EVIDENCE';

export type QualityFinding = { code: QualityFailureCode; detail: string };

// Phrases that NEUTRALIZE a resolved contradiction — the exact failure §9 forbids. These are only a problem
// when the verdict IS directional: the reading then contradicts its own machine verdict.
const NEUTRALIZING = [
  /반반(입니다|이에요|으로)/,
  /좋은\s*점(도|과)[^.!?\n]{0,20}(나쁜|어려운|안\s*좋은)\s*점(도|이)/,
  /양쪽\s*(다|모두)\s*가능/,
  /(경우|사람)에\s*따라\s*다릅니다/,
  /뭐라\s*(말|단정)하기\s*(어렵|힘듭)/,
];

// Generic self-help advice. Allowed as SECONDARY guidance; a failure only when it is the whole answer (§1).
const GENERIC_ADVICE = [
  /신중(하게|히)\s*(결정|판단|접근)/,
  /천천히\s*(하|진행|접근)/,
  /대화를?\s*(많이|자주|충분히)/,
  /서로(의)?\s*(차이|입장)를?\s*이해/,
  /충분히\s*생각(하고|해)/,
  /계획(을|적으로)\s*(세우|움직)/,
  /긍정적으로\s*생각/,
  /배려(가|를)\s*필요/,
];

// Direction words the prose uses when it AGREES with a FOR / AGAINST verdict.
//
// These must cover the register the ENGINE itself writes in, not only the register an LLM might. The QA pack
// caught real CONDITIONAL_AGAINST verdicts whose headline read "범위를 좁히는 쪽이 낫습니다" / "지키는 쪽이
// 약해…" — plainly a direction to any Korean reader, but invisible to the original vocabulary, so the guard
// reported VERDICT_LOST_IN_PROSE on prose that was not lost. Only unambiguous direction verbs are added.
//
// NOTE ON KOREAN CONJUGATION: a stem is not a substring of its own conjugation — 막히다 becomes "막힙니다"
// (막+힙), 열리다 becomes "열립니다" (열+립). Matching on `막히` therefore MISSES the polite form the engine
// actually writes, which is how a headline that plainly stated a direction was reported as direction-less.
// Each stem below lists the conjugated syllables it needs, not just the dictionary form.
const PROSE_FOR = /(하는\s*쪽|가는\s*쪽|괜찮습니다|좋은\s*(시기|흐름)|열려|열리|열립|받쳐줍니다|받쳐\s*주|진행하|해도\s*(됩|좋)|맞습니다)/;
const PROSE_AGAINST = /(하지\s*않는\s*쪽|아닙니다|미루|접|어렵|무리|막히|막힙|막혀|좋지\s*않|피하|난도가\s*높|쉽지\s*않|좁히|좁힙|줄이|줄입|약해|벌일\s*자리는\s*아)/;

/**
 * Validate a composed paid reading against its own verdict. `prose` is the user-facing text (composed card or
 * fallback). Returns [] when the reading is acceptable.
 */
export function validatePaidReading(
  verdict: CrossDivinationVerdict | null,
  prose: string,
): QualityFinding[] {
  const findings: QualityFinding[] = [];
  const text = (prose ?? '').trim();

  if (!verdict) {
    findings.push({ code: 'NO_VERDICT', detail: '점사 판정 없이 답변이 생성되었습니다.' });
    return findings;
  }
  if (!isDirectional(verdict.direction)) {
    // INSUFFICIENT_DATA is allowed, but ONLY when it was proven (no discipline could speak).
    const anySpoke = verdict.disciplineJudgments.some((j) => j.applicable && isDirectional(j.stance));
    if (verdict.direction !== 'INSUFFICIENT_DATA' || anySpoke) {
      findings.push({
        code: 'NON_DIRECTIONAL_VERDICT',
        detail: `방향 없는 판정(${verdict.direction})은 유료 점사로 허용되지 않습니다.`,
      });
    }
  }

  if (text.length === 0) return findings;

  const isFor = FOR_STANCES.includes(verdict.direction);
  const isAgainst = AGAINST_STANCES.includes(verdict.direction);

  // (2) the prose must carry the verdict's direction — not merely avoid contradicting it.
  if (isFor || isAgainst) {
    const saysFor = PROSE_FOR.test(text);
    const saysAgainst = PROSE_AGAINST.test(text);
    // Some verdicts legitimately contain BOTH directions:
    //   · FOR_BUT_LATER / AGAINST_FOR_NOW — direction plus a timing caveat;
    //   · a COMPOUND conclusion — "기회는 열리지만 잡았을 때 남는 쪽은 막힙니다" is two axes, both true, and
    //     flattening it to one direction is the depth failure this engine exists to avoid (V4A §16).
    const compound = verdict.propositions?.some((p) => p.conclusionType === 'COMPOUND') ?? false;
    const timed = verdict.direction === 'FOR_BUT_LATER' || verdict.direction === 'AGAINST_FOR_NOW' || compound;
    if (!saysFor && !saysAgainst) {
      findings.push({ code: 'VERDICT_LOST_IN_PROSE', detail: '본문에 결론 방향이 드러나지 않습니다.' });
    } else if (!timed && isFor && saysAgainst && !saysFor) {
      findings.push({ code: 'VERDICT_REVERSED_IN_PROSE', detail: '판정은 하는 쪽인데 본문이 반대로 읽힙니다.' });
    } else if (!timed && isAgainst && saysFor && !saysAgainst) {
      findings.push({ code: 'VERDICT_REVERSED_IN_PROSE', detail: '판정은 아닌 쪽인데 본문이 반대로 읽힙니다.' });
    }
  }

  // (4) a directional verdict must never be re-flattened into "반반" prose.
  if (isDirectional(verdict.direction) && NEUTRALIZING.some((re) => re.test(text))) {
    findings.push({
      code: 'NEUTRALIZED_CONTRADICTION',
      detail: '판정이 분명한데 본문이 "반반/경우에 따라 다름"으로 되돌려졌습니다.',
    });
  }

  // (5) advice-only: generic guidance present AND no conclusion sentence surfaced.
  const adviceHits = GENERIC_ADVICE.filter((re) => re.test(text)).length;
  if (adviceHits > 0 && !PROSE_FOR.test(text) && !PROSE_AGAINST.test(text)) {
    findings.push({
      code: 'ADVICE_ONLY',
      detail: '점사 결론 없이 일반적인 조언만으로 답변이 구성되었습니다.',
    });
  }

  // (3) every applied discipline must have a stated contribution (§24).
  for (const c of verdict.contributions) {
    if (c.applied && (!c.contribution || c.contribution.trim().length === 0)) {
      findings.push({
        code: 'APPLIED_DISCIPLINE_NOT_CONTRIBUTING',
        detail: `${c.discipline}이 적용되었는데 결론 기여가 기록되지 않았습니다.`,
      });
    }
  }

  // (1b) subject-specific evidence must exist — otherwise the answer could fit anyone.
  const hasEvidence = verdict.evidenceReferences.some((r) => r.lines.length > 0);
  if (isDirectional(verdict.direction) && !hasEvidence) {
    findings.push({
      code: 'NO_SUBJECT_SPECIFIC_EVIDENCE',
      detail: '이 사람의 명식에서 나온 근거가 하나도 인용되지 않았습니다.',
    });
  }

  return findings;
}

/** True when the reading is fit to sell. */
export function isPaidReadingAcceptable(
  verdict: CrossDivinationVerdict | null,
  prose: string,
): boolean {
  return validatePaidReading(verdict, prose).length === 0;
}
