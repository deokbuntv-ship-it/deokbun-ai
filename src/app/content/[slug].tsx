import { Image } from 'expo-image';
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
  canonicalForContent,
  categoryLabel,
  publicSiteService,
  type PublicContentDetail,
} from '@/features/publicSite';

type Status = 'loading' | 'ready' | 'error' | 'notfound';

function formatDate(iso: string | null): string {
  return iso ? iso.slice(0, 10) : '';
}

export default function PublicContentDetailScreen() {
  const params = useLocalSearchParams<{ slug?: string }>();
  const slug = typeof params.slug === 'string' ? params.slug : '';

  const [item, setItem] = useState<PublicContentDetail | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const tokenRef = useRef(0);

  const load = useCallback(() => {
    const token = tokenRef.current + 1;
    tokenRef.current = token;
    setStatus('loading');
    publicSiteService
      .getContent(slug)
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
          title={`${item.seoTitle ?? item.title} | 덕분AI`}
          description={item.seoDescription ?? item.summary}
          canonical={canonicalForContent(item.slug)}
          image={item.heroImageUrl}
        />
      ) : (
        <SeoHead title="콘텐츠 | 덕분AI" />
      )}

      <Stack direction="row" gap="sm" align="center">
        <Link href="/content" asChild>
          <Pressable>
            <Text variant="bodySmall" colorToken="textSecondary">
              ← 콘텐츠
            </Text>
          </Pressable>
        </Link>
      </Stack>

      {status === 'loading' ? (
        <PublicStateView state="loading" />
      ) : status === 'notfound' ? (
        <PublicStateView state="empty" message="콘텐츠를 찾을 수 없습니다." />
      ) : status === 'error' || item === null ? (
        <PublicStateView state="error" onRetry={load} />
      ) : (
        <Stack gap="xl">
          {item.heroImageUrl ? (
            <Image
              source={{ uri: item.heroImageUrl }}
              style={{ width: '100%', height: 220, borderRadius: 12 }}
              contentFit="cover"
              transition={150}
            />
          ) : null}
          <Stack gap="xs">
            {item.category ? (
              <Text variant="caption" colorToken="textSecondary">
                {categoryLabel(item.category)}
              </Text>
            ) : null}
            <Text variant="displayMedium">{item.title}</Text>
            {item.publishedAt ? (
              <Text variant="caption" colorToken="textSecondary">
                {formatDate(item.publishedAt)}
              </Text>
            ) : null}
            {item.famous ? (
              <Link
                href={{ pathname: '/famous/[slug]', params: { slug: item.famous.slug } }}
                asChild
              >
                <Pressable>
                  <Text variant="bodySmall" colorToken="textSecondary">
                    관련 인물: {item.famous.name} →
                  </Text>
                </Pressable>
              </Link>
            ) : null}
          </Stack>

          {item.summary ? (
            <Card elevation="sm">
              <Text variant="bodyMedium" colorToken="textSecondary">
                {item.summary}
              </Text>
            </Card>
          ) : null}

          {item.body ? <Markdown source={item.body} /> : null}

          {item.tags.length > 0 ? (
            <Text variant="caption" colorToken="textSecondary">
              {item.tags.map((t) => `#${t}`).join(' ')}
            </Text>
          ) : null}

          <RelatedList items={item.related} />
        </Stack>
      )}
    </PublicScreen>
  );
}
