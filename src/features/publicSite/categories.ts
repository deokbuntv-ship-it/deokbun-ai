// Canonical public content categories. Extensible contract (slug + label); the
// slug is stored in content_items.category. Kept as a code catalog (not a table)
// to avoid overengineering — promote to a table only if categories need their own
// metadata/SEO. Admin content editor and public routes both read from here.
export type ContentCategory = {
  slug: string;
  label: string;
};

export const CONTENT_CATEGORIES: ContentCategory[] = [
  { slug: 'famous', label: '유명인' },
  { slug: 'saju', label: '사주/명리' },
  { slug: 'ziwei', label: '자미두수' },
  { slug: 'qimen', label: '기문둔갑' },
  { slug: 'luck', label: '운세' },
  { slug: 'guide', label: '서비스 가이드' },
];

export function categoryLabel(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return CONTENT_CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}
