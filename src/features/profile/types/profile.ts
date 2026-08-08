// Minimal app-owned user profile (APP-23 foundation).
//
// The profile is a 1:1 record with the Supabase auth user (profiles.id =
// auth.users.id). It intentionally stores only an editable display name — email,
// avatar, tokens, and raw auth metadata are NOT stored here (privacy
// minimization). Future sprints (settings, multi-person, subscription, admin)
// build on this record.

export type Profile = {
  id: string;
  displayName: string | null;
};
