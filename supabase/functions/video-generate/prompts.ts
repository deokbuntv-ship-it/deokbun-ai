// DeokbunAI — versioned VIDEO prompt templates (server-side ONLY).
// Client sends a short subject (auto-suggested from content); this wraps it in the
// brand cinematic style + IP/likeness guardrails. Versioned for provenance.

export const VIDEO_PROMPT_VERSION = 'deokbunai.video-standard.v1';

const BRAND_STYLE =
  'premium modern Korean editorial cinematic aesthetic, sophisticated, clean composition, restrained tasteful motion, mobile-first vertical framing where applicable, readable visual storytelling';

const NEGATIVE =
  'avoid: tacky fortune-teller shop ads, excessive talismans, shamanistic ritual mood, chinese-fantasy kitsch, excessive gold, garish colors, low-quality stock-video look, on-screen text artifacts';

const IP_GUARD =
  'do NOT depict any real person\'s recognizable face or likeness, no celebrity likeness, no copyrighted characters, no brand logos or trademarks, no specific artist/director signature style; use generic symbolic editorial imagery only';

export function buildVideoPrompt(vars: {
  subject?: string;
  category?: string;
  targetUse?: string;
}): string {
  const subject =
    vars.subject && vars.subject.trim().length > 0
      ? vars.subject.trim()
      : '한국 운세/명리 콘텐츠를 위한 세련된 짧은 개념 영상';
  const use = vars.targetUse ? `intended use: ${vars.targetUse}.` : '';
  return [subject, `Style: ${BRAND_STYLE}.`, use, NEGATIVE + '.', IP_GUARD + '.']
    .filter((p) => p.length > 0)
    .join(' ');
}

export function promptHash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(16);
}
