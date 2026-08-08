import type { PlaceInput } from '../domain/birth';
import type { LocalClockTime, LocalDate, TemporalContext } from '../domain/time';

export type QimenRequestBasis = 'QUESTION_TIME' | 'EVENT_TIME';

export type CanonicalEventInput = {
  date: LocalDate;
  time: LocalClockTime;
  place: PlaceInput;
  temporalContext: TemporalContext;
  reference?: {
    id?: string;
    category?: string;
  };
};

// V1.0 is event/question-time only. The orchestration layer must request Qimen
// explicitly; the engine never infers execution by inspecting question text.
export type QimenEngineInput = {
  engine: 'QIMEN';
  basis: QimenRequestBasis;
  requestedBy: 'ORCHESTRATION';
  event: CanonicalEventInput;
};
