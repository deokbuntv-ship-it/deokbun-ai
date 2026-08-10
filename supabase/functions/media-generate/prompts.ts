// DeokbunAI — versioned image prompt templates (server-side ONLY).
//
// The client sends a short SUBJECT (auto-suggested from content context) + category
// + targetUse; this module wraps it in the DeokbunAI brand style and IP/likeness
// guardrails. Brand style lives here (not scattered in domain/UI) and is versioned.

export const IMAGE_PROMPT_VERSION = 'deokbunai.image-standard.v1';

const BRAND_STYLE =
  'premium modern Korean editorial aesthetic, sophisticated, clean minimal composition, tasteful lighting, realistic where appropriate, mobile-friendly framing';

// Baseline negatives (keep myeongri/fortune content classy, avoid kitsch).
const NEGATIVE =
  'avoid: tacky fortune-teller shop signage, shamanistic ritual mood, excessive talismans, chinese-fantasy kitsch, excessive gold, garish colors, low-quality stock-photo look, watermarks, text artifacts';

// Hard IP / likeness guardrail — never auto-insert third-party IP or a real
// person's face. Editorial/conceptual imagery only.
const IP_GUARD =
  'do NOT depict any real person\'s recognizable face or likeness, no celebrity likeness, no copyrighted characters, no brand logos or trademarks; use generic, symbolic, editorial imagery only';

function categoryHint(category: string | undefined): string {
  switch (category) {
    case 'saju':
    case 'luck':
      return 'subtle traditional Korean motifs interpreted in a refined modern way';
    case 'ziwei':
      return 'elegant celestial/constellation motifs, refined and modern';
    case 'qimen':
      return 'abstract geometric/directional motifs, refined and modern';
    case 'famous':
      return 'editorial conceptual portrait-style composition WITHOUT a real identifiable face';
    default:
      return 'clean editorial concept imagery';
  }
}

export function buildImagePrompt(vars: {
  subject?: string;
  category?: string;
  targetUse?: string;
}): string {
  const subject =
    vars.subject && vars.subject.trim().length > 0
      ? vars.subject.trim()
      : '한국 운세/명리 콘텐츠를 위한 세련된 개념 이미지';
  const use = vars.targetUse ? `intended use: ${vars.targetUse}.` : '';
  return [
    subject,
    `Style: ${BRAND_STYLE}.`,
    categoryHint(vars.category) + '.',
    use,
    NEGATIVE + '.',
    IP_GUARD + '.',
  ]
    .filter((p) => p.length > 0)
    .join(' ');
}

// Non-cryptographic prompt fingerprint for provenance (djb2).
export function promptHash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(16);
}
