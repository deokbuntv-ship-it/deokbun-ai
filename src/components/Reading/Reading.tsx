import { useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing, type SemanticColors } from '@/theme';

// SHARED Reading Experience System (DEOKBUNI_READING_EXPERIENCE) — ONE reading vocabulary for every 역학/AI
// interpretation surface (상담 · 오늘의 운세 · 월별운세 · 궁합 · Premium Report). A long Korean reading is a
// personal letter to READ, not a dashboard of boxes: the flow stays connected, only 2–3 sections opt into a
// pastel surface, emoji act as scan landmarks, and 전문 근거 lives under a collapsed "왜 이렇게 보나요?".
//
// Variants carry MEANING (not colour names) so a token change re-skins every surface at once. Pastel meanings
// reuse the DESIGN_FREEZE tokens; on-pastel text uses the accessible on* tokens for the accent + textPrimary
// for body.
export type ReadingVariant =
  | 'neutral' // plain white — lead, summary, action detail
  | 'positive' // 🌿 좋은 흐름 / 기회 — sage
  | 'caution' // 🕯️ 조심할 점 — butter
  | 'insight' // ✨ 한마디 / 핵심 — blush
  | 'relationship' // 💕 잘 맞는 부분 — blush
  | 'difference' // 🧩 서로 다른 부분 — sky
  | 'action'; // 💡 이렇게 해보세요 — white + subtle

type VariantStyle = { surface: keyof SemanticColors | null; accent: keyof SemanticColors; emoji: string | null };

const VARIANT: Record<ReadingVariant, VariantStyle> = {
  neutral: { surface: null, accent: 'textSecondary', emoji: null },
  positive: { surface: 'surfaceSage', accent: 'onSage', emoji: '🌿' },
  caution: { surface: 'surfaceButter', accent: 'onButter', emoji: '🕯️' },
  insight: { surface: 'surfaceBlush', accent: 'onBlush', emoji: '✨' },
  relationship: { surface: 'surfaceBlush', accent: 'onBlush', emoji: '💕' },
  difference: { surface: 'surfaceSky', accent: 'textSecondary', emoji: '🧩' },
  action: { surface: null, accent: 'textSecondary', emoji: '💡' },
};

// The one-line conclusion — the strongest block, visible first (§3/§6). Bold, generous measure.
export function ReadingLead({ children, sub, style }: { children: string; sub?: string | null; style?: StyleProp<ViewStyle> }) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  return (
    <View style={[styles.lead, { borderColor: theme.border, backgroundColor: theme.surface }, style]}>
      <Text variant="bodyLarge" style={styles.leadText}>
        {children}
      </Text>
      {sub ? (
        <Text variant="bodySmall" colorToken="textSecondary" style={{ marginTop: spacing.xs, lineHeight: 21 }}>
          {sub}
        </Text>
      ) : null}
    </View>
  );
}

// A semantic reading section. Title carries the emoji landmark + variant accent; body is `children` (prose) or
// a `ReadingBullets`. Only positive/caution/insight/relationship/difference paint a subtle surface — pass
// `neutral`/`action` for the connected white flow so a reading never becomes a colour patchwork (§7/§15).
export function ReadingSection({
  variant = 'neutral',
  title,
  emoji,
  children,
  style,
}: {
  variant?: ReadingVariant;
  title?: string;
  emoji?: string | null; // override the variant default; pass null to suppress
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const v = VARIANT[variant];
  const filled = v.surface !== null;
  const glyph = emoji === null ? null : emoji ?? v.emoji;
  return (
    <View
      style={[
        styles.section,
        filled
          ? { backgroundColor: theme[v.surface as keyof SemanticColors] }
          : { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
        style,
      ]}
    >
      {title ? (
        <Text variant="bodyMedium" style={[styles.sectionTitle, { color: theme[v.accent] }]}>
          {glyph ? `${glyph} ` : ''}
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

// Body prose inside a section — the reading measure (16/28). `onSurface` picks the dark-ink body that reads on
// a pastel plane.
export function ReadingBody({ children, onSurface = false }: { children: string; onSurface?: boolean }) {
  return (
    <Text variant="reading" colorToken={onSurface ? 'textPrimary' : 'textPrimary'} style={styles.body}>
      {children}
    </Text>
  );
}

// Bullets — one shared implementation (replaces the duplicated bullet markup across the readers).
export function ReadingBullets({ items, glyphColor }: { items: string[]; glyphColor?: string }) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  return (
    <View style={{ gap: spacing.sm }}>
      {items.map((it, i) => (
        <View key={i} style={styles.bulletRow}>
          <Text variant="reading" style={{ color: glyphColor ?? theme.textSecondary }}>
            ·
          </Text>
          <Text variant="reading" style={styles.bulletText}>
            {it}
          </Text>
        </View>
      ))}
    </View>
  );
}

// 전문 근거 — collapsed by default. The label is consumer-first ("왜 이렇게 보나요?"), the evidence is inside.
export function ReadingEvidence({
  title = '왜 이렇게 보나요?',
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const [open, setOpen] = useState(false);
  return (
    <View style={[styles.section, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={open ? `${title} 접기` : title}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((o) => !o)}
        hitSlop={8}
      >
        <Text variant="bodyMedium" style={{ fontWeight: '700', color: theme.textSecondary }}>
          {title} {open ? '▴' : '▾'}
        </Text>
      </Pressable>
      {open ? <View style={{ marginTop: spacing.md, gap: spacing.lg }}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  lead: {
    borderWidth: 1,
    borderRadius: radius.xl,
    paddingVertical: 18,
    paddingHorizontal: spacing.lg,
  },
  leadText: { fontWeight: '700', lineHeight: 27 },
  section: {
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  sectionTitle: { fontWeight: '700' },
  body: { lineHeight: 28 },
  bulletRow: { flexDirection: 'row', gap: spacing.sm },
  bulletText: { flex: 1, lineHeight: 28 },
});
