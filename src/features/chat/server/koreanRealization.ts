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

// V6 §KOREAN REALIZATION — the two remaining DETERMINISTIC morphology defects the Blind-84 run surfaced in
// 10 of 82 answers ("주의가 필요이나", "우호적로 나타나"). Both come from engine templates that join a LABEL to
// a particle with a fixed spelling, so the wrong form is produced whenever the label's final syllable does
// not match the one the template assumed. Like every rule in this file they are total functions of the
// characters present, and each one can only ever change a form that is already ungrammatical.

// 하다-nouns used PREDICATIVELY by the status labels ("주의가 필요", "…가 함께 존재"). Such a noun takes 하-
// before a connective or adnominal ending; the templates attach the NOUN particle instead, which is what
// produced "필요이나" and "존재로". Deliberately a closed list — applying this to every noun would wreck
// ordinary Korean, and these are the forms the engine labels actually end in.
//
// The adnominal split is real morphology, not a stylistic choice: 필요하다/부재하다 are ADJECTIVAL and take
// -한, while 존재하다/공존하다 are VERBAL and take -하는. "필요하는 것으로" is simply wrong Korean.
const HADA_ADJECTIVAL = '(필요|부재)';
const HADA_VERBAL = '(존재|공존)';
const HADA_CONCESSIVE = new RegExp(`(필요|부재|존재|공존)이나(?=[\\s.,)\\]·]|$)`, 'g');
const HADA_ADJ_ADVERBIAL = new RegExp(`${HADA_ADJECTIVAL}로(?=[\\s.,)\\]·]|$)`, 'g');
const HADA_VERB_ADVERBIAL = new RegExp(`${HADA_VERBAL}로(?=[\\s.,)\\]·]|$)`, 'g');

// (으)로 agreement. A consonant-final syllable other than ㄹ takes 으로; ㄹ-final and vowel-final take 로.
// A bare 로 after any other final consonant is ungrammatical in Korean, so this rule only ever repairs a
// defect — it is applied at a token boundary so a word that merely CONTAINS the syllable is untouched.
const JONG_RIEUL = 8;
const BARE_RO = /([가-힣])로(?=[\s.,)\]·]|$)/g;

/** §5 — (으)로 agreement and the predicative 하- the engine label templates drop. Orthography only. */
export function realizeAdverbials(text: string): string {
  return text
    .replace(HADA_CONCESSIVE, '$1하나')
    .replace(HADA_ADJ_ADVERBIAL, '$1한 것으로')
    .replace(HADA_VERB_ADVERBIAL, '$1하는 것으로')
    .replace(BARE_RO, (m, prev: string) => {
      const jong = jongseong(prev);
      return jong === null || jong === 0 || jong === JONG_RIEUL ? m : `${prev}으로`;
    });
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
  return tidyPunctuation(realizeAdverbials(realizePoliteEndings(realizeParticles(text))));
}

// ── V6 §INTERNAL TOKEN BAN — THE ONE CONSUMER MAPPING LAYER ──────────────────────────────────────────
//
// The Blind-84 run measured ~20 internal tokens per delivered answer and 37 of 82 answers exposing a raw
// identifier. They all arrive through ONE channel: `JudgmentEvidence.fact`, which the reasoning layer builds
// as a machine-readable source-fact id ("일간 강약: STRONG_LEANING (Myungri Structural V2)",
// "상담판정 CAREER: MIXED (Myungri Consultation Judge V1)") and the presentation layer renders verbatim as
// "(근거: …)". That id is exactly right as provenance and exactly wrong as product text.
//
// The repair is a MAPPING, not a strip: each identifier has a consumer-readable Korean equivalent, so the
// reader still sees which system said it and on what basis — in words. It lives here, in one place, rather
// than as scattered string replacements, and the reasoning layer's own ids are untouched (they remain the
// audit trail in decisionMeta and the grounded corpus).

