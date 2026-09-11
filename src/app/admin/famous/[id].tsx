import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import {
  AdminDetailSection,
  AdminPageHeader,
  AdminStateView,
  confirmDestructive,
} from '@/features/admin';
import { AdminConfirmDialog } from '@/features/admin/components/AdminConfirmDialog';
import {
  FamousEditor,
  famousService,
  type FamousInput,
  type FamousProfile,
} from '@/features/famous';
import { latestDeployRequest, requestSiteDeploy, type DeployResult, type LatestDeploy } from '@/features/publicSite';

type LoadStatus = 'loading' | 'ready' | 'error' | 'notfound';

/** 오너가 알고 싶은 것은 절대 시각이 아니라 "빌드가 끝났을 만한가" 다. 빌드는 보통 2~5분 걸린다. */
function describeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return '방금';
  const min = Math.floor(ms / 60000);
  if (min < 1) return '방금 (보통 2~5분 뒤 반영)';
  if (min < 6) return `${min}분 전 (보통 2~5분 뒤 반영)`;
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  return hr < 24 ? `${hr}시간 전` : `${Math.floor(hr / 24)}일 전`;
}

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
  const [deploy, setDeploy] = useState<DeployResult | null>(null);
  const [lastDeploy, setLastDeploy] = useState<LatestDeploy | null>(null);
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

  // "발행했는데 됐나?" 에 답하는 줄. 저장 직후의 일회성 메시지(deploy)와 달리 화면을 다시 열어도
  // 남아 있어서, 생성 화면에서 바로 발행하고 넘어온 경우도 여기서 확인된다.
  useEffect(() => {
    let active = true;
    void latestDeployRequest().then((r) => {
      if (active) setLastDeploy(r);
    });
    return () => {
      active = false;
    };
  }, [savedAt]);

  // ⚠ 발행이 곧 검색 노출이 되게 하는 자리 (S8).
  //
  // 공개 사이트는 미리 구워진 HTML 이다. DB 를 바꾸면 브라우저로 보는 사람에게는 즉시 반영되지만
  // **크롤러가 받아 가는 파일은 마지막 빌드 그대로**다. 오너의 요구가 "발행 누르면 끝" 이므로
  // 저장이 성공하면 재빌드를 여기서 요청한다.
  //
  // ⚠ 어떤 변경에서 트리거하는가 — **published 였거나 published 가 되는 모든 저장**이다.
  //   · draft → published : 새 페이지가 있어야 하니 당연
  //   · published → published(수정) : 안 돌리면 **고친 내용이 검색에 영원히 반영되지 않는다**
  //   · published → draft/archived : 안 돌리면 **내린 페이지의 HTML 이 그대로 살아 색인된다**
  //   마지막 경우가 가장 조용히 위험해서, "발행할 때만" 이 아니라 "발행 상태를 건드릴 때마다" 로 잡았다.
  //   과다 빌드는 Edge 쪽 쿨다운(3분)이 흡수한다 — 뒤늦게 시작한 빌드가 그 사이 커밋을 전부 담는다.
  const wasPublished = profile?.status === 'published';

  // ⚠ 발행 상태를 건드리는 저장은 **확인을 거친다.** 실명 공개 페이지가 생기거나 내려가고,
  //   그 자리에서 Vercel 재배포까지 돈다. 되돌리기가 있긴 하지만 검색 엔진 캐시는 남는다.
  //   발행과 무관한 저장(초안 수정 등)은 그냥 지나간다 — 모든 저장에 확인을 걸면 확인이 소음이 된다.
  const [pendingPublish, setPendingPublish] = useState<FamousInput | null>(null);

  const applySubmit = (input: FamousInput) => {
    if (submitting || id === undefined) return;
    setSubmitting(true);
    setErrorMessage(null);
    setSavedAt(null);
    setDeploy(null);
    const touchesPublic = wasPublished || input.status === 'published';
    famousService
      .updateFamous(id, input)
      .then(async () => {
        setSavedAt(new Date().toISOString().slice(0, 19).replace('T', ' '));
        // ⚠ fail-open: 재배포가 실패해도 저장은 이미 끝났다. 다만 조용히 넘기지 않는다 — 결과를
        // 그대로 화면에 띄운다(미설정도 "미설정" 이라고 말한다).
        if (touchesPublic) setDeploy(await requestSiteDeploy('famous:save'));
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

  const handleSubmit = (input: FamousInput) => {
    if (submitting || id === undefined) return;
    if (wasPublished || input.status === 'published') {
      setPendingPublish(input);
      return;
    }
    applySubmit(input);
  };

  const handleArchive = () => {
    if (submitting || id === undefined) return;
    confirmDestructive('이 유명인을 보관 처리할까요?').then((ok) => {
      if (!ok) return;
      setSubmitting(true);
      setErrorMessage(null);
      famousService
        .archiveFamous(id)
        .then(() => router.push('/admin/famous'))
        .catch(() => {
          setErrorMessage('보관에 실패했습니다.');
          setSubmitting(false);
        });
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

          <Stack direction="row" gap="sm" style={{ flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              label="이 인물로 콘텐츠 만들기"
              onPress={() =>
                router.push({
                  pathname: '/admin/content/new',
                  params: { famousId: profile.id, famousName: profile.name },
                })
              }
            />
          </Stack>

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

          {/* ⚠ 저장과 "검색에 반영됨" 은 다른 사건이다. 오너가 발행 후 "됐나?" 를 궁금해하지 않도록
              세 결과를 서로 다른 문장으로 말한다 — 요청됨 / 이미 예약됨 / 안 됨.
              ⚠ Vercel 빌드 상태를 실제로 조회하지는 않는다. 그러려면 Vercel API 토큰이라는 두 번째
              시크릿과 오너 설정 단계가 하나 더 생긴다. 정직하고 싼 답은 "요청했고 보통 2~5분" 이다. */}
          {lastDeploy?.createdAt ? (
            <Text variant="bodySmall" colorToken="textSecondary">
              {`마지막 사이트 재생성 요청: ${describeAgo(lastDeploy.createdAt)}`}
              {lastDeploy.status === 'failed' ? ' · 실패' : lastDeploy.status === 'skipped' ? ' · 건너뜀' : ''}
            </Text>
          ) : null}

          {deploy ? (
            <Text
              variant="bodySmall"
              colorToken={deploy.outcome === 'failed' ? 'danger' : deploy.outcome === 'skipped' ? 'textSecondary' : 'success'}
            >
              {deploy.message}
            </Text>
          ) : null}

          <FamousEditor
            initial={profile}
            submitting={submitting}
            errorMessage={errorMessage}
            onSubmit={handleSubmit}
            onArchive={handleArchive}
          />

          {/* ⚠ Z11(법률 검토)을 문구에 넣는다. "실존 인물입니까?" 를 **묻지는** 않는다 —
              물어도 확인할 방법이 없고, 매번 예를 누르게 훈련시키면 물음 자체가 무뎌진다.
              대신 상시 경고로 둔다. 오너가 그 순간 알아야 하는 것은 "이 버튼이 실명 페이지를
              공개한다" 와 "그 검토가 아직 안 끝났다" 두 가지다. */}
          <AdminConfirmDialog
            visible={pendingPublish !== null}
            busy={submitting}
            title={
              pendingPublish?.status === 'published'
                ? '이 인물을 공개할까요?'
                : '공개 상태를 바꿀까요?'
            }
            what={
              pendingPublish?.status === 'published'
                ? '이름과 명식, 해설이 담긴 페이지가 누구나 볼 수 있게 인터넷에 올라갑니다.'
                : '지금 공개된 페이지가 내려갑니다. 저장과 동시에 사이트가 다시 만들어집니다.'
            }
            scope="사이트 전체가 다시 만들어집니다(보통 2~5분). 검색 엔진이 이 페이지를 수집할 수 있게 됩니다."
            reversible={
              '상태를 되돌리면 페이지는 사라집니다. 다만 **검색 엔진이 이미 가져간 내용은 한동안 남습니다** — '
              + '올린 것을 완전히 없던 일로 만들 수는 없습니다.'
            }
            notice={
              '⚠ 실존 인물의 법률 검토가 아직 끝나지 않았습니다(OWNER_TODO Z11). '
              + '검토 전에는 가상 명식으로만 발행하십시오.'
            }
            confirmLabel={pendingPublish?.status === 'published' ? '공개합니다' : '적용합니다'}
            onCancel={() => setPendingPublish(null)}
            onConfirm={() => {
              const input = pendingPublish;
              setPendingPublish(null);
              if (input) applySubmit(input);
            }}
          />
        </>
      )}
    </Stack>
  );
}
