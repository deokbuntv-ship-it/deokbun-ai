import { Pressable, View } from 'react-native';

import { LineIcon } from '@/components/LineIcon';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, spacing } from '@/theme';

// DESIGN_FREEZE_FINAL C09/C10 — the list row. H56, leading glyph 22, chevron via LineIcon (one icon
// family, no text arrow). MY and the wallet reward list use THIS instead of wrapping every item in a
// card. Dividers / framing stay with the parent so the same row works bare or inside a card.
type ListRowProps = {
  label: string;
  sublabel?: string;
  leading?: React.ReactNode;
  // Right-aligned value (e.g. "+1덕", "3명", a 준비 중 badge). Rendered before the chevron.
  trailing?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
};

export function ListRow({
  label,
  sublabel,
  leading,
  trailing,
  onPress,
  showChevron = true,
}: ListRowProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={label}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        minHeight: 56,
        paddingVertical: spacing.md,
        backgroundColor: pressed && onPress ? theme.backgroundSelected : 'transparent',
      })}
    >
      {leading ? <View>{leading}</View> : null}
      <Stack gap="xs" style={{ flex: 1, minWidth: 0 }}>
        <Text variant="bodyLarge" style={{ fontWeight: '600' }}>
          {label}
        </Text>
        {sublabel ? (
          <Text variant="bodySmall" colorToken="textSecondary" numberOfLines={1} ellipsizeMode="tail">
            {sublabel}
          </Text>
        ) : null}
      </Stack>
      {trailing}
      {showChevron ? <LineIcon name="chevron-right" size={18} color={theme.textMuted} /> : null}
    </Pressable>
  );
}
