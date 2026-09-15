import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AiDisclosure } from '@/components/AiDisclosure';
import { LineIcon } from '@/components/LineIcon';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

import type { PremiumReportView as PremiumReportVM } from './reportPresentation';

// Premium consultation-report renderer (Commercial UX V4 §5/§6/§8/§46). ONE renderer for both the owner
// detail and the shared read-only view — `mode` only changes the eyebrow + the footer slot the caller
// passes. Editorial layout, not chat cards: a masthead, a hero summary on a single subtle surface, then
// label+content sections separated by thin dividers. Restrained — a single teal accent, no gold, no
// nested cards, no fortune-teller decoration. It renders ONLY what the view-model carries (empty sections
// already filtered upstream); it never fabricates a section or shows internal/engine language.
export type PremiumReportMode = 'owner' | 'shared';

export function PremiumReportView({
  view,
  mode,
  footer,
}: {
  view: PremiumReportVM;
  mode: PremiumReportMode;
  footer?: ReactNode;
}) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const eyebrow = mode === 'shared' ? '공유받은 상담 보고서' : view.eyebrow;

  return (
    <Stack gap="xl">
      {/* Masthead — a published-report header, not a chat turn */}
      <Stack gap="sm">
        <View style={styles.eyebrowRow}>
          <LineIcon name="sparkle" size={15} color={theme.secondary} />
          <Text variant="bodySmall" colorToken="textSecondary" style={styles.eyebrow}>
            {eyebrow}
          </Text>
        </View>
        <Text variant="displayMedium" style={styles.title}>
          {view.title}
        </Text>
        {view.dateLabel ? (
          <Text variant="bodySmall" colorToken="textSecondary">
            {view.dateLabel}
          </Text>
        ) : null}
      </Stack>

      {/* Hero summary — one calm elevated surface with a single accent rule */}
      {view.summary ? (
        <View
          style={[
            styles.hero,
            { backgroundColor: theme.backgroundElevated, borderLeftColor: theme.secondary },
          ]}
        >
          <Text variant="bodySmall" colorToken="textSecondary" style={styles.heroLabel}>
            한눈에 보는 핵심 요약
          </Text>
          <Text variant="bodyLarge" style={styles.heroBody}>
            {view.summary}
          </Text>
        </View>
      ) : null}

      {/* Sections — editorial blocks, single level, divided by a thin rule */}
      {view.sections.map((section, i) => (
        <View key={i}>
          {i > 0 ? <View style={[styles.divider, { backgroundColor: theme.border }]} /> : null}
          <Stack gap="sm">
            <View style={styles.sectionLabelRow}>
              <View style={[styles.tick, { backgroundColor: theme.secondary }]} />
              <Text variant="bodySmall" colorToken="textSecondary" style={styles.sectionLabel}>
                {section.title}
              </Text>
            </View>
            {section.kind === 'paragraph' ? (
              <Text variant="bodyMedium" style={styles.body}>
                {section.body}
              </Text>
            ) : (
              <Stack gap="sm">
                {section.items.map((it, j) => (
                  <View key={j} style={styles.bulletRow}>
                    <View style={[styles.dot, { backgroundColor: theme.secondary }]} />
                    <Text variant="bodyMedium" style={styles.bulletText}>
                      {it}
                    </Text>
                  </View>
                ))}
              </Stack>
            )}
          </Stack>
        </View>
      ))}

      {/* AI-generated-content disclosure (§2) — part of the report artifact, so it travels to both the owner
          view and the shared read-only view. */}
      <AiDisclosure variant="card" style={styles.disclosure} />

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </Stack>
  );
}

const styles = StyleSheet.create({
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  eyebrow: {
    letterSpacing: 1,
  },
  title: {
    fontWeight: '700',
    lineHeight: 34,
  },
  hero: {
    borderRadius: radius.xl,
    borderLeftWidth: 3,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  heroLabel: {
    letterSpacing: 0.5,
  },
  heroBody: {
    lineHeight: 27,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: spacing.xl,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tick: {
    width: 14,
    height: 3,
    borderRadius: 2,
  },
  sectionLabel: {
    letterSpacing: 0.5,
  },
  body: {
    lineHeight: 25,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 9,
  },
  bulletText: {
    flex: 1,
    lineHeight: 25,
  },
  footer: {
    marginTop: spacing.sm,
  },
  disclosure: {
    marginTop: spacing.lg,
  },
});
