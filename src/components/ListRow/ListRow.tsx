import { Pressable, View } from 'react-native';

import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { spacing } from '@/theme';

// Tappable list row (Stitch home 많이 물어보는 질문 list + MY rows). Optional
// leading glyph, label (+ sublabel), trailing chevron. Dividers/card framing are
// applied by the parent so the same row works in a plain list or inside a card.
type ListRowProps = {
  label: string;
  sublabel?: string;
  leading?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
};

export function ListRow({
  label,
  sublabel,
  leading,
  onPress,
  showChevron = true,
}: ListRowProps) {
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
        minHeight: 52,
        paddingVertical: spacing.md,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      {leading ? <View>{leading}</View> : null}
      <Stack gap="xs" style={{ flex: 1 }}>
        <Text variant="bodyLarge">{label}</Text>
        {sublabel ? (
          <Text variant="bodySmall" colorToken="textSecondary" numberOfLines={1}>
            {sublabel}
          </Text>
        ) : null}
      </Stack>
      {showChevron ? (
        <Text variant="bodyLarge" style={{ color: '#C6C9D0', fontWeight: '600' }}>
          ›
        </Text>
      ) : null}
    </Pressable>
  );
}
