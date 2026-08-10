import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import {
  AdminDetailSection,
  AdminPageHeader,
  AdminStateView,
} from '@/features/admin';
import {
  FamousEditor,
  famousService,
  type FamousInput,
  type FamousProfile,
} from '@/features/famous';

type LoadStatus = 'loading' | 'ready' | 'error' | 'notfound';

const CALC_LABEL: Record<string, string> = {
  not_calculated: '미계산',
  current: '최신',
  stale: '갱신 필요',
  failed: '실패',
  unavailable: '불가',
};

export default function AdminFamousDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === 'string' ? params.id : undefined;

  const [profile, setProfile] = useState<FamousProfile | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const loadTokenRef = useRef(0);

  const load = useCallback(() => {
    if (id === undefined) {
      setStatus('notfound');
      return;
    }
    const token = loadTokenRef.current + 1;
    loadTokenRef.current = token;
    setStatus('loading');
    famousService
      .getFamous(id)
      .then((result) => {
        if (token !== loadTokenRef.current) return;
        if (result === null) {
          setStatus('notfound');
          return;
        }
        setProfile(result);
        setStatus('ready');
      })
      .catch(() => {
        if (token !== loadTokenRef.current) return;
        setStatus('error');
      });
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = (input: FamousInput) => {
    if (submitting || id === undefined) return;
    setSubmitting(true);
    setErrorMessage(null);
    setSavedAt(null);
    famousService
      .updateFamous(id, input)
      .then(() => {
        setSavedAt(new Date().toISOString().slice(0, 19).replace('T', ' '));
        load();
      })
      .catch((error) => {
        const code = (error as { code?: string } | null)?.code;
        setErrorMessage(
          code === '23505'
            ? '이미 사용 중인 slug입니다.'
            : '저장에 실패했습니다.',
        );
      })
      .finally(() => setSubmitting(false));
  };

  const handleArchive = () => {
    if (submitting || id === undefined) return;
    setSubmitting(true);
    setErrorMessage(null);
    famousService
      .archiveFamous(id)
      .then(() => router.push('/admin/famous'))
      .catch(() => {
        setErrorMessage('보관에 실패했습니다.');
        setSubmitting(false);
      });
  };

  return (
    <Stack gap="xl">
      <Stack direction="row" gap="sm" align="center">
        <Button
          label="← 목록"
          variant="secondary"
          onPress={() => router.push('/admin/famous')}
        />
      </Stack>

      {status === 'loading' ? (
        <AdminStateView state="loading" />
      ) : status === 'notfound' ? (
        <AdminStateView state="empty" message="유명인을 찾을 수 없습니다." />
      ) : status === 'error' || profile === null ? (
        <AdminStateView
          state="error"
          message="유명인 정보를 불러오지 못했습니다."
          onRetry={load}
        />
      ) : (
        <>
          <AdminPageHeader title={profile.name} subtitle={`slug: ${profile.slug}`} />

          <AdminDetailSection
            title="계산 스냅샷 (읽기 전용)"
            rows={[
              {
                label: '계산 상태',
                value:
                  CALC_LABEL[profile.calculationState] ??
                  profile.calculationState,
              },
              {
                label: '스냅샷',
                value: profile.currentSnapshotId ?? '없음',
              },
              {
                label: '공개 시각',
                value: profile.publishedAt
                  ? profile.publishedAt.slice(0, 10)
                  : '–',
              },
            ]}
          >
            <Text variant="caption" colorToken="textSecondary">
              사주 계산 결과는 계산 엔진 스냅샷 연동 후 제공됩니다. 관리자는
              계산을 직접 수행하지 않습니다.
            </Text>
          </AdminDetailSection>

          {savedAt ? (
            <Text variant="bodySmall" colorToken="success">
              저장되었습니다 ({savedAt})
            </Text>
          ) : null}

          <FamousEditor
            initial={profile}
            submitting={submitting}
            errorMessage={errorMessage}
            onSubmit={handleSubmit}
            onArchive={handleArchive}
          />
        </>
      )}
    </Stack>
  );
}
