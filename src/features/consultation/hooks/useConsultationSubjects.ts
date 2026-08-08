import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/features/auth';
import { consultationSubjectService } from '@/features/consultation/services/consultationSubjectService';
import type { ConsultationSubjectRecord } from '@/features/consultation/types/subject';

export type SubjectsStatus = 'idle' | 'loading' | 'ready' | 'error';

type UseConsultationSubjectsResult = {
  subjects: ConsultationSubjectRecord[];
  status: SubjectsStatus;
  reload: () => void;
};

// Loads the authenticated user's saved subjects. User-switch safe: on logout /
// user change the in-memory list is cleared immediately and stale in-flight
// responses are discarded via a token. RLS enforces per-user isolation server-side.
export function useConsultationSubjects(): UseConsultationSubjectsResult {
  const { authState } = useAuth();

  const [subjects, setSubjects] = useState<ConsultationSubjectRecord[]>([]);
  const [status, setStatus] = useState<SubjectsStatus>('idle');

  const tokenRef = useRef(0);
  const loadedUserIdRef = useRef<string | null>(null);

  const load = useCallback(() => {
    if (authState.status !== 'authenticated' || authState.user === null) {
      return;
    }
    const token = ++tokenRef.current;
    setStatus('loading');

    consultationSubjectService
      .listSubjects()
      .then((rows) => {
        if (token !== tokenRef.current) {
          return;
        }
        setSubjects(rows);
        setStatus('ready');
      })
      .catch(() => {
        if (token !== tokenRef.current) {
          return;
        }
        setSubjects([]);
        setStatus('error');
      });
  }, [authState.status, authState.user]);

  useEffect(() => {
    const status = authState.status;
    const userId = authState.user?.id ?? null;

    if (status === 'loading') {
      setStatus('idle');
      return;
    }

    if (status === 'unauthenticated' || userId === null) {
      // Clear the previous user's list immediately and discard in-flight loads.
      tokenRef.current += 1;
      loadedUserIdRef.current = null;
      setSubjects([]);
      setStatus('idle');
      return;
    }

    if (loadedUserIdRef.current === userId) {
      return;
    }

    loadedUserIdRef.current = userId;
    setSubjects([]); // never show the previous user's list while loading
    load();
  }, [authState.status, authState.user?.id, load]);

  return { subjects, status, reload: load };
}
