import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Button } from '@/components/Button';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { AdminPageHeader, AdminSelect, AdminStateView, KpiCard } from '@/features/admin';
import { adminTheme } from '@/features/admin/adminTheme';
import {
  AD_TYPE_LABELS,
  buildAdPerformanceSheet,
  buildXlsx,
  formatKrw,
  formatRate,
  type AdOverviewTotals,
  type AdPerformanceRow,
} from '@/features/ads';
import { adPerformanceService } from '@/features/ads/services/adPerformanceService';
import { resolveAppOrigin } from '@/features/ads/services/appOrigin';
import { downloadXlsx } from '@/features/ads/services/xlsxDownload';

type LoadStatus = 'loading' | 'connected' | 'not_connected' | 'error';
type Period = '' | 'today' | 'd7' | 'd30';

const PERIOD_OPTIONS = [
  { value: '' as const, label: '전체 기간' },
  { value: 'today' as const, label: '오늘' },
  { value: 'd7' as const, label: '최근 7일' },
  { value: 'd30' as const, label: '최근 30일' },
];

// Column set (§31). Rendered in a horizontally-scrollable dense table; the full §43 set is
// in the XLSX. width per column keeps it readable on narrow desktop.
const COLS: { key: string; label: string; w: number }[] = [
  { key: 'publisher', label: '광고/닉네임', w: 150 },
  { key: 'adType', label: '광고형태', w: 110 },
  { key: 'cost', label: '광고비', w: 100 },
  { key: 'clicks', label: '유입', w: 64 },
  { key: 'birth', label: '출생완료', w: 80 },
  { key: 'signups', label: '가입', w: 64 },
  { key: 'first', label: '첫상담', w: 72 },
  { key: 'd1', label: 'D1', w: 52 },
  { key: 'd7', label: 'D7', w: 52 },
  { key: 'd30', label: 'D30', w: 56 },
  { key: 'signupConv', label: '가입전환', w: 84 },
  { key: 'firstConv', label: '첫상담전환', w: 92 },
  { key: 'd7ret', label: 'D7리텐션', w: 84 },
  { key: 'cac', label: '가입CAC', w: 100 },
  { key: 'cpa', label: '첫상담CPA', w: 108 },
];

