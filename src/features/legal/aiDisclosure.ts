// Shared AI-generated-content disclosure (Sprint J2 §2). ONE canonical wording, reused across every consumer
// surface that shows AI output (general consultation, compatibility, today, monthly, report). Do NOT fork the
// wording per screen — import from here. This is a consumer trust/honesty surface, not engine/prompt logic.

/** Full disclosure — the required meaning. Used inline under AI results and on the 안내 surface. */
export const AI_DISCLOSURE_TEXT =
  '덕분이는 AI를 활용해 해석과 상담을 제공합니다. AI가 생성한 내용은 부정확하거나 실제 결과와 다를 수 있으며, ' +
  '중요한 결정은 현실적인 상황과 전문적인 정보를 함께 확인해야 합니다.';

/** Compact one-liner for tight spaces (e.g. under a small fortune card). Same meaning, shorter. */
export const AI_DISCLOSURE_SHORT = 'AI가 생성한 해석으로, 실제와 다를 수 있어요. 중요한 결정은 신중히 판단해 주세요.';

/** Versioned so a material wording change is trackable alongside the legal documents. */
export const AI_DISCLOSURE_VERSION = 'ai-disclosure@2026-08-1';

/** Structured content for the standalone "AI 생성 콘텐츠 안내" surface (§16). Display-only, no legal guarantees. */
export const AI_DISCLOSURE_DOC = {
  key: 'ai' as const,
  title: 'AI 생성 콘텐츠 안내',
  version: AI_DISCLOSURE_VERSION,
  updatedLabel: '2026년 8월 기준',
  intro: [AI_DISCLOSURE_TEXT],
  sections: [
    {
      heading: 'AI를 어떻게 활용하나요?',
      paragraphs: [
        '덕분이는 사주·명리 등 전통 명리 계산 결과를 바탕으로, AI가 이를 사람이 읽기 쉬운 해석과 상담 형태로 정리해 제공합니다.',
      ],
    },
    {
      heading: '무엇을 유의해야 하나요?',
      bullets: [
        'AI가 생성한 해석은 참고 정보이며, 미래를 보장하거나 예언하지 않습니다.',
        '같은 질문이라도 표현이나 강조점이 달라질 수 있습니다.',
        '건강·법률·투자 등 중대한 판단의 단독 근거로 사용하지 마세요.',
        '중요한 결정은 현실적인 상황과 전문가의 조언을 함께 확인하는 것이 좋습니다.',
      ],
    },
  ],
};
