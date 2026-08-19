import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import {
  LIFE_EVENT_TYPE_LABEL,
  lifeEventService,
  trackRetentionEvent,
  type LifeEvent,
  type LifeEventType,
} from '@/features/retention';
import { colors } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// 중요한 일정 (§8). A user's KNOWN, USER-ENTERED dates. Persisting requires an explicit action — filling this
// form and tapping 저장 IS the confirmation (§8.2); nothing is ever saved silently from chat (§8.1). Minimal
// data (title + type + date). Reminders are preference-controlled elsewhere; per-event toggle here. 0 LLM.
const TYPES: LifeEventType[] = ['MOVE', 'INTERVIEW', 'EXAM', 'CONTRACT', 'TRAVEL', 'MEETING', 'OTHER'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default function LifeEventsScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const { isAuthenticated } = useAuth();

  const [events, setEvents] = useState<LifeEvent[]>([]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<LifeEventType>('OTHER');
  const [date, setDate] = useState('');
  const [reminder, setReminder] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = () => {
    lifeEventService.list().then(setEvents).catch(() => setEvents([]));
  };
  useEffect(() => {
    if (isAuthenticated) reload();
  }, [isAuthenticated]);

  const add = async () => {
    setError(null);
    if (title.trim().length === 0) { setError('일정 이름을 입력해 주세요.'); return; }
    if (!DATE_RE.test(date)) { setError('날짜를 2026-09-20 형식으로 입력해 주세요.'); return; }
    setSaving(true);
    // The 저장 tap is the explicit confirmation (§8.2).
    const created = await lifeEventService.create({ title: title.trim(), eventType: type, eventDate: date, reminderEnabled: reminder, confirmed: true, source: 'manual' });
    setSaving(false);
    if (!created) { setError('저장하지 못했어요. 잠시 후 다시 시도해 주세요.'); return; }
    trackRetentionEvent('life_event_created', { category: type });
    setTitle(''); setDate(''); setType('OTHER'); setReminder(true);
    reload();
  };

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/my');
  };

  if (!isAuthenticated) return <Redirect href="/login" />;

  return (
    <Screen padded={false} frame>
      <AppHeader title="중요한 일정" showBack onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          <Stack gap="lg">
            {/* Add form — filling + 저장 is the confirmation. */}
            <Card radius="xl">
              <Stack gap="md">
                <Text variant="bodyLarge" style={{ fontWeight: '700' }}>일정 추가</Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="예: 이사, 면접, 계약"
                  placeholderTextColor={theme.textSecondary}
                  maxLength={40}
                  style={[styles.input, { borderColor: theme.border, color: theme.textPrimary }]}
                />
                <Stack direction="row" gap="sm" style={styles.chipWrap}>
                  {TYPES.map((t) => (
                    <Chip key={t} label={LIFE_EVENT_TYPE_LABEL[t]} selected={type === t} onPress={() => setType(t)} />
                  ))}
                </Stack>
                <TextInput
                  value={date}
                  onChangeText={setDate}
                  placeholder="2026-09-20"
                  placeholderTextColor={theme.textSecondary}
                  autoCapitalize="none"
                  style={[styles.input, { borderColor: theme.border, color: theme.textPrimary }]}
                />
                <View style={styles.reminderRow}>
                  <Text variant="bodyMedium">이 일정 알림 받기</Text>
                  <Switch value={reminder} onValueChange={setReminder} trackColor={{ true: theme.primary, false: theme.border }} />
                </View>
                {error ? <Text variant="bodySmall" colorToken="danger">{error}</Text> : null}
                <Button label={saving ? '저장 중…' : '저장'} onPress={add} radius="lg" disabled={saving} />
              </Stack>
            </Card>

            {/* Saved events */}
            {events.length === 0 ? (
              <Card radius="xl">
                <Text variant="bodyMedium" colorToken="textSecondary">
                  저장된 일정이 없어요. 중요한 날짜를 추가하면 다가올 때 알려드릴게요.
                </Text>
              </Card>
            ) : (
              <Stack gap="sm">
                {events.map((e) => (
                  <Card key={e.id} radius="lg">
                    <View style={styles.eventRow}>
                      <View style={styles.flex1}>
                        <Text variant="bodyMedium" style={{ fontWeight: '700' }}>
                          {LIFE_EVENT_TYPE_LABEL[e.eventType]} · {e.title}
                        </Text>
                        <Text variant="bodySmall" colorToken="textSecondary">{e.eventDate}</Text>
                      </View>
                      <Switch
                        value={e.reminderEnabled}
                        onValueChange={(v) => { void lifeEventService.setReminder(e.id, v); reload(); }}
                        trackColor={{ true: theme.primary, false: theme.border }}
                      />
                      <Button label="삭제" variant="tertiary" onPress={() => { void lifeEventService.remove(e.id); reload(); }} />
                    </View>
                  </Card>
                ))}
              </Stack>
            )}

            <Text variant="bodySmall" colorToken="textSecondary" style={styles.note}>
              저장한 일정은 알림·상담에서 참고 정보로만 쓰이고, 대화 내용이 자동으로 저장되지는 않아요.
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
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  chipWrap: { flexWrap: 'wrap' },
  reminderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flex1: { flex: 1 },
  note: { paddingHorizontal: 4, lineHeight: 18 },
});
