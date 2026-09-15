import { Link, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable } from 'react-native';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import {
  CategoryChips,
  PublicContentCard,
  PublicScreen,
  PublicStateView,
  SeoHead,
  publicSiteService,
  type PublicContentListItem,
} from '@/features/publicSite';

type Status = 'loading' | 'ready' | 'error';
const PAGE_SIZE = 20;

export default function PublicContentListScreen() {
  const params = useLocalSearchParams<{ q?: string }>();
  const initialQuery = typeof params.q === 'string' ? params.q : '';

  const [items, setItems] = useState<PublicContentListItem[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [offset, setOffset] = useState(0);
  const [searchText, setSearchText] = useState(initialQuery);
  const [appliedSearch, setAppliedSearch] = useState(initialQuery);
  const tokenRef = useRef(0);

  const load = useCallback((nextOffset: number, search: string) => {
    const token = tokenRef.current + 1;
    tokenRef.current = token;
    setStatus('loading');
    publicSiteService
      .listContent({ search, limit: PAGE_SIZE, offset: nextOffset })
      .then((rows) => {
        if (token !== tokenRef.current) return;
        setItems(rows);
        setStatus('ready');
      })
      .catch(() => {
        if (token !== tokenRef.current) return;
        setStatus('error');
      });
  }, []);

  useEffect(() => {
    load(offset, appliedSearch);
  }, [load, offset, appliedSearch]);

  const runSearch = () => {
    setOffset(0);
    setAppliedSearch(searchText.trim());
  };

  return (
    <PublicScreen>
      <SeoHead
        title="콘텐츠 | 덕분이"
        description="덕분이의 사주·명리·운세·유명인 콘텐츠 모음"
      />
      <Stack gap="xl">
        <Stack gap="xs">
          <Text variant="displayMedium">콘텐츠</Text>
          <Text variant="bodyMedium" colorToken="textSecondary">
            사주·명리·운세·유명인 이야기
          </Text>
          <Link href="/famous" asChild>
            <Pressable>
              <Text variant="bodySmall" colorToken="textSecondary">
                유명인 보기 →
              </Text>
            </Pressable>
          </Link>
        </Stack>

        <Stack direction="row" gap="sm" align="center">
          <Input
            value={searchText}
            onChangeText={setSearchText}
            placeholder="콘텐츠 검색"
            onSubmitEditing={runSearch}
            returnKeyType="search"
            style={{ flex: 1 }}
          />
          <Button label="검색" variant="secondary" onPress={runSearch} />
        </Stack>

        <CategoryChips />

        {status === 'loading' ? (
          <PublicStateView state="loading" />
        ) : status === 'error' ? (
          <PublicStateView state="error" onRetry={() => load(offset, appliedSearch)} />
        ) : items.length === 0 ? (
          <PublicStateView
            state="empty"
            message={
              appliedSearch
                ? `"${appliedSearch}" 검색 결과가 없습니다.`
                : '아직 발행된 콘텐츠가 없습니다.'
            }
          />
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
