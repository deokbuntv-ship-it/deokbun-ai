import type { FortuneViewState } from './types';

// Single integration seam for the canonical daily-fortune engine.
//
// The engine is NOT connected yet, so this resolves to 'engine_unavailable'.
// The APP performs no fortune calculation and fabricates no values. When the
// engine ships, this is the ONE place that will return a real
// DailyFortunePresentation (status: 'ready'); the UI already renders that state.
async function getDailyFortune(): Promise<FortuneViewState> {
  return { status: 'engine_unavailable' };
}

export const fortuneService = { getDailyFortune };
