import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { InsightCard } from '@/components/InsightCard';
import { PersonSelectorSheet } from '@/components/PersonSelectorSheet';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import { isSavedSubjectId, useConsultationDraft } from '@/features/consultation';
import {
  FORTUNE_MAIL_FILTERS,
  fortuneMailService,
  type FortuneMailFilter,
  type FortuneMailItem,
} from '@/features/fortune';

// 04_FORTUNE_INBOX — Personalized Insight Feed (Stitch _3), NOT an email inbox.
// The fortune engine is not connected, so the list is empty and the screen shows
// a truthful "아직 도착한 운세우편이 없어요" state (제3조 Mock 금지). Filter chips
// + InsightCard rendering are ready for real data; unread = small insight point.
type Status = 'loading' | 'ready' | 'error';

export default function FortuneInboxScreen() {
  const router = useRouter();
  const { draft } = useConsultationDraft();
  const subject = draft.subject;
  const subjectId =
    subject && isSavedSubjectId(subject.id) ? subject.id : null;

  const [filter, setFilter] = useState<FortuneMailFilter>('all');
  const [items, setItems] = useState<FortuneMailItem[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [sheetVisible, setSheetVisible] = useState(false);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    fortuneMailService
      .listMail(subjectId)
      .then((rows) => {
        if (!active) return;
        setItems(rows);
        setStatus('ready');
      })
      .catch(() => {
        if (active) setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [subjectId]);

  const visible = items.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'important') return item.important;
    if (filter === 'monthly') return item.category.includes('월간');
    if (filter === 'move') return item.category.includes('이동') || item.category.includes('사업');
    return true;
  });

  return (
    <Screen padded={false}>
      <AppHeader
        title="운세우편함"
        showSwitcher
        subjectLabel={subject?.displayName ?? '나'}
        onSwitcher={() => setSheetVisible(true)}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wrapper}>
          <Stack gap="lg">
            <Stack direction="row" gap="sm" style={styles.chipWrap}>
              {FORTUNE_MAIL_FILTERS.map((f) => (
                <Chip
                  key={f.key}
                  label={f.label}
                  selected={f.key === filter}
                  onPress={() => setFilter(f.key)}
                />
              ))}
            </Stack>

            {status === 'loading' ? (
              <Card radius="xl">
                <Text variant="bodyMedium" colorToken="textSecondary">
                  운세우편을 확인하고 있어요.
                </Text>
              </Card>
            ) : status === 'error' ? (
              <Card radius="xl">
                <Text variant="bodyMedium" colorToken="textSecondary">
                  운세우편을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
                </Text>
              </Card>
            ) : visible.length === 0 ? (
              <Card radius="xl">
                <Stack gap="sm">
                  <Text variant="headingMedium">아직 도착한 운세우편이 없어요</Text>
                  <Text variant="bodyMedium" colorToken="textSecondary">
                    덕분AI가 먼저 발견한 개인화된 운세 인사이트가 준비되면 이곳으로
                    도착합니다. 운세 계산 엔진을 연결하고 있어요.
                  </Text>
                </Stack>
              </Card>
            ) : (
              <Stack gap="lg">
                {visible.map((item) => (
                  <InsightCard
                    key={item.id}
                    tag={{ label: item.category, tone: item.categoryTone }}
                    timestamp={item.timestamp}
                    unread={item.unread}
                    muted={!item.unread}
                    title={item.title}
                    body={item.preview}
                    onPress={() =>
                      router.push({
                        pathname: '/mail-detail',
                        params: { id: item.id },
                      })
                    }
                  />
                ))}
              </Stack>
            )}
          </Stack>
        </View>
      </ScrollView>

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
    paddingBottom: 40,
    alignItems: 'center',
  },
  wrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  chipWrap: {
    flexWrap: 'wrap',
  },
});
