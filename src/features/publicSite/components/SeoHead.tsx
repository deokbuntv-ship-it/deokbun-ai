import Head from 'expo-router/head';

// Renders real <head> metadata for the static web export (app.json web.output =
// "static"), so list/detail pages are crawlable. No-op on native. Set `noindex`
// for pages that should not be indexed (e.g. famous with index_policy=noindex).
//
// `canonical`/`url` should be deterministic (PUBLIC_BASE_URL + route + slug) — see
// publicUrl.ts — never AI-generated. `image` (og:image) is only emitted when a
// real image exists (no fake OG images).
export function SeoHead({
  title,
  description,
  canonical,
  image,
  noindex,
}: {
  title: string;
  description?: string | null;
  canonical?: string | null;
  image?: string | null;
  noindex?: boolean;
}) {
  const desc = description ?? undefined;
  return (
    <Head>
      <title>{title}</title>
      {desc ? <meta name="description" content={desc} /> : null}
      {canonical ? <link rel="canonical" href={canonical} /> : null}
      {noindex ? <meta name="robots" content="noindex" /> : null}
      <meta property="og:title" content={title} />
      {desc ? <meta property="og:description" content={desc} /> : null}
      <meta property="og:type" content="article" />
      {canonical ? <meta property="og:url" content={canonical} /> : null}
      {image ? <meta property="og:image" content={image} /> : null}
    </Head>
  );
}
