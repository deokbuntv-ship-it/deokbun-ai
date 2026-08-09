import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { Card } from '@/components/Card';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, spacing } from '@/theme';

export type AdminColumn = {
  key: string;
  header: string;
  flex?: number; // default 1
  align?: 'left' | 'right' | 'center';
};

// Minimal web-oriented data table. Generic over the row type; the caller renders
// each cell. Presentation-only — no data fetching or sorting logic here.
export function AdminDataTable<T>({
  columns,
  rows,
  keyExtractor,
  renderCell,
  onRowPress,
}: {
  columns: AdminColumn[];
  rows: T[];
  keyExtractor: (item: T) => string;
  renderCell: (item: T, columnKey: string) => ReactNode;
  onRowPress?: (item: T) => void;
}) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  const alignItemsFor = (align?: 'left' | 'right' | 'center') =>
    align === 'right'
      ? 'flex-end'
      : align === 'center'
        ? 'center'
        : 'flex-start';

  return (
    <Card style={{ padding: 0 }}>
      {/* header */}
      <View
        style={{
          flexDirection: 'row',
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
          backgroundColor: theme.backgroundElevated,
        }}
      >
        {columns.map((col) => (
          <View
            key={col.key}
            style={{ flex: col.flex ?? 1, alignItems: alignItemsFor(col.align) }}
          >
            <Text variant="caption" colorToken="textSecondary">
              {col.header}
            </Text>
          </View>
        ))}
      </View>

      {/* rows */}
      {rows.map((item) => {
        const rowContent = (
          <View
            style={{
              flexDirection: 'row',
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.md,
              borderBottomWidth: 1,
              borderBottomColor: theme.border,
            }}
          >
            {columns.map((col) => (
              <View
                key={col.key}
                style={{
                  flex: col.flex ?? 1,
                  alignItems: alignItemsFor(col.align),
                }}
              >
                {renderCell(item, col.key)}
              </View>
            ))}
          </View>
        );

        return onRowPress ? (
          <Pressable
            key={keyExtractor(item)}
            onPress={() => onRowPress(item)}
            accessibilityRole="button"
          >
            {rowContent}
          </Pressable>
        ) : (
          <View key={keyExtractor(item)}>{rowContent}</View>
        );
      })}

      {rows.length === 0 ? (
        <View style={{ padding: spacing.md }}>
          <Text variant="bodySmall" colorToken="textSecondary">
            데이터가 없습니다.
          </Text>
        </View>
      ) : null}
    </Card>
  );
}