export default function AdminAdPerformanceScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [rows, setRows] = useState<AdPerformanceRow[]>([]);
  const [totals, setTotals] = useState<AdOverviewTotals | null>(null);
  const [period, setPeriod] = useState<Period>('');
  const [downloadNote, setDownloadNote] = useState<string | null>(null);
  const origin = resolveAppOrigin();

  const periodBounds = (p: Period): { from?: string } => {
    if (p === 'today') return { from: new Date(Date.now() - 24 * 3600e3).toISOString() };
    if (p === 'd7') return { from: new Date(Date.now() - 7 * 24 * 3600e3).toISOString() };
    if (p === 'd30') return { from: new Date(Date.now() - 30 * 24 * 3600e3).toISOString() };
    return {};
  };

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const result = await adPerformanceService.getPerformance(periodBounds(period));
      if (!result.connected) {
        setStatus('not_connected');
        return;
      }
      setRows(result.rows);
      setTotals(result.totals);
      setStatus('connected');
    } catch {
      setStatus('error');
    }
  }, [period]);

  useEffect(() => {
    void load();
  }, [load]);

  const onDownload = () => {
    setDownloadNote(null);
    const sheet = buildAdPerformanceSheet(rows, {
      origin,
      adCheckUrlByAd: {},
      notesByAd: {},
    });
    const bytes = buildXlsx(sheet);
    const ok = downloadXlsx(bytes, `광고성과_${period || '전체'}.xlsx`);
    setDownloadNote(ok ? '다운로드를 시작했습니다.' : '다운로드에 실패했어요. 브라우저 설정을 확인해 주세요.');
  };

  const cell = (row: AdPerformanceRow, key: string): string => {
    const c = row.counts;
    switch (key) {
      case 'publisher': return row.ad.publisherNickname;
      case 'adType': return AD_TYPE_LABELS[row.ad.adType];
      case 'cost': return formatKrw(row.ad.costKrw, '미입력');
      case 'clicks': return String(c.clicks);
      case 'birth': return String(c.birthInfoCompleted);
      case 'signups': return String(c.signups);
      case 'first': return String(c.firstConsultations);
      case 'd1': return String(c.d1);
      case 'd7': return String(c.d7);
      case 'd30': return String(c.d30);
      case 'signupConv': return formatRate(row.signupConversion);
      case 'firstConv': return formatRate(row.clickToFirstConsult);
      case 'd7ret': return formatRate(row.d7Retention);
      case 'cac': return formatKrw(row.signupCac);
      case 'cpa': return formatKrw(row.firstConsultCpa);
      default: return '';
    }
  };

  return (
    <Stack gap="xl">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <AdminPageHeader title="광고 성과" subtitle="광고별 유입·가입·첫 상담·리텐션과 CAC/CPA. 화면 필터 그대로 엑셀로 내려받을 수 있습니다." />
        <View style={{ flexDirection: 'row', gap: 8, paddingTop: 4, alignItems: 'center' }}>
          <AdminSelect options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />
          <Button label="← 광고 목록" variant="secondary" onPress={() => router.replace('/admin/ads')} />
        </View>
      </View>

      {status === 'loading' || status === 'error' ? (
        <AdminStateView state={status === 'loading' ? 'loading' : 'error'} onRetry={load} />
      ) : status === 'not_connected' ? (
        <View style={{ padding: 32, alignItems: 'center', gap: 8 }}>
          <Text variant="bodyMedium" style={{ color: adminTheme.inkVariant }}>
            성과 집계 준비 중
          </Text>
          <Text variant="bodySmall" style={{ color: adminTheme.inkMuted, textAlign: 'center', maxWidth: 460 }}>
            광고 등록·발행·추적 URL은 지금 사용할 수 있어요. 유입·전환 집계는 트래킹
            마이그레이션(docs/ADVERTISEMENTS_SETUP.sql)과 ad-track 함수 배포 후 표시됩니다.
          </Text>
        </View>
      ) : (
        <>
          {totals ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              <KpiCard label="총 광고 유입" value={totals.totalClicks.toLocaleString('ko-KR')} />
              <KpiCard label="신규 가입" value={totals.totalSignups.toLocaleString('ko-KR')} />
              <KpiCard label="첫 상담" value={totals.totalFirstConsultations.toLocaleString('ko-KR')} />
              <KpiCard label="D7 재방문" value={totals.totalD7.toLocaleString('ko-KR')} />
              <KpiCard label="총 광고비" value={formatKrw(totals.totalCostKrw, '미입력')} />
              <KpiCard label="평균 가입 CAC" value={formatKrw(totals.avgSignupCac)} />
              <KpiCard label="첫 상담 CPA" value={formatKrw(totals.avgFirstConsultCpa)} />
            </View>
          ) : null}

          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <Button label="엑셀 다운로드 (.xlsx)" onPress={onDownload} disabled={rows.length === 0} />
            {downloadNote ? (
              <Text variant="caption" style={{ color: adminTheme.inkMuted }}>
                {downloadNote}
              </Text>
            ) : null}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator style={{ borderWidth: 1, borderColor: adminTheme.border, borderRadius: 8 }}>
            <View>
              <View style={{ flexDirection: 'row', backgroundColor: adminTheme.tableHeaderBg }}>
                {COLS.map((col) => (
                  <View key={col.key} style={{ width: col.w, paddingHorizontal: 8, paddingVertical: 10 }}>
                    <Text variant="caption" style={{ color: adminTheme.inkMuted, fontWeight: '700' }}>
                      {col.label}
                    </Text>
                  </View>
                ))}
              </View>
              {rows.map((row) => (
                <View
                  key={row.ad.id}
                  style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: adminTheme.border }}
                >
                  {COLS.map((col) => (
                    <View key={col.key} style={{ width: col.w, paddingHorizontal: 8, paddingVertical: 9, justifyContent: 'center' }}>
                      <Text variant="caption" style={{ color: adminTheme.ink }} numberOfLines={1}>
                        {cell(row, col.key)}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
              {rows.length === 0 ? (
                <View style={{ padding: 16 }}>
                  <Text variant="bodySmall" style={{ color: adminTheme.inkVariant }}>
                    등록된 광고가 없습니다.
                  </Text>
                </View>
              ) : null}
            </View>
          </ScrollView>
        </>
      )}
    </Stack>
  );
}
