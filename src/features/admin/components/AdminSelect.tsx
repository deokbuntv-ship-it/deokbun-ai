import { Pressable, View } from 'react-native';

import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

export type AdminSelectOption<T extends string> = {
  value: T;
  label: string;
};

// Simple chip-style single-select for admin forms. Reuses theme tokens.
export function AdminSelect<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label?: string;
  options: AdminSelectOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
}) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  return (
    <Stack gap="xs">
      {label ? (
        <Text variant="bodySmall" colorToken="textSecondary">
          {label}
        </Text>
      ) : null}
      <Stack direction="row" gap="sm" style={{ flexWrap: 'wrap' }}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <View
                style={{
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.md,
                  borderRadius: radius.md,
                  borderWidth: selected ? 2 : 1,
                  borderColor: selected ? theme.primary : theme.border,
                  backgroundColor: selected
                    ? theme.backgroundSelected
                    : theme.surface,
                }}
              >
                <Text variant="bodyMedium">{option.label}</Text>
              </View>
            </Pressable>
          );
        })}
      </Stack>
    </Stack>
  );
}
