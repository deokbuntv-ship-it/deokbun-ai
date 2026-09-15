import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/Text';
import { adminMono, adminTheme } from '@/features/admin/adminTheme';
import { getSupabaseClient } from '@/services/supabase';

// 유명인 중복 경고 (2026-09-04).
//
// WARNS, NEVER BLOCKS. 동명이인 are real people and both may belong in the catalogue; a hard
// block would push the operator to mangle a name to get past it, which is worse than a
// duplicate. The server returns candidates with a confidence, this shows them, and the human
// decides. See supabase/migrations/20260905000200 for the matching rule.
type Candidate = {
  id: string;
  slug: string;
  name: string;
  occupation: string | null;
  status: string;
  birth_year: string | null;
  birth_month: string | null;
  birth_day: string | null;
  confidence: 'SAME_PERSON_LIKELY' | 'SAME_NAME_DIFFERENT_BIRTH' | 'SAME_NAME_BIRTH_UNKNOWN';
};

const HEADLINE: Record<Candidate['confidence'], string> = {
  SAME_PERSON_LIKELY: '같은 인물이 이미 등록돼 있을 수 있습니다',
  SAME_NAME_DIFFERENT_BIRTH: '이름이 같은 다른 인물이 있습니다 (동명이인일 수 있음)',
  SAME_NAME_BIRTH_UNKNOWN: '이름이 같은 인물이 있습니다 (생년월일이 없어 확인 불가)',
};

export function FamousDuplicateWarning({
  name,
  birthYear,
  birthMonth,
  birthDay,
  excludeId,
}: {
  name: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  excludeId?: string | null;
}) {
  const [rows, setRows] = useState<Candidate[]>([]);

  useEffect(() => {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      setRows([]);
      return;
    }
    let active = true;
    // Debounced: this fires while the operator types a name.
    const timer = setTimeout(() => {
      void (async () => {
        try {
          const supabase = getSupabaseClient();
          const { data, error } = await supabase.rpc('famous_duplicate_candidates', {
            p_name: trimmed,
            p_birth_info: birthYear ? { birthYear, birthMonth, birthDay } : null,
            p_exclude_id: excludeId ?? null,
          });
          if (!active) return;
          setRows(error || !data ? [] : (data as Candidate[]));
        } catch {
          // A failed duplicate check must never block a save — it is advisory.
          if (active) setRows([]);
        }
      })();
    }, 400);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [name, birthYear, birthMonth, birthDay, excludeId]);

  if (rows.length === 0) return null;
  const worst = rows.some((r) => r.confidence === 'SAME_PERSON_LIKELY')
    ? 'SAME_PERSON_LIKELY'
    : rows[0].confidence;
  const strong = worst === 'SAME_PERSON_LIKELY';

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: strong ? adminTheme.warning : adminTheme.border,
        backgroundColor: adminTheme.pageBg,
        borderRadius: 6,
        padding: 12,
        gap: 6,
      }}
    >
      <Text
        variant="bodySmall"
        style={{ color: strong ? adminTheme.warning : adminTheme.inkVariant, fontWeight: '700' }}
      >
        {HEADLINE[worst]}
      </Text>
      {rows.map((r) => (
        <Text key={r.id} variant="caption" style={{ color: adminTheme.inkMuted, fontFamily: adminMono }} selectable>
          {r.name}
          {r.occupation ? ` · ${r.occupation}` : ''} · {r.slug} · {r.status}
          {r.birth_year ? ` · ${r.birth_year}-${r.birth_month ?? '?'}-${r.birth_day ?? '?'}` : ' · 생년월일 없음'}
        </Text>
      ))}
      <Text variant="caption" style={{ color: adminTheme.inkMuted }}>
        확인 후 그대로 등록하셔도 됩니다. 같은 인물이라면 기존 항목을 수정하는 편이 낫습니다.
      </Text>
    </View>
  );
}
