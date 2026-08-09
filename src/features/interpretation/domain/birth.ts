import type { BirthTimeInput, LocalDate, TemporalContext } from './time';

export type BirthCalendarDate = LocalDate &
  (
    | { calendar: 'GREGORIAN' }
    | {
        calendar: 'LUNAR';
        lunarMonthKind: 'REGULAR' | 'LEAP';
      }
  );

export type GeographicCoordinates = {
  latitude: number;
  longitude: number;
};

export type PlaceInput = {
  label?: string;
  countryCode?: string;
  administrativeArea?: string;
  locality?: string;
  coordinates?: GeographicCoordinates;
};

export type CanonicalBirthInput = {
  date: BirthCalendarDate;
  time: BirthTimeInput;
  place: PlaceInput;
  temporalContext: TemporalContext;
  gender: 'MALE' | 'FEMALE' | 'UNSPECIFIED';
};
