import { useState } from 'react';
import { Pressable } from 'react-native';

import { Card } from '@/components/Card';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';

import type { ManseFourPillars, ManseHiddenStemView, PillarView } from '../types';
import { ElementGlyphTile } from './ElementGlyphTile';

// Presentation-only, props-in (reusable by the Famous page). Renders 지장간 as a
// detail/expand block so the main grid stays compact. All values are ENGINE
// canonical labels; nothing is computed here. Ratios / 사령일수 are intentionally
// NOT shown (not in ENGINE V1). No branch-level representative TenGod is invented.

const ORDER: (keyof ManseFourPillars)[] = ['hour', 'day', 'month', 'year'];

function HiddenStemRow({ item }: { item: ManseHiddenStemView }) {
  return (
    <Stack direction="row" gap="sm" align="center">
      <ElementGlyphTile
        glyph={item.hanja}
        elementColorKey={item.elementColorKey}
        size="sm"
      />
      <Text variant="bodySmall" colorToken="textSecondary" style={{ flex: 1 }}>
        {`${item.hangul} · ${item.roleLabel} · ${item.elementLabel}·${item.yinYangLabel} · ${item.tenGodLabel}`}
      </Text>
    </Stack>
  );
}

export function HiddenStemsList({ pillars }: { pillars: ManseFourPillars }) {
  const [expanded, setExpanded] = useState(false);

  const groups = ORDER.map((key) => ({
    label: pillars[key].columnLabel,
    branch: (pillars[key] as PillarView).branch,
  })).filter(
    (g): g is { label: string; branch: NonNullable<PillarView['branch']> } =>
      g.branch !== null && g.branch.hiddenStems.length > 0,
  );

  if (groups.length === 0) {
    return null;
  }

  return (
    <Stack gap="sm">
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <Text variant="bodyMedium" colorToken="primary">
          {expanded ? '지장간 접기' : '지장간 보기'}
        </Text>
      </Pressable>

      {expanded ? (
        <Card>
          <Stack gap="md">
            {groups.map((group) => (
              <Stack key={group.label} gap="xs">
                <Text variant="bodyMedium">{`${group.label}주`}</Text>
                {group.branch.hiddenStems.map((item, index) => (
                  <HiddenStemRow key={`${group.label}-${index}`} item={item} />
                ))}
              </Stack>
            ))}
          </Stack>
        </Card>
      ) : null}
    </Stack>
  );
}
