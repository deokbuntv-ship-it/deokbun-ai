import { View, StyleSheet } from 'react-native';

import { Chip } from '@/components/Chip';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing, type SemanticColors } from '@/theme';

import { ReadingBullets, ReadingSection } from './Reading';

// Shared reading renderer for 오늘의 운세 + 이번 달 운세 (DEOKBUNI_READING_EXPERIENCE). Both screens map their
// existing detail VM into these props — one reading vocabulary, no duplicated layout. The engine/LLM result and
// its meaning are untouched: this only decides how the SAME fields are read. Tone accents reuse DESIGN_FREEZE
// tokens (no new signature colours). Only 좋은 흐름/기회 (sage) + 조심할 것 (butter) take a surface (§7).

export type FortuneToneVariant = 'positive' | 'neutral' | 'change' | 'caution';
type Row = { domain?: string | null; title: string; body: string };

export type FortuneReadingProps = {
  toneLabel: string; // overallTone / overallTier
  toneVariant: FortuneToneVariant;
  modeLabel?: string | null;
  meta: string; // dot+weekday / monthLabel
  leadLabel?: string; // small hero heading (e.g. "오늘의 한마디") — same scannable cue as the consultation lead
  headline: string;
  verdict: string;
  signalsTitle: string;
  domainSignals: { label: string; status: string; variant: string }[];
  transition?: { dateLabel: string; lines: string[] } | null; // monthly only
  highlightsTitle: string;
  highlights: Row[];
  cautionsTitle: string;
  cautions: { title: string; body: string }[];
  actionsTitle: string;
  actions: string[]; // today: [actionTip]; monthly: actions[]
  followUps: { displayLabel: string; question: string }[];
  onFollowUp: (question: string) => void;
};

const TONE_ACCENT: Record<FortuneToneVariant, keyof SemanticColors> = {
  positive: 'onSage',
  neutral: 'textSecondary',
  change: 'onButter',
  caution: 'danger',
};
const toneOf = (v: string): FortuneToneVariant => (v in TONE_ACCENT ? (v as FortuneToneVariant) : 'neutral');

export function FortuneReading(p: FortuneReadingProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const toneColor = theme[TONE_ACCENT[p.toneVariant]];

  return (
    <Stack gap="md">
      {/* HERO — the strongest block: tone + mode landmark, headline, verdict. */}
      <View style={[styles.hero, { backgroundColor: theme.surface, borderColor: toneColor }]}>
        <View style={styles.heroTop}>
          <View style={styles.pillRow}>
            <View style={[styles.tonePill, { borderColor: toneColor }]}>
              <Text variant="bodySmall" style={{ color: toneColor, fontWeight: '700' }}>
                {p.toneLabel}
              </Text>
            </View>
            {p.modeLabel ? (
              <View style={[styles.modePill, { borderColor: theme.border }]}>
                <Text variant="bodySmall" colorToken="textSecondary" style={{ fontWeight: '600' }}>
                  {p.modeLabel}
                </Text>
              </View>
            ) : null}
          </View>
          <Text variant="bodySmall" colorToken="textSecondary">
            {p.meta}
          </Text>
        </View>
        {p.leadLabel ? (
          <Text variant="bodySmall" style={{ color: theme.textSecondary, fontWeight: '700', marginTop: spacing.sm }}>
            {p.leadLabel}
          </Text>
        ) : null}
        <Text variant="headingLarge" style={{ marginTop: p.leadLabel ? 2 : spacing.sm }}>
          {p.headline}
        </Text>
        <Text variant="reading" style={{ marginTop: spacing.xs, lineHeight: 28 }}>
          {p.verdict}
        </Text>
      </View>

      {/* 핵심 — deterministic domain statuses (server-owned; only what the evidence robustly knows). */}
      {p.domainSignals.length > 0 ? (
        <ReadingSection variant="neutral" title={p.signalsTitle} emoji={null}>
          <View style={{ gap: spacing.sm }}>
            {p.domainSignals.map((s, i) => (
              <View key={`s${i}`} style={styles.signalRow}>
                <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                  {s.label}
                </Text>
                <Text variant="bodyMedium" style={{ color: theme[TONE_ACCENT[toneOf(s.variant)]], fontWeight: '700' }}>
                  {s.status}
                </Text>
              </View>
            ))}
          </View>
        </ReadingSection>
      ) : null}

      {/* 흐름 변화 (monthly) */}
      {p.transition ? (
        <ReadingSection variant="neutral" title="이번 달 흐름 변화" emoji={null}>
          <Text variant="bodySmall" colorToken="textSecondary" style={{ marginBottom: spacing.xs }}>
            {p.transition.dateLabel}
          </Text>
          {p.transition.lines.map((l, i) => (
            <Text key={`t${i}`} variant="reading" style={{ lineHeight: 28 }}>
              {l}
            </Text>
          ))}
        </ReadingSection>
      ) : null}

      {/* 🌿 좋은 흐름 / 기회 */}
      {p.highlights.length > 0 ? (
        <ReadingSection variant="positive" title={p.highlightsTitle}>
          <View style={{ gap: spacing.md }}>
            {p.highlights.map((h, i) => (
              <View key={`h${i}`}>
                <Text variant="bodyMedium" style={{ fontWeight: '700' }}>
                  {h.domain ? `${h.domain} · ` : ''}
                  {h.title}
                </Text>
                <Text variant="reading" style={{ lineHeight: 28 }}>
                  {h.body}
                </Text>
              </View>
            ))}
          </View>
        </ReadingSection>
      ) : null}

      {/* 🕯️ 조심할 것 */}
      {p.cautions.length > 0 ? (
        <ReadingSection variant="caution" title={p.cautionsTitle}>
          <View style={{ gap: spacing.md }}>
            {p.cautions.map((c, i) => (
              <View key={`c${i}`}>
                <Text variant="bodyMedium" style={{ fontWeight: '700' }}>
                  {c.title}
                </Text>
                <Text variant="reading" style={{ lineHeight: 28 }}>
                  {c.body}
                </Text>
              </View>
            ))}
          </View>
        </ReadingSection>
      ) : null}

      {/* 💡 이렇게 해보세요 */}
      {p.actions.length > 0 ? (
        <ReadingSection variant="action" title={p.actionsTitle}>
          {p.actions.length === 1 ? (
            <Text variant="reading" style={{ lineHeight: 28 }}>
              {p.actions[0]}
            </Text>
          ) : (
            <ReadingBullets items={p.actions} />
          )}
        </ReadingSection>
      ) : null}

      {/* 이어서 물어보기 — short chip labels; the rich question is sent to 상담. */}
      {p.followUps.length > 0 ? (
        <Stack gap="sm">
          <Text variant="bodyMedium" style={{ fontWeight: '700' }}>
            이어서 물어보기
          </Text>
          <View style={styles.chipWrap}>
            {p.followUps.map((f) => (
              <Chip key={f.question} label={f.displayLabel} onPress={() => p.onFollowUp(f.question)} />
            ))}
          </View>
        </Stack>
      ) : null}
    </Stack>
  );
}

const styles = StyleSheet.create({
  hero: { borderWidth: 1, borderRadius: radius.xl, padding: spacing.lg },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  pillRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap', flexShrink: 1 },
  tonePill: { borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  modePill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  signalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
