import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { InsufficientDuk } from '@/components/InsufficientDuk';
import { LineIcon } from '@/components/LineIcon';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { StateView } from '@/components/StateView';
import { Text } from '@/components/Text';
import { isSavedSubjectId, useConsultationSubjects, type ConsultationSubjectRecord } from '@/features/consultation';
import { consumePendingCompatibilitySubjectId } from '@/features/compatibility/services/pendingCompatibilitySubject';
import { useAuth } from '@/features/auth';
import { isBalanceShort, walletStateOf } from '@/features/duk/consumerDukView';
import { getCandleAvailability } from '@/features/duk/dukWalletService';
import { DUK_PRICES, dukLabel } from '@/features/duk/pricing';
import { useWallet } from '@/features/duk/useWallet';
import { trackProductEvent } from '@/services/productEvents';
import { colors, radius, spacing } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useConsumerLayout } from '@/hooks/useConsumerLayout';

// D16 궁합 시작 — DESIGN_FREEZE_FINAL.
//
// 본인은 자동 선택(is_self), 상대방은 저장된 대상자 중에서 고르거나 추가한다. 저장된 대상자는 PRIVATE 상담
// 데이터 — 여기서 노출되는 것은 이름/관계뿐(생년월일 raw 미노출).
//
// The cost and the balance are BOTH on screen before the button. When the balance is short, the C07
// block replaces the CTA in place — never an Alert. This block is DISPLAY ONLY: the authoritative
// shortfall (and the compatibility_insufficient_duk event with its first-day-gap payload) still comes
// from the SERVER on the real attempt, in the consultation service. Nothing here emits or recomputes it.
//
// As a tab, the primary bottom bar renders automatically (no DetailBottomNav here).
export default function CompatibilityScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const { hPad, maxWidth } = useConsumerLayout();
  const { subjects, status, reload } = useConsultationSubjects();
  const [targetId, setTargetId] = useState<string | null>(null);

  const { isAuthenticated } = useAuth();
  const wallet = useWallet();
  const [candleEligible, setCandleEligible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      reload();
      // Just returned from "대상자 추가"? Auto-select the subject we just created (§3). Ephemeral +
      // one-shot; only a real saved id is honored, and it only sets local selection state.
      const pendingId = consumePendingCompatibilitySubjectId();
      if (pendingId && isSavedSubjectId(pendingId)) setTargetId(pendingId);
      if (isAuthenticated) {
        void wallet.refresh();
        void getCandleAvailability(Math.floor(Date.now() / 1000))
          .then((a) => setCandleEligible(a.canLight))
          .catch(() => {});
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reload, isAuthenticated]),
  );

  const self = subjects.find((s) => s.isSelf) ?? null;
  const others = subjects.filter((s) => !s.isSelf);
  const target = others.find((s) => s.id === targetId) ?? null;

  const walletState = walletStateOf({
    signedOut: !isAuthenticated,
    error: wallet.error,
    totalSpendable: wallet.loading && !wallet.state ? undefined : wallet.state?.totalSpendable ?? (wallet.error ? null : 0),
  });
  const displayWalletState = wallet.loading && !wallet.state ? 'loading' : walletState;
  const balanceKnown = displayWalletState === 'loaded' || displayWalletState === 'zero';
  const balance = wallet.state?.totalSpendable ?? 0;
  const required = DUK_PRICES.compatibility;
  // Only "insufficient" when the balance is genuinely KNOWN and short (shared canonical helper). An
  // unloaded/unknown wallet must NOT read as insufficient; the server remains the final authority.
  const short = isBalanceShort(wallet.state, required);

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
        accessibilityState={{ selected }}
        accessibilityLabel={`${subject.displayName} 선택`}
        style={({ pressed }) => [
          styles.personRow,
          {
            borderColor: selected ? theme.brandPrimary : theme.border,
            borderWidth: selected ? 1.5 : 1,
            backgroundColor: pressed ? theme.backgroundSelected : theme.surface,
          },
        ]}
      >
        <Avatar label={subject.displayName} selected={selected} size={38} />
        <Stack gap="xs" style={styles.flex1}>
          <Text variant="bodyLarge" numberOfLines={1} style={styles.bold}>
            {subject.displayName}
          </Text>
          {subject.relationship ? (
            <Text variant="bodySmall" colorToken="textSecondary" numberOfLines={1}>
              {subject.relationship}
            </Text>
          ) : null}
        </Stack>
        {selected ? <LineIcon name="check" size={20} color={theme.brandPrimary} strokeWidth={2} /> : null}
      </Pressable>
    );
  };

  const renderBody = () => {
    if (status === 'loading') return <StateView kind="loading" skeletonLines={4} />;
    // §11 — a load failure must NOT masquerade as "먼저 본인 등록"; show a real error + retry.
    if (status === 'error') {
      return (
        <StateView
          kind="error"
          description="대상을 불러오지 못했어요. 네트워크를 확인하고 다시 시도해 주세요."
          actionLabel="다시 시도"
          onAction={() => reload()}
        />
      );
    }
    if (!self) {
      return (
        <StateView
          kind="empty"
          emoji="👤"
          title="먼저 본인의 생년월일을 등록해 주세요"
          description="궁합은 본인과 상대방 두 사람의 사주를 바탕으로 봐드려요."
          actionLabel="본인 정보 등록하기"
          onAction={() => router.push({ pathname: '/birth-info', params: { origin: 'compatibility', self: '1' } })}
        />
      );
    }

    return (
      <Stack gap="xl">
        {/* A × B — who this reading is about, before anything else. */}
        <Card use="reward" tone="blush" radius="xl">
          <View style={styles.pairRow}>
            <View style={styles.pairPerson}>
              <Avatar label={self.displayName} size={48} />
              <Text variant="bodySmall" numberOfLines={1} style={{ color: theme.onBlush, fontWeight: '700' }}>
                {self.displayName}
              </Text>
              <Text variant="caption" numberOfLines={1} style={{ color: theme.onBlush }}>
                본인
              </Text>
            </View>
            <Text style={styles.pairGlyph}>💕</Text>
            <View style={styles.pairPerson}>
              <Avatar label={target?.displayName ?? '?'} size={48} />
              <Text variant="bodySmall" numberOfLines={1} style={{ color: theme.onBlush, fontWeight: '700' }}>
                {target?.displayName ?? '상대 선택'}
              </Text>
              <Text variant="caption" numberOfLines={1} style={{ color: theme.onBlush }}>
                {target?.relationship ?? '아래에서 고르기'}
              </Text>
            </View>
          </View>
        </Card>

        <Stack gap="sm">
          <Text variant="headingMedium">상대방</Text>
          {others.length === 0 ? (
            <StateView
              kind="empty"
              emoji="👥"
              title="아직 저장된 상대방이 없어요"
              description="가족이나 친구를 등록하면 두 사람의 궁합을 볼 수 있어요."
            />
          ) : (
            <Stack gap="sm">{others.map(renderTarget)}</Stack>
          )}
          <Button
            label="＋ 대상자 추가"
            variant="secondary"
            radius="lg"
            onPress={() => router.push({ pathname: '/birth-info', params: { origin: 'compatibility' } })}
          />
        </Stack>
      </Stack>
    );
  };

  return (
    <Screen padded={false}>
      <AppHeader title="궁합" showBell />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingHorizontal: hPad }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.wrapper, { maxWidth }]}>
          <Stack gap="xl">
            {renderBody()}

            {self ? (
              short ? (
                <InsufficientDuk
                  product="compatibility"
                  snapshot={{ balance, required, shortfall: Math.max(0, required - balance) }}
                  candleEligible={candleEligible}
                  onCandle={() => router.push('/wallet')}
                  onTopup={() => router.push('/duk-topup')}
                />
              ) : (
                <Stack gap="sm">
                  {/* Cost AND balance, together, above the button. */}
                  <View style={styles.costRow}>
                    <Text variant="bodyMedium" colorToken="textSecondary">지금 있는 덕</Text>
                    <Text variant="bodyMedium" numeric style={styles.bold}>
                      {balanceKnown ? dukLabel(balance) : '확인 중…'}
                    </Text>
                  </View>
                  <View style={styles.costRow}>
                    <Text variant="bodyMedium" colorToken="textSecondary">궁합에 필요한 덕</Text>
                    <Text variant="bodyMedium" numeric style={styles.bold}>{dukLabel(required)}</Text>
                  </View>
                  <Button
                    label={`${dukLabel(required)}으로 궁합 보기`}
                    radius="lg"
                    onPress={startCompatibility}
                    disabled={!targetId || !balanceKnown}
                  />
                </Stack>
              )
            ) : null}
          </Stack>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingTop: spacing.md, paddingBottom: 40, alignItems: 'center' },
  wrapper: { width: '100%', alignSelf: 'center' },
  pairRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  pairPerson: { flex: 1, minWidth: 0, alignItems: 'center', gap: 4 },
  pairGlyph: { fontSize: 22, lineHeight: 28 },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.xl,
    minHeight: 58,
  },
  costRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, minHeight: 32 },
  bold: { fontWeight: '700' },
  flex1: { flex: 1, minWidth: 0 },
});
