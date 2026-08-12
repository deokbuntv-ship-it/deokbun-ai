// Post-login user mapping + authenticated guard coverage. Pure, no mocks.
import type { User } from '@supabase/supabase-js';

import { requireAuthenticatedUser } from '../guards/requireAuthenticatedUser';
import { mapSupabaseUser } from '../mappers/mapSupabaseUser';
import type { AuthState } from '../types/auth';

const user = (o: {
  id?: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}): User =>
  ({
    id: o.id ?? 'u1',
    email: o.email,
    user_metadata: o.user_metadata ?? {},
    app_metadata: {},
  }) as unknown as User;

describe('mapSupabaseUser', () => {
  it('prefers full_name for displayName', () => {
    expect(
      mapSupabaseUser(user({ email: 'a@b.c', user_metadata: { full_name: '홍길동', name: 'x' } })),
    ).toEqual({ id: 'u1', email: 'a@b.c', displayName: '홍길동' });
  });

  it('falls back to name when full_name is missing or whitespace', () => {
    expect(mapSupabaseUser(user({ user_metadata: { full_name: '   ', name: '길동' } })).displayName).toBe('길동');
    expect(mapSupabaseUser(user({ user_metadata: { name: '길동' } })).displayName).toBe('길동');
  });

  it('displayName is null when both are absent or whitespace-only', () => {
    expect(mapSupabaseUser(user({ user_metadata: {} })).displayName).toBeNull();
    expect(mapSupabaseUser(user({ user_metadata: { full_name: '  ', name: '  ' } })).displayName).toBeNull();
  });

  it('passes email through and yields null when undefined', () => {
    expect(mapSupabaseUser(user({ email: 'x@y.z' })).email).toBe('x@y.z');
    expect(mapSupabaseUser(user({})).email).toBeNull();
  });

  it('passes the id through', () => {
    expect(mapSupabaseUser(user({ id: 'abc-123' })).id).toBe('abc-123');
  });
});

describe('requireAuthenticatedUser', () => {
  it('is true only for an authenticated state with a non-null user', () => {
    const authed: AuthState = {
      status: 'authenticated',
      user: { id: 'u1', email: null, displayName: null },
    };
    expect(requireAuthenticatedUser(authed)).toBe(true);
  });

  it('is false for loading / unauthenticated', () => {
    expect(requireAuthenticatedUser({ status: 'loading', user: null })).toBe(false);
    expect(requireAuthenticatedUser({ status: 'unauthenticated', user: null })).toBe(false);
  });

  it('is false for authenticated with a null user (defensive)', () => {
    expect(requireAuthenticatedUser({ status: 'authenticated', user: null })).toBe(false);
  });
});
