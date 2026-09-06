import { Link, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable } from 'react-native';

import { Card } from '@/components/Card';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import {
  FAMOUS_NATURE_NOTICE,
  FAMOUS_NATURE_NOTICE_FOOTER,
  famousBirthNotice,
} from '@/features/famous/famousDisclosure';
import {
  FamousChartTable,
  Markdown,
  PublicScreen,
  PublicStateView,
  RelatedList,
  SeoHead,
  canonicalForFamous,
  publicSiteService,
  type PublicFamousDetail,
} from '@/features/publicSite';
import { famousStaticBySlug, FAMOUS_STATIC } from '@/generated/famousStatic';

type Status = 'loading' | 'ready' | 'error' | 'notfound';

// ⚠ THIS IS WHAT MAKES THE PAGE INDEXABLE.
//
// `web.output: "static"` renders each route ONCE at build time. Without this export the whole
// dynamic route collapses to a single `dist/famous/[slug].html` shell — measured 2026-09-06 as
// 91 characters of chrome plus "불러오는 중…", with no description, canonical or JSON-LD. The
// installed CLI expands the route per returned param set
// (`@expo/router-server/build/loadStaticParamsAsync.js`), so this yields one real HTML file per
// published person.
//
// The list comes from `src/generated/famousStatic.ts`, written before the export by
// `scripts/generate-static-routes.mjs` from the PUBLIC RPCs (drafts cannot leak — the RPC filters
// them server-side). When the generator has not run the array is empty and zero famous pages are
// emitted, which is the correct degrade: no page beats a wrong page.
export function generateStaticParams(): { slug: string }[] {
  return FAMOUS_STATIC.map((entry) => ({ slug: entry.slug }));
}

// 출처 라벨은 `famousDisclosure` 가 소유한다 — 고지 문구와 같은 자리에 있어야 어긋나지 않는다.

export default function PublicFamousDetailScreen() {
  const params = useLocalSearchParams<{ slug?: string }>();
  const slug = typeof params.slug === 'string' ? params.slug : '';

  // Build-time data for THIS slug. Present during static rendering (where effects never run), so
  // the crawler receives a complete page; present on first paint in the browser too, so the reader
  // sees content immediately instead of a spinner.
  //
  // ⚠ It is a SNAPSHOT of the last build. The effect below still refetches and overwrites it, so a
  // profile edited after the build shows the stale copy for one frame and then updates — the same
  // shape as before, minus the empty state. Static-only (no refetch) would serve stale text
  // silently; fetch-only is what made the page invisible to crawlers. Both halves are needed.
  const staticItem = famousStaticBySlug(slug) as PublicFamousDetail | null;

  const [item, setItem] = useState<PublicFamousDetail | null>(staticItem);
  const [status, setStatus] = useState<Status>(staticItem ? 'ready' : 'loading');
  const tokenRef = useRef(0);

  const load = useCallback(() => {
    const token = tokenRef.current + 1;
    tokenRef.current = token;
    if (!staticItem) setStatus('loading');
    publicSiteService
      .getFamous(slug)
      .then((result) => {
        if (token !== tokenRef.current) return;
        if (result === null) {
          // Unpublished since the build. Trust the server over the snapshot.
          setItem(null);
          setStatus('notfound');
          return;
        }
        setItem(result);
        setStatus('ready');
      })
      .catch(() => {
        if (token !== tokenRef.current) return;
        // ⚠ A refresh failure must NOT blank a page that already rendered from the build snapshot —
        // that would turn a working page into an error for a transient network blip.
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
          title={`${item.seoTitle ?? item.name} | 덕분이`}
          description={item.seoDescription ?? item.shortDescription}
          canonical={item.canonicalUrl ?? canonicalForFamous(item.slug)}
          noindex={item.indexPolicy === 'noindex'}
          // ⚠ Article, not Person (changed 2026-09-08 with the (b) framing decision).
          //
          // `Person` declares "this document IS a record about a human being" — search engines read
          // `name`/`jobTitle` as assertions about that person, and entity panels can pick them up.
          // Under (b) 명식 해설형 the page is an explainer about a CHART ("이런 명식은 ~한 특징이
          // 있다"), which is an article that happens to use a birth chart as its example. Declaring
          // Person would claim more than the page says — the same fabrication risk the suggestion
          // prompt already guards against in prose.
          //
          // Only verified fields. No rating/review/author — we do not have them.
          jsonLd={{
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: item.seoTitle ?? item.name,
            ...(item.shortDescription
              ? { description: item.shortDescription }
              : {}),
            ...(item.publishedAt ? { datePublished: item.publishedAt } : {}),
            ...(item.canonicalUrl ?? canonicalForFamous(item.slug)
              ? { mainEntityOfPage: item.canonicalUrl ?? canonicalForFamous(item.slug) }
              : {}),
          }}
        />
      ) : (
        <SeoHead title="유명인 | 덕분이" />
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

          {/* ⚠ 고지는 본문 **위**에 한 번. 읽기 전에 무엇을 읽는지 알아야 한다.
              세 가지가 들어간다 — 출생시각 유무와 그 한계 · 출생정보 출처 · 이 글의 성격. */}
          <Card use="status" radius="xl">
            <Stack gap="xs">
              <Text variant="bodySmall" colorToken="textSecondary">
                {famousBirthNotice({
                  hourKnown: item.chart?.hourKnown ?? false,
                  birthSource: item.birthSource,
                })}
              </Text>
              {item.birthSourceNote ? (
                <Text variant="caption" colorToken="textSecondary">{item.birthSourceNote}</Text>
              ) : null}
              <Text variant="bodySmall" colorToken="textSecondary">{FAMOUS_NATURE_NOTICE}</Text>
            </Stack>
          </Card>

          {/* 명식 표 — 글이 설명하는 대상을 눈으로 볼 수 있어야 교재가 된다. */}
          {item.chart ? <FamousChartTable chart={item.chart} /> : null}

          {item.bio ? <Markdown source={item.bio} /> : null}

          {/* ⚠ 그리고 본문 **아래**에 한 번 더. 긴 글에서 상단 고지는 스크롤과 함께 사라진다.
              같은 문장을 반복하지 않는다 — 다 읽은 사람에게 하는 말은 달라야 한다. */}
          <Card use="status" radius="xl">
            <Text variant="bodySmall" colorToken="textSecondary">{FAMOUS_NATURE_NOTICE_FOOTER}</Text>
          </Card>

          <RelatedList items={item.related} />
        </Stack>
      )}
    </PublicScreen>
  );
}
