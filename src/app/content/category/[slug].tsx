import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable } from 'react-native';

import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import {
  CategoryChips,
  PublicContentCard,
  PublicScreen,
  PublicStateView,
  SeoHead,
  categoryLabel,
  publicSiteService,
  type PublicContentListItem,
} from '@/features/publicSite';

type Status = 'loading' | 'ready' | 'error';
const PAGE_SIZE = 20;

export default function PublicContentCategoryScreen() {
  const params = useLocalSearchParams<{ slug?: string }>();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const label = categoryLabel(slug) ?? slug;

  const [items, setItems] = useState<PublicContentListItem[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [offset, setOffset] = useState(0);
  const tokenRef = useRef(0);

  const load = useCallback(
    (nextOffset: number) => {
      const token = tokenRef.current + 1;
      tokenRef.current = token;
      setStatus('loading');
      publicSiteService
        .listContent({ category: slug, limit: PAGE_SIZE, offset: nextOffset })
        .then((rows) => {
          if (token !== tokenRef.current) return;
          setItems(rows);
          setStatus('ready');
        })
        .catch(() => {
          if (token !== tokenRef.current) return;
          setStatus('error');
        });
    },
    [slug],
  );

  useEffect(() => {
    setOffset(0);
  }, [slug]);

  useEffect(() => {
    load(offset);
  }, [load, offset]);

  return (
    <PublicScreen>
      <SeoHead
        title={`${label} 콘텐츠 | 덕분AI`}
        description={`덕분AI ${label} 카테고리 콘텐츠`}
      />
      <Stack gap="xl">
        <Stack gap="xs">
          <Text variant="displayMedium">{label}</Text>
          <Text variant="bodyMedium" colorToken="textSecondary">
            {label} 콘텐츠
          </Text>
        </Stack>

        <CategoryChips activeSlug={slug} />

        {status === 'loading' ? (
          <PublicStateView state="loading" />
        ) : status === 'error' ? (
          <PublicStateView state="error" onRetry={() => load(offset)} />
        ) : items.length === 0 ? (
          <PublicStateView state="empty" message="이 카테고리에 발행된 콘텐츠가 없습니다." />
        ) : (
          <Stack gap="md">
            {items.map((item) => (
              <PublicContentCard key={item.slug} item={item} />
            ))}
            <Stack direction="row" gap="sm" align="center">
              {offset > 0 ? (
                <Pressable onPress={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}>
                  <Text variant="bodySmall" colorToken="textSecondary">
                    ← 이전
                  </Text>
                </Pressable>
              ) : null}
              {items.length === PAGE_SIZE ? (
                <Pressable onPress={() => setOffset((o) => o + PAGE_SIZE)}>
                  <Text variant="bodySmall" colorToken="textSecondary">
                    다음 →
                  </Text>
                </Pressable>
              ) : null}
            </Stack>
          </Stack>
        )}
      </Stack>
    </PublicScreen>
  );
}
