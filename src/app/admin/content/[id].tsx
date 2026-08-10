import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { AdminPageHeader, AdminStateView } from '@/features/admin';
import {
  ContentEditor,
  ContentGenerationPanel,
  contentService,
  type ContentGenerationDraft,
  type ContentInput,
  type ContentItem,
} from '@/features/content';
import { famousService } from '@/features/famous';

type LoadStatus = 'loading' | 'ready' | 'error' | 'notfound';

export default function AdminContentDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === 'string' ? params.id : undefined;

  const [item, setItem] = useState<ContentItem | null>(null);
  const [famousLabel, setFamousLabel] = useState<string | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [submitting, setSubmitting] = useState(false);
  const [applyingDraft, setApplyingDraft] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [editorKey, setEditorKey] = useState(0);
  const loadTokenRef = useRef(0);

  const load = useCallback(() => {
    if (id === undefined) {
      setStatus('notfound');
      return;
    }
    const token = loadTokenRef.current + 1;
    loadTokenRef.current = token;
    setStatus('loading');
    contentService
      .getContent(id)
      .then(async (result) => {
        if (token !== loadTokenRef.current) return;
        if (result === null) {
          setStatus('notfound');
          return;
        }
        setItem(result);
        setStatus('ready');
        // Resolve famous label (best-effort; never blocks the editor).
        if (result.famousId) {
          try {
            const famous = await famousService.getFamous(result.famousId);
            if (token === loadTokenRef.current) {
              setFamousLabel(famous?.name ?? null);
            }
          } catch {
            /* label is optional */
          }
        }
      })
      .catch(() => {
        if (token !== loadTokenRef.current) return;
        setStatus('error');
      });
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = (input: ContentInput) => {
    if (submitting || id === undefined) return;
    setSubmitting(true);
    setErrorMessage(null);
    setSavedAt(null);
    contentService
      .updateContent(id, input)
      .then(() => {
        setSavedAt(new Date().toISOString().slice(0, 19).replace('T', ' '));
        load();
      })
      .catch(() => setErrorMessage('저장에 실패했습니다.'))
      .finally(() => setSubmitting(false));
  };

  // Apply an AI draft to the content item after operator review. Merges into the
  // current item (never auto-publishes) and re-mounts the editor with fresh data.
  const handleApplyDraft = (draft: ContentGenerationDraft) => {
    if (applyingDraft || id === undefined || item === null) return;
    setApplyingDraft(true);
    setErrorMessage(null);
    const merged: ContentInput = {
      title: draft.title ?? item.title,
      channel: item.channel,
      sourceType: item.sourceType,
      famousId: item.famousId,
      status: item.status,
      slug: item.slug,
      category: item.category,
      body: draft.body,
      summary: draft.summary ?? item.summary,
      tags: draft.tags.length > 0 ? draft.tags : item.tags,
    };
    contentService
      .updateContent(id, merged)
      .then(() => {
        setSavedAt(new Date().toISOString().slice(0, 19).replace('T', ' '));
        setEditorKey((k) => k + 1);
        load();
      })
      .catch(() => setErrorMessage('초안 적용에 실패했습니다.'))
      .finally(() => setApplyingDraft(false));
  };

  const handleCancel = () => {
    if (submitting || id === undefined) return;
    setSubmitting(true);
    setErrorMessage(null);
    contentService
      .cancelContent(id)
      .then(() => router.push('/admin/content'))
      .catch(() => {
        setErrorMessage('취소 처리에 실패했습니다.');
        setSubmitting(false);
      });
  };

  return (
    <Stack gap="xl">
      <Stack direction="row" gap="sm" align="center">
        <Button
          label="← 목록"
          variant="secondary"
          onPress={() => router.push('/admin/content')}
        />
      </Stack>

      {status === 'loading' ? (
        <AdminStateView state="loading" />
      ) : status === 'notfound' ? (
        <AdminStateView state="empty" message="콘텐츠를 찾을 수 없습니다." />
      ) : status === 'error' || item === null ? (
        <AdminStateView
          state="error"
          message="콘텐츠를 불러오지 못했습니다."
          onRetry={load}
        />
      ) : (
        <>
          <AdminPageHeader
            title={item.title || '(제목 없음)'}
            subtitle="콘텐츠 편집"
          />
          {savedAt ? (
            <Text variant="bodySmall" colorToken="success">
              저장되었습니다 ({savedAt})
            </Text>
          ) : null}
          <ContentEditor
            key={editorKey}
            initial={item}
            initialFamousLabel={famousLabel}
            submitting={submitting}
            errorMessage={errorMessage}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
          <ContentGenerationPanel
            contentId={item.id}
            channel={item.channel}
            sourceType={item.sourceType}
            famousLabel={famousLabel}
            onApplyDraft={handleApplyDraft}
            applying={applyingDraft}
          />
        </>
      )}
    </Stack>
  );
}
