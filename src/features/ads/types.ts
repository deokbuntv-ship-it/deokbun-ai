// Advertisement & Acquisition Tracking — domain types (Sprint 3B).
// PRIMARY ENTITY = Advertisement (광고 1건). Channel/Campaign/Publisher are DERIVED
// grouping dimensions (ad_type / publisher_nickname / contract_type), never entities the
// operator must create first (§0/§30). Pure types — no react-native, no engine semantics.

// ── Enumerations (categorical; Korean labels live in labels.ts) ──────────────────────
export type AdType =
  | 'youtube_shorts'
  | 'youtube_video'
  | 'instagram_reels'
  | 'instagram_post'
  | 'other';

export type ContractType =
  | 'experience_group' // 체험단 모집
  | 'self_produced' // 자체 제작
  | 'review_agency' // 레뷰 대행사
  | 'direct_contract' // 직접 계약
  | 'other';

// Lifecycle — prefer status change over deletion; history is never destroyed (§6).
export type AdStatus =
  | 'draft' // 작성 중
  | 'active' // 진행 / tracking 가능
  | 'ended' // 종료됐지만 과거 attribution 보존
  | 'disabled'; // 운영상 tracking 중단

// ── Advertisement record (mirrors public.advertisements) ─────────────────────────────
export type Advertisement = {
  id: string;
  publicTrackingCode: string | null; // null until published (§7/§9)
  adType: AdType;
  publisherNickname: string; // 닉네임/채널명 — operator free text (§5)
  adCheckUrl: string | null; // 게시된 콘텐츠 URL — DISTINCT from the tracking URL (§39)
  startDate: string | null; // YYYY-MM-DD
  contractType: ContractType;
  costKrw: number | null; // null = 미입력 → CAC must show '—', never 0원 (§35)
  notes: string | null;
  status: AdStatus;
  publishedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

// Editor input (create/update). Tracking code / publishedAt are server-assigned (§10).
export type AdInput = {
  adType: AdType;
  publisherNickname: string;
  adCheckUrl: string | null;
  startDate: string | null;
  contractType: ContractType;
  costKrw: number | null;
  notes: string | null;
  status: AdStatus;
};

export type AdListItem = {
  id: string;
  publicTrackingCode: string | null;
  adType: AdType;
  publisherNickname: string;
  startDate: string | null;
  contractType: ContractType;
  costKrw: number | null;
  status: AdStatus;
};

// ── Funnel milestones (§22) — the ordered acquisition steps ──────────────────────────
export type FunnelMilestone =
  | 'ad_click'
  | 'birth_info_completed'
  | 'signup'
  | 'first_consultation'
  | 'd1_active'
  | 'd7_active'
  | 'd30_active';

// Per-ad raw funnel counts (from ad_tracking_events + attribution, aggregated).
export type AdFunnelCounts = {
  adId: string;
  clicks: number; // 유입 (raw ad_click events)
  uniqueVisitors: number | null; // null when no reliable anon id (§18) → UI hides
  birthInfoCompleted: number;
  signups: number;
  firstConsultations: number;
  d1: number;
  d7: number;
  d30: number;
};

// Fully-derived per-ad performance row (counts + metrics). Metrics fields are number|null
// where null MUST render as '—' (never a fabricated 0%/0원, §32/§35).
export type AdPerformanceRow = {
  ad: AdListItem;
  counts: AdFunnelCounts;
  birthConversion: number | null; // 유입→출생완료
  signupConversion: number | null; // 유입→가입
  firstConsultConversion: number | null; // 가입→첫상담
  clickToFirstConsult: number | null; // 유입→첫상담
  d1Retention: number | null;
  d7Retention: number | null;
  d30Retention: number | null;
  signupCac: number | null; // 광고비 / 가입자 — null when cost missing OR 0 signups
  firstConsultCpa: number | null; // 광고비 / 첫상담자
};

// Dashboard totals (all ads combined, §36).
export type AdOverviewTotals = {
  totalClicks: number;
  totalBirthInfo: number;
  totalSignups: number;
  totalFirstConsultations: number;
  totalD1: number;
  totalD7: number;
  totalD30: number;
  totalCostKrw: number | null; // null when NO ad has a cost; sum of known costs otherwise
  avgSignupCac: number | null;
  avgFirstConsultCpa: number | null;
};
