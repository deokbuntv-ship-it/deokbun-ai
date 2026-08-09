import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';

import type {
  ManseFourPillars,
  ManseHiddenStemView,
  PillarView,
} from '../types';
import { ElementGlyphTile } from './ElementGlyphTile';

// Presentation-only, props-in (reusable by the Famous page). Renders 지장간 as a
// COMPACT sub-row meant to sit INSIDE the 사주 명식 Card, in the same 시|일|월|년
// column association (each cell aligns under its 지지). Not a separate large card.
//
// Shows ONLY: 지장간 한자 (오행 tile, color carries the element) + 십신.
// 역할(정기/중기/여기) and 오행·음양 text are intentionally NOT displayed here
// (presentation hide only) — they remain in ENGINE derivedFacts and in the tile's
// accessibilityLabel. Nothing is computed/summed/reordered; ENGINE order is kept.

const ORDER: (keyof ManseFourPillars)[] = ['hour', 'day', 'month', 'year'];

function HiddenStemUnit({ item }: { item: ManseHiddenStemView }) {
  return (
    <Stack gap="none" align="center">
      <ElementGlyphTile
        glyph={item.hanja}
        elementColorKey={item.elementColorKey}
        size="sm"
        accessibilityLabel={`지장간 ${item.hangul}, ${item.roleLabel}, ${item.elementLabel}, ${item.yinYangLabel}, ${item.tenGodLabel}`}
      />
      <Text variant="caption" colorToken="textSecondary">
        {item.tenGodLabel}
      </Text>
    </Stack>
  );
}

function HiddenStemsCell({ branch }: { branch: PillarView['branch'] }) {
  const stems = branch?.hiddenStems ?? [];
  return (
    <Stack
      direction="row"
      gap="xs"
      style={{ flex: 1, flexWrap: 'wrap', justifyContent: 'center' }}
    >
      {stems.length > 0 ? (
        stems.map((item, index) => (
          <HiddenStemUnit key={index} item={item} />
        ))
      ) : (
        // No hidden stems for this pillar (e.g. hour PARTIAL) — neutral marker,
        // never a fabricated 지장간. Keeps the 4-column association intact.
        <Text variant="caption" colorToken="textSecondary">
          –
        </Text>
      )}
    </Stack>
  );
}

export function HiddenStemsList({ pillars }: { pillars: ManseFourPillars }) {
  const anyHidden = ORDER.some((key) => {
    const branch = (pillars[key] as PillarView).branch;
    return branch !== null && branch.hiddenStems.length > 0;
  });

  if (!anyHidden) {
    return null;
  }

  return (
    <Stack gap="xs">
      <Text
        variant="caption"
        colorToken="textSecondary"
        style={{ textAlign: 'center' }}
      >
        지장간
      </Text>
      <Stack direction="row" gap="sm">
        {ORDER.map((key) => (
          <HiddenStemsCell
            key={key}
            branch={(pillars[key] as PillarView).branch}
          />
        ))}
      </Stack>
    </Stack>
  );
}
