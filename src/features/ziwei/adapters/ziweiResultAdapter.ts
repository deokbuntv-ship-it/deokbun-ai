// Raw iztro astrolabe → DeokbunAI ZiweiChart (directive §9). Pure mapping only —
// no recomputation, no interpretation, no fabricated facts. The Core's values are
// carried through 1:1; four transformations (四化) are additionally flattened with
// the palace they land in for convenient downstream evidence.
import type {
  ZiweiChart,
  ZiweiInput,
  ZiweiPalace,
  ZiweiStar,
  ZiweiStarKind,
  ZiweiTransformation,
} from '../domain/ziweiTypes';
import {
  IZTRO_VERSION,
  ZIWEI_ADAPTER_VERSION,
  ZIWEI_RULESET_VERSION,
  type RawZiweiAstrolabe,
  type RawZiweiPalace,
  type RawZiweiStar,
} from './iztroAdapter';

function mapStar(raw: RawZiweiStar, kind: ZiweiStarKind): ZiweiStar {
  return {
    name: raw.name,
    kind,
    brightness: raw.brightness,
    transformation: raw.mutagen,
  };
}

function mapPalace(raw: RawZiweiPalace): ZiweiPalace {
  const decadal =
    raw.decadal && Array.isArray(raw.decadal.range) && raw.decadal.range.length >= 2
      ? {
          range: [raw.decadal.range[0], raw.decadal.range[1]] as [number, number],
          heavenlyStem: raw.decadal.heavenlyStem,
          earthlyBranch: raw.decadal.earthlyBranch,
        }
      : undefined;
  return {
    index: raw.index,
    name: raw.name,
    earthlyBranch: raw.earthlyBranch,
    heavenlyStem: raw.heavenlyStem,
    isBodyPalace: raw.isBodyPalace,
    majorStars: (raw.majorStars ?? []).map((s) => mapStar(s, 'major')),
    minorStars: (raw.minorStars ?? []).map((s) => mapStar(s, 'minor')),
    adjectiveStars: (raw.adjectiveStars ?? []).map((s) => mapStar(s, 'adjective')),
    decadal,
  };
}

export function adaptAstrolabe(raw: RawZiweiAstrolabe, input: ZiweiInput): ZiweiChart {
  const palaces = raw.palaces.map(mapPalace);

  const transformations: ZiweiTransformation[] = [];
  for (const palace of palaces) {
    for (const star of [...palace.majorStars, ...palace.minorStars, ...palace.adjectiveStars]) {
      if (star.transformation) {
        transformations.push({
          star: star.name,
          transformation: star.transformation,
          palaceName: palace.name,
        });
      }
    }
  }

  return {
    engine: 'ziwei',
    engineVersion: ZIWEI_ADAPTER_VERSION,
    library: 'iztro',
    libraryVersion: IZTRO_VERSION,
    ruleSetVersion: ZIWEI_RULESET_VERSION,
    input,
    solarDate: raw.solarDate,
    lunarDate: raw.lunarDate,
    chineseDate: raw.chineseDate,
    timeRange: raw.timeRange,
    zodiac: raw.zodiac,
    soulPalaceBranch: raw.earthlyBranchOfSoulPalace,
    bodyPalaceBranch: raw.earthlyBranchOfBodyPalace,
    soul: raw.soul,
    body: raw.body,
    fiveElementsClass: raw.fiveElementsClass,
    palaces,
    transformations,
    warnings: [],
  };
}
