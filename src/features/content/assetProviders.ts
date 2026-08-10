import type {
  AssetGenerationStatus,
  AssetKind,
  ImageWorkload,
  ImageWorkloadStatus,
  VideoWorkload,
  VideoWorkloadStatus,
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

// VIDEO_STANDARD is configured (Google Veo, server-resolved). VIDEO_PREMIUM is a
// future seam. The edge still fail-closes if GEMINI_API_KEY is unset (USER ACTION).
const VIDEO_WORKLOAD_STATUS: Record<VideoWorkload, VideoWorkloadStatus> = {
  VIDEO_STANDARD: 'AVAILABLE',
  VIDEO_PREMIUM: 'NOT_CONFIGURED',
};

export function videoWorkloadStatus(
  workload: VideoWorkload,
): VideoWorkloadStatus {
  return VIDEO_WORKLOAD_STATUS[workload];
}

const KIND_GENERATION_STATUS: Record<AssetKind, AssetGenerationStatus> = {
  image: 'AVAILABLE',
  video: 'AVAILABLE',
};

export function generationStatus(kind: AssetKind): AssetGenerationStatus {
  return KIND_GENERATION_STATUS[kind];
}
