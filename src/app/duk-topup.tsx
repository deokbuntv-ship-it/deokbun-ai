import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import { TOPUP_PACKS, dukLabel } from '@/features/duk/pricing';
import { spacing } from '@/theme';

// 덕 충전 SHELL (Sprint J1). PREPARATION-ONLY: shows the conceptual packs but purchase is NOT active in this build
// (store/business provisioning = deferred 05B). No store API is called, no product id is real, no fake buy path.
// When 05B lands, the 05A purchaseFlow seam attaches here.
export default function DukTopupScreen() {
  const router = useRouter();
  return (
    <Screen padded={false} frame>
      <AppHeader title="덕 충전" centerTitle showBack onBack={() => (router.canGoBack() ? router.back() : router.replace('/wallet'))} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          <Stack gap="lg">
            <Card radius="xl">
              <Text variant="bodyLarge" style={styles.notice}>덕 충전은 정식 출시 준비 중이에요.</Text>
              <Text variant="bodyMedium" colorToken="textSecondary" style={{ marginTop: spacing.xs }}>
                지금은 가입 보상과 하루 한 번 촛불로 덕을 받을 수 있어요.
              </Text>
            </Card>

            {TOPUP_PACKS.map((p) => (
              <Card key={p.internalKey} radius="xl">
                <View style={styles.packRow}>
                  <Stack gap="xs" style={styles.flex1}>
                    <Text variant="bodyLarge" style={styles.packLabel}>
                      {p.label}{p.firstOnly ? ' · 처음 한 번' : ''}
                    </Text>
                    <Text variant="bodyMedium" colorToken="textSecondary">{dukLabel(p.duk)}</Text>
                  </Stack>
                  {/* Price shown as a hint only; purchase disabled until 05B. No buy control is rendered. */}
                  <Text variant="bodyMedium" colorToken="textSecondary">
                    {p.priceKrwHint != null ? `₩${p.priceKrwHint.toLocaleString()} (준비 중)` : '준비 중'}
                  </Text>
                </View>
              </Card>
            ))}

            <Text variant="caption" colorToken="textSecondary" style={styles.foot}>
              결제 기능은 아직 제공되지 않아요. 준비되면 안내해 드릴게요.
            </Text>
          </Stack>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40, alignItems: 'center' },
  wrapper: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  notice: { fontWeight: '700' },
  packRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex1: { flex: 1 },
  packLabel: { fontWeight: '700' },
  foot: { paddingTop: spacing.sm, paddingHorizontal: spacing.xs },
});
