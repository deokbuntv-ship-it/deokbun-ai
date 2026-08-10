// Admin authorization is SEPARATE from authentication. A signed-in Supabase user
// is only an admin when the DB authority (public.is_admin()) says so. The APP never
// hardcodes emails / flags and never treats an authorization failure as success.

export type AdminAuthorizationStatus =
  | 'loading' // still resolving auth and/or the DB authority
  | 'unauthenticated' // no signed-in user
  | 'admin' // DB authority explicitly granted
  | 'not_admin' // signed in, but DB authority denied
  | 'unavailable'; // authority could not be resolved → FAIL CLOSED (never admin)

// Outcomes of a DB authority check (the auth phase is handled before this).
export type AdminResolvedStatus = Extract<
  AdminAuthorizationStatus,
  'admin' | 'not_admin' | 'unavailable'
>;

export type AdminNavKey =
  | 'dashboard'
  | 'users'
  | 'subjects'
  | 'consultations'
  | 'ai-usage'
  | 'famous'
  | 'content';

// ---- ADMIN-02: read-only user + subject operations -------------------------
// All admin data is served by SECURITY DEFINER RPCs gated by public.is_admin()
// (see docs/admin/ADMIN_02_SETUP.sql). The client never reads cross-user tables
// directly and never uses the service_role key.

export type AdminUserListParams = {
  search?: string;
  limit: number;
  offset: number;
};

export type AdminUserListItem = {
  userId: string;
  displayName: string | null;
  createdAt: string | null;
  subjectCount: number;
  conversationCount: number;
};

// Curated, presentation-safe subject summary. The raw birth_info JSON is NEVER
// dumped to the UI — only these operational fields are surfaced.
export type AdminSubjectSummary = {
  id: string;
  displayName: string | null;
  relationship: string | null;
  isSelf: boolean;
  calendarType: 'solar' | 'lunar' | null;
  lunarMonthType: 'regular' | 'leap' | null;
  birthDate: string; // "YYYY. M. D" as entered, or "–"
  birthTimeAccuracy: 'exact' | 'approximate' | 'unknown' | null;
  birthPlace: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type AdminUserDetail = {
  userId: string;
  email: string | null;
  displayName: string | null;
  createdAt: string | null;
  lastSignInAt: string | null;
  conversationCount: number;
  subjects: AdminSubjectSummary[];
};

// ---- ADMIN-03: consultation monitoring (metadata-only, PII-minimal) ---------
// Message CONTENT is never returned to the client — only role / length / order.
export type AdminConsultationListParams = {
  search?: string;
  limit: number;
  offset: number;
};

export type AdminConsultationListItem = {
  conversationId: string;
  userDisplayName: string | null;
  subjectLabel: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  messageCount: number;
};

export type AdminMessageMeta = {
  seq: number;
  role: string; // 'user' | 'assistant' (ENGINE/app value, shown as-is)
  length: number; // char length of content — never the content itself
};

export type AdminConsultationDetail = {
  conversationId: string;
  userId: string | null;
  userDisplayName: string | null;
  subjectLabel: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  hasSummary: boolean; // whether a summary exists — never the summary text
  messageCount: number;
  messages: AdminMessageMeta[];
};

// ---- ADMIN-04: AI usage / operations dashboard -----------------------------
// AI metrics come from public.ai_usage_logs (written by the chat Edge Function
// via service_role). Raw token/cost data only — no price table is hardcoded.
export type AdminDashboardOverview = {
  userCount: number;
  subjectCount: number;
  conversationCount: number;
  conversationToday: number;
  aiRequestCount: number;
  aiSuccessCount: number;
  aiErrorCount: number;
  aiInputTokens: number;
  aiOutputTokens: number;
  aiTodayRequestCount: number;
};

export type AdminAiUsageParams = {
  limit: number;
  offset: number;
  requestType?: string | null;
};

// Daily activity trend point (real aggregation; docs/admin/DASHBOARD_TRENDS_SETUP.sql).
export type AdminDailyActivityPoint = {
  day: string;
  newUsers: number;
  consultations: number;
  aiRequests: number;
};

export type AdminAiUsageItem = {
  id: string;
  createdAt: string | null;
  userId: string | null;
  model: string | null;
  requestType: string | null;
  status: string | null; // 'success' | 'error'
  errorCode: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  latencyMs: number | null;
};
