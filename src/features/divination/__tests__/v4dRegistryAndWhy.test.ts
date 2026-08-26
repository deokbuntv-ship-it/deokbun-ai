// V4D §38-11/12/18/19/20/23 — THE ASKED MATTER, THE CLOSED REGISTRY, AND WHY's DAG TRAVERSAL.
//
// Each case is the exact input that walked through the V4C version of the check it now fails.
import {
  compositeTarget, explainProposition, isCanonicalTarget, subordinate, target, ziweiPalaceTarget,
  type CrossDivinationVerdict, type DivinationPremise, type ReasonedProposition,
} from '@/features/divination';
import { resolveAskedTarget, resolveJudgmentDomain } from '@/features/chat/services/consultationGrounding';

let pseq = 0;
const prop = (over: Partial<ReasonedProposition> & Pick<ReasonedProposition,
  'discipline' | 'target' | 'direction'>): ReasonedProposition => {
  pseq += 1;
  return {
    id: `y${pseq}`,
    subject: '본인',
    questionIntent: 'DECISION',
    questionAxis: 'CAREER',
    temporalScope: 'DAEWOON',
    assertion: `assertion ${pseq}`,
    conclusionType: 'DIRECTIONAL',
    answersAsked: true,
    supportingPremiseIds: [],
    opposingPremiseIds: [],
    derivedFromPropositionIds: [],
    unresolvedPremiseIds: [],
    doctrineReferences: ['test'],
    derivationRule: 'PRIMITIVE',
    adequacy: {
      supportAdequacy: 'ADEQUATE', counterAdequacy: 'NONE',
      dataCompleteness: 'COMPLETE', doctrineApplicability: 'ADOPTED',
    },
    ...over,
  };
};

const SEAT_MONTH = target('NATAL_SEAT', 'MONTH', '원국 월지');
const SEAT_DAY = target('NATAL_SEAT', 'DAY', '원국 일지');
const PALACE_CAREER = ziweiPalaceTarget('CAREER')!;

// ══ §38-11 / §38-12 / §10 / §11 — THE ASKED MATTER ══════════════════════════════════════════════
describe('§38-11 / §38-12 — the matter the question named is first-class, and UNKNOWN is valid', () => {
  it('11 — two questions the AXIS map collapses together keep DIFFERENT asked matters', () => {
    const expansion = resolveAskedTarget('사업을 확장할까?');
    const startup = resolveAskedTarget('창업해도 될까요?');
    expect(expansion?.key).toBe('ASKED_MATTER:BUSINESS');
    expect(startup?.key).toBe('ASKED_MATTER:STARTUP');
    // The axis alone cannot tell them apart — which is exactly why the asked matter has to exist at all.
    expect(resolveJudgmentDomain('사업을 확장할까?')).toBe(resolveJudgmentDomain('창업해도 될까요?'));
    expect(expansion!.key).not.toBe(startup!.key);
  });

  it('…and a money question is a DIFFERENT matter again, including one the topic map calls 전반', () => {
    expect(resolveAskedTarget('돈이 들어올까요?')?.key).toBe('ASKED_MATTER:MONEY');
    // "저축이 남을까요?" classifies as 전반, and the AXIS already widens it to money. Mirrored, not re-invented.
    expect(resolveAskedTarget('저축이 남을까요?')?.key).toBe('ASKED_MATTER:MONEY');
  });

  it('12 — a question that names NO matter resolves to UNKNOWN, never to a fabricated one', () => {
    expect(resolveAskedTarget('제 타고난 성격이 어떤가요?')).toBeNull();
    expect(resolveAskedTarget('')).toBeNull();
  });

  it('12 — and under UNKNOWN the exact-target reason ABSTAINS rather than demoting a claim', () => {
    const concrete = prop({
      discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'FAVORABLE', supportingPremiseIds: ['x'],
    });
    const context = prop({
      discipline: 'ZIWEI', target: target('DOCTRINE_GAP', 'AXIS:CAREER', 'CAREER 대응 자리 없음'),
      direction: 'UNFAVORABLE', supportingPremiseIds: ['y'],
    });
    const premises = new Map<string, DivinationPremise>();
    const known = { askedAxis: 'CAREER' as const, asksTiming: false };

    const withMatter = subordinate(concrete, context, premises,
      { ...known, askedTarget: target('ASKED_MATTER', 'OCCUPATION', '직업') });
    const withoutMatter = subordinate(concrete, context, premises, { ...known, askedTarget: null });

    // With a named matter the reason applies. With none it is FALSE AS WRITTEN — its own sentence promises
    // "물어보신 그 대상" — so it must say nothing rather than back-fill the matter from the axis.
    expect(withMatter?.reasons).toContain('EXACT_TARGET_VS_CONTEXT');
    expect(withoutMatter?.reasons ?? []).not.toContain('EXACT_TARGET_VS_CONTEXT');
  });
});

