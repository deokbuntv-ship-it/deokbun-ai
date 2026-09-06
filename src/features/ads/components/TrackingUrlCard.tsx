import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { adminTheme, adminMono } from '@/features/admin/adminTheme';
import { buildTrackingUrl, buildUtmTrackingUrl, UTM_PRESETS } from '@/features/ads';

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
  // Which button reported what. Keyed by button so copying the Meta URL cannot make the
  // Google row claim success.
  const [copyState, setCopyState] = useState<{ key: string; state: 'copied' | 'failed' } | null>(null);
  const [showQr, setShowQr] = useState(false);
  const url = buildTrackingUrl(code, origin);

  const copyText = async (key: string, text: string | null) => {
    if (!text) return;
    try {
      const nav = globalThis.navigator as { clipboard?: { writeText?: (t: string) => Promise<void> } };
      if (nav?.clipboard?.writeText) {
        await nav.clipboard.writeText(text);
        setCopyState({ key, state: 'copied' });
      } else {
        setCopyState({ key, state: 'failed' });
      }
    } catch {
      setCopyState({ key, state: 'failed' });
    }
  };
  const copy = () => copyText('direct', url);

  const CopyNote = ({ forKey }: { forKey: string }) =>
    copyState?.key === forKey ? (
      <Text
        variant="caption"
        style={{ color: copyState.state === 'copied' ? adminTheme.success : adminTheme.danger }}
      >
        {copyState.state === 'copied'
          ? '복사되었습니다'
          : '복사에 실패했어요. URL을 길게 눌러 직접 복사해 주세요.'}
      </Text>
    ) : null;

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
            <CopyNote forKey="direct" />
          </View>

          {/* 외부 광고 플랫폼용 URL (B1). Google/Meta 는 랜딩 URL에 자기 utm_* 를 붙이고
              임의 파라미터를 넣을 방법을 주지 않는다. 그래서 내부 코드를 utm_content 에
              실어 보낸다 — 추적을 움직이는 것은 utm_content 하나뿐이고, source/medium 은
              플랫폼 리포트가 읽기 좋으라고 넣는다. 손으로 조립하면 오타 한 번에 추적이
              통째로 날아가므로 버튼으로만 제공한다. */}
          <View style={{ gap: 8, marginTop: 4, borderTopWidth: 1, borderTopColor: adminTheme.border, paddingTop: 12 }}>
            <Text variant="bodySmall" style={{ color: adminTheme.ink, fontWeight: '700' }}>
              외부 광고 플랫폼용 URL
            </Text>
            <Text variant="caption" style={{ color: adminTheme.inkMuted }}>
              구글·메타에는 위 URL 대신 아래를 넣으세요. `utm_campaign=` 은 원하는 이름으로
              뒤에 덧붙여도 추적에 영향이 없습니다.
            </Text>
            {UTM_PRESETS.map((p) => {
              const utmUrl = buildUtmTrackingUrl(code, origin, { source: p.source, medium: p.medium });
              if (!utmUrl) return null;
              return (
                <View key={p.key} style={{ gap: 6 }}>
                  <Text variant="caption" style={{ color: adminTheme.inkVariant, fontWeight: '700' }}>
                    {p.label}
                  </Text>
                  <View
                    style={{
                      backgroundColor: adminTheme.pageBg,
                      borderRadius: 6,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                    }}
                  >
                    <Text variant="caption" style={{ color: adminTheme.ink, fontFamily: adminMono }} selectable>
                      {utmUrl}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <Button label="복사" variant="secondary" onPress={() => copyText(p.key, utmUrl)} />
                    <CopyNote forKey={p.key} />
                  </View>
                </View>
              );
            })}
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
