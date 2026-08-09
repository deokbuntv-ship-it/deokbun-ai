import type {
  EarthlyBranch,
  ExactLocalCivilTime,
  HeavenlyStem,
} from '../contracts';

export type HourPillarGoldenFixture = {
  dayStem: HeavenlyStem;
  localTime: ExactLocalCivilTime;
  expectedStem: HeavenlyStem;
  expectedBranch: EarthlyBranch;
  provenance: 'DEOKBUNAI_SAJU_V1_PRODUCT_RULE';
};

export const HOUR_PILLAR_GOLDEN_FIXTURES: readonly HourPillarGoldenFixture[] = [
  { dayStem: 'JIA', localTime: { hour: 23, minute: 30, second: 0 }, expectedStem: 'JIA', expectedBranch: 'ZI', provenance: 'DEOKBUNAI_SAJU_V1_PRODUCT_RULE' },
  { dayStem: 'JIA', localTime: { hour: 1, minute: 30, second: 0 }, expectedStem: 'YI', expectedBranch: 'CHOU', provenance: 'DEOKBUNAI_SAJU_V1_PRODUCT_RULE' },
  { dayStem: 'JIA', localTime: { hour: 3, minute: 30, second: 0 }, expectedStem: 'BING', expectedBranch: 'YIN', provenance: 'DEOKBUNAI_SAJU_V1_PRODUCT_RULE' },
  { dayStem: 'JI', localTime: { hour: 23, minute: 30, second: 0 }, expectedStem: 'JIA', expectedBranch: 'ZI', provenance: 'DEOKBUNAI_SAJU_V1_PRODUCT_RULE' },
  { dayStem: 'YI', localTime: { hour: 23, minute: 30, second: 0 }, expectedStem: 'BING', expectedBranch: 'ZI', provenance: 'DEOKBUNAI_SAJU_V1_PRODUCT_RULE' },
  { dayStem: 'GENG', localTime: { hour: 23, minute: 30, second: 0 }, expectedStem: 'BING', expectedBranch: 'ZI', provenance: 'DEOKBUNAI_SAJU_V1_PRODUCT_RULE' },
  { dayStem: 'BING', localTime: { hour: 23, minute: 30, second: 0 }, expectedStem: 'WU', expectedBranch: 'ZI', provenance: 'DEOKBUNAI_SAJU_V1_PRODUCT_RULE' },
  { dayStem: 'XIN', localTime: { hour: 23, minute: 30, second: 0 }, expectedStem: 'WU', expectedBranch: 'ZI', provenance: 'DEOKBUNAI_SAJU_V1_PRODUCT_RULE' },
  { dayStem: 'DING', localTime: { hour: 23, minute: 30, second: 0 }, expectedStem: 'GENG', expectedBranch: 'ZI', provenance: 'DEOKBUNAI_SAJU_V1_PRODUCT_RULE' },
  { dayStem: 'REN', localTime: { hour: 23, minute: 30, second: 0 }, expectedStem: 'GENG', expectedBranch: 'ZI', provenance: 'DEOKBUNAI_SAJU_V1_PRODUCT_RULE' },
  { dayStem: 'WU', localTime: { hour: 23, minute: 30, second: 0 }, expectedStem: 'REN', expectedBranch: 'ZI', provenance: 'DEOKBUNAI_SAJU_V1_PRODUCT_RULE' },
  { dayStem: 'GUI', localTime: { hour: 23, minute: 30, second: 0 }, expectedStem: 'REN', expectedBranch: 'ZI', provenance: 'DEOKBUNAI_SAJU_V1_PRODUCT_RULE' },
];

export type HourBranchBoundaryFixture = {
  localTime: ExactLocalCivilTime;
  expectedBranch: EarthlyBranch;
};

export const HOUR_BRANCH_BOUNDARY_FIXTURES: readonly HourBranchBoundaryFixture[] = [
  { localTime: { hour: 22, minute: 59, second: 59 }, expectedBranch: 'HAI' },
  { localTime: { hour: 23, minute: 0, second: 0 }, expectedBranch: 'ZI' },
  { localTime: { hour: 23, minute: 59, second: 59 }, expectedBranch: 'ZI' },
  { localTime: { hour: 0, minute: 0, second: 0 }, expectedBranch: 'ZI' },
  { localTime: { hour: 0, minute: 59, second: 59 }, expectedBranch: 'ZI' },
  { localTime: { hour: 1, minute: 0, second: 0 }, expectedBranch: 'CHOU' },
  { localTime: { hour: 3, minute: 0, second: 0 }, expectedBranch: 'YIN' },
  { localTime: { hour: 5, minute: 0, second: 0 }, expectedBranch: 'MAO' },
  { localTime: { hour: 7, minute: 0, second: 0 }, expectedBranch: 'CHEN' },
  { localTime: { hour: 9, minute: 0, second: 0 }, expectedBranch: 'SI' },
  { localTime: { hour: 11, minute: 0, second: 0 }, expectedBranch: 'WU' },
  { localTime: { hour: 13, minute: 0, second: 0 }, expectedBranch: 'WEI' },
  { localTime: { hour: 15, minute: 0, second: 0 }, expectedBranch: 'SHEN' },
  { localTime: { hour: 17, minute: 0, second: 0 }, expectedBranch: 'YOU' },
  { localTime: { hour: 19, minute: 0, second: 0 }, expectedBranch: 'XU' },
  { localTime: { hour: 21, minute: 0, second: 0 }, expectedBranch: 'HAI' },
];
