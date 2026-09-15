import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import { colors } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import type { LegalDocument } from './legalContent';

// Shared renderer for a versioned legal document. Shows a VISIBLE draft banner (so the presentation is never
// mistaken for a final, lawyer-reviewed document) plus the version + "as-of" label, then the sections. Pure
// presentation — no data collection, no LLM.
export function LegalDocumentView({ doc }: { doc: LegalDocument }) {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/my');
  };

  return (
    <Screen padded={false} frame>
      <AppHeader title={doc.title} showBack onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          <Stack gap="lg">
            {/* Draft banner — this presentation is under legal review and is not the final document. */}
            <Card radius="lg" style={{ backgroundColor: theme.backgroundSelected }}>
              <Stack gap="xs">
                <Text variant="bodyMedium" style={{ fontWeight: '700' }}>
                  검토 중 초안 (Draft)
                </Text>
                <Text variant="bodySmall" colorToken="textSecondary">
                  본 문서는 최종 법률 검토 전 초안입니다. 확정 시 갱신됩니다. · {doc.updatedLabel}
                </Text>
                <Text variant="bodySmall" colorToken="textSecondary">
                  버전: {doc.version}
                </Text>
              </Stack>
            </Card>

            {doc.intro.map((p, i) => (
              <Text key={`intro-${i}`} variant="bodyMedium" colorToken="textSecondary" style={styles.line}>
                {p}
              </Text>
            ))}

            {doc.sections.map((s, i) => (
              <Stack key={`s-${i}`} gap="sm">
                <Text variant="bodyLarge" style={{ fontWeight: '700' }}>
                  {s.heading}
                </Text>
                {(s.paragraphs ?? []).map((p, j) => (
                  <Text key={`p-${j}`} variant="bodyMedium" colorToken="textSecondary" style={styles.line}>
                    {p}
                  </Text>
                ))}
                {(s.bullets ?? []).map((b, j) => (
                  <View key={`b-${j}`} style={styles.bulletRow}>
                    <Text variant="bodyMedium" colorToken="textSecondary">
                      ·
                    </Text>
                    <Text variant="bodyMedium" colorToken="textSecondary" style={styles.flex1}>
                      {b}
                    </Text>
                  </View>
                ))}
              </Stack>
            ))}
          </Stack>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 48, alignItems: 'center' },
  wrapper: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  line: { lineHeight: 21 },
  bulletRow: { flexDirection: 'row', gap: 8, paddingLeft: 4 },
  flex1: { flex: 1, lineHeight: 21 },
});
