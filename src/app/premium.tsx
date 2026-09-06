import { Redirect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { DetailBottomNav } from '@/components/DetailBottomNav';
import { LineIcon } from '@/components/LineIcon';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import { PremiumReportView } from '@/features/chat/report/PremiumReportView';
import type { PremiumReportView as PremiumReportVM } from '@/features/chat/report/reportPresentation';
import { DUK_PRICES, dukLabel } from '@/features/duk/pricing';
import { toPremiumProductView } from '@/features/premium/presentation/premiumReportProjection';
import { premiumReportService } from '@/features/premium/services/premiumReportService';
import type { PremiumReportPayload } from '@/features/premium/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, spacing } from '@/theme';

// 프리미엄 리포트 — 구매 확인 → 생성(약 40초) → 결과. The RESULT is rendered by the existing editorial
// renderer (PremiumReportView), reached through a projection; this screen owns only the states around it.
//
// LOADING (§3): the generation measured 34.7~39.4s on staging. A spinner for forty seconds reads as a hang,
// so the wait shows WHAT is being built, stage by stage, with the elapsed seconds. The stages advance on a
// TIMER, not on server progress — the Edge reports none — so the copy says "약" and there is no percentage
// anywhere. A fake progress bar would be a lie told to a reader who just spent 50덕.
type Phase = 'confirm' | 'working' | 'ready' | 'grounding' | 'insufficient' | 'busy' | 'error';

// Ordered by the real server sequence (원국 → 대운/세운 → 12개월 → 리포트 작성). The thresholds are the
// measured shape of that work, not a promise: the last stage holds until the answer arrives.
const STAGES: { atSeconds: number; label: string }[] = [
  { atSeconds: 0, label: '원국을 세우는 중이에요' },
  { atSeconds: 5, label: '지금 지나는 흐름을 확인하고 있어요' },
  { atSeconds: 12, label: '앞으로 열두 달을 한 달씩 계산하고 있어요' },
  { atSeconds: 20, label: '읽기 좋은 글로 정리하고 있어요' },
];
/** Past this the run is almost certainly lost; the Edge's own LLM deadline is 90s. */
const GIVE_UP_SECONDS = 100;

export default function PremiumReportScreen() {
  const router = useRouter();
  const { authState } = useAuth();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  const [phase, setPhase] = useState<Phase>('confirm');
  const [elapsed, setElapsed] = useState(0);
  const [view, setView] = useState<PremiumReportVM | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [shortfall, setShortfall] = useState<number>(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };
  useEffect(() => stopTimer, []);

  const run = useCallback(async () => {
    setPhase('working');
    setElapsed(0);
    setNotice(null);
    stopTimer();
    timer.current = setInterval(() => setElapsed((s) => s + 1), 1000);

    const nowIso = new Date().toISOString();
    const outcome = await premiumReportService.generate(nowIso);
    stopTimer();

    if (outcome.status === 'ok') {
      setView(toPremiumProductView(outcome.payload));
      setPhase('ready');
      // Save AFTER showing: a library write must never stand between the reader and what they paid for.
      const row = await premiumReportService.save(outcome.payload as PremiumReportPayload);
      setSaved(row?.id ?? null);
      return;
    }
    if (outcome.status === 'grounding_unavailable') {
      setNotice(outcome.message);
      setPhase('grounding');
      return;
    }
    if (outcome.status === 'insufficient_duk') {
      setShortfall(outcome.shortfall);
      setPhase('insufficient');
      return;
    }
    if (outcome.status === 'busy') { setPhase('busy'); return; }
    setPhase('error');
  }, []);

  if (authState.status === 'unauthenticated') return <Redirect href="/login" />;

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/consult');
  };

  const stageIndex = STAGES.reduce((acc, s, i) => (elapsed >= s.atSeconds ? i : acc), 0);
  const overdue = elapsed >= GIVE_UP_SECONDS;

  return (
    <Screen padded={false} frame>
      <AppHeader title="프리미엄 리포트" showBack showBell onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          {phase === 'confirm' ? (
            <Card radius="xl">
              <Stack gap="md">
                <Text variant="headingMedium">타고난 결과 앞으로 열두 달을 한 번에 봅니다</Text>
                <Text variant="bodyMedium" colorToken="textSecondary">
                  원국 전반, 지금 지나는 흐름, 그리고 다가오는 열두 달을 한 달씩 짚어 한 편의 글로 정리해
                  드려요. 만드는 데 40초쯤 걸리고, 다 되면 우편함에 저장됩니다.
                </Text>
                <Text variant="bodySmall" colorToken="textSecondary">
                  {`${dukLabel(DUK_PRICES.premium_report)} · 근거를 세울 수 없으면 덕은 차감되지 않아요`}
                </Text>
                <Button label={`${dukLabel(DUK_PRICES.premium_report)}으로 리포트 받기`} radius="lg" onPress={() => void run()} />
              </Stack>
            </Card>
          ) : phase === 'working' ? (
            <Card radius="xl">
              <Stack gap="md">
                <Text variant="headingMedium">리포트를 만들고 있어요</Text>
                <Stack gap="sm">
                  {STAGES.map((s, i) => {
                    const done = i < stageIndex;
                    const active = i === stageIndex;
                    return (
                      <View key={s.label} style={styles.stageRow}>
                        <LineIcon
                          name={done ? 'check' : 'sparkle'}
                          size={15}
                          color={done ? theme.secondary : active ? theme.textPrimary : theme.textMuted}
                        />
                        <Text
                          variant="bodyMedium"
                          colorToken={active ? 'textPrimary' : 'textSecondary'}
                          style={styles.stageLabel}
                        >
                          {s.label}
                        </Text>
                      </View>
                    );
                  })}
                </Stack>
                <Text variant="caption" colorToken="textSecondary">
                  {overdue
                    ? `${elapsed}초째 기다리는 중이에요. 평소보다 오래 걸리고 있어요.`
                    : `${elapsed}초 지났어요 · 보통 40초쯤 걸려요`}
                </Text>
                {overdue ? (
                  <Text variant="bodySmall" colorToken="textSecondary">
                    화면을 닫아도 괜찮아요. 만들어진 리포트는 우편함에 남습니다.
                  </Text>
                ) : null}
              </Stack>
            </Card>
          ) : phase === 'ready' && view ? (
            <Stack gap="lg">
              <PremiumReportView
                view={view}
                mode="owner"
                footer={
                  <Button
                    label={saved ? '우편함에서 다시 보기' : '우편함으로'}
                    radius="lg"
                    variant="secondary"
                    onPress={() => (saved ? router.push({ pathname: '/report/[id]', params: { id: saved } }) : router.push('/inbox'))}
                  />
                }
              />
              {saved === null ? (
                // Honest, and specific about what did NOT go wrong: the report exists, the charge stands,
                // only the library copy failed.
                <Card radius="xl">
                  <Text variant="bodySmall" colorToken="textSecondary">
                    우편함에 저장하지 못했어요. 지금 보시는 리포트는 그대로 유효하고 덕도 정상 처리됐어요.
                    화면을 닫으면 다시 열 수 없으니 필요한 부분은 지금 확인해 주세요.
                  </Text>
                </Card>
              ) : null}
            </Stack>
          ) : phase === 'grounding' ? (
            <Card radius="xl">
              <Stack gap="md">
                <Text variant="headingMedium">이 출생정보로는 리포트를 만들 수 없어요</Text>
                <Text variant="bodyMedium" colorToken="textSecondary">
                  {notice
                    ?? '등록하신 출생 정보로는 사주 원국을 세울 수 없었어요. 태어난 시각을 확인해 주세요.'}
                </Text>
                <Text variant="bodySmall" colorToken="textSecondary">
                  {`${dukLabel(DUK_PRICES.premium_report)}은 차감되지 않았어요.`}
                </Text>
                <Button label="출생정보 수정하기" radius="lg" onPress={() => router.push('/subjects')} />
              </Stack>
            </Card>
          ) : phase === 'insufficient' ? (
            <Card radius="xl">
              <Stack gap="md">
                <Text variant="headingMedium">덕이 조금 부족해요</Text>
                <Text variant="bodyMedium" colorToken="textSecondary">
                  {`프리미엄 리포트는 ${dukLabel(DUK_PRICES.premium_report)}이 필요해요. ${dukLabel(shortfall)}만 더 있으면 돼요.`}
                </Text>
                <Button label="덕 보러 가기" radius="lg" onPress={() => router.push('/wallet')} />
              </Stack>
            </Card>
          ) : (
            <Card radius="xl">
              <Stack gap="md">
                <Text variant="headingMedium">
                  {phase === 'busy' ? '조금 뒤에 다시 시도해 주세요' : '리포트를 만들지 못했어요'}
                </Text>
                <Text variant="bodyMedium" colorToken="textSecondary">
                  {phase === 'busy'
                    ? '지금 요청이 몰려 있어요. 잠시 뒤에 다시 눌러 주세요.'
                    : '만드는 도중에 문제가 생겼어요. 덕은 차감되지 않았어요.'}
                </Text>
                <Button label="다시 시도" radius="lg" onPress={() => void run()} />
              </Stack>
            </Card>
          )}
        </View>
      </ScrollView>
      <DetailBottomNav />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40, alignItems: 'center' },
  wrapper: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  // Icon + label on one line; the label wraps instead of pushing the row wide at 360dp.
  stageRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  stageLabel: { flex: 1 },
});
