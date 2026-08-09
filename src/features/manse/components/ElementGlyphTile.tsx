import { View } from 'react-native';

import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { radius, spacing, type FiveElementColorKey } from '@/theme';

import { getFiveElementTile } from '../services/elementColor';

// Presentation-only. Renders a single glyph (한자) inside an 오행 tile:
// element background + contrasting glyph color + visible border (so WHITE/METAL
// survives a light background and BLACK/WATER survives a dark background). The
// element identity comes from the ENGINE (via elementColorKey); no computation here.

export function ElementGlyphTile({
  glyph,
  elementColorKey,
  size = 'md',
  accessibilityLabel,
}: {
  glyph: string;
  elementColorKey: FiveElementColorKey;
  size?: 'md' | 'sm';
  // When provided, the tile is read as one meaningful unit (e.g. "을, 목, 음")
  // instead of the bare 한자 glyph. The caller passes ENGINE-provided labels.
  accessibilityLabel?: string;
}) {
  const scheme = useColorScheme();
  const tile = getFiveElementTile(
    elementColorKey,
    scheme === 'dark' ? 'dark' : 'light',
  );

  const isSmall = size === 'sm';

  return (
    <View
      accessible={accessibilityLabel !== undefined ? true : undefined}
      accessibilityLabel={accessibilityLabel}
      style={{
        width: isSmall ? 30 : '100%',
        // md is the primary 8-glyph tile — sized so the 한자 is the dominant
        // element on screen while keeping the 4-column single-screen layout.
        minHeight: isSmall ? 30 : 52,
        borderWidth: 1,
        borderColor: tile.border,
        borderRadius: radius.md,
        backgroundColor: tile.background,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xs,
      }}
    >
      <Text
        variant={isSmall ? 'bodyMedium' : 'headingLarge'}
        style={{ color: tile.glyph }}
      >
        {glyph}
      </Text>
    </View>
  );
}
