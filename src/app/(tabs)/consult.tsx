import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { InsufficientDuk } from '@/components/InsufficientDuk';
import { ListRow } from '@/components/ListRow';
import { PersonSelectorSheet } from '@/components/PersonSelectorSheet';
import { PriceConfirmSheet } from '@/components/PriceConfirmSheet';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { StateView } from '@/components/StateView';
import { Text } from '@/components/Text';
import {
  conversationService,
  type ConversationSummaryItem,
} from '@/features/chat';
import {
  isSavedSubjectId,
  useConsultationDraft,
  type BirthInfoDraft,
  type ConsultationSubject,
} from '@/features/consultation';
import { useAuth } from '@/features/auth';
import { isBalanceShort, walletStateOf } from '@/features/duk/consumerDukView';
import { getCandleAvailability } from '@/features/duk/dukWalletService';
import { DUK_PRICES, dukLabel } from '@/features/duk/pricing';
import { useWallet } from '@/features/duk/useWallet';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useConsumerLayout } from '@/hooks/useConsumerLayout';
import { colors, radius, spacing } from '@/theme';

// D09 상담 목록 · 비용 확인 — DESIGN_FREEZE_FINAL.
//
// The change that matters here is ORDER: the cost sheet (C06) opens ABOVE the start button, so 보유
// 덕 / 필요 덕 / 남는 덕 are seen BEFORE the first charged turn — not discovered afterwards when the
// balance has already moved. "시작하면 N덕이 남아요" is the line that does most of the work.
//
// Everything financial stays server-authoritative: the session is opened and the first approved turn
// is charged by the server. This screen only displays the server's numbers and navigates.
//
// Hierarchy is Primary 1 / Tertiary 3 — never four same-weight buttons in a grid.
type Status = 'loading' | 'ready' | 'error' | 'no-subject';

type StoredSnapshot = {
  subject: ConsultationSubject | null;
  birthInfo: BirthInfoDraft | null;
} | null;

function when(iso: string | null): string {
  if (!iso) return '';
  const day = iso.slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);
  return day === today ? '오늘' : day;
}

function preview(summary: string | null): string | undefined {
  if (!summary) return undefined;
  const t = summary.trim();
  if (!t) return undefined;
  return t.length > 70 ? `${t.slice(0, 70)}…` : t;
}

