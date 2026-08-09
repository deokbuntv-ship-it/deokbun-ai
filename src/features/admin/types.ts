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
