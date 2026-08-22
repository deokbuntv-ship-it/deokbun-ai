import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import { AI_DISCLOSURE_DOC } from '@/features/legal/aiDisclosure';

// AI 생성 콘텐츠 안내 (Sprint J2 §16). A FACTUAL notice — IMPLEMENTED_UI, not a legal draft — so it deliberately
// carries no "검토 중 초안" banner. Pure presentation; the wording is shared with the inline <AiDisclosure/>.
export default function AiNoticeScreen() {
  const router = useRouter();
  const doc = AI_DISCLOSURE_DOC;
  const handleBack = () => (router.canGoBack() ? router.back() : router.replace('/my'));

  return (
    <Screen padded={false} frame>
      <AppHeader title={doc.title} showBack onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          <Stack gap="lg">
            <Text variant="bodySmall" colorToken="textSecondary">
              {doc.updatedLabel} · {doc.version}
            </Text>
            {doc.intro.map((p, i) => (
              <Text key={`intro-${i}`} variant="bodyMedium" colorToken="textSecondary" style={styles.line}>
                {p}
              </Text>
            ))}
            {doc.sections.map((s, i) => (
              <Stack key={`s-${i}`} gap="sm">
                <Text variant="bodyLarge" style={styles.heading}>
                  {s.heading}
                </Text>
                {(s.paragraphs ?? []).map((p, j) => (
                  <Text key={`p-${j}`} variant="bodyMedium" colorToken="textSecondary" style={styles.line}>
                    {p}
                  </Text>
                ))}
                {(s.bullets ?? []).map((b, j) => (
                  <View key={`b-${j}`} style={styles.bulletRow}>
                    <Text variant="bodyMedium" colorToken="textSecondary">·</Text>
                    <Text variant="bodyMedium" colorToken="textSecondary" style={styles.flex1}>{b}</Text>
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
  heading: { fontWeight: '700' },
  line: { lineHeight: 21 },
  bulletRow: { flexDirection: 'row', gap: 8, paddingLeft: 4 },
  flex1: { flex: 1, lineHeight: 21 },
});
