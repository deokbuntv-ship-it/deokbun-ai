import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

// Collapsible section (Stitch 분석 근거). Default collapsed — keeps academic
// discipline detail (명리/자미두수/기문둔갑) hidden until the user opts in.
type AccordionProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

export function Accordion({ title, children, defaultOpen = false }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: radius.xl,
        backgroundColor: theme.surface,
        overflow: 'hidden',
      }}
    >
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: spacing.lg,
          minHeight: 60,
        }}
      >
        <Text variant="bodyLarge" style={{ fontWeight: '600' }}>
          {title}
        </Text>
        <Text variant="bodyLarge" colorToken="textSecondary">
          {open ? '▴' : '▾'}
        </Text>
      </Pressable>
      {open ? (
        <View
          style={{
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.lg,
            paddingTop: spacing.sm,
            borderTopWidth: 1,
            borderTopColor: theme.border,
          }}
        >
          {children}
        </View>
      ) : null}
    </View>
  );
}
