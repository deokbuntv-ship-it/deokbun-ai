import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  notificationPreferencesService,
  trackRetentionEvent,
  type NotificationPreferences,
} from '@/features/retention';
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

            <Text variant="bodySmall" colorToken="textSecondary" style={styles.note}>
              이 설정은 앱에서 어떤 알림을 받을지 선택하는 항목이에요. 기기(휴대폰)의 알림 권한과는 별개이며,
              실제 푸시 발송은 추후 순차적으로 제공될 예정이에요.
            </Text>
          </Stack>
        </View>
      </ScrollView>
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
