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

export { DEFAULT_POPULAR_QUESTIONS } from './defaults';
export { popularQuestionIcon } from './presentation';
export { computeConversionRates, formatRate } from './metrics';
export type { PopularQuestionRates } from './metrics';

export { popularQuestionService } from './services/popularQuestionService';

export {
  trackPopularQuestionImpression,
  trackPopularQuestionClick,
  trackPopularQuestionConsultationStart,
  trackPopularQuestionFirstAnswerSuccess,
} from './analytics';
export type { PopularQuestionPlacement } from './analytics';
