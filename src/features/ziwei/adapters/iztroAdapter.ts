// ⚠️ THE ONLY FILE IN DeokbunAI THAT IMPORTS `iztro`.
//
// All iztro coupling is isolated here (directive §6/§17). Everything above this
// file speaks DeokbunAI's own domain types. Swapping/upgrading the Core touches
// only this adapter. No node_modules patching (§17): compatibility fixes live in
// this wrapper. Deterministic: iztro is pure calc — no network/LLM/DB (§19).
import { astro } from 'iztro';

import type { ZiweiInput } from '../domain/ziweiTypes';

// Version tracking (directive §18). IZTRO_VERSION must match the exact pin in
// package.json ("iztro": "2.5.8"). ruleSet = iztro's DEFAULT algorithm at that
// pinned version (documented in docs/ZIWEI_SCHOOL_DIFFERENCES.md). We intentionally
// do NOT call astro.config() — iztro's global config would be a shared side effect;
// the version pin fixes the default rule set deterministically.
export const IZTRO_VERSION = '2.5.8';
export const ZIWEI_ADAPTER_VERSION = '1.0.0';
export const ZIWEI_RULESET_VERSION = `iztro-default@${IZTRO_VERSION}`;
export const ZIWEI_OUTPUT_LANGUAGE = 'ko-KR';

// Narrow raw shapes — the subset of the iztro astrolabe DeokbunAI consumes. The
// result adapter reads THESE, so it never imports iztro types either.
export type RawZiweiStar = {
  name: string;
  type: string;
  brightness?: string;
  mutagen?: string;
};

export type RawZiweiPalace = {
  index: number;
  name: string;
  earthlyBranch: string;
  heavenlyStem: string;
  isBodyPalace: boolean;
  majorStars: RawZiweiStar[];
  minorStars: RawZiweiStar[];
  adjectiveStars: RawZiweiStar[];
  decadal?: { range: number[]; heavenlyStem: string; earthlyBranch: string };
};

export type RawZiweiAstrolabe = {
  solarDate: string;
  lunarDate: string;
  chineseDate: string;
  timeRange: string;
  zodiac?: string;
  earthlyBranchOfSoulPalace: string;
  earthlyBranchOfBodyPalace: string;
  soul: string;
  body: string;
  fiveElementsClass: string;
  palaces: RawZiweiPalace[];
};

// Cast a natal astrolabe from a normalized solar input. `fixLeap: true` uses
// iztro's default leap-month adjustment (documented). Throws on Core failure —
// the service maps that to a `calculation_failed` availability (never a guess).
export function castAstrolabe(input: ZiweiInput): RawZiweiAstrolabe {
  const chart = astro.bySolar(
    input.solarDate,
    input.timeIndex,
    input.gender,
    true,
    ZIWEI_OUTPUT_LANGUAGE,
  );
  return chart as unknown as RawZiweiAstrolabe;
}
