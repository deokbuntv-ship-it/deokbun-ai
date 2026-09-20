import { Image } from 'expo-image';
import { Link, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Pressable } from 'react-native';

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
import { contentStaticBySlug, CONTENT_STATIC } from '@/generated/contentStatic';

type Status = 'loading' | 'ready' | 'error' | 'notfound';

// ⚠ 이것이 **주소를 존재하게 만든다** (2026-09-21).
//
// `web.output: "static"` 은 경로를 빌드 때 한 번 그린다. 이 export 가 없으면 동적 경로가
// `dist/content/[slug].html` **한 장**으로 접히고, 호스팅에는 `/content/<슬러그>` 파일이 없어
// **404** 가 된다 — 실측 2026-09-18, 사이트맵에 올려 둔 주소가 그대로 404 였다. 인물 화면은 같은 export 를
// 갖고 있어서 멀쩡했다. 목록은 `scripts/generate-static-routes.mjs` 가 공개 RPC 로 만든다(드래프트는
// 서버에서 걸러진다). 생성기가 돌지 않았으면 배열이 비어 콘텐츠 페이지 0개가 나온다 — 틀린 페이지보다 낫다.
export function generateStaticParams(): { slug: string }[] {
  return CONTENT_STATIC.map((entry) => ({ slug: entry.slug }));
}

function formatDate(iso: string | null): string {
  return iso ? iso.slice(0, 10) : '';
}

export default function PublicContentDetailScreen() {
  const params = useLocalSearchParams<{ slug?: string }>();
  const slug = typeof params.slug === 'string' ? params.slug : '';

  // 빌드 때 담아 둔 이 슬러그의 내용. 정적 렌더(효과가 돌지 않는 곳)에서도 있으므로 크롤러가 본문을 본다.
  // 브라우저에서도 첫 프레임부터 보이고, 아래 효과가 최신본으로 덮는다 — 인물 화면과 같은 방식이다.
  const staticItem = contentStaticBySlug(slug) as PublicContentDetail | null;

  const [item, setItem] = useState<PublicContentDetail | null>(staticItem);
  const [status, setStatus] = useState<Status>(staticItem ? 'ready' : 'loading');
  const tokenRef = useRef(0);

  const load = useCallback(() => {
    const token = tokenRef.current + 1;
    tokenRef.current = token;
    if (!staticItem) setStatus('loading');
    publicSiteService
      .getContent(slug)
      .then((result) => {
        if (token !== tokenRef.current) return;
        if (result === null) {
          // 빌드 뒤 비공개가 됐다 — 스냅샷보다 서버를 믿는다.
          setItem(null);
          setStatus('notfound');
          return;
        }
        setItem(result);
        setStatus('ready');
      })
      .catch(() => {
        if (token !== tokenRef.current) return;
        // ⚠ 새로 읽기에 실패했다고 **이미 그려진 페이지를 지우지 않는다** — 잠깐의 네트워크 문제로
        //   멀쩡한 페이지가 오류 화면이 되면 안 된다.
        setStatus(staticItem ? 'ready' : 'error');
      });
  }, [slug, staticItem]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <PublicScreen>
      {item ? (
        <SeoHead
          title={`${item.seoTitle ?? item.title} | 덕분이`}
          description={item.seoDescription ?? item.summary}
          canonical={canonicalForContent(item.slug)}
          image={item.heroImageUrl}
          jsonLd={{
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: item.title,
            ...(item.summary ? { description: item.summary } : {}),
            ...(item.heroImageUrl ? { image: item.heroImageUrl } : {}),
            ...(item.publishedAt ? { datePublished: item.publishedAt } : {}),
            ...(item.updatedAt ? { dateModified: item.updatedAt } : {}),
            ...(canonicalForContent(item.slug)
              ? { mainEntityOfPage: canonicalForContent(item.slug) }
              : {}),
          }}
        />
      ) : (
        <SeoHead title="콘텐츠 | 덕분이" />
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
              alt={item.heroAlt ?? item.title}
              accessibilityLabel={item.heroAlt ?? item.title}
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

          {item.videoUrl ? (
            <Pressable onPress={() => Linking.openURL(item.videoUrl as string)}>
              <Card elevation="sm">
                <Text variant="bodyMedium" colorToken="primary">
                  ▶ 영상 보기
                </Text>
              </Card>
            </Pressable>
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
