import { View } from 'react-native';

import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

import type { ManseBranchView, ManseStemView, PillarView } from '../types';
import { ElementGlyphTile } from './ElementGlyphTile';

// Presentation-only. Renders one pillar column (시/일/월/년). Visual hierarchy:
//   한자 (large 오행 tile) → 한글 → 십신/일간 → 오행·음양.
// A null stem/branch (e.g. PARTIAL hour) renders a neutral tile PLUS matching
// blank meta lines so every column keeps the same vertical bands and the 지지
// tiles stay aligned across all four columns (scaling-safe — blanks scale too).

// Matches the md ElementGlyphTile height so a neutral cell and a real tile occupy
// the same band.
const TILE_MIN_HEIGHT = 52;

function NeutralCell() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  return (
    <View
      style={{
        width: '100%',
        minHeight: TILE_MIN_HEIGHT,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: radius.md,
        backgroundColor: theme.backgroundElevated,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xs,
      }}
    >
      <Text variant="headingLarge" colorToken="textSecondary">
        –
      </Text>
    </View>
  );
}

// Blank line preserving one line of vertical rhythm for a null pillar.
function BlankLine({
  variant,
}: {
  variant: 'bodyMedium' | 'bodySmall' | 'caption';
}) {
  return (
    <Text variant={variant} colorToken="textSecondary">
      {' '}
    </Text>
  );
}

// Stem meta: 한글 / 십신(or 일간) / 오행·음양 — 3 lines (blank equivalents if null).
function StemMeta({ stem }: { stem: ManseStemView | null }) {
  if (stem === null) {
    return (
      <Stack gap="none" align="center">
        <BlankLine variant="bodyMedium" />
        <BlankLine variant="bodySmall" />
        <BlankLine variant="caption" />
      </Stack>
    );
  }
  return (
    <Stack gap="none" align="center">
      <Text variant="bodyMedium">{stem.hangul}</Text>
      <Text
        variant="bodySmall"
        colorToken={stem.isDayMaster ? 'primary' : 'textSecondary'}
        style={stem.isDayMaster ? { fontWeight: '700' } : undefined}
      >
        {stem.tenGodLabel}
      </Text>
      <Text variant="caption" colorToken="textSecondary">
        {`${stem.elementLabel}·${stem.yinYangLabel}`}
      </Text>
    </Stack>
  );
}

// Branch meta: 한글 / 오행·음양 — 2 lines (blank equivalents if null).
function BranchMeta({ branch }: { branch: ManseBranchView | null }) {
  if (branch === null) {
    return (
      <Stack gap="none" align="center">
        <BlankLine variant="bodyMedium" />
        <BlankLine variant="caption" />
      </Stack>
    );
  }
  return (
    <Stack gap="none" align="center">
      <Text variant="bodyMedium">{branch.hangul}</Text>
      <Text variant="caption" colorToken="textSecondary">
        {`${branch.elementLabel}·${branch.yinYangLabel}`}
      </Text>
    </Stack>
  );
}

export function PillarColumn({ pillar }: { pillar: PillarView }) {
  const stem = pillar.stem;
  const branch = pillar.branch;

  return (
    <Stack style={{ flex: 1 }} gap="xs" align="center">
      <Text variant="bodyMedium" colorToken="textSecondary">
        {pillar.columnLabel}
      </Text>

      {/* 천간 */}
      {stem ? (
        <ElementGlyphTile
          glyph={stem.hanja}
          elementColorKey={stem.elementColorKey}
          accessibilityLabel={`${pillar.columnLabel}주 천간 ${stem.hangul}, ${stem.elementLabel}, ${stem.yinYangLabel}, ${stem.tenGodLabel}`}
        />
      ) : (
        <NeutralCell />
      )}
      <StemMeta stem={stem} />

      {/* 지지 */}
      {branch ? (
        <ElementGlyphTile
          glyph={branch.hanja}
          elementColorKey={branch.elementColorKey}
          accessibilityLabel={`${pillar.columnLabel}주 지지 ${branch.hangul}, ${branch.elementLabel}, ${branch.yinYangLabel}`}
        />
      ) : (
        <NeutralCell />
      )}
      <BranchMeta branch={branch} />
    </Stack>
  );
}
