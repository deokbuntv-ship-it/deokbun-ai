// FINAL DIVINATION CONSULTATION QA V1 — §20/§21: simple, non-LLM structural checks. The brief is explicit
// that these do NOT need to be sophisticated ("a simple normalized-text similarity check is enough").

const GENERIC_PHRASES = [
  '흐름이 있습니다', '균형이 필요합니다', '신중하게 접근하세요', '가능성이 있습니다',
  '노력이 중요합니다', '긍정적인 기운', '좋은 시기입니다',
];

/** Count of generic-phrase hits in one answer's text — a HIGH count (used as the substance of the answer
 *  rather than incidentally) is a quality flag, not an automatic fail (the phrases are not forbidden). */
export function genericPhraseHits(text: string): { phrase: string; count: number }[] {
  return GENERIC_PHRASES
    .map((phrase) => ({ phrase, count: (text.match(new RegExp(phrase, 'g')) ?? []).length }))
    .filter((h) => h.count > 0);
}

function normalize(text: string): string {
  return text.replace(/\s+/g, '').replace(/[.,!?~·「」『』…]/g, '');
}

/** Jaccard similarity over character bigrams — cheap, dependency-free, good enough to flag obvious
 *  template repetition across different cases per §20 ("do not build a sophisticated plagiarism system"). */
export function textSimilarity(a: string, b: string): number {
  const bigrams = (s: string): Set<string> => {
    const n = normalize(s);
    const out = new Set<string>();
    for (let i = 0; i < n.length - 1; i += 1) out.add(n.slice(i, i + 2));
    return out;
  };
  const A = bigrams(a);
  const B = bigrams(b);
  if (A.size === 0 || B.size === 0) return 0;
  let intersection = 0;
  for (const g of A) if (B.has(g)) intersection += 1;
  const union = A.size + B.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export type DuplicatePair = { caseIdA: string; caseIdB: string; similarity: number };

/** Flags pairs whose composed answer text is suspiciously similar (>0.6 bigram Jaccard) — a template-reuse
 *  signal, not a proof; ONLY compares cases within the SAME domain (cross-domain similarity is expected to
 *  be low and not meaningful to compare). */
export function findDuplicates(cases: { caseId: string; domain: string; text: string }[], threshold = 0.6): DuplicatePair[] {
  const out: DuplicatePair[] = [];
  for (let i = 0; i < cases.length; i += 1) {
    for (let j = i + 1; j < cases.length; j += 1) {
      if (cases[i].domain !== cases[j].domain) continue;
      const sim = textSimilarity(cases[i].text, cases[j].text);
      if (sim >= threshold) out.push({ caseIdA: cases[i].caseId, caseIdB: cases[j].caseId, similarity: Math.round(sim * 100) / 100 });
    }
  }
  return out;
}
