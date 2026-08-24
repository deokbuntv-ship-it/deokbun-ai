import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
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

      return (
        <Pressable
          key={item.id}
          onPress={() => openConversation(item)}
          accessibilityRole="button"
          accessibilityLabel={`${name} ${formatDate(item.updatedAt)} 상담 열기`}
        >
          <Card>
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
          </Card>
        </Pressable>
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
    </Screen>
  );
}
