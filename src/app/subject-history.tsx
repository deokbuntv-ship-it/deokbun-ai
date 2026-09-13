import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { DeleteConfirmSheet } from '@/components/DeleteConfirmSheet';
import { DetailBottomNav } from '@/components/DetailBottomNav';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import {
    conversationService,
    type ConversationSummaryItem,
} from '@/features/chat';
import {
    isSavedSubjectId,
    useConsultationDraft,
    type BirthInfoDraft,
    type ConsultationSubject,
} from '@/features/consultation';

type HistoryStatus = 'loading' | 'ready' | 'error' | 'invalid';

// What deleting a conversation actually does (migration 20260922000000) — said BEFORE the button.
const CONVERSATION_DELETE_LINES = [
  '대화 내용과 이 상담의 답변이 지워져요. 되돌릴 수 없어요.',
  '이 상담으로 만든 보고서는 운세우편함에 남아요. 보고서는 따로 삭제할 수 있어요.',
  '보고서를 공유했다면 그 링크는 더 이상 열리지 않아요.',
] as const;

type StoredSnapshot = {
  subject: ConsultationSubject | null;
  birthInfo: BirthInfoDraft | null;
} | null;

function formatDate(iso: string): string {
  // Minimal, locale-independent date (YYYY-MM-DD). Rich formatting is deferred.
  return typeof iso === 'string' ? iso.slice(0, 10) : '';
}

function summaryPreview(summary: string | null): string | null {
  if (summary === null) {
    return null;
  }
  const trimmed = summary.trim();
  if (trimmed.length === 0) {
    return null;
  }
  return trimmed.length > 80 ? `${trimmed.slice(0, 80)}…` : trimmed;
}

export default function SubjectHistoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ subjectId?: string }>();
  const subjectId =
    typeof params.subjectId === 'string' ? params.subjectId : undefined;

  const { updateSubject, updateBirthInfo } = useConsultationDraft();

  const [items, setItems] = useState<ConversationSummaryItem[]>([]);
  const [status, setStatus] = useState<HistoryStatus>('loading');
  // 상담 삭제 (2026-09-13 오너 결정). The item leaves the list only after the server confirms one deleted row.
  const [pendingDelete, setPendingDelete] = useState<ConversationSummaryItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Discards stale responses (unmount / manual retry).
  const loadTokenRef = useRef(0);

  const loadHistory = useCallback(() => {
    if (subjectId === undefined || !isSavedSubjectId(subjectId)) {
      setStatus('invalid');
      return;
    }

    const token = loadTokenRef.current + 1;
    loadTokenRef.current = token;
    setStatus('loading');

    conversationService
      .listConversationsForSubject(subjectId)
      .then((rows) => {
        if (token !== loadTokenRef.current) {
          return;
        }
        setItems(rows);
        setStatus('ready');
      })
      .catch(() => {
        if (token !== loadTokenRef.current) {
          return;
        }
        setStatus('error');
      });
  }, [subjectId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Open a specific past conversation. The conversation's stored snapshot is the
  // authority for the subject/birthInfo (past meaning is immutable), so we seed
  // the draft from it before navigating to the exact conversationId.
  const openConversation = (item: ConversationSummaryItem) => {
    const snapshot = item.subjectSnapshot as StoredSnapshot;
    if (snapshot?.subject && snapshot?.birthInfo) {
      updateSubject(snapshot.subject);
      updateBirthInfo(snapshot.birthInfo);
    }
    router.push({ pathname: '/chat', params: { conversationId: item.id } });
  };

  const askDelete = (item: ConversationSummaryItem) => {
    setDeleteError(null);
    setPendingDelete(item);
  };

  const confirmDelete = async () => {
    if (!pendingDelete || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    const deleted = await conversationService.deleteConversation(pendingDelete.id);
    setDeleting(false);
    if (!deleted) {
      setDeleteError('삭제하지 못했어요. 잠시 후 다시 시도해 주세요.');
      return;
    }
    setItems((current) => current.filter((row) => row.id !== pendingDelete.id));
    setPendingDelete(null);
  };

  const renderBody = () => {
    if (status === 'invalid') {
      return (
        <Card>
          <Text variant="bodyMedium" colorToken="textSecondary">
            유효하지 않은 대상입니다.
          </Text>
        </Card>
      );
    }

    if (status === 'loading') {
      return (
        <Card>
          <Text variant="bodyMedium" colorToken="textSecondary">
            상담 기록을 불러오는 중입니다...
          </Text>
        </Card>
      );
    }

    if (status === 'error') {
      return (
        <Card>
          <Stack gap="sm">
            <Text variant="bodyMedium" colorToken="textSecondary">
              상담 기록을 불러오지 못했습니다.
            </Text>
            <Button label="다시 시도" variant="secondary" onPress={loadHistory} />
          </Stack>
        </Card>
      );
    }

    if (items.length === 0) {
      return (
        <Card>
          <Text variant="bodyMedium" colorToken="textSecondary">
            아직 상담 기록이 없습니다.
          </Text>
        </Card>
      );
    }

    return items.map((item) => {
      const snapshot = item.subjectSnapshot as StoredSnapshot;
      const name = snapshot?.subject?.displayName ?? '대상';
      const relationship = snapshot?.subject?.relationship ?? null;
      const preview = summaryPreview(item.summary);

      // Open and delete are SIBLINGS, not nested: a button inside the card's Pressable would also fire the
      // card's open (a click bubbles on web).
      return (
        <Card key={item.id}>
          <Stack gap="sm">
            <Pressable
              onPress={() => openConversation(item)}
              accessibilityRole="button"
              accessibilityLabel={`${name} ${formatDate(item.updatedAt)} 상담 열기`}
            >
              <Stack gap="xs">
                <Stack direction="row" gap="xs" align="center">
                  <Text variant="bodyLarge">{name}</Text>
                  {relationship ? (
                    <Text variant="bodySmall" colorToken="textSecondary">
                      · {relationship}
                    </Text>
                  ) : null}
                </Stack>
                <Text variant="bodySmall" colorToken="textSecondary">
                  {formatDate(item.updatedAt)}
                </Text>
                {preview ? (
                  <Text variant="bodySmall" colorToken="textSecondary">
                    {preview}
                  </Text>
                ) : null}
              </Stack>
            </Pressable>
            <Button
              label="상담 삭제"
              variant="tertiary"
              onPress={() => askDelete(item)}
              accessibilityLabel={`${name} ${formatDate(item.updatedAt)} 상담 삭제`}
            />
          </Stack>
        </Card>
      );
    });
  };

  return (
    <Screen frame>
      <Stack gap="xxl" style={{ flex: 1, paddingTop: 24 }}>
        <Stack gap="xs">
          <Text variant="headingLarge">상담 기록</Text>
          <Text variant="bodyMedium" colorToken="textSecondary">
            과거 상담을 선택하면 그 상담을 이어서 볼 수 있습니다.
          </Text>
        </Stack>

        <Stack gap="sm">{renderBody()}</Stack>

        <Button label="뒤로" variant="secondary" onPress={() => router.back()} />
      </Stack>
      <DetailBottomNav active="my" />

      <DeleteConfirmSheet
        visible={pendingDelete !== null}
        title="이 상담을 삭제할까요?"
        lines={CONVERSATION_DELETE_LINES}
        confirmLabel="삭제"
        busy={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </Screen>
  );
}
