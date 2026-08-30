// DELIVERY QUALITY V3 §5 — BOUNDED Korean surface realization for SERVER-COMPOSED text.
//
// The deterministic grounded fallback renders authoritative engine strings verbatim. Those strings are
// assembled by the engines with a FIXED particle and a plain (해라체) sentence ending, which produces two
// visible artifacts once they are shown to a consumer next to the product's own 합쇼체 voice:
//
//   "원국 월주 천간충를 …"   ← 조사 does not agree with the anchor it follows
//   "… 맞물려 풀린다."        ← 해라체 ending in an otherwise 합쇼체 answer
//
// This module repairs ONLY those two surface facts. It is not a paraphraser and not an LLM: every rule is a
// total function of the characters already present, changes no lexical item, adds no word, and removes no
// word. Semantic content is therefore preserved by construction — the same claim, correctly spelled.
const HANGUL_BASE = 0xac00;
const HANGUL_LAST = 0xd7a3;
const JONG_COUNT = 28;
const JONG_NIEUN = 4;
const JONG_BIEUP = 17;

/** Final-consonant index of a Hangul syllable, or null when `ch` is not one. */
function jongseong(ch: string): number | null {
  const c = ch.charCodeAt(0);
  if (c < HANGUL_BASE || c > HANGUL_LAST) return null;
  return (c - HANGUL_BASE) % JONG_COUNT;
}

const endsWithConsonant = (ch: string): boolean => (jongseong(ch) ?? 0) !== 0;

/** Replace a syllable's final consonant. Used only for the ㄴ다 → ㅂ니다 conjugation below. */
function withJongseong(ch: string, jong: number): string {
  const c = ch.charCodeAt(0);
  return String.fromCharCode(c - ((c - HANGUL_BASE) % JONG_COUNT) + jong);
}

// The CLOSED engine vocabulary that a particle may follow in server-composed text: the 형충파해합 relation
// family (명리) and the twelve palace names (자미두수). The rule fires ONLY after one of these, so ordinary
// Korean prose — where the same syllables occur inside words like 사과 / 효과 / 가을 — is never touched. And
// because the rule IS the standard agreement rule, it can only ever change a form that is already wrong:
// within this vocabulary a disagreeing particle is a rendering defect, never an authored one.
const ANCHOR_TAIL_PARTICLE =
  /(천간합|천간충|지지합|지지충|반합|육합|삼합|방합|암합|원진|귀문|합|충|형|파|해|명궁|신궁|형제|부처|자녀|재백|질액|천이|노복|교우|관록|전택|복덕|부모)(를|을|와|과|이|가|은|는)(?=[\s.,)\]·]|$)/g;

const PARTICLE_PAIR: Record<string, readonly [string, string]> = {
  // particle → [after a vowel-final syllable, after a consonant-final syllable]
  를: ['를', '을'], 을: ['를', '을'],
  와: ['와', '과'], 과: ['와', '과'],
  이: ['가', '이'], 가: ['가', '이'],
  은: ['는', '은'], 는: ['는', '은'],
};

// The UNRESOLVED placeholder form an engine template leaves behind when it cannot pick a particle at
// assembly time ("원국 년주은(는) 가까운 시기에 …"). Unambiguous by construction — no Korean word contains it
// — so this one is resolved wherever it appears, not just after the anchor vocabulary.
const PLACEHOLDER_PARTICLE = /([가-힣])(은|는|이|가|을|를|와|과)\((은|는|이|가|을|를|와|과)\)/g;

const agreeing = (precedingSyllable: string, particle: string): string => {
  const pair = PARTICLE_PAIR[particle];
  return pair ? pair[endsWithConsonant(precedingSyllable) ? 1 : 0] : particle;
};

/** §5 — 조사 agreement on the canonical anchor forms, and on unresolved placeholders. Orthography only. */
export function realizeParticles(text: string): string {
  return text
    .replace(PLACEHOLDER_PARTICLE, (_m, prev: string, first: string) => `${prev}${agreeing(prev, first)}`)
    .replace(ANCHOR_TAIL_PARTICLE, (_m, anchor: string, particle: string) =>
      `${anchor}${agreeing(anchor[anchor.length - 1], particle)}`);
}

// 해라체 → 합쇼체. The ㄴ다 rule is a real conjugation (풀린다 → 풀립니다, 흔든다 → 흔듭니다, 한다 → 합니다):
// the ㄴ final becomes ㅂ and 니다 is appended. It is only applied at a sentence boundary, so connective
// forms (…한다면, …된다고) are untouched. Everything else is an explicit, closed table — deliberately NOT a
// general "noun + 다 → 입니다" rule, which would wreck ordinary verbs (하다/보다/크다).
const HAERA_EXACT: readonly (readonly [RegExp, string])[] = [
  [/아니다(?=[.!?…]|$)/gm, '아닙니다'],
  [/있다(?=[.!?…]|$)/gm, '있습니다'],
  [/없다(?=[.!?…]|$)/gm, '없습니다'],
  [/않다(?=[.!?…]|$)/gm, '않습니다'],
  [/([가-힣])\s*구조다(?=[.!?…]|$)/gm, '$1 구조입니다'],
  [/자리다(?=[.!?…]|$)/gm, '자리입니다'],
];
const HAERA_NIEUN = /([가-힣])다(?=[.!?…]|$)/gm;

/** §5 — speech level only. Never rewrites a word, only its ending inflection. */
export function realizePoliteEndings(text: string): string {
  let out = text;
  for (const [re, to] of HAERA_EXACT) out = out.replace(re, to);
  return out.replace(HAERA_NIEUN, (m, syllable: string) =>
    jongseong(syllable) === JONG_NIEUN ? `${withJongseong(syllable, JONG_BIEUP)}니다` : m);
}

/** Collapses runs of whitespace and the space a stripped fragment leaves in front of punctuation. */
export function tidyPunctuation(text: string): string {
  return text.replace(/[ \t]{2,}/g, ' ').replace(/\s+([.,!?)])/g, '$1').replace(/([(])\s+/g, '$1').trim();
}

const sentenceKey = (s: string): string => s.replace(/\s+/g, '');

/**
 * §5/§6 — joins claim texts into one paragraph, dropping any SENTENCE already said. The engines share
 * resolution tails across contradiction resolutions ("… 한쪽으로 정하지 않겠습니다."), and a two-sentence
 * riskFactor meaning often restates a one-sentence evidence meaning, so joining the raw strings repeats whole
 * sentences verbatim. Deduplication is on exact normalized text, never similarity.
 *
 * Pass a shared `seen` set to carry the ledger ACROSS sections — that is what stops one sentence from being
 * delivered as a 강점 and again as a 주의할 점 because two different claims happened to contain it.
 */
export function joinDistinctSentences(parts: readonly string[], seen: Set<string> = new Set()): string {
  const kept: string[] = [];
  for (const part of parts) {
    for (const sentence of part.split(/(?<=[.!?…])\s+/)) {
      const s = sentence.trim();
      if (s.length === 0) continue;
      const key = sentenceKey(s);
      if (seen.has(key)) continue;
      seen.add(key);
      // Terminal punctuation, so two claims joined into one paragraph never run together as one sentence.
      // Engine strings are inconsistent about the trailing period; a claim that already ends in one (or in a
      // closing bracket that carries it) is left exactly as it is.
      kept.push(/[.!?…]["'」』]?$/.test(s) ? s : `${s}.`);
    }
  }
  return kept.join(' ');
}

/** The full server-composed realization pass: agreement, speech level, punctuation. */
export function realize(text: string): string {
  return tidyPunctuation(realizePoliteEndings(realizeParticles(text)));
}
