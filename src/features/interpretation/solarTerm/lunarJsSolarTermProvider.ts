import { Solar } from 'lunar-javascript';
import { createLunarJsSolarTermAdapter } from './lunarJsSolarTermAdapter';

/**
 * The only production boundary allowed to import lunar-javascript.
 * Calendar, Four Pillars, EightChar, Yun, and DaYun remain outside this adapter.
 */
export const LUNAR_JS_SOLAR_TERM_ADAPTER = createLunarJsSolarTermAdapter({
  Solar,
});
