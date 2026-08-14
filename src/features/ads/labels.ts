// Advertisement — Korean label maps (Sprint 3B). Pure value→word lookup; no logic.
import type { AdStatus, AdType, ContractType, FunnelMilestone } from './types';
import type { BadgeTone } from '@/components/StatusBadge';

export const AD_TYPE_LABELS: Readonly<Record<AdType, string>> = {
  youtube_shorts: '유튜브 쇼츠',
  youtube_video: '유튜브 일반영상',
  instagram_reels: '인스타 릴스',
  instagram_post: '인스타 게시물',
  other: '기타',
};

export const CONTRACT_TYPE_LABELS: Readonly<Record<ContractType, string>> = {
  experience_group: '체험단 모집',
  self_produced: '자체 제작',
  review_agency: '레뷰 대행사',
  direct_contract: '직접 계약',
  other: '기타',
};

export const AD_STATUS_LABELS: Readonly<Record<AdStatus, string>> = {
  draft: '작성 중',
  active: '진행 중',
  ended: '종료',
  disabled: '중단',
};

export const AD_STATUS_TONES: Readonly<Record<AdStatus, BadgeTone>> = {
  draft: 'neutral',
  active: 'success',
  ended: 'info',
  disabled: 'warning',
};

export const FUNNEL_LABELS: Readonly<Record<FunnelMilestone, string>> = {
  ad_click: '유입',
  birth_info_completed: '출생정보 완료',
  signup: '가입',
  first_consultation: '첫 상담',
  d1_active: 'D1',
  d7_active: 'D7',
  d30_active: 'D30',
};

// Ordered options for AdSelect (value+label), reused by editor + filters.
export const AD_TYPE_OPTIONS = (Object.keys(AD_TYPE_LABELS) as AdType[]).map((value) => ({
  value,
  label: AD_TYPE_LABELS[value],
}));
export const CONTRACT_TYPE_OPTIONS = (Object.keys(CONTRACT_TYPE_LABELS) as ContractType[]).map(
  (value) => ({ value, label: CONTRACT_TYPE_LABELS[value] }),
);
export const AD_STATUS_OPTIONS = (Object.keys(AD_STATUS_LABELS) as AdStatus[]).map((value) => ({
  value,
  label: AD_STATUS_LABELS[value],
}));