// ══ §38-18 / §38-19 / §38-20 — THE REGISTRY IS CLOSED ═══════════════════════════════════════════
describe('§38-18..20 — an id the kernel has no structure for never becomes a target', () => {
  const rejects = (t: unknown) => expect(isCanonicalTarget(t)).toBe(false);

  it('18 — an adapted reading must name a REGISTERED discipline and a REGISTERED axis', () => {
    expect(isCanonicalTarget({ key: 'ADAPTED_READING:MYUNGRI:CAREER', label: 'x', kind: 'ADAPTED_READING' })).toBe(true);
    expect(isCanonicalTarget({ key: 'ADAPTED_READING:MYUNGRI:CONTEXT', label: 'x', kind: 'ADAPTED_READING' })).toBe(true);
    rejects({ key: 'ADAPTED_READING:MYUNGRI:NOT_AN_AXIS', label: 'x', kind: 'ADAPTED_READING' });
    // The one the audit called out: it reads like the withheld doctrine gap, inside the adapted namespace.
    rejects({ key: 'ADAPTED_READING:QIMEN:STRENGTH_YONGSHIN', label: 'x', kind: 'ADAPTED_READING' });
    rejects({ key: 'ADAPTED_READING:TAROT:CAREER', label: 'x', kind: 'ADAPTED_READING' });
  });

  it('19 — a composite must be a REGISTERED relation over CANONICAL, SORTED, distinct children', () => {
    expect(isCanonicalTarget(compositeTarget('RIVAL', [[SEAT_MONTH, PALACE_CAREER]], '원국 월지·관록궁'))).toBe(true);
    rejects({ key: 'COMPOSITE:X', label: 'x', kind: 'COMPOSITE' });                  // a bare relation
    rejects({ key: 'COMPOSITE:RIVAL', label: 'x', kind: 'COMPOSITE' });              // …names no members
    rejects({ key: 'COMPOSITE:RIVAL:|', label: 'x', kind: 'COMPOSITE' });            // two EMPTY children
    rejects({ key: 'COMPOSITE:RIVAL:NOT_A_KEY|ALSO_NOT', label: 'x', kind: 'COMPOSITE' });
    rejects({ key: 'COMPOSITE:NOT_A_RELATION:NATAL_SEAT:DAY|NATAL_SEAT:HOUR', label: 'x', kind: 'COMPOSITE' });
    // UNSORTED children are not an identity — the same pair would have two keys.
    rejects({ key: 'COMPOSITE:RIVAL:NATAL_SEAT:HOUR|NATAL_SEAT:DAY', label: 'x', kind: 'COMPOSITE' });
    // A rivalry with itself is meaningless.
    rejects({ key: 'COMPOSITE:RIVAL:NATAL_SEAT:DAY|NATAL_SEAT:DAY', label: 'x', kind: 'COMPOSITE' });
  });

  it('19 — and the ONE mint canonicalises: A+B and B+A are the same identity', () => {
    expect(compositeTarget('RIVAL', [[SEAT_MONTH, SEAT_DAY]], 'x').key)
      .toBe(compositeTarget('RIVAL', [[SEAT_DAY, SEAT_MONTH]], 'x').key);
  });

  it('the other kinds are closed too, including the pair ordering the V4C regex let through', () => {
    rejects({ key: 'NATAL_SEAT_PAIR:YEAR_DAY', label: 'x', kind: 'NATAL_SEAT_PAIR' });   // unsorted
    expect(isCanonicalTarget({ key: 'NATAL_SEAT_PAIR:DAY_YEAR', label: 'x', kind: 'NATAL_SEAT_PAIR' })).toBe(true);
    // 자형 is a seat against itself, and stays legal.
    expect(isCanonicalTarget({ key: 'NATAL_SEAT_PAIR:DAY_DAY', label: 'x', kind: 'NATAL_SEAT_PAIR' })).toBe(true);
    rejects({ key: 'BOARD_SEAT:QIMEN_BOARD:LOTTERY_WINNINGS', label: 'x', kind: 'BOARD_SEAT' });
    rejects({ key: 'DOCTRINE_GAP:AXIS:NOT_A_REAL_AXIS', label: 'x', kind: 'DOCTRINE_GAP' });
    rejects({ key: 'ASKED_MATTER:LOTTERY', label: 'x', kind: 'ASKED_MATTER' });
    // A label is display-only, but it reaches the answer verbatim, so an empty one is not acceptable input.
    rejects({ key: SEAT_MONTH.key, label: '', kind: 'NATAL_SEAT' });
  });
});

