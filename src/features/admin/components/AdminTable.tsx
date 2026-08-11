import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/Text';

import { adminMono, adminTheme } from '../adminTheme';

// Dense admin data table (Stitch): gray header, ~48px rows, 1px dividers, right-
// aligned numeric columns, optional monospace cells for IDs/tokens/cost, and an
// optional per-row tint (e.g. error rows). Generic over the row type.
export type AdminTableColumn<T> = {
  key: string;
  label: string;
  flex?: number;
  align?: 'left' | 'right' | 'center';
  mono?: boolean;
  render: (row: T) => ReactNode;
};

type AdminTableProps<T> = {
  columns: AdminTableColumn<T>[];
  rows: T[];
  keyExtractor: (row: T) => string;
  onRowPress?: (row: T) => void;
  rowTone?: (row: T) => 'error' | undefined;
};

function alignToFlex(align?: string) {
  return align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start';
}

export function AdminTable<T>({ columns, rows, keyExtractor, onRowPress, rowTone }: AdminTableProps<T>) {
  return (
    <View
      style={{
        backgroundColor: adminTheme.surface,
        borderWidth: 1,
        borderColor: adminTheme.border,
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: adminTheme.tableHeaderBg,
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: adminTheme.border,
        }}
      >
        {columns.map((c) => (
          <View key={c.key} style={{ flex: c.flex ?? 1, alignItems: alignToFlex(c.align) }}>
            <Text variant="caption" style={{ color: adminTheme.inkVariant, fontWeight: '700' }}>
              {c.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Rows */}
      {rows.map((row, i) => {
        const tone = rowTone?.(row);
        const content = (
          <View
            style={{
              flexDirection: 'row',
              paddingHorizontal: 16,
              paddingVertical: 12,
              gap: 12,
              minHeight: 48,
              alignItems: 'center',
              borderBottomWidth: i === rows.length - 1 ? 0 : 1,
              borderBottomColor: adminTheme.border,
              backgroundColor: tone === 'error' ? adminTheme.dangerBg : adminTheme.surface,
            }}
          >
            {columns.map((c) => {
              const cell = c.render(row);
              return (
                <View key={c.key} style={{ flex: c.flex ?? 1, alignItems: alignToFlex(c.align) }}>
                  {typeof cell === 'string' || typeof cell === 'number' ? (
                    <Text
                      variant="bodySmall"
                      style={{
                        color: adminTheme.ink,
                        fontFamily: c.mono ? adminMono : undefined,
                        textAlign: c.align ?? 'left',
                      }}
                      numberOfLines={2}
                    >
                      {cell}
                    </Text>
                  ) : (
                    cell
                  )}
                </View>
              );
            })}
          </View>
        );
        return onRowPress ? (
          <Pressable
            key={keyExtractor(row)}
            onPress={() => onRowPress(row)}
            accessibilityRole="button"
            style={({ pressed }) => (pressed ? { opacity: 0.7 } : undefined)}
          >
            {content}
          </Pressable>
        ) : (
          <View key={keyExtractor(row)}>{content}</View>
        );
      })}
    </View>
  );
}
