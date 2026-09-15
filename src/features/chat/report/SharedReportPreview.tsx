import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

import { lockedSummaryLine, previewHeadline, type SharePreview } from './sharePreview';

// 익명 미리보기 — the screen a logged-out visitor sees when they tap a friend's share link.
//
// WHY THIS EXISTS (owner decision 2026-09-06): the previous behaviour redirected straight to
// /login. Someone who taps a friend's link did not come looking for a compatibility report; they
// came because a friend sent them something. A login wall before they know what it is loses them.
// Value first, account second.
//
// WHAT IT CAN AND CANNOT SHOW is not decided here. The server (`get_shared_report_preview`) sends
// the conclusion and three counts and nothing else, so this component could not leak the findings
// if it tried — they never arrive. Hiding in the client would be theatre: devtools shows the
// response.
//
// Design: existing tokens only (Card / Stack / Text / Button, spacing + radius scale). No new
// colour, no new type size. The locked block uses `backgroundSelected`, the same tint the app
// already uses for a pressed/held surface, so a "not yet yours" surface reads as familiar rather
// than as a new visual concept.
export function SharedReportPreview({
  preview,
  onOpenFull,
}: {
  preview: SharePreview;
  onOpenFull: () => void;
}) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const locked = lockedSummaryLine(preview);

  return (
    <View style={styles.wrap}>
      <Stack gap="lg">
        <Stack gap="xs">
          <Text variant="headingLarge">{previewHeadline(preview.reportKind)}</Text>
          {/* No names anywhere — not in the card, not here. A shared pair report is decided by
              one of the two people, and the reader is a third party either way. */}
          <Text variant="bodySmall" colorToken="textSecondary">
            친구가 보낸 결과예요. 결론을 먼저 보여드릴게요.
          </Text>
        </Stack>

        <Card radius="xl">
          <Text variant="bodyLarge" style={styles.conclusion}>
            {preview.conclusion}
          </Text>
        </Card>

        {locked ? (
          <View style={[styles.locked, { backgroundColor: theme.backgroundSelected }]}>
            <Text variant="bodyMedium" style={styles.lockedTitle}>
              🔒 {locked}
            </Text>
            <Text variant="bodySmall" colorToken="textSecondary" style={styles.line}>
              분야별로 어떻게 다른지, 무엇을 조심하면 되는지는 전체 보기에서 확인하실 수 있어요.
            </Text>
          </View>
        ) : null}

        <Stack gap="xs">
          <Button label="전체 보기" radius="lg" onPress={onOpenFull} />
          <Text variant="caption" colorToken="textMuted" style={styles.center}>
            간편가입 후 보시던 결과로 바로 돌아와요.
          </Text>
        </Stack>

        <Text variant="caption" colorToken="textMuted" style={styles.line}>
          덕분이의 해석은 AI가 생성하며 참고용이에요.
        </Text>
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  // maxWidth keeps the 360dp phone and a wide browser on the same measure; nothing here needs a
  // horizontal scroll at 360.
  wrap: { width: '100%', maxWidth: 420, alignSelf: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  conclusion: { lineHeight: 26 },
  locked: { borderRadius: radius.xl, padding: spacing.md, gap: 6 },
  lockedTitle: { fontWeight: '700' },
  line: { lineHeight: 20 },
  center: { textAlign: 'center' },
});
