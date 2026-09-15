// Commercial-text hygiene — defense-in-depth for the user-facing consultation (V4 §8/§9/§44/§69).
// PURE. The STRUCTURED_OUTPUT_INSTRUCTION already forbids internal/developer terminology; this is the
// belt-and-suspenders the presentation layer can apply so an occasional model slip NEVER reaches a user.
//
// Two functions, deliberately conservative (제6조 — never mangle a valid answer):
//   containsInternalTerminology(text) — a DETECTOR for tests + safe diagnostics (no mutation).
//   stripEngineLabels(text)           — removes ONLY the specific, unambiguous internal LABEL patterns
//                                       ("(엔진: SAJU)", "(engine: iztro)", "(제공됨)") — never prose.

// Whole-word / labeled patterns that must never appear in a commercial answer. Anchored to avoid false
// positives on ordinary Korean prose (e.g. "제공" alone is fine; "(제공됨)" as an evidence label is not).
const INTERNAL_TERMS: readonly RegExp[] = [
  /엔진\s*[:：]/, // "엔진: SAJU"
  /\bSAJU\b/i,
  /\biztro\b/i,
  /\bgrounding\b/i,
  /\bvalidator\b/i,
  /\bschema\b/i,
  /\bOpenAI\b/i,
  /\bJSON\b/i,
  /\bLLM\b/,
  /\bV1\b/,
  /\bV2\b/,
  /\(제공됨\)/,
  /계산\s*모듈/,
  /(?:현재\s*버전|이\s*버전|V1)[^.]*계산되지\s*않/, // "이 버전에서는 …계산되지 않았습니다"
];

export function containsInternalTerminology(text: string): boolean {
  const t = text ?? '';
  return INTERNAL_TERMS.some((re) => re.test(t));
}

// Raw 천간(10) · 지지(12) hanja. These belong in the internal evidence, NOT the consumer answer (V1.4 §20):
// a live answer was observed leaking bare 寅/卯/巳 etc. This DETECTS them (for tests + safe telemetry);
// it never mutates prose (translation is the model's job, guided by the prompt).
const GANJI_HANJA = /[甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]/;

export function containsRawGanji(text: string): boolean {
  return GANJI_HANJA.test(text ?? '');
}

// Remove the specific internal LABEL patterns that are safe to strip without touching surrounding prose.
export function stripEngineLabels(text: string): string {
  return (text ?? '')
    .replace(/\s*[（(]\s*엔진\s*[:：][^）)]*[）)]/g, '') // (엔진: SAJU)
    .replace(/\s*[（(]\s*engine\s*[:：][^）)]*[）)]/gi, '') // (engine: iztro)
    .replace(/\s*[（(]\s*제공됨\s*[）)]/g, '') // (제공됨)
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

// AUDIT-DRIVEN REMEDIATION V1 §11 — a bounded, targeted hygiene check for KNOWN prompt-scaffolding artifacts
// the independent review actually observed leaking into user-facing prose ("올해(예시로 제시된 해)",
// stray English connectors like "also"). Deliberately narrow: this is defense-in-depth for a small, named
// list of patterns, not a language-cleanup subsystem — the prompt itself is the primary defense.
const SCAFFOLDING_PATTERNS: readonly RegExp[] = [
  /\s*[（(]\s*예시로\s*제시된\s*해\s*[）)]/g, // "(예시로 제시된 해)"
  /\s*[（(]\s*example\s*year\s*[）)]/gi,
  /\balso\b/gi, // a stray leaked English connector
];

export function containsPromptScaffolding(text: string): boolean {
  const t = text ?? '';
  return SCAFFOLDING_PATTERNS.some((re) => new RegExp(re.source, re.flags.replace('g', '')).test(t));
}

export function stripPromptScaffolding(text: string): string {
  let out = text ?? '';
  for (const re of SCAFFOLDING_PATTERNS) out = out.replace(re, '');
  return out.replace(/[ \t]{2,}/g, ' ').trim();
}
