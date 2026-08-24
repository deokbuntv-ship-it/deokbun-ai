import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/Button';
import { LineIcon } from '@/components/LineIcon';
import { Text } from '@/components/Text';
import type { WalletLoadState } from '@/features/duk/consumerDukView';
import { dukLabel } from '@/features/duk/pricing';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

// DESIGN_FREEZE_FINAL C06 — the cost confirmation that sits between "I want to ask" and "I paid".
//
// The whole point is the ORDER: who this is about, what it costs, what you have, and what you will
// have left — all BEFORE the button, never after the 덕 has already gone. "시작하면 N덕이 남아요" is the
// single line that does most of the work of removing first-purchase anxiety.
//
// `required` and `balance` are server values passed straight in. When the balance is not yet known
// the CTA is BLOCKED rather than optimistic: starting a paid action on an unverified balance is the
// one thing this sheet must never allow.
type PriceConfirmSheetProps = {
  visible: boolean;
  onClose: () => void;
  /** e.g. "상담", "궁합". */
  productLabel: string;
  /** Server cost. */
  required: number;
  /** Server balance state + total. */
  walletState: WalletLoadState;
  balance: number;
  subjectName: string;
  subjectRelationship?: string | null;
  /** Opens the person selector so the wrong person never gets charged for. */
  onChangeSubject?: () => void;
  onConfirm: () => void;
  /** Rendered in place of the CTA when the balance is short (C07 block). */
  insufficientSlot?: React.ReactNode;
};

export function PriceConfirmSheet({
  visible,
  onClose,
  productLabel,
  required,
  walletState,
  balance,
  subjectName,
  subjectRelationship,
  onChangeSubject,
  onConfirm,
  insufficientSlot,
}: PriceConfirmSheetProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  const balanceKnown = walletState === 'loaded' || walletState === 'zero';
  const remaining = balance - required;
  const short = balanceKnown && remaining < 0;

  const Row = ({ label, value }: { label: string; value: string }) => (
    <View style={[styles.row, { borderBottomColor: theme.lineHairline }]}>
      <Text variant="bodyMedium" colorToken="textSecondary">
        {label}
      </Text>
      <Text variant="bodyMedium" numeric style={{ fontWeight: '700' }}>
        {value}
      </Text>
    </View>
  );

  return (
    <BottomSheet visible={visible} onClose={onClose} title={`${productLabel} 시작하기`}>
      {/* Subject re-confirmation — one tap to fix, so 5덕 never goes to the wrong person. */}
      <Pressable
        onPress={onChangeSubject}
        disabled={!onChangeSubject}
        accessibilityRole={onChangeSubject ? 'button' : undefined}
        accessibilityLabel={`분석 대상자 ${subjectName} 변경`}
        style={({ pressed }) => [
          styles.subject,
          { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElevated },
        ]}
      >
        <Avatar label={subjectName} size={36} />
        <View style={styles.flex1}>
          <Text variant="bodyLarge" numberOfLines={1} style={{ fontWeight: '700' }}>
            {subjectName}
          </Text>
          {subjectRelationship ? (
            <Text variant="bodySmall" colorToken="textSecondary" numberOfLines={1}>
              {subjectRelationship}
            </Text>
          ) : null}
        </View>
        {onChangeSubject ? <LineIcon name="chevron-down" size={18} color={theme.textSecondary} /> : null}
      </Pressable>

      <View>
        <Row label="지금 있는 덕" value={balanceKnown ? dukLabel(balance) : '확인 중…'} />
        <Row label={`${productLabel}에 필요한 덕`} value={dukLabel(required)} />
      </View>

      {short && insufficientSlot ? (
        insufficientSlot
      ) : (
        <View style={styles.cta}>
          <Button
            label={`${dukLabel(required)}으로 ${productLabel} 시작하기`}
            radius="lg"
            // Balance unverified → no paid action. Never optimistic.
            disabled={!balanceKnown}
            onPress={onConfirm}
          />
          <Text variant="bodySmall" colorToken="textSecondary" numeric style={styles.caption}>
            {balanceKnown
              ? `시작하면 ${dukLabel(Math.max(0, remaining))}이 남아요.`
              : '덕 잔액을 확인하는 중이에요.'}
          </Text>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  subject: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.xl,
    padding: spacing.md,
    minHeight: 58,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    minHeight: 44,
    borderBottomWidth: 1,
  },
  cta: { gap: spacing.sm, paddingTop: spacing.xs },
  caption: { textAlign: 'center' },
  flex1: { flex: 1, minWidth: 0 },
});
