// Runtime-neutral server barrel for 오늘의 운세 — re-exported from the chat server graph so the Edge bundle
// (build.mjs, entry chat/server/index.ts) includes it. No new external dependency is introduced.
export {
  buildTodayFortune,
  parseDailyFortune,
  type TodayFortuneRequest,
  type TodayFortuneDeps,
  type TodayFortuneServerResult,
} from './buildTodayFortune';
export { DAILY_FORTUNE_JSON_SCHEMA, dailyFortuneResponseFormat } from './todayFortuneSchema';
export { buildTodayFortunePrompt, TODAY_PROMPT_VERSION } from './todayFortunePrompt';
