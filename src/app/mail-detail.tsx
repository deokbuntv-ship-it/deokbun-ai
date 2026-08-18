import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { DetailBottomNav } from '@/components/DetailBottomNav';
import { LineIcon, type LineIconName } from '@/components/LineIcon';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { StatusBadge } from '@/components/StatusBadge';
import { Text } from '@/components/Text';
import { Timeline } from '@/components/Timeline';
import { MaxContentWidth } from '@/constants/theme';
import { fortuneMailService, type FortuneMailDetail } from '@/features/fortune';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

// Pick a decorative monochrome icon for a life-area card from its category label.
// Presentation only — never implies data the engine did not provide.
function areaIcon(category: string): LineIconName {
  if (category.includes('재물') || category.includes('금전')) return 'wallet';
  if (category.includes('사업') || category.includes('직장') || category.includes('업무'))
    return 'briefcase';
  if (category.includes('건강')) return 'leaf';
  if (category.includes('애정') || category.includes('대인') || category.includes('관계'))
    return 'heart';
  return 'sparkle';
}

// 05_FORTUNE_DETAIL (Stitch _2). 핵심요약 → 영역별 상태 → 핵심 주의 구간 →
// 월별 흐름 Timeline → "이 운세에 대해 AI에게 물어보기". No numeric scores/stars.
// The engine is not connected, so getMailDetail returns null and the screen
// shows a truthful state; the full renderer below activates with real data.
type Status = 'loading' | 'ready' | 'empty' | 'error';

export default function FortuneMailDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === 'string' ? params.id : '';

  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  const [detail, setDetail] = useState<FortuneMailDetail | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    let active = true;
    setStatus('loading');
    fortuneMailService
      .getMailDetail(id)
      .then((d) => {
        if (!active) return;
        setDetail(d);
        setStatus(d ? 'ready' : 'empty');
      })
      .catch(() => {
        if (active) setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [id]);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/inbox');
  };

  const askAI = () => {
    router.push({ pathname: '/chat', params: { startNew: '1' } });
  };

  return (
    <Screen padded={false} frame>
      <AppHeader title="운세우편" showBack onBack={handleBack} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wrapper}>
          {status === 'loading' ? (
            <Card radius="xl">
              <Text variant="bodyMedium" colorToken="textSecondary">
                운세우편을 불러오는 중입니다...
              </Text>
            </Card>
          ) : status !== 'ready' || !detail ? (
            <Card radius="xl">
              <Stack gap="sm">
                <Text variant="headingMedium">운세 엔진 연결 준비 중</Text>
                <Text variant="bodyMedium" colorToken="textSecondary">
                  개인화된 운세 상세는 운세 계산 엔진 연결 후 제공됩니다. 임의의
                  점수나 해석을 보여 드리지 않습니다.
                </Text>
              </Stack>
            </Card>
          ) : (
            <Stack gap="xl">
              {/* 핵심 요약 */}
              <Stack gap="md">
                <View style={styles.heroBadgeRow}>
                  <LineIcon name="sparkle" size={16} color={theme.secondary} />
                  <StatusBadge label={detail.headerLabel} tone="secondary" pill />
                </View>
                <Text variant="displayMedium">{detail.title}</Text>
                <Text variant="bodyLarge" colorToken="textSecondary">
                  {detail.summary}
                </Text>
              </Stack>

              {/* 영역별 상태 */}
              {detail.areas.length > 0 ? (
                <View style={styles.areaGrid}>
                  {detail.areas.map((area) => (
                    <View key={area.category} style={styles.areaCell}>
                      <Card radius="xl">
                        <Stack gap="sm">
                          <View style={styles.areaTop}>
                            <View style={[styles.iconChip, { backgroundColor: theme.backgroundElevated }]}>
                              <LineIcon
                                name={areaIcon(area.category)}
                                size={18}
                                color={theme.textSecondary}
                              />
                            </View>
                            <StatusBadge label={area.status} tone={area.statusTone} pill />
                          </View>
                          <Text variant="bodySmall" colorToken="textSecondary">
                            {area.category}
                          </Text>
                          <Text variant="bodyLarge" style={styles.bold}>
                            {area.title}
                          </Text>
                        </Stack>
                      </Card>
                    </View>
                  ))}
                </View>
              ) : null}

              {/* 핵심 주의 구간 */}
              {detail.caution ? (
                <Stack gap="md">
                  <View style={styles.sectionTitleRow}>
                    <LineIcon name="warning" size={18} color={theme.accent} />
                    <Text variant="headingMedium" style={styles.bold}>
                      핵심 주의 구간
                    </Text>
                  </View>
                  <View style={[styles.cautionCard, { backgroundColor: theme.primary }]}>
                    <Stack gap="md">
                      <View style={styles.periodPill}>
                        <Text variant="bodySmall" colorToken="primaryText" style={styles.bold}>
                          {detail.caution.periodLabel}
                        </Text>
                      </View>
                      <Text variant="headingLarge" colorToken="primaryText" style={styles.bold}>
                        {detail.caution.title}
                      </Text>
                      <Text variant="bodyMedium" colorToken="primaryText" style={styles.dim}>
                        {detail.caution.body}
                      </Text>
                    </Stack>
                  </View>
                </Stack>
              ) : null}

              {/* 월별 흐름 Timeline */}
              {detail.timeline.length > 0 ? (
                <Stack gap="md">
                  <Text variant="headingMedium" style={styles.bold}>
                    전체 흐름
                  </Text>
                  <Timeline items={detail.timeline} />
                </Stack>
              ) : null}

              {/* AI 이어서 질문 */}
              <Button
                label="이 운세에 대해 AI에게 물어보기"
                onPress={askAI}
                radius="lg"
                style={styles.askCta}
              />
            </Stack>
          )}
        </View>
      </ScrollView>

      <DetailBottomNav active="inbox" />
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
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  areaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  areaCell: {
    width: '50%',
    padding: 6,
  },
  areaTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconChip: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cautionCard: {
    borderRadius: radius.xl,
    padding: 20,
  },
  periodPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  askCta: {
    minHeight: 56,
  },
  bold: {
    fontWeight: '700',
  },
  dim: {
    opacity: 0.75,
  },
});