// ══ §38-23 / §30 — WHY WALKS A SHARED NODE UNDER EVERY BRANCH ═══════════════════════════════════
describe('§38-23 — a shared parent is shown under every conclusion that rests on it', () => {
  const shared = prop({ discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'FAVORABLE' });
  const left = prop({
    discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'UNFAVORABLE', temporalScope: 'SEWOON',
    derivedFromPropositionIds: [shared.id], derivationRule: 'L',
  });
  const right = prop({
    discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'UNFAVORABLE', temporalScope: 'WOLWOON',
    derivedFromPropositionIds: [shared.id], derivationRule: 'R',
  });
  const head = prop({
    discipline: 'CROSS', target: SEAT_MONTH, direction: 'RESTRICTED', temporalScope: 'SEWOON',
    derivedFromPropositionIds: [left.id, right.id], derivationRule: 'HEAD',
  });
  const verdict = {
    premises: [], propositions: [shared, left, right, head], headlinePropositionIds: [head.id],
  } as unknown as CrossDivinationVerdict;

  it('BOTH branches show the parent — V4C gave it to whichever ran first and blanked the other', () => {
    const chain = explainProposition(verdict, head.id)!;
    expect(chain.from).toHaveLength(2);
    for (const branch of chain.from) {
      expect(branch.from.map((c) => c.conclusion.id)).toEqual([shared.id]);
    }
  });

  it('a cycle still terminates rather than hanging', () => {
    const a = prop({ discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'FAVORABLE', derivationRule: 'A' });
    const b = prop({
      discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'FAVORABLE',
      derivedFromPropositionIds: [a.id], derivationRule: 'B',
    });
    const cyclic = {
      premises: [], propositions: [{ ...a, derivedFromPropositionIds: [b.id] }, b],
      headlinePropositionIds: [a.id],
    } as unknown as CrossDivinationVerdict;
    expect(() => explainProposition(cyclic, a.id)).not.toThrow();
  });

  it('the headline is found by NAME, never by matching its own Korean prose', () => {
    // V4C's `startsWith` fallback matched the DOMINANT PARENT by construction, because a resolved
    // contradiction builds its assertion as `dominant.assertion + ' 반대 근거도 있으나, …'`.
    const src = require('fs').readFileSync(
      require('path').join(process.cwd(), 'src/features/divination/reasoning/graphQuery.ts'), 'utf8') as string;
    expect(src).not.toContain('startsWith(p.assertion)');
    expect(src).not.toContain('p.assertion === v.primaryConclusion');
  });
});
