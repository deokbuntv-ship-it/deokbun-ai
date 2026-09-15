export {
  POPULAR_QUESTION_CATEGORIES,
  POPULAR_QUESTION_CATEGORY_LABEL,
  isPopularQuestionCategory,
} from './types';
export type {
  AdminPopularQuestion,
  PopularQuestion,
  PopularQuestionCategory,
  PopularQuestionCounts,
  PopularQuestionInput,
} from './types';

// Seed / test-fixture / dev-seed ONLY — NOT a production runtime fallback. Production Home must never import
// this: when the authoritative DB config is unavailable the section is omitted (see resolveActivePopularQuestions).
export { DEFAULT_POPULAR_QUESTIONS } from './defaults';
export { popularQuestionIcon } from './presentation';
export { computeConversionRates, formatRate } from './metrics';
export type { PopularQuestionRates } from './metrics';

export { popularQuestionService, resolveActivePopularQuestions } from './services/popularQuestionService';

export {
  trackPopularQuestionImpression,
  trackPopularQuestionClick,
  trackPopularQuestionConsultationStart,
  trackPopularQuestionFirstAnswerSuccess,
} from './analytics';
export type { PopularQuestionPlacement } from './analytics';
