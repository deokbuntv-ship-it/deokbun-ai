export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export type AuthUser = {
  id: string;
  email: string | null;
  displayName: string | null;
};

export type AuthState = {
  status: AuthStatus;
  user: AuthUser | null;
};

export type AuthProviderId = 'kakao' | 'google' | 'naver' | 'apple';
