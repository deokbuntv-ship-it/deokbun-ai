import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/AppHeader';
import { Card } from '@/components/Card';
import { InsightCard } from '@/components/InsightCard';
import { PersonSelectorSheet } from '@/components/PersonSelectorSheet';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
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
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

// 02_CONSULTATION_LIST (Stitch _4) — Conversation history for the active subject.
// 진행 중 상담 (latest) + 이전 상담 내역 + 새 상담 FAB. Distinct from HOME: this is
// history-centric. Real data via conversationService; subject chosen via 나 ▾.
type Status = 'loading' | 'ready' | 'error' | 'no-subject';

type StoredSnapshot = {
  subject: ConsultationSubject | null;
  birthInfo: BirthInfoDraft | null;
} | null;

function when(iso: string | null): string {
  if (!iso) return '';
  const day = iso.slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);
  return day === today ? '오늘' : day;
}

function preview(summary: string | null): string | undefined {
  if (!summary) return undefined;
  const t = summary.trim();
  if (!t) return undefined;
  return t.length > 70 ? `${t.slice(0, 70)}…` : t;
}

export default function ConsultationListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  const { draft, updateSubject, updateBirthInfo } = useConsultationDraft();
  const subject = draft.subject;
  const subjectId =
    subject && isSavedSubjectId(subject.id) ? subject.id : null;

  const [items, setItems] = useState<ConversationSummaryItem[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [sheetVisible, setSheetVisible] = useState(false);
  const loadToken = useRef(0);

  const load = useCallback(() => {
    if (!subjectId) {
      setItems([]);
      setStatus('no-subject');
      return;
    }
    const token = loadToken.current + 1;
    loadToken.current = token;
    setStatus('loading');
    conversationService
      .listConversationsForSubject(subjectId)
      .then((rows) => {
        if (token !== loadToken.current) return;
        setItems(rows);
        setStatus('ready');
      })
      .catch(() => {
        if (token !== loadToken.current) return;
        setStatus('error');
      });
  }, [subjectId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const openConversation = (item: ConversationSummaryItem) => {
    const snap = item.subjectSnapshot as StoredSnapshot;
    if (snap?.subject && snap?.birthInfo) {
      updateSubject(snap.subject);
      updateBirthInfo(snap.birthInfo);
    }
    router.push({ pathname: '/chat', params: { conversationId: item.id } });
  };

  const startNew = () => {
    if (!subject) {
      setSheetVisible(true);
      return;
    }
    router.push({ pathname: '/chat', params: { startNew: '1' } });
  };

  const [current, ...previous] = items;

  return (
    <Screen padded={false}>
      <AppHeader
        title="상담"
        showSwitcher
        subjectLabel={subject?.displayName ?? '나'}
        onSwitcher={() => setSheetVisible(true)}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wrapper}>
          {status === 'no-subject' ? (
            <Card radius="xl">
              <Stack gap="md">
                <Text variant="bodyMedium" colorToken="textSecondary">
                  먼저 분석 대상자를 선택해 주세요. 상단의 "나 ▾"에서 대상을 고를
                  수 있어요.
                </Text>
              </Stack>
            </Card>
          ) : status === 'loading' ? (
            <Card radius="xl">
              <Text variant="bodyMedium" colorToken="textSecondary">
                상담 내역을 불러오는 중입니다...
              </Text>
            </Card>
          ) : status === 'error' ? (
            <Card radius="xl">
              <Stack gap="sm">
                <Text variant="bodyMedium" colorToken="textSecondary">
                  상담 내역을 불러오지 못했습니다.
                </Text>
                <Pressable onPress={load} accessibilityRole="button">
                  <Text variant="bodyMedium" colorToken="primary">
                    다시 시도
                  </Text>
                </Pressable>
              </Stack>
            </Card>
          ) : items.length === 0 ? (
            <Card radius="xl">
              <Text variant="bodyMedium" colorToken="textSecondary">
                아직 상담 내역이 없어요. 아래 "새 상담"으로 첫 상담을 시작해
                보세요.
              </Text>
            </Card>
          ) : (
            <Stack gap="xxl">
              {/* 진행 중 상담 (most recent) */}
              <Stack gap="md">
                <Text variant="bodyLarge" style={styles.sectionTitle}>
                  진행 중 상담
                </Text>
                <InsightCard
                  tag={{ label: '최근 대화', tone: 'neutral' }}
                  timestamp={when(current.updatedAt)}
                  title={`${subject?.displayName ?? '나'}님과의 상담`}
                  body={preview(current.summary)}
                  onPress={() => openConversation(current)}
                />
              </Stack>

              {/* 이전 상담 내역 */}
              {previous.length > 0 ? (
                <Stack gap="md">
                  <Text variant="bodyLarge" style={styles.sectionTitle}>
                    이전 상담 내역
                  </Text>
                  <View>
                    {previous.map((item, i) => (
                      <Pressable
                        key={item.id}
                        onPress={() => openConversation(item)}
                        accessibilityRole="button"
                        style={[
                          styles.row,
                          i > 0
                            ? { borderTopWidth: 1, borderTopColor: theme.border }
                            : undefined,
                        ]}
                      >
                        <Stack gap="xs" style={{ flex: 1 }}>
                          <Text style={styles.rowTitle}>
                            {`${subject?.displayName ?? '나'}님 상담`}
                          </Text>
                          {preview(item.summary) ? (
                            <Text
                              variant="bodyMedium"
                              colorToken="textSecondary"
                              numberOfLines={1}
                            >
                              {preview(item.summary)}
                            </Text>
                          ) : null}
                        </Stack>
                        <Text variant="bodySmall" colorToken="textSecondary">
                          {when(item.updatedAt)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </Stack>
              ) : null}
            </Stack>
          )}
        </View>
      </ScrollView>

      {/* 새 상담 FAB */}
      <Pressable
        onPress={startNew}
        accessibilityRole="button"
        accessibilityLabel="새 상담"
        style={[
          styles.fab,
          { backgroundColor: theme.primary, bottom: insets.bottom + 76 },
        ]}
      >
        <Text variant="bodyLarge" colorToken="primaryText" style={styles.fabLabel}>
          +  새 상담
        </Text>
      </Pressable>

      <PersonSelectorSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120,
    alignItems: 'center',
  },
  wrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  sectionTitle: {
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    minHeight: 68,
  },
  rowTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    right: 20,
    borderRadius: radius.pill,
    paddingHorizontal: 28,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  fabLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
});
