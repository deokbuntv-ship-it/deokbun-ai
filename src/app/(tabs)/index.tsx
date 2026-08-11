import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { InsightCard } from '@/components/InsightCard';
import { ListRow } from '@/components/ListRow';
import { PersonSelectorSheet } from '@/components/PersonSelectorSheet';
import { QuestionComposer } from '@/components/QuestionComposer';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import {
  conversationService,
  type ConversationSummaryItem,
} from '@/features/chat';
import { isSavedSubjectId, useConsultationDraft } from '@/features/consultation';
import { fortuneMailService, type FortuneMailItem } from '@/features/fortune';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/theme';

// 01_HOME — Personal AI Consultation Hub (Stitch v4). Greeting → question
// composer → popular questions → recent consultation → recent fortune mail. The
// popular-question list is a data array (server-replaceable). Recent items come
// from real services; fortune mail is empty until the engine ships (no mock).

// Server-replaceable list (not tightly coupled to UI). Later: fetch from server.
const POPULAR_QUESTIONS: string[] = [
  '올해 재물운의 흐름이 어떻게 될까?',
  '이직을 준비하는데 언제가 좋을까?',
  '올해 나에게 올 가장 큰 변화는?',
  '새로운 인연을 만날 수 있을까?',
  '건강 측면에서 조심해야 할 것은?',
];
const QUICK_PROMPTS: string[] = [
  '이직하기 좋은 시기가 언제야?',
  '올해 재물운은 어때?',
];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return '늦은 밤이에요.';
  if (h < 12) return '좋은 아침이에요.';
  if (h < 18) return '좋은 오후예요.';
  return '편안한 저녁이에요.';
}

function formatWhen(iso: string | null): string {
  if (!iso) return '';
  const day = iso.slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);
  return day === today ? '오늘' : day;
}

function preview(summary: string | null): string | undefined {
  if (!summary) return undefined;
  const t = summary.trim();
  if (!t) return undefined;
  return t.length > 60 ? `${t.slice(0, 60)}…` : t;
}

export default function HomeScreen() {
  const router = useRouter();
  const { draft } = useConsultationDraft();
  const subject = draft.subject;
  const subjectId =
    subject && isSavedSubjectId(subject.id) ? subject.id : null;

  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  const [sheetVisible, setSheetVisible] = useState(false);
  const [recent, setRecent] = useState<ConversationSummaryItem | null>(null);
  const [mail, setMail] = useState<FortuneMailItem | null>(null);
  // Time-of-day greeting must be deterministic on first render so the web static
  // export hydrates without a text mismatch (React #418). Resolve after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let active = true;
    if (!subjectId) {
      setRecent(null);
      return;
    }
    conversationService
      .listConversationsForSubject(subjectId)
      .then((rows) => {
        if (active) setRecent(rows[0] ?? null);
      })
      .catch(() => {
        if (active) setRecent(null);
      });
    return () => {
      active = false;
    };
  }, [subjectId]);

  useEffect(() => {
    let active = true;
    fortuneMailService
      .listMail(subjectId)
      .then((rows) => {
        if (active) setMail(rows[0] ?? null);
      })
      .catch(() => {
        if (active) setMail(null);
      });
    return () => {
      active = false;
    };
  }, [subjectId]);

  // Start a (new) consultation with an optional prefilled question. UI never
  // calls the LLM — this only navigates into the chat screen.
  const startConsult = (question: string) => {
    if (!subject) {
      setSheetVisible(true);
      return;
    }
    router.push({
      pathname: '/chat',
      params: question ? { q: question, startNew: '1' } : { startNew: '1' },
    });
  };

  return (
    <Screen padded={false}>
      <AppHeader
        brand
        showSwitcher
        subjectLabel={subject?.displayName ?? '나'}
        onSwitcher={() => setSheetVisible(true)}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wrapper}>
          <Stack gap="xl">
            <Text variant="displayMedium">
              {mounted ? greeting() : '안녕하세요.'}
              {'\n'}오늘은 무엇이 궁금하세요?
            </Text>

            <QuestionComposer onSubmit={startConsult} />

            <Stack direction="row" gap="sm" style={styles.chipWrap}>
              {QUICK_PROMPTS.map((q) => (
                <Chip key={q} label={q} onPress={() => startConsult(q)} />
              ))}
            </Stack>

            {/* 지금 많이 물어보는 질문 (server-replaceable list) */}
            <Stack gap="xs">
              <Text variant="headingMedium">지금 많이 물어보는 질문</Text>
              <View>
                {POPULAR_QUESTIONS.map((q, i) => (
                  <View
                    key={q}
                    style={
                      i > 0
                        ? { borderTopWidth: 1, borderTopColor: theme.border }
                        : undefined
                    }
                  >
                    <ListRow label={q} onPress={() => startConsult(q)} />
                  </View>
                ))}
              </View>
            </Stack>

            {/* 최근 상담 (real) */}
            <Stack gap="sm">
              <Text variant="headingMedium">최근 상담</Text>
              {recent ? (
                <InsightCard
                  timestamp={formatWhen(recent.updatedAt)}
                  title={`${subject?.displayName ?? '나'}님 상담`}
                  body={preview(recent.summary)}
                  onPress={() =>
                    router.push({
                      pathname: '/chat',
                      params: { conversationId: recent.id },
                    })
                  }
                />
              ) : (
                <Card>
                  <Text variant="bodyMedium" colorToken="textSecondary">
                    아직 상담 내역이 없어요. 위에서 궁금한 점을 물어보세요.
                  </Text>
                </Card>
              )}
            </Stack>

            {/* 최근 운세우편 (empty until fortune engine — no mock) */}
            <Stack gap="sm">
              <Text variant="headingMedium">최근 운세우편</Text>
              {mail ? (
                <InsightCard
                  tag={{ label: mail.category, tone: mail.categoryTone }}
                  title={mail.title}
                  body={mail.preview}
                  ctaLabel="확인하기"
                  onCta={() => router.push('/inbox')}
                />
              ) : (
                <Card>
                  <Stack gap="md">
                    <Text variant="bodyMedium" colorToken="textSecondary">
                      아직 도착한 운세우편이 없어요. 운세 엔진 연결 후 개인화된
                      운세가 이곳으로 도착합니다.
                    </Text>
                    <Button
                      label="운세우편함 열기"
                      variant="secondary"
                      onPress={() => router.push('/inbox')}
                    />
                  </Stack>
                </Card>
              )}
            </Stack>
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
