// 유명인 서버 그래프 — `supabase/functions/famous-compose` 번들의 엔트리.
//
// ⚠ chat Edge 의 번들(`chat/_server/serverBundle.mjs`)을 쓰지 않고 **별도 번들**을 만드는 이유:
// 그 번들의 엔트리는 `src/features/chat/server/index.ts` 이고 그 경로는 **frozen** 이다. 여기에
// 필요한 것을 export 하려고 그 파일을 건드리면 상담 파이프라인의 freeze 가드를 흔든다.
// 엔트리를 새로 만드는 쪽이 기존 코드를 한 줄도 안 건드리면서 같은 결과를 준다.
export { buildFamousChart, FAMOUS_CHART_VERSION } from './famousChart';
export type { FamousChartSnapshot, FamousChartResult } from './famousChart';
export {
  FAMOUS_BODY_PROMPT_VERSION,
  FAMOUS_BODY_SYSTEM_PROMPT,
  FAMOUS_BODY_SECTION_TITLES,
  buildFamousBodyUserPrompt,
  composeFamousBody,
  clampSemicolons,
  checkFamousBody,
  unsourcedSections,
  leakySources,
  contradictsChart,
  checkRelationClaims,
  unverifiedRelationClaims,
  checkRevealedClaims,
  checkRootingClaims,
  unverifiedFactClaims,
  checkChartFacts,
  selfContradictions,
  phaseDirectionErrors,
  sentenceDefects,
  citationCount,
  claimCoverage,
  ungloassedTerms,
  repeatedOpenings,
} from './famousBodyPrompt';
export type { FamousBodySections, BodyViolation } from './famousBodyPrompt';