export default function ConsultationListScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const { hPad, maxWidth } = useConsumerLayout();

  const { draft, updateSubject, updateBirthInfo } = useConsultationDraft();
  const subject = draft.subject;
  const subjectId =
    subject && isSavedSubjectId(subject.id) ? subject.id : null;

  const { isAuthenticated } = useAuth();
  const wallet = useWallet();
  const [candleEligible, setCandleEligible] = useState(false);

  const [items, setItems] = useState<ConversationSummaryItem[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [sheetVisible, setSheetVisible] = useState(false);
  const [priceSheetVisible, setPriceSheetVisible] = useState(false);
  const loadToken = useRef(0);

  const load = useCallback(() => {
    if (!subjectId) {
      setItems([]);
      setStatus('no-subject');
      return;
    }
    const token = loadToken.current + 1;
    loadToken.current = token;
    setStatus('loading');
    conversationService
      .listConversationsForSubject(subjectId)
      .then((rows) => {
        if (token !== loadToken.current) return;
        setItems(rows);
        setStatus('ready');
      })
      .catch(() => {
        if (token !== loadToken.current) return;
        setStatus('error');
      });
  }, [subjectId]);

  useFocusEffect(
    useCallback(() => {
      load();
      if (isAuthenticated) {
        void wallet.refresh();
        void getCandleAvailability(Math.floor(Date.now() / 1000))
          .then((a) => setCandleEligible(a.canLight))
          .catch(() => {});
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [load, isAuthenticated]),
  );

  const walletState = walletStateOf({
    signedOut: !isAuthenticated,
    error: wallet.error,
    totalSpendable: wallet.loading && !wallet.state ? undefined : wallet.state?.totalSpendable ?? (wallet.error ? null : 0),
  });
  const displayWalletState = wallet.loading && !wallet.state ? 'loading' : walletState;
  const balance = wallet.state?.totalSpendable ?? 0;
  const required = DUK_PRICES.general;
  // Only "insufficient" when the balance is genuinely KNOWN and short (shared canonical helper). An
  // unloaded/unknown wallet must NOT read as insufficient; the server remains the final authority.
  const short = isBalanceShort(wallet.state, required);

  const openConversation = (item: ConversationSummaryItem) => {
    const snap = item.subjectSnapshot as StoredSnapshot;
    if (snap?.subject && snap?.birthInfo) {
      updateSubject(snap.subject);
      updateBirthInfo(snap.birthInfo);
    }
    router.push({ pathname: '/chat', params: { conversationId: item.id } });
  };

  const startNew = () => {
    if (!subject) {
      setSheetVisible(true);
      return;
    }
    setPriceSheetVisible(true);
  };

  const confirmStart = () => {
    setPriceSheetVisible(false);
    router.push({ pathname: '/chat', params: { startNew: '1' } });
  };

  const subjectName = subject?.displayName ?? '나';

  return (
    <Screen padded={false}>
      <AppHeader
        title="상담"
        showSwitcher
        showBell
        subjectLabel={subjectName}
        onSwitcher={() => setSheetVisible(true)}
      />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingHorizontal: hPad }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.wrapper, { maxWidth }]}>
          <Stack gap="xl">
            {/* ① 현재 대상자 — always visible, so "누구를 상담하는지"는 시작 전에 이미 답이 되어 있습니다. */}
            {subject ? (
              <Card radius="xl" style={{ borderColor: theme.brandPrimary, borderWidth: 1.5 }}>
                <Pressable
                  onPress={() => setSheetVisible(true)}
                  accessibilityRole="button"
                  accessibilityLabel={`분석 대상자 ${subjectName} 변경`}
                  style={styles.subjectRow}
                >
                  <Avatar label={subjectName} selected size={44} />
                  <Stack gap="xs" style={styles.flex1}>
                    <Text variant="bodyLarge" numberOfLines={1} style={styles.bold}>
                      {`${subjectName} 사주 보는 중`}
                    </Text>
                    {subject.relationship ? (
                      <Text variant="bodySmall" colorToken="textSecondary" numberOfLines={1}>
                        {subject.relationship}
                      </Text>
                    ) : null}
                  </Stack>
                  <View style={[styles.selectedChip, { backgroundColor: theme.backgroundSelected }]}>
                    <Text variant="caption" colorToken="textSecondary" style={styles.bold}>
                      선택됨
                    </Text>
                  </View>
                </Pressable>
              </Card>
            ) : (
              <StateView
                kind="empty"
                emoji="👥"
                title="먼저 상담할 사람을 골라주세요"
                description="상단의 대상자 버튼에서 본인이나 등록한 사람을 선택할 수 있어요."
                actionLabel="대상자 선택하기"
                onAction={() => setSheetVisible(true)}
              />
            )}

            {/* ② Primary — the cost is ON the button, never a footnote discovered later. */}
            <Button
              label={`새 상담 시작  🍀 ${dukLabel(required)}`}
              radius="lg"
              onPress={startNew}
            />

            {/* ③ Tertiary 3 — demoted, text-only, wrapping. Not a four-button grid. */}
            <View style={styles.tertiaryRow}>
              <Button label="대상자 관리" variant="tertiary" onPress={() => router.push('/subjects')} />
              <Text variant="bodySmall" colorToken="textMuted">·</Text>
              <Button
                label="만세력"
                variant="tertiary"
                disabled={!subjectId}
                onPress={() => subjectId && router.push({ pathname: '/subject-manse', params: { subjectId } })}
              />
              <Text variant="bodySmall" colorToken="textMuted">·</Text>
              <Button
                label="전체 기록"
                variant="tertiary"
                disabled={!subjectId}
                onPress={() => subjectId && router.push({ pathname: '/subject-history', params: { subjectId } })}
              />
            </View>

            {/* ④ 최근 상담 */}
            <Stack gap="xs">
              <Text variant="headingMedium">최근 상담</Text>
              {status === 'no-subject' ? (
                <StateView
                  kind="empty"
                  emoji="💬"
                  title="아직 상담 기록이 없어요"
                  description="대상자를 고르면 그 사람과의 상담 기록이 여기에 모여요."
                />
              ) : status === 'loading' ? (
                <StateView kind="loading" skeletonLines={4} />
              ) : status === 'error' ? (
                <StateView
                  kind="error"
                  description="상담 내역을 불러오지 못했어요. 네트워크를 확인하고 다시 시도해 주세요."
                  actionLabel="다시 시도"
                  onAction={load}
                />
              ) : items.length === 0 ? (
                <StateView
                  kind="empty"
                  emoji="💬"
                  title="아직 상담 내역이 없어요"
                  description="위에서 첫 상담을 시작해 보세요."
                />
              ) : (
                <View>
                  {items.map((item, i) => (
                    <View key={item.id}>
                      {i > 0 ? <View style={[styles.divider, { backgroundColor: theme.lineHairline }]} /> : null}
                      <ListRow
                        label={`${subjectName}님 상담`}
                        sublabel={preview(item.summary) ?? '상담을 이어가 보세요.'}
                        onPress={() => openConversation(item)}
                        trailing={
                          <Text variant="caption" colorToken="textMuted">
                            {when(item.updatedAt)}
                          </Text>
                        }
                      />
                    </View>
                  ))}
                </View>
              )}
            </Stack>
          </Stack>
        </View>
      </ScrollView>

      <PriceConfirmSheet
        visible={priceSheetVisible}
        onClose={() => setPriceSheetVisible(false)}
        productLabel="상담"
        required={required}
        walletState={displayWalletState}
        balance={balance}
        subjectName={subjectName}
        subjectRelationship={subject?.relationship ?? null}
        onChangeSubject={() => {
          setPriceSheetVisible(false);
          setSheetVisible(true);
        }}
        onConfirm={confirmStart}
        insufficientSlot={
          short ? (
            <InsufficientDuk
              product="general"
              snapshot={{ balance, required, shortfall: Math.max(0, required - balance) }}
              candleEligible={candleEligible}
              onCandle={() => {
                setPriceSheetVisible(false);
                router.push('/wallet');
              }}
              onTopup={() => {
                setPriceSheetVisible(false);
                router.push('/duk-topup');
              }}
            />
          ) : undefined
        }
      />

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
    paddingTop: spacing.md,
    paddingBottom: 40,
    alignItems: 'center',
  },
  wrapper: {
    width: '100%',
    alignSelf: 'center',
  },
  subjectRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  selectedChip: { borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  tertiaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' },
  divider: { height: 1 },
  bold: { fontWeight: '700' },
  flex1: { flex: 1, minWidth: 0 },
});
