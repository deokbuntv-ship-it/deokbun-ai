export { todayFortuneService, type EnsureTodayOutcome } from './services/todayFortuneService';
export {
  toTodayPreview,
  toTodayDetailView,
  toneVariant,
  statusVariant,
  isForFortuneDate,
  type TodayPreview,
  type TodayDetailView,
  type ToneVariant,
  type StatusVariant,
  type DomainSignalView,
} from './presentation/todayView';
export { trackTodayEvent } from './analytics';
export { clientTodayFortuneDateGuess, formatFortuneDateLabel } from './engine/fortuneDate';
export { TODAY_DOMAIN_LABEL, type DailyFollowUp, type DailyFortuneRecord, type DailyFortuneResult, type DailyOverallTone } from './types';
