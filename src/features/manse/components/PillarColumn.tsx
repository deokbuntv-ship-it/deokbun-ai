import { View } from 'react-native';

import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

import type { ManseBranchView, ManseStemView, PillarView } from '../types';
import { ElementGlyphTile } from './ElementGlyphTile';

// Presentation-only. Renders one pillar column (시/일/월/년):
//   [column label] / 천간 오행 tile / 천간 meta / 지지 오행 tile / 지지 meta.
// The glyph sits inside an 오행-colored tile (requirement: WOOD=green .. METAL=white
// .. WATER=black) and the 오행 label is shown alongside (accessibility — never
// color-only). A null stem/branch renders a neutral placeholder ("–").

function NeutralCell() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  return (
    <View
      style={{
        width: '100%',
        minHeight: 44,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: radius.md,
        backgroundColor: theme.backgroundElevated,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xs,
      }}
    >
      <Text variant="bodyLarge" colorToken="textSecondary">
        –
      </Text>
    </View>
  );
}

function Meta({ children }: { children: string }) {
  return (
    <Text variant="caption" colorToken="textSecondary">
      {children}
    </Text>
  );
}

export function PillarColumn({ pillar }: { pillar: PillarView }) {
  const stem: ManseStemView | null = pillar.stem;
  const branch: ManseBranchView | null = pillar.branch;

  return (
    <Stack style={{ flex: 1 }} gap="xs" align="center">
      <Text variant="bodyMedium">{pillar.columnLabel}</Text>

      {/* 천간 */}
      {stem ? (
        <ElementGlyphTile glyph={stem.hanja} elementColorKey={stem.elementColorKey} />
      ) : (
        <NeutralCell />
      )}
      {stem ? (
        <Stack gap="none" align="center">
          <Meta>{stem.hangul}</Meta>
          <Meta>{`${stem.elementLabel}·${stem.yinYangLabel}`}</Meta>
          <Meta>{stem.tenGodLabel}</Meta>
        </Stack>
      ) : null}

      {/* 지지 */}
      {branch ? (
        <ElementGlyphTile
          glyph={branch.hanja}
          elementColorKey={branch.elementColorKey}
        />
      ) : (
        <NeutralCell />
      )}
      {branch ? (
        <Stack gap="none" align="center">
          <Meta>{branch.hangul}</Meta>
          <Meta>{`${branch.elementLabel}·${branch.yinYangLabel}`}</Meta>
        </Stack>
      ) : null}
    </Stack>
  );
}
