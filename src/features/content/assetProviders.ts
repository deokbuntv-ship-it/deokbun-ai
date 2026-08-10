import type {
  AssetGenerationStatus,
  AssetKind,
  ImageWorkload,
  ImageWorkloadStatus,
} from './types';

// Provider-neutral generation status. The concrete provider is resolved
// server-side; this only reflects whether a workload is usable (owner decision).
//
// IMAGE_STANDARD is configured (OpenAI/LOW). IMAGE_PREMIUM is a future seam.
// Video generation still has no provider selected. No status is ever faked.
const IMAGE_WORKLOAD_STATUS: Record<ImageWorkload, ImageWorkloadStatus> = {
  IMAGE_STANDARD: 'AVAILABLE',
  IMAGE_PREMIUM: 'NOT_CONFIGURED',
};

export function imageWorkloadStatus(
  workload: ImageWorkload,
): ImageWorkloadStatus {
  return IMAGE_WORKLOAD_STATUS[workload];
}

// Video (and any non-image kind) generation — no provider configured yet.
const KIND_GENERATION_STATUS: Record<AssetKind, AssetGenerationStatus> = {
  image: 'AVAILABLE',
  video: 'PROVIDER_NOT_CONFIGURED',
};

export function generationStatus(kind: AssetKind): AssetGenerationStatus {
  return KIND_GENERATION_STATUS[kind];
}
