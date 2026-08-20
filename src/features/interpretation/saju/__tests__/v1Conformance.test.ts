import { Solar } from 'lunar-javascript';

import { DEOKBUNAI_SAJU_V1_RULE_PROFILE } from '../../contracts/sajuRules';
import type { LunarJsPublicApi } from '../../solarTerm/lunarJsSolarTermAdapter';
import { validateDayPillarInvariants } from '../dayPillarValidation';
import { DEOKBUNAI_SAJU_DAY_V1_RULE } from '../dayPillar';
import { validateSajuDaewoon } from '../daewoon/validation';
import { resolveHourBranch, DEOKBUNAI_SAJU_HOUR_V1_RULE } from '../hourPillar';
import { validateHourPillarInvariants } from '../hourPillarValidation';

describe('Saju/Myungri V1 conformance matrix', () => {
  it('pins the 23:xx Zi-hour policy without moving the day pillar before civil midnight', () => {
    expect(DEOKBUNAI_SAJU_DAY_V1_RULE.dayBoundary).toBe('CIVIL_MIDNIGHT');
    expect(DEOKBUNAI_SAJU_HOUR_V1_RULE.ziHourRange).toBe('23:00:00..00:59:59');
    expect(resolveHourBranch({ hour: 22, minute: 59, second: 59 })).toMatchObject({ ok: true, value: 'HAI' });
    expect(resolveHourBranch({ hour: 23, minute: 0, second: 0 })).toMatchObject({ ok: true, value: 'ZI' });
    expect(resolveHourBranch({ hour: 23, minute: 59, second: 59 })).toMatchObject({ ok: true, value: 'ZI' });
    expect(resolveHourBranch({ hour: 0, minute: 0, second: 0 })).toMatchObject({ ok: true, value: 'ZI' });
    expect(resolveHourBranch({ hour: 1, minute: 0, second: 0 })).toMatchObject({ ok: true, value: 'CHOU' });
  });

  it('pins year/month, leap-month, timezone-facing, and true-solar-time product rules', () => {
    expect(DEOKBUNAI_SAJU_V1_RULE_PROFILE).toMatchObject({
      yearPillarRule: 'SOLAR_TERM_START_OF_SPRING',
      monthPillarRule: 'SOLAR_TERM_TWELVE_JIE',
      leapMonthRule: 'LEAP_MONTH_SAME_ORDINAL',
      dayBoundaryRule: 'CIVIL_MIDNIGHT',
      trueSolarTimeRule: 'DO_NOT_APPLY',
    });
    expect(DEOKBUNAI_SAJU_HOUR_V1_RULE.timeBasis).toBe('LOCAL_CIVIL_TIME');
  });

  it('executes the exhaustive day/hour invariant suites', () => {
    expect(validateDayPillarInvariants()).toMatchObject({ ok: true, continuityMismatches: 0, jdnOracleMismatches: 0 });
    expect(validateHourPillarInvariants()).toMatchObject({
      ok: true, minuteCoverage: 1440, dayStemHourBranchCombinations: 120, validPillarCombinations: 120,
    });
  });

  it('executes Daewoon forward/reverse, starting-age, boundary, and repeatability goldens', () => {
    const report = validateSajuDaewoon({ Solar } as unknown as LunarJsPublicApi);
    expect(report).toEqual({
      ok: true,
      failures: [],
      goldenMatches: 2,
      directionRuleCases: 4,
      progressionCases: 2,
      boundaryPolicyCases: 5,
      capabilityCases: 7,
      deterministicRepeatabilityCases: 2,
    });
  });
});
