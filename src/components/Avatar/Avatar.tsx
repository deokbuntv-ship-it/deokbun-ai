import { View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/theme';

// Initial-avatar circle (Stitch person rows / MY / switcher). Navy filled when
// selected/primary; tonal surface otherwise. Uses the first character of the
// name — no photo asset or stock-image dependency required.
type AvatarProps = {
  label: string;
  selected?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function Avatar({ label, selected = false, size = 44, style }: AvatarProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const initial = label?.trim().slice(0, 1) || '나';

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: selected ? theme.primary : theme.backgroundSelected,
        },
        style,
      ]}
    >
      <Text
        variant="bodyLarge"
        colorToken={selected ? 'primaryText' : 'textPrimary'}
        style={{ fontWeight: '700' }}
      >
        {initial}
      </Text>
    </View>
  );
}
