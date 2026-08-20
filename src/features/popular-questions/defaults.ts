import type { PopularQuestion } from './types';

// The canonical curated set of popular consultation questions — SEED / TEST-FIXTURE / DEV-SEED ONLY.
//
// This is the source for the OWNER_APPLY migration seed (same analyticsKey / text / category / order) and for
// tests. It is NOT a production runtime fallback: production Home treats the DB as the single source of truth
// and OMITS the popular-question section when the config cannot be loaded (see resolveActivePopularQuestions).
// Keeping the seed keys identical to these means the DB rows the migration inserts carry the same stable
// analyticsKeys, so the conversion funnel is continuous from first deploy.
//
// Curation rules (§ sprint): concise, high-intent, decision/guidance-oriented. NO fear-based or dark-pattern
// framing — the wellbeing question asks how to *manage* condition, never what to *fear*.
export const DEFAULT_POPULAR_QUESTIONS: readonly PopularQuestion[] = [
  { id: 'default-money-flow-year', analyticsKey: 'money_flow_year', category: 'MONEY', displayOrder: 10, questionText: '올해 재물운의 흐름은 어떻게 흐를까요?' },
  { id: 'default-career-move-timing', analyticsKey: 'career_move_timing', category: 'CAREER', displayOrder: 20, questionText: '지금 이직이나 커리어 변화를 준비해도 될까요?' },
  { id: 'default-biggest-change-year', analyticsKey: 'biggest_change_year', category: 'CHANGE', displayOrder: 30, questionText: '올해 나에게 찾아올 가장 큰 변화는 무엇일까요?' },
  { id: 'default-new-relationship', analyticsKey: 'new_relationship', category: 'LOVE', displayOrder: 40, questionText: '새로운 인연을 만날 수 있을까요?' },
  { id: 'default-wellbeing-care', analyticsKey: 'wellbeing_care', category: 'WELLBEING', displayOrder: 50, questionText: '요즘 건강과 컨디션은 어떻게 관리하면 좋을까요?' },
];
