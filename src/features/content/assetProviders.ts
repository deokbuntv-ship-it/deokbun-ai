import type { AssetGenerationStatus, AssetKind } from './types';

// Provider-neutral generation status. AI image/video generation requires a
// provider the OWNER must choose (cost/lock-in) plus a generation Edge Function.
// Until then, generation is PROVIDER_NOT_CONFIGURED — never faked. Manual attach
// (operator-hosted URL) is always available and independent of this.
//
// When a provider is later configured server-side, flip the relevant entry to
// 'AVAILABLE' and route generation through its edge/adapter.
const GENERATION_STATUS: Record<AssetKind, AssetGenerationStatus> = {
  image: 'PROVIDER_NOT_CONFIGURED',
  video: 'PROVIDER_NOT_CONFIGURED',
};

export function generationStatus(kind: AssetKind): AssetGenerationStatus {
  return GENERATION_STATUS[kind];
}