// Internal judge/version parentheticals → the discipline, in Korean. Matched as a whole parenthetical so a
// future version bump needs no new entry.
const JUDGE_PARENTHETICAL = /\((?:Myungri|Ziwei|Qimen|Cross)\b[^)]*\)/g;
const JUDGE_LABEL: readonly (readonly [RegExp, string])[] = [
  [/^\(Myungri/, '(명리 판단)'],
  [/^\(Ziwei/, '(자미두수 판단)'],
  [/^\(Qimen/, '(기문둔갑 판단)'],
  [/^\(Cross/, '(교차 판정)'],
];

// The enum VALUES that reach a `(근거: …)` anchor, each mapped to what it actually means for the reader.
// Ordered longest-first at build time so STRONG_LEANING is never matched as LEANING's prefix.
const ENUM_LABEL: Record<string, string> = {
  STRONG_LEANING: '일간이 힘을 받는 쪽',
  WEAK_LEANING: '일간이 힘이 달리는 쪽',
  MIXED_EVIDENCE: '근거가 엇갈리는 쪽',
  MULTI_CANDIDATE: '후보가 여럿이라 하나로 좁히지 못함',
  NONE_DETECTED: '해당 신호 없음',
  NOT_APPLICABLE: '이 질문에는 해당하지 않음',
  INSUFFICIENT_EVIDENCE: '방향을 정할 신호가 없음',
  INSUFFICIENT_DATA: '판단에 필요한 정보가 모자람',
  STRUCTURAL_ANSWER: '구조 설명',
  UNRESOLVED: '아직 한 방향으로 단정하기 어려움',
  SELECTED: '확정',
  DEFERRED: '판정 보류',
  CANDIDATE: '후보',
  FAVORABLE: '우호적',
  CAUTION: '주의가 필요',
  MIXED: '기회와 리스크가 함께',
  BUSINESS: '사업',
  MONEY: '재물',
  CAREER: '직업',
  LOVE: '연애',
  REUNION: '재회',
  CHANGE: '변화',
  TIMING: '시기',
};
const ENUM_TOKEN = new RegExp(
  `\\b(?:${Object.keys(ENUM_LABEL).sort((a, b) => b.length - a.length).join('|')})\\b`, 'g',
);

// The last-resort sweep. Only SCREAMING_SNAKE shapes are removed — an underscore makes a token an identifier
// beyond doubt, whereas a bare uppercase run can legitimately be a consumer acronym (ETF, MBTI), and every
// bare enum the engines actually emit is mapped by name above rather than guessed at here.
const RESIDUAL_IDENTIFIER = /\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/g;

// The graph's internal derivation arrow — authoring notation that reached readers inside 쉬운 설명 and
// 왜 이렇게 보나요. It carries TWO different meanings depending on where it was written: "this conflict
// resolves to" between two clauses, and "this layer acts on that position" inside a technical anchor
// ("올해 흐름 → 원국 년주 자형"). A word that reads correctly in one reads as nonsense in the other, so it
// becomes ordinary typographic separation rather than a paraphrase that would assert a relation the source
// did not — which is the same reason the fixed connectives elsewhere are never rewritten.
const DERIVATION_ARROW = /\s*→\s*/g;
const ARROW_REPLACEMENT = ' — ';

/**
 * Map every internal identifier in one user-visible string to consumer Korean. Idempotent and total: a
 * string carrying none is returned unchanged, and nothing here alters a product claim's wording.
 */
export function toConsumerIdentifiers(text: string): string {
  return text
    .replace(JUDGE_PARENTHETICAL, (m) => JUDGE_LABEL.find(([re]) => re.test(m))?.[1] ?? m)
    .replace(ENUM_TOKEN, (m) => ENUM_LABEL[m] ?? m)
    .replace(RESIDUAL_IDENTIFIER, '')
    .replace(DERIVATION_ARROW, ARROW_REPLACEMENT);
}

/**
 * THE CONSUMER DELIVERY PASS — the last thing every user-visible string goes through.
 *
 * Identifier mapping first (so a mapped Korean label is then subject to the same 조사/speech-level rules as
 * any other engine string), then the ordinary realization pass. Applied once, at the delivery seam, so no
 * caller has to remember to do it and no second copy of the mapping can drift.
 */
export function realizeForConsumer(text: string): string {
  return realize(toConsumerIdentifiers(text));
}
