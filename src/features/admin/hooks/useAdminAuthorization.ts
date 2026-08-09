import { useEffect, useRef, useState } from 'react';

import { useAuth } from '@/features/auth';

import { adminAuthorizationService } from '../services/adminAuthorizationService';
import type { AdminAuthorizationStatus } from '../types';

// Resolves admin authorization on top of the existing (shared) auth identity:
//   auth loading            -> 'loading'
//   auth unauthenticated     -> 'unauthenticated'
//   auth authenticated       -> ask the DB authority (is_admin) -> admin/not_admin/unavailable
//
// A token guards against stale results on user switch. Default is fail-closed:
// any resolution failure surfaces as 'unavailable', never 'admin'.
export function useAdminAuthorization(): AdminAuthorizationStatus {
  const { authState } = useAuth();
  const [status, setStatus] = useState<AdminAuthorizationStatus>('loading');
  const tokenRef = useRef(0);

  useEffect(() => {
    const token = tokenRef.current + 1;
    tokenRef.current = token;

    if (authState.status === 'loading') {
      setStatus('loading');
      return;
    }

    if (authState.status === 'unauthenticated' || authState.user === null) {
      setStatus('unauthenticated');
      return;
    }

    setStatus('loading');
    adminAuthorizationService
      .checkAdminAuthority()
      .then((resolved) => {
        if (token === tokenRef.current) {
          setStatus(resolved);
        }
      })
      .catch(() => {
        if (token === tokenRef.current) {
          setStatus('unavailable');
        }
      });
  }, [authState.status, authState.user?.id]);

  return status;
}
