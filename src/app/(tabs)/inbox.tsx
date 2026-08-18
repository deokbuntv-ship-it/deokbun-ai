import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { InsightCard } from '@/components/InsightCard';
import { PersonSelectorSheet } from '@/components/PersonSelectorSheet';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import { toReportListItem } from '@/features/chat/report/reportPresentation';
import { reportService, type ConsultationReport } from '@/features/chat/report/reportService';
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
//
// A primary [운세]|[보고서] section toggle (Commercial UX V4 §12/§13) switches the feed between the
// fortune insights (above) and the user's saved consultation reports (reportService.listReports —
// owner-only). Reports are a different artifact with their own detail route (/report/[id]), so they
// are a separate section rather than mixed into the fortune sub-filters.
type Status = 'loading' | 'ready' | 'error';
type ReportStatus = 'idle' | 'loading' | 'ready' | 'error';
type Section = 'fortune' | 'report' | 'compat';

export default function FortuneInboxScreen() {
  const router = useRouter();
  const { draft } = useConsultationDraft();
  const { isAuthenticated } = useAuth();
  const subject = draft.subject;
  const subjectId =
    subject && isSavedSubjectId(subject.id) ? subject.id : null;

  const [section, setSection] = useState<Section>('fortune');
  const [filter, setFilter] = useState<FortuneMailFilter>('all');
  const [items, setItems] = useState<FortuneMailItem[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [reports, setReports] = useState<ConsultationReport[]>([]);
  const [reportStatus, setReportStatus] = useState<ReportStatus>('idle');
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

  // Load saved reports when (and each time) the 보고서 section is opened — newest first, owner-scoped
  // by RLS. Runs on section change, not every render (§29-analog: no per-render DB query).
  useEffect(() => {
    if (section !== 'report' && section !== 'compat') return;
    if (!isAuthenticated) {
      setReports([]);
      setReportStatus('ready');
      return;
    }
    let active = true;
    setReportStatus('loading');
    // 보고서 → consultation reports · 궁합 → compatibility reports (owner-scoped by RLS, newest first).
    reportService
      .listReportsByType(section === 'compat' ? 'compatibility' : 'consultation')
      .then((rows) => {
        if (!active) return;
        setReports(rows);
        setReportStatus('ready');
      })
      .catch(() => {
        if (active) setReportStatus('error');
      });
    return () => {
      active = false;
    };
  }, [section, isAuthenticated]);

  const visible = items.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'important') return item.important;
    if (filter === 'monthly') return item.category.includes('월간');
    if (filter === 'move') return item.category.includes('이동') || item.category.includes('사업');
    return true;
  });

  const reportItems = reports.map(toReportListItem);

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
            {/* Primary section toggle — 운세 insights vs saved 보고서 (§12). */}
            <Stack direction="row" gap="sm" style={styles.chipWrap}>
              <Chip
                label="운세"
                selected={section === 'fortune'}
                onPress={() => setSection('fortune')}
              />
              <Chip
                label="보고서"
                selected={section === 'report'}
                onPress={() => setSection('report')}
              />
              <Chip
                label="궁합"
                selected={section === 'compat'}
                onPress={() => setSection('compat')}
              />
            </Stack>

            {section === 'fortune' ? (
              <>
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
              </>
            ) : !isAuthenticated ? (
              <Card radius="xl">
                <Stack gap="md">
                  <Text variant="bodyMedium" colorToken="textSecondary">
                    로그인하면 저장한 상담 보고서를 볼 수 있어요.
                  </Text>
                  <Button label="로그인하기" radius="lg" onPress={() => router.push('/login')} />
                </Stack>
              </Card>
            ) : reportStatus === 'loading' || reportStatus === 'idle' ? (
              <Card radius="xl">
                <Text variant="bodyMedium" colorToken="textSecondary">
                  상담 보고서를 불러오고 있어요.
                </Text>
              </Card>
            ) : reportStatus === 'error' ? (
              <Card radius="xl">
                <Text variant="bodyMedium" colorToken="textSecondary">
                  상담 보고서를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
                </Text>
              </Card>
            ) : reportItems.length === 0 ? (
              <Card radius="xl">
                <Stack gap="sm">
                  {section === 'compat' ? (
                    <>
                      <Text variant="headingMedium">아직 저장된 궁합이 없어요.</Text>
                      <Text variant="bodyMedium" colorToken="textSecondary">
                        궁합을 본 뒤 보고서를 만들면 이곳에 저장돼요.
                      </Text>
                      <Button label="궁합 보러 가기" radius="lg" onPress={() => router.push('/compatibility')} />
                    </>
                  ) : (
                    <>
                      <Text variant="headingMedium">아직 저장된 상담 보고서가 없어요.</Text>
                      <Text variant="bodyMedium" colorToken="textSecondary">
                        AI 상담을 진행한 뒤 보고서를 만들어 이곳에 저장할 수 있어요.
                      </Text>
                    </>
                  )}
                </Stack>
              </Card>
            ) : (
              <Stack gap="lg">
                {reportItems.map((r) => (
                  <InsightCard
                    key={r.id}
                    tag={{ label: section === 'compat' ? '궁합' : '보고서', tone: 'secondary' }}
                    timestamp={r.dateLabel}
                    muted
                    title={r.title}
                    body={r.preview}
                    onPress={() =>
                      router.push({ pathname: '/report/[id]', params: { id: r.id } })
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
