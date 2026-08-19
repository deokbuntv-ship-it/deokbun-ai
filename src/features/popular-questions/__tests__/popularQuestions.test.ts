// Popular-questions conversion — pure contracts (Home IA sprint). Runs in the node jest env.
import { sanitizeEventProperties } from '@/services/productEvents';

import { DEFAULT_POPULAR_QUESTIONS } from '../defaults';
import { computeConversionRates, formatRate } from '../metrics';
import { popularQuestionIcon } from '../presentation';
import {
  POPULAR_QUESTION_CATEGORIES,
  POPULAR_QUESTION_CATEGORY_LABEL,
  isPopularQuestionCategory,
} from '../types';

describe('computeConversionRates — zero-denominator safety', () => {
  it('computes the four ratios from raw counts', () => {
    const r = computeConversionRates({ analyticsKey: 'k', impressions: 100, clicks: 20, starts: 10, successes: 5 });
    expect(r.ctr).toBeCloseTo(0.2);
    expect(r.startRate).toBeCloseTo(0.5);
    expect(r.successRate).toBeCloseTo(0.5);
    expect(r.endToEnd).toBeCloseTo(0.05);
  });

  it('returns null (never NaN/Infinity) for every zero denominator', () => {
    const r = computeConversionRates({ analyticsKey: 'k', impressions: 0, clicks: 0, starts: 0, successes: 0 });
    expect(r).toEqual({ ctr: null, startRate: null, successRate: null, endToEnd: null });
  });

  it('mixes present and empty denominators independently', () => {
    const r = computeConversionRates({ analyticsKey: 'k', impressions: 50, clicks: 10, starts: 0, successes: 0 });
    expect(r.ctr).toBeCloseTo(0.2); // 10/50
    expect(r.startRate).toBeCloseTo(0); // 0/10
    expect(r.successRate).toBeNull(); // 0/0 → —
    expect(r.endToEnd).toBeCloseTo(0); // 0/50
  });
});

describe('formatRate', () => {
  it('renders null as an em dash, not NaN', () => {
    expect(formatRate(null)).toBe('—');
  });
  it('renders a ratio as a one-decimal percent', () => {
    expect(formatRate(0.2)).toBe('20.0%');
    expect(formatRate(0)).toBe('0.0%');
    expect(formatRate(1)).toBe('100.0%');
  });
});

describe('DEFAULT_POPULAR_QUESTIONS — curated fallback/seed integrity', () => {
  it('is a small, non-empty set', () => {
    expect(DEFAULT_POPULAR_QUESTIONS.length).toBeGreaterThan(0);
    expect(DEFAULT_POPULAR_QUESTIONS.length).toBeLessThanOrEqual(5);
  });
  it('has unique, slug-shaped analytics keys', () => {
    const keys = DEFAULT_POPULAR_QUESTIONS.map((q) => q.analyticsKey);
    expect(new Set(keys).size).toBe(keys.length);
    keys.forEach((k) => expect(k).toMatch(/^[a-z0-9_]{1,64}$/));
  });
  it('uses only valid categories and non-empty question text', () => {
    DEFAULT_POPULAR_QUESTIONS.forEach((q) => {
      expect(isPopularQuestionCategory(q.category)).toBe(true);
      expect(q.questionText.trim().length).toBeGreaterThan(0);
    });
  });
  it('has strictly increasing display order (deterministic ordering)', () => {
    const orders = DEFAULT_POPULAR_QUESTIONS.map((q) => q.displayOrder);
    for (let i = 1; i < orders.length; i += 1) expect(orders[i]).toBeGreaterThan(orders[i - 1]);
  });
});

describe('category vocabulary', () => {
  it('accepts every known category and rejects unknowns', () => {
    POPULAR_QUESTION_CATEGORIES.forEach((c) => expect(isPopularQuestionCategory(c)).toBe(true));
    ['', 'money', 'FOO', null, 42].forEach((c) => expect(isPopularQuestionCategory(c)).toBe(false));
  });
  it('labels and icons cover every category', () => {
    POPULAR_QUESTION_CATEGORIES.forEach((c) => {
      expect(POPULAR_QUESTION_CATEGORY_LABEL[c].length).toBeGreaterThan(0);
      expect(typeof popularQuestionIcon(c)).toBe('string');
    });
  });
});

describe('funnel privacy — allowlist drops everything but categorical dimensions', () => {
  it('keeps question_key/question_category/placement/position', () => {
    const out = sanitizeEventProperties({
      question_key: 'money_flow_year',
      question_category: 'MONEY',
      placement: 'home',
      position: 2,
    });
    expect(out).toEqual({
      question_key: 'money_flow_year',
      question_category: 'MONEY',
      placement: 'home',
      position: 2,
    });
  });
  it('drops raw question text / name / birth / any non-allowlisted key', () => {
    const out = sanitizeEventProperties({
      question_key: 'k',
      question_text: '올해 재물운의 흐름은 어떻게 흐를까요?',
      name: '홍길동',
      birth: '1990-01-01',
      email: 'a@b.com',
    } as Record<string, unknown>);
    expect(out).toEqual({ question_key: 'k' });
  });
});
