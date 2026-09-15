// V4C §24/§26 — CONTINUATION INTENT + LEGACY-TIER DECOUPLING.
//
// Two audit findings this locks:
//   · finding 10: "돈은?" started a completely fresh reading at the CURRENT server instant, so the second
//     answer was computed against a different moment than the judgment it appeared to develop;
//   · finding 12: the compatibility tier still reached paid interpretation — as the 【종합 판단(근거 기반)】
//     anchor and as the driver of `requireConstructive`, i.e. it shaped output tone.
import { classifyContinuationIntent } from '@/features/chat/services/followUpContext';

describe('§24 — an ordinary follow-up REFINES; only an explicit request re-evaluates', () => {
  const withPrior = (q: string) => classifyContinuationIntent(q, true);

  it.each([
    ['돈은요?'], ['돈은?'], ['왜요?'], ['왜 그런가요?'],
    ['그럼 내년은?'], ['결혼하면요?'], ['그건 어떤가요?'],
  ])('%s → REFINE_EXISTING', (q) => {
    expect(withPrior(q)).toBe('REFINE_EXISTING');
  });

  it.each([
    ['지금 다시 보면 어떤가요?'], ['오늘은?'], ['현재 기준으로는 어떤가요?'], ['지금은 어때요?'],
  ])('%s → REEVALUATE_NOW', (q) => {
    expect(withPrior(q)).toBe('REEVALUATE_NOW');
  });

  it('a fresh timing question is NOT a re-evaluation, despite containing 지금', () => {
    // "지금 계약해도 될까요?" asks about a moment; it does not ask to recompute a previous judgment. Treating
    // it as one would silently discard the reading the user is sitting in.
    expect(withPrior('지금 계약해도 될까요?')).not.toBe('REEVALUATE_NOW');
  });

  it('with no prior decision there is nothing to refine', () => {
    expect(classifyContinuationIntent('돈은요?', false)).toBe('NEW_QUESTION');
    expect(classifyContinuationIntent('오늘은?', false)).toBe('REEVALUATE_NOW');
  });

  it('a self-contained new question is not swept into the previous reading', () => {
    expect(withPrior('제 타고난 성격이 어떤가요?')).toBe('NEW_QUESTION');
    expect(withPrior('올해 돈을 벌 수 있을까요?')).toBe('NEW_QUESTION');
  });
});

describe('§26 — the legacy compatibility tier has NO paid-interpretation authority', () => {
  const read = (p: string) => require('fs').readFileSync(require('path').join(process.cwd(), p), 'utf8') as string;
  const code = (p: string) => read(p).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  const COMPAT = 'src/features/chat/server/buildCompatibilityConsultation.ts';

  it('the tier never reaches the prompt — assessmentSummary is not passed at all', () => {
    // Relabelling it (V4B) was not enough: `renderGroundingContext` renders whatever is in that field under
    // the header 【종합 판단(근거 기반)】, so the coupling lived in the RENDERER, not in the label.
    expect(code(COMPAT)).not.toMatch(/assessmentSummary\s*:/);
  });

  it('output tone follows the STRUCTURAL verdict, not the tier band', () => {
    const c = code(COMPAT);
    expect(c).not.toMatch(/negativePairTier/);
    expect(c).toMatch(/requireConstructive:\s*structurallyHard/);
    expect(c).toMatch(/AGAINST_STANCES\.includes\(structuralVerdict\.direction\)/);
  });

  it('with no structural verdict, mitigation is NOT synthesised from the tier', () => {
    expect(code(COMPAT)).toMatch(/structuralVerdict !== null/);
  });

  it('the legacy display payload is untouched — the card still gets its tier', () => {
    const c = code(COMPAT);
    expect(c).toMatch(/overall:\s*a\.overall/);
    expect(c).toMatch(/overallLabel:\s*a\.overallLabel/);
    expect(c).toMatch(/tierModelVersion/);
  });
});
