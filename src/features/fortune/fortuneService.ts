import type { FortunePeriod, FortuneViewState } from './types';

// Single integration seam for the canonical fortune engine.
//
// The engine is NOT connected yet, so this always resolves to
// 'engine_unavailable'. The APP performs no fortune calculation and fabricates
// no values. When the engine ships, this is the ONE place that will return a
// real FortunePresentation (status: 'ready') per (subject, period); the UI
// already renders every state.
async function getFortune(
  _period: FortunePeriod,
  _subjectId: string | null,
): Promise<FortuneViewState> {
  return { status: 'engine_unavailable' };
}

export const fortuneService = { getFortune };
