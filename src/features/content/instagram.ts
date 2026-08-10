import type { ContentItem } from './types';

// Instagram (Meta Graph API) content helpers. Actual publishing requires a Meta
// App + Instagram Professional account + App Review + server-side OAuth token
// (OWNER/USER ACTION). These helpers only prepare/validate the caption so an
// operator can post manually today and the API path is ready later.

export const IG_CAPTION_MAX = 2200;
export const IG_HASHTAG_MAX = 30;

export function buildInstagramCaption(item: ContentItem): string {
  const tags = item.tags.slice(0, IG_HASHTAG_MAX).map((t) =>
    `#${t.replace(/\s+/g, '')}`,
  );
  return [item.title, '', item.summary ?? '', '', tags.join(' ')]
    .filter((line) => line !== null && line !== undefined)
    .join('\n')
    .trim();
}

// Returns human-readable warnings (empty = ok). Does not block manual posting.
export function validateInstagram(
  caption: string,
  hasImage: boolean,
): string[] {
  const warnings: string[] = [];
  if (!hasImage) {
    warnings.push('대표 이미지가 없습니다. 인스타그램은 이미지/영상이 필요합니다.');
  }
  if (caption.length > IG_CAPTION_MAX) {
    warnings.push(
      `캡션이 너무 깁니다 (${caption.length}/${IG_CAPTION_MAX}자).`,
    );
  }
  const hashtagCount = (caption.match(/#/g) ?? []).length;
  if (hashtagCount > IG_HASHTAG_MAX) {
    warnings.push(`해시태그가 너무 많습니다 (${hashtagCount}/${IG_HASHTAG_MAX}).`);
  }
  return warnings;
}
