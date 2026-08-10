import { Link, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable } from 'react-native';

import { Card } from '@/components/Card';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import {
  Markdown,
  PublicScreen,
  PublicStateView,
  RelatedList,
  SeoHead,
  canonicalForFamous,
  publicSiteService,
  type PublicFamousDetail,
} from '@/features/publicSite';

type Status = 'loading' | 'ready' | 'error' | 'notfound';

const BIRTH_SOURCE_LABEL: Record<string, string> = {
  confirmed: '확인된 정보',
  reported: '보도 기반',
  estimated: '추정',
  unknown: '출처 미상',
};

export default function PublicFamousDetailScreen() {
  const params = useLocalSearchParams<{ slug?: string }>();
  const slug = typeof params.slug === 'string' ? params.slug : '';

  const [item, setItem] = useState<PublicFamousDetail | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const tokenRef = useRef(0);

  const load = useCallback(() => {
    const token = tokenRef.current + 1;
    tokenRef.current = token;
    setStatus('loading');
    publicSiteService
      .getFamous(slug)
      .then((result) => {
        if (token !== tokenRef.current) return;
        if (result === null) {
          setStatus('notfound');
          return;
        }
        setItem(result);
        setStatus('ready');
      })
      .catch(() => {
        if (token !== tokenRef.current) return;
        setStatus('error');
      });
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <PublicScreen>
      {item ? (
        <SeoHead
          title={`${item.seoTitle ?? item.name} | 덕분AI`}
          description={item.seoDescription ?? item.shortDescription}
          canonical={item.canonicalUrl ?? canonicalForFamous(item.slug)}
          noindex={item.indexPolicy === 'noindex'}
          jsonLd={{
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: item.name,
            ...(item.occupation ? { jobTitle: item.occupation } : {}),
            ...(item.shortDescription
              ? { description: item.shortDescription }
              : {}),
            ...(item.canonicalUrl ?? canonicalForFamous(item.slug)
              ? { url: item.canonicalUrl ?? canonicalForFamous(item.slug) }
              : {}),
          }}
        />
      ) : (
        <SeoHead title="유명인 | 덕분AI" />
      )}

      <Stack direction="row" gap="sm" align="center">
        <Link href="/famous" asChild>
          <Pressable>
            <Text variant="bodySmall" colorToken="textSecondary">
              ← 유명인
            </Text>
          </Pressable>
        </Link>
      </Stack>

      {status === 'loading' ? (
        <PublicStateView state="loading" />
      ) : status === 'notfound' ? (
        <PublicStateView state="empty" message="유명인을 찾을 수 없습니다." />
      ) : status === 'error' || item === null ? (
        <PublicStateView state="error" onRetry={load} />
      ) : (
        <Stack gap="xl">
          <Stack gap="xs">
            <Text variant="displayMedium">{item.name}</Text>
            {item.occupation ? (
              <Text variant="bodyMedium" colorToken="textSecondary">
                {item.occupation}
              </Text>
            ) : null}
          </Stack>

          {item.shortDescription ? (
            <Card elevation="sm">
              <Text variant="bodyMedium" colorToken="textSecondary">
                {item.shortDescription}
              </Text>
            </Card>
          ) : null}

          {item.bio ? <Markdown source={item.bio} /> : null}

          {item.birthSource ? (
            <Text variant="caption" colorToken="textSecondary">
              정보 출처: {BIRTH_SOURCE_LABEL[item.birthSource] ?? item.birthSource}
            </Text>
          ) : null}

          <RelatedList items={item.related} />
        </Stack>
      )}
    </PublicScreen>
  );
}
