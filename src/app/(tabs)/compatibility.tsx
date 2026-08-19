import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import { isSavedSubjectId, useConsultationSubjects, type ConsultationSubjectRecord } from '@/features/consultation';
import { consumePendingCompatibilitySubjectId } from '@/features/compatibility/services/pendingCompatibilitySubject';
import { trackProductEvent } from '@/services/productEvents';
import { colors } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// 궁합 — PRIMARY TAB (owner nav decision). 본인은 자동 선택(is_self), 상대방은 저장된 대상자 중에서 고르거나
// 추가한다. 저장된 대상자는 PRIVATE 상담 데이터 — 여기서 노출되는 것은 이름/관계뿐(생년월일 raw 미노출). As a
// tab, the primary bottom bar renders automatically (no DetailBottomNav here).
export default function CompatibilityScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const { subjects, status, reload } = useConsultationSubjects();
  const [targetId, setTargetId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      reload();
      // Just returned from "대상자 추가"? Auto-select the subject we just created (§3). Ephemeral +
      // one-shot; only a real saved id is honored, and it only sets local selection state.
      const pendingId = consumePendingCompatibilitySubjectId();
      if (pendingId && isSavedSubjectId(pendingId)) setTargetId(pendingId);
    }, [reload]),
  );

  const self = subjects.find((s) => s.isSelf) ?? null;
  const others = subjects.filter((s) => !s.isSelf);

  const startCompatibility = () => {
    if (!self || !targetId) return;
    const targetRel = others.find((s) => s.id === targetId)?.relationship ?? undefined;
    void trackProductEvent('compatibility_pair_selected', {
      surface: 'compatibility_select',
      consultationMode: 'compatibility',
      properties: { relationship_type: targetRel ?? undefined },
    });
    router.push({ pathname: '/compatibility-chat', params: { selfId: self.id, targetId } });
  };

  const renderTarget = (subject: ConsultationSubjectRecord) => {
    const selected = subject.id === targetId;
    return (
      <Pressable
        key={subject.id}
        onPress={() => setTargetId(selected ? null : subject.id)}
        accessibilityRole="button"
        accessibilityLabel={`${subject.displayName} 선택`}
      >
        <Card radius="lg" style={selected ? { borderColor: theme.primary, borderWidth: 1.5 } : undefined}>
          <Stack direction="row" gap="sm" align="center">
            <Stack gap="xs" style={{ flex: 1 }}>
              <Text variant="bodyLarge" style={{ fontWeight: '600' }}>
                {subject.displayName}
              </Text>
              {subject.relationship ? (
                <Text variant="bodySmall" colorToken="textSecondary">
                  {subject.relationship}
                </Text>
              ) : null}
            </Stack>
            <Text variant="bodyMedium" style={{ color: selected ? theme.primary : theme.textSecondary }}>
              {selected ? '● 선택됨' : '○ 선택'}
            </Text>
          </Stack>
        </Card>
      </Pressable>
    );
  };

  const renderBody = () => {
    if (status === 'loading') {
      return (
        <Card>
          <Text variant="bodyMedium" colorToken="textSecondary">
            불러오는 중입니다...
          </Text>
        </Card>
      );
    }
    if (!self) {
      return (
        <Card>
          <Stack gap="sm">
            <Text variant="bodyMedium">먼저 본인의 생년월일을 등록해 주세요.</Text>
            <Text variant="bodySmall" colorToken="textSecondary">
              궁합은 본인과 상대방 두 사람의 사주를 바탕으로 봐드려요.
            </Text>
            <Button
              label="본인 정보 등록하기"
              onPress={() => router.push({ pathname: '/birth-info', params: { origin: 'compatibility', self: '1' } })}
            />
          </Stack>
        </Card>
      );
    }
    return (
      <Stack gap="lg">
        {/* 본인 (자동 선택) */}
        <Stack gap="sm">
          <Text variant="bodyLarge" style={{ fontWeight: '600' }}>
            본인
          </Text>
          <Card radius="lg">
            <Text variant="bodyLarge" style={{ fontWeight: '600' }}>
              {self.displayName} <Text variant="bodySmall" colorToken="textSecondary">(본인)</Text>
            </Text>
          </Card>
        </Stack>

        {/* 상대방 선택 */}
        <Stack gap="sm">
          <Text variant="bodyLarge" style={{ fontWeight: '600' }}>
            상대방
          </Text>
          {others.length === 0 ? (
            <Card>
              <Text variant="bodyMedium" colorToken="textSecondary">
                아직 저장된 상대방이 없어요. 아래에서 대상자를 추가해 주세요.
              </Text>
            </Card>
          ) : (
            <Stack gap="sm">{others.map(renderTarget)}</Stack>
          )}
          <Button
            label="＋ 대상자 추가"
            variant="secondary"
            onPress={() => router.push({ pathname: '/birth-info', params: { origin: 'compatibility' } })}
          />
        </Stack>
      </Stack>
    );
  };

  return (
    <Screen padded={false}>
      <AppHeader title="궁합" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          <Stack gap="lg">
            <Text variant="bodyMedium" colorToken="textSecondary">
              누구와의 궁합을 볼까요?
            </Text>
            {renderBody()}
            {self ? (
              <Button label="궁합 보기" onPress={startCompatibility} disabled={!targetId} />
            ) : null}
          </Stack>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40, alignItems: 'center' },
  wrapper: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
});
