import type { SolarTermDefinition, SolarTermId } from './contracts';

export const SOLAR_TERM_DEFINITIONS = [
  { termId: 'MINOR_COLD', koreanName: '소한', solarLongitudeDegrees: 285, kind: 'JIE', gregorianOrder: 0 },
  { termId: 'MAJOR_COLD', koreanName: '대한', solarLongitudeDegrees: 300, kind: 'ZHONGQI', gregorianOrder: 1 },
  { termId: 'START_OF_SPRING', koreanName: '입춘', solarLongitudeDegrees: 315, kind: 'JIE', gregorianOrder: 2 },
  { termId: 'RAIN_WATER', koreanName: '우수', solarLongitudeDegrees: 330, kind: 'ZHONGQI', gregorianOrder: 3 },
  { termId: 'AWAKENING_OF_INSECTS', koreanName: '경칩', solarLongitudeDegrees: 345, kind: 'JIE', gregorianOrder: 4 },
  { termId: 'SPRING_EQUINOX', koreanName: '춘분', solarLongitudeDegrees: 0, kind: 'ZHONGQI', gregorianOrder: 5 },
  { termId: 'PURE_BRIGHTNESS', koreanName: '청명', solarLongitudeDegrees: 15, kind: 'JIE', gregorianOrder: 6 },
  { termId: 'GRAIN_RAIN', koreanName: '곡우', solarLongitudeDegrees: 30, kind: 'ZHONGQI', gregorianOrder: 7 },
  { termId: 'START_OF_SUMMER', koreanName: '입하', solarLongitudeDegrees: 45, kind: 'JIE', gregorianOrder: 8 },
  { termId: 'GRAIN_FULL', koreanName: '소만', solarLongitudeDegrees: 60, kind: 'ZHONGQI', gregorianOrder: 9 },
  { termId: 'GRAIN_IN_EAR', koreanName: '망종', solarLongitudeDegrees: 75, kind: 'JIE', gregorianOrder: 10 },
  { termId: 'SUMMER_SOLSTICE', koreanName: '하지', solarLongitudeDegrees: 90, kind: 'ZHONGQI', gregorianOrder: 11 },
  { termId: 'MINOR_HEAT', koreanName: '소서', solarLongitudeDegrees: 105, kind: 'JIE', gregorianOrder: 12 },
  { termId: 'MAJOR_HEAT', koreanName: '대서', solarLongitudeDegrees: 120, kind: 'ZHONGQI', gregorianOrder: 13 },
  { termId: 'START_OF_AUTUMN', koreanName: '입추', solarLongitudeDegrees: 135, kind: 'JIE', gregorianOrder: 14 },
  { termId: 'END_OF_HEAT', koreanName: '처서', solarLongitudeDegrees: 150, kind: 'ZHONGQI', gregorianOrder: 15 },
  { termId: 'WHITE_DEW', koreanName: '백로', solarLongitudeDegrees: 165, kind: 'JIE', gregorianOrder: 16 },
  { termId: 'AUTUMN_EQUINOX', koreanName: '추분', solarLongitudeDegrees: 180, kind: 'ZHONGQI', gregorianOrder: 17 },
  { termId: 'COLD_DEW', koreanName: '한로', solarLongitudeDegrees: 195, kind: 'JIE', gregorianOrder: 18 },
  { termId: 'FROST_DESCENT', koreanName: '상강', solarLongitudeDegrees: 210, kind: 'ZHONGQI', gregorianOrder: 19 },
  { termId: 'START_OF_WINTER', koreanName: '입동', solarLongitudeDegrees: 225, kind: 'JIE', gregorianOrder: 20 },
  { termId: 'MINOR_SNOW', koreanName: '소설', solarLongitudeDegrees: 240, kind: 'ZHONGQI', gregorianOrder: 21 },
  { termId: 'MAJOR_SNOW', koreanName: '대설', solarLongitudeDegrees: 255, kind: 'JIE', gregorianOrder: 22 },
  { termId: 'WINTER_SOLSTICE', koreanName: '동지', solarLongitudeDegrees: 270, kind: 'ZHONGQI', gregorianOrder: 23 },
] as const satisfies readonly SolarTermDefinition[];

export const SOLAR_TERM_IDS = SOLAR_TERM_DEFINITIONS.map(
  (definition) => definition.termId,
) as readonly SolarTermId[];

export const JIE_SOLAR_TERM_IDS = SOLAR_TERM_DEFINITIONS.filter(
  (definition) => definition.kind === 'JIE',
).map((definition) => definition.termId) as readonly SolarTermId[];

export function getSolarTermDefinition(
  termId: SolarTermId,
): SolarTermDefinition {
  const definition = SOLAR_TERM_DEFINITIONS.find((item) => item.termId === termId);
  if (!definition) {
    throw new Error(`Unknown solar term id: ${termId}`);
  }
  return definition;
}
