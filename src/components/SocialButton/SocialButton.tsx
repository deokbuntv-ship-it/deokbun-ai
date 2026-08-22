import { ActivityIndicator, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { radius, spacing } from '@/theme';
import { Text } from '@/components/Text';

// SOCIAL LOGIN button (§10/§37). Each provider keeps its OWN official signature — brand color, label wording,
// and text color — so a provider never turns into the Deokbuni orange. These hexes are the providers' OFFICIAL
// brand colors (NOT app tokens, and deliberately NOT mapped to brandPrimary per §3). The official LOGO MARKS
// are intentionally omitted: we do not hand-draw or approximate them (§37) — dropping in the authorized
// asset/SDK button is an owner step (EXTERNAL_BRAND_ASSET_REQUIRED). Color + label alone already make each
// provider recognizable (Kakao yellow, Naver green, Google bordered-white).
export type SocialProvider = 'kakao' | 'naver' | 'google' | 'apple';

type ProviderStyle = { bg: string; fg: string; label: string; border?: string };

// Provider brand guideline wins INSIDE the button (§10). Naver's official green+white is below WCAG AA but is
// the mandated treatment; that is an intentional, provider-scoped exception to the app contrast rule.
const PROVIDER: Record<SocialProvider, ProviderStyle> = {
  kakao: { bg: '#FEE500', fg: '#181600', label: '카카오로 계속하기' },
  naver: { bg: '#03C75A', fg: '#FFFFFF', label: '네이버로 계속하기' },
  google: { bg: '#FFFFFF', fg: '#1F1F1F', label: 'Google로 계속하기', border: '#747775' },
  apple: { bg: '#000000', fg: '#FFFFFF', label: 'Apple로 계속하기' },
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
      accessibilityState={{ disabled: isDisabled, busy: loading }}
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
      {/* Label stays in place while loading (opacity 0) so the row height never jumps. */}
      <Text variant="bodyMedium" style={{ color: p.fg, fontWeight: '700', opacity: loading ? 0 : 1 }}>
        {p.label}
      </Text>
      {loading ? (
        <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="small" color={p.fg} />
        </View>
      ) : null}
    </Pressable>
  );
}
