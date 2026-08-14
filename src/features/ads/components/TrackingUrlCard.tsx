import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { adminTheme, adminMono } from '@/features/admin/adminTheme';
import { buildTrackingUrl } from '@/features/ads';

// Tracking URL card (§8/§11/§12/§39). Shows the DERIVED tracking URL (발급 URL) for a
// published ad, distinct from the 광고 확인 링크. Copy with truthful success/failure
// feedback (§11). QR-ready: the same URL is the QR payload (§58) — a lightweight seam,
// no separate attribution code. Fail-closed: no code → "발행 후 발급"; no usable origin →
// shows the code + a "도메인 설정 필요" note, never a fake URL.
export function TrackingUrlCard({
  code,
  origin,
}: {
  code: string | null;
  origin: string | null;
}) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [showQr, setShowQr] = useState(false);
  const url = buildTrackingUrl(code, origin);

  const copy = async () => {
    if (!url) return;
    try {
      const nav = globalThis.navigator as { clipboard?: { writeText?: (t: string) => Promise<void> } };
      if (nav?.clipboard?.writeText) {
        await nav.clipboard.writeText(url);
        setCopyState('copied');
      } else {
        setCopyState('failed');
      }
    } catch {
      setCopyState('failed');
    }
  };

  return (
    <View
      style={{
        backgroundColor: adminTheme.surface,
        borderWidth: 1,
        borderColor: adminTheme.border,
        borderRadius: 8,
        padding: 16,
        gap: 10,
      }}
    >
      <Text variant="bodyMedium" style={{ color: adminTheme.ink, fontWeight: '700' }}>
        발급 URL (유입 추적)
      </Text>

      {code === null ? (
        <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>
          아직 발행되지 않았습니다. [발행] 시 고유 추적 URL이 자동 발급됩니다.
        </Text>
      ) : url === null ? (
        <View style={{ gap: 6 }}>
          <Text variant="bodySmall" style={{ color: adminTheme.inkVariant, fontFamily: adminMono }}>
            {code}
          </Text>
          <Text variant="caption" style={{ color: adminTheme.warning }}>
            전체 URL 발급을 위해 배포 도메인(EXPO_PUBLIC_PUBLIC_BASE_URL) 설정이 필요합니다.
          </Text>
        </View>
      ) : (
        <>
          <View
            style={{
              backgroundColor: adminTheme.pageBg,
              borderRadius: 6,
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          >
            <Text variant="bodySmall" style={{ color: adminTheme.ink, fontFamily: adminMono }} selectable>
              {url}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Button label="복사" variant="secondary" onPress={copy} />
            <Pressable onPress={() => setShowQr((v) => !v)} accessibilityRole="button">
              <Text variant="bodySmall" style={{ color: adminTheme.info, fontWeight: '700' }}>
                {showQr ? 'QR 닫기' : 'QR 보기'}
              </Text>
            </Pressable>
            {copyState === 'copied' ? (
              <Text variant="caption" style={{ color: adminTheme.success }}>
                복사되었습니다
              </Text>
            ) : copyState === 'failed' ? (
              <Text variant="caption" style={{ color: adminTheme.danger }}>
                복사에 실패했어요. URL을 길게 눌러 직접 복사해 주세요.
              </Text>
            ) : null}
          </View>
          {showQr ? (
            <View style={{ gap: 4, marginTop: 4 }}>
              <Text variant="caption" style={{ color: adminTheme.inkMuted }}>
                아래 URL을 그대로 QR로 인코딩하세요 (동일 추적 URL — 별도 코드 아님).
              </Text>
              <Text variant="caption" style={{ color: adminTheme.inkVariant, fontFamily: adminMono }} selectable>
                {url}
              </Text>
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}
