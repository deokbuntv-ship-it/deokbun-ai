import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { DetailBottomNav } from '@/components/DetailBottomNav';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  notificationPreferencesService,
  registerForPush,
  trackRetentionEvent,
  type NotificationPreferences,
  type PushRegistrationStatus,
} from '@/features/retention';
import { expoTokenAcquirer } from '@/features/retention/push/expoTokenAcquirer';
import { getOrCreateDeviceId } from '@/features/retention/push/deviceId';
import { colors } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// 알림 설정 (§4.3). A preference is NOT the OS notification permission — the copy says so plainly, so we never
// falsely claim "푸시가 켜졌습니다" while external push is unconfigured (§4.3/§11). Service categories are kept
// visually separate from the marketing category (§4.1). 0 LLM.
type Row = { key: keyof NotificationPreferences; label: string; desc: string };

const SERVICE_ROWS: Row[] = [
  { key: 'monthlyFortune', label: '월별운세 알림', desc: '새 달의 운세가 준비되면 알려드려요.' },
  { key: 'birthday', label: '생일 운세 알림', desc: '생일에 축하 메시지와 흐름 안내를 받아요.' },
  { key: 'importantSchedule', label: '중요한 일정 알림', desc: '저장해둔 일정이 다가오면 알려드려요.' },
  { key: 'serviceNotice', label: '서비스 안내', desc: '서비스 운영에 관한 안내를 받아요.' },
];
const MARKETING_ROW: Row = { key: 'marketing', label: '혜택·이벤트 알림', desc: '이벤트·혜택 소식을 받아요. (선택)' };

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const { isAuthenticated } = useAuth();

  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);
  const [loaded, setLoaded] = useState(false);
  // Device push registration (§J8.6) — contextual (only when the user taps), never at cold start.
  const [pushStatus, setPushStatus] = useState<PushRegistrationStatus | null>(null);
  const [pushBusy, setPushBusy] = useState(false);

  const enableDevicePush = async () => {
    setPushBusy(true);
    try {
      const deviceId = await getOrCreateDeviceId();
      const result = await registerForPush(deviceId, expoTokenAcquirer);
      setPushStatus(result.status);
    } finally {
      setPushBusy(false);
    }
  };

  const PUSH_STATUS_COPY: Record<PushRegistrationStatus, string> = {
    registered: '이 기기에서 알림을 받을 수 있어요.',
    permission_denied: '기기 설정에서 알림 권한을 허용해 주세요.',
    no_token: '알림 토큰을 받지 못했어요. 잠시 후 다시 시도해 주세요.',
    unavailable: '이 빌드에서는 기기 알림이 아직 지원되지 않아요. (준비 중)',
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    notificationPreferencesService.get().then((p) => {
      if (active) {
        setPrefs(p);
        setLoaded(true);
      }
    });
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const toggle = (key: keyof NotificationPreferences) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next); // optimistic
    void notificationPreferencesService.update({ [key]: next[key] });
    trackRetentionEvent('notification_pref_updated', { category: key });
  };

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/my');
  };

  if (!isAuthenticated) return <Redirect href="/login" />;

  const renderRow = (r: Row) => (
    <View key={r.key} style={styles.row}>
      <View style={styles.rowText}>
        <Text variant="bodyLarge" style={{ fontWeight: '600' }}>{r.label}</Text>
        <Text variant="bodySmall" colorToken="textSecondary">{r.desc}</Text>
      </View>
      <Switch
        // 보이는 라벨은 왼쪽 <Text> 에만 있고 스위치와 연결돼 있지 않았다 — 보조기술에는
        // '스위치, 꺼짐' 으로만 읽혔다. 무엇을 켜고 끄는지 이름으로 준다.
        accessibilityLabel={r.label}
        value={prefs[r.key]}
        onValueChange={() => toggle(r.key)}
        trackColor={{ true: theme.primary, false: theme.border }}
        disabled={!loaded}
      />
    </View>
  );

  return (
    <Screen padded={false} frame>
      <AppHeader title="알림 설정" showBack onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          <Stack gap="lg">
            <Card radius="xl">
              <Stack gap="md">{SERVICE_ROWS.map(renderRow)}</Stack>
            </Card>

            <Card radius="xl">
              <Stack gap="md">{renderRow(MARKETING_ROW)}</Stack>
            </Card>

            {/* Device push registration — contextual opt-in (§J8.6). Honest status; never claims push works when
                the provider/native build isn't ready. */}
            <Card radius="xl">
              <Stack gap="sm">
                <Text variant="bodyLarge" style={{ fontWeight: '600' }}>기기 푸시 알림</Text>
                <Text variant="bodySmall" colorToken="textSecondary">
                  이 기기에서 푸시 알림을 받으려면 아래에서 등록해 주세요. 위의 알림 설정과 별개로 기기 권한이 필요해요.
                </Text>
                <Button
                  label={pushBusy ? '등록 중…' : '기기 알림 켜기'}
                  variant="secondary"
                  radius="lg"
                  disabled={pushBusy}
                  onPress={() => void enableDevicePush()}
                />
                {pushStatus ? (
                  <Text variant="bodySmall" colorToken="textSecondary">{PUSH_STATUS_COPY[pushStatus]}</Text>
                ) : null}
              </Stack>
            </Card>

            <Text variant="bodySmall" colorToken="textSecondary" style={styles.note}>
              이 설정은 앱에서 어떤 알림을 받을지 선택하는 항목이에요. 기기(휴대폰)의 알림 권한과는 별개이며,
              실제 푸시 발송은 추후 순차적으로 제공될 예정이에요.
            </Text>
          </Stack>
        </View>
      </ScrollView>
      <DetailBottomNav active="my" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40, alignItems: 'center' },
  wrapper: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  rowText: { flex: 1, gap: 2 },
  note: { paddingHorizontal: 4, lineHeight: 18 },
});
