import type { ConsultationSubjectRecord } from '@/features/consultation';
import {
  ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER,
  DEOKBUNAI_SAJU_RULE_SET_VERSION,
  executeSajuFromBirthInput,
} from '@/features/interpretation';

import type { ManseBirthDisplay, ManseView } from '../types';
import { toSajuEngineInput } from './birthInputMapper';
import { expoCryptoDigestProvider } from './digestProvider';
import {
  manseViewFromBridgeFailure,
  manseViewFromEngineResult,
} from './manseAdapter';

// APP integration orchestrator. UI components never call the ENGINE directly:
//   Saved Subject BirthInfo -> birthInputMapper -> executeSajuFromBirthInput
//   -> SajuEngineResult -> manseAdapter -> ManseView.
// READ ONLY: never mutates the subject/draft/conversation.

// Raw subject display (name/isSelf/relationship + raw birth fields). Identity
// metadata comes from the record, not from the ENGINE fingerprint.
function toManseBirthDisplay(
  record: ConsultationSubjectRecord,
): ManseBirthDisplay {
  const birthInfo = record.birthInfo;
  return {
    displayName: record.displayName,
    isSelf: record.isSelf,
    relationship: record.relationship,
    gender: birthInfo.gender,
    calendarType: birthInfo.calendarType,
    lunarMonthType: birthInfo.lunarMonthType,
    birthYear: birthInfo.birthYear,
    birthMonth: birthInfo.birthMonth,
    birthDay: birthInfo.birthDay,
    birthTimeAccuracy: birthInfo.birthTimeAccuracy,
    birthHour: birthInfo.birthHour,
    birthMinute: birthInfo.birthMinute,
    approximateTimePeriod: birthInfo.approximateTimePeriod,
    birthPlace: birthInfo.birthPlace,
  };
}

// In-memory cache of the ENGINE-derived part ONLY, keyed by the ENGINE's
// normalized birth fingerprint + rule-set version (§11). The birth display is
// intentionally excluded so two subjects that share identical birth data (same
// fingerprint) never show each other's name/relationship. BirthInfo edits change
// the fingerprint -> cache miss -> no stale result. ENGINE rule-set version bump
// changes the key -> recompute. No DB cache.
type EngineDerivedView = Omit<ManseView, 'birth'>;

const engineViewCache = new Map<string, EngineDerivedView>();

function withBirth(
  engineView: EngineDerivedView,
  birth: ManseBirthDisplay,
): ManseView {
  return { ...engineView, birth };
}

export async function getManseView(
  record: ConsultationSubjectRecord,
): Promise<ManseView> {
  const birth = toManseBirthDisplay(record);
  const input = toSajuEngineInput(record.birthInfo);

  // Inject the ENGINE's public Asia/Seoul historical timezone resolver (ENGINE-10C)
  // and the crypto DigestProvider. The APP re-implements neither — offset/DST and
  // fingerprint framing are ENGINE-owned.
  const execution = await executeSajuFromBirthInput(input, {
    digestProvider: expoCryptoDigestProvider,
    historicalTimezoneResolver: ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER,
  });

  // Normalization/fingerprint stage failure (invalid date, unsupported range,
  // etc.) — not cached; present as unavailable with the current birth display.
  if (!execution.success) {
    return manseViewFromBridgeFailure(birth, execution);
  }

  const cacheKey = `${execution.normalizedBirthFingerprint.value}|${DEOKBUNAI_SAJU_RULE_SET_VERSION}`;
  const cached = engineViewCache.get(cacheKey);
  if (cached !== undefined) {
    return withBirth(cached, birth);
  }

  const view = manseViewFromEngineResult(birth, execution.engineResult);
  const { birth: _birth, ...engineView } = view;
  engineViewCache.set(cacheKey, engineView);
  return view;
}
