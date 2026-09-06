import { ActivityIndicator, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { radius, spacing } from '@/theme';
import { Text } from '@/components/Text';

// SOCIAL LOGIN button (§4/§5/§10/§37). Each provider keeps its OWN official signature — brand color, label,
// text color — so a provider never turns into the Deokbuni orange. These hexes are the providers' OFFICIAL
// brand colors (NOT app tokens, deliberately NOT mapped to brandPrimary).
//
// OFFICIAL MARK: the button reserves a leading `mark` slot. We do NOT hand-draw, approximate, or emoji a
// provider logo (§4/§37). No authorized mark asset/package is bundled in this project yet, so every provider's
// `mark` is null → classified OFFICIAL_MARK_ASSET_PENDING: the layout is ready and, when the owner drops the
// authorized asset in (require('…')), it renders in the slot with zero further layout work. Color + label
// already make each provider recognizable in the meantime.
export type SocialProvider = 'kakao' | 'naver' | 'google' | 'apple';

// mark: an authorized local asset (require(...) → number) when available, else null (OFFICIAL_MARK_ASSET_PENDING).
type ProviderStyle = { bg: string; fg: string; label: string; border?: string; mark: number | null };

// Provider brand guideline wins INSIDE the button (§10). Naver's official green+white is below WCAG AA but is
// the mandated treatment; that is an intentional, provider-scoped exception to the app contrast rule.
const PROVIDER: Record<SocialProvider, ProviderStyle> = {
  kakao: { bg: '#FEE500', fg: '#181600', label: '카카오로 계속하기', mark: null },
  naver: { bg: '#03C75A', fg: '#FFFFFF', label: '네이버로 계속하기', mark: null },
  google: { bg: '#FFFFFF', fg: '#1F1F1F', label: 'Google로 계속하기', border: '#747775', mark: null },
  apple: { bg: '#000000', fg: '#FFFFFF', label: 'Apple로 계속하기', mark: null },
};

type SocialButtonProps = {
  provider: SocialProvider;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function SocialButton({ provider, onPress, disabled, loading = false, style }: SocialButtonProps) {
  const p = PROVIDER[provider];
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={p.label}
      aria-disabled={isDisabled} aria-busy={loading}
      style={({ pressed }) => [
        {
          backgroundColor: p.bg,
          borderRadius: radius.lg,
          borderWidth: p.border ? 1 : 0,
          borderColor: p.border,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          minHeight: 52,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style as ViewStyle,
      ]}
    >
      {/* mark slot + label; both fade while loading so width/height never jump. */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, opacity: loading ? 0 : 1 }}>
        {p.mark != null ? <Image source={p.mark} style={{ width: 18, height: 18 }} contentFit="contain" /> : null}
        <Text variant="bodyMedium" style={{ color: p.fg, fontWeight: '700' }}>
          {p.label}
        </Text>
      </View>
      {loading ? (
        <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="small" color={p.fg} />
        </View>
      ) : null}
    </Pressable>
  );
}
