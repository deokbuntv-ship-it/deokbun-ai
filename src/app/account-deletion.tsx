import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import { ACCOUNT_DELETION_DOC } from '@/features/legal/accountDeletionGuide';

// 계정 삭제 안내 (route /account-deletion) — **구글 플레이 데이터 보안 섹션에 제출하는 공개 URL.**
//
// ⚠ `/account-delete`(하이픈 없는 -delete)와 다르다. 그쪽은 **로그인이 필요한 실행 화면**이고,
//   이쪽은 **로그인 없이 열리는 안내**다. 구글 플레이가 요구하는 것은 후자다 — 앱을 이미 지운
//   사람도 열 수 있어야 하기 때문이다. 그래서 이 화면에는 인증 가드도 리다이렉트도 없다.
//
// ⚠ 입력 폼이 없다. 익명 쓰기 경로에 레이트 리밋이 없고(`KNOWN_RISKS` M10) 메일 발송 키도 없다.
//   폼을 두면 스팸을 그대로 받는 창구가 되고, 발송에 기대면 조용히 실패한다.
//
// `ai-notice.tsx` 와 같은 패턴(사실 안내)이다. `LegalDocumentView` 를 쓰지 않는 이유는 그것이
// 언제나 "검토 중 초안" 배너를 붙이기 때문이다 — 여기 적힌 절차는 초안이 아니라 지금 도는 것이다.
export default function AccountDeletionGuideScreen() {
  const router = useRouter();
  const doc = ACCOUNT_DELETION_DOC;
  const handleBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

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
